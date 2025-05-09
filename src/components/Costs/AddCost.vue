<template>
  <div class="max-w-4xl mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold text-gray-900 mb-6">Add New Cost</h1>
    
    <!-- Project selection if no projectId is provided -->
    <div v-if="!projectId" class="mb-8 bg-white shadow rounded-lg p-6">
      <h2 class="text-lg font-medium text-gray-900 mb-4">Select Project</h2>
      
      <div v-if="loading" class="flex justify-center py-4">
        <div class="animate-spin h-8 w-8 border-t-2 border-b-2 border-blue-500 rounded-full"></div>
      </div>
      
      <div v-else-if="!projects.length" class="py-4 text-center text-gray-500">
        No projects available. <router-link to="/addProject" class="text-blue-600 hover:text-blue-800">Create a project</router-link> first.
      </div>
      
      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div 
          v-for="project in projects" 
          :key="project.projectId" 
          class="border rounded-lg p-4 cursor-pointer hover:bg-blue-50 transition-colors"
          :class="{ 'border-blue-500 bg-blue-50': selectedProjectId === project.projectId }"
          @click="selectProject(project.projectId)"
        >
          <div class="font-medium">{{ project.projectName }}</div>
          <div class="text-sm text-gray-500">{{ project.status }}</div>
        </div>
      </div>
      
      <div class="mt-6 flex justify-end">
        <button 
          @click="confirmProjectSelection" 
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          :disabled="!selectedProjectId"
        >
          Continue
        </button>
      </div>
    </div>
    
    <!-- Cost form (only shown if projectId is provided or selected) -->
    <div v-if="projectId || (selectedProjectId && showCostForm)">
      <CostForm :projectId="projectId || selectedProjectId" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useProjectStore } from '@/stores/projectStore';
import CostForm from './CostForm.vue';

const route = useRoute();
const projectStore = useProjectStore();

// State variables
const loading = ref(false);
const projects = ref([]);
const selectedProjectId = ref('');
const showCostForm = ref(false);

// Get projectId from route params if available
const projectId = route.params.projectId;

// Fetch available projects if no projectId is provided
onMounted(async () => {
  if (!projectId) {
    loading.value = true;
    try {
      await projectStore.fetchProjects();
      projects.value = projectStore.projects;
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      loading.value = false;
    }
  }
});

// Select a project
const selectProject = (id) => {
  selectedProjectId.value = id;
};

// Confirm project selection and show cost form
const confirmProjectSelection = () => {
  if (selectedProjectId.value) {
    showCostForm.value = true;
  }
};
</script>