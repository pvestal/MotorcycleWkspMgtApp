<template>
  <div class="create-ticket-container">
    <form @submit.prevent="submitTicket" class="ticket-form">
      <div class="form-group">
        <label for="ticket-title">Title *</label>
        <input 
          type="text" 
          id="ticket-title" 
          v-model="ticket.title" 
          placeholder="Brief summary of your issue"
          class="form-input"
          required
        />
      </div>
      
      <div class="form-group">
        <label for="ticket-description">Description *</label>
        <textarea 
          id="ticket-description" 
          v-model="ticket.description" 
          placeholder="Please provide detailed information about the issue you're experiencing..."
          class="form-textarea"
          rows="6"
          required
        ></textarea>
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label for="ticket-category">Category</label>
          <select id="ticket-category" v-model="ticket.category" class="form-select">
            <option v-for="category in categories" :key="category" :value="category">
              {{ category }}
            </option>
          </select>
        </div>
        
        <div class="form-group">
          <label for="ticket-priority">Priority</label>
          <select id="ticket-priority" v-model="ticket.priority" class="form-select">
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
        </div>
      </div>
      
      <div class="form-group">
        <label for="related-project">Related Project (Optional)</label>
        <select id="related-project" v-model="ticket.relatedProjectId" class="form-select">
          <option value="">None</option>
          <option v-for="project in projects" :key="project.projectId" :value="project.projectId">
            {{ project.projectName }}
          </option>
        </select>
      </div>
      
      <div class="form-group" v-if="fileUploadEnabled">
        <label for="file-upload">Attachments (Optional)</label>
        <div class="file-upload-container">
          <input 
            type="file" 
            id="file-upload" 
            @change="handleFileUpload" 
            class="file-input" 
            multiple
          />
          <div class="file-upload-label">
            <span class="upload-icon">📎</span>
            <span>Drop files here or click to upload</span>
          </div>
        </div>
        
        <div v-if="ticket.attachments && ticket.attachments.length > 0" class="attachments-list">
          <div v-for="(file, index) in ticket.attachments" :key="index" class="attachment-item">
            <span class="attachment-name">{{ file.name }}</span>
            <button type="button" class="remove-button" @click="removeFile(index)">&times;</button>
          </div>
        </div>
      </div>
      
      <div class="form-actions">
        <button type="button" class="btn secondary" @click="$emit('cancel')">Cancel</button>
        <button type="submit" class="btn primary" :disabled="!isFormValid || isSubmitting">
          <span v-if="isSubmitting">
            <span class="spinner"></span> Submitting...
          </span>
          <span v-else>Submit Ticket</span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, defineProps, defineEmits, onMounted } from 'vue';
import { useProjectStore } from '@/stores/projectStore';
import { useUserStore } from '@/stores/userStore';
import { Project } from '@/types';
import { TicketCategory, TicketPriority } from '@/types/helpdesk';

const props = defineProps({
  fileUploadEnabled: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['submit', 'cancel']);

// Get stores
const projectStore = useProjectStore();
const userStore = useUserStore();

// State
const isSubmitting = ref(false);
const ticket = ref({
  title: '',
  description: '',
  category: 'Technical Support' as TicketCategory,
  priority: 'Medium' as TicketPriority,
  relatedProjectId: '',
  attachments: [] as File[]
});

// Get user projects
const projects = computed(() => {
  return projectStore.projects;
});

// List of available ticket categories
const categories: TicketCategory[] = [
  'Account',
  'Billing',
  'Technical Support',
  'Feature Request',
  'Bug Report',
  'Project',
  'Parts',
  'Inventory',
  'Other'
];

// Form validation
const isFormValid = computed(() => {
  return ticket.value.title.trim() !== '' && 
         ticket.value.description.trim() !== '';
});

// Handle file upload
const handleFileUpload = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files) {
    // Add files to the attachments array
    Array.from(input.files).forEach(file => {
      ticket.value.attachments.push(file);
    });
  }
};

// Remove file from attachments
const removeFile = (index: number) => {
  ticket.value.attachments.splice(index, 1);
};

// Submit the ticket
const submitTicket = async () => {
  if (!isFormValid.value) return;
  
  isSubmitting.value = true;
  
  try {
    // Prepare ticket data
    const ticketData = {
      title: ticket.value.title,
      description: ticket.value.description,
      category: ticket.value.category,
      priority: ticket.value.priority,
      relatedProject: null as { projectId: string; projectName: string } | null
    };

    // Add related project if selected
    if (ticket.value.relatedProjectId) {
      const project = projects.value.find(p => p.projectId === ticket.value.relatedProjectId);
      if (project) {
        ticketData.relatedProject = {
          projectId: project.projectId,
          projectName: project.projectName
        };
      }
    }

    // Emit submit event with ticket data
    emit('submit', {
      ...ticketData,
      attachments: ticket.value.attachments
    });
    
    // Reset form after submission
    resetForm();
  } catch (error) {
    console.error('Error submitting ticket:', error);
  } finally {
    isSubmitting.value = false;
  }
};

// Reset the form
const resetForm = () => {
  ticket.value = {
    title: '',
    description: '',
    category: 'Technical Support',
    priority: 'Medium',
    relatedProjectId: '',
    attachments: []
  };
};

// Fetch projects when component mounts
onMounted(async () => {
  if (projectStore.projects.length === 0) {
    await projectStore.fetchProjects();
  }
});
</script>

<style scoped>
.create-ticket-container {
  width: 100%;
}

.ticket-form {
  width: 100%;
}

.form-group {
  margin-bottom: 20px;
}

.form-row {
  display: flex;
  gap: 16px;
}

.form-row .form-group {
  flex: 1;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
}

.form-textarea {
  resize: vertical;
}

.form-select {
  appearance: none;
  background: white url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E") no-repeat right 12px center;
  background-size: 16px;
  padding-right: 36px;
}

.file-upload-container {
  position: relative;
  border: 2px dashed #d1d5db;
  border-radius: 6px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
}

.file-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.file-upload-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #6b7280;
}

.upload-icon {
  font-size: 24px;
}

.attachments-list {
  margin-top: 16px;
}

.attachment-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background-color: #f3f4f6;
  border-radius: 4px;
  margin-bottom: 8px;
}

.attachment-name {
  font-size: 14px;
}

.remove-button {
  background: none;
  border: none;
  color: #6b7280;
  font-size: 16px;
  cursor: pointer;
}

.remove-button:hover {
  color: #ef4444;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.btn {
  padding: 10px 16px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  border: none;
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

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s linear infinite;
  margin-right: 8px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
    gap: 20px;
  }
}
</style>