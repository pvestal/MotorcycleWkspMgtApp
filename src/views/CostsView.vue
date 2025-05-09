<template>
  <div class="helpdesk-container">
    <div class="page-header">
      <h1>Cost Management</h1>
      <div class="header-actions">
        <button @click="navigateToAddCost" class="btn primary">
          <span class="icon">+</span> Add New Cost
        </button>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="loading-indicator">
      <div class="spinner"></div>
      <p>Loading costs...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="alert-message error">
      <p>{{ error }}</p>
      <button @click="fetchData" class="btn secondary">
        Try again
      </button>
    </div>

    <!-- Empty state -->
    <div v-else-if="!costs.length" class="empty-state">
      <div class="empty-icon">💰</div>
      <h3>No costs found</h3>
      <p>Get started by adding your first cost.</p>
      <button @click="navigateToAddCost" class="btn primary">
        <span class="icon">+</span> Add New Cost
      </button>
    </div>

    <!-- Costs data -->
    <div v-else class="costs-content">
      <!-- Project filter dropdown -->
      <div class="filter-section">
        <label for="projectFilter" class="filter-label">Filter by Project:</label>
        <select 
          id="projectFilter" 
          v-model="selectedProjectId" 
          @change="filterByProject" 
          class="filter-select"
        >
          <option value="">All Projects</option>
          <option v-for="project in projects" :key="project.projectId" :value="project.projectId">
            {{ project.projectName }}
          </option>
        </select>
      </div>

      <!-- Costs list -->
      <div class="costs-list">
        <div 
          v-for="cost in filteredCosts" 
          :key="cost.id" 
          class="cost-card"
        >
          <div class="cost-header">
            <span class="cost-description">{{ cost.description }}</span>
            <span class="cost-amount">${{ formatCurrency(cost.amount) }}</span>
          </div>
          <div class="cost-meta">
            <span class="project-name">{{ getProjectName(cost.projectId) }}</span>
            <span 
              class="cost-category"
              :class="{
                'blue': cost.category === 'Parts',
                'green': cost.category === 'Labor',
                'purple': cost.category === 'Tools',
                'yellow': cost.category === 'Other'
              }"
            >
              {{ cost.category }}
            </span>
            <span class="cost-date">{{ formatDate(cost.date) }}</span>
          </div>
          <div class="cost-actions">
            <button 
              @click="navigateToEdit(cost.id)" 
              class="btn small"
              title="Edit"
            >
              Edit
            </button>
            <button 
              @click="confirmDelete(cost.id)" 
              class="btn small danger"
              title="Delete"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      <!-- Summary of costs -->
      <div class="summary-section">
        <h2 class="summary-title">Cost Summary</h2>
        <div class="summary-grid">
          <div class="summary-card blue">
            <p class="summary-label">Total Costs</p>
            <p class="summary-value">${{ formatCurrency(totalAmount) }}</p>
          </div>
          <div class="summary-card green">
            <p class="summary-label">Item Count</p>
            <p class="summary-value">{{ filteredCosts.length }}</p>
          </div>
          <div class="summary-card purple">
            <p class="summary-label">Projects</p>
            <p class="summary-value">{{ uniqueProjects.length }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete confirmation modal -->
    <transition name="modal-fade">
      <div v-if="showDeleteModal" class="modal-overlay" @click="showDeleteModal = false">
        <div class="modal-container" @click.stop>
          <div class="modal-header">
            <h2>Delete Cost</h2>
            <button class="modal-close" @click="showDeleteModal = false">&times;</button>
          </div>
          <div class="modal-body">
            <p>Are you sure you want to delete this cost? This action cannot be undone.</p>
            <div class="form-actions">
              <button 
                @click="showDeleteModal = false" 
                class="btn secondary"
              >
                Cancel
              </button>
              <button 
                @click="deleteSelectedCost" 
                class="btn danger"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCostStore } from '@/stores/costStore';
import { useProjectStore } from '@/stores/projectStore';
import { useErrorStore } from '@/stores/errorStore';

// Setup router and stores
const router = useRouter();
const costStore = useCostStore();
const projectStore = useProjectStore();
const errorStore = useErrorStore();

// State variables
const loading = ref(true);
const error = ref(null);
const costs = ref([]);
const projects = ref([]);
const selectedProjectId = ref('');
const showDeleteModal = ref(false);
const costToDelete = ref(null);

// Fetch data on component mount
onMounted(() => {
  fetchData();
});

// Fetch cost and project data
const fetchData = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    // Fetch costs and projects data
    await Promise.all([
      costStore.fetchCosts(),
      projectStore.fetchProjects()
    ]);
    
    // Store in local state
    costs.value = costStore.costs;
    projects.value = projectStore.projects;
  } catch (err) {
    console.error('Error fetching data:', err);
    error.value = 'Failed to load cost data. Please try again.';
  } finally {
    loading.value = false;
  }
};

// Computed properties
const filteredCosts = computed(() => {
  if (!selectedProjectId.value) {
    return costs.value;
  }
  return costs.value.filter(cost => cost.projectId === selectedProjectId.value);
});

