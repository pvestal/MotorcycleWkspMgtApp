import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { httpsCallable } from 'firebase/functions';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db, functions } from '../fbConfig';
import { useErrorStore } from './errorStore';

export const useInventoryStore = defineStore('inventory', () => {
  // State
  const inventory = ref([]);
  const isLoading = ref(false);
  const providers = ref([
    { id: 'motocraftdb', name: 'MotoCraft Parts Database' },
    { id: 'partsdirect', name: 'Parts Direct Supply' },
    { id: 'bikebandit', name: 'Bike Bandit' },
    { id: 'jpcycles', name: 'J&P Cycles' },
    { id: 'denniskirk', name: 'Dennis Kirk' },
    { id: 'revzilla', name: 'RevZilla' },
    { id: 'custom', name: 'Custom Supplier' }
  ]);
  const lastSearchResults = ref(null);
  const searchHistory = ref([]);
  const apiKey = ref(null);
  
  // Error handling
  const errorStore = useErrorStore();
  
  // Actions
  
  /**
   * Fetch inventory items from Firestore
   */
  async function fetchInventory() {
    try {
      isLoading.value = true;
      
      const inventoryCollection = collection(db, 'inventory');
      const querySnapshot = await getDocs(inventoryCollection);
      
      inventory.value = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
    } catch (error) {
      errorStore.showError('Failed to fetch inventory: ' + error.message);
      console.error('Error fetching inventory:', error);
    } finally {
      isLoading.value = false;
    }
  }
  
  /**
   * Search for a part in all providers using cloud function
   * @param {string} partNumber - Part number to search for
   * @param {string} provider - Provider ID to search in (optional)
   */
  async function searchPartAvailability(partNumber, provider = 'motocraftdb') {
    try {
      isLoading.value = true;
      
      // Call the cloud function
      const checkInventoryAvailability = httpsCallable(functions, 'checkInventoryAvailability');
      const result = await checkInventoryAvailability({ partNumber, provider });
      
      // Store the search result
      lastSearchResults.value = {
        partNumber,
        provider,
        timestamp: new Date().toISOString(),
        data: result.data
      };
      
      // Add to search history (limit to last 10 searches)
      searchHistory.value.unshift({
        partNumber,
        provider,
        timestamp: new Date().toISOString()
      });
      
      if (searchHistory.value.length > 10) {
        searchHistory.value = searchHistory.value.slice(0, 10);
      }
      
      return result.data;
    } catch (error) {
      errorStore.showError('Failed to search part availability: ' + error.message);
      console.error('Error searching part availability:', error);
      return null;
    } finally {
      isLoading.value = false;
    }
  }
  
  /**
   * Generate a new API key for inventory integration
   */
  async function generateApiKey() {
    try {
      isLoading.value = true;
      
      // Call the cloud function
      const generateApiKeyFn = httpsCallable(functions, 'generateApiKey');
      const result = await generateApiKeyFn();
      
      if (result.data && result.data.apiKey) {
        apiKey.value = result.data.apiKey;
        return result.data.apiKey;
      }
      
      return null;
    } catch (error) {
      errorStore.showError('Failed to generate API key: ' + error.message);
      console.error('Error generating API key:', error);
      return null;
    } finally {
      isLoading.value = false;
    }
  }
  
  /**
   * Add a local inventory item (for custom suppliers)
   * @param {Object} item - Inventory item to add
   */
  async function addInventoryItem(item) {
    try {
      isLoading.value = true;
      
      // Add to Firestore
      const docRef = await addDoc(collection(db, 'inventory'), {
        ...item,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        source: 'manual'
      });
      
      // Add to local state
      const newItem = {
        id: docRef.id,
        ...item,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        source: 'manual'
      };
      
      inventory.value.push(newItem);
      
      return newItem;
    } catch (error) {
      errorStore.showError('Failed to add inventory item: ' + error.message);
      console.error('Error adding inventory item:', error);
      return null;
    } finally {
      isLoading.value = false;
    }
  }
  
  /**
   * Update an inventory item
   * @param {string} id - Item ID
   * @param {Object} updates - Fields to update
   */
  async function updateInventoryItem(id, updates) {
    try {
      isLoading.value = true;
      
      // Update in Firestore
      const itemRef = doc(db, 'inventory', id);
      await updateDoc(itemRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
      
      // Update in local state
      const index = inventory.value.findIndex(item => item.id === id);
      if (index !== -1) {
        inventory.value[index] = {
          ...inventory.value[index],
          ...updates,
          updatedAt: new Date().toISOString()
        };
      }
      
      return true;
    } catch (error) {
      errorStore.showError('Failed to update inventory item: ' + error.message);
      console.error('Error updating inventory item:', error);
      return false;
    } finally {
      isLoading.value = false;
    }
  }
  
  /**
   * Delete an inventory item
   * @param {string} id - Item ID
   */
  async function deleteInventoryItem(id) {
    try {
      isLoading.value = true;
      
      // Delete from Firestore
      await deleteDoc(doc(db, 'inventory', id));
      
      // Remove from local state
      inventory.value = inventory.value.filter(item => item.id !== id);
      
      return true;
    } catch (error) {
      errorStore.showError('Failed to delete inventory item: ' + error.message);
      console.error('Error deleting inventory item:', error);
      return false;
    } finally {
      isLoading.value = false;
    }
  }
  
  /**
   * Search for local inventory items
   * @param {string} query - Search query
   */
  function searchLocalInventory(query) {
    if (!query || query.trim() === '') {
      return inventory.value;
    }
    
    const searchTerms = query.toLowerCase().trim().split(/\s+/);
    
    return inventory.value.filter(item => {
      const itemText = [
        item.partNumber,
        item.description,
        item.manufacturer,
        item.category,
        item.location
      ].filter(Boolean).join(' ').toLowerCase();
      
      return searchTerms.every(term => itemText.includes(term));
    });
  }
  
  // Computed
  
  /**
   * Get an inventory item by ID
   */
  const getInventoryItemById = computed(() => {
    return (id) => inventory.value.find(item => item.id === id);
  });
  
  /**
   * Get all inventory items by category
   */
  const getInventoryByCategory = computed(() => {
    return (category) => {
      if (!category) return inventory.value;
      return inventory.value.filter(item => item.category === category);
    };
  });
  
  /**
   * Get a provider by ID
   */
  const getProviderById = computed(() => {
    return (id) => providers.value.find(provider => provider.id === id);
  });
  
  /**
   * Get inventory statistics
   */
  const inventoryStats = computed(() => {
    const total = inventory.value.length;
    const inStock = inventory.value.filter(item => 
      item.quantity > 0 || item.status === 'in_stock'
    ).length;
    
    const lowStock = inventory.value.filter(item => 
      item.quantity > 0 && item.quantity <= (item.reorderThreshold || 5)
    ).length;
    
    const outOfStock = inventory.value.filter(item => 
      item.quantity === 0 || item.status === 'out_of_stock'
    ).length;
    
    return {
      total,
      inStock,
      lowStock,
      outOfStock
    };
  });

  return {
    // State
    inventory,
    isLoading,
    providers,
    lastSearchResults,
    searchHistory,
    apiKey,
    
    // Actions
    fetchInventory,
    searchPartAvailability,
    generateApiKey,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    searchLocalInventory,
    
    // Computed
    getInventoryItemById,
    getInventoryByCategory,
    getProviderById,
    inventoryStats
  };
});