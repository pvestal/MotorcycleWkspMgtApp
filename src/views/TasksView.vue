<template>
  <div class="helpdesk-container">
    <div class="page-header">
      <h1>Task Management</h1>
      <div class="header-actions">
        <button @click="navigateToAddTask" class="btn primary">
          <span class="icon">+</span> Create New Task
        </button>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="loading-indicator">
      <div class="spinner"></div>
      <p>Loading tasks...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="alert-message error">
      <p>{{ error }}</p>
      <button @click="fetchTasksData" class="btn secondary">
        Try again
      </button>
    </div>

    <!-- Empty state -->
    <div v-else-if="!hasAnyTasks" class="empty-state">
      <div class="empty-icon">📋</div>
      <h3>No Tasks Found</h3>
      <p>Get started by creating a new task for one of your projects.</p>
      <button @click="navigateToAddTask" class="btn primary">
        <span class="icon">+</span> Create New Task
      </button>
    </div>

    <!-- Project filter -->
    <div v-else class="project-filter">
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

    <!-- Tasks content -->
    <div v-if="hasTasksToShow" class="tasks-content">
      <div v-for="project in filteredProjects" :key="project.projectId" class="project-tasks-container">
        <div class="project-header">
          <h2>{{ project.projectName }}</h2>
          <button @click="navigateToAddTaskForProject(project.projectId)" class="btn small">
            <span class="icon">+</span> Add Task
          </button>
        </div>
        
        <ul class="task-list">
          <li 
            v-for="task in filteredTasks(project.projectId)" 
            :key="task.id" 
            class="task-card"
            :class="{
              'high-priority': task.priority === 'High',
              'completed': task.status === 'Completed'
            }"
          >
            <div class="task-header">
              <span class="task-title">{{ task.taskTitle }}</span>
              <div class="task-badges">
                <span class="task-hours" v-if="task.nbrHrs">{{ task.nbrHrs }} hrs</span>
                <span class="task-status" :class="task.status.toLowerCase().replace(' ', '-')">
                  {{ task.status }}
                </span>
                <span class="task-priority" :class="task.priority.toLowerCase()">
                  {{ task.priority }}
                </span>
              </div>
            </div>
            
            <p class="task-description" v-if="task.taskDescription">
              {{ truncateDescription(task.taskDescription) }}
            </p>
            
            <div class="task-actions">
              <button @click="navigateToView(task.id)" class="btn small">View</button>
              <button @click="navigateToEdit(task.id)" class="btn small">Edit</button>
              <button @click="confirmDeleteTask(task.id)" class="btn small danger">Delete</button>
            </div>
          </li>
        </ul>
      </div>
    </div>

    <!-- Delete confirmation modal -->
    <transition name="modal-fade">
      <div v-if="showDeleteModal" class="modal-overlay" @click="showDeleteModal = false">
        <div class="modal-container" @click.stop>
          <div class="modal-header">
            <h2>Delete Task</h2>
            <button class="modal-close" @click="showDeleteModal = false">&times;</button>
          </div>
          <div class="modal-body">
            <p>Are you sure you want to delete this task? This action cannot be undone.</p>
            <div class="form-actions">
              <button 
                @click="showDeleteModal = false" 
                class="btn secondary"
              >
                Cancel
              </button>
              <button 
                @click="deleteTask" 
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
import { useProjectStore } from '@/stores/projectStore';
import { useTaskStore } from '@/stores/taskStore';

// Setup router and stores
const router = useRouter();
const projectStore = useProjectStore();
const taskStore = useTaskStore();

// State variables
const loading = ref(true);
const error = ref(null);
const projects = ref([]);
const tasks = ref([]);
const selectedProjectId = ref('');
const showDeleteModal = ref(false);
const taskToDelete = ref(null);

// Fetch data on component mount
onMounted(async () => {
  await fetchTasksData();
});

// Fetch tasks and projects data
const fetchTasksData = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    // Fetch projects and tasks in parallel
    await Promise.all([
      projectStore.fetchProjects(),
      taskStore.fetchTasks()
    ]);
    
    // Store in local state
    projects.value = projectStore.projects || [];
    tasks.value = taskStore.tasks || [];
  } catch (err) {
    console.error('Error fetching data:', err);
    error.value = 'Failed to load tasks. Please try again.';
  } finally {
    loading.value = false;
  }
};

// Computed properties
const hasAnyTasks = computed(() => {
  return tasks.value.length > 0;
});

const hasTasksToShow = computed(() => {
  if (selectedProjectId.value) {
    return tasks.value.some(task => task.projectId === selectedProjectId.value);
  }
  return tasks.value.length > 0;
});

const filteredProjects = computed(() => {
  if (selectedProjectId.value) {
    return projects.value.filter(project => project.projectId === selectedProjectId.value);
  }
  return projects.value.filter(project => 
    tasks.value.some(task => task.projectId === project.projectId)
  );
});

// Methods
const filteredTasks = (projectId) => {
  return tasks.value.filter(task => task.projectId === projectId);
};

const truncateDescription = (description) => {
  if (!description) return '';
  return description.length > 100 ? `${description.substring(0, 100)}...` : description;
};

const filterByProject = () => {
  // Just use the selectedProjectId to filter the view
};

const navigateToAddTask = () => {
  router.push('/addTask');
};

const navigateToAddTaskForProject = (projectId) => {
  router.push(`/addTask?projectId=${projectId}`);
};

const navigateToEdit = (taskId) => {
  router.push(`/editTask/${taskId}`);
};

const navigateToView = (taskId) => {
  router.push(`/viewTask/${taskId}`);
};

const confirmDeleteTask = (taskId) => {
  taskToDelete.value = taskId;
  showDeleteModal.value = true;
};

const deleteTask = async () => {
  if (!taskToDelete.value) return;
  
  try {
    await taskStore.deleteTask(taskToDelete.value);
    tasks.value = tasks.value.filter(task => task.id !== taskToDelete.value);
    showDeleteModal.value = false;
    taskToDelete.value = null;
  } catch (err) {
    console.error('Error deleting task:', err);
    error.value = 'Failed to delete task. Please try again.';
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

/* Project filter */
.project-filter {
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

/* Tasks content */
.tasks-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.project-tasks-container {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background-color: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.project-header h2 {
  margin: 0;
  font-size: 18px;
  color: #111827;
}

/* Task list */
.task-list {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.task-card {
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
  transition: background-color 0.2s;
}

.task-card:last-child {
  border-bottom: none;
}

.task-card:hover {
  background-color: #f9fafb;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.task-title {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.task-badges {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.task-hours {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  background-color: #f3f4f6;
  color: #374151;
}

.task-status {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.task-status.pending {
  background-color: #fff3e0;
  color: #ef6c00;
}

.task-status.in-progress {
  background-color: #e3f2fd;
  color: #1e88e5;
}

.task-status.completed {
  background-color: #d1fae5;
  color: #065f46;
}

.task-priority {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.task-priority.low {
  background-color: #c8e6c9;
  color: #2e7d32;
}

.task-priority.medium {
  background-color: #fff9c4;
  color: #f57f17;
}

.task-priority.high {
  background-color: #ffcdd2;
  color: #c62828;
}

.task-description {
  margin: 0 0 12px;
  font-size: 14px;
  color: #4b5563;
}

.task-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.high-priority {
  border-left: 4px solid #ef4444;
}

.completed {
  opacity: 0.7;
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
  .task-header {
    flex-direction: column;
    gap: 8px;
  }
  
  .task-badges {
    justify-content: flex-start;
  }
  
  .modal-container {
    width: 95%;
  }
}
</style>