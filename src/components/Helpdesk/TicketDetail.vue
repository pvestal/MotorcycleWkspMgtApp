<template>
  <div class="ticket-detail-container">
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Loading ticket details...</p>
    </div>
    
    <div v-else-if="!ticket" class="not-found">
      <div class="not-found-icon">❓</div>
      <h3>Ticket Not Found</h3>
      <p>The requested ticket could not be found or you don't have permission to view it.</p>
      <button class="btn primary" @click="$emit('close')">Go Back</button>
    </div>
    
    <div v-else class="ticket-content">
      <!-- Ticket Header -->
      <div class="ticket-header">
        <div class="ticket-title-section">
          <div class="ticket-id">#{{ ticket.id.substring(0, 8) }}</div>
          <h2 class="ticket-title">{{ ticket.title }}</h2>
        </div>
        
        <div class="ticket-status-section">
          <div class="status-badge" :class="ticket.status.toLowerCase().replace(' ', '-')">
            {{ ticket.status }}
          </div>
          <div class="priority-badge" :class="ticket.priority.toLowerCase()">
            {{ ticket.priority }}
          </div>
        </div>
      </div>
      
      <!-- Ticket Meta -->
      <div class="ticket-meta">
        <div class="meta-item">
          <div class="meta-label">Created by</div>
          <div class="meta-value">{{ ticket.userDisplayName }}</div>
        </div>
        
        <div class="meta-item">
          <div class="meta-label">Email</div>
          <div class="meta-value">{{ ticket.userEmail }}</div>
        </div>
        
        <div class="meta-item">
          <div class="meta-label">Category</div>
          <div class="meta-value">{{ ticket.category }}</div>
        </div>
        
        <div class="meta-item">
          <div class="meta-label">Created</div>
          <div class="meta-value">{{ formatDate(ticket.createdAt) }}</div>
        </div>
        
        <div v-if="ticket.updatedAt" class="meta-item">
          <div class="meta-label">Last Updated</div>
          <div class="meta-value">{{ formatDate(ticket.updatedAt) }}</div>
        </div>
        
        <div v-if="ticket.assignedTo" class="meta-item">
          <div class="meta-label">Assigned To</div>
          <div class="meta-value">{{ ticket.assignedTo.displayName }}</div>
        </div>
      </div>
      
      <!-- Ticket Description -->
      <div class="ticket-description">
        <h3>Description</h3>
        <div class="description-content">{{ ticket.description }}</div>
      </div>
      
      <!-- Related Project -->
      <div v-if="ticket.relatedProject" class="related-project">
        <h3>Related Project</h3>
        <div class="project-link">
          <router-link :to="`/projects/${ticket.relatedProject.projectId}`">
            {{ ticket.relatedProject.projectName }}
          </router-link>
        </div>
      </div>
      
      <!-- Attachments -->
      <div v-if="ticket.attachments && ticket.attachments.length > 0" class="attachments">
        <h3>Attachments</h3>
        <div class="attachments-list">
          <div 
            v-for="attachment in ticket.attachments" 
            :key="attachment.id" 
            class="attachment-item"
          >
            <div class="attachment-icon">
              {{ getFileIcon(attachment.fileType) }}
            </div>
            <div class="attachment-info">
              <div class="attachment-name">{{ attachment.fileName }}</div>
              <div class="attachment-size">{{ formatFileSize(attachment.fileSize) }}</div>
            </div>
            <button class="download-btn" @click="downloadAttachment(attachment)">
              Download
            </button>
          </div>
        </div>
      </div>
      
      <!-- Comments Section -->
      <div class="comments-section">
        <h3>Comments</h3>
        
        <div v-if="comments.length === 0" class="no-comments">
          <p>No comments yet.</p>
        </div>
        
        <div v-else class="comments-list">
          <div 
            v-for="comment in comments" 
            :key="comment.id" 
            class="comment"
            :class="{ 'internal-comment': comment.isInternal }"
          >
            <div class="comment-header">
              <div class="author-info">
                <img 
                  :src="comment.createdBy.photoURL || defaultAvatar" 
                  :alt="comment.createdBy.displayName" 
                  class="author-avatar"
                />
                <div class="author-details">
                  <div class="author-name">
                    {{ comment.createdBy.displayName }}
                    <span v-if="comment.createdBy.role === 'admin'" class="role-badge admin">Staff</span>
                    <span v-if="comment.isInternal" class="role-badge internal">Internal</span>
                  </div>
                  <div class="comment-date">{{ formatDate(comment.createdAt) }}</div>
                </div>
              </div>
            </div>
            
            <div class="comment-content">{{ comment.content }}</div>
            
            <div v-if="comment.attachments && comment.attachments.length > 0" class="comment-attachments">
              <div 
                v-for="attachment in comment.attachments" 
                :key="attachment.id" 
                class="attachment-item"
              >
                <div class="attachment-icon">
                  {{ getFileIcon(attachment.fileType) }}
                </div>
                <div class="attachment-name">{{ attachment.fileName }}</div>
                <button class="download-btn small" @click="downloadAttachment(attachment)">
                  Download
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Add Comment -->
        <div class="add-comment">
          <h3>Add Comment</h3>
          <textarea 
            v-model="newComment" 
            placeholder="Type your comment here..." 
            class="comment-input"
            rows="4"
          ></textarea>
          
          <div v-if="canAddAttachments" class="comment-attachments-upload">
            <label for="comment-file-upload" class="file-upload-label">
              <span class="upload-icon">📎</span>
              <span>Add attachments</span>
            </label>
            <input 
              type="file" 
              id="comment-file-upload" 
              @change="handleCommentFileUpload" 
              class="file-input" 
              multiple
            />
            
            <div v-if="commentAttachments.length > 0" class="attachments-preview">
              <div 
                v-for="(file, index) in commentAttachments" 
                :key="index" 
                class="preview-item"
              >
                <span class="preview-name">{{ file.name }}</span>
                <button class="remove-btn" @click="removeCommentAttachment(index)">&times;</button>
              </div>
            </div>
          </div>
          
          <div class="comment-actions">
            <label v-if="isAdmin" class="internal-checkbox">
              <input type="checkbox" v-model="isInternalComment" />
              <span>Internal comment (only visible to staff)</span>
            </label>
            
            <button 
              class="btn primary" 
              @click="submitComment"
              :disabled="!newComment.trim() || submittingComment"
            >
              <span v-if="submittingComment">
                <span class="spinner small"></span> Sending...
              </span>
              <span v-else>Add Comment</span>
            </button>
          </div>
        </div>
      </div>
      
      <!-- Admin Actions (Only visible to admins) -->
      <div v-if="isAdmin" class="admin-actions">
        <h3>Admin Actions</h3>
        
        <div class="admin-form">
          <div class="form-row">
            <div class="form-group">
              <label for="ticket-status">Status</label>
              <select id="ticket-status" v-model="selectedStatus" class="form-select">
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Waiting for Customer">Waiting for Customer</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="ticket-priority">Priority</label>
              <select id="ticket-priority" v-model="selectedPriority" class="form-select">
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
          </div>
          
          <div class="form-group">
            <label for="ticket-assignee">Assign To</label>
            <select id="ticket-assignee" v-model="selectedAssignee" class="form-select">
              <option value="">Unassigned</option>
              <option v-for="admin in adminUsers" :key="admin.uid" :value="admin.uid">
                {{ admin.displayName }}
              </option>
            </select>
          </div>
          
          <div class="admin-buttons">
            <button 
              class="btn primary" 
              @click="updateTicket"
              :disabled="!hasChanges || updatingTicket"
            >
              <span v-if="updatingTicket">
                <span class="spinner small"></span> Updating...
              </span>
              <span v-else>Update Ticket</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, defineProps, defineEmits, onMounted, watch } from 'vue';
