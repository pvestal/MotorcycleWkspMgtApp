/**
 * Subscription plans and feature access definitions
 */

// Define subscription plans with feature access
const subscriptionPlans = {
  free: {
    // Basic features
    projectLimit: 3,
    tasksPerProject: 10,
    partsPerProject: 10,
    costsPerProject: 10,
    imageUploadLimit: 5,
    // Feature flags
    canExportData: false,
    canAccessInventory: false,
    canUseAdvancedReporting: false,
    canCreateTemplates: false,
    canCreateTeam: false,
    canInviteMembers: false,
    canUseAdvancedAnalytics: false,
    canScheduleReminders: false,
    canReceiveAlerts: false,
    canAccessAiHelpdesk: false,
    aiHelpdeskMessagesPerMonth: 0
  },
  
  standard: {
    // Enhanced features
    projectLimit: 10,
    tasksPerProject: 100,
    partsPerProject: 100,
    costsPerProject: 100,
    imageUploadLimit: 20,
    // Feature flags
    canExportData: true,
    canAccessInventory: true,
    canUseAdvancedReporting: false,
    canCreateTemplates: true,
    canCreateTeam: false,
    canInviteMembers: false,
    canUseAdvancedAnalytics: false,
    canScheduleReminders: true,
    canReceiveAlerts: true,
    canAccessAiHelpdesk: true,
    aiHelpdeskMessagesPerMonth: 20
  },
  
  premium: {
    // Premium features
    projectLimit: 100,
    tasksPerProject: 500,
    partsPerProject: 500,
    costsPerProject: 500,
    imageUploadLimit: 100,
    // Feature flags
    canExportData: true,
    canAccessInventory: true,
    canUseAdvancedReporting: true,
    canCreateTemplates: true,
    canCreateTeam: true,
    canInviteMembers: true,
    canUseAdvancedAnalytics: true,
    canScheduleReminders: true,
    canReceiveAlerts: true,
    canAccessAiHelpdesk: true,
    aiHelpdeskMessagesPerMonth: 100,
    canAccessPremiumAiHelpdesk: true,
    canUploadDocumentsToAiHelpdesk: true
  },

  professional: {
    // Professional features for workshops
    projectLimit: 1000,
    tasksPerProject: 1000,
    partsPerProject: 1000,
    costsPerProject: 1000,
    imageUploadLimit: 500,
    // Feature flags
    canExportData: true,
    canAccessInventory: true,
    canUseAdvancedReporting: true,
    canCreateTemplates: true,
    canCreateTeam: true,
    canInviteMembers: true,
    canUseAdvancedAnalytics: true,
    canScheduleReminders: true,
    canReceiveAlerts: true,
    // Professional-only features
    canIntegrateWithShopSystems: true,
    canUseWhiteLabel: true,
    canAccessPrioritySuppport: true,
    canUseApiAccess: true,
    canCreateCustomForms: true,
    // AI Helpdesk features
    canAccessAiHelpdesk: true,
    aiHelpdeskMessagesPerMonth: 500,
    canAccessPremiumAiHelpdesk: true,
    canUploadDocumentsToAiHelpdesk: true,
    canIntegrateCustomKnowledgeBase: true,
    priorityAiSupport: true
  }
};

// Pricing information for the UI
const subscriptionPricing = {
  free: {
    monthlyPrice: 0,
    yearlyPrice: 0,
    yearlyDiscount: '0%',
    trialDays: 0,
    features: [
      '3 projects',
      '10 tasks/parts per project',
      'Basic features',
      'Community support'
    ]
  },
  standard: {
    monthlyPrice: 9.99,
    yearlyPrice: 99.99,
    yearlyDiscount: '16%',
    trialDays: 14,
    features: [
      '10 projects',
      '100 tasks/parts per project',
      'Export data',
      'Inventory access',
      'Reminders and alerts',
      'Basic AI Helpdesk (20 messages/month)'
    ]
  },
  premium: {
    monthlyPrice: 19.99,
    yearlyPrice: 199.99,
    yearlyDiscount: '17%',
    trialDays: 14,
    features: [
      '100 projects',
      '500 tasks/parts per project',
      'Team capabilities',
      'Advanced analytics',
      'Premium AI Helpdesk (100 messages/month)',
      'Document upload for AI analysis'
    ]
  },
  professional: {
    monthlyPrice: 49.99,
    yearlyPrice: 499.99,
    yearlyDiscount: '17%',
    trialDays: 30,
    features: [
      'Unlimited projects',
      '1000 tasks/parts per project',
      'Shop system integration',
      'White label options',
      'Priority support',
      'Custom API access',
      'Unlimited AI Helpdesk usage',
      'Custom knowledge base integration',
      'Priority AI support'
    ]
  }
};

