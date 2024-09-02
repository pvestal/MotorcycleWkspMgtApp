<template>
  <!-- Main container for the form -->
  <div class="form-container">
    <!-- Display form title based on the editing state -->
    <h2>{{ isEditing ? 'Edit Project' : 'Add Project' }}</h2>

    <!-- Form for adding or editing a project -->
    <form @submit.prevent="handleProjectSave">
      <!-- Project name input field -->
      <div class="form-group">
        <label for="projectName">Project Name:</label>
        <input type="text" v-model="formData.projectName" id="projectName" class="form-control" required />
      </div>

      <!-- Project ID display (used for debugging or informational purposes) -->
      <div class="form-group">
        <p>ProjectId: {{ formData.projectId}}</p>
      </div>

      <!-- Start date input field -->
      <div class="form-group">
        <label for="startDate">Start Date:</label>
        <input type="date" v-model="formData.startDate" id="startDate" class="form-control" required />
      </div>

      <!-- End date input field -->
      <div class="form-group">
        <label for="endDate">End Date:</label>
        <input type="date" v-model="formData.endDate" id="endDate" class="form-control" />
      </div>

      <!-- Status dropdown menu -->
      <div class="form-group">
        <label for="status">Status:</label>
        <select v-model="formData.status" id="status" class="form-control" required>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
          <option value="On Hold">On Hold</option>
        </select>
      </div>

      <!-- Owner input field -->
      <div class="form-group">
        <label for="owner">Owner:</label>
        <input type="text" v-model="formData.owner" id="owner" class="form-control" required />
      </div>

      <!-- Notes textarea -->
      <div class="form-group">
        <label for="notes">Notes:</label>
        <textarea v-model="formData.notes" id="notes" class="form-control"></textarea>
      </div>

      <!-- Form action buttons: Submit and Cancel -->
      <div class="form-actions">
        <button type="submit" class="btn-submit">{{ isEditing ? 'Update Project' : 'Add Project' }}</button>
        <button type="button" class="btn-cancel" @click="cancelEdit">Cancel</button>
      </div>

    </form>
  </div>

  <!-- Task Management Section, shown only when a project ID exists -->
  <div v-if="formData.projectId" class="form-container tasks-section">
      <!-- Toggle icon for showing/hiding the task form -->
      <span class="material-symbols-outlined" @click="toggleTaskForm">
        {{ showTaskForm ? 'toggle_on' : 'toggle_off' }}
      </span>
    <!-- TaskForm component to add or edit tasks -->
    <!-- <TaskForm v-if="showTaskForm" :projectId="formData.projectId" @task-saved="fetchProjectTasks" @cancel-task="clearTaskForm" /> -->

    <TaskForm v-if="showTaskForm":projectId="formData.projectId" :projectName="projectName" :taskId="taskId" />

    <!-- ListTasks component to display tasks associated with the project -->
    <ListTasks v-if="formData.projectId && isEditing" :projectId="props.projectId" :projectName="projectName" />
  </div>

  <!-- Parts List Component -->
  <ListParts v-if="formData.parts && isEditing" :projectId="props.projectId" :parts="formData.parts || []" @updateParts="updateParts" />

</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useProjectStore } from '@/stores/projectStore';
import { useTaskStore } from '@/stores/taskStore';
import { useErrorStore } from '@/stores/errorStore';

import TaskForm from '../Tasks/TaskForm.vue';
import ListTasks from '../Tasks/ListTasks.vue';
import ListParts from '../Parts/ListParts.vue';

// Setup the necessary stores and router instances
const projectStore = useProjectStore();
const taskStore = useTaskStore();
const errorStore = useErrorStore();
const router = useRouter();
const route = useRoute();

// Define props that can be passed to the component
const props = defineProps({
  project: Object,
  projectId: String,
  projectName: String,
  taskId: String,
});

