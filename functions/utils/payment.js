/**
 * Payment processing utility functions for subscription management
 * These functions provide a secure interface for processing payments and
 * managing subscriptions using payment processors like Stripe and PayPal.
 */

// Mock payment processor API - in a real implementation, these would be actual API calls
// to payment processors like Stripe or PayPal
const paymentProcessors = {
  stripe: {
    createCustomer: async (userData) => {
      // Mock creating a Stripe customer
      return {
        id: `stripe_customer_${Date.now()}`,
        email: userData.email,
        name: userData.displayName,
        created: Date.now() / 1000,
        metadata: {
          firebaseUserId: userData.uid
        }
      };
    },
    
    createPaymentMethod: async (paymentData) => {
      // Mock creating a payment method in Stripe
      return {
        id: `stripe_pm_${Date.now()}`,
        type: paymentData.type || 'card',
        card: paymentData.type === 'card' ? {
          brand: 'visa',
          last4: paymentData.lastFour || '4242',
          exp_month: 12,
          exp_year: 25,
        } : null,
        created: Date.now() / 1000,
        customer: paymentData.customerId
      };
    },
    
    attachPaymentMethodToCustomer: async (customerId, paymentMethodId) => {
      // Mock attaching payment method to customer
      return {
        success: true,
        customerId,
        paymentMethodId
      };
    },
    
    createSubscription: async (customerId, paymentMethodId, planId, billingCycle) => {
      // Mock creating a subscription in Stripe
      const now = new Date();
      const endDate = new Date(now);
      
      if (billingCycle === 'yearly') {
        endDate.setFullYear(endDate.getFullYear() + 1);
      } else {
        endDate.setMonth(endDate.getMonth() + 1);
      }
      
      return {
        id: `stripe_sub_${Date.now()}`,
        customer: customerId,
        default_payment_method: paymentMethodId,
        plan: {
          id: planId,
          interval: billingCycle === 'yearly' ? 'year' : 'month',
        },
        current_period_start: Math.floor(now.getTime() / 1000),
        current_period_end: Math.floor(endDate.getTime() / 1000),
        status: 'active',
        latest_invoice: {
          id: `stripe_inv_${Date.now()}`,
          amount_paid: getSubscriptionPrice(planId, billingCycle) * 100, // in cents
          payment_intent: {
            id: `stripe_pi_${Date.now()}`,
            amount: getSubscriptionPrice(planId, billingCycle) * 100, // in cents
            status: 'succeeded'
          }
        }
      };
    },
    
    cancelSubscription: async (subscriptionId) => {
      // Mock cancelling a subscription in Stripe
      return {
        id: subscriptionId,
        status: 'canceled',
        cancel_at_period_end: true
      };
    },
    
    retrieveSubscription: async (subscriptionId) => {
      // Mock retrieving subscription details from Stripe
      const now = new Date();
      const endDate = new Date(now);
      endDate.setMonth(endDate.getMonth() + 1);
      
      return {
        id: subscriptionId,
        status: 'active',
        current_period_start: Math.floor(now.getTime() / 1000),
        current_period_end: Math.floor(endDate.getTime() / 1000),
      };
    }
  },
  
  paypal: {
    createCustomer: async (userData) => {
      // Mock creating a PayPal customer
      return {
        id: `paypal_customer_${Date.now()}`,
        email: userData.email,
        name: userData.displayName,
        created: Date.now() / 1000,
        metadata: {
          firebaseUserId: userData.uid
        }
      };
    },
    
    createPaymentMethod: async (paymentData) => {
      // Mock creating a payment method in PayPal
      return {
        id: `paypal_pm_${Date.now()}`,
        type: 'paypal',
        created: Date.now() / 1000,
        customer: paymentData.customerId
      };
    },
    
    createSubscription: async (customerId, paymentMethodId, planId, billingCycle) => {
      // Mock creating a subscription in PayPal
      const now = new Date();
      const endDate = new Date(now);
      
      if (billingCycle === 'yearly') {
        endDate.setFullYear(endDate.getFullYear() + 1);
      } else {
        endDate.setMonth(endDate.getMonth() + 1);
      }
      
      return {
        id: `paypal_sub_${Date.now()}`,
        customer: customerId,
        payment_method: paymentMethodId,
        plan: {
          id: planId,
          interval: billingCycle === 'yearly' ? 'year' : 'month',
        },
        start_time: now.toISOString(),
        next_billing_time: endDate.toISOString(),
        status: 'ACTIVE',
        invoice_id: `paypal_inv_${Date.now()}`
      };
    },
    
    cancelSubscription: async (subscriptionId) => {
      // Mock cancelling a subscription in PayPal
      return {
        id: subscriptionId,
        status: 'CANCELLED'
      };
    },
    
    retrieveSubscription: async (subscriptionId) => {
      // Mock retrieving subscription details from PayPal
      const now = new Date();
      const endDate = new Date(now);
      endDate.setMonth(endDate.getMonth() + 1);
      
      return {
        id: subscriptionId,
        status: 'ACTIVE',
        start_time: now.toISOString(),
        next_billing_time: endDate.toISOString(),
      };
    }
  }
};

