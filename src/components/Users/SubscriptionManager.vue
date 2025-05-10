<template>
  <div class="subscription-manager">
    <header class="subscription-header">
      <h2>Subscription Plans</h2>
      <p>Choose the plan that best fits your needs</p>
    </header>

    <div class="subscription-wrapper">
      <!-- Toggle for Monthly/Yearly Billing -->
      <div class="billing-toggle">
        <span :class="{ active: !yearlyBilling }">Monthly</span>
        <label class="switch">
          <input type="checkbox" v-model="yearlyBilling">
          <span class="slider round"></span>
        </label>
        <span :class="{ active: yearlyBilling }">Yearly</span>
        <div class="discount-badge" v-if="yearlyBilling">Save up to 17%</div>
      </div>

      <!-- Subscription Plans -->
      <div class="subscription-plans">
        <!-- Free Plan -->
        <div 
          class="plan-card" 
          :class="{ 
            'current-plan': userSubscription === 'free',
            'popular': false
          }"
        >
          <div class="plan-header">
            <h3>Free</h3>
            <p class="plan-price">
              <span class="price">$0</span>
              <span class="period">forever</span>
            </p>
            <p class="plan-description">Basic features for individual enthusiasts</p>
          </div>
          
          <ul class="plan-features">
            <li class="included">
              <span class="material-symbols-outlined">check_circle</span>
              <span>3 projects</span>
            </li>
            <li class="included">
              <span class="material-symbols-outlined">check_circle</span>
              <span>10 tasks per project</span>
            </li>
            <li class="included">
              <span class="material-symbols-outlined">check_circle</span>
              <span>10 parts per project</span>
            </li>
            <li class="included">
              <span class="material-symbols-outlined">check_circle</span>
              <span>5 image uploads per project</span>
            </li>
            <li class="not-included">
              <span class="material-symbols-outlined">cancel</span>
              <span>Export data</span>
            </li>
            <li class="not-included">
              <span class="material-symbols-outlined">cancel</span>
              <span>Inventory access</span>
            </li>
            <li class="not-included">
              <span class="material-symbols-outlined">cancel</span>
              <span>Advanced analytics</span>
            </li>
          </ul>
          
          <button 
            v-if="userSubscription === 'free'"
            class="current-plan-btn"
            disabled
          >
            Current Plan
          </button>
          <button 
            v-else
            class="select-plan-btn free-plan"
            @click="selectPlan('free')"
          >
            Downgrade
          </button>
        </div>
        
        <!-- Standard Plan -->
        <div 
          class="plan-card" 
          :class="{ 
            'current-plan': userSubscription === 'standard',
            'popular': true
          }"
        >
          <div class="popular-badge" v-if="true">Most Popular</div>
          <div class="plan-header">
            <h3>Standard</h3>
            <p class="plan-price">
              <span class="price">${{ yearlyBilling ? '99.99' : '9.99' }}</span>
              <span class="period">{{ yearlyBilling ? '/year' : '/month' }}</span>
            </p>
            <p class="plan-description">Enhanced features for serious enthusiasts</p>
          </div>
          
          <ul class="plan-features">
            <li class="included">
              <span class="material-symbols-outlined">check_circle</span>
              <span>10 projects</span>
            </li>
            <li class="included">
              <span class="material-symbols-outlined">check_circle</span>
              <span>100 tasks per project</span>
            </li>
            <li class="included">
              <span class="material-symbols-outlined">check_circle</span>
              <span>100 parts per project</span>
            </li>
            <li class="included">
              <span class="material-symbols-outlined">check_circle</span>
              <span>20 image uploads per project</span>
            </li>
            <li class="included">
              <span class="material-symbols-outlined">check_circle</span>
              <span>Export data</span>
            </li>
            <li class="included">
              <span class="material-symbols-outlined">check_circle</span>
              <span>Inventory access</span>
            </li>
            <li class="not-included">
              <span class="material-symbols-outlined">cancel</span>
              <span>Advanced analytics</span>
            </li>
          </ul>
          
          <button 
            v-if="userSubscription === 'standard'"
            class="current-plan-btn"
            disabled
          >
            Current Plan
          </button>
          <button 
            v-else
            class="select-plan-btn standard-plan hover-effect"
            @click="selectPlan('standard')"
          >
            {{ userSubscription === 'free' ? 'Upgrade' : 'Downgrade' }}
          </button>
        </div>
        
        <!-- Premium Plan -->
        <div 
          class="plan-card" 
          :class="{ 
            'current-plan': userSubscription === 'premium',
            'popular': false
          }"
        >
          <div class="plan-header">
            <h3>Premium</h3>
            <p class="plan-price">
              <span class="price">${{ yearlyBilling ? '199.99' : '19.99' }}</span>
              <span class="period">{{ yearlyBilling ? '/year' : '/month' }}</span>
            </p>
            <p class="plan-description">Advanced features for power users</p>
          </div>
          
          <ul class="plan-features">
            <li class="included">
              <span class="material-symbols-outlined">check_circle</span>
              <span>100 projects</span>
            </li>
            <li class="included">
              <span class="material-symbols-outlined">check_circle</span>
              <span>500 tasks per project</span>
            </li>
            <li class="included">
              <span class="material-symbols-outlined">check_circle</span>
              <span>500 parts per project</span>
            </li>
            <li class="included">
              <span class="material-symbols-outlined">check_circle</span>
              <span>100 image uploads per project</span>
            </li>
            <li class="included">
              <span class="material-symbols-outlined">check_circle</span>
              <span>Export data</span>
            </li>
            <li class="included">
              <span class="material-symbols-outlined">check_circle</span>
              <span>Inventory access</span>
            </li>
            <li class="included">
              <span class="material-symbols-outlined">check_circle</span>
              <span>Advanced analytics</span>
            </li>
            <li class="included">
              <span class="material-symbols-outlined">check_circle</span>
              <span>Create team workspaces</span>
            </li>
          </ul>
          
          <button 
            v-if="userSubscription === 'premium'"
            class="current-plan-btn"
            disabled
          >
            Current Plan
          </button>
          <button 
            v-else
            class="select-plan-btn premium-plan hover-effect"
            @click="selectPlan('premium')"
          >
            {{ userSubscription === 'professional' ? 'Downgrade' : 'Upgrade' }}
          </button>
        </div>
        
        <!-- Professional Plan -->
        <div 
          class="plan-card" 
          :class="{ 
            'current-plan': userSubscription === 'professional',
            'popular': false
          }"
        >
          <div class="plan-header">
            <h3>Professional</h3>
            <p class="plan-price">
              <span class="price">${{ yearlyBilling ? '499.99' : '49.99' }}</span>
              <span class="period">{{ yearlyBilling ? '/year' : '/month' }}</span>
            </p>
            <p class="plan-description">Complete solution for professional workshops</p>
          </div>
          
          <ul class="plan-features">
            <li class="included">
              <span class="material-symbols-outlined">check_circle</span>
              <span>Unlimited projects</span>
            </li>
            <li class="included">
              <span class="material-symbols-outlined">check_circle</span>
              <span>Unlimited tasks</span>
            </li>
            <li class="included">
              <span class="material-symbols-outlined">check_circle</span>
              <span>Unlimited parts</span>
            </li>
            <li class="included">
              <span class="material-symbols-outlined">check_circle</span>
              <span>Unlimited image uploads</span>
            </li>
            <li class="included">
              <span class="material-symbols-outlined">check_circle</span>
              <span>Shop system integration</span>
            </li>
            <li class="included">
              <span class="material-symbols-outlined">check_circle</span>
              <span>White label options</span>
            </li>
            <li class="included">
              <span class="material-symbols-outlined">check_circle</span>
              <span>Priority support</span>
            </li>
            <li class="included">
              <span class="material-symbols-outlined">check_circle</span>
              <span>Custom API access</span>
            </li>
          </ul>
          
          <button 
            v-if="userSubscription === 'professional'"
            class="current-plan-btn"
            disabled
          >
            Current Plan
          </button>
          <button 
            v-else
            class="select-plan-btn professional-plan hover-effect"
            @click="selectPlan('professional')"
          >
            Upgrade
          </button>
        </div>
      </div>
      
      <!-- Current Subscription Info -->
      <div v-if="userSubscription !== 'free'" class="current-subscription-info">
        <div class="subscription-details">
          <h4>Your Subscription</h4>
          <div class="detail-row">
            <span>Plan:</span>
            <span class="value">{{ formatPlanName(userSubscription) }}</span>
          </div>
          <div class="detail-row">
            <span>Billing:</span>
            <span class="value">{{ subscriptionDetails.billingCycle || 'Monthly' }}</span>
          </div>
          <div class="detail-row">
            <span>Next billing date:</span>
            <span class="value">{{ formatDate(subscriptionDetails.nextBillingDate) }}</span>
          </div>
          <div class="detail-row">
            <span>Status:</span>
            <span class="value status" :class="{ 'active': subscriptionDetails.isActive }">
              {{ subscriptionDetails.isActive ? 'Active' : 'Inactive' }}
            </span>
          </div>
        </div>

        <div class="subscription-actions">
          <button class="view-payment-history-btn" @click="loadPaymentHistory">
            <span class="material-symbols-outlined">receipt_long</span>
            Payment History
          </button>
          <button class="manage-payment-methods-btn" @click="loadPaymentMethods().then(() => showAddPaymentMethodModal = true)">
            <span class="material-symbols-outlined">credit_card</span>
            Manage Payment Methods
          </button>
          <button class="cancel-subscription-btn" @click="confirmCancelSubscription">
            <span class="material-symbols-outlined">cancel</span>
            Cancel Subscription
          </button>
        </div>

        <!-- Payment Methods List -->
        <div v-if="paymentMethods.length > 0" class="payment-methods-list">
          <h4>Payment Methods</h4>
          <div class="payment-methods-grid">
            <div
              v-for="method in paymentMethods"
              :key="method.id"
              class="payment-method-card"
              :class="{ 'default': method.isDefault }"
            >
              <div class="payment-method-card-header">
                <span
                  class="material-symbols-outlined"
                  v-if="method.type === 'card'"
                >
                  credit_card
                </span>
                <span
                  class="material-symbols-outlined"
                  v-else-if="method.type === 'paypal'"
                >
                  account_balance_wallet
                </span>
                <span
                  class="material-symbols-outlined"
                  v-else
                >
                  account_balance
                </span>
                <div v-if="method.isDefault" class="default-method-badge">Default</div>
              </div>
              <div class="payment-method-card-body">
                <div class="payment-method-name">{{ method.name }}</div>
                <div class="payment-method-info">{{ method.info }}</div>
              </div>
              <div class="payment-method-card-actions">
                <button
                  v-if="!method.isDefault"
                  class="set-default-btn"
                  @click="setDefaultPaymentMethod(method.id)"
                >
                  Set as Default
                </button>
                <button
                  class="delete-method-btn"
                  @click="deletePaymentMethod(method.id)"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Confirm Subscription Change Modal -->
    <div v-if="showConfirmationModal" class="modal-overlay" @click.self="showConfirmationModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Confirm {{ upgradeOrDowngrade }}</h3>
          <button class="close-btn" @click="showConfirmationModal = false">&times;</button>
        </div>
        <div class="modal-body">
          <p v-if="isUpgrade">
            You are about to upgrade to the <strong>{{ formatPlanName(selectedPlan) }}</strong> plan.
            You will be charged ${{ getPlanPrice(selectedPlan) }} {{ yearlyBilling ? 'yearly' : 'monthly' }}.
          </p>
          <p v-else-if="isDowngrade && selectedPlan !== 'free'">
            You are about to downgrade to the <strong>{{ formatPlanName(selectedPlan) }}</strong> plan.
            Your new rate will be ${{ getPlanPrice(selectedPlan) }} {{ yearlyBilling ? 'yearly' : 'monthly' }}
            starting on your next billing date.
          </p>
          <p v-else>
            You are about to downgrade to the <strong>Free</strong> plan.
            You will lose access to premium features immediately.
          </p>
          
          <div v-if="isUpgrade">
            <h4>Payment Method</h4>
            <div class="payment-methods">
              <div
                v-for="(method, index) in paymentMethods"
                :key="index"
                class="payment-method"
                :class="{ 'selected': selectedPaymentMethod === index }"
                @click="selectedPaymentMethod = index"
              >
                <div class="payment-method-icon">
                  <span
                    class="material-symbols-outlined"
                    v-if="method.type === 'card'"
                  >
                    credit_card
                  </span>
                  <span
                    class="material-symbols-outlined"
                    v-else-if="method.type === 'paypal'"
                  >
                    account_balance_wallet
                  </span>
                  <span
                    class="material-symbols-outlined"
                    v-else
                  >
                    account_balance
                  </span>
                </div>
                <div class="payment-method-details">
                  <div class="payment-method-name">{{ method.name }}</div>
                  <div class="payment-method-info">{{ method.info }}</div>
                  <div v-if="method.isDefault" class="default-badge">Default</div>
                </div>
                <div class="payment-method-selector">
                  <span
                    class="material-symbols-outlined"
                    v-if="selectedPaymentMethod === index"
                  >
                    radio_button_checked
                  </span>
                  <span class="material-symbols-outlined" v-else>radio_button_unchecked</span>
                </div>
              </div>

              <button class="add-payment-method" @click="showAddPaymentMethodModal = true">
                <span class="material-symbols-outlined">add</span>
                Add Payment Method
              </button>
            </div>

            <!-- Coupon Code -->
            <div class="coupon-section">
              <h4>Coupon Code</h4>
              <div class="coupon-input">
                <input
                  type="text"
                  v-model="couponCode"
                  placeholder="Enter coupon code"
                  :disabled="isValidatingCoupon || couponDiscount"
                />
                <button
                  @click="validateCouponCode"
                  :disabled="!couponCode || isValidatingCoupon || couponDiscount"
                  class="apply-coupon-btn"
                >
                  <span v-if="isValidatingCoupon">Validating...</span>
                  <span v-else-if="couponDiscount">Applied</span>
                  <span v-else>Apply</span>
                </button>
              </div>
              <div v-if="couponDiscount" class="coupon-applied">
                <span v-if="couponDiscount.type === 'percentage'">
                  {{ couponDiscount.value }}% discount applied
                </span>
                <span v-else-if="couponDiscount.type === 'amount'">
                  ${{ couponDiscount.value }} discount applied
                </span>
              </div>
            </div>

            <!-- Price Summary -->
            <div class="price-summary">
              <div class="summary-row">
                <span>Subscription Price:</span>
                <span>${{ getPlanPrice(selectedPlan) }}</span>
              </div>
              <div v-if="couponDiscount" class="summary-row discount">
                <span>Discount:</span>
                <span>
                  <span v-if="couponDiscount.type === 'percentage'">
                    -${{ (getPlanPrice(selectedPlan) * couponDiscount.value / 100).toFixed(2) }}
                  </span>
                  <span v-else-if="couponDiscount.type === 'amount'">
                    -${{ Math.min(couponDiscount.value, getPlanPrice(selectedPlan)).toFixed(2) }}
                  </span>
                </span>
              </div>
              <div class="summary-row total">
                <span>Total:</span>
                <span>${{ calculatedPrice }}</span>
              </div>
            </div>
          </div>
          
          <div class="modal-actions">
            <button class="cancel-btn" @click="showConfirmationModal = false">Cancel</button>
            <button 
              class="confirm-btn hover-effect" 
              @click="confirmPlanChange"
              :disabled="isUpgrade && selectedPaymentMethod === null"
            >
              Confirm {{ upgradeOrDowngrade }}
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Cancel Subscription Modal -->
    <div v-if="showCancelModal" class="modal-overlay" @click.self="showCancelModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Cancel Subscription</h3>
          <button class="close-btn" @click="showCancelModal = false">&times;</button>
        </div>
        <div class="modal-body">
          <div class="cancel-warning">
            <span class="material-symbols-outlined warning-icon">warning</span>
            <p>Are you sure you want to cancel your subscription?</p>
          </div>

          <p>By canceling your subscription:</p>
          <ul class="cancel-consequences">
            <li>You'll maintain access to premium features until the end of your current billing period</li>
            <li>After that, your account will revert to the Free plan</li>
            <li>You'll lose access to all premium features and limits will be applied to your projects</li>
          </ul>

          <div class="feedback-section">
            <h4>Help us improve</h4>
            <p>We'd appreciate knowing why you're canceling:</p>
            <select v-model="cancelReason" class="cancel-reason-select">
              <option value="">Select a reason...</option>
              <option value="too_expensive">Too expensive</option>
              <option value="not_using">Not using the app enough</option>
              <option value="missing_features">Missing features</option>
              <option value="switched">Switched to a different solution</option>
              <option value="bugs">Too many bugs/issues</option>
              <option value="other">Other</option>
            </select>

            <textarea
              v-if="cancelReason === 'other' || cancelReason === 'missing_features' || cancelReason === 'bugs'"
              v-model="cancelFeedback"
              placeholder="Please tell us more..."
              class="cancel-feedback"
            ></textarea>
          </div>

          <div class="modal-actions">
            <button class="back-btn" @click="showCancelModal = false">Go Back</button>
            <button
              class="confirm-cancel-btn"
              @click="confirmCancel"
              :disabled="!cancelReason || isLoading"
            >
              <span v-if="isLoading">Processing...</span>
              <span v-else>Cancel Subscription</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Payment Method Modal -->
    <div v-if="showAddPaymentMethodModal" class="modal-overlay" @click.self="showAddPaymentMethodModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Add Payment Method</h3>
          <button class="close-btn" @click="showAddPaymentMethodModal = false">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Payment Type</label>
            <div class="payment-type-selector">
              <div
                class="payment-type-option"
                :class="{ 'selected': newPaymentMethod.type === 'card' }"
                @click="newPaymentMethod.type = 'card'"
              >
                <span class="material-symbols-outlined">credit_card</span>
                <span>Credit Card</span>
              </div>
              <div
                class="payment-type-option"
                :class="{ 'selected': newPaymentMethod.type === 'paypal' }"
                @click="newPaymentMethod.type = 'paypal'"
              >
                <span class="material-symbols-outlined">account_balance_wallet</span>
                <span>PayPal</span>
              </div>
              <div
                class="payment-type-option"
                :class="{ 'selected': newPaymentMethod.type === 'bank_account' }"
                @click="newPaymentMethod.type = 'bank_account'"
              >
                <span class="material-symbols-outlined">account_balance</span>
                <span>Bank Account</span>
              </div>
            </div>
          </div>

          <div v-if="newPaymentMethod.type === 'card'" class="form-group">
            <label>Card Details</label>
            <input
              type="text"
              v-model="newPaymentMethod.name"
              placeholder="Name on Card"
              class="form-input"
            />
            <div class="card-detail-row">
              <input
                type="text"
                v-model="newPaymentMethod.lastFour"
                placeholder="Last 4 digits"
                class="form-input"
                maxlength="4"
              />
              <input
                type="text"
                v-model="newPaymentMethod.expiryDate"
                placeholder="MM/YY"
                class="form-input"
                maxlength="5"
              />
            </div>
          </div>

          <div v-else-if="newPaymentMethod.type === 'paypal'" class="form-group">
            <label>PayPal Details</label>
            <input
              type="email"
              v-model="newPaymentMethod.name"
              placeholder="PayPal Email"
              class="form-input"
            />
          </div>

          <div v-else class="form-group">
            <label>Bank Account Details</label>
            <input
              type="text"
              v-model="newPaymentMethod.name"
              placeholder="Account Name"
              class="form-input"
            />
            <input
              type="text"
              v-model="newPaymentMethod.lastFour"
              placeholder="Last 4 digits of account"
              class="form-input"
              maxlength="4"
            />
          </div>

          <div class="form-group checkbox">
            <input
              type="checkbox"
              id="default-payment-method"
              v-model="newPaymentMethod.isDefault"
            />
            <label for="default-payment-method">Set as default payment method</label>
          </div>

          <p class="form-note">
            <span class="material-symbols-outlined info-icon">info</span>
            This is a simulated payment form. In a production environment, this would use a secure payment processor like Stripe or PayPal.
          </p>

          <div class="modal-actions">
            <button class="cancel-btn" @click="showAddPaymentMethodModal = false">Cancel</button>
            <button
              class="confirm-btn"
              @click="addNewPaymentMethod"
              :disabled="isLoading || !newPaymentMethod.name || (newPaymentMethod.type === 'card' && (!newPaymentMethod.lastFour || !newPaymentMethod.expiryDate))"
            >
              <span v-if="isLoading">Adding...</span>
              <span v-else>Add Payment Method</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Payment History Modal -->
    <div v-if="showPaymentHistory" class="modal-overlay" @click.self="showPaymentHistory = false">
      <div class="modal-content payment-history-modal">
        <div class="modal-header">
          <h3>Payment History</h3>
          <button class="close-btn" @click="showPaymentHistory = false">&times;</button>
        </div>
        <div class="modal-body">
          <div v-if="paymentHistory.length === 0" class="empty-state">
            <span class="material-symbols-outlined">receipt_long</span>
            <p>No payment history found</p>
          </div>

          <div v-else class="payment-history-list">
            <div v-for="transaction in paymentHistory" :key="transaction.id" class="payment-history-item">
              <div class="payment-history-details">
                <div class="payment-date">
                  {{ formatDate(transaction.createdAt.toDate()) }}
                </div>
                <div class="payment-info">
                  <div class="payment-plan">
                    {{ formatPlanName(transaction.subscriptionPlan) }} Plan ({{ transaction.billingCycle }})
                  </div>
                  <div class="payment-status" :class="transaction.status">
                    {{ transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1) }}
                  </div>
                </div>
              </div>
              <div class="payment-amount">
                ${{ transaction.amount.toFixed(2) }}
              </div>
              <div class="payment-actions">
                <a
                  v-if="transaction.receiptUrl"
                  :href="transaction.receiptUrl"
                  target="_blank"
                  class="receipt-link"
                >
                  <span class="material-symbols-outlined">receipt</span>
                  Receipt
                </a>
              </div>
            </div>
          </div>

          <div class="modal-actions">
            <button class="close-btn" @click="showPaymentHistory = false">Close</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useUserStore } from '@/stores/userStore';
