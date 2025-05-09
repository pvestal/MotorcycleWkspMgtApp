<template>
  <div class="inventory-view">
    <header class="inventory-header">
      <div class="header-content">
        <h1>Parts Inventory Management</h1>
        <p>Search and manage parts across multiple suppliers or your local inventory</p>
      </div>
    </header>

    <div class="inventory-container">
      <div class="inventory-tabs">
        <button 
          @click="activeTab = 'search'" 
          :class="{ active: activeTab === 'search' }" 
          class="tab-button"
        >
          <span class="material-symbols-outlined">search</span>
          Search
        </button>
        <button 
          @click="activeTab = 'inventory'" 
          :class="{ active: activeTab === 'inventory' }" 
          class="tab-button"
        >
          <span class="material-symbols-outlined">inventory_2</span>
          Local Inventory
        </button>
        <button 
          @click="activeTab = 'settings'" 
          :class="{ active: activeTab === 'settings' }" 
          class="tab-button"
        >
          <span class="material-symbols-outlined">settings</span>
          Settings
        </button>
      </div>

      <div class="tab-content">
        <!-- Search Tab -->
        <div v-if="activeTab === 'search'" class="search-tab">
          <PartInventoryLookup />
        </div>

        <!-- Inventory Tab -->
        <div v-if="activeTab === 'inventory'" class="inventory-tab">
          <div class="inventory-controls">
            <div class="inventory-search">
              <input 
                type="text" 
                v-model="inventorySearchQuery" 
                placeholder="Search inventory..." 
                class="inventory-search-input"
              />
            </div>
            <button @click="showAddInventoryModal = true" class="add-inventory-btn hover-effect">
              <span class="material-symbols-outlined">add</span>
              Add Item
            </button>
          </div>

          <!-- Inventory Stats -->
          <div class="inventory-stats">
            <div class="stat-card">
              <h3>{{ inventoryStats.total }}</h3>
              <p>Total Items</p>
            </div>
            <div class="stat-card in-stock">
              <h3>{{ inventoryStats.inStock }}</h3>
              <p>In Stock</p>
            </div>
            <div class="stat-card low-stock">
              <h3>{{ inventoryStats.lowStock }}</h3>
              <p>Low Stock</p>
            </div>
            <div class="stat-card out-of-stock">
              <h3>{{ inventoryStats.outOfStock }}</h3>
              <p>Out of Stock</p>
            </div>
          </div>

          <!-- Inventory Table -->
          <div class="inventory-table-container">
            <table class="inventory-table" v-if="filteredInventory.length > 0">
              <thead>
                <tr>
                  <th>Part Number</th>
                  <th>Description</th>
                  <th>Quantity</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in filteredInventory" :key="item.id" class="inventory-item">
                  <td>{{ item.partNumber }}</td>
                  <td>{{ item.description }}</td>
                  <td>{{ item.quantity }}</td>
                  <td>{{ item.location || 'N/A' }}</td>
                  <td>
                    <span 
                      class="status-badge" 
                      :class="{
                        'in-stock': item.quantity > (item.reorderThreshold || 5),
                        'low-stock': item.quantity > 0 && item.quantity <= (item.reorderThreshold || 5),
                        'out-of-stock': item.quantity === 0
                      }"
                    >
                      {{ 
                        item.quantity === 0 ? 'Out of Stock' : 
                        (item.quantity <= (item.reorderThreshold || 5) ? 'Low Stock' : 'In Stock') 
                      }}
                    </span>
                  </td>
                  <td class="actions">
                    <button @click="editInventoryItem(item)" class="action-btn edit">
                      <span class="material-symbols-outlined">edit</span>
                    </button>
                    <button @click="promptDeleteItem(item)" class="action-btn delete">
                      <span class="material-symbols-outlined">delete</span>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
            
            <div v-else-if="isLoading" class="inventory-empty">
              <div class="loading-spinner"></div>
              <p>Loading inventory...</p>
            </div>
            
            <div v-else class="inventory-empty">
              <span class="material-symbols-outlined empty-icon">inventory_2</span>
              <p>No inventory items found</p>
              <button @click="showAddInventoryModal = true" class="add-inventory-btn hover-effect">
                Add First Item
              </button>
            </div>
          </div>
        </div>

        <!-- Settings Tab -->
        <div v-if="activeTab === 'settings'" class="settings-tab">
          <div class="settings-section">
            <h2>API Integration</h2>
            <p>Generate an API key to integrate with external inventory systems</p>
            
            <div class="api-key-section">
              <div v-if="apiKey" class="api-key-display">
                <p><strong>Your API Key:</strong></p>
                <div class="api-key-value">
                  <input 
                    type="text" 
                    :value="apiKey" 
                    readonly 
                    ref="apiKeyInput"
                    class="api-key-input"
                  />
                  <button @click="copyApiKey" class="copy-btn hover-effect">
                    <span class="material-symbols-outlined">content_copy</span>
                  </button>
                </div>
                <p class="api-key-warning">
                  Keep this key secret. It provides access to your inventory data.
                </p>
              </div>
              
              <button 
                @click="generateNewApiKey" 
                class="generate-key-btn hover-effect" 
                :disabled="isLoading"
              >
                <span v-if="isLoading" class="loading-spinner"></span>
                <span v-else>{{ apiKey ? 'Regenerate API Key' : 'Generate API Key' }}</span>
              </button>
            </div>
          </div>
          
          <div class="settings-section">
            <h2>Inventory Providers</h2>
            <p>Configure external inventory providers</p>
            
            <div class="providers-list">
              <div v-for="provider in providers" :key="provider.id" class="provider-item">
                <div class="provider-info">
                  <h3>{{ provider.name }}</h3>
                  <span class="provider-id">ID: {{ provider.id }}</span>
                </div>
                <div class="provider-status" :class="{ active: provider.id !== 'custom' }">
                  {{ provider.id !== 'custom' ? 'Active' : 'Custom' }}
                </div>
              </div>
            </div>
          </div>
          
          <div class="subscription-banner">
            <div class="subscription-info">
              <h3>Premium Inventory Features</h3>
              <p>Upgrade to Premium for unlimited inventory management, real-time sync, and more</p>
            </div>
            <button class="upgrade-btn hover-effect">Upgrade Now</button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Add Inventory Modal -->
    <div v-if="showAddInventoryModal" class="modal-overlay" @click.self="showAddInventoryModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ editingItem ? 'Edit Inventory Item' : 'Add Inventory Item' }}</h3>
          <button class="close-modal-btn" @click="showAddInventoryModal = false">&times;</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveInventoryItem">
            <div class="form-row">
              <div class="form-group">
                <label for="partNumber">Part Number</label>
                <input 
                  type="text" 
                  id="partNumber" 
                  v-model="inventoryForm.partNumber" 
                  required
                  class="form-control"
                />
              </div>
              <div class="form-group">
                <label for="manufacturer">Manufacturer</label>
                <input 
                  type="text" 
                  id="manufacturer" 
                  v-model="inventoryForm.manufacturer" 
                  class="form-control"
                />
              </div>
            </div>
            
            <div class="form-group">
              <label for="description">Description</label>
              <input 
                type="text" 
                id="description" 
                v-model="inventoryForm.description" 
                required
                class="form-control"
              />
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label for="quantity">Quantity</label>
                <input 
                  type="number" 
                  id="quantity" 
                  v-model.number="inventoryForm.quantity" 
                  min="0"
                  class="form-control"
                />
              </div>
              <div class="form-group">
                <label for="reorderThreshold">Reorder Threshold</label>
                <input 
                  type="number" 
                  id="reorderThreshold" 
                  v-model.number="inventoryForm.reorderThreshold" 
                  min="0"
                  class="form-control"
                />
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label for="location">Storage Location</label>
                <input 
                  type="text" 
                  id="location" 
                  v-model="inventoryForm.location" 
                  class="form-control"
                />
              </div>
              <div class="form-group">
                <label for="category">Category</label>
                <select id="category" v-model="inventoryForm.category" class="form-control">
                  <option value="engine">Engine</option>
                  <option value="transmission">Transmission</option>
                  <option value="suspension">Suspension</option>
                  <option value="electrical">Electrical</option>
                  <option value="frame">Frame</option>
                  <option value="exhaust">Exhaust</option>
                  <option value="brakes">Brakes</option>
                  <option value="cooling">Cooling</option>
                  <option value="wheels">Wheels & Tires</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            
            <div class="form-actions">
              <button 
                type="button" 
                class="cancel-btn" 
                @click="showAddInventoryModal = false"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                class="save-btn hover-effect" 
                :disabled="isLoading"
              >
                {{ editingItem ? 'Update Item' : 'Add Item' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    
    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click.self="showDeleteModal = false">
      <div class="modal-content delete-modal">
        <div class="modal-header">
          <h3>Confirm Deletion</h3>
          <button class="close-modal-btn" @click="showDeleteModal = false">&times;</button>
        </div>
        <div class="modal-body">
          <p>Are you sure you want to delete <strong>{{ itemToDelete?.partNumber }}</strong>?</p>
          <p class="warning-text">This action cannot be undone.</p>
          
          <div class="form-actions">
            <button 
              type="button" 
              class="cancel-btn" 
              @click="showDeleteModal = false"
            >
              Cancel
            </button>
            <button 
              type="button" 
              class="delete-btn hover-effect" 
              @click="confirmDeleteItem"
              :disabled="isLoading"
            >
              Delete Item
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useInventoryStore } from '@/stores/inventoryStore';
import { useErrorStore } from '@/stores/errorStore';
import { useUserStore } from '@/stores/userStore';
import PartInventoryLookup from '@/components/Parts/PartInventoryLookup.vue';

// Store initialization
const inventoryStore = useInventoryStore();
const errorStore = useErrorStore();
const userStore = useUserStore();

// State
const activeTab = ref('search');
const showAddInventoryModal = ref(false);
const showDeleteModal = ref(false);
const inventorySearchQuery = ref('');
const editingItem = ref(null);
const itemToDelete = ref(null);
const apiKey = ref(null);

// Form state
const inventoryForm = ref({
  partNumber: '',
  description: '',
  manufacturer: '',
  quantity: 0,
  reorderThreshold: 5,
  location: '',
  category: 'other'
});

// Computed properties
const isLoading = computed(() => inventoryStore.isLoading);
const providers = computed(() => inventoryStore.providers);
const inventoryStats = computed(() => inventoryStore.inventoryStats);

const filteredInventory = computed(() => {
  if (!inventorySearchQuery.value.trim()) {
    return inventoryStore.inventory;
  }
  
  return inventoryStore.searchLocalInventory(inventorySearchQuery.value);
});

// Methods
function resetForm() {
  inventoryForm.value = {
    partNumber: '',
    description: '',
    manufacturer: '',
    quantity: 0,
    reorderThreshold: 5,
    location: '',
    category: 'other'
  };
  editingItem.value = null;
}

function editInventoryItem(item) {
  editingItem.value = item;
  inventoryForm.value = { ...item };
  showAddInventoryModal.value = true;
}

async function saveInventoryItem() {
  try {
    if (editingItem.value) {
      // Update existing item
      const success = await inventoryStore.updateInventoryItem(
        editingItem.value.id, 
        inventoryForm.value
      );
      
      if (success) {
        errorStore.showError('Inventory item updated successfully');
        showAddInventoryModal.value = false;
        resetForm();
      }
    } else {
      // Add new item
      const newItem = await inventoryStore.addInventoryItem(inventoryForm.value);
      
      if (newItem) {
        errorStore.showError('Inventory item added successfully');
        showAddInventoryModal.value = false;
        resetForm();
      }
    }
  } catch (error) {
    errorStore.showError('Error saving inventory item: ' + error.message);
  }
}

function promptDeleteItem(item) {
  itemToDelete.value = item;
  showDeleteModal.value = true;
}

async function confirmDeleteItem() {
  if (!itemToDelete.value) return;
  
  try {
    const success = await inventoryStore.deleteInventoryItem(itemToDelete.value.id);
    
    if (success) {
      errorStore.showError('Inventory item deleted successfully');
      showDeleteModal.value = false;
      itemToDelete.value = null;
    }
  } catch (error) {
    errorStore.showError('Error deleting inventory item: ' + error.message);
  }
}

async function generateNewApiKey() {
  try {
    const key = await inventoryStore.generateApiKey();
    
    if (key) {
      apiKey.value = key;
      errorStore.showError('API key generated successfully');
    } else {
      errorStore.showError('Failed to generate API key');
    }
  } catch (error) {
    errorStore.showError('Error generating API key: ' + error.message);
  }
}

function copyApiKey() {
  if (!apiKey.value) return;
  
  const apiKeyInput = document.getElementById('apiKeyInput');
  if (apiKeyInput) {
    apiKeyInput.select();
    document.execCommand('copy');
    errorStore.showError('API key copied to clipboard');
  }
}

// Lifecycle hooks
onMounted(async () => {
  await inventoryStore.fetchInventory();
  
  // Auto-select inventory tab if in premium mode
  if (userStore.currentUser && userStore.currentUser.subscriptionType === 'premium') {
    activeTab.value = 'inventory';
  }
});
</script>

<style scoped>
.inventory-view {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px 40px;
}

.inventory-header {
  background: linear-gradient(135deg, #4fd1c5 0%, #38b2ac 100%);
  padding: 60px 0;
  margin: -20px -20px 30px;
  color: white;
  border-radius: 0 0 16px 16px;
  text-align: center;
}

.header-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
}

.inventory-header h1 {
  font-size: 2.2rem;
  font-weight: 700;
  margin-bottom: 12px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.inventory-header p {
  font-size: 1.1rem;
  opacity: 0.9;
}

.inventory-container {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.inventory-tabs {
  display: flex;
  background-color: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.tab-button {
  padding: 16px 24px;
  background: none;
  border: none;
  font-size: 1rem;
  font-weight: 500;
  color: #4b5563;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
  transition: all 0.2s ease;
}

.tab-button.active {
  color: #4fd1c5;
  font-weight: 600;
}

.tab-button.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background-color: #4fd1c5;
  border-radius: 3px 3px 0 0;
}

.tab-button:hover:not(.active) {
  background-color: #f1f5f9;
}

.tab-button .material-symbols-outlined {
  font-size: 20px;
}

.tab-content {
  padding: 24px;
}

/* Inventory Tab Styles */
.inventory-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.inventory-search {
  flex: 1;
  max-width: 400px;
}

.inventory-search-input {
  width: 100%;
  padding: 10px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.95rem;
  background-color: #f8fafc;
  transition: all 0.2s ease;
}

.inventory-search-input:focus {
  border-color: #4fd1c5;
  outline: none;
  box-shadow: 0 0 0 3px rgba(79, 209, 197, 0.1);
  background-color: white;
}

.add-inventory-btn {
  padding: 10px 16px;
  background-color: #4fd1c5;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
}

.add-inventory-btn:hover {
  background-color: #38b2ac;
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.add-inventory-btn .material-symbols-outlined {
  font-size: 20px;
}

/* Inventory Stats */
.inventory-stats {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  flex: 1;
  background-color: #f9fafb;
  border-radius: 10px;
  padding: 16px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.stat-card h3 {
  font-size: 1.8rem;
  margin: 0 0 4px;
  color: #1a202c;
}

.stat-card p {
  margin: 0;
  color: #4a5568;
  font-size: 0.9rem;
}

.stat-card.in-stock h3 {
  color: #38a169;
}

.stat-card.low-stock h3 {
  color: #d69e2e;
}

.stat-card.out-of-stock h3 {
  color: #e53e3e;
}

/* Inventory Table */
.inventory-table-container {
  overflow-x: auto;
  margin-bottom: 24px;
}

.inventory-table {
  width: 100%;
  border-collapse: collapse;
}

.inventory-table th {
  text-align: left;
  padding: 12px 16px;
  background-color: #f9fafb;
  color: #4a5568;
  font-weight: 600;
  font-size: 0.95rem;
  border-bottom: 2px solid #e2e8f0;
}

.inventory-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #e2e8f0;
  color: #1a202c;
  font-size: 0.95rem;
}

.inventory-item {
  transition: background-color 0.2s ease;
}

.inventory-item:hover {
  background-color: #f7fafc;
}

.status-badge {
  padding: 6px 10px;
  border-radius: 100px;
  font-size: 0.8rem;
  font-weight: 500;
  display: inline-block;
}

.status-badge.in-stock {
  background-color: #f0fff4;
  color: #38a169;
}

.status-badge.low-stock {
  background-color: #fffaf0;
  color: #d69e2e;
}

.status-badge.out-of-stock {
  background-color: #fff5f5;
  color: #e53e3e;
}

.actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  background: none;
  transition: all 0.2s ease;
}

.action-btn.edit:hover {
  background-color: #ebf8ff;
  color: #3182ce;
}

.action-btn.delete:hover {
  background-color: #fff5f5;
  color: #e53e3e;
}

.inventory-empty {
  text-align: center;
  padding: 60px 0;
  color: #a0aec0;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 3px solid rgba(79, 209, 197, 0.3);
  border-radius: 50%;
  border-top-color: #4fd1c5;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Settings Tab */
.settings-section {
  margin-bottom: 32px;
  padding: 24px;
  background-color: #f8fafc;
  border-radius: 12px;
}

.settings-section h2 {
  font-size: 1.5rem;
  color: #1a202c;
  margin: 0 0 8px;
}

.settings-section p {
  color: #4a5568;
  margin: 0 0 20px;
}

.api-key-section {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.api-key-display {
  margin-bottom: 20px;
}

.api-key-value {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.api-key-input {
  flex: 1;
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-family: monospace;
  background-color: #f8fafc;
}

.copy-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #edf2f7;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.copy-btn:hover {
  background-color: #e2e8f0;
}

.api-key-warning {
  font-size: 0.85rem;
  color: #e53e3e;
}

.generate-key-btn {
  padding: 10px 20px;
  background-color: #4fd1c5;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}

.generate-key-btn:hover:not(:disabled) {
  background-color: #38b2ac;
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.generate-key-btn:disabled {
  background-color: #cbd5e0;
  cursor: not-allowed;
}

.providers-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.provider-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background-color: white;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.provider-id {
  font-size: 0.85rem;
  color: #718096;
  margin-top: 4px;
}

.provider-status {
  font-size: 0.85rem;
  padding: 4px 10px;
  border-radius: 100px;
  font-weight: 500;
}

.provider-status.active {
  background-color: #f0fff4;
  color: #38a169;
}

.subscription-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  background: linear-gradient(135deg, #6b46c1 0%, #805ad5 100%);
  border-radius: 12px;
  color: white;
  margin-top: 40px;
}

.subscription-info h3 {
  margin: 0 0 8px;
  font-size: 1.3rem;
}

.subscription-info p {
  margin: 0;
  opacity: 0.9;
  max-width: 500px;
}

.upgrade-btn {
  padding: 10px 20px;
  background-color: white;
  color: #6b46c1;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.upgrade-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
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
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  animation: modalFadeIn 0.3s ease-out;
}

.delete-modal {
  max-width: 400px;
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

.close-modal-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #718096;
  cursor: pointer;
  line-height: 1;
  transition: color 0.2s ease;
}

.close-modal-btn:hover {
  color: #4a5568;
}

.modal-body {
  padding: 24px;
}

.form-row {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.form-group {
  flex: 1;
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  color: #4a5568;
  font-size: 0.95rem;
  font-weight: 500;
}

.form-control {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.95rem;
  transition: all 0.2s ease;
}

.form-control:focus {
  border-color: #4fd1c5;
  outline: none;
  box-shadow: 0 0 0 3px rgba(79, 209, 197, 0.1);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.cancel-btn {
  padding: 10px 16px;
  background-color: #edf2f7;
  color: #4a5568;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}

.cancel-btn:hover {
  background-color: #e2e8f0;
}

.save-btn {
  padding: 10px 16px;
  background-color: #4fd1c5;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}

.save-btn:hover:not(:disabled) {
  background-color: #38b2ac;
}

.save-btn:disabled {
  background-color: #cbd5e0;
  cursor: not-allowed;
}

.delete-btn {
  padding: 10px 16px;
  background-color: #f56565;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}

.delete-btn:hover:not(:disabled) {
  background-color: #e53e3e;
}

.warning-text {
  color: #e53e3e;
  font-size: 0.9rem;
}

/* Responsive Styling */
@media (max-width: 768px) {
  .inventory-header {
    padding: 40px 0;
  }
  
  .inventory-header h1 {
    font-size: 1.8rem;
  }
  
  .inventory-stats {
    flex-wrap: wrap;
  }
  
  .stat-card {
    flex: 1 0 calc(50% - 8px);
  }
  
  .form-row {
    flex-direction: column;
    gap: 0;
  }
  
  .subscription-banner {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }
  
  .inventory-tabs {
    flex-wrap: wrap;
  }
  
  .tab-button {
    flex: 1;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .inventory-controls {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .inventory-search {
    max-width: none;
  }
  
  .stat-card {
    flex: 1 0 100%;
  }
}
</style>