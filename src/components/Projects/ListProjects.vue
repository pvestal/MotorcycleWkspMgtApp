<template>
  <div class="projects-container">
    <h2>Projects List</h2>
    <button class="btn-add-project" @click="navigateToAdd">
      <span class="material-symbols-outlined">add_circle</span> Add Project
    </button>

    <!-- Show message if no projects are available -->
    <div v-if="!projectsWithTasksPartsAndCosts.length">
      <p>No projects available to display.</p>
    </div>

    <div v-else>
      <!-- Wrap the cards in the .project-cards div -->
      <div class="project-cards">
        <div v-for="project in projectsWithTasksPartsAndCosts" :key="project.projectId" class="project-card">
          <!-- Project details section -->
          <div v-if="project" class="project-details">
            <h3>{{ project.projectName }}</h3>
            <span class="material-symbols-outlined"></span>
            <p><strong>Project ID:</strong> {{ project.projectId }}</p>
            <p><strong>Status:</strong> <span :class="statusClass(project.status)">{{ project.status }}</span></p>
            <p><strong>Tasks Count:</strong> {{ project.tasksCount }}</p>
            <p><strong>Total Hours:</strong> {{ project.totalNbrHrs }}</p>
            <p><strong>Total Costs:</strong> {{ project.totalCosts }}</p>
            <p><strong>Total Images:</strong> {{ projectImagesCount(project.projectId) }}</p>
          </div>

          <!-- Project action buttons -->
          <div class="project-actions">
            <button @click="navigateToEdit(project.projectId)" class="action-button">
              <span class="material-symbols-outlined">edit</span> Edit
            </button>
            <button @click="navigateToView(project.projectId)" class="action-button">
              <span class="material-symbols-outlined">visibility</span> View
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>



<script setup>
import { onMounted, computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useProjectStore } from '@/stores/projectStore';
import { useStorageStore } from '@/stores/storageStore';
import { useTaskStore } from '@/stores/taskStore';
import { usePartStore } from '@/stores/partStore';
import { useCostStore } from '@/stores/costStore';

// Set up stores and router
const projectStore = useProjectStore();
const storageStore = useStorageStore();
const taskStore = useTaskStore();
const partStore = usePartStore();
const costStore = useCostStore();
const router = useRouter();

// Define projectImages as a reactive object
const projectImages = ref({});

// Method to get total images count for a project
const projectImagesCount = (projectId) => {
  return projectImages.value[projectId] ? projectImages.value[projectId].length : 0;
};

onMounted(async () => {
  // Fetch project-related data
  await projectStore.fetchProjects();
  await taskStore.fetchTasks();
  await partStore.fetchParts();
  await costStore.fetchCosts();

  // Fetch images for each project individually
  for (const project of projectStore.projects) {
    try {
      // Fetch project-specific images
      const images = await storageStore.fetchProjectImages(project.projectId);
      // console.log(images)
      // Store the images in projectImages under the projectId
      projectImages.value[project.projectId] = images;
    } catch (error) {
      console.error(`Failed to fetch images for project ${project.projectId}:`, error.message);
      projectImages.value[project.projectId] = []; // Ensure empty array if fetching images fails
    }
  }
});

// Computed property for projects with tasks, parts, and costs
const projectsWithTasksPartsAndCosts = computed(() => {
  return projectStore.projects && projectStore.projects.length > 0
    ? projectStore.projects.map((project) => {
      const projectTasks = taskStore.getTasksByProjectId(project.projectId);
      const tasksCount = projectTasks.length;
      const totalNbrHrs = projectTasks.reduce((sum, task) => sum + task.NbrHrs, 0);

      const projectParts = partStore.getPartsByProjectId(project.projectId);
      const partsCount = projectParts.length;

      const projectCosts = costStore.getCostsByProjectId(project.projectId);
      const totalCosts = projectCosts.reduce((sum, cost) => sum + cost.amount, 0);

      return {
        ...project,
        tasksCount,
        totalNbrHrs,
        partsCount,
        totalCosts,
      };
    })
    : [];
});

// Navigation
const navigateToAdd = () => router.push('/addProject');
const navigateToEdit = (id) => router.push(`/editProject/${id}`);
const navigateToView = (id) => router.push(`/viewProject/${id}`);

// Status Class
const statusClass = (status) => {
  if (!status) return '';
  switch (status.toLowerCase()) {
    case 'in progress': return 'status in-progress';
    case 'completed': return 'status completed';
    case 'on hold': return 'status on-hold';
    default: return 'status';
  }
};
</script>


<style scoped>
/* Container for the project list and add button */
.projects-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

h2 {
  text-align: center;
  margin-bottom: 20px;
}

.btn-add-project {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s ease;
}

.btn-add-project:hover {
  background-color: #0056b3;
}

.btn-add-project span {
  margin-right: 8px;
  font-size: 24px;
}

/* Project card styles */
.project-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
}

.project-card {
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.project-image-wrapper {
  width: 150px;
  height: 150px;
  overflow: hidden;
}

.project-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.project-details {
  padding: 15px;
  flex-grow: 1;
}

.project-details h3 {
  margin: 0;
  margin-bottom: 10px;
  font-size: 18px;
  color: #333;
}

.project-details p {
  margin: 5px 0;
  color: #666;
}

.project-actions {
  display: flex;
  justify-content: space-between;
  padding: 10px 15px;
  background-color: #f7f7f7;
  border-top: 1px solid #ddd;
}

.action-button {
  display: flex;
  align-items: center;
  background: none;
  border: none;
  color: #007bff;
  cursor: pointer;
  font-size: 14px;
  transition: color 0.3s ease;
}

.action-button span {
  margin-right: 4px;
}

.action-button:hover {
  color: #0056b3;
}

/* Status classes */
.status {
  display: inline-block;
  padding: 3px 7px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
}

.status.in-progress {
  background-color: #e3f2fd;
  color: #1e88e5;
}

.status.completed {
  background-color: #c8e6c9;
  color: #2e7d32;
}

.status.on-hold {
  background-color: #ffe082;
  color: #f57f17;
}
</style>
