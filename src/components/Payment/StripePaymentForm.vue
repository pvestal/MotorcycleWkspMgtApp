<template>
  <div class="stripe-payment-form">
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <span>Loading payment form...</span>
    </div>
    
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
    
    <form @submit.prevent="handleSubmit" v-if="!loading && mounted">
      <div class="form-group">
        <label for="card-element">Credit Card</label>
        <div id="card-element" ref="cardElement" class="card-element"></div>
        <div id="card-errors" class="card-errors" role="alert">{{ cardError }}</div>
      </div>
      
      <div class="save-for-future">
        <input type="checkbox" id="save-card" v-model="saveForFuture" />
        <label for="save-card">Save this card for future payments</label>
      </div>
      
      <button 
        type="submit" 
        class="submit-button" 
        :disabled="processing || !stripe"
        :class="{ 'processing': processing }"
      >
        <span v-if="processing">Processing...</span>
        <span v-else>Pay Now</span>
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, defineProps, defineEmits } from 'vue';
import { loadStripe } from '@stripe/stripe-js';
import { stripeConfig } from '@/config/payment';
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
  clientSecret: {
    type: String,
    default: ''
  }
});

// Emits
const emit = defineEmits(['payment-success', 'payment-error', 'token-generated']);

// State
const stripe = ref(null);
const elements = ref(null);
const card = ref(null);
const cardElement = ref(null);
const cardError = ref('');
const loading = ref(true);
const processing = ref(false);
const mounted = ref(false);
const error = ref('');
const saveForFuture = ref(true);

// Error store
const errorStore = useErrorStore();

// Initialize Stripe
onMounted(async () => {
  try {
    // Load Stripe
    stripe.value = await loadStripe(stripeConfig.publicKey);
    
    if (stripe.value) {
      // Create elements instance
      elements.value = stripe.value.elements(stripeConfig.options);
      
      // Create and mount the card element
      card.value = elements.value.create('card', {
        style: {
          base: {
            fontSize: '16px',
            color: '#32325d',
            fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
            fontSmoothing: 'antialiased',
            '::placeholder': {
              color: '#aab7c4'
            }
          },
          invalid: {
            color: '#fa755a',
            iconColor: '#fa755a'
          }
        }
      });
      
      if (cardElement.value) {
        card.value.mount(cardElement.value);
        
        // Listen for card element changes and errors
        card.value.on('change', (event) => {
          if (event.error) {
            cardError.value = event.error.message;
          } else {
            cardError.value = '';
          }
        });
        
        mounted.value = true;
      }
    }
    
    loading.value = false;
  } catch (err) {
    error.value = 'Failed to load payment form. Please try again.';
    errorStore.showError('Failed to initialize payment form: ' + (err.message || 'Unknown error'));
    loading.value = false;
  }
});

// Clean up on component unmount
onUnmounted(() => {
  if (card.value) {
    card.value.destroy();
  }
});

// Submit handler
const handleSubmit = async () => {
  if (!stripe.value || !card.value) {
    return;
  }
  
  processing.value = true;
  
  try {
    if (props.clientSecret) {
      // If client secret is provided, confirm the payment
      const { paymentIntent, error: confirmError } = await stripe.value.confirmCardPayment(props.clientSecret, {
        payment_method: {
          card: card.value,
          billing_details: {
            // We would normally collect billing details in a production app
            // but for this demo, we'll just use dummy values
            name: 'Test User',
          }
        },
        setup_future_usage: saveForFuture.value ? 'off_session' : undefined
      });
      
      if (confirmError) {
        throw new Error(confirmError.message);
      }
      
      if (paymentIntent.status === 'succeeded') {
        emit('payment-success', paymentIntent);
      } else {
        throw new Error(`Payment status: ${paymentIntent.status}`);
      }
    } else {
      // If no client secret, just create a token for later use
      const { token, error: tokenError } = await stripe.value.createToken(card.value);
      
      if (tokenError) {
        throw new Error(tokenError.message);
      }
      
      emit('token-generated', {
        token: token.id,
        last4: token.card.last4,
        brand: token.card.brand,
        expMonth: token.card.exp_month,
        expYear: token.card.exp_year
      });
    }
  } catch (err) {
    errorStore.showError('Payment failed: ' + (err.message || 'Unknown error'));
    cardError.value = err.message || 'Payment failed. Please try again.';
    emit('payment-error', err);
  } finally {
    processing.value = false;
  }
};
</script>

<style scoped>
.stripe-payment-form {
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

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #2d3748;
}

.card-element {
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background-color: white;
  transition: all 0.2s ease;
}

.card-element:focus {
  outline: none;
  border-color: #4fd1c5;
  box-shadow: 0 0 0 2px rgba(79, 209, 197, 0.2);
}

.card-errors {
  margin-top: 8px;
  color: #e53e3e;
  font-size: 0.9rem;
  min-height: 20px;
}

.error-message {
  padding: 12px;
  background-color: #fff5f5;
  color: #e53e3e;
  border-radius: 6px;
  margin-bottom: 16px;
}

.save-for-future {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.save-for-future input {
  margin-right: 8px;
}

.submit-button {
  width: 100%;
  padding: 12px;
  background-color: #4fd1c5;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.submit-button:hover:not(:disabled) {
  background-color: #38b2ac;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.submit-button:disabled {
  background-color: #cbd5e0;
  cursor: not-allowed;
}

.submit-button.processing {
  background-color: #a0aec0;
  cursor: wait;
}
</style>