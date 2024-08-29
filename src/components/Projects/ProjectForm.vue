<template>
  <div class="form-container">
    <h2>{{ isEditing ? 'Edit Project' : 'Add Project' }}</h2>
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="projectName">Project Name:</label>
        <input type="text" v-model="formData.projectName" id="projectName" class="form-control" required />
      </div>
      <div class="form-group">
        <label for="startDate">Start Date:</label>
        <input type="date" v-model="formData.startDate" id="startDate" class="form-control" required />
      </div>
      <div class="form-group">
        <label for="endDate">End Date:</label>
        <input type="date" v-model="formData.endDate" id="endDate" class="form-control" />
      </div>
      <div class="form-group">
        <label for="status">Status:</label>
        <select v-model="formData.status" id="status" class="form-control" required>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
          <option value="On Hold">On Hold</option>
        </select>
      </div>
      <div class="form-group">
        <label for="owner">Owner:</label>
        <input type="text" v-model="formData.owner" id="owner" class="form-control" required />
      </div>
      <div class="form-group">
        <label for="notes">Notes:</label>
        <textarea v-model="formData.notes" id="notes" class="form-control"></textarea>
      </div>
      <div class="form-actions">
        <button type="submit" class="btn-submit">{{ isEditing ? 'Update Project' : 'Add Project' }}</button>
        <button type="button" class="btn-cancel" @click="cancelEdit">Cancel</button>
      </div>
      <!-- <h3>{{ isEditingTask ? 'Edit Task' : 'Add Task' }}</h3> -->
      <AddTask project:project />
    </form>
  </div>

</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useProjectStore } from '../../stores/projectStore';
import { useErrorStore } from '../../stores/errorStore';
import AddTask from '../Tasks/AddTask.vue';

const projectStore = useProjectStore();
const errorStore = useErrorStore();

const router = useRouter();
const route = useRoute();

const formData = ref({
  projectId: '',
  projectName: '',
  startDate: '',
  endDate: '',
  status: 'In Progress',
  owner: '',
  notes: '',
});

const isEditing = ref(false);
const isEditingTask = ref(false)

onMounted(() => {
  if (route.params.id) {
    isEditing.value = true;
    const existingProject = projectStore.getProjectById(route.params.id);
    if (existingProject) {
      formData.value = { ...existingProject };
    } else {
      errorStore.showError("Project not found");
      router.push('/projects');
    }
  }
});

const handleSubmit = async () => {
  try {
    if (isEditing.value) {
      await projectStore.updateProject(route.params.id, formData.value);
    } else {
      await projectStore.addProject(formData.value);
    }
    clearFormData();
    router.push('/projects');
  } catch (error) {
    errorStore.showError(error.message || "An unexpected error occurred");
  }
};



const cancelEdit = () => {
  clearFormData();
  router.push('/projects');
};

// Clear form data after submission or cancellation
const clearFormData = () => {
  formData.value = {
    projectId: '',
    projectName: '',
    startDate: '',
    endDate: '',
    status: 'In Progress',
    owner: '',
    notes: '',
  };
};
</script>

<style scoped>
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

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #555;
}

.form-control {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: #fff;
}

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
</style>
