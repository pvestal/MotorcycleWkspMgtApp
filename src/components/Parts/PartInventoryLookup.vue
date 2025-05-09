<template>
  <div class="inventory-lookup-container">
    <div class="lookup-header">
      <h3>Parts Inventory Lookup</h3>
      <p>Search for parts across multiple suppliers or check your local inventory</p>
    </div>

    <div class="search-form">
      <div class="form-group">
        <label for="part-number">Part Number</label>
        <input 
          type="text" 
          id="part-number" 
          v-model="partNumber" 
          placeholder="Enter part number"
          class="form-control"
        />
      </div>
      
      <div class="form-group">
        <label for="supplier">Supplier</label>
        <select id="supplier" v-model="selectedProviderId" class="form-control">
          <option v-for="provider in providers" :key="provider.id" :value="provider.id">
            {{ provider.name }}
          </option>
        </select>
      </div>
      
      <button 
        @click="searchPart" 
        class="search-btn hover-effect" 
        :disabled="isLoading || !partNumber"
      >
        <span v-if="isLoading" class="loading-spinner"></span>
        <span v-else>Search</span>
      </button>
    </div>
    
    <!-- Results Section -->
    <div v-if="searchResults" class="results-section">
      <div class="results-header">
        <h4>Search Results</h4>
        <span class="timestamp">{{ formatDate(searchResults.timestamp) }}</span>
      </div>
      
      <div class="availability-card" :class="{'available': searchResults.data.available, 'unavailable': !searchResults.data.available}">
        <div class="availability-icon">
          <span v-if="searchResults.data.available" class="material-symbols-outlined">check_circle</span>
          <span v-else class="material-symbols-outlined">error</span>
        </div>
        <div class="availability-details">
          <h5>{{ searchResults.partNumber }}</h5>
          <p class="availability-status">
            {{ searchResults.data.available ? 'Available' : 'Unavailable' }}
          </p>
          <div v-if="searchResults.data.available" class="price-delivery">
            <span class="price">${{ searchResults.data.price.toFixed(2) }}</span>
            <span class="delivery">{{ searchResults.data.estimatedDelivery }}</span>
          </div>
        </div>
        <button v-if="searchResults.data.available" class="add-to-project-btn hover-effect" @click="addPartToProject">
          Add to Project
        </button>
      </div>
      
      <!-- Alternative Parts -->
      <div v-if="searchResults.data.alternativeParts && searchResults.data.alternativeParts.length > 0" class="alternatives-section">
        <h4>Alternative Parts</h4>
        <ul class="alternatives-list">
          <li v-for="(alt, index) in searchResults.data.alternativeParts" :key="index" class="alternative-item">
            <div class="alt-details">
              <h5>{{ alt.partNumber }}</h5>
              <span class="alt-price">${{ alt.price.toFixed(2) }}</span>
            </div>
            <button class="alt-select-btn hover-effect" @click="selectAlternative(alt)">
              Select
            </button>
          </li>
        </ul>
      </div>
    </div>
    
    <!-- Recent Searches -->
    <div v-if="searchHistory.length > 0" class="recent-searches">
      <h4>Recent Searches</h4>
      <ul class="search-history-list">
        <li v-for="(search, index) in searchHistory" :key="index" class="search-history-item" @click="rerunSearch(search)">
          <div class="search-details">
            <span class="search-part-number">{{ search.partNumber }}</span>
            <span class="search-provider">{{ getProviderName(search.provider) }}</span>
          </div>
          <span class="search-timestamp">{{ formatTimeAgo(search.timestamp) }}</span>
        </li>
      </ul>
    </div>
    
    <!-- Add to Project Modal -->
    <div v-if="showAddToProjectModal" class="modal-overlay" @click.self="showAddToProjectModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h4>Add Part to Project</h4>
          <button class="close-btn" @click="showAddToProjectModal = false">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label for="project-select">Select Project</label>
            <select id="project-select" v-model="selectedProjectId" class="form-control">
              <option value="">Select a project</option>
              <option v-for="project in projects" :key="project.id" :value="project.id">
                {{ project.projectName }}
              </option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="part-name">Part Name</label>
            <input type="text" id="part-name" v-model="newPart.partName" class="form-control" placeholder="Part Name" />
          </div>
          
          <div class="form-group">
            <label for="part-desc">Description</label>
            <textarea id="part-desc" v-model="newPart.partDesc" class="form-control" placeholder="Description"></textarea>
          </div>
          
          <div class="form-actions">
            <button class="cancel-btn" @click="showAddToProjectModal = false">Cancel</button>
            <button class="confirm-btn hover-effect" @click="confirmAddToProject" :disabled="!selectedProjectId || !newPart.partName">
              Add to Project
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
import { useProjectStore } from '@/stores/projectStore';
import { usePartStore } from '@/stores/partStore';
import { useErrorStore } from '@/stores/errorStore';
import { useRouter } from 'vue-router';

const inventoryStore = useInventoryStore();
const projectStore = useProjectStore();
const partStore = usePartStore();
const errorStore = useErrorStore();
const router = useRouter();

