<template>
  <div class="form-container">
    <h2 class="form-title">{{ isEditing ? 'Edit Part' : 'Add Part' }}</h2>

    <!-- Loading state -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
    </div>

    <!-- Error message -->
    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <form v-if="!loading" @submit.prevent="handleSubmit">
      <!-- Part Name -->
      <div class="form-group">
        <label for="partName" class="form-label required-field">Part Name</label>
        <input 
          type="text" 
          v-model="part.partName" 
          id="partName" 
          class="form-input" 
          required 
          maxlength="255" 
        />
      </div>

      <div class="form-row">
        <!-- Part Status -->
        <div class="form-group">
          <label for="partStatus" class="form-label">Part Status</label>
          <select 
            v-model="part.partStatus" 
            id="partStatus" 
            class="form-select"
          >
            <option value="Ordered">Ordered</option>
            <option value="Shipped">Shipped</option>
            <option value="BackOrder">BackOrder</option>
            <option value="Installed">Installed</option>
          </select>
        </div>

        <!-- Part Priority -->
        <div class="form-group">
          <label for="partPriority" class="form-label">Priority</label>
          <select 
            v-model="part.partPriority" 
            id="partPriority" 
            class="form-select"
          >
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      <!-- Part Description (Optional) -->
      <div class="form-group">
        <label for="description" class="form-label">Description</label>
        <textarea 
          v-model="part.description" 
          id="description" 
          rows="3" 
          class="form-textarea"
          placeholder="Enter any additional details about this part"
        ></textarea>
        <div class="form-helper-text">This field is optional</div>
      </div>

      <!-- Form Actions -->
      <div class="form-actions">
        <button 
          type="button" 
          @click="cancelEdit" 
          class="btn btn-secondary"
        >
          Cancel
        </button>
        <button 
          type="submit" 
          class="btn btn-primary"
        >
          {{ isEditing ? 'Update' : 'Add' }} Part
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { usePartStore } from '../../stores/partStore';
import { useErrorStore } from '../../stores/errorStore';
import '@/assets/form-styles.css';

const partStore = usePartStore();
const errorStore = useErrorStore();
const router = useRouter();
const route = useRoute();

// State variables
const loading = ref(true);
const error = ref('');
const isEditing = ref(false);

// Default part data
const part = ref({ 
  partPriority: 'Medium', 
  partStatus: 'Ordered', 
  partName: '',
  description: '',
  projectId: route.params.projectId || '' 
});

// Load part data if editing
onMounted(async () => {
  try {
    // If there are no parts in the store, fetch them
    if (partStore.parts.length === 0) {
      await partStore.fetchParts();
    }

    if (route.params.id) {
      isEditing.value = true;
      const existingPart = partStore.parts.find(i => i.id === route.params.id);
      
      if (existingPart) {
        part.value = { ...existingPart };
      } else {
        error.value = "Part not found";
        setTimeout(() => {
          router.push('/parts');
        }, 3000);
      }
    }
  } catch (err) {
    error.value = err.message || "Failed to load part data";
  } finally {
    loading.value = false;
  }
});

// Form validation
const validateForm = () => {
  if (!part.value.partName.trim()) {
    error.value = "Part name is required";
    return false;
  }
  return true;
};

// Form submission handler
const handleSubmit = async () => {
  if (!validateForm()) return;
  
  error.value = '';
  loading.value = true;
  
  try {
    if (isEditing.value) {
      await partStore.updatePart(route.params.id, part.value);
      errorStore.showNotification('Part updated successfully', 'success');
    } else {
      await partStore.addPart(part.value);
      errorStore.showNotification('Part added successfully', 'success');
    }
    router.push('/parts');
  } catch (err) {
    error.value = err.message || "An unexpected error occurred";
    errorStore.showError(error.value);
  } finally {
    loading.value = false;
  }
};

// Cancel edit/add
const cancelEdit = () => {
  router.push('/parts');
};
</script>

<style scoped>
/* Component-specific styles or overrides can go here */
</style>