const { onCall, HttpsError, onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");
const crypto = require("crypto");
const cors = require("cors")({ origin: true });
const { sanitizeInput } = require("./utils/sanitizer");
const { validateAuthorization } = require("./utils/auth");
const { subscriptionPlans, aiHelpdeskCapabilities, getAiHelpdeskTier } = require("./utils/subscription");

// Initialize Firebase Admin SDK
admin.initializeApp();
const db = admin.firestore();

// Configure Cloud Functions for data retention
const dataRetentionPeriodDays = 30;
const batchSize = 100; // Firestore can process up to 500 operations in a single batch

/**
 * Helper function to clean up old records from a collection
 * @param {string} collectionName - The name of the collection to clean up
 * @param {string} timestampField - The field that contains the timestamp
 * @param {Timestamp} cutoffTimestamp - Records older than this will be deleted
 */
async function cleanupCollection(collectionName, timestampField, cutoffTimestamp) {
  try {
    // Query for old records
    const snapshot = await db.collection(collectionName)
      .where(timestampField, '<', cutoffTimestamp)
      .limit(batchSize)
      .get();
    
    if (snapshot.empty) {
      logger.info(`No old records found in ${collectionName}`);
      return 0;
    }
    
    // Delete records in batches
    const batch = db.batch();
    let count = 0;
    
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
      count++;
    });
    
    await batch.commit();
    logger.info(`Deleted ${count} old records from ${collectionName}`);
    
    // If we hit the batch limit, there might be more records to delete
    if (count >= batchSize) {
      // Wait a moment to avoid overloading Firestore
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Recursively clean up more records
      const moreDeleted = await cleanupCollection(collectionName, timestampField, cutoffTimestamp);
      return count + moreDeleted;
    }
    
    return count;
  } catch (error) {
    logger.error(`Error cleaning up ${collectionName}`, error);
    throw error;
  }
}

/**
 * Helper function to clean up old activities from user subcollections
 * @param {Timestamp} cutoffTimestamp - Records older than this will be deleted
 */
async function cleanupUserActivities(cutoffTimestamp) {
  try {
    // First get all users
    const usersSnapshot = await db.collection('users').get();
    let totalDeleted = 0;
    
    // Process each user
    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      
      // Clean up user's activities subcollection
      const activitiesSnapshot = await db.collection('users').doc(userId)
        .collection('activities')
        .where('timestamp', '<', cutoffTimestamp)
        .limit(batchSize)
        .get();
      
      if (!activitiesSnapshot.empty) {
        const batch = db.batch();
        let count = 0;
        
        activitiesSnapshot.docs.forEach(doc => {
          batch.delete(doc.ref);
          count++;
        });
        
        await batch.commit();
        totalDeleted += count;
        
        logger.info(`Deleted ${count} old activities for user ${userId}`);
        
        // If we hit the batch limit, there might be more to delete for this user
        if (count >= batchSize) {
          // Wait a moment to avoid overloading Firestore
          await new Promise(resolve => setTimeout(resolve, 500));
          // Process more for this user
          await cleanupUserActivities(cutoffTimestamp);
          break; // Break to avoid nested loop issues
        }
      }
    }
    
    return totalDeleted;
  } catch (error) {
    logger.error('Error cleaning up user activities', error);
    throw error;
  }
}

/**
 * Helper function to summarize user activity before deletion
 * This creates a monthly summary before deleting the detailed activity records
 * @param {string} userId - The user ID
 * @param {Timestamp} cutoffTimestamp - Records older than this will be summarized and deleted
 */