const totalAmount = computed(() => {
  return filteredCosts.value.reduce((total, cost) => total + (parseFloat(cost.amount) || 0), 0);
});

const uniqueProjects = computed(() => {
  const projectIds = new Set(costs.value.map(cost => cost.projectId));
  return Array.from(projectIds);
});

// Filter by project
const filterByProject = () => {
  // No need to re-fetch, just filter the existing data
};

// Format currency
const formatCurrency = (value) => {
  return parseFloat(value).toFixed(2);
};

// Format date
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString();
};

// Get project name from ID
const getProjectName = (projectId) => {
  const project = projects.value.find(p => p.projectId === projectId);
  return project ? project.projectName : 'Unknown Project';
};

// Navigation functions
const navigateToAddCost = () => {
  router.push('/addCost');
};

const navigateToEdit = (costId) => {
  router.push(`/editCost/${costId}`);
};

// Delete functions
const confirmDelete = (costId) => {
  costToDelete.value = costId;
  showDeleteModal.value = true;
};

const deleteSelectedCost = async () => {
  if (!costToDelete.value) return;
  
  try {
    await costStore.deleteCost(costToDelete.value);
    costs.value = costs.value.filter(cost => cost.id !== costToDelete.value);
    showDeleteModal.value = false;
    costToDelete.value = null;
  } catch (err) {
    console.error('Error deleting cost:', err);
    errorStore.showError('Failed to delete cost. Please try again.');
  }
};
</script>

<style scoped>
.helpdesk-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-header h1 {
  margin: 0;
  font-size: 28px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

/* Loading indicator */
.loading-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: #4f46e5;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Alert message */
.alert-message {
  padding: 16px;
  border-radius: 6px;
  margin-bottom: 24px;
}

.alert-message.error {
  background-color: #fee2e2;
  border-left: 4px solid #ef4444;
  color: #b91c1c;
}

/* Empty state */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  background-color: #f9fafb;
  border-radius: 8px;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-state h3 {
  margin-bottom: 8px;
  font-size: 20px;
}

.empty-state p {
  margin-bottom: 24px;
  color: #6b7280;
}

/* Buttons */
.btn {
  padding: 10px 16px;
  border-radius: 6px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn.primary {
  background-color: #4f46e5;
  color: white;
}

.btn.primary:hover {
  background-color: #4338ca;
}

.btn.secondary {
  background-color: #f3f4f6;
  color: #1f2937;
}

.btn.secondary:hover {
  background-color: #e5e7eb;
}

.btn.danger {
  background-color: #ef4444;
  color: white;
}

.btn.danger:hover {
  background-color: #dc2626;
}

.btn.small {
  padding: 6px 12px;
  font-size: 14px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.icon {
  display: inline-block;
  margin-right: 4px;
}

/* Filter section */
.filter-section {
  margin-bottom: 24px;
  background-color: white;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.filter-label {
  display: block;
  font-weight: 600;
  margin-bottom: 8px;
  color: #374151;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  width: 100%;
  max-width: 300px;
  background-color: white;
}

/* Costs list */
.costs-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.cost-card {
  padding: 16px;
  border-radius: 8px;
  background-color: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
}

.cost-card:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.cost-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.cost-description {
  font-size: 18px;
  font-weight: 600;
  color: #4f46e5;
}

.cost-amount {
  font-size: 20px;
  font-weight: 700;
  color: #111827;
}

.cost-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
  font-size: 14px;
  color: #6b7280;
}

.project-name {
  font-weight: 500;
}

.cost-category {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.cost-category.blue {
  background-color: #dbeafe;
  color: #1e40af;
}

.cost-category.green {
  background-color: #d1fae5;
  color: #065f46;
}

.cost-category.purple {
  background-color: #ede9fe;
  color: #5b21b6;
}

.cost-category.yellow {
  background-color: #fef3c7;
  color: #92400e;
}

.cost-date {
  color: #6b7280;
}

.cost-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

/* Summary section */
.summary-section {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.summary-title {
  margin-top: 0;
  margin-bottom: 16px;
  font-size: 20px;
  color: #111827;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.summary-card {
  padding: 16px;
  border-radius: 8px;
  text-align: center;
}

.summary-card.blue {
  background-color: #dbeafe;
}

.summary-card.green {
  background-color: #d1fae5;
}

.summary-card.purple {
  background-color: #ede9fe;
}

.summary-label {
  margin: 0 0 4px;
  font-size: 14px;
  font-weight: 500;
  color: #4b5563;
}

.summary-value {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: #111827;
}

/* Modal */
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

.modal-container {
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h2 {
  margin: 0;
  font-size: 20px;
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #6b7280;
}

.modal-body {
  padding: 24px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.modal-fade-enter-active, .modal-fade-leave-active {
  transition: opacity 0.3s;
}

.modal-fade-enter-from, .modal-fade-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .costs-list {
    grid-template-columns: 1fr;
  }
  
  .summary-grid {
    grid-template-columns: 1fr;
  }
  
  .modal-container {
    width: 95%;
  }
}
</style>