// Form state
const partNumber = ref('');
const selectedProviderId = ref('motocraftdb');
const showAddToProjectModal = ref(false);
const selectedProjectId = ref('');
const selectedPart = ref(null);

// Data from stores
const isLoading = computed(() => inventoryStore.isLoading);
const providers = computed(() => inventoryStore.providers);
const searchResults = computed(() => inventoryStore.lastSearchResults);
const searchHistory = computed(() => inventoryStore.searchHistory);
const projects = computed(() => projectStore.projects);

// New part template
const newPart = ref({
  partName: '',
  partNumber: '',
  partDesc: '',
  partStatus: 'Ordered',
  partPriority: 'Medium',
  quantity: 1,
  price: 0,
  provider: ''
});

// Fetch data on mount
onMounted(async () => {
  if (projectStore.projects.length === 0) {
    await projectStore.fetchProjects();
  }
  
  // Pre-fill supplier if provided via props
  if (props.providerId) {
    selectedProviderId.value = props.providerId;
  }
  
  // Pre-fill part number if provided via props
  if (props.initialPartNumber) {
    partNumber.value = props.initialPartNumber;
    searchPart();
  }
});

// Props definition
const props = defineProps({
  initialPartNumber: {
    type: String,
    default: ''
  },
  providerId: {
    type: String,
    default: ''
  },
  projectId: {
    type: String,
    default: ''
  }
});

// Methods
async function searchPart() {
  if (!partNumber.value) {
    errorStore.showError('Please enter a part number');
    return;
  }
  
  await inventoryStore.searchPartAvailability(partNumber.value, selectedProviderId.value);
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleString();
}

function formatTimeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) {
    return 'just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
}

function getProviderName(providerId) {
  const provider = inventoryStore.getProviderById.value(providerId);
  return provider ? provider.name : providerId;
}

function rerunSearch(search) {
  partNumber.value = search.partNumber;
  selectedProviderId.value = search.provider;
  searchPart();
}

function addPartToProject() {
  if (!searchResults.value || !searchResults.value.data.available) {
    return;
  }
  
  // Pre-fill form data
  selectedPart.value = {
    partNumber: searchResults.value.partNumber,
    price: searchResults.value.data.price,
    provider: selectedProviderId.value
  };
  
  newPart.value = {
    partName: searchResults.value.partNumber,
    partNumber: searchResults.value.partNumber,
    partDesc: `Part from ${getProviderName(selectedProviderId.value)}`,
    partStatus: 'Ordered',
    partPriority: 'Medium',
    quantity: 1,
    price: searchResults.value.data.price,
    provider: selectedProviderId.value
  };
  
  // If a project ID was provided via props, pre-select it
  if (props.projectId) {
    selectedProjectId.value = props.projectId;
  }
  
  showAddToProjectModal.value = true;
}

function selectAlternative(alt) {
  // Create a mock search result with the alternative part data
  inventoryStore.lastSearchResults = {
    partNumber: alt.partNumber,
    provider: selectedProviderId.value,
    timestamp: new Date().toISOString(),
    data: {
      available: true,
      price: alt.price,
      estimatedDelivery: '5-7 business days',
      alternativeParts: []
    }
  };
  
  // Update search history
  inventoryStore.searchHistory.unshift({
    partNumber: alt.partNumber,
    provider: selectedProviderId.value,
    timestamp: new Date().toISOString()
  });
  
  if (inventoryStore.searchHistory.length > 10) {
    inventoryStore.searchHistory = inventoryStore.searchHistory.slice(0, 10);
  }
  
  // Update the part number input
  partNumber.value = alt.partNumber;
}

async function confirmAddToProject() {
  if (!selectedProjectId.value || !newPart.value.partName) {
    errorStore.showError('Please select a project and enter a part name');
    return;
  }
  
  try {
    // Add the part to the project
    const partData = {
      ...newPart.value,
      projectId: selectedProjectId.value
    };
    
    await partStore.addPart(partData);
    
    // Close the modal
    showAddToProjectModal.value = false;
    
    // Reset form
    newPart.value = {
      partName: '',
      partNumber: '',
      partDesc: '',
      partStatus: 'Ordered',
      partPriority: 'Medium',
      quantity: 1,
      price: 0,
      provider: ''
    };
    
    // Show success message
    errorStore.showError('Part added to project successfully');
    
    // Navigate to the project
    router.push(`/viewProject/${selectedProjectId.value}`);
  } catch (error) {
    errorStore.showError('Failed to add part to project: ' + error.message);
  }
}
</script>

<style scoped>
.inventory-lookup-container {
  background-color: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  max-width: 900px;
  width: 100%;
  margin: 0 auto;
}

.lookup-header {
  margin-bottom: 24px;
  text-align: center;
}

.lookup-header h3 {
  font-size: 1.5rem;
  color: #1a202c;
  margin-bottom: 8px;
}

.lookup-header p {
  color: #4a5568;
  font-size: 0.95rem;
}

.search-form {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 24px;
}