import { useErrorStore } from '@/stores/errorStore';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/fbConfig';
import { paymentService } from '@/services/paymentService';
import { PaymentMethod } from '@/types';
import { Timestamp } from 'firebase/firestore';

// Stores
const userStore = useUserStore();
const errorStore = useErrorStore();

// State
const yearlyBilling = ref(false);
const userSubscription = ref('free');
const showConfirmationModal = ref(false);
const showCancelModal = ref(false);
const selectedPlan = ref(null);
const selectedPaymentMethod = ref(null);
const cancelReason = ref('');
const cancelFeedback = ref('');
const isLoading = ref(false);
const showAddPaymentMethodModal = ref(false);
const paymentMethods = ref([]);
const showPaymentHistory = ref(false);
const paymentHistory = ref([]);
const couponCode = ref('');
const couponDiscount = ref(null);
const isValidatingCoupon = ref(false);

// New payment method form
const newPaymentMethod = ref({
  type: 'card',
  name: '',
  lastFour: '',
  expiryDate: '',
  isDefault: true
});

// Subscription details
const subscriptionDetails = ref({
  billingCycle: 'Monthly',
  nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
  isActive: true
});

// Pricing data
const planPrices = {
  free: { monthly: 0, yearly: 0 },
  standard: { monthly: 9.99, yearly: 99.99 },
  premium: { monthly: 19.99, yearly: 199.99 },
  professional: { monthly: 49.99, yearly: 499.99 }
};