// Pricing data for subscriptions
const subscriptionPrices = {
  standard: { 
    monthly: 9.99, 
    yearly: 99.99 
  },
  premium: { 
    monthly: 19.99, 
    yearly: 199.99 
  },
  professional: { 
    monthly: 49.99, 
    yearly: 499.99 
  }
};

/**
 * Get the price for a subscription plan and billing cycle
 * @param {string} planId - The subscription plan ID
 * @param {string} billingCycle - Either 'monthly' or 'yearly'
 * @returns {number} The price for the subscription
 */
function getSubscriptionPrice(planId, billingCycle) {
  if (!subscriptionPrices[planId]) {
    return 0;
  }
  
  return subscriptionPrices[planId][billingCycle] || 0;
}

/**
 * Process a subscription payment securely
 * @param {string} userId - The Firebase user ID
 * @param {string} subscriptionPlan - The subscription plan ID
 * @param {string} billingCycle - Either 'monthly' or 'yearly'
 * @param {object} paymentMethodData - The payment method data
 * @param {string} processor - The payment processor to use ('stripe' or 'paypal')
 * @returns {Promise<object>} The subscription and transaction result
 */
async function processSubscriptionPayment(userId, userData, subscriptionPlan, billingCycle, paymentMethodData, processor = 'stripe') {
  // Get the payment processor
  const paymentProcessor = paymentProcessors[processor];
  if (!paymentProcessor) {
    throw new Error(`Invalid payment processor: ${processor}`);
  }
  
  try {
    // Create or retrieve a customer
    const customer = await paymentProcessor.createCustomer(userData);
    
    // Create a payment method
    const paymentMethodParam = {
      ...paymentMethodData,
      customerId: customer.id
    };
    const paymentMethod = await paymentProcessor.createPaymentMethod(paymentMethodParam);
    
    // Attach payment method to customer (only needed for stripe)
    if (processor === 'stripe') {
      await paymentProcessor.attachPaymentMethodToCustomer(
        customer.id, 
        paymentMethod.id
      );
    }
    
    // Create the subscription
    const subscription = await paymentProcessor.createSubscription(
      customer.id,
      paymentMethod.id,
      subscriptionPlan,
      billingCycle
    );
    
    // Calculate the end date based on billing cycle
    const startDate = new Date();
    const endDate = new Date(startDate);
    
    if (billingCycle === 'yearly') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      endDate.setMonth(endDate.getMonth() + 1);
    }
    
    // Prepare the result object
    const result = {
      success: true,
      subscriptionId: subscription.id,
      customerId: customer.id,
      paymentMethodId: paymentMethod.id,
      startDate,
      endDate,
      status: processor === 'stripe' ? subscription.status : subscription.status === 'ACTIVE' ? 'active' : 'inactive',
      billingCycle,
      amount: getSubscriptionPrice(subscriptionPlan, billingCycle),
      currency: 'USD',
      receiptUrl: processor === 'stripe' 
        ? `https://dashboard.stripe.com/receipts/${subscription.latest_invoice.payment_intent.id}`
        : `https://www.paypal.com/activity/payment/${subscription.invoice_id}`,
      processor
    };
    
    return result;
  } catch (error) {
    console.error('Error processing subscription payment:', error);
    throw error;
  }
}

