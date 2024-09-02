<template>
  <div>
    <h2>Tasks for Project ID: {{ projectId }} [<span v-if="tasksCount">{{ tasksCount }}</span>]</h2>
    <h3 v-if="totalNbrHrs">Total Hours: {{ totalNbrHrs }}</h3>
    <ul class="task-list">
      <li v-for="task in projectTasks" :key="task.id">
        <span class="task-title">{{ task.taskTitle }}</span>
        <span :class="`status ${task.status.toLowerCase().replace(' ', '-')}`">{{ task.status }}</span>
        <span :class="['priority', task.priority.toLowerCase()]">{{ task.priority }}</span>
        
        <!-- Drop-down icon -->
        <div class="dropdown-container" @click="toggleDropdown(task.id)">
          <span class="material-symbols-outlined">arrow_drop_down</span>
          
          <!-- Drop-down menu with action buttons -->
          <div v-if="isDropdownOpen(task.id)" class="dropdown-menu">
            <button @click="navigateToView(task.id)" class="action-button"><span class="material-symbols-outlined">visibility</span> View</button>
            <button @click="navigateToEdit(task.id)" class="action-button"><span class="material-symbols-outlined">edit</span> Edit</button>
            <button @click="deleteTask(task.id)" class="action-button"><span class="material-symbols-outlined">delete</span> Delete</button>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { useTaskStore } from '@/stores/taskStore';
import { useErrorStore } from '@/stores/errorStore';

const taskStore = useTaskStore();
const errorStore = useErrorStore();
const router = useRouter();

// Define props
const props = defineProps({
  projectId: {
    type: String,
    required: true,
  },
});

// Reactive properties for tasks and calculations
const projectTasks = ref([]);
const tasksCount = ref(0);
const totalNbrHrs = ref(0);
const openDropdowns = ref({});

onMounted(async () => {
  await taskStore.fetchTasks(); // Fetch all tasks from the store
  projectTasks.value = taskStore.getTasksByProjectId(props.projectId);
  tasksCount.value = projectTasks.value.length;
  totalNbrHrs.value = projectTasks.value.reduce((sum, task) => sum + task.NbrHrs, 0);

  document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});

const navigateToEdit = (id) => {
  console.log(props.projectId)
  router.push(`/editTask/${id}?projectId=${props.projectId}`);
};

const navigateToView = (id) => {
  console.log(props.projectId)
  router.push(`/viewTask/${id}?projectId=${props.projectId}`);
};

const deleteTask = async (id) => {
  try {
    await taskStore.deleteTask(id);
    projectTasks.value = projectTasks.value.filter(task => task.id !== id);
    tasksCount.value = projectTasks.value.length;
    totalNbrHrs.value = projectTasks.value.reduce((sum, task) => sum + task.NbrHrs, 0);
  } catch (error) {
    errorStore.showError('An error occurred while deleting the task:', error);
  }
};

// Toggle the visibility of the dropdown menu
const toggleDropdown = (taskId) => {
  openDropdowns.value[taskId] = !openDropdowns.value[taskId];
};

// Check if the dropdown is open for the given task
const isDropdownOpen = (taskId) => {
  return !!openDropdowns.value[taskId];
};

// Close dropdown if clicked outside
const handleClickOutside = (event) => {
  const clickedElement = event.target;
  if (!clickedElement.closest('.dropdown-container')) {
    openDropdowns.value = {}; // Close all dropdowns
  }
};
</script>


<style scoped>
/* Task list styles */
ul.task-list {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.task-list li {
  display: flex;
  align-items: center;
  padding: 10px;
  margin-bottom: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: #f9f9f9;
  position: relative;
}

/* Drop-down container styles */
.dropdown-container {
  position: relative;
  cursor: pointer;
}

/* Drop-down menu styles */
.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 5px 0;
  z-index: 100;
  min-width: 150px;
}

.dropdown-menu .action-button {
  display: block;
  width: 100%;
  padding: 10px;
  text-align: left;
  background: none;
  border: none;
  cursor: pointer;
  color: #333;
  font-size: 14px;
  transition: background-color 0.2s;
}

.dropdown-menu .action-button:hover {
  background-color: #f1f1f1;
}

/* Priority and status styles */
.priority {
  margin-right: 20px;
  padding: 5px 10px;
  border-radius: 4px;
  font-weight: bold;
}

.priority.low {
  background-color: #e0f7fa;
  color: #00796b;
}

.priority.medium {
  background-color: #fff9c4;
  color: #f57f17;
}

.priority.high {
  background-color: #ffcdd2;
  color: #c62828;
}

.status {
  margin-right: 20px;
  padding: 5px 10px;
  border-radius: 4px;
  text-transform: uppercase;
  font-weight: bold;
}

.status.pending {
  background-color: #fff3e0;
  color: #ef6c00;
}

.status.in-progress {
  background-color: #e3f2fd;
  color: #1e88e5;
}

.status.completed {
  background-color: #c8e6c9;
  color: #2e7d32;
}

.task-title {
  flex-grow: 1;
  font-weight: normal;
}
</style>