async function summarizeAndDeleteUserActivity(userId, cutoffTimestamp) {
  try {
    const activitiesRef = db.collection('users').doc(userId).collection('activities');
    
    // Group activities by type for the period to summarize
    const snapshot = await activitiesRef
      .where('timestamp', '<', cutoffTimestamp)
      .get();
    
    if (snapshot.empty) return 0;
    
    // Create summary data by activity type
    const summary = {};
    const activityIds = [];
    
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      const type = data.type || 'unknown';
      
      if (!summary[type]) {
        summary[type] = {
          count: 0,
          firstTimestamp: data.timestamp,
          lastTimestamp: data.timestamp
        };
      }
      
      summary[type].count += 1;
      
      // Track earliest and latest timestamps
      if (data.timestamp < summary[type].firstTimestamp) {
        summary[type].firstTimestamp = data.timestamp;
      }
      if (data.timestamp > summary[type].lastTimestamp) {
        summary[type].lastTimestamp = data.timestamp;
      }
      
      activityIds.push(doc.id);
    });
    
    // Create a monthly summary document
    const monthYear = cutoffTimestamp.toDate().toISOString().substring(0, 7); // YYYY-MM format
    
    await db.collection('users').doc(userId).collection('activitySummaries').doc(monthYear).set({
      period: monthYear,
      activityCounts: summary,
      totalActivities: activityIds.length,
      summarizedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    
    // Delete the individual activity records in batches
    for (let i = 0; i < activityIds.length; i += batchSize) {
      const batch = db.batch();
      const chunk = activityIds.slice(i, i + batchSize);
      
      chunk.forEach(id => {
        batch.delete(activitiesRef.doc(id));
      });
      
      await batch.commit();
    }
    
    logger.info(`Summarized and deleted ${activityIds.length} activities for user ${userId}`);
    return activityIds.length;
  } catch (error) {
    logger.error(`Error summarizing activities for user ${userId}`, error);
    throw error;
  }
}

// Admin-triggered manual cleanup function
exports.manualCleanup = onCall({
  cors: true,
  maxInstances: 5
}, async (request) => {
  try {
    // Verify the user is an admin
    const uid = request.auth.uid;
    if (!uid) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }
    
    const isAuthorized = await validateAuthorization(uid, ['admin']);
    if (!isAuthorized) {
      throw new HttpsError('permission-denied', 'User does not have admin permissions');
    }
    
    // Get parameters
    const { 
      collectionNames = [], 
      specificUserId = null,
      customRetentionDays = dataRetentionPeriodDays
    } = request.data || {};
    
    // Calculate cutoff date
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - customRetentionDays);
    const cutoffTimestamp = admin.firestore.Timestamp.fromDate(cutoffDate);
    
    logger.info(`Starting manual cleanup for records older than ${customRetentionDays} days`);
    
    const results = {
      deletedRecords: {}
    };
    
    // Clean up specific collections if requested
    if (collectionNames.length > 0) {
      for (const collection of collectionNames) {
        const deleted = await cleanupCollection(collection, 'timestamp', cutoffTimestamp);
        results.deletedRecords[collection] = deleted;
      }
    }
    
    // Clean up specific user if requested
    if (specificUserId) {
      const deleted = await summarizeAndDeleteUserActivity(specificUserId, cutoffTimestamp);
      results.deletedRecords.userActivities = deleted;
    }
    
    logger.info('Manual cleanup completed successfully', results);
    return results;
    
  } catch (error) {
    logger.error('Error during manual cleanup', error);
    throw new HttpsError('internal', 'Failed to perform manual cleanup', error);
  }
});

// Schedule data cleanup function to run daily
exports.cleanupOldRecords = functions.pubsub.schedule('every 24 hours').onRun(async (context) => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - dataRetentionPeriodDays);
  const cutoffTimestamp = admin.firestore.Timestamp.fromDate(cutoffDate);
  
  try {
    logger.info(`Starting data retention cleanup for records older than ${dataRetentionPeriodDays} days`);
    
    // Cleanup main collections
    const deletedActivities = await cleanupCollection('activities', 'timestamp', cutoffTimestamp);
    const deletedContributions = await cleanupCollection('contributions', 'timestamp', cutoffTimestamp);
    const deletedAiMessages = await cleanupCollection('aiMessages', 'timestamp', cutoffTimestamp);
    
    // Cleanup user activities (but create summaries first)
    const usersSnapshot = await db.collection('users').get();
    let deletedUserActivities = 0;
    
    for (const userDoc of usersSnapshot.docs) {
      const deleted = await summarizeAndDeleteUserActivity(userDoc.id, cutoffTimestamp);
      deletedUserActivities += deleted;
    }
    
    logger.info(`Data retention cleanup completed successfully. Stats: 
      - Deleted activities: ${deletedActivities}
      - Deleted contributions: ${deletedContributions}
      - Deleted AI messages: ${deletedAiMessages}
      - User activities summarized and deleted: ${deletedUserActivities}`);
    
    return null;
  } catch (error) {
    logger.error('Error during data retention cleanup', error);
    return null;
  }
});

