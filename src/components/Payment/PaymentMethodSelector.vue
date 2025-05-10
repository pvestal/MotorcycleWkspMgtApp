<template>
  <div class="payment-method-selector">
    <h3 class="payment-title">Select Payment Method</h3>
    
    <div class="payment-methods">
      <div 
        v-for="method in availablePaymentMethods" 
        :key="method.id" 
        class="payment-method-option"
        :class="{ 'selected': selectedMethod === method.id }"
        @click="selectPaymentMethod(method.id)"
      >
        <div class="payment-method-icon">
          <i :class="method.iconClass"></i>
        </div>
        <div class="payment-method-details">
          <div class="payment-method-name">{{ method.name }}</div>
          <div class="payment-method-description">{{ method.description }}</div>
        </div>
        <div class="payment-method-radio">
          <span class="radio-circle" :class="{ 'selected': selectedMethod === method.id }"></span>
        </div>
      </div>
    </div>
    
    <div v-if="selectedMethod" class="payment-method-form">
      <div v-if="selectedMethod === 'card'" class="card-payment-container">
        <StripePaymentForm 
          :amount="amount"
          :currency="currency"
          :description="description"
          @payment-success="handlePaymentSuccess"
          @payment-error="handlePaymentError"
          @token-generated="handleTokenGenerated"
        />
      </div>
      
      <div v-else-if="selectedMethod === 'paypal'" class="paypal-payment-container">
        <PayPalPaymentForm
          :amount="amount"
          :currency="currency"
          :description="description"
          :plan-type="planType"
          :billing-cycle="billingCycle"
          @payment-success="handlePaymentSuccess"
          @payment-error="handlePaymentError"
          @payment-cancelled="handlePaymentCancelled"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, defineProps, defineEmits } from 'vue';
import { paymentConfig } from '@/config/payment';
import StripePaymentForm from './StripePaymentForm.vue';
import PayPalPaymentForm from './PayPalPaymentForm.vue';
import { useErrorStore } from '@/stores/errorStore';
import { loadStripe } from '@stripe/stripe-js';

// Props
const props = defineProps({
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'USD'
  },
  description: {
    type: String,
    default: 'Subscription Payment'
  },
  planType: {
    type: String,
    default: 'standard'
  },
  billingCycle: {
    type: String,
    default: 'monthly'
  }
});

// Emits
const emit = defineEmits(['payment-success', 'payment-error', 'payment-cancelled', 'token-generated']);

// State
const selectedMethod = ref(null);
const errorStore = useErrorStore();

// Available payment methods based on configuration
const availablePaymentMethods = computed(() => {
  const methods = [];
  
  if (paymentConfig.enabledMethods.stripe) {
    methods.push({
      id: 'card',
      name: 'Credit or Debit Card',
      description: 'Pay securely with your card',
      iconClass: 'material-symbols-outlined',
      icon: 'credit_card'
    });
  }
  
  if (paymentConfig.enabledMethods.paypal) {
    methods.push({
      id: 'paypal',
      name: 'PayPal',
      description: 'Pay with your PayPal account',
      iconClass: 'material-symbols-outlined',
      icon: 'account_balance_wallet'
    });
  }
  
  return methods;
});

// Select a payment method
const selectPaymentMethod = (methodId) => {
  selectedMethod.value = methodId;
};

// Handle successful payment
const handlePaymentSuccess = (paymentDetails) => {
  emit('payment-success', {
    method: selectedMethod.value,
    details: paymentDetails
  });
};

// Handle payment error
const handlePaymentError = (error) => {
  errorStore.showError(`Payment error: ${error.message || 'Unknown error'}`);
  emit('payment-error', {
    method: selectedMethod.value,
    error
  });
};

// Handle payment cancellation
const handlePaymentCancelled = (cancelDetails) => {
  emit('payment-cancelled', {
    method: selectedMethod.value,
    details: cancelDetails
  });
};

// Handle token generation (for Stripe)
const handleTokenGenerated = (tokenData) => {
  emit('token-generated', {
    method: 'card',
    token: tokenData
  });
};

// Set default payment method
if (availablePaymentMethods.value.length > 0) {
  selectedMethod.value = availablePaymentMethods.value[0].id;
}
</script>

<style scoped>
.payment-method-selector {
  width: 100%;
}

.payment-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 16px;
}

.payment-methods {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.payment-method-option {
  display: flex;
  align-items: center;
  padding: 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background-color: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.payment-method-option:hover {
  background-color: #f7fafc;
  border-color: #cbd5e0;
}

.payment-method-option.selected {
  border-color: #4fd1c5;
  background-color: #e6fffa;
  box-shadow: 0 2px 4px rgba(79, 209, 197, 0.1);
}

.payment-method-icon {
  margin-right: 16px;
  font-size: 1.4rem;
  color: #4a5568;
}

.payment-method-option.selected .payment-method-icon {
  color: #38b2ac;
}

.payment-method-details {
  flex: 1;
}

.payment-method-name {
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 4px;
}

.payment-method-description {
  font-size: 0.9rem;
  color: #718096;
}

.payment-method-radio {
  display: flex;
  align-items: center;
  justify-content: center;
}

.radio-circle {
  width: 20px;
  height: 20px;
  border: 2px solid #cbd5e0;
  border-radius: 50%;
  position: relative;
  transition: all 0.2s ease;
}

.radio-circle.selected {
  border-color: #4fd1c5;
}

.radio-circle.selected:after {
  content: '';
  position: absolute;
  top: 4px;
  left: 4px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #4fd1c5;
}

.payment-method-form {
  margin-top: 24px;
  border-top: 1px solid #e2e8f0;
  padding-top: 24px;
}
</style>