<template>
  <div>
    <!-- Show message if no tasks are available -->
    <div v-if="tasks.length === 0">
      <p>No tasks available to display.</p>
    </div>
    <div class="tasksByProject" v-else>
      <!-- Header Container -->
      <div class="header">
        <h1 v-if="projectName">Project: {{ projectName }}</h1>
        <h1 v-else>Project Tasks</h1>
        <!-- <button @click="navigateToAddTask" class="action-button add-task-button">
          <span class="material-symbols-outlined">add_circle</span> Add Task
        </button> -->
      </div>
      <ul class="task-list">
        <li v-for="task in tasks" :key="task.id">
          <!-- Task item content -->
          <span class="task-title">{{ task.taskTitle }}</span>
          <span v-if="task.nbrHrs" class="task-hours">{{ task.nbrHrs }} hrs</span>
          <span :class="`status ${task.status.toLowerCase().replace(' ', '-')}`">
            {{ task.status }}
          </span>
          <span :class="['priority', task.priority.toLowerCase()]">{{ task.priority }}</span>

          <!-- Dropdown for task actions -->
          <div class="dropdown-container" @click="toggleDropdown(task.id)">
            <span class="material-symbols-outlined">arrow_drop_down</span>

            <div v-if="isDropdownOpen(task.id)" class="dropdown-menu">
              <button @click="navigateToView(task.id)" class="action-button">
                <span class="material-symbols-outlined">visibility</span> View
              </button>
              <button @click="navigateToEdit(task.id)" class="action-button">
                <span class="material-symbols-outlined">edit</span> Edit
              </button>
              <button @click="deleteTask(task.id)" class="action-button">
                <span class="material-symbols-outlined">delete</span> Delete
              </button>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>


<script setup>
import { ref, defineProps } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const { projectId, projectName, tasks } = defineProps({
  projectId: {
    type: String,
    required: true,
  },
  projectName: {
    type: String,
  },
  tasks: {
    type: Array,
    default: () => [],
  },
});

// No need to redefine tasks here; use the tasks prop directly
const openDropdowns = ref({});

// Methods for navigation and dropdown logic
const toggleDropdown = (taskId) => {
  openDropdowns.value[taskId] = !openDropdowns.value[taskId];
};

const isDropdownOpen = (taskId) => {
  return !!openDropdowns.value[taskId];
};

const navigateToEdit = (taskId) => {
  router.push(`/editTask/${taskId}`);
};

const navigateToView = (taskId) => {
  router.push(`/viewTask/${taskId}`);
};

const deleteTask = async (taskId) => {
  // Implement delete logic here
};

const navigateToAddTask = () => {
  router.push({
    name: 'AddTask',
    params: {
      projectId,
      projectName,
    },
  });
};
</script>

<style scoped>
.tasksByProject {
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: #f9f9f9;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.tasksByProject h1 {
  cursor: pointer;
  color: #007bff;
  margin-bottom: 16px;
  font-size: 24px;
}

.tasksByProject p {
  font-size: 16px;
  margin: 8px 0;
}

ul.task-list {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.task-list li {
  display: flex;
  align-items: center;
  padding: 12px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: relative;
}

.task-list li:hover {
  background-color: #f1f1f1;
}

.task-title {
  flex-grow: 1;
  font-weight: bold;
  font-size: 16px;
}

.priority,
.status {
  margin-right: 15px;
  padding: 5px 10px;
  border-radius: 4px;
  font-weight: bold;
  font-size: 14px;
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

.dropdown-container {
  position: relative;
  cursor: pointer;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background-color: #ffffff;
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

/* Mobile-specific styles */
@media (max-width: 600px) {
  .tasksByProject {
    padding: 15px;
  }

  .task-list li {
    padding: 10px;
  }

  .priority,
  .status {
    font-size: 12px;
    margin-right: 10px;
  }
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.add-task-button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.add-task-button .material-symbols-outlined {
  margin-right: 4px;
}

.add-task-button:hover {
  background-color: #0056b3;
}

</style>