// Computed properties
const isUpgrade = computed(() => {
  const planOrder = ['free', 'standard', 'premium', 'professional'];
  return planOrder.indexOf(selectedPlan.value) > planOrder.indexOf(userSubscription.value);
});

const isDowngrade = computed(() => {
  const planOrder = ['free', 'standard', 'premium', 'professional'];
  return planOrder.indexOf(selectedPlan.value) < planOrder.indexOf(userSubscription.value);
});

const upgradeOrDowngrade = computed(() => {
  if (isUpgrade.value) return 'Upgrade';
  if (isDowngrade.value) return 'Downgrade';
  return 'Change';
});

const hasPaymentMethods = computed(() => {
  return paymentMethods.value.length > 0;
});

const calculatedPrice = computed(() => {
  if (!selectedPlan.value || selectedPlan.value === 'free') return 0;

  let basePrice = yearlyBilling.value ? planPrices[selectedPlan.value].yearly : planPrices[selectedPlan.value].monthly;

  // Apply coupon discount if available
  if (couponDiscount.value) {
    if (couponDiscount.value.type === 'percentage') {
      basePrice = basePrice * (1 - couponDiscount.value.value / 100);
    } else if (couponDiscount.value.type === 'amount') {
      basePrice = Math.max(0, basePrice - couponDiscount.value.value);
    }
  }

  return basePrice.toFixed(2);
});

