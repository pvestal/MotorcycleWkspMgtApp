<template>
  <div class="form-container">
    <h2 class="form-title">
      {{ isEditing ? 'Edit Task' : 'Add Task' }}
      <span v-if="projectId && projectName" class="ml-2 text-sm font-normal text-gray-500">
        Project: {{ projectName }} ({{ projectId }})
      </span>
    </h2>

    <!-- Loading state -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
    </div>

    <!-- Error message -->
    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <form v-if="!loading" @submit.prevent="handleTaskSubmit">
      <!-- Task Title -->
      <div class="form-group">
        <label for="taskTitle" class="form-label required-field">Task Title</label>
        <input 
          type="text" 
          v-model="taskData.taskTitle" 
          id="taskTitle" 
          class="form-input" 
          required 
        />
      </div>

      <div class="form-row">
        <!-- Task Priority -->
        <div class="form-group">
          <label for="priority" class="form-label">Priority</label>
          <select 
            v-model="taskData.priority" 
            id="priority" 
            class="form-select"
          >
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        <!-- Task Status -->
        <div class="form-group">
          <label for="status" class="form-label">Status</label>
          <select 
            v-model="taskData.status" 
            id="status" 
            class="form-select"
          >
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      <!-- Hours Required -->
      <div class="form-group">
        <label for="nbrHrs" class="form-label required-field">
          Time (hours)
        </label>
        <input 
          type="number" 
          v-model="taskData.nbrHrs" 
          id="nbrHrs" 
          min="0.1" 
          step="0.1" 
          class="form-input" 
          required 
        />
      </div>

      <!-- Description (Optional) -->
      <div class="form-group">
        <label for="description" class="form-label">
          Description
        </label>
        <textarea 
          v-model="taskData.description" 
          id="description" 
          rows="4" 
          class="form-textarea"
          placeholder="Add any additional details about this task"
        ></textarea>
        <div class="form-helper-text">This field is optional</div>
      </div>

      <!-- Form Actions -->
      <div class="form-actions">
        <button 
          type="button" 
          @click="cancelTaskEdit" 
          class="btn btn-secondary"
        >
          Cancel
        </button>
        <button 
          type="submit" 
          class="btn btn-primary"
        >
          {{ isEditing ? 'Update Task' : 'Add Task' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
/**
 * TaskForm Component
 * 
 * This component handles the creation and editing of tasks for a project.
 * It includes validation and provides a clean interface for task management.
 */

import { ref, onMounted } from 'vue';
import { useTaskStore } from '@/stores/taskStore';
import { useErrorStore } from '@/stores/errorStore';
import { useRouter } from 'vue-router';
import { Task } from '@/types/interfaces';
import '@/assets/form-styles.css';

// Props definition
interface Props {
  projectId: string;
  projectName: string;
  taskId?: string;
}

const props = withDefaults(defineProps<Props>(), {
  taskId: undefined
});

// Setup stores and router
const router = useRouter();
const taskStore = useTaskStore();
const errorStore = useErrorStore();

// Component state
const isEditing = ref(false);
const loading = ref(false);
const error = ref('');

// Define task data structure with TypeScript interface
interface TaskFormData extends Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'> {
  description?: string;
}

// Initialize task data with default values
const taskData = ref<TaskFormData>({
  taskTitle: '',
  priority: 'Medium',
  status: 'Pending',
  nbrHrs: 1,
  projectId: props.projectId,
  projectName: props.projectName,
  description: ''
});

/**
 * Load existing task data if in edit mode
 */
onMounted(async () => {
  // Only show loading state if we're editing
  if (props.taskId) {
    loading.value = true;
    isEditing.value = true;
    
    try {
      // If we don't have any tasks in the store, fetch them first
      if (taskStore.tasks.length === 0) {
        await taskStore.fetchTasks();
      }
      
      // Get task by ID
      const existingTask = taskStore.tasks.find(task => task.id === props.taskId);
      
      if (existingTask) {
        // Copy task data to form
        taskData.value = { 
          ...existingTask,
          // Ensure nbrHrs is a number (might be stored as string in Firestore)
          nbrHrs: typeof existingTask.nbrHrs === 'string' 
            ? parseFloat(existingTask.nbrHrs) 
            : existingTask.nbrHrs || 1
        };
      } else {
        // If task not found after fetching
        error.value = 'Task not found';
        setTimeout(() => {
          router.push(`/viewProject/${props.projectId}`);
        }, 3000);
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An unknown error occurred while loading the task';
      errorStore.showError(error.value);
    } finally {
      loading.value = false;
    }
  }
});

/**
 * Validate form data
 */
const validateForm = (): boolean => {
  error.value = '';
  
  // Validate task title
  if (!taskData.value.taskTitle.trim()) {
    error.value = 'Task title is required';
    return false;
  }
  
  // Convert nbrHrs to number if it's a string
  if (typeof taskData.value.nbrHrs === 'string') {
    taskData.value.nbrHrs = parseFloat(taskData.value.nbrHrs);
  }
  
  // Validate number of hours
  if (isNaN(taskData.value.nbrHrs) || taskData.value.nbrHrs <= 0) {
    error.value = 'Please enter a valid number of hours';
    return false;
  }
  
  return true;
};

/**
 * Submit form handler - creates or updates a task
 */
const handleTaskSubmit = async () => {
  if (!validateForm()) return;
  
  loading.value = true;
  error.value = '';
  
  try {
    // Ensure projectId and projectName are set
    taskData.value.projectId = props.projectId;
    taskData.value.projectName = props.projectName;
    
    if (isEditing.value && props.taskId) {
      // Update existing task
      await taskStore.updateTask(props.taskId, taskData.value);
      errorStore.showNotification('Task updated successfully', 'success');
    } else {
      // Create new task
      await taskStore.addTask(taskData.value);
      errorStore.showNotification('Task added successfully', 'success');
    }
    
    // Reset form and navigate back to project view
    clearTaskData();
    router.push({
      name: 'viewProject',
      params: { id: props.projectId }
    });
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'An unknown error occurred while saving the task';
    errorStore.showError(error.value);
  } finally {
    loading.value = false;
  }
};

/**
 * Cancel editing and navigate back to project view
 */
const cancelTaskEdit = () => {
  clearTaskData();
  router.push({
    name: 'viewProject',
    params: { id: props.projectId }
  });
};

/**
 * Reset the form to its initial state
 */
const clearTaskData = () => {
  taskData.value = {
    taskTitle: '',
    priority: 'Medium',
    status: 'Pending',
    nbrHrs: 1,
    projectId: props.projectId,
    projectName: props.projectName,
    description: ''
  };
  isEditing.value = false;
};
</script>