import { Timestamp } from 'firebase/firestore';
import { useUserStore } from '@/stores/userStore';
import { SupportTicket, TicketComment, TicketAttachment, TicketStatus, TicketPriority } from '@/types/helpdesk';

// Props and emits
const props = defineProps<{
  ticketId: string;
  ticket?: SupportTicket;
  comments?: TicketComment[];
  loading?: boolean;
}>();

const emit = defineEmits([
  'close', 
  'addComment', 
  'updateTicket', 
  'downloadAttachment'
]);

// Stores
const userStore = useUserStore();

// State
const loading = ref(props.loading || false);
const newComment = ref('');
const isInternalComment = ref(false);
const submittingComment = ref(false);
const updatingTicket = ref(false);
const selectedStatus = ref(props.ticket?.status || 'Open');
const selectedPriority = ref(props.ticket?.priority || 'Medium');
const selectedAssignee = ref(props.ticket?.assignedTo?.uid || '');
const commentAttachments = ref<File[]>([]);

// Default values
const defaultAvatar = 'https://api.dicebear.com/6.x/initials/svg?seed=?';

// Computed
const isAdmin = computed(() => userStore.isAdmin);
const canAddAttachments = computed(() => true); // Can be controlled by a prop or subscription check

const ticket = computed(() => props.ticket);
const comments = computed(() => props.comments || []);

