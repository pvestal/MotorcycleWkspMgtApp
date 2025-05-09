<template>
  <div class="form-container">
    <h2 class="form-title">{{ projectName ? `Add Cost for Project: ${projectName}` : (isEditing ? 'Edit Cost' : 'Add New Cost') }}</h2>
    
    <!-- Loading state -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
    </div>
    
    <!-- Error message -->
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
    
    <!-- Cost form -->
    <form v-if="!loading" @submit.prevent="handleSubmit">
      <!-- Description field -->
      <div class="form-group">
        <label for="description" class="form-label required-field">Description</label>
        <input 
          type="text" 
          id="description" 
          v-model="cost.description" 
          class="form-input"
          required
        />
      </div>
      
      <div class="form-row">
        <!-- Amount field -->
        <div class="form-group">
          <label for="amount" class="form-label required-field">Amount ($)</label>
          <input 
            type="number" 
            id="amount" 
            v-model="cost.amount" 
            step="0.01" 
            min="0.01" 
            class="form-input"
            required
          />
        </div>
        
        <!-- Category field -->
        <div class="form-group">
          <label for="category" class="form-label">Category</label>
          <select 
            id="category" 
            v-model="cost.category" 
            class="form-select"
          >
            <option value="Parts">Parts</option>
            <option value="Labor">Labor</option>
            <option value="Tools">Tools</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>
      
      <!-- Date field -->
      <div class="form-group">
        <label for="date" class="form-label required-field">Date</label>
        <input 
          type="date" 
          id="date" 
          v-model="cost.date" 
          class="form-input"
          required
        />
      </div>
      
      <!-- Form buttons -->
      <div class="form-actions">
        <button 
          type="button" 
          @click="cancel" 
          class="btn btn-secondary"
        >
          Cancel
        </button>
        <button 
          type="submit" 
          class="btn btn-primary"
        >
          {{ isEditing ? 'Update' : 'Save' }} Cost
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCostStore } from '@/stores/costStore';
import { useProjectStore } from '@/stores/projectStore';
import { useErrorStore } from '@/stores/errorStore';
import '@/assets/form-styles.css';

// Props
const props = defineProps({
  projectId: {
    type: String,
    required: true
  },
  costId: {
    type: String,
    default: null
  }
});

// Setup router and stores
const router = useRouter();
const costStore = useCostStore();
const projectStore = useProjectStore();
const errorStore = useErrorStore();

// State variables
const loading = ref(true);
const error = ref('');
const projectName = ref('');
const isEditing = ref(false);
const cost = ref({
  description: '',
  amount: '',
  category: 'Parts',
  date: new Date().toISOString().slice(0, 10),
  projectId: props.projectId
});

// Form validation
const validateForm = () => {
  // Validate description
  if (!cost.value.description.trim()) {
    error.value = 'Description is required';
    return false;
  }
  
  // Validate amount
  const numAmount = parseFloat(cost.value.amount.toString());
  if (isNaN(numAmount) || numAmount <= 0) {
    error.value = 'Please enter a valid amount greater than zero';
    return false;
  }
  
  // Validate date
  if (!cost.value.date) {
    error.value = 'Date is required';
    return false;
  }
  
  return true;
};

// Load project and cost data
onMounted(async () => {
  try {
    // Make sure we have project data
    if (projectStore.projects.length === 0) {
      await projectStore.fetchProjects();
    }
    
    // Get project name
    const project = projectStore.getProjectById(props.projectId);
    if (project) {
      projectName.value = project.projectName;
    }
    
    // If costId is provided, load existing cost data
    if (props.costId) {
      isEditing.value = true;
      
      // Make sure we have cost data
      if (costStore.costs.length === 0) {
        await costStore.fetchCosts();
      }
      
      const existingCost = costStore.costs.find(c => c.id === props.costId);
      
      if (existingCost) {
        // Format date properly if it exists
        const formattedDate = existingCost.date ? 
          (typeof existingCost.date === 'string' ? existingCost.date : new Date(existingCost.date).toISOString().slice(0, 10)) : 
          new Date().toISOString().slice(0, 10);
        
        cost.value = {
          description: existingCost.description || '',
          amount: existingCost.amount || '',
          category: existingCost.category || 'Parts',
          date: formattedDate,
          projectId: existingCost.projectId || props.projectId
        };
      } else {
        error.value = 'Cost not found';
        setTimeout(() => {
          router.push('/costs');
        }, 3000);
      }
    }
  } catch (err) {
    console.error('Error loading data:', err);
    error.value = 'Failed to load data. Please try again.';
  } finally {
    loading.value = false;
  }
});

// Handle form submission
const handleSubmit = async () => {
  if (!validateForm()) return;
  
  error.value = '';
  loading.value = true;
  
  try {
    // Ensure projectId is set
    cost.value.projectId = props.projectId;
    
    // Save cost
    if (isEditing.value && props.costId) {
      await costStore.updateCost(props.costId, cost.value);
      errorStore.showNotification('Cost updated successfully', 'success');
    } else {
      await costStore.addCost(cost.value);
      errorStore.showNotification('Cost added successfully', 'success');
    }
    
    // Navigate back to the project view or costs list
    router.push('/costs');
  } catch (err) {
    console.error('Error saving cost:', err);
    error.value = 'Failed to save cost. Please try again.';
    errorStore.showError(error.value);
  } finally {
    loading.value = false;
  }
};

// Cancel and go back
const cancel = () => {
  router.push('/costs');
};
</script>