// Generate a new API key for third-party inventory integrations
exports.generateApiKey = onCall({ 
  cors: true,
  maxInstances: 10
}, async (request) => {
  try {
    // Validate authentication
    const uid = request.auth.uid;
    if (!uid) {
      throw new HttpsError('unauthenticated', 'User must be authenticated to generate API key');
    }
    
    // Check user's authorization level (admin only)
    const isAuthorized = await validateAuthorization(uid, ['admin']);
    if (!isAuthorized) {
      throw new HttpsError('permission-denied', 'User does not have admin permissions');
    }
    
    // Generate a secure API key
    const apiKey = crypto.randomBytes(32).toString('hex');
    
    // Store the API key with the user's record
    await db.collection('users').doc(uid).collection('credentials').doc('apiKey').set({
      key: apiKey,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      lastUsed: null
    });
    
    logger.info('API key generated for user', { uid });
    return { success: true, apiKey };
  } catch (error) {
    logger.error('Error generating API key', error);
    throw new HttpsError('internal', 'Failed to generate API key', error);
  }
});

// Sanitize and validate project data
exports.validateProject = onCall({ 
  cors: true,
  maxInstances: 10
}, async (request) => {
  try {
    // Authenticate the user
    const uid = request.auth.uid;
    if (!uid) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }
    
    // Get and sanitize the project data
    const projectData = request.data;
    if (!projectData) {
      throw new HttpsError('invalid-argument', 'Project data is required');
    }
    
    // Sanitize all inputs to prevent XSS and injection attacks
    const sanitizedData = sanitizeInput(projectData);
    
    // Validate VIN if provided
    if (sanitizedData.vin) {
      const isValidVin = /^[A-HJ-NPR-Z0-9]{17}$/i.test(sanitizedData.vin);
      if (!isValidVin) {
        throw new HttpsError('invalid-argument', 'Invalid VIN format');
      }
    }
    
    // Additional validation for required fields
    if (!sanitizedData.projectName || sanitizedData.projectName.trim() === '') {
      throw new HttpsError('invalid-argument', 'Project name is required');
    }
    
    // Ensure dates are valid
    if (sanitizedData.startDate) {
      const startDate = new Date(sanitizedData.startDate);
      if (isNaN(startDate.getTime())) {
        throw new HttpsError('invalid-argument', 'Invalid start date');
      }
    }
    
    if (sanitizedData.endDate) {
      const endDate = new Date(sanitizedData.endDate);
      if (isNaN(endDate.getTime())) {
        throw new HttpsError('invalid-argument', 'Invalid end date');
      }
      
      // Ensure end date is not before start date
      if (sanitizedData.startDate) {
        const startDate = new Date(sanitizedData.startDate);
        if (endDate < startDate) {
          throw new HttpsError('invalid-argument', 'End date cannot be before start date');
        }
      }
    }
    
    return { valid: true, sanitizedData };
  } catch (error) {
    logger.error('Error validating project data', error);
    throw new HttpsError('internal', error.message, error);
  }
});

