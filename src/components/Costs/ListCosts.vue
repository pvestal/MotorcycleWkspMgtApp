<template>
  <div class="max-w-6xl mx-auto p-4">
    <div class="mb-6 flex justify-between items-center">
      <h2 class="text-2xl font-bold text-gray-800">Costs List</h2>
      <button 
        @click="navigateToAdd" 
        class="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-300"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
        </svg>
        Add Cost
      </button>
    </div>

    <!-- Project filter dropdown -->
    <div v-if="showProjectFilter" class="mb-6">
      <label for="projectFilter" class="block text-sm font-medium text-gray-700 mb-1">Filter by Project:</label>
      <select 
        id="projectFilter" 
        v-model="selectedProjectId" 
        @change="filterByProject" 
        class="w-full md:w-64 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">All Projects</option>
        <option v-for="project in projects" :key="project.projectId" :value="project.projectId">
          {{ project.projectName }}
        </option>
      </select>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="flex justify-center items-center p-12">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
      <p>{{ error }}</p>
    </div>

    <!-- No costs state -->
    <div v-else-if="!filteredCosts.length" class="bg-gray-50 py-12 px-4 rounded-lg text-center">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
      <p class="text-gray-600 text-lg">No costs found</p>
      <p class="text-gray-500 mt-2">Start by adding costs to your projects</p>
    </div>

    <!-- Costs data -->
    <div v-else>
      <!-- Cost summary by project -->
      <div v-if="showSummary" class="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div 
          v-for="project in projectsWithCosts" 
          :key="project.projectId" 
          class="bg-white rounded-lg shadow-md overflow-hidden"
        >
          <div class="bg-blue-600 text-white px-4 py-3">
            <h3 class="font-semibold truncate">{{ project.projectName }}</h3>
          </div>
          <div class="p-4">
            <div class="grid grid-cols-2 gap-4 mb-3">
              <div>
                <p class="text-sm text-gray-500">Total Costs</p>
                <p class="text-xl font-bold">${{ formatCurrency(project.totalCosts) }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">Costs Count</p>
                <p class="text-xl font-bold">{{ project.costsCount }}</p>
              </div>
            </div>
            <div class="border-t border-gray-200 pt-3">
              <button 
                @click="viewProject(project.projectId)" 
                class="w-full text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View Details
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Costs list -->
      <div class="bg-white shadow-md rounded-lg overflow-hidden">
        <div class="hidden md:grid md:grid-cols-12 bg-gray-50 p-4 border-b border-gray-200">
          <div class="md:col-span-3 font-medium text-gray-700">Description</div>
          <div class="md:col-span-2 font-medium text-gray-700">Amount</div>
          <div class="md:col-span-2 font-medium text-gray-700">Category</div>
          <div class="md:col-span-2 font-medium text-gray-700">Date</div>
          <div class="md:col-span-2 font-medium text-gray-700">Project</div>
          <div class="md:col-span-1 font-medium text-gray-700 text-right">Actions</div>
        </div>

        <div class="divide-y divide-gray-200">
          <div 
            v-for="cost in filteredCosts" 
            :key="cost.id" 
            class="p-4 hover:bg-gray-50 transition-colors duration-150 md:grid md:grid-cols-12 md:gap-4 items-center"
          >
            <!-- Mobile layout (stacked) -->
            <div class="md:hidden space-y-2 mb-4">
              <div class="font-semibold">{{ cost.description }}</div>
              <div class="flex justify-between">
                <span class="text-gray-600">Amount:</span>
                <span class="font-bold">${{ formatCurrency(cost.amount) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Category:</span>
                <span>{{ cost.category }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Date:</span>
                <span>{{ formatDate(cost.date) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Project:</span>
                <span>{{ getProjectName(cost.projectId) }}</span>
              </div>
            </div>

            <!-- Desktop layout (grid) -->
            <div class="hidden md:block md:col-span-3">{{ cost.description }}</div>
            <div class="hidden md:block md:col-span-2 font-semibold">${{ formatCurrency(cost.amount) }}</div>
            <div class="hidden md:block md:col-span-2">
              <span 
                :class="{
                  'bg-blue-100 text-blue-800': cost.category === 'Parts',
                  'bg-green-100 text-green-800': cost.category === 'Labor',
                  'bg-purple-100 text-purple-800': cost.category === 'Tools',
                  'bg-yellow-100 text-yellow-800': cost.category === 'Other'
                }"
                class="px-2 py-1 rounded-full text-xs font-medium"
              >
                {{ cost.category }}
              </span>
            </div>
            <div class="hidden md:block md:col-span-2">{{ formatDate(cost.date) }}</div>
            <div class="hidden md:block md:col-span-2 truncate">{{ getProjectName(cost.projectId) }}</div>
            
            <!-- Actions (both mobile and desktop) -->
            <div class="flex justify-end space-x-2 md:col-span-1">
              <button 
                @click="navigateToEdit(cost.id)" 
                class="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded"
                title="Edit"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button 
                @click="navigateToView(cost.id)" 
                class="p-1 text-green-600 hover:text-green-800 hover:bg-green-100 rounded"
                title="View"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
              <button 
                @click="confirmDelete(cost.id)" 
                class="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded"
                title="Delete"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Total costs summary -->
      <div class="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200 flex justify-between items-center">
        <div>
          <p class="text-gray-600">Total Costs:</p>
          <p class="text-2xl font-bold text-blue-600">${{ formatCurrency(totalCosts) }}</p>
        </div>
        <div>
          <p class="text-gray-600">Total Records:</p>
          <p class="text-2xl font-bold text-gray-800">{{ filteredCosts.length }}</p>
        </div>
      </div>
    </div>
  </div>

  <!-- Delete confirmation modal -->
  <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 max-w-md w-full">
      <h3 class="text-lg font-bold mb-4">Confirm Delete</h3>
      <p class="mb-6">Are you sure you want to delete this cost? This action cannot be undone.</p>
      <div class="flex justify-end space-x-4">
        <button 
          @click="showDeleteModal = false" 
          class="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md"
        >
          Cancel
        </button>
        <button 
          @click="deleteSelectedCost" 
          class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * ListCosts Component
 * 
 * This component displays a list of costs associated with projects.
 * It provides functionality to filter, view, edit, and delete costs.
 */

import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCostStore } from '@/stores/costStore';
import { useProjectStore } from '@/stores/projectStore';
import { useErrorStore } from '@/stores/errorStore';
import { Cost, Project } from '@/types/interfaces';

// Props
const props = defineProps<{
  projectId?: string;
  costs?: Cost[];
  showProjectFilter?: boolean;
  showSummary?: boolean;
}>();

// Default values for props
const showProjectFilter = props.showProjectFilter !== undefined ? props.showProjectFilter : true;
const showSummary = props.showSummary !== undefined ? props.showSummary : true;

// Router and stores
const router = useRouter();
const costStore = useCostStore();
const projectStore = useProjectStore();
const errorStore = useErrorStore();

// Component state
const loading = ref(false);
const error = ref<string | null>(null);
const selectedProjectId = ref(props.projectId || '');
const showDeleteModal = ref(false);
const costToDelete = ref<string | null>(null);

// Fetch data
onMounted(async () => {
  loading.value = true;
  error.value = null;
  
  try {
    // Fetch projects if showing project filter or summary
    if (showProjectFilter || showSummary) {
      await projectStore.fetchProjects();
    }
    
    // Fetch costs if not provided via props
    if (!props.costs) {
      if (props.projectId) {
        await costStore.fetchCostsByProject(props.projectId);
      } else {
        await costStore.fetchCosts();
      }
    }
  } catch (err) {
    if (err instanceof Error) {
      error.value = err.message;
    } else {
      error.value = 'An unknown error occurred';
    }
  } finally {
    loading.value = false;
  }
});

// Computed properties
const projects = computed(() => projectStore.projects);

const filteredCosts = computed(() => {
  // Use props.costs if provided, otherwise use costs from the store
  const allCosts = props.costs || costStore.costs;
  
  // Filter by selected project if applicable
  return selectedProjectId.value
    ? allCosts.filter(cost => cost.projectId === selectedProjectId.value)
    : allCosts;
});

const totalCosts = computed(() => {
  return filteredCosts.value.reduce((sum, cost) => sum + (parseFloat(cost.amount.toString()) || 0), 0);
});

const projectsWithCosts = computed(() => {
  // Use props.costs if provided, otherwise use costs from the store
  const allCosts = props.costs || costStore.costs;
  
  return projects.value.map(project => {
    const projectCosts = allCosts.filter(cost => cost.projectId === project.projectId);
    const totalCosts = projectCosts.reduce((sum, cost) => sum + (parseFloat(cost.amount.toString()) || 0), 0);
    
    return {
      ...project,
      costsCount: projectCosts.length,
      totalCosts
    };
  }).filter(project => project.costsCount > 0);
});

// Methods
/**
 * Filter costs by project
 */
const filterByProject = () => {
  // If using props.costs, no need to fetch from the store
  if (props.costs) return;
  
  if (selectedProjectId.value) {
    costStore.fetchCostsByProject(selectedProjectId.value);
  } else {
    costStore.fetchCosts();
  }
};

/**
 * Get project name by ID
 * @param projectId - The ID of the project
 * @returns The name of the project or 'Unknown Project' if not found
 */
const getProjectName = (projectId: string): string => {
  const project = projects.value.find(p => p.projectId === projectId);
  return project ? project.projectName : 'Unknown Project';
};

/**
 * Format a date as a localized string
 * @param dateString - The date string to format
 * @returns Formatted date string
 */
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString();
};

/**
 * Format a number as currency
 * @param value - The number to format
 * @returns Formatted currency string
 */
const formatCurrency = (value: number): string => {
  return value.toFixed(2);
};

/**
 * Navigate to add cost page
 */
const navigateToAdd = () => {
  if (selectedProjectId.value) {
    router.push(`/addCost/${selectedProjectId.value}`);
  } else {
    router.push('/addCost');
  }
};

/**
 * Navigate to edit cost page
 * @param id - The ID of the cost to edit
 */
const navigateToEdit = (id: string) => {
  router.push(`/editCost/${id}`);
};

/**
 * Navigate to view cost page
 * @param id - The ID of the cost to view
 */
const navigateToView = (id: string) => {
  router.push(`/viewCost/${id}`);
};

/**
 * Navigate to view project page
 * @param id - The ID of the project to view
 */
const viewProject = (id: string) => {
  router.push(`/viewProject/${id}`);
};

/**
 * Show delete confirmation modal
 * @param id - The ID of the cost to delete
 */
const confirmDelete = (id: string) => {
  costToDelete.value = id;
  showDeleteModal.value = true;
};

/**
 * Delete the selected cost
 */
const deleteSelectedCost = async () => {
  if (!costToDelete.value) return;
  
  try {
    await costStore.deleteCost(costToDelete.value);
    showDeleteModal.value = false;
    costToDelete.value = null;
  } catch (err) {
    if (err instanceof Error) {
      errorStore.showError(err.message);
    } else {
      errorStore.showError('An unknown error occurred while deleting the cost');
    }
  }
};
</script>