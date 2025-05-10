/**
 * Payment processor configuration
 * This file contains configuration for payment processors like Stripe and PayPal
 */

// Stripe configuration
export const stripeConfig = {
  // These are test keys and would be replaced with real keys in production
  // The keys would typically be loaded from environment variables
  publicKey: 'pk_test_51NjE5JDMFXw4jUiDf76oGbLBvMsVQPZ3L2ErJ2PaxsWNQ8EoBeU5t9nEcvSLlTavtXcQijbioXLbZaRZh6Pf9iC100XXwUgNhH',
  options: {
    apiVersion: '2023-10-16',
    locale: 'en'
  }
};

// PayPal configuration
export const paypalConfig = {
  // These are test credentials and would be replaced with real credentials in production
  clientId: 'AYXfM_27QRJuWUESLqThUi1Zy9jH3d_sGa_eiBnKLYpMKFtdETgXekTFN_GJhiVnD8kvHbiL7Qe1-wZK', // PayPal sandbox client ID
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