// CORS-enabled HTTP endpoint for subscription checks
exports.checkSubscriptionHttp = onRequest({ 
  cors: ['http://localhost:5173', 'http://localhost:5174', 'https://motocraft-twoheads.web.app', 'https://motocraft-twoheads.firebaseapp.com']
}, (req, res) => {
  cors(req, res, async () => {
    try {
      // Verify Firebase Auth token
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(403).send({ error: 'Unauthorized' });
        return;
      }
      
      const idToken = authHeader.split('Bearer ')[1];
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const uid = decodedToken.uid;
      
      // Get the user document
      const userDoc = await db.collection('users').doc(uid).get();
      if (!userDoc.exists) {
        res.status(404).send({ error: 'User profile not found' });
        return;
      }
      
      const userData = userDoc.data();
      const subscriptionType = userData.subscriptionType || 'free';
      
      // Get feature access based on subscription type
      const features = subscriptionPlans[subscriptionType] || subscriptionPlans.free;
      
      // Check subscription expiration if applicable
      let isActive = true;
      let daysRemaining = null;
      
      if (userData.subscriptionEndDate) {
        const endDate = userData.subscriptionEndDate.toDate();
        const now = new Date();
        
        isActive = endDate > now;
        if (isActive) {
          const timeDiff = endDate.getTime() - now.getTime();
          daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));
        }
      }
      
      res.status(200).send({
        subscriptionType,
        isActive,
        daysRemaining,
        features
      });
    } catch (error) {
      logger.error('Error checking subscription', error);
      res.status(500).send({ error: 'Failed to check subscription status' });
    }
  });
});

// Check user subscription status and features
exports.checkSubscription = onCall({ 
  cors: ['http://localhost:5173', 'http://localhost:5174', 'https://motocraft-twoheads.web.app', 'https://motocraft-twoheads.firebaseapp.com'],
  maxInstances: 20
}, async (request) => {
  try {
    const uid = request.auth.uid;
    if (!uid) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }
    
    // Get the user document
    const userDoc = await db.collection('users').doc(uid).get();
    if (!userDoc.exists) {
      throw new HttpsError('not-found', 'User profile not found');
    }
    
    const userData = userDoc.data();
    const subscriptionType = userData.subscriptionType || 'free';
    
    // Get feature access based on subscription type
    const features = subscriptionPlans[subscriptionType] || subscriptionPlans.free;
    
    // Check subscription expiration if applicable
    let isActive = true;
    let daysRemaining = null;
    
    if (userData.subscriptionEndDate) {
      const endDate = userData.subscriptionEndDate.toDate();
      const now = new Date();
      
      isActive = endDate > now;
      if (isActive) {
        const timeDiff = endDate.getTime() - now.getTime();
        daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));
      }
    }
    
    return {
      subscriptionType,
      isActive,
      daysRemaining,
      features
    };
  } catch (error) {
    logger.error('Error checking subscription', error);
    throw new HttpsError('internal', 'Failed to check subscription status', error);
  }
});

// CORS-enabled HTTP endpoint for inventory checking
exports.checkInventoryAvailabilityHttp = onRequest({ cors: true }, (req, res) => {
  cors(req, res, async () => {
    try {
      // Only allow POST requests
      if (req.method !== 'POST') {
        res.status(405).send({ error: 'Method not allowed' });
        return;
      }
      
      // Verify Firebase Auth token
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(403).send({ error: 'Unauthorized' });
        return;
      }
      
      const idToken = authHeader.split('Bearer ')[1];
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const uid = decodedToken.uid;
      
      // Get request data
      const { partNumber, provider } = req.body;
      if (!partNumber || !provider) {
        res.status(400).send({ error: 'Part number and provider are required' });
        return;
      }
      
      // Sanitize inputs
      const sanitizedPartNumber = sanitizeInput(partNumber);
      const sanitizedProvider = sanitizeInput(provider);
      
      // Check user's subscription for inventory access
      const userDoc = await db.collection('users').doc(uid).get();
      const userData = userDoc.data();
      
      // Mock inventory check - in a real app, this would call an external API
      const mockInventoryData = {
        available: Math.random() > 0.3, 
        price: Math.floor(Math.random() * 500) + 50,
        estimatedDelivery: '3-5 business days',
        alternativeParts: [
          { partNumber: `${sanitizedPartNumber}-ALT1`, price: Math.floor(Math.random() * 450) + 40 },
          { partNumber: `${sanitizedPartNumber}-ALT2`, price: Math.floor(Math.random() * 600) + 60 }
        ]
      };
      
      // Log the inventory check
      await db.collection('users').doc(uid).collection('activities').add({
        type: 'inventory_check',
        partNumber: sanitizedPartNumber,
        provider: sanitizedProvider,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });
      
      res.status(200).send(mockInventoryData);
    } catch (error) {
      logger.error('Error checking inventory', error);
      res.status(500).send({ error: 'Failed to check inventory availability' });
    }
  });
});

