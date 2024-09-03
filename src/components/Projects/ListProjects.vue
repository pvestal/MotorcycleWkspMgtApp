<template>
  <div class="projects-container">
    <h2>Projects List</h2>
    <!-- Button to navigate to add a new project -->
    <button class="btn-add-project" @click="navigateToAdd">
      <span class="material-symbols-outlined">add_circle</span> Add Project
    </button>

    <div class="project-cards">
      <div v-for="project in projectsWithTasksAndCosts" :key="project.projectId" class="project-card">
        <div class="project-image-wrapper">
          <img
            v-if="project.imageURL"
            :src="project.imageURL"
            alt="Project Image"
            class="project-image"
          />
          <img
            v-else
            src="https://placehold.co/600x400"
            alt="Placeholder Image"
            class="project-image"
          />
        </div>

        <div class="project-details">
          <h3>{{ project.projectName }}</h3>
          <p><strong>Project ID:</strong> {{ project.projectId }}</p>
          <p><strong>Status:</strong> <span :class="statusClass(project.status)">{{ project.status }}</span></p>
          <p><strong>Tasks Count:</strong> {{ project.tasksCount }}</p>
          <p><strong>Total Hours:</strong> {{ project.totalNbrHrs }}</p>
          <p><strong>Total Costs:</strong> {{ project.totalCosts }}</p>
        </div>

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
</template>

<script setup>
import { onMounted, computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useProjectStore } from '@/stores/projectStore';
import { useTaskStore } from '@/stores/taskStore';
import { useCostStore } from '@/stores/costStore';

// Set up router, project store, task store, and cost store
const projectStore = useProjectStore();
const taskStore = useTaskStore();
const costStore = useCostStore();
const router = useRouter();

const tasks = ref([]);
const costs = ref([]);

// Computed property for projects with task counts and total costs
const projectsWithTasksAndCosts = computed(() => {
  const uniqueProjects = new Map();

  projectStore.projects.forEach((project) => {
    const projectTasks = taskStore.getTasksByProjectId(project.projectId);
    const tasksCount = projectTasks.length;
    const totalNbrHrs = projectTasks.reduce((sum, task) => sum + task.NbrHrs, 0);

    const projectCosts = costStore.getCostsByProjectId(project.projectId);
    const totalCosts = projectCosts.reduce((sum, cost) => sum + cost.amount, 0);

    // Avoid adding duplicate projects
    if (!uniqueProjects.has(project.projectId)) {
      uniqueProjects.set(project.projectId, {
        ...project,
        tasksCount,
        totalNbrHrs,
        totalCosts,
      });
    }
  });

  return Array.from(uniqueProjects.values()); // Convert back to an array
});

onMounted(async () => {
  await projectStore.fetchProjects();
  await taskStore.fetchTasks();
  await costStore.fetchCosts(); 
});

// Navigation functions
const navigateToAdd = () => {
  router.push('/addProject');
};

const navigateToEdit = (id) => {
  router.push(`/editProject/${id}`);
};

const navigateToView = (id) => {
  console.log(id)
  router.push(`/viewProject/${id}`);
};

// Method to determine the class for status styling
const statusClass = (status) => {
  if (!status) return ''; // Return an empty string if status is undefined or null
  
  switch (status.toLowerCase()) {
    case 'in progress':
      return 'status in-progress';
    case 'completed':
      return 'status completed';
    case 'on hold':
      return 'status on-hold';
    default:
      return 'status';
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
  gap: 20px;
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
  width: 100%;
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
