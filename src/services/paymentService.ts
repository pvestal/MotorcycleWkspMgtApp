import { functions, db, auth } from '../fbConfig';
import { httpsCallable } from 'firebase/functions';
import { collection, doc, getDoc, setDoc, updateDoc, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { User } from '../types';

// Payment service types
export interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'bank_account';
  name: string;
  info: string;
  isDefault: boolean;
  lastFour?: string;
  expiryDate?: string;
  providerToken?: string;
  createdAt: Timestamp;
}

export interface PaymentTransaction {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: string;
  subscriptionPlan: string;
  billingCycle: 'monthly' | 'yearly';
  createdAt: Timestamp;
  updatedAt: Timestamp;
  receiptUrl?: string;
  invoiceId?: string;
  nextBillingDate?: Timestamp;
}

interface SubscriptionRequest {
  userId: string;
  planType: string;
  billingCycle: 'monthly' | 'yearly';
  paymentMethodId: string;
  couponCode?: string;
}

// Providers
const PAYMENT_PROVIDERS = {
  STRIPE: 'stripe',
  PAYPAL: 'paypal'
};

/**
 * Payment Service to handle all subscription and payment-related operations
 */
export class PaymentService {
  
  /**
   * Retrieves all payment methods for the current user
   */
  async getUserPaymentMethods(): Promise<PaymentMethod[]> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('User must be authenticated to retrieve payment methods');
      }
      
      const userId = currentUser.uid;
      const paymentMethodsRef = collection(db, 'users', userId, 'paymentMethods');
      const paymentMethodsSnapshot = await getDocs(paymentMethodsRef);
      
      if (paymentMethodsSnapshot.empty) {
        return [];
      }
      
      return paymentMethodsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as PaymentMethod));
      
    } catch (error) {
      console.error('Failed to retrieve payment methods:', error);
      throw error;
    }
  }
  
  /**
   * Add a new payment method (in a real implementation, this would securely tokenize card information)
   */
  async addPaymentMethod(paymentMethod: Partial<PaymentMethod>, provider = PAYMENT_PROVIDERS.STRIPE): Promise<PaymentMethod> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('User must be authenticated to add payment method');
      }
      
      // In a real implementation, we would first send card info to Stripe or PayPal
      // to get a secure token, and then store that token with our backend
      
      // This is a simplified mock implementation
      const userId = currentUser.uid;
      const paymentMethodsRef = collection(db, 'users', userId, 'paymentMethods');
      
      // Check if this should be the default payment method
      let isDefault = paymentMethod.isDefault || false;
      
      // If this is the first payment method, make it default
      const existingMethods = await this.getUserPaymentMethods();
      if (existingMethods.length === 0) {
        isDefault = true;
      }
      
      // If setting as default, update any existing default methods
      if (isDefault && existingMethods.length > 0) {
        const defaultMethod = existingMethods.find(m => m.isDefault);
        if (defaultMethod) {
          await updateDoc(doc(db, 'users', userId, 'paymentMethods', defaultMethod.id), {
            isDefault: false
          });
        }
      }
      
      // Create a new payment method document
      const newPaymentMethod: PaymentMethod = {
        id: '', // will be set after doc creation
        type: paymentMethod.type || 'card',
        name: paymentMethod.name || 'Unnamed Card',
        info: paymentMethod.info || '',
        isDefault,
        lastFour: paymentMethod.lastFour,
        expiryDate: paymentMethod.expiryDate,
        providerToken: `${provider}_mock_token_${Date.now()}`, // Mock token
        createdAt: Timestamp.now()
      };
      
      // Add to Firestore
      const docRef = doc(paymentMethodsRef);
      newPaymentMethod.id = docRef.id;
      await setDoc(docRef, newPaymentMethod);
      
      return newPaymentMethod;
      
    } catch (error) {
      console.error('Failed to add payment method:', error);
      throw error;
    }
  }
  
  /**
   * Update an existing payment method
   */
  async updatePaymentMethod(methodId: string, updates: Partial<PaymentMethod>): Promise<PaymentMethod> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('User must be authenticated to update payment method');
      }
      
      const userId = currentUser.uid;
      const paymentMethodRef = doc(db, 'users', userId, 'paymentMethods', methodId);
      
      // Check if method exists
      const methodDoc = await getDoc(paymentMethodRef);
      if (!methodDoc.exists()) {
        throw new Error('Payment method not found');
      }
      
      // Handle default flag updates
      if (updates.isDefault) {
        // Update any existing default methods
        const paymentMethodsRef = collection(db, 'users', userId, 'paymentMethods');
        const defaultMethodsQuery = query(paymentMethodsRef, where('isDefault', '==', true));
        const defaultMethodsSnapshot = await getDocs(defaultMethodsQuery);
        
        for (const doc of defaultMethodsSnapshot.docs) {
          if (doc.id !== methodId) {
            await updateDoc(doc.ref, { isDefault: false });
          }
        }
      }
      
      // Update the method
      await updateDoc(paymentMethodRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });
      
      // Return updated method
      const updatedMethodDoc = await getDoc(paymentMethodRef);
      return {
        id: updatedMethodDoc.id,
        ...updatedMethodDoc.data()
      } as PaymentMethod;
      
    } catch (error) {
      console.error('Failed to update payment method:', error);
      throw error;
    }
  }
  
  /**
   * Delete a payment method
   */
  async deletePaymentMethod(methodId: string): Promise<void> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('User must be authenticated to delete payment method');
      }
      
      const userId = currentUser.uid;
      const paymentMethodRef = doc(db, 'users', userId, 'paymentMethods', methodId);
      
      // Check if method exists
      const methodDoc = await getDoc(paymentMethodRef);
      if (!methodDoc.exists()) {
        throw new Error('Payment method not found');
      }
      
      const methodData = methodDoc.data() as PaymentMethod;
      
      // If deleting default method, set another one as default
      if (methodData.isDefault) {
        const methods = await this.getUserPaymentMethods();
        const otherMethods = methods.filter(m => m.id !== methodId);
        
        if (otherMethods.length > 0) {
          // Set the first other method as default
          await this.updatePaymentMethod(otherMethods[0].id, { isDefault: true });
        }
      }
      
      // Delete the method
      await updateDoc(paymentMethodRef, {
        deleted: true,
        deletedAt: Timestamp.now()
      });
      
    } catch (error) {
      console.error('Failed to delete payment method:', error);
      throw error;
    }
  }
  
  /**
   * Subscribe to a plan
   */
  async subscribeToPlan(planType: string, billingCycle: 'monthly' | 'yearly', paymentMethodId: string, couponCode?: string): Promise<{ success: boolean; subscriptionId?: string; error?: string }> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('User must be authenticated to subscribe');
      }

      // For the free plan, no payment processing needed
      if (planType === 'free') {
        const processSubscription = httpsCallable(functions, 'processSubscription');
        const result = await processSubscription({
          subscriptionPlan: 'free',
          billingCycle,
          paymentMethodData: {}
        });

        if (result.data && result.data.success) {
          return {
            success: true,
            subscriptionId: null
          };
        } else {
          throw new Error('Failed to update subscription to free plan');
        }
      }

      // For paid plans, get the payment method details
      const userId = currentUser.uid;
      const paymentMethodRef = doc(db, 'users', userId, 'paymentMethods', paymentMethodId);
      const methodDoc = await getDoc(paymentMethodRef);

      if (!methodDoc.exists()) {
        throw new Error('Payment method not found');
      }

      const paymentMethod = methodDoc.data() as PaymentMethod;

      // Prepare payment method data for the cloud function
      const paymentMethodData = {
        id: paymentMethod.id,
        type: paymentMethod.type,
        name: paymentMethod.name,
        info: paymentMethod.info,
        lastFour: paymentMethod.lastFour,
        expiryDate: paymentMethod.expiryDate,
        // Use existing processor payment method ID if available
        processorPaymentMethodId: paymentMethod.providerToken
      };

      // Determine payment processor based on payment method type
      const processor = paymentMethod.type === 'paypal' ? 'paypal' : 'stripe';

      // Call the cloud function to process the subscription
      const processSubscription = httpsCallable(functions, 'processSubscription');
      const result = await processSubscription({
        subscriptionPlan: planType,
        billingCycle,
        paymentMethodData,
        processor,
        couponCode
      });

      if (result.data && result.data.success) {
        return {
          success: true,
          subscriptionId: result.data.subscriptionId
        };
      } else {
        throw new Error(result.data?.error || 'Failed to process subscription payment');
      }

    } catch (error: any) {
      console.error('Failed to subscribe to plan:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Cancel subscription
   */
  async cancelSubscription(reason: string, feedback?: string): Promise<{ success: boolean; error?: string }> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('User must be authenticated to cancel subscription');
      }

      // Call the cloud function to cancel the subscription
      const cancelSubscriptionFunction = httpsCallable(functions, 'cancelSubscription');
      const result = await cancelSubscriptionFunction({
        reason,
        feedback: feedback || ''
      });

      if (result.data && result.data.success) {
        return { success: true };
      } else {
        throw new Error(result.data?.message || 'Failed to cancel subscription');
      }

    } catch (error: any) {
      console.error('Failed to cancel subscription:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Get payment history
   */
  async getPaymentHistory(): Promise<PaymentTransaction[]> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('User must be authenticated to view payment history');
      }
      
      const userId = currentUser.uid;
      const transactionsQuery = query(
        collection(db, 'transactions'),
        where('userId', '==', userId)
      );
      
      const transactionsSnapshot = await getDocs(transactionsQuery);
      
      if (transactionsSnapshot.empty) {
        return [];
      }
      
      return transactionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as PaymentTransaction)).sort((a, b) => 
        b.createdAt.toMillis() - a.createdAt.toMillis()
      );
      
    } catch (error) {
      console.error('Failed to retrieve payment history:', error);
      throw error;
    }
  }
  
  /**
   * Generate a receipt for a transaction
   */
  async generateReceipt(transactionId: string): Promise<string> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('User must be authenticated to generate receipt');
      }
      
      // In a real implementation, this would call a Cloud Function
      // to generate a PDF receipt and return a download URL
      
      // For this demo, we'll just return a mock URL
      return `https://example.com/receipts/${transactionId}.pdf`;
      
    } catch (error) {
      console.error('Failed to generate receipt:', error);
      throw error;
    }
  }
  
  /**
   * Utility method to format currency amounts
   */
  formatCurrency(amount: number, currency = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency
    }).format(amount);
  }
  
  /**
   * Check if a coupon code is valid
   */
  async checkCouponCode(code: string): Promise<{
    valid: boolean;
    discountPercentage?: number;
    discountAmount?: number;
    error?: string;
  }> {
    try {
      if (!code || code.trim() === '') {
        return {
          valid: false,
          error: 'Coupon code is required'
        };
      }

      // Call the cloud function to validate the coupon code
      const validateCoupon = httpsCallable(functions, 'validateCoupon');
      const result = await validateCoupon({ couponCode: code });

      if (result.data) {
        return result.data as {
          valid: boolean;
          discountPercentage?: number;
          discountAmount?: number;
          error?: string;
        };
      }

      return {
        valid: false,
        error: 'Failed to validate coupon code'
      };
    } catch (error: any) {
      console.error('Failed to check coupon code:', error);
      return {
        valid: false,
        error: error.message
      };
    }
  }
}

// Create and export a singleton instance
export const paymentService = new PaymentService();
export default paymentService;