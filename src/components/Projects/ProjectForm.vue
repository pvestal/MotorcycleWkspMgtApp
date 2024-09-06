<template>
  <div class="form-container">
    <!-- Project Name and ID are always visible -->
    <div class="form-group">
      <label for="projectName">Project Name:</label>
      <input type="text" v-model="formData.projectName" id="projectName" class="form-control" required />
    </div>

    <div class="form-group inline-group">
      <p>Project ID: {{ formData.projectId }}</p>
      <div class="owner-field">
        <label for="owner">Owner:</label>
        <input type="text" v-model="formData.owner" id="owner" class="form-control" required />
      </div>
    </div>

    <!-- Expand/Collapse button for additional fields -->
    <div class="expand-toggle">
      <span class="material-symbols-outlined" @click="toggleSection('mainVisible')">
        {{ mainVisible ? 'expand_less' : 'expand_more' }} Details
      </span>
    </div>

    <!-- Additional form fields hidden when collapsed -->
    <div v-show="mainVisible" class="additional-fields">
      <div class="form-group inline-group">
        <div class="date-field">
          <label for="startDate">Start Date:</label>
          <input type="date" v-model="formData.startDate" id="startDate" class="form-control" required />
        </div>
        <div class="date-field">
          <label for="endDate">End Date:</label>
          <input type="date" v-model="formData.endDate" id="endDate" class="form-control" />
        </div>
      </div>

      <div class="form-group">
        <label for="status">Status:</label>
        <select v-model="formData.status" id="status" class="form-control" required>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
          <option value="On Hold">On Hold</option>
        </select>
      </div>

      <!-- Notes Section -->
      <div class="form-group">
        <label for="notes">Notes:</label>
        <textarea v-model="formData.notes" id="notes" class="form-control"></textarea>
      </div>
    </div>

    <!-- Action buttons -->
    <div class="form-actions">
      <button type="submit" class="btn-submit">{{ isEditing ? 'Update Project' : 'Add Project' }}</button>
      <button type="button" class="btn-cancel" @click="cancelEdit">Cancel</button>
    </div>
  </div>

  <!-- Task, Parts, Costs Sections -->
  <div v-if="formData.projectId" class="form-container compact-sections">
    <!-- Tasks -->
    <div class="section tasks-section">
      <span class="material-symbols-outlined" @click="toggleSection('tasksVisible')">
        {{ tasksVisible ? 'expand_less' : 'expand_more' }} Tasks
      </span>
      <TaskForm v-if="tasksVisible" :projectId="formData.projectId" :projectName="formData.projectName" />
      <ListTasks v-if="tasksVisible" :projectId="formData.projectId" />
    </div>

    <!-- Parts -->
    <div class="section parts-section">
      <span class="material-symbols-outlined" @click="toggleSection('partsVisible')">
        {{ partsVisible ? 'expand_less' : 'expand_more' }} Parts
      </span>
      <ListParts v-if="partsVisible && isEditing" :projectId="formData.projectId" />
    </div>

    <!-- Costs -->
    <div class="section costs-section">
      <span class="material-symbols-outlined" @click="toggleSection('costsVisible')">
        {{ costsVisible ? 'expand_less' : 'expand_more' }} Costs
      </span>
      <ListCosts v-if="costsVisible && isEditing" :projectId="formData.projectId" />
    </div>
  </div>
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
import NoteForm from './NoteForm.vue';

// Setup the necessary stores and router instances
const projectStore = useProjectStore();
const taskStore = useTaskStore();
const errorStore = useErrorStore();
const router = useRouter();
const route = useRoute();
const project = ref({});

// Setup reactive variables for project data and UI states
const formData = ref({
  projectId: '',
  projectName: '',
  startDate: '',
  endDate: '',
  status: 'In Progress',
  owner: '',
  tasks: [],
  parts: [],
  costs: [],
  timeEntries: [],
  imageUrls: [],
});

const isEditing = ref(false); // Boolean to determine if the form is in editing mode
const projectTasks = ref([]); // Array to store tasks associated with the project
const tasksVisible = ref(false); // Boolean to toggle the task form visibility
const partsVisible = ref(false);
const costsVisible = ref(false);
const mainVisible = ref(false); 

const emit = defineEmits(['updateProject', 'addProject']);

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
    let savedProject;

    if (isEditing.value) {
      await projectStore.updateProject(route.params.id, formData.value);
      savedProject = { ...formData.value, id: route.params.id }; // Include the ID of the updated project
      emit('updateProject', savedProject);
    } else {
      const newProjectId = await projectStore.addProject(formData.value);
      savedProject = { ...formData.value, id: newProjectId }; // Include the ID of the new project
      emit('addProject', savedProject);
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
    tasks: [],
    parts: [],
    costs: [],
    imageUrls: [],
  }
}
// Function to toggle visibility of sections
const toggleSection = (section) => {
  switch (section) {
    case 'tasksVisible':
      tasksVisible.value = !tasksVisible.value;
      break;
    case 'partsVisible':
      partsVisible.value = !partsVisible.value;
      break;
    case 'costsVisible':
      costsVisible.value = !costsVisible.value;
      break;
    case 'mainVisible':
      mainVisible.value = !mainVisible.value;
      break;
  }
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

/* Align items side by side for certain fields */
.inline-group {
  display: flex;
  justify-content: space-between;
  gap: 20px;
}

.date-field,
.owner-field {
  flex: 1;
}

.expand-toggle {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
}

.additional-fields {
  padding: 10px 0;
  transition: all 0.3s ease;
}

.section {
  margin-bottom: 16px;
}

.compact-sections .section {
  background-color: #f0f0f0;
  padding: 10px;
  border-radius: 6px;
}

/* Ensure buttons fit well in compact view */
.form-actions {
  display: flex;
  justify-content: space-between;
}

/* Animations for expanding/collapsing sections */
.expand_toggle {
  cursor: pointer;
}

.section {
  transition: max-height 0.3s ease, padding 0.3s ease;
  overflow: hidden;
}

.section.collapsed {
  max-height: 0;
  padding: 0;
}

</style>
