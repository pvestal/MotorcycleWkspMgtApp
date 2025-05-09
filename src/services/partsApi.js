import axios from 'axios';
import { useErrorStore } from '@/stores/errorStore';

// Create axios instance for parts API
const partsApi = axios.create({
  baseURL: import.meta.env.VITE_PARTS_API_URL || 'https://motorcycle-parts-api.example.com/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Add request interceptor to add API key to all requests
partsApi.interceptors.request.use(
  config => {
    // Add API key from environment variables
    config.headers['X-API-Key'] = import.meta.env.VITE_PARTS_API_KEY;
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Handle response errors globally
partsApi.interceptors.response.use(
  response => response,
  error => {
    const errorStore = useErrorStore();
    const errorMessage = error.response?.data?.message || error.message || 'Error connecting to parts database';
    
    // Log error but don't show to user unless we pass true as second parameter
    console.error('Parts API Error:', errorMessage);
    
    return Promise.reject(error);
  }
);

/**
 * Search for parts by keyword
 * @param {string} query - Search query
 * @param {Object} options - Search options
 * @returns {Promise<Array>} - Search results
 */
export const searchParts = async (query, options = {}) => {
  try {
    const params = {
      q: query,
      limit: options.limit || 20,
      offset: options.offset || 0,
      category: options.category || null,
      brand: options.brand || null,
      sortBy: options.sortBy || 'relevance',
      sortDirection: options.sortDirection || 'desc'
    };

    const response = await partsApi.get('/parts/search', { params });
    return response.data.results;
  } catch (error) {
    console.error('Error searching parts:', error);
    return [];
  }
};

/**
 * Get part details by ID or SKU
 * @param {string} idOrSku - Part ID or SKU
 * @returns {Promise<Object>} - Part details
 */
export const getPartDetails = async (idOrSku) => {
  try {
    const response = await partsApi.get(`/parts/${idOrSku}`);
    return response.data;
  } catch (error) {
    console.error(`Error getting part details for ${idOrSku}:`, error);
    return null;
  }
};

/**
 * Get part compatibility information
 * @param {string} partId - Part ID
 * @param {Object} vehicle - Vehicle details
 * @returns {Promise<Object>} - Compatibility information
 */
export const checkCompatibility = async (partId, vehicle) => {
  try {
    const response = await partsApi.post(`/parts/${partId}/compatibility`, vehicle);
    return response.data;
  } catch (error) {
    console.error('Error checking compatibility:', error);
    return { compatible: false, message: 'Error checking compatibility' };
  }
};

/**
 * Get price and availability information
 * @param {string} partId - Part ID
 * @param {string} zipCode - Optional: ZIP code for local availability
 * @returns {Promise<Object>} - Price and availability information
 */
export const getPriceAndAvailability = async (partId, zipCode = null) => {
  try {
    const params = zipCode ? { zipCode } : {};
    const response = await partsApi.get(`/parts/${partId}/availability`, { params });
    return response.data;
  } catch (error) {
    console.error('Error getting price and availability:', error);
    return { 
      inStock: false, 
      price: null, 
      estimatedDelivery: null,
      message: 'Error checking availability'
    };
  }
};

/**
 * Get alternative or compatible parts
 * @param {string} partId - Part ID
 * @returns {Promise<Array>} - List of alternative parts
 */
export const getAlternativeParts = async (partId) => {
  try {
    const response = await partsApi.get(`/parts/${partId}/alternatives`);
    return response.data.alternatives || [];
  } catch (error) {
    console.error('Error getting alternative parts:', error);
    return [];
  }
};

/**
 * Get part categories
 * @returns {Promise<Array>} - List of part categories
 */
export const getPartCategories = async () => {
  try {
    const response = await partsApi.get('/categories');
    return response.data.categories || [];
  } catch (error) {
    console.error('Error getting part categories:', error);
    return [];
  }
};

/**
 * Get part brands 
 * @returns {Promise<Array>} - List of part brands
 */
export const getPartBrands = async () => {
  try {
    const response = await partsApi.get('/brands');
    return response.data.brands || [];
  } catch (error) {
    console.error('Error getting part brands:', error);
    return [];
  }
};

export default {
  searchParts,
  getPartDetails,
  checkCompatibility,
  getPriceAndAvailability,
  getAlternativeParts,
  getPartCategories,
  getPartBrands
};