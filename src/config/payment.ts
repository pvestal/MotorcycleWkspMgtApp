/**
 * Payment processor configuration
 * This file contains configuration for payment processors like Stripe and PayPal
 */

// Stripe configuration
export const stripeConfig = {
  // Load from environment variables
  publicKey: import.meta.env.VITE_STRIPE_PUBLIC_KEY ||
    'pk_test_51NjE5JDMFXw4jUiDf76oGbLBvMsVQPZ3L2ErJ2PaxsWNQ8EoBeU5t9nEcvSLlTavtXcQijbioXLbZaRZh6Pf9iC100XXwUgNhH', // Fallback to test key
  options: {
    apiVersion: '2023-10-16',
    locale: 'en'
  }
};

// PayPal configuration
export const paypalConfig = {
  // Load from environment variables
  clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID ||
    'AYXfM_27QRJuWUESLqThUi1Zy9jH3d_sGa_eiBnKLYpMKFtdETgXekTFN_GJhiVnD8kvHbiL7Qe1-wZK', // Fallback to test client ID
  currency: 'USD',
  intent: 'capture',
  // Disable funding sources that are not relevant
  disableFunding: ['card', 'credit'],
  // Enable funding sources that you prefer
  enableFunding: ['paypal']
};

// Configuration for which payment methods to enable
export const enabledPaymentMethods = {
  stripe: true, // Enable Stripe credit card payments
  paypal: true, // Enable PayPal payments
  applePay: false, // Disabled for now, could be enabled later
  googlePay: false // Disabled for now, could be enabled later
};

// Configuration for supported countries and currencies
export const paymentRegionConfig = {
  supportedCountries: ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'ES', 'IT', 'NL', 'BE'],
  defaultCurrency: 'USD',
  supportedCurrencies: ['USD', 'CAD', 'GBP', 'EUR', 'AUD']
};

// Export a combined configuration object
export const paymentConfig = {
  stripe: stripeConfig,
  paypal: paypalConfig,
  enabledMethods: enabledPaymentMethods,
  regions: paymentRegionConfig
};

export default paymentConfig;