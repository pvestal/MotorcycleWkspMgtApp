/**
 * Authentication and authorization utilities
 */

const admin = require('firebase-admin');
const logger = require('firebase-functions/logger');

/**
 * Validate if a user has the required roles/permissions
 * @param {string} uid - User ID to check
 * @param {string[]} requiredRoles - Roles that grant access
 * @returns {Promise<boolean>} True if user has required roles, false otherwise
 */
async function validateAuthorization(uid, requiredRoles = []) {
  try {
    if (!uid) {
      return false;
    }
    
    // Get the user document
    const userDoc = await admin.firestore().collection('users').doc(uid).get();
    
    if (!userDoc.exists) {
      logger.warn(`User ${uid} does not exist but attempted authorization check`);
      return false;
    }
    
    const userData = userDoc.data();
    
    // Admin users always have access
    if (userData.isAdmin === true) {
      return true;
    }
    
    // Check if user has any of the required roles
    if (requiredRoles.length > 0) {
      const userRole = userData.role || 'user';
      
      if (requiredRoles.includes(userRole)) {
        return true;
      }
    }
    
    return false;
  } catch (error) {
    logger.error('Error validating authorization', error);
    return false;
  }
}

/**
 * Verify the validity of an API key
 * @param {string} apiKey - API key to validate
 * @returns {Promise<Object|null>} User data if valid, null otherwise
 */
async function verifyApiKey(apiKey) {
  try {
    if (!apiKey) {
      return null;
    }
    
    // Search for the API key in credentials collection
    const apiKeySnapshot = await admin.firestore()
      .collectionGroup('credentials')
      .where('key', '==', apiKey)
      .limit(1)
      .get();
    
    if (apiKeySnapshot.empty) {
      return null;
    }
    
    // Get the API key document and user ID
    const apiKeyDoc = apiKeySnapshot.docs[0];
    const keyData = apiKeyDoc.data();
    
    // Get the parent path to extract the user ID
    const userPath = apiKeyDoc.ref.path.split('/credentials')[0];
    const userId = userPath.split('/').pop();
    
    // Get the user document
    const userDoc = await admin.firestore().collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return null;
    }
    
    // Update the last used timestamp
    await apiKeyDoc.ref.update({
      lastUsed: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Return the user data
    return {
      userId,
      ...userDoc.data()
    };
  } catch (error) {
    logger.error('Error verifying API key', error);
    return null;
  }
}

module.exports = {
  validateAuthorization,
  verifyApiKey
};