.form-group {
  flex: 1;
  min-width: 200px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  color: #4a5568;
  font-size: 0.9rem;
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

.search-btn {
  padding: 10px 20px;
  background-color: #4fd1c5;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  margin-top: 24px;
  transition: all 0.2s ease;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 100px;
}

.search-btn:hover:not(:disabled) {
  background-color: #38b2ac;
  transform: translateY(-2px);
}

.search-btn:disabled {
  background-color: #cbd5e0;
  cursor: not-allowed;
}

.loading-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 0.8s linear infinite;
  display: inline-block;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Results Section */
.results-section {
  margin-top: 30px;
  padding: 20px;
  background-color: #f8fafc;
  border-radius: 10px;
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.results-header h4 {
  font-size: 1.2rem;
  color: #1a202c;
  margin: 0;
}

.timestamp {
  font-size: 0.8rem;
  color: #718096;
}

.availability-card {
  display: flex;
  align-items: center;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

.availability-card.available {
  background-color: #f0fff4;
  border-left: 4px solid #48bb78;
}

.availability-card.unavailable {
  background-color: #fff5f5;
  border-left: 4px solid #f56565;
}

.availability-icon {
  margin-right: 16px;
}

.availability-icon .material-symbols-outlined {
  font-size: 32px;
}

.availability-card.available .material-symbols-outlined {
  color: #48bb78;
}

.availability-card.unavailable .material-symbols-outlined {
  color: #f56565;
}

.availability-details {
  flex: 1;
}

.availability-details h5 {
  margin: 0 0 4px 0;
  font-size: 1.1rem;
  color: #1a202c;
}

.availability-status {
  font-weight: 600;
  margin: 0 0 6px 0;
}

.available .availability-status {
  color: #2f855a;
}

.unavailable .availability-status {
  color: #c53030;
}

.price-delivery {
  display: flex;
  align-items: center;
  gap: 16px;
}

.price {
  font-weight: 600;
  font-size: 1.1rem;
  color: #1a202c;
}

.delivery {
  color: #718096;
  font-size: 0.9rem;
}

.add-to-project-btn {
  padding: 8px 16px;
  background-color: #4fd1c5;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}

.add-to-project-btn:hover {
  background-color: #38b2ac;
}

/* Alternative Parts */
.alternatives-section {
  margin-top: 24px;
}

.alternatives-section h4 {
  font-size: 1.1rem;
  color: #1a202c;
  margin-bottom: 12px;
}

.alternatives-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.alternative-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: white;
  border-radius: 8px;
  margin-bottom: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

.alternative-item:hover {
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.alt-details h5 {
  margin: 0 0 4px 0;
  font-size: 1rem;
  color: #1a202c;
}

.alt-price {
  color: #4a5568;
  font-size: 0.9rem;
  font-weight: 600;
}

.alt-select-btn {
  padding: 6px 12px;
  background-color: #4a5568;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.85rem;
  transition: all 0.2s ease;
}

.alt-select-btn:hover {
  background-color: #2d3748;
}

/* Recent Searches */
.recent-searches {
  margin-top: 30px;
}

.recent-searches h4 {
  font-size: 1.1rem;
  color: #1a202c;
  margin-bottom: 12px;
}

.search-history-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.search-history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: white;
  border-radius: 8px;
  margin-bottom: 8px;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

.search-history-item:hover {
  background-color: #f7fafc;
}

.search-details {
  display: flex;
  flex-direction: column;
}

.search-part-number {
  font-weight: 600;
  color: #1a202c;
  font-size: 0.95rem;
}

.search-provider {
  color: #718096;
  font-size: 0.85rem;
  margin-top: 2px;
}

.search-timestamp {
  color: #a0aec0;
  font-size: 0.8rem;
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
  border-radius: 10px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  animation: modalFadeIn 0.3s ease-out;
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
  padding: 16px 24px;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h4 {
  margin: 0;
  font-size: 1.2rem;
  color: #1a202c;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #718096;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.modal-body {
  padding: 24px;
}

.modal-body .form-group {
  margin-bottom: 16px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.cancel-btn {
  padding: 8px 16px;
  background-color: #e2e8f0;
  color: #4a5568;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}

.cancel-btn:hover {
  background-color: #cbd5e0;
}

.confirm-btn {
  padding: 8px 16px;
  background-color: #4fd1c5;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}

.confirm-btn:hover:not(:disabled) {
  background-color: #38b2ac;
}

.confirm-btn:disabled {
  background-color: #cbd5e0;
  cursor: not-allowed;
}

/* Responsive styling */
@media (max-width: 768px) {
  .search-form {
    flex-direction: column;
  }
  
  .search-btn {
    width: 100%;
    margin-top: 8px;
  }
  
  .availability-card {
    flex-direction: column;
    text-align: center;
  }
  
  .availability-icon {
    margin-right: 0;
    margin-bottom: 12px;
  }
  
  .add-to-project-btn {
    margin-top: 16px;
    width: 100%;
  }
  
  .search-history-item {
    flex-direction: column;
    text-align: center;
  }
  
  .search-timestamp {
    margin-top: 8px;
  }
}
</style>