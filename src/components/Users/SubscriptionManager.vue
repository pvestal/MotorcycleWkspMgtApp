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
          <button class="cancel-subscription-btn" @click="confirmCancelSubscription">
            Cancel Subscription
          </button>
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
                </div>
                <div class="payment-method-details">
                  <div class="payment-method-name">{{ method.name }}</div>
                  <div class="payment-method-info">{{ method.info }}</div>
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
              
              <button class="add-payment-method">
                <span class="material-symbols-outlined">add</span>
                Add Payment Method
              </button>
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
              :disabled="!cancelReason"
            >
              Cancel Subscription
            </button>
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

// Mock subscription details (in a real app, this would come from the backend)
const subscriptionDetails = ref({
  billingCycle: 'Monthly',
  nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
  isActive: true
});

// Mock payment methods (in a real app, these would come from the user's stored payment methods)
const paymentMethods = ref([
  { 
    type: 'card',
    name: 'Visa ****4567', 
    info: 'Expires 09/26'
  },
  { 
    type: 'paypal',
    name: 'PayPal', 
    info: 'example@email.com'
  }
]);

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

// Methods
function selectPlan(plan) {
  selectedPlan.value = plan;
  showConfirmationModal.value = true;
  
  // Reset payment method selection only for upgrades
  if (isUpgrade.value) {
    selectedPaymentMethod.value = paymentMethods.value.length > 0 ? 0 : null;
  } else {
    // For downgrades, no payment method selection is needed
    selectedPaymentMethod.value = null;
  }
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

function confirmPlanChange() {
  // In a real app, this would call your backend API to handle the subscription change
  // This is a mock implementation for demonstration
  
  // Call the cloud function
  const checkSubscription = httpsCallable(functions, 'checkSubscription');
  
  // Show a loading state or disable the button
  
  // Close the confirmation modal
  showConfirmationModal.value = false;
  
  // Update the local state
  userSubscription.value = selectedPlan.value;
  
  // Update the user's subscription in the store
  userStore.updateSubscription(selectedPlan.value, yearlyBilling.value ? 'yearly' : 'monthly');
  
  // Show success message
  if (isUpgrade.value) {
    errorStore.showError(`Successfully upgraded to ${formatPlanName(selectedPlan.value)} plan`);
  } else {
    errorStore.showError(`Successfully downgraded to ${formatPlanName(selectedPlan.value)} plan`);
  }
  
  // Reset the selection
  selectedPlan.value = null;
}

function confirmCancelSubscription() {
  showCancelModal.value = true;
}

function confirmCancel() {
  // In a real app, this would call your backend API to cancel the subscription
  // This is a mock implementation for demonstration
  
  // Close the cancel modal
  showCancelModal.value = false;
  
  // Update the local state
  subscriptionDetails.value.isActive = false;
  
  // Show success message
  errorStore.showError('Your subscription has been canceled. You will have access until the end of your current billing period.');
  
  // Reset the form
  cancelReason.value = '';
  cancelFeedback.value = '';
}

// Lifecycle hooks
onMounted(async () => {
  // Get the user's current subscription
  if (userStore.currentUser) {
    userSubscription.value = userStore.currentUser.subscriptionType || 'free';
    
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