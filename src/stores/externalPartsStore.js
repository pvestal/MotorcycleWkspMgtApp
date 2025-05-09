import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useErrorStore } from './errorStore';
import * as partsApi from '@/services/partsApi';

export const useExternalPartsStore = defineStore('externalPartsStore', () => {
  // State
  const searchResults = ref([]);
  const partDetails = ref({});
  const compatibilityResults = ref({});
  const availabilityData = ref({});
  const alternativeParts = ref([]);
  const categories = ref([]);
  const brands = ref([]);
  const loading = ref(false);
  const error = ref(null);
  const selectedPart = ref(null);
  const recentSearches = ref([]);
  const searchHistory = ref([]);

  // Error handling
  const errorStore = useErrorStore();
  
  // Save recent searches to localStorage
  const saveRecentSearch = (query) => {
    // Don't save empty queries
    if (!query.trim()) return;
    
    // Add to recent searches if not already there
    const searchIndex = recentSearches.value.findIndex(item => item.toLowerCase() === query.toLowerCase());
    if (searchIndex === -1) {
      // Add to the beginning and limit to 10 items
      recentSearches.value.unshift(query);
      if (recentSearches.value.length > 10) {
        recentSearches.value.pop();
      }
      
      // Save to localStorage
      try {
        localStorage.setItem('recentPartsSearches', JSON.stringify(recentSearches.value));
      } catch (e) {
        console.warn('Could not save recent searches to localStorage', e);
      }
    } else {
      // Move existing search to the top
      const existingSearch = recentSearches.value.splice(searchIndex, 1)[0];
      recentSearches.value.unshift(existingSearch);
      
      // Save to localStorage
      try {
        localStorage.setItem('recentPartsSearches', JSON.stringify(recentSearches.value));
      } catch (e) {
        console.warn('Could not save recent searches to localStorage', e);
      }
    }
  };
  
  // Load recent searches from localStorage
  const loadRecentSearches = () => {
    try {
      const saved = localStorage.getItem('recentPartsSearches');
      if (saved) {
        recentSearches.value = JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Could not load recent searches from localStorage', e);
    }
  };
  
  // Clear recent searches
  const clearRecentSearches = () => {
    recentSearches.value = [];
    try {
      localStorage.removeItem('recentPartsSearches');
    } catch (e) {
      console.warn('Could not clear recent searches from localStorage', e);
    }
  };

  /**
   * Search for parts by query and options
   */
  const searchForParts = async (query, options = {}) => {
    loading.value = true;
    error.value = null;
    
    try {
      // Save search to history
      saveRecentSearch(query);
      
      // Add search to history with timestamp
      searchHistory.value.unshift({
        query,
        options,
        timestamp: new Date()
      });
      
      // Limit history size
      if (searchHistory.value.length > 50) {
        searchHistory.value.pop();
      }
      
      // Perform search
      const results = await partsApi.searchParts(query, options);
      searchResults.value = results;
      return results;
    } catch (err) {
      error.value = err.message || 'Error searching for parts';
      errorStore.showError('Error searching for parts: ' + error.value);
      return [];
    } finally {
      loading.value = false;
    }
  };

  /**
   * Get details for a specific part
   */
  const getPartDetailsById = async (partId) => {
    loading.value = true;
    error.value = null;
    
    try {
      const details = await partsApi.getPartDetails(partId);
      if (details) {
        partDetails.value = { ...partDetails.value, [partId]: details };
        selectedPart.value = details;
      }
      return details;
    } catch (err) {
      error.value = err.message || 'Error getting part details';
      errorStore.showError('Error getting part details: ' + error.value);
      return null;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Check if a part is compatible with a vehicle
   */
  const checkPartCompatibility = async (partId, vehicle) => {
    loading.value = true;
    error.value = null;
    
    try {
      const compatibility = await partsApi.checkCompatibility(partId, vehicle);
      compatibilityResults.value = { ...compatibilityResults.value, [partId]: compatibility };
      return compatibility;
    } catch (err) {
      error.value = err.message || 'Error checking part compatibility';
      errorStore.showError('Error checking part compatibility: ' + error.value);
      return { compatible: false, message: 'Error checking compatibility' };
    } finally {
      loading.value = false;
    }
  };

  /**
   * Get price and availability for a part
   */
  const checkPriceAndAvailability = async (partId, zipCode = null) => {
    loading.value = true;
    error.value = null;
    
    try {
      const availability = await partsApi.getPriceAndAvailability(partId, zipCode);
      availabilityData.value = { ...availabilityData.value, [partId]: availability };
      return availability;
    } catch (err) {
      error.value = err.message || 'Error checking price and availability';
      errorStore.showError('Error checking price and availability: ' + error.value);
      return { inStock: false, price: null, estimatedDelivery: null };
    } finally {
      loading.value = false;
    }
  };

  /**
   * Get alternative parts for a specific part
   */
  const getAlternatives = async (partId) => {
    loading.value = true;
    error.value = null;
    
    try {
      const alternatives = await partsApi.getAlternativeParts(partId);
      alternativeParts.value = { ...alternativeParts.value, [partId]: alternatives };
      return alternatives;
    } catch (err) {
      error.value = err.message || 'Error getting alternative parts';
      errorStore.showError('Error getting alternative parts: ' + error.value);
      return [];
    } finally {
      loading.value = false;
    }
  };

  /**
   * Load categories for parts
   */
  const loadCategories = async () => {
    if (categories.value.length > 0) return categories.value;
    
    loading.value = true;
    error.value = null;
    
    try {
      const result = await partsApi.getPartCategories();
      categories.value = result;
      return result;
    } catch (err) {
      error.value = err.message || 'Error loading part categories';
      errorStore.showError('Error loading part categories: ' + error.value);
      return [];
    } finally {
      loading.value = false;
    }
  };

  /**
   * Load brands for parts
   */
  const loadBrands = async () => {
    if (brands.value.length > 0) return brands.value;
    
    loading.value = true;
    error.value = null;
    
    try {
      const result = await partsApi.getPartBrands();
      brands.value = result;
      return result;
    } catch (err) {
      error.value = err.message || 'Error loading part brands';
      errorStore.showError('Error loading part brands: ' + error.value);
      return [];
    } finally {
      loading.value = false;
    }
  };

  /**
   * Import a part from the external API to local storage
   */
  const importPartToProject = async (partId, projectId) => {
    // Implementation depends on how you want to integrate with your local database
    // This is just a placeholder
    return true;
  };

  /**
   * Get part details for a specific part (from cache or API)
   */
  const getPartDetails = computed(() => (partId) => {
    return partDetails.value[partId] || null;
  });

  /**
   * Get cached compatibility results
   */
  const getCompatibility = computed(() => (partId) => {
    return compatibilityResults.value[partId] || null;
  });

  /**
   * Get cached availability results
   */
  const getAvailability = computed(() => (partId) => {
    return availabilityData.value[partId] || null;
  });

  /**
   * Get cached alternatives for a part
   */
  const getAlternativesForPart = computed(() => (partId) => {
    return alternativeParts.value[partId] || [];
  });

  // Initialize
  loadRecentSearches();

  return {
    // State
    searchResults,
    partDetails,
    compatibilityResults,
    availabilityData,
    alternativeParts,
    categories,
    brands,
    loading,
    error,
    selectedPart,
    recentSearches,
    searchHistory,
    
    // Actions
    searchForParts,
    getPartDetailsById,
    checkPartCompatibility,
    checkPriceAndAvailability,
    getAlternatives,
    loadCategories,
    loadBrands,
    importPartToProject,
    saveRecentSearch,
    clearRecentSearches,
    loadRecentSearches,
    
    // Getters
    getPartDetails,
    getCompatibility,
    getAvailability,
    getAlternativesForPart
  };
});