// Methods
async function selectPlan(plan) {
  selectedPlan.value = plan;

  // If upgrading, fetch payment methods
  if (isUpgrade.value && plan !== 'free') {
    await loadPaymentMethods();
  }

  showConfirmationModal.value = true;

  // Reset payment method selection only for upgrades
  if (isUpgrade.value) {
    const defaultMethod = paymentMethods.value.find(m => m.isDefault);
    if (defaultMethod) {
      selectedPaymentMethod.value = paymentMethods.value.indexOf(defaultMethod);
    } else {
      selectedPaymentMethod.value = paymentMethods.value.length > 0 ? 0 : null;
    }
  } else {
    // For downgrades, no payment method selection is needed
    selectedPaymentMethod.value = null;
  }

  // Reset coupon code
  couponCode.value = '';
  couponDiscount.value = null;
}

function formatPlanName(plan) {
  if (!plan) return '';
  return plan.charAt(0).toUpperCase() + plan.slice(1);
}

function formatDate(date) {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function getPlanPrice(plan) {
  if (!plan || plan === 'free') return 0;
  return yearlyBilling.value ? planPrices[plan].yearly : planPrices[plan].monthly;
}

async function loadPaymentMethods() {
  try {
    isLoading.value = true;
    const methods = await paymentService.getUserPaymentMethods();
    paymentMethods.value = methods;
  } catch (error) {
    errorStore.showError('Failed to load payment methods: ' + error.message);
  } finally {
    isLoading.value = false;
  }
}

async function loadPaymentHistory() {
  try {
    isLoading.value = true;
    const history = await paymentService.getPaymentHistory();
    paymentHistory.value = history;
    showPaymentHistory.value = true;
  } catch (error) {
    errorStore.showError('Failed to load payment history: ' + error.message);
  } finally {
    isLoading.value = false;
  }
}

async function validateCouponCode() {
  if (!couponCode.value) return;

  try {
    isValidatingCoupon.value = true;
    const result = await paymentService.checkCouponCode(couponCode.value);

    if (result.valid) {
      if (result.discountPercentage) {
        couponDiscount.value = {
          type: 'percentage',
          value: result.discountPercentage
        };
        errorStore.showError(`Coupon applied: ${result.discountPercentage}% off`);
      } else if (result.discountAmount) {
        couponDiscount.value = {
          type: 'amount',
          value: result.discountAmount
        };
        errorStore.showError(`Coupon applied: $${result.discountAmount} off`);
      }
    } else {
      couponDiscount.value = null;
      errorStore.showError(result.error || 'Invalid coupon code');
    }
  } catch (error) {
    errorStore.showError('Failed to validate coupon: ' + error.message);
  } finally {
    isValidatingCoupon.value = false;
  }
}

async function addNewPaymentMethod() {
  try {
    isLoading.value = true;

    // Validate form
    if (!newPaymentMethod.value.name) {
      errorStore.showError('Payment method name is required');
      return;
    }

    if (newPaymentMethod.value.type === 'card') {
      if (!newPaymentMethod.value.lastFour || !newPaymentMethod.value.expiryDate) {
        errorStore.showError('Card details are required');
        return;
      }
    }

    // Format the payment method data
    let info = '';
    if (newPaymentMethod.value.type === 'card') {
      info = `Expires ${newPaymentMethod.value.expiryDate}`;
    } else if (newPaymentMethod.value.type === 'paypal') {
      info = newPaymentMethod.value.name.includes('@') ? newPaymentMethod.value.name : 'PayPal Account';
    }

    // Add the payment method
    await paymentService.addPaymentMethod({
      type: newPaymentMethod.value.type,
      name: newPaymentMethod.value.name,
      info,
      isDefault: newPaymentMethod.value.isDefault,
      lastFour: newPaymentMethod.value.lastFour,
      expiryDate: newPaymentMethod.value.expiryDate
    });

    // Reload payment methods
    await loadPaymentMethods();

    // Close modal and reset form
    showAddPaymentMethodModal.value = false;
    newPaymentMethod.value = {
      type: 'card',
      name: '',
      lastFour: '',
      expiryDate: '',
      isDefault: true
    };

    errorStore.showError('Payment method added successfully');
  } catch (error) {
    errorStore.showError('Failed to add payment method: ' + error.message);
  } finally {
    isLoading.value = false;
  }
}

async function deletePaymentMethod(methodId) {
  try {
    if (confirm('Are you sure you want to delete this payment method?')) {
      isLoading.value = true;
      await paymentService.deletePaymentMethod(methodId);
      await loadPaymentMethods();
      errorStore.showError('Payment method deleted successfully');
    }
  } catch (error) {
    errorStore.showError('Failed to delete payment method: ' + error.message);
  } finally {
    isLoading.value = false;
  }
}

async function setDefaultPaymentMethod(methodId) {
  try {
    isLoading.value = true;
    await paymentService.updatePaymentMethod(methodId, { isDefault: true });
    await loadPaymentMethods();
    errorStore.showError('Default payment method updated');
  } catch (error) {
    errorStore.showError('Failed to update payment method: ' + error.message);
  } finally {
    isLoading.value = false;
  }
}

async function confirmPlanChange() {
  try {
    isLoading.value = true;

    // For free plan, no payment processing needed
    if (selectedPlan.value === 'free') {
      await userStore.updateSubscription(selectedPlan.value);
      showConfirmationModal.value = false;
      userSubscription.value = selectedPlan.value;
      errorStore.showError(`Successfully downgraded to Free plan`);
      selectedPlan.value = null;
      return;
    }

    // For paid plans, validate payment method
    if (isUpgrade.value && selectedPaymentMethod.value === null) {
      errorStore.showError('Please select a payment method');
      return;
    }

    // Get the selected payment method ID
    const paymentMethodId = isUpgrade.value ?
      paymentMethods.value[selectedPaymentMethod.value].id :
      null;

    // Subscribe to the plan
    const result = await paymentService.subscribeToPlan(
      selectedPlan.value,
      yearlyBilling.value ? 'yearly' : 'monthly',
      paymentMethodId
    );

    if (result.success) {
      // Close the confirmation modal
      showConfirmationModal.value = false;

      // Update the local state
      userSubscription.value = selectedPlan.value;

      // Check subscription details with the cloud function
      await userStore.checkSubscription();

      // Show success message
      if (isUpgrade.value) {
        errorStore.showError(`Successfully upgraded to ${formatPlanName(selectedPlan.value)} plan`);
      } else {
        errorStore.showError(`Successfully changed to ${formatPlanName(selectedPlan.value)} plan`);
      }

      // Reset the selection
      selectedPlan.value = null;
    } else {
      errorStore.showError(`Failed to change subscription: ${result.error}`);
    }
  } catch (error) {
    errorStore.showError('Failed to process subscription change: ' + error.message);
  } finally {
    isLoading.value = false;
  }
}

function confirmCancelSubscription() {
  showCancelModal.value = true;
}

async function confirmCancel() {
  try {
    isLoading.value = true;

    if (!cancelReason.value) {
      errorStore.showError('Please select a reason for cancellation');
      return;
    }

    // Call the payment service to cancel
    const result = await paymentService.cancelSubscription(
      cancelReason.value,
      cancelFeedback.value
    );

    if (result.success) {
      // Close the cancel modal
      showCancelModal.value = false;

      // Update the local state - subscription will remain active until end date
      subscriptionDetails.value.isActive = false;

      // Refresh subscription state
      await userStore.checkSubscription();

      // Show success message
      errorStore.showError('Your subscription has been canceled. You will have access until the end of your current billing period.');

      // Reset the form
      cancelReason.value = '';
      cancelFeedback.value = '';
    } else {
      errorStore.showError(`Failed to cancel subscription: ${result.error}`);
    }
  } catch (error) {
    errorStore.showError('Failed to cancel subscription: ' + error.message);
  } finally {
    isLoading.value = false;
  }
}

// Lifecycle hooks
onMounted(async () => {
  // Get the user's current subscription
  if (userStore.currentUser) {
    userSubscription.value = userStore.currentUser.subscriptionType || 'free';

    // Set the billing cycle based on user's current subscription
    if (userStore.currentUser.subscriptionBillingCycle === 'yearly') {
      yearlyBilling.value = true;
    }

    // Load subscription details
    if (userStore.currentUser.subscriptionEndDate) {
      subscriptionDetails.value = {
        billingCycle: userStore.currentUser.subscriptionBillingCycle === 'yearly' ? 'Yearly' : 'Monthly',
        nextBillingDate: userStore.currentUser.subscriptionEndDate.toDate(),
        isActive: userStore.currentUser.subscriptionStatus === 'active'
      };
    }

    // Check subscription details with the cloud function
    try {
      const checkSubscription = httpsCallable(functions, 'checkSubscription');
      const result = await checkSubscription();

      if (result.data) {
        // Update subscription details
        subscriptionDetails.value = {
          billingCycle: result.data.billingCycle || 'Monthly',
          nextBillingDate: result.data.nextBillingDate ? new Date(result.data.nextBillingDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          isActive: result.data.isActive
        };
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
    }

    // Load payment methods if user has a paid subscription
    if (userSubscription.value !== 'free') {
      await loadPaymentMethods();
    }
  }
});
</script>

<style scoped>
.subscription-manager {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.subscription-header {
  text-align: center;
  margin-bottom: 40px;
}

.subscription-header h2 {
  font-size: 2.2rem;
  color: #1a202c;
  margin-bottom: 12px;
  font-weight: 700;
}

.subscription-header p {
  font-size: 1.2rem;
  color: #4a5568;
  max-width: 600px;
  margin: 0 auto;
}

.subscription-wrapper {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  padding: 40px;
}

/* Billing Toggle */
.billing-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 40px;
  position: relative;
}

.billing-toggle span {
  margin: 0 12px;
  color: #718096;
  font-weight: 500;
  transition: color 0.2s ease;
}

.billing-toggle span.active {
  color: #1a202c;
  font-weight: 600;
}

.switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 30px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #e2e8f0;
  transition: .4s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 22px;
  width: 22px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: .4s;
}

input:checked + .slider {
  background-color: #4fd1c5;
}

input:focus + .slider {
  box-shadow: 0 0 1px #4fd1c5;
}

input:checked + .slider:before {
  transform: translateX(30px);
}

.slider.round {
  border-radius: 34px;
}

.slider.round:before {
  border-radius: 50%;
}

.discount-badge {
  position: absolute;
  right: -60px;
  top: 0;
  background-color: #ffeaa7;
  color: #b7791f;
  font-size: 0.8rem;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 4px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(253, 224, 71, 0.4);
  }
  70% {
    box-shadow: 0 0 0 6px rgba(253, 224, 71, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(253, 224, 71, 0);
  }
}

/* Subscription Plans */
.subscription-plans {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
}

.plan-card {
  background-color: #f8fafc;
  border-radius: 12px;
  padding: 30px;
  border: 2px solid transparent;
  transition: all 0.3s ease;
  position: relative;
  display: flex;
  flex-direction: column;
}

.plan-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.plan-card.current-plan {
  border-color: #4fd1c5;
  box-shadow: 0 4px 12px rgba(79, 209, 197, 0.2);
}

.popular-badge {
  position: absolute;
  top: -12px;
  right: 20px;
  background-color: #4fd1c5;
  color: white;
  font-size: 0.8rem;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 20px;
  box-shadow: 0 2px 4px rgba(79, 209, 197, 0.3);
}

.plan-header {
  text-align: center;
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid #e2e8f0;
}

.plan-header h3 {
  font-size: 1.5rem;
  color: #1a202c;
  margin-bottom: 16px;
  font-weight: 600;
}

.plan-price {
  margin-bottom: 12px;
}

.price {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1a202c;
}

.period {
  font-size: 1rem;
  color: #718096;
}

.plan-description {
  color: #4a5568;
  font-size: 0.95rem;
  line-height: 1.5;
  margin: 0;
}

.plan-features {
  list-style: none;
  padding: 0;
  margin: 0 0 24px;
  flex: 1;
}

.plan-features li {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  color: #1a202c;
  font-size: 0.95rem;
}

.plan-features li .material-symbols-outlined {
  margin-right: 12px;
  font-size: 20px;
}

.included .material-symbols-outlined {
  color: #48bb78;
}

.not-included {
  color: #a0aec0;
}

.not-included .material-symbols-outlined {
  color: #cbd5e0;
}

.select-plan-btn, .current-plan-btn {
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  text-align: center;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.select-plan-btn {
  background-color: #4fd1c5;
  color: white;
}

.select-plan-btn:hover {
  background-color: #38b2ac;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.select-plan-btn.free-plan {
  background-color: #e2e8f0;
  color: #4a5568;
}

.select-plan-btn.free-plan:hover {
  background-color: #cbd5e0;
}

.current-plan-btn {
  background-color: #e6fffa;
  color: #38b2ac;
  cursor: default;
}

/* Current Subscription Info */
.current-subscription-info {
  background-color: #f8fafc;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid #e2e8f0;
  margin-top: 40px;
}

.subscription-details h4 {
  font-size: 1.1rem;
  color: #1a202c;
  margin: 0 0 16px;
  font-weight: 600;
}

.detail-row {
  display: flex;
  margin-bottom: 8px;
  font-size: 0.95rem;
  color: #4a5568;
}

.detail-row span:first-child {
  width: 150px;
  font-weight: 500;
}

.detail-row .value {
  color: #1a202c;
}

.detail-row .status {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 500;
}

.detail-row .status.active {
  background-color: #f0fff4;
  color: #38a169;
}

.cancel-subscription-btn {
  padding: 10px 20px;
  background-color: #fff5f5;
  color: #e53e3e;
  border: 1px solid #fed7d7;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-subscription-btn:hover {
  background-color: #fed7d7;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 20px 25px rgba(0, 0, 0, 0.1);
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  animation: modalFadeIn 0.3s ease;
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.3rem;
  color: #1a202c;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #a0aec0;
  cursor: pointer;
  line-height: 1;
  transition: color 0.2s ease;
}

.close-btn:hover {
  color: #4a5568;
}

.modal-body {
  padding: 24px;
}

.modal-body p {
  margin: 0 0 16px;
  line-height: 1.6;
  color: #4a5568;
}

.modal-body p strong {
  color: #1a202c;
}

/* Payment Methods */
.payment-methods {
  margin-top: 16px;
}

.payment-method {
  display: flex;
  align-items: center;
  padding: 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.payment-method.selected {
  border-color: #4fd1c5;
  background-color: #e6fffa;
}

.payment-method:hover:not(.selected) {
  background-color: #f7fafc;
}

.payment-method-icon {
  margin-right: 16px;
}

.payment-method-icon .material-symbols-outlined {
  font-size: 24px;
  color: #4a5568;
}

.payment-method-details {
  flex: 1;
}

.payment-method-name {
  font-weight: 500;
  color: #1a202c;
  margin-bottom: 4px;
}

.payment-method-info {
  font-size: 0.85rem;
  color: #718096;
}

.payment-method-selector {
  color: #4fd1c5;
}

.add-payment-method {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 12px;
  background: none;
  border: 1px dashed #cbd5e0;
  border-radius: 8px;
  color: #4a5568;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-payment-method:hover {
  background-color: #f7fafc;
  border-color: #a0aec0;
}

.add-payment-method .material-symbols-outlined {
  margin-right: 8px;
}

/* Payment Method Card Styles */
.payment-methods-list {
  margin-top: 30px;
  border-top: 1px solid #e2e8f0;
  padding-top: 24px;
}

.payment-methods-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.payment-method-card {
  background-color: #f7fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
  transition: all 0.3s ease;
}

.payment-method-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.payment-method-card.default {
  border-color: #4fd1c5;
  background-color: #e6fffa;
}

.payment-method-card-header {
  background-color: #edf2f7;
  padding: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #e2e8f0;
  position: relative;
}

.payment-method-card.default .payment-method-card-header {
  background-color: #4fd1c5;
  color: white;
}

.default-method-badge {
  position: absolute;
  top: 4px;
  right: 4px;
  background-color: #38b2ac;
  color: white;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
}

.payment-method-card-body {
  padding: 16px;
}

.payment-method-name {
  font-weight: 600;
  margin-bottom: 4px;
  color: #2d3748;
}

.payment-method-card.default .payment-method-name {
  color: #285e61;
}

.payment-method-info {
  font-size: 0.85rem;
  color: #718096;
}

.payment-method-card-actions {
  padding: 12px;
  display: flex;
  justify-content: space-between;
  border-top: 1px solid #e2e8f0;
}

.set-default-btn {
  background-color: #e6fffa;
  color: #38b2ac;
  border: 1px solid #b2f5ea;
  padding: 6px 10px;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.set-default-btn:hover {
  background-color: #b2f5ea;
}

.delete-method-btn {
  background-color: #fff5f5;
  color: #e53e3e;
  border: 1px solid #fed7d7;
  padding: 6px 10px;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.delete-method-btn:hover {
  background-color: #fed7d7;
}

/* Additional Subscription Actions Styles */
.subscription-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.view-payment-history-btn,
.manage-payment-methods-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 12px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
}

.view-payment-history-btn {
  background-color: #ebf8ff;
  color: #3182ce;
  border: 1px solid #bee3f8;
}

.view-payment-history-btn:hover {
  background-color: #bee3f8;
}

.manage-payment-methods-btn {
  background-color: #e6fffa;
  color: #38b2ac;
  border: 1px solid #b2f5ea;
}

.manage-payment-methods-btn:hover {
  background-color: #b2f5ea;
}

.subscription-actions .material-symbols-outlined {
  margin-right: 6px;
  font-size: 18px;
}

/* Form Styles for Add Payment Method */
.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #2d3748;
}

.form-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.95rem;
  margin-bottom: 10px;
}

.form-input:focus {
  outline: none;
  border-color: #4fd1c5;
  box-shadow: 0 0 0 2px rgba(79, 209, 197, 0.2);
}

.card-detail-row {
  display: flex;
  gap: 10px;
}

.card-detail-row .form-input {
  flex: 1;
}

.form-group.checkbox {
  display: flex;
  align-items: center;
}

.form-group.checkbox input {
  margin-right: 10px;
}

.form-note {
  background-color: #f7fafc;
  padding: 12px;
  border-radius: 6px;
  font-size: 0.85rem;
  color: #718096;
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.info-icon {
  margin-right: 8px;
  font-size: 18px;
  color: #4a5568;
}

/* Payment Type Selector */
.payment-type-selector {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
}

.payment-type-option {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 14px 10px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.payment-type-option.selected {
  border-color: #4fd1c5;
  background-color: #e6fffa;
}

.payment-type-option .material-symbols-outlined {
  font-size: 24px;
  margin-bottom: 8px;
}

.payment-type-option span:last-child {
  font-size: 0.85rem;
  font-weight: 500;
}

/* Payment History Modal */
.payment-history-modal {
  max-width: 700px;
}

.payment-history-list {
  margin-top: 16px;
}

.payment-history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #e2e8f0;
}

.payment-history-item:last-child {
  border-bottom: none;
}

.payment-date {
  font-size: 0.9rem;
  color: #718096;
  margin-bottom: 4px;
}

.payment-plan {
  font-weight: 500;
  margin-bottom: 4px;
}

.payment-status {
  font-size: 0.8rem;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 12px;
  display: inline-block;
}

.payment-status.completed {
  background-color: #f0fff4;
  color: #38a169;
}

.payment-status.pending {
  background-color: #fffaf0;
  color: #dd6b20;
}

.payment-status.failed {
  background-color: #fff5f5;
  color: #e53e3e;
}

.payment-status.refunded {
  background-color: #ebf8ff;
  color: #3182ce;
}

.payment-amount {
  font-weight: 600;
  font-size: 1.1rem;
  color: #2d3748;
}

.receipt-link {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #4fd1c5;
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 500;
}

.receipt-link:hover {
  text-decoration: underline;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #a0aec0;
}

.empty-state .material-symbols-outlined {
  font-size: 48px;
  margin-bottom: 16px;
}

/* Coupon Section */
.coupon-section {
  margin-top: 20px;
  margin-bottom: 20px;
}

.coupon-input {
  display: flex;
  margin-top: 8px;
}

.coupon-input input {
  flex: 1;
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px 0 0 6px;
  font-size: 0.95rem;
}

.apply-coupon-btn {
  padding: 10px 16px;
  background-color: #4fd1c5;
  color: white;
  border: none;
  border-radius: 0 6px 6px 0;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.apply-coupon-btn:hover:not(:disabled) {
  background-color: #38b2ac;
}

.apply-coupon-btn:disabled {
  background-color: #cbd5e0;
  cursor: not-allowed;
}

.coupon-applied {
  margin-top: 8px;
  font-size: 0.9rem;
  color: #38a169;
  display: flex;
  align-items: center;
}

/* Price Summary */
.price-summary {
  margin-top: 20px;
  padding: 16px;
  background-color: #f7fafc;
  border-radius: 8px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 0.95rem;
}

.summary-row.discount {
  color: #38a169;
}

.summary-row.total {
  border-top: 1px solid #e2e8f0;
  padding-top: 8px;
  margin-top: 8px;
  font-weight: 600;
  font-size: 1.1rem;
}

/* Default Badge */
.default-badge {
  font-size: 0.7rem;
  background-color: #38b2ac;
  color: white;
  padding: 2px 6px;
  border-radius: 10px;
  margin-top: 4px;
  display: inline-block;
}

/* Modal Actions */
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.cancel-btn, .back-btn {
  padding: 12px 24px;
  background-color: #edf2f7;
  color: #4a5568;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-btn:hover, .back-btn:hover {
  background-color: #e2e8f0;
}

.confirm-btn {
  padding: 12px 24px;
  background-color: #4fd1c5;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.confirm-btn:hover:not(:disabled) {
  background-color: #38b2ac;
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.confirm-btn:disabled {
  background-color: #cbd5e0;
  cursor: not-allowed;
}

/* Cancel Subscription Modal */
.cancel-warning {
  display: flex;
  align-items: center;
  padding: 16px;
  background-color: #fff5f5;
  border-radius: 8px;
  margin-bottom: 20px;
}

.warning-icon {
  font-size: 24px;
  color: #e53e3e;
  margin-right: 12px;
}

.cancel-warning p {
  margin: 0;
  color: #c53030;
  font-weight: 500;
}

.cancel-consequences {
  padding-left: 20px;
  margin-bottom: 24px;
  color: #4a5568;
}

.cancel-consequences li {
  margin-bottom: 8px;
  line-height: 1.5;
}

.feedback-section h4 {
  font-size: 1.1rem;
  color: #1a202c;
  margin: 0 0 8px;
}

.cancel-reason-select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  margin-bottom: 16px;
  color: #4a5568;
}

.cancel-feedback {
  width: 100%;
  min-height: 100px;
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  resize: vertical;
}

.confirm-cancel-btn {
  padding: 12px 24px;
  background-color: #e53e3e;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.confirm-cancel-btn:hover:not(:disabled) {
  background-color: #c53030;
}

.confirm-cancel-btn:disabled {
  background-color: #fed7d7;
  cursor: not-allowed;
}

/* Responsive Styling */
@media (max-width: 768px) {
  .subscription-wrapper {
    padding: 20px;
  }
  
  .subscription-plans {
    grid-template-columns: 1fr;
  }
  
  .current-subscription-info {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .subscription-details {
    margin-bottom: 20px;
  }
  
  .modal-content {
    width: 95%;
    max-width: 95%;
  }
  
  .billing-toggle {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .discount-badge {
    position: static;
    margin-top: 10px;
  }
}
</style>