/**
 * AI Helpdesk features and capabilities
 */
const aiHelpdeskCapabilities = {
  basic: {
    description: "Basic AI Helpdesk for Standard subscribers",
    capabilities: [
      "Answer general motorcycle maintenance questions",
      "Troubleshoot common problems",
      "Provide basic repair guidance",
      "Explain motorcycle terminology",
      "Limited to 20 messages per month"
    ]
  },
  premium: {
    description: "Enhanced AI Helpdesk for Premium subscribers",
    capabilities: [
      "All Basic capabilities",
      "Analyze uploaded repair manuals",
      "Provide model-specific repair guidance",
      "Suggest parts and tools needed for repairs",
      "Step-by-step instruction generation",
      "100 messages per month"
    ]
  },
  professional: {
    description: "Professional AI Helpdesk for Professional subscribers",
    capabilities: [
      "All Premium capabilities",
      "Unlimited messages",
      "Integration with custom knowledge base",
      "Priority response processing",
      "Advanced diagnostics assistance",
      "Custom repair procedure creation",
      "Workshop management recommendations"
    ]
  }
};

/**
 * Check if a feature is available for a given subscription type
 * @param {string} subscriptionType - Type of subscription
 * @param {string} featureName - Name of the feature to check
 * @returns {boolean} True if the feature is available, false otherwise
 */
function isFeatureAvailable(subscriptionType, featureName) {
  // Default to free plan if subscription type is invalid
  const plan = subscriptionPlans[subscriptionType] || subscriptionPlans.free;
  
  // Check if the feature exists in the plan
  return !!plan[featureName];
}

/**
 * Get the limit value for a given subscription type and limit name
 * @param {string} subscriptionType - Type of subscription
 * @param {string} limitName - Name of the limit to check
 * @returns {number} The limit value
 */
function getSubscriptionLimit(subscriptionType, limitName) {
  // Default to free plan if subscription type is invalid
  const plan = subscriptionPlans[subscriptionType] || subscriptionPlans.free;
  
  // Return the limit value if it exists, otherwise return 0
  return plan[limitName] || 0;
}

/**
 * Check if a user has reached a specific subscription limit
 * @param {string} subscriptionType - Type of subscription
 * @param {string} limitName - Name of the limit to check
 * @param {number} currentValue - Current value to check against the limit
 * @returns {boolean} True if the limit has been reached, false otherwise
 */
function hasReachedLimit(subscriptionType, limitName, currentValue) {
  const limit = getSubscriptionLimit(subscriptionType, limitName);
  
  // If limit is 0 or negative, treat as unlimited
  if (limit <= 0) {
    return false;
  }
  
  return currentValue >= limit;
}

/**
 * Get AI helpdesk capabilities for a given subscription type
 * @param {string} subscriptionType - Type of subscription
 * @returns {Object} AI helpdesk capabilities for the subscription
 */
function getAiHelpdeskTier(subscriptionType) {
  if (subscriptionType === 'professional') {
    return aiHelpdeskCapabilities.professional;
  } else if (subscriptionType === 'premium') {
    return aiHelpdeskCapabilities.premium;
  } else if (subscriptionType === 'standard') {
    return aiHelpdeskCapabilities.basic;
  } else {
    return null; // Free tier has no AI helpdesk
  }
}

module.exports = {
  subscriptionPlans,
  subscriptionPricing,
  aiHelpdeskCapabilities,
  isFeatureAvailable,
  getSubscriptionLimit,
  hasReachedLimit,
  getAiHelpdeskTier
};