/**
 * Cancel a subscription
 * @param {string} subscriptionId - The subscription ID to cancel
 * @param {string} processor - The payment processor used ('stripe' or 'paypal')
 * @returns {Promise<object>} The cancellation result
 */
async function cancelSubscription(subscriptionId, processor = 'stripe') {
  // Get the payment processor
  const paymentProcessor = paymentProcessors[processor];
  if (!paymentProcessor) {
    throw new Error(`Invalid payment processor: ${processor}`);
  }
  
  try {
    // Cancel the subscription
    const result = await paymentProcessor.cancelSubscription(subscriptionId);
    
    return {
      success: true,
      subscriptionId,
      status: processor === 'stripe' ? result.status : result.status === 'CANCELLED' ? 'canceled' : 'active',
      cancelAtPeriodEnd: processor === 'stripe' ? result.cancel_at_period_end : true
    };
  } catch (error) {
    console.error('Error canceling subscription:', error);
    throw error;
  }
}

/**
 * Get subscription details
 * @param {string} subscriptionId - The subscription ID
 * @param {string} processor - The payment processor used ('stripe' or 'paypal')
 * @returns {Promise<object>} The subscription details
 */
async function getSubscriptionDetails(subscriptionId, processor = 'stripe') {
  // Get the payment processor
  const paymentProcessor = paymentProcessors[processor];
  if (!paymentProcessor) {
    throw new Error(`Invalid payment processor: ${processor}`);
  }
  
  try {
    // Get the subscription details
    const subscription = await paymentProcessor.retrieveSubscription(subscriptionId);
    
    // Parse the dates based on processor format
    let currentPeriodStart, currentPeriodEnd;
    
    if (processor === 'stripe') {
      currentPeriodStart = new Date(subscription.current_period_start * 1000);
      currentPeriodEnd = new Date(subscription.current_period_end * 1000);
    } else {
      currentPeriodStart = new Date(subscription.start_time);
      currentPeriodEnd = new Date(subscription.next_billing_time);
    }
    
    return {
      success: true,
      subscriptionId,
      status: processor === 'stripe' ? subscription.status : subscription.status === 'ACTIVE' ? 'active' : 'inactive',
      currentPeriodStart,
      currentPeriodEnd,
      isActive: processor === 'stripe' 
        ? subscription.status === 'active' || subscription.status === 'trialing'
        : subscription.status === 'ACTIVE'
    };
  } catch (error) {
    console.error('Error getting subscription details:', error);
    throw error;
  }
}

/**
 * Validate a coupon code
 * @param {string} couponCode - The coupon code to validate
 * @returns {Promise<object>} The validation result
 */
async function validateCouponCode(couponCode) {
  // Mock coupon validation logic
  // In a real implementation, this would validate against a database of valid coupons
  
  const validCoupons = {
    'WELCOME10': {
      valid: true,
      discountPercentage: 10,
      expiryDate: new Date('2025-12-31')
    },
    'SPRING2023': {
      valid: true,
      discountPercentage: 15,
      expiryDate: new Date('2023-06-30')
    },
    'NEWUSER': {
      valid: true,
      discountAmount: 5, // $5 off
      expiryDate: new Date('2025-12-31')
    }
  };
  
  const coupon = validCoupons[couponCode];
  
  if (!coupon) {
    return {
      valid: false,
      error: 'Invalid coupon code'
    };
  }
  
  // Check if coupon is expired
  if (coupon.expiryDate < new Date()) {
    return {
      valid: false,
      error: 'Coupon has expired'
    };
  }
  
  return {
    valid: true,
    discountPercentage: coupon.discountPercentage,
    discountAmount: coupon.discountAmount
  };
}

module.exports = {
  processSubscriptionPayment,
  cancelSubscription,
  getSubscriptionDetails,
  validateCouponCode,
  getSubscriptionPrice
};