const adminUsers = computed(() => {
  return userStore.allUsers.filter(user => user.role === 'admin');
});

const hasChanges = computed(() => {
  return (
    selectedStatus.value !== props.ticket?.status ||
    selectedPriority.value !== props.ticket?.priority ||
    selectedAssignee.value !== (props.ticket?.assignedTo?.uid || '')
  );
});

// Methods
const formatDate = (timestamp?: Timestamp) => {
  if (!timestamp) return 'N/A';
  
  const date = timestamp.toDate();
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getFileIcon = (fileType: string) => {
  const type = fileType.split('/')[0];
  
  switch (type) {
    case 'image':
      return '🖼️';
    case 'application':
      if (fileType.includes('pdf')) return '📄';
      return '📑';
    case 'text':
      return '📝';
    case 'audio':
      return '🔊';
    case 'video':
      return '🎬';
    default:
      return '📎';
  }
};

const handleCommentFileUpload = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files) {
    Array.from(input.files).forEach(file => {
      commentAttachments.value.push(file);
    });
    
    // Clear the input value to allow selecting the same file again
    input.value = '';
  }
};

const removeCommentAttachment = (index: number) => {
  commentAttachments.value.splice(index, 1);
};

const submitComment = async () => {
  if (!newComment.value.trim()) return;
  
  submittingComment.value = true;
  
  try {
    emit('addComment', {
      content: newComment.value,
      isInternal: isInternalComment.value,
      attachments: commentAttachments.value
    });
    
    // Reset comment form
    newComment.value = '';
    isInternalComment.value = false;
    commentAttachments.value = [];
  } catch (error) {
    console.error('Failed to add comment:', error);
  } finally {
    submittingComment.value = false;
  }
};

const updateTicket = async () => {
  if (!hasChanges.value) return;
  
  updatingTicket.value = true;
  
  try {
    // Prepare update data
    const updates: any = {
      status: selectedStatus.value,
      priority: selectedPriority.value
    };
    
    // Handle assignee change
    if (selectedAssignee.value) {
      const assignee = adminUsers.value.find(admin => admin.uid === selectedAssignee.value);
      if (assignee) {
        updates.assignedTo = {
          uid: assignee.uid,
          displayName: assignee.displayName,
          photoURL: assignee.photoURL,
          role: assignee.role
        };
      }
    } else {
      // Remove assignee
      updates.assignedTo = null;
    }
    
    emit('updateTicket', updates);
  } catch (error) {
    console.error('Failed to update ticket:', error);
  } finally {
    updatingTicket.value = false;
  }
};

const downloadAttachment = (attachment: TicketAttachment) => {
  emit('downloadAttachment', attachment);
};

// Watch for ticket changes
watch(() => props.ticket, (newTicket) => {
  if (newTicket) {
    selectedStatus.value = newTicket.status;
    selectedPriority.value = newTicket.priority;
    selectedAssignee.value = newTicket.assignedTo?.uid || '';
  }
}, { immediate: true });

// Lifecycle hooks
onMounted(() => {
  // If needed, fetch ticket data if not provided via props
});
</script>

<style scoped>
.ticket-detail-container {
  width: 100%;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px;
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

.spinner.small {
  width: 16px;
  height: 16px;
  border-width: 2px;
  margin-right: 8px;
  margin-bottom: 0;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.not-found {
  text-align: center;
  padding: 60px 20px;
}

.not-found-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.not-found h3 {
  margin-bottom: 8px;
  font-size: 24px;
}

.not-found p {
  margin-bottom: 24px;
  color: #6b7280;
}

/* Ticket content */
.ticket-content {
  width: 100%;
}

/* Ticket header */
.ticket-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.ticket-title-section {
  flex: 1;
}

.ticket-id {
  font-family: monospace;
  color: #6b7280;
  margin-bottom: 4px;
}

.ticket-title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.ticket-status-section {
  display: flex;
  gap: 8px;
}

.status-badge,
.priority-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 14px;
  font-weight: 600;
}

.status-badge.open {
  background-color: #dbeafe;
  color: #1e40af;
}

.status-badge.in-progress {
  background-color: #fef3c7;
  color: #92400e;
}

.status-badge.waiting-for-customer {
  background-color: #e0e7ff;
  color: #4338ca;
}

.status-badge.resolved {
  background-color: #d1fae5;
  color: #065f46;
}

.status-badge.closed {
  background-color: #f3f4f6;
  color: #6b7280;
}

.priority-badge.low {
  background-color: #d1fae5;
  color: #065f46;
}

.priority-badge.medium {
  background-color: #fef3c7;
  color: #92400e;
}

.priority-badge.high {
  background-color: #fee2e2;
  color: #b91c1c;
}

.priority-badge.critical {
  background-color: #ef4444;
  color: white;
}

/* Ticket metadata */
.ticket-meta {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  background-color: #f9fafb;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 24px;
}

.meta-item {
  display: flex;
  flex-direction: column;
}

.meta-label {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 4px;
}

.meta-value {
  font-weight: 500;
}

/* Ticket description */
.ticket-description {
  margin-bottom: 24px;
}

.ticket-description h3,
.related-project h3,
.attachments h3,
.comments-section h3,
.admin-actions h3 {
  font-size: 18px;
  margin-top: 0;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e5e7eb;
}

.description-content {
  white-space: pre-line;
  line-height: 1.6;
}

/* Related project */
.related-project {
  margin-bottom: 24px;
}

.project-link a {
  color: #4f46e5;
  text-decoration: none;
  font-weight: 500;
}

.project-link a:hover {
  text-decoration: underline;
}

/* Attachments */
.attachments {
  margin-bottom: 24px;
}

.attachments-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.attachment-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background-color: #f3f4f6;
  border-radius: 6px;
}

