<template>
  <div class="helpdesk-container">
    <div class="page-header">
      <h1>Parts Management</h1>
      <div class="header-actions">
        <button @click="navigateToAdd" class="btn primary">
          <span class="icon">+</span> Add New Part
        </button>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="loading-indicator">
      <div class="spinner"></div>
      <p>Loading parts...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="alert-message error">
      <p>{{ error }}</p>
      <button @click="fetchPartsData" class="btn secondary">
        Try again
      </button>
    </div>

    <!-- Empty state -->
    <div v-else-if="!filteredParts.length" class="empty-state">
      <div class="empty-icon">🔧</div>
      <h3>No Parts Found</h3>
      <p>Get started by adding your first part.</p>
      <button @click="navigateToAdd" class="btn primary">
        <span class="icon">+</span> Add New Part
      </button>
    </div>

    <!-- Parts content -->
    <div v-else class="parts-content">
      <!-- Project filter -->
      <div class="project-filter">
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

      <!-- Parts list container -->
      <div class="parts-list-container">
        <h2 v-if="selectedProjectName" class="section-title">
          Parts for Project: {{ selectedProjectName }}
        </h2>
        
        <div v-if="!filteredParts.length" class="empty-message">
          No parts available for the selected filter.
        </div>
        
        <ul v-else class="parts-list">
          <li 
            v-for="part in filteredParts" 
            :key="part.id" 
            class="part-card"
          >
            <div class="part-header">
              <span class="part-name">{{ part.partName }}</span>
              <div class="part-badges">
                <span 
                  class="part-status"
                  :class="{
                    'ordered': part.partStatus === 'Ordered',
                    'shipped': part.partStatus === 'Shipped',
                    'backorder': part.partStatus === 'BackOrder',
                    'installed': part.partStatus === 'Installed'
                  }"
                >
                  {{ part.partStatus }}
                </span>
                <span 
                  class="part-priority"
                  :class="{
                    'high': part.partPriority === 'High',
                    'medium': part.partPriority === 'Medium',
                    'low': part.partPriority === 'Low'
                  }"
                >
                  {{ part.partPriority }}
                </span>
              </div>
            </div>
            
            <div class="part-details">
              <div class="part-meta" v-if="part.partNumber || part.partManufacturer">
                <span v-if="part.partNumber" class="part-number">
                  #{{ part.partNumber }}
                </span>
                <span v-if="part.partManufacturer" class="part-manufacturer">
                  {{ part.partManufacturer }}
                </span>
              </div>
              
              <p v-if="part.partDescription" class="part-description">
                {{ truncateText(part.partDescription, 100) }}
              </p>
            </div>
            
            <div class="part-actions">
              <button @click="navigateToView(part.id)" class="btn small">View</button>
              <button @click="navigateToEdit(part.id)" class="btn small">Edit</button>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { usePartStore } from '@/stores/partStore';
import { useProjectStore } from '@/stores/projectStore';

// Setup stores and router
const partStore = usePartStore();
const projectStore = useProjectStore();
const router = useRouter();

// Component state
const loading = ref(true);
const error = ref(null);
const parts = ref([]);
const selectedProjectId = ref('');

// Computed properties
const projects = computed(() => projectStore.projects || []);

const selectedProjectName = computed(() => {
  if (!selectedProjectId.value) return '';
  const project = projects.value.find(p => p.projectId === selectedProjectId.value);
  return project ? project.projectName : '';
});

const filteredParts = computed(() => {
  if (!selectedProjectId.value) return parts.value;
  return parts.value.filter(part => part.projectId === selectedProjectId.value);
});

// Fetch data on component mount
onMounted(async () => {
  await fetchPartsData();
});

// Methods
async function fetchPartsData() {
  loading.value = true;
  error.value = null;
  
  try {
    // Fetch projects for filter dropdown
    await projectStore.fetchProjects();
    
    // Fetch all parts
    await partStore.fetchParts();
    parts.value = partStore.parts || [];
  } catch (err) {
    console.error('Error fetching data:', err);
    error.value = 'Failed to load parts. Please try again.';
  } finally {
    loading.value = false;
  }
}

function filterByProject() {
  // No need to refetch - we're filtering locally
}

function navigateToAdd() {
  if (selectedProjectId.value) {
    router.push(`/addPart/${selectedProjectId.value}`);
  } else {
    router.push('/addPart');
  }
}

function navigateToEdit(partId) {
  router.push(`/editPart/${partId}`);
}

function navigateToView(partId) {
  router.push(`/viewPart/${partId}`);
}

function truncateText(text, maxLength) {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}
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

/* Parts content */
.parts-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Project filter */
.project-filter {
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

/* Parts list container */
.parts-list-container {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.section-title {
  padding: 16px;
  margin: 0;
  font-size: 18px;
  border-bottom: 1px solid #e5e7eb;
  background-color: #f9fafb;
}

.empty-message {
  padding: 24px;
  text-align: center;
  color: #6b7280;
  font-style: italic;
}

/* Parts list */
.parts-list {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.part-card {
  display: flex;
  flex-direction: column;
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
  transition: all 0.2s;
}

.part-card:last-child {
  border-bottom: none;
}

.part-card:hover {
  background-color: #f9fafb;
}

.part-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.part-name {
  font-size: 18px;
  font-weight: 600;
  color: #4f46e5;
}

.part-badges {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.part-status, .part-priority {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

/* Status badges */
.part-status.ordered {
  background-color: #dbeafe;
  color: #1e40af;
}

.part-status.shipped {
  background-color: #e0e7ff;
  color: #4338ca;
}

.part-status.backorder {
  background-color: #fef3c7;
  color: #92400e;
}

.part-status.installed {
  background-color: #d1fae5;
  color: #065f46;
}

/* Priority badges */
.part-priority.high {
  background-color: #fee2e2;
  color: #b91c1c;
}

.part-priority.medium {
  background-color: #fef3c7;
  color: #92400e;
}

.part-priority.low {
  background-color: #d1fae5;
  color: #065f46;
}

.part-details {
  margin-bottom: 16px;
}

.part-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 8px;
  font-size: 14px;
  color: #6b7280;
}

.part-number {
  font-family: monospace;
}

.part-manufacturer {
  font-weight: 500;
}

.part-description {
  margin: 0;
  font-size: 14px;
  color: #4b5563;
  line-height: 1.5;
}

.part-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

/* Responsive */
@media (max-width: 768px) {
  .part-header {
    flex-direction: column;
    gap: 8px;
  }
  
  .part-badges {
    justify-content: flex-start;
  }
}
</style>