// Connect to third-party inventory API
exports.checkInventoryAvailability = onCall({ 
  cors: true,
  maxInstances: 10
}, async (request) => {
  try {
    const uid = request.auth.uid;
    if (!uid) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }
    
    const { partNumber, provider } = request.data;
    if (!partNumber || !provider) {
      throw new HttpsError('invalid-argument', 'Part number and provider are required');
    }
    
    // Sanitize inputs
    const sanitizedPartNumber = sanitizeInput(partNumber);
    const sanitizedProvider = sanitizeInput(provider);
    
    // Check user's subscription for inventory access
    const userDoc = await db.collection('users').doc(uid).get();
    const userData = userDoc.data();
    const subscriptionType = userData.subscriptionType || 'free';
    
    // Mock inventory check - in a real app, this would call an external API
    // This is a placeholder for demonstration purposes
    const mockInventoryData = {
      available: Math.random() > 0.3, // Randomly determine availability
      price: Math.floor(Math.random() * 500) + 50, // Random price between 50 and 550
      estimatedDelivery: '3-5 business days',
      alternativeParts: [
        { partNumber: `${sanitizedPartNumber}-ALT1`, price: Math.floor(Math.random() * 450) + 40 },
        { partNumber: `${sanitizedPartNumber}-ALT2`, price: Math.floor(Math.random() * 600) + 60 }
      ]
    };
    
    // Log the inventory check
    await db.collection('users').doc(uid).collection('activities').add({
      type: 'inventory_check',
      partNumber: sanitizedPartNumber,
      provider: sanitizedProvider,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    
    return mockInventoryData;
  } catch (error) {
    logger.error('Error checking inventory', error);
    throw new HttpsError('internal', 'Failed to check inventory availability', error);
  }
});

// Webhook for receiving inventory updates
exports.inventoryWebhook = onCall({ 
  cors: true,
  maxInstances: 5
}, async (request) => {
  try {
    // Authenticate using API key instead of user auth
    const { apiKey, updates } = request.data;
    if (!apiKey || !updates || !Array.isArray(updates)) {
      throw new HttpsError('invalid-argument', 'Valid API key and updates array are required');
    }
    
    // Find the user with this API key
    const apiKeySnapshot = await db.collectionGroup('credentials')
      .where('key', '==', apiKey)
      .limit(1)
      .get();
    
    if (apiKeySnapshot.empty) {
      throw new HttpsError('permission-denied', 'Invalid API key');
    }
    
    // Update the lastUsed timestamp
    const apiKeyDoc = apiKeySnapshot.docs[0];
    await apiKeyDoc.ref.update({
      lastUsed: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Get the parent user ID
    const userPath = apiKeyDoc.ref.path.split('/credentials')[0];
    const userId = userPath.split('/').pop();
    
    // Process each inventory update
    const processed = [];
    for (const update of updates) {
      // Sanitize the update data
      const sanitizedUpdate = sanitizeInput(update);
      
      // Store in the inventory collection
      await db.collection('inventory').add({
        ...sanitizedUpdate,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedBy: userId
      });
      
      processed.push({
        partNumber: sanitizedUpdate.partNumber,
        success: true
      });
    }
    
    return { 
      processed, 
      success: true,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    logger.error('Error processing inventory webhook', error);
    throw new HttpsError('internal', 'Failed to process inventory updates', error);
  }
});

// Add reward points for user contributions
exports.addContributionPoints = onCall({ 
  cors: true,
  maxInstances: 20
}, async (request) => {
  try {
    const { contributorId, contributionType, targetId } = request.data;
    if (!contributorId || !contributionType || !targetId) {
      throw new HttpsError('invalid-argument', 'Missing required fields');
    }
    
    // Sanitize inputs
    const sanitizedContributorId = sanitizeInput(contributorId);
    const sanitizedContributionType = sanitizeInput(contributionType);
    const sanitizedTargetId = sanitizeInput(targetId);
    
    // Validate contribution type
    const validTypes = ['project_create', 'project_validate', 'task_create', 'task_validate', 'part_create', 'part_validate', 'cost_create', 'cost_validate'];
    if (!validTypes.includes(sanitizedContributionType)) {
      throw new HttpsError('invalid-argument', 'Invalid contribution type');
    }
    
    // Get point values for different contribution types
    const pointValues = {
      'project_create': 10,
      'project_validate': 5,
      'task_create': 5,
      'task_validate': 2,
      'part_create': 5,
      'part_validate': 2,
      'cost_create': 3,
      'cost_validate': 1
    };
    
    const pointsToAdd = pointValues[sanitizedContributionType] || 1;
    
    // Add points to user and create contribution record
    const userRef = db.collection('users').doc(sanitizedContributorId);
    
    // Run transaction to update points atomically
    await db.runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userRef);
      if (!userDoc.exists) {
        throw new HttpsError('not-found', 'User not found');
      }
      
      const userData = userDoc.data();
      const currentPoints = userData.points || 0;
      const newPoints = currentPoints + pointsToAdd;
      
      // Update user points
      transaction.update(userRef, { points: newPoints });
      
      // Create contribution record
      transaction.set(db.collection('contributions').doc(), {
        contributorId: sanitizedContributorId,
        contributionType: sanitizedContributionType,
        targetId: sanitizedTargetId,
        pointsEarned: pointsToAdd,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });
    });
    
    // Check for badge achievements
    await checkForBadgeAchievements(sanitizedContributorId);
    
    return { success: true, pointsAdded: pointsToAdd };
  } catch (error) {
    logger.error('Error adding contribution points', error);
    throw new HttpsError('internal', 'Failed to add contribution points', error);
  }
});

// AI Helpdesk message endpoint
exports.aiHelpdeskMessage = onCall({
  cors: true,
  maxInstances: 20
}, async (request) => {
  try {
    const uid = request.auth.uid;
    if (!uid) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }
    
    const { message, conversationId } = request.data;
    if (!message) {
      throw new HttpsError('invalid-argument', 'Message content is required');
    }
    
    // Sanitize input
    const sanitizedMessage = sanitizeInput(message);
    
    // Get user subscription details
    const userDoc = await db.collection('users').doc(uid).get();
    if (!userDoc.exists) {
      throw new HttpsError('not-found', 'User profile not found');
    }
    
    const userData = userDoc.data();
    const subscriptionType = userData.subscriptionType || 'free';
    
    // Check if user can access AI helpdesk
    if (subscriptionType === 'free') {
      throw new HttpsError('permission-denied', 'AI Helpdesk requires a paid subscription');
    }
    
    // Get AI helpdesk capabilities based on subscription
    const helpdeskTier = getAiHelpdeskTier(subscriptionType);
    
    // Check if user has reached monthly message limit
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const messageCountQuery = await db.collection('users').doc(uid)
      .collection('aiMessages')
      .where('timestamp', '>=', monthStart)
      .count()
      .get();
    
    const currentMonthCount = messageCountQuery.data().count;
    const messageLimit = subscriptionPlans[subscriptionType].aiHelpdeskMessagesPerMonth;
    
    // Check if user has reached their limit (professional tier has unlimited)
    if (subscriptionType !== 'professional' && currentMonthCount >= messageLimit) {
      throw new HttpsError('resource-exhausted', 'Monthly AI Helpdesk message limit reached');
    }
    
    // Create or get conversation
    let conversationRef;
    if (conversationId) {
      conversationRef = db.collection('aiConversations').doc(conversationId);
      const conversationDoc = await conversationRef.get();
      if (!conversationDoc.exists || conversationDoc.data().userId !== uid) {
        throw new HttpsError('not-found', 'Conversation not found or access denied');
      }
    } else {
      // Create new conversation
      conversationRef = db.collection('aiConversations').doc();
      await conversationRef.set({
        userId: uid,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        title: sanitizedMessage.substring(0, 50) + (sanitizedMessage.length > 50 ? '...' : '')
      });
    }
    
    // Store user message
    const messageRef = await db.collection('users').doc(uid)
      .collection('aiMessages').add({
        conversationId: conversationRef.id,
        content: sanitizedMessage,
        type: 'user',
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });
    
    // Update conversation's last activity time
    await conversationRef.update({
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Simulate AI response (placeholder for actual AI integration)
    const aiResponses = {
      basic: [
        "I can help with basic motorcycle maintenance questions. What specific issue are you facing?",
        "For common problems, have you checked the basic maintenance checklist in the manual?",
        "I'm looking through the standard repair procedures. This appears to be a common issue with that model.",
        "Based on the symptoms you described, this could be related to the fuel system."
      ],
      premium: [
        "I've analyzed your manual and found specific instructions for this repair on page 42.",
        "For this repair, you'll need the following tools: metric socket set, torque wrench, and specialized part #M2045.",
        "Let me provide step-by-step instructions for resolving this issue...",
        "I can see from your motorcycle's specs that this is a known issue with the 2019 model. Here's the recommended fix..."
      ],
      professional: [
        "I've integrated this with your custom knowledge base and found a workshop-specific procedure your team developed.",
        "Based on your repair history, I recommend the following diagnostic approach...",
        "I've generated a custom repair procedure for your specific workshop setup.",
        "This repair requires specialized equipment. I've checked your inventory and you have all needed tools in Bay 3."
      ]
    };
    
    // Select response based on subscription tier
    let responseTier = 'basic';
    if (subscriptionType === 'professional') {
      responseTier = 'professional';
    } else if (subscriptionType === 'premium') {
      responseTier = 'premium';
    }
    
    const responses = aiResponses[responseTier];
    const aiResponse = responses[Math.floor(Math.random() * responses.length)];
    
    // Store AI response
    await db.collection('users').doc(uid)
      .collection('aiMessages').add({
        conversationId: conversationRef.id,
        content: aiResponse,
        type: 'ai',
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });
    
    return {
      conversationId: conversationRef.id,
      messageId: messageRef.id,
      response: aiResponse,
      tier: responseTier,
      messageCount: currentMonthCount + 1,
      messageLimit: messageLimit || 'unlimited'
    };
  } catch (error) {
    logger.error('Error processing AI helpdesk message', error);
    throw new HttpsError('internal', 'Failed to process AI helpdesk message', error);
  }
});

// Get AI helpdesk conversations for a user
exports.getAiHelpdeskConversations = onCall({
  cors: true,
  maxInstances: 10
}, async (request) => {
  try {
    const uid = request.auth.uid;
    if (!uid) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }
    
    // Get user subscription details
    const userDoc = await db.collection('users').doc(uid).get();
    if (!userDoc.exists) {
      throw new HttpsError('not-found', 'User profile not found');
    }
    
    const userData = userDoc.data();
    const subscriptionType = userData.subscriptionType || 'free';
    
    // Check if user can access AI helpdesk
    if (subscriptionType === 'free') {
      throw new HttpsError('permission-denied', 'AI Helpdesk requires a paid subscription');
    }
    
    // Get conversations for this user
    const conversationsSnapshot = await db.collection('aiConversations')
      .where('userId', '==', uid)
      .orderBy('updatedAt', 'desc')
      .limit(20)
      .get();
    
    const conversations = [];
    conversationsSnapshot.forEach(doc => {
      conversations.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt ? doc.data().createdAt.toDate().toISOString() : null,
        updatedAt: doc.data().updatedAt ? doc.data().updatedAt.toDate().toISOString() : null
      });
    });
    
    return { conversations };
  } catch (error) {
    logger.error('Error fetching AI helpdesk conversations', error);
    throw new HttpsError('internal', 'Failed to fetch AI helpdesk conversations', error);
  }
});