// Setup reactive variables for project data and UI states
const formData = ref({
  projectId: '',
  projectName: '',
  startDate: '',
  endDate: '',
  status: 'In Progress',
  owner: '',
  notes: '',
  tasks: [],
  parts: [],
  costs: [],
  timeEntries: [],
  imageUrl: '', 
});

const isEditing = ref(false); // Boolean to determine if the form is in editing mode
const projectTasks = ref([]); // Array to store tasks associated with the project
const showTaskForm = ref(false); // Boolean to toggle the task form visibility
const editingTaskId = ref(null); // ID of the task being edited, if any

const emit = defineEmits(['updateProject', 'addProject',]);


// Initialize the form data and load tasks when the component is mounted
onMounted(() => {
  if (route.params.id) {
    isEditing.value = true;
    const existingProject = projectStore.getProjectById(route.params.id);
    if (existingProject) {
      formData.value = { ...existingProject };
      fetchProjectTasks();
    } else {
      errorStore.showError("Project not found");
      router.push('/projects');
    }
  }
});

// Fetch tasks associated with the current project
const fetchProjectTasks = async () => {
  if (formData.value.projectId) {
    projectTasks.value = await taskStore.getTasksByProjectId(formData.value.projectId);
  }
};

// Handle the submission of the project form
const handleProjectSave = async () => {
  try {
    if (isEditing.value) {
      await projectStore.updateProject(route.params.id, formData.value);
      emit('updateProject', props.project);
    } else {
      await projectStore.addProject(formData.value);
      emit('addProject', props.project);
    }
    clearFormData();
    router.push('/projects');
  } catch (error) {
    errorStore.showError(error.message || "An unexpected error occurred");
  }
};

// Cancel the editing or adding of a project
const cancelEdit = () => {
  clearFormData();
  router.push('/projects');
};

// Clear the form data and reset UI states
const clearFormData = () => {
  formData.value = {
    projectId: '',
    projectName: '',
    startDate: '',
    endDate: '',
    status: 'In Progress',
    owner: '',
    notes: '',
    imageUrl: '',
  };
  projectTasks.value = [];
  showTaskForm.value = false;
  editingTaskId.value = null;
};

const updateTasks = (updatedTasks) => {
  emit('updateTasks', updatedTasks);
};

const updateParts = (updatedParts) => {
  emit('updateParts', updatedParts);
};

const updateCosts = (updatedCosts) => {
  emit('updateCosts', updatedCosts);
};

const updateTimeEntries = (updatedTimeEntries) => {
  emit('updateTimeEntries', updatedTimeEntries);
};

// Function to toggle the visibility of the task form
const toggleTaskForm = () => {
  showTaskForm.value = !showTaskForm.value;
};

// Function to toggle the visibility of the part form
const togglePartForm = () => {
  showPartForm.value = !showPartForm.value;
};

// Function to toggle the visibility of the cost form
const toggleCostForm = () => {
  showCostForm.value = !showCostForm.value;
};

</script>

<style scoped>
/* Shared style for the form container and other sections */
.form-container {
  max-width: 500px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: #f9f9f9;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  font-family: 'Arial', sans-serif;
}

/* Style individual form groups */
.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #555;
}

/* Style the form controls */
.form-control {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: #fff;
}

/* Style the form action buttons */
.form-actions {
  display: flex;
  justify-content: space-between;
}

.btn-submit,
.btn-cancel {
  width: 48%;
  padding: 12px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  text-align: center;
}

.btn-submit {
  background-color: #007bff;
  color: white;
}

.btn-submit:hover {
  background-color: #0056b3;
}

.btn-cancel {
  background-color: #ccc;
  color: #333;
}

.btn-cancel:hover {
  background-color: #999;
}

/* Style for the toggle icons */
.material-symbols-outlined {
  vertical-align: -5px;
  cursor: pointer;
  font-size: 24px;
  color: #007bff;
}

.material-symbols-outlined:hover {
  color: #0056b3;
}
</style>