.attachment-icon {
  font-size: 24px;
  margin-right: 12px;
}

.attachment-info {
  flex: 1;
}

.attachment-name {
  font-weight: 500;
  margin-bottom: 2px;
}

.attachment-size {
  font-size: 12px;
  color: #6b7280;
}

.download-btn {
  padding: 6px 12px;
  background-color: #4f46e5;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
}

.download-btn:hover {
  background-color: #4338ca;
}

.download-btn.small {
  padding: 4px 8px;
  font-size: 12px;
}

/* Comments */
.comments-section {
  margin-bottom: 32px;
}

.no-comments {
  padding: 16px;
  background-color: #f9fafb;
  border-radius: 6px;
  font-style: italic;
  color: #6b7280;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

.comment {
  padding: 16px;
  background-color: #f9fafb;
  border-radius: 8px;
  border-left: 4px solid #4f46e5;
}

.comment.internal-comment {
  background-color: #fffbeb;
  border-left-color: #eab308;
}

.comment-header {
  margin-bottom: 12px;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.author-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.author-details {
  display: flex;
  flex-direction: column;
}

.author-name {
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.role-badge {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 600;
}

.role-badge.admin {
  background-color: #4f46e5;
  color: white;
}

.role-badge.internal {
  background-color: #eab308;
  color: white;
}

.comment-date {
  font-size: 12px;
  color: #6b7280;
}

.comment-content {
  white-space: pre-line;
  line-height: 1.6;
  margin-bottom: 12px;
}

.comment-attachments {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  background-color: rgba(0, 0, 0, 0.05);
  padding: 8px;
  border-radius: 4px;
}

/* Add comment */
.add-comment {
  margin-top: 24px;
}

.comment-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  resize: vertical;
  margin-bottom: 12px;
}

.comment-attachments-upload {
  margin-bottom: 16px;
}

.file-upload-label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background-color: #f3f4f6;
  border-radius: 6px;
  cursor: pointer;
}

.file-upload-label:hover {
  background-color: #e5e7eb;
}

.upload-icon {
  font-size: 16px;
}

.file-input {
  display: none;
}

.attachments-preview {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.preview-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 12px;
  background-color: #f3f4f6;
  border-radius: 4px;
}

.preview-name {
  font-size: 14px;
}

.remove-btn {
  background: none;
  border: none;
  color: #6b7280;
  font-size: 16px;
  cursor: pointer;
}

.remove-btn:hover {
  color: #ef4444;
}

.comment-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.internal-checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #6b7280;
  font-size: 14px;
}

/* Admin actions */
.admin-actions {
  padding: 24px;
  background-color: #f9fafb;
  border-radius: 8px;
  border-left: 4px solid #4f46e5;
}

.admin-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-row {
  display: flex;
  gap: 16px;
}

.form-group {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 8px;
  font-weight: 600;
  font-size: 14px;
}

.form-select {
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  appearance: none;
  background: white url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E") no-repeat right 12px center;
  background-size: 16px;
  padding-right: 36px;
}

.admin-buttons {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
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

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Responsive */
@media (max-width: 768px) {
  .ticket-header {
    flex-direction: column;
    gap: 16px;
  }
  
  .ticket-meta {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .form-row {
    flex-direction: column;
    gap: 16px;
  }
  
  .comment-actions {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
  
  .btn {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .ticket-meta {
    grid-template-columns: 1fr;
  }
}
</style>