// Get messages for a specific AI helpdesk conversation
exports.getAiHelpdeskMessages = onCall({
  cors: true,
  maxInstances: 10
}, async (request) => {
  try {
    const uid = request.auth.uid;
    if (!uid) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }
    
    const { conversationId } = request.data;
    if (!conversationId) {
      throw new HttpsError('invalid-argument', 'Conversation ID is required');
    }
    
    // Check if conversation belongs to user
    const conversationRef = db.collection('aiConversations').doc(conversationId);
    const conversationDoc = await conversationRef.get();
    
    if (!conversationDoc.exists || conversationDoc.data().userId !== uid) {
      throw new HttpsError('permission-denied', 'Conversation not found or access denied');
    }
    
    // Get messages for this conversation
    const messagesSnapshot = await db.collection('users').doc(uid)
      .collection('aiMessages')
      .where('conversationId', '==', conversationId)
      .orderBy('timestamp', 'asc')
      .get();
    
    const messages = [];
    messagesSnapshot.forEach(doc => {
      messages.push({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp ? doc.data().timestamp.toDate().toISOString() : null
      });
    });
    
    return { 
      conversation: {
        id: conversationDoc.id,
        ...conversationDoc.data(),
        createdAt: conversationDoc.data().createdAt ? conversationDoc.data().createdAt.toDate().toISOString() : null,
        updatedAt: conversationDoc.data().updatedAt ? conversationDoc.data().updatedAt.toDate().toISOString() : null
      },
      messages 
    };
  } catch (error) {
    logger.error('Error fetching AI helpdesk messages', error);
    throw new HttpsError('internal', 'Failed to fetch AI helpdesk messages', error);
  }
});

