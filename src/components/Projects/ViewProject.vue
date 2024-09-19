<template>
  <div v-if="project" class="project-detail-container">
    <button @click="router.back()">Back</button>
    <button @click="toggleEditMode">{{ isEditing ? 'Cancel' : 'Edit' }}</button>

    <!-- Project Form or Display -->
    <div v-if="isEditing">
      <!-- Use ProjectForm for editing -->
      <ProjectForm
        :isEditing="true"
        :initialFormData="project"
        @saveProject="handleProjectSave"
        @cancelEdit="toggleEditMode"
      />
    </div>
    <div v-else>
      <!-- Display project details -->
      <h1 v-if="project.projectName">{{ project.projectName }}</h1>
      <p>Project ID: {{ project.projectId }}</p>

      <div class="project-meta">
        <p><strong>Status:</strong> {{ project.status }}</p>
        <p><strong>Owner:</strong> {{ project.owner }}</p>
        <p><strong>Start Date:</strong> {{ formatDate(project.startDate) }}</p>
        <p v-if="project.endDate"><strong>End Date:</strong> {{ formatDate(project.endDate) }}</p>
        <!-- Display vehicle details -->
        <p><strong>VIN:</strong> {{ project.vin }}</p>
        <p><strong>Make:</strong> {{ project.make }}</p>
        <p><strong>Model:</strong> {{ project.model }}</p>
        <p><strong>Year:</strong> {{ project.year }}</p>
        <!-- Add other vehicle fields as needed -->
      </div>
    </div>

    <!-- Images Section -->
    <section class="project-section">
      <div class="section-header">
        <h2>Images</h2>
        <span class="material-symbols-outlined" @click="toggleSection('imagesVisible')">
          {{ imagesVisible ? 'expand_less' : 'expand_more' }}
        </span>
      </div>

      <div v-if="imagesVisible" class="project-images">
        <div v-if="project.imageUrls && project.imageUrls.length" class="image-gallery">
          <div v-for="(image, index) in project.imageUrls" :key="index" class="image-wrapper">
            <!-- {{ url }} -->
            <img :src="image.url" alt="image.?fileName" class="uploaded-image" />
          </div>
        </div>
      </div>
    </section>

    <!-- Tasks Section -->
    <section class="project-section">
      <div class="section-header">
        <h2>Tasks</h2>
        <span class="material-symbols-outlined" @click="toggleSection('tasksVisible')">
          {{ tasksVisible ? 'expand_less' : 'expand_more' }}
        </span>
      </div>
      <ListTasks v-if="tasksVisible && tasks.length" :projectId="projectId" :projectName="projectName" :tasks="tasks" />


      <p v-else>Tasks hidden or project not available.</p>
    </section>

    <!-- Parts Section -->
    <section class="project-section">
      <div class="section-header">
        <h2>Parts</h2>
        <span class="material-symbols-outlined" @click="toggleSection('partsVisible')">
          {{ partsVisible ? 'expand_less' : 'expand_more' }}
        </span>
      </div>
      <ListParts v-if="partsVisible && parts.length" :projectId="projectId" :projectName="projectName" :parts="parts" />

      <p v-else>No parts available.</p>
    </section>

    <!-- Costs Section -->
    <section class="project-section">
      <div class="section-header">
        <h2>Costs</h2>
        <span class="material-symbols-outlined" @click="toggleSection('costsVisible')">
          {{ costsVisible ? 'expand_less' : 'expand_more' }}
        </span>
      </div>
      <ListCosts v-if="costsVisible && costs.length" :projectId="projectId" :projectName="projectName" :costs="costs" />

      <p v-else>No costs available.</p>
    </section>
  </div>

  <div v-else>
    <p>Loading project details...</p>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useProjectStore } from '@/stores/projectStore';
import { useTaskStore } from '@/stores/taskStore';
import { usePartStore } from '@/stores/partStore';
import { useCostStore } from '@/stores/costStore';
import { useErrorStore } from '@/stores/errorStore';

import ListTasks from '@/components/Tasks/ListTasks.vue';
import ListCosts from '@/components/Costs/ListCosts.vue';
import ListParts from '@/components/Parts/ListParts.vue';
import ProjectForm from '@/components/Projects/ProjectForm.vue'; 

// Initialize necessary hooks and stores
const route = useRoute();
const router = useRouter();
const projectStore = useProjectStore();
const taskStore = useTaskStore();
const partStore = usePartStore();
const costStore = useCostStore();
const errorStore = useErrorStore();

// Reactive references
const project = ref(null);
const tasks = ref([]);
const parts = ref([]);
const costs = ref([]);
const isEditing = ref(false); // Flag to determine edit mode

// Section visibility states
const mainVisible = ref(true);
const tasksVisible = ref(true);
const partsVisible = ref(true);
const costsVisible = ref(true);
const imagesVisible = ref(true);

// Computed properties for projectId and projectName
const projectId = computed(() => project.value?.projectId);
const projectName = computed(() => project.value?.projectName);

// Load project data function
const loadProjectData = async (id) => {
  try {
    // Fetch all projects and tasks
    await projectStore.fetchProjects();
    await taskStore.fetchTasks();
    await partStore.fetchParts();
    await costStore.fetchCosts();

    // Retrieve the specific project
    project.value = projectStore.fetchProjectById(id);

    // Retrieve tasks, parts, and costs for the project
    tasks.value = taskStore.fetchTasksByProjectId(id);
    parts.value = partStore.fetchPartsByProjectId(id);
    costs.value = costStore.fetchCostsByProject(id);

    if (!project.value) {
      errorStore.showError('Project not found');
      router.push('/projects');
    }
  } catch (error) {
    errorStore.showError('Something went wrong while fetching project data.');
    console.error(error);
  }
};

// Use onMounted to load project data
onMounted(async () => {
  const id = route.params.id;
  if (id) {
    await loadProjectData(id);
  }
});

// Watch for changes in route params
watch(
  () => route.params.id,
  async (newId) => {
    if (newId) {
      await loadProjectData(newId);
    }
  }
);

// Toggle edit mode
const toggleEditMode = () => {
  isEditing.value = !isEditing.value;
};

// Handle project save event from ProjectForm
const handleProjectSave = async (updatedProject) => {
  try {
    await projectStore.updateProject(route.params.id, updatedProject);
    project.value = { ...updatedProject };
    isEditing.value = false;
  } catch (error) {
    errorStore.showError('Error saving project: ' + error.message);
  }
};

// Format date function
const formatDate = (date) => {
  return new Date(date).toLocaleDateString();
};
</script>



<style scoped>
.project-detail-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f5f5f5;
  border-radius: 8px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
}

.project-detail-container h1 {
  font-size: 2em;
  margin-bottom: 16px;
  color: #333;
}

.project-meta p {
  margin-bottom: 8px;
  font-size: 1.2em;
}

.project-section {
  margin-top: 20px;
  padding: 20px;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.material-symbols-outlined {
  cursor: pointer;
  font-size: 24px;
  color: #007bff;
}

.material-symbols-outlined:hover {
  color: #0056b3;
}

.image-gallery {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.image-wrapper {
  position: relative;
  width: 200px;
  height: 200px;
  overflow: hidden;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.uploaded-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.delete-button {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 5px 10px;
  background-color: #ff4d4d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.delete-button:hover {
  background-color: #d80000;
}
</style>
