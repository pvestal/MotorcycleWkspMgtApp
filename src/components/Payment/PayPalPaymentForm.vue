<template>
  <div class="paypal-payment-form">
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <span>Loading PayPal...</span>
    </div>
    
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
    
    <div id="paypal-button-container" ref="paypalButtonContainer"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, defineProps, defineEmits, watch } from 'vue';
import { loadScript } from '@paypal/paypal-js';
import { paypalConfig } from '@/config/payment';
import { useErrorStore } from '@/stores/errorStore';

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
    default: 'Payment'
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
const emit = defineEmits(['payment-success', 'payment-error', 'payment-cancelled']);

// State
const paypalButtonContainer = ref(null);
const loading = ref(true);
const error = ref('');

// Error store
const errorStore = useErrorStore();

// Initialize PayPal
const initPayPal = async () => {
  try {
    loading.value = true;
    
    // Load PayPal SDK
    const paypal = await loadScript({
      'client-id': paypalConfig.clientId,
      currency: props.currency,
      intent: 'capture',
      'disable-funding': paypalConfig.disableFunding.join(','),
      'enable-funding': paypalConfig.enableFunding.join(',')
    });
    
    if (paypal && paypalButtonContainer.value) {
      // Reset container before rendering
      paypalButtonContainer.value.innerHTML = '';

      // Initialize PayPal Buttons
      paypal.Buttons({
        // Set up the transaction
        createOrder: (data, actions) => {
          return actions.order.create({
            purchase_units: [{
              description: `${props.description} - ${props.planType} (${props.billingCycle})`,
              amount: {
                value: props.amount.toFixed(2),
                currency_code: props.currency
              }
            }]
          });
        },
        
        // Handle successful payment
        onApprove: async (data, actions) => {
          try {
            const orderDetails = await actions.order.capture();
            
            // Emit success event with the order details
            emit('payment-success', {
              orderId: orderDetails.id,
              payerId: orderDetails.payer.payer_id,
              email: orderDetails.payer.email_address,
              status: orderDetails.status,
              amount: orderDetails.purchase_units[0].amount.value,
              currency: orderDetails.purchase_units[0].amount.currency_code,
            });
          } catch (err) {
            errorStore.showError('Failed to process PayPal payment: ' + (err.message || 'Unknown error'));
            emit('payment-error', err);
          }
        },
        
        // Handle payment cancellation
        onCancel: (data) => {
          emit('payment-cancelled', data);
        },
        
        // Handle errors
        onError: (err) => {
          errorStore.showError('PayPal payment error: ' + (err.message || 'Unknown error'));
          error.value = 'PayPal payment failed. Please try again.';
          emit('payment-error', err);
        },
        
        // Customize button style
        style: {
          layout: 'vertical',
          color: 'blue',
          shape: 'rect',
          label: 'paypal'
        }
      }).render(paypalButtonContainer.value);
    }
  } catch (err) {
    error.value = 'Failed to load PayPal. Please try again.';
    errorStore.showError('Failed to initialize PayPal: ' + (err.message || 'Unknown error'));
  } finally {
    loading.value = false;
  }
};

// Initialize on mount
onMounted(async () => {
  await initPayPal();
});

// Re-initialize PayPal when amount changes
watch(() => props.amount, async () => {
  if (props.amount > 0) {
    await initPayPal();
  }
});
</script>

<style scoped>
.paypal-payment-form {
  position: relative;
  padding: 20px;
  border-radius: 8px;
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
  border-radius: 8px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e2e8f0;
  border-top: 4px solid #4fd1c5;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  padding: 12px;
  background-color: #fff5f5;
  color: #e53e3e;
  border-radius: 6px;
  margin-bottom: 16px;
}

#paypal-button-container {
  min-height: 100px;
}

/* Add margin to PayPal button */
:deep(.paypal-button-container) {
  margin-top: 10px;
}
</style>