// Helper function to check for badge achievements
async function checkForBadgeAchievements(userId) {
  try {
    const userRef = db.collection('users').doc(userId);
    
    // Get contributions count by type
    const contributions = await db.collection('contributions')
      .where('contributorId', '==', userId)
      .get();
    
    const counts = {
      projects: 0,
      tasks: 0,
      parts: 0,
      costs: 0,
      validations: 0,
      total: contributions.size
    };
    
    contributions.forEach(doc => {
      const data = doc.data();
      const type = data.contributionType;
      
      if (type.includes('project')) counts.projects++;
      if (type.includes('task')) counts.tasks++;
      if (type.includes('part')) counts.parts++;
      if (type.includes('cost')) counts.costs++;
      if (type.includes('validate')) counts.validations++;
    });
    
    // Define badge thresholds
    const badges = [];
    
    if (counts.total >= 100) badges.push('centurion');
    if (counts.total >= 50) badges.push('half_century');
    if (counts.total >= 25) badges.push('quarter_century');
    if (counts.total >= 10) badges.push('starter');
    
    if (counts.projects >= 20) badges.push('project_master');
    if (counts.projects >= 10) badges.push('project_pro');
    if (counts.projects >= 5) badges.push('project_contributor');
    
    if (counts.tasks >= 30) badges.push('task_master');
    if (counts.tasks >= 15) badges.push('task_pro');
    if (counts.tasks >= 5) badges.push('task_contributor');
    
    if (counts.parts >= 30) badges.push('parts_expert');
    if (counts.parts >= 15) badges.push('parts_specialist');
    if (counts.parts >= 5) badges.push('parts_contributor');
    
    if (counts.validations >= 50) badges.push('master_validator');
    if (counts.validations >= 25) badges.push('validator_pro');
    if (counts.validations >= 10) badges.push('validator');
    
    // Update user's badges
    await userRef.update({ badges });
    
    return badges;
  } catch (error) {
    logger.error('Error checking badge achievements', error);
    throw error;
  }
}