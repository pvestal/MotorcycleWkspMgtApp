<template>
  <div class="helpdesk-container">
    <div class="page-header">
      <h1>Helpdesk Support</h1>
      <div class="header-actions" v-if="canAccessHelpdesk">
        <button class="btn primary" @click="showNewTicketModal = true">
          <span class="icon">+</span> New Support Ticket
        </button>
      </div>
    </div>

    <div v-if="!canAccessHelpdesk" class="upgrade-container">
      <div class="upgrade-card">
        <h2>Premium Support Access</h2>
        <p>
          Helpdesk support is available exclusively to Premium and Professional subscribers.
          Upgrade your subscription to get direct assistance from our support team.
        </p>
        <div class="features">
          <div class="feature">
            <span class="feature-icon">✓</span>
            <span class="feature-text">Priority support tickets</span>
          </div>
          <div class="feature">
            <span class="feature-icon">✓</span>
            <span class="feature-text">Faster response times</span>
          </div>
          <div class="feature">
            <span class="feature-icon">✓</span>
            <span class="feature-text">Access to premium knowledge base</span>
          </div>
          <div class="feature">
            <span class="feature-icon">✓</span>
            <span class="feature-text">Screen sharing support sessions</span>
          </div>
        </div>
        <router-link to="/subscription" class="btn primary">Upgrade Subscription</router-link>
      </div>
    </div>

    <div v-else class="helpdesk-content">
      <div class="helpdesk-tabs">
        <button 
          class="tab-button" 
          :class="{ active: activeTab === 'myTickets' }" 
          @click="activeTab = 'myTickets'"
        >
          My Tickets
        </button>
        <button 
          class="tab-button" 
          :class="{ active: activeTab === 'knowledgeBase' }" 
          @click="activeTab = 'knowledgeBase'"
        >
          Knowledge Base
        </button>
        <button 
          v-if="isAdmin" 
          class="tab-button" 
          :class="{ active: activeTab === 'allTickets' }" 
          @click="activeTab = 'allTickets'"
        >
          All Tickets
        </button>
        <button 
          v-if="isAdmin" 
          class="tab-button" 
          :class="{ active: activeTab === 'reports' }" 
          @click="activeTab = 'reports'"
        >
          Reports
        </button>
      </div>

      <!-- My Tickets Tab -->
      <div v-if="activeTab === 'myTickets'" class="tab-content">
        <div class="tickets-header">
          <h2>My Support Tickets</h2>
          <div class="tickets-filters">
            <select v-model="statusFilter" class="filter-select">
              <option value="All">All Statuses</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
              <option value="Waiting for Customer">Waiting for Customer</option>
            </select>
          </div>
        </div>
        
        <div v-if="loading" class="loading-indicator">
          <div class="spinner"></div>
          <p>Loading tickets...</p>
        </div>
        
        <div v-else-if="userTickets.length === 0" class="empty-state">
          <div class="empty-icon">📩</div>
          <h3>No Tickets Found</h3>
          <p>You don't have any support tickets yet. Create a new ticket to get help from our support team.</p>
          <button class="btn primary" @click="showNewTicketModal = true">Create New Ticket</button>
        </div>
        
        <div v-else class="tickets-list">
          <div 
            v-for="ticket in userTickets" 
            :key="ticket.id" 
            class="ticket-card"
            :class="{ 
              'high-priority': ticket.priority === 'High' || ticket.priority === 'Critical',
              'resolved': ticket.status === 'Resolved' || ticket.status === 'Closed'
            }"
            @click="viewTicket(ticket)"
          >
            <div class="ticket-header">
              <span class="ticket-id">#{{ ticket.id.substring(0, 8) }}</span>
              <span class="ticket-status" :class="ticket.status.toLowerCase().replace(' ', '-')">
                {{ ticket.status }}
              </span>
            </div>
            <div class="ticket-title">{{ ticket.title }}</div>
            <div class="ticket-meta">
              <span class="ticket-category">{{ ticket.category }}</span>
              <span class="ticket-priority" :class="ticket.priority.toLowerCase()">
                {{ ticket.priority }}
              </span>
            </div>
            <div class="ticket-date">
              {{ formatDate(ticket.createdAt) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Knowledge Base Tab -->
      <div v-if="activeTab === 'knowledgeBase'" class="tab-content">
        <div class="kb-header">
          <h2>Knowledge Base</h2>
          <div class="kb-search">
            <input 
              type="text" 
              v-model="kbSearchTerm" 
              placeholder="Search knowledge base articles..." 
              class="search-input"
            />
          </div>
        </div>
        
        <div class="kb-categories">
          <button 
            class="category-btn" 
            :class="{ active: selectedCategory === 'All' }"
            @click="selectedCategory = 'All'"
          >
            All Categories
          </button>
          <button 
            v-for="category in kbCategories" 
            :key="category"
            class="category-btn" 
            :class="{ active: selectedCategory === category }"
            @click="selectedCategory = category"
          >
            {{ category }}
          </button>
        </div>

        <div v-if="loading" class="loading-indicator">
          <div class="spinner"></div>
          <p>Loading articles...</p>
        </div>
        
        <div v-else-if="filteredArticles.length === 0" class="empty-state">
          <div class="empty-icon">📚</div>
          <h3>No Articles Found</h3>
          <p>No knowledge base articles found for the selected category or search term.</p>
          <button class="btn secondary" @click="resetKbFilters">Reset Filters</button>
        </div>
        
        <div v-else class="kb-articles">
          <div 
            v-for="article in filteredArticles" 
            :key="article.id"
            class="article-card"
            @click="viewArticle(article)"
          >
            <h3 class="article-title">{{ article.title }}</h3>
            <div class="article-preview">
              {{ article.content.substring(0, 150) }}...
            </div>
            <div class="article-meta">
              <span class="article-category">{{ article.category }}</span>
              <span class="article-metrics">
                <span class="views">👁️ {{ article.viewCount }}</span>
                <span class="helpful">👍 {{ article.helpfulCount }}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Admin: All Tickets Tab -->
      <div v-if="activeTab === 'allTickets' && isAdmin" class="tab-content">
        <div class="tickets-header">
          <h2>All Support Tickets</h2>
          <div class="admin-filters">
            <select v-model="statusFilter" class="filter-select">
              <option value="All">All Statuses</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
              <option value="Waiting for Customer">Waiting for Customer</option>
            </select>
            
            <select v-model="priorityFilter" class="filter-select">
              <option value="All">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
            
            <select v-model="categoryFilter" class="filter-select">
              <option value="All">All Categories</option>
              <option v-for="category in ticketCategories" :key="category" :value="category">
                {{ category }}
              </option>
            </select>
            
            <input 
              type="text" 
              v-model="searchTerm" 
              placeholder="Search tickets..." 
              class="search-input"
            />
          </div>
        </div>
        
        <div v-if="loading" class="loading-indicator">
          <div class="spinner"></div>
          <p>Loading tickets...</p>
        </div>
        
        <div v-else-if="filteredTickets.length === 0" class="empty-state">
          <h3>No Tickets Found</h3>
          <p>No tickets found matching the current filters.</p>
          <button class="btn secondary" @click="resetTicketFilters">Reset Filters</button>
        </div>
        
        <div v-else class="admin-tickets-list">
          <table class="tickets-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>User</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Category</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="ticket in filteredTickets" 
                :key="ticket.id"
                :class="{
                  'high-priority': ticket.priority === 'High' || ticket.priority === 'Critical',
                  'resolved': ticket.status === 'Resolved' || ticket.status === 'Closed'
                }"
              >
                <td>{{ ticket.id.substring(0, 8) }}</td>
                <td>{{ ticket.title }}</td>
                <td>{{ ticket.userDisplayName }}</td>
                <td>
                  <span class="status-badge" :class="ticket.status.toLowerCase().replace(' ', '-')">
                    {{ ticket.status }}
                  </span>
                </td>
                <td>
                  <span class="priority-badge" :class="ticket.priority.toLowerCase()">
                    {{ ticket.priority }}
                  </span>
                </td>
                <td>{{ ticket.category }}</td>
                <td>{{ formatDate(ticket.createdAt) }}</td>
                <td>
                  <button class="btn small" @click.stop="viewTicket(ticket)">View</button>
                  <button class="btn small danger" @click.stop="deleteTicket(ticket.id)">Delete</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Admin: Reports Tab -->
      <div v-if="activeTab === 'reports' && isAdmin" class="tab-content">
        <div class="reports-header">
          <h2>Helpdesk Reports</h2>
          <div class="report-actions">
            <button class="btn primary" @click="showNewReportModal = true">
              Generate New Report
            </button>
          </div>
        </div>
        
        <div class="report-filters">
          <select v-model="reportTypeFilter" class="filter-select">
            <option value="All">All Reports</option>
            <option value="Daily">Daily</option>
            <option value="Weekly">Weekly</option>
            <option value="Monthly">Monthly</option>
            <option value="Custom">Custom</option>
          </select>
          
          <div class="date-range">
            <label>Date Range:</label>
            <input type="date" v-model="reportStartDate" class="date-input" />
            <span>to</span>
            <input type="date" v-model="reportEndDate" class="date-input" />
            <button class="btn small" @click="filterReports">Apply</button>
          </div>
        </div>
        
        <div v-if="loading" class="loading-indicator">
          <div class="spinner"></div>
          <p>Loading reports...</p>
        </div>
        
        <div v-else-if="reports.length === 0" class="empty-state">
          <div class="empty-icon">📊</div>
          <h3>No Reports Found</h3>
          <p>No helpdesk reports have been generated yet. Create a new report to analyze ticket data.</p>
          <button class="btn primary" @click="showNewReportModal = true">Generate Report</button>
        </div>
        
        <div v-else class="reports-list">
          <div 
            v-for="report in reports" 
            :key="report.id"
            class="report-card"
            @click="viewReport(report)"
          >
            <div class="report-header">
              <h3>{{ report.reportType }} Report</h3>
              <span class="report-date">
                {{ formatDate(report.generatedAt) }}
              </span>
            </div>
            
            <div class="report-summary">
              <div class="metric">
                <div class="metric-value">{{ report.metrics.totalTickets }}</div>
                <div class="metric-label">Total Tickets</div>
              </div>
              
              <div class="metric">
                <div class="metric-value">{{ report.metrics.resolvedTickets }}</div>
                <div class="metric-label">Resolved</div>
              </div>
              
              <div class="metric">
                <div class="metric-value">{{ report.metrics.avgResolutionTime.toFixed(1) }}h</div>
                <div class="metric-label">Avg Resolution</div>
              </div>
            </div>
            
            <div class="report-period">
              Period: {{ formatDate(report.startDate) }} - {{ formatDate(report.endDate) }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Ticket Detail Modal -->
    <transition name="modal-fade">
      <div v-if="showTicketModal" class="modal-overlay" @click="closeTicketModal">
        <div class="modal-container" @click.stop>
          <div class="modal-header">
            <h2>Ticket #{{ activeTicket?.id.substring(0, 8) }}</h2>
            <button class="modal-close" @click="closeTicketModal">&times;</button>
          </div>
          
          <div class="modal-body">
            <div class="ticket-detail">
              <div class="ticket-detail-header">
                <h3 class="ticket-detail-title">{{ activeTicket?.title }}</h3>
                <div class="ticket-detail-meta">
                  <span class="ticket-status" :class="activeTicket?.status.toLowerCase().replace(' ', '-')">
                    {{ activeTicket?.status }}
                  </span>
                  <span class="ticket-priority" :class="activeTicket?.priority.toLowerCase()">
                    {{ activeTicket?.priority }}
                  </span>
                  <span class="ticket-category">{{ activeTicket?.category }}</span>
                </div>
              </div>
              
              <div class="ticket-detail-info">
                <div>
                  <strong>Created by:</strong> {{ activeTicket?.userDisplayName }}
                </div>
                <div>
                  <strong>Created:</strong> {{ formatDate(activeTicket?.createdAt) }}
                </div>
                <div v-if="activeTicket?.updatedAt">
                  <strong>Last Updated:</strong> {{ formatDate(activeTicket?.updatedAt) }}
                </div>
                <div v-if="activeTicket?.assignedTo">
                  <strong>Assigned to:</strong> {{ activeTicket?.assignedTo.displayName }}
                </div>
              </div>
              
              <div class="ticket-detail-description">
                <h4>Description</h4>
                <p>{{ activeTicket?.description }}</p>
              </div>
              
              <div v-if="activeTicket?.relatedProject" class="ticket-related-project">
                <h4>Related Project</h4>
                <router-link :to="`/projects/${activeTicket.relatedProject.projectId}`" class="project-link">
                  {{ activeTicket.relatedProject.projectName }}
                </router-link>
              </div>
              
              <div class="ticket-comments">
                <h4>Comments</h4>
                
                <div v-if="ticketComments.length === 0" class="no-comments">
                  No comments yet.
                </div>
                
                <div v-else class="comments-list">
                  <div 
                    v-for="comment in ticketComments" 
                    :key="comment.id"
                    class="comment"
                    :class="{ 'internal-comment': comment.isInternal }"
                  >
                    <div class="comment-header">
                      <div class="comment-author">
                        <img :src="comment.createdBy.photoURL" alt="avatar" class="avatar" />
                        <span>{{ comment.createdBy.displayName }}</span>
                        <span v-if="comment.createdBy.role === 'admin'" class="badge admin">Staff</span>
                        <span v-if="comment.isInternal" class="badge internal">Internal</span>
                      </div>
                      <div class="comment-date">
                        {{ formatDate(comment.createdAt) }}
                      </div>
                    </div>
                    <div class="comment-content">
                      {{ comment.content }}
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="add-comment">
                <h4>Add Comment</h4>
                <textarea 
                  v-model="newComment" 
                  placeholder="Type your comment here..." 
                  class="comment-input"
                  rows="3"
                ></textarea>
                
                <div class="comment-actions">
                  <label v-if="isAdmin" class="internal-checkbox">
                    <input type="checkbox" v-model="isInternalComment" />
                    Internal comment (only visible to staff)
                  </label>
                  <button 
                    class="btn primary" 
                    @click="addComment" 
                    :disabled="!newComment.trim()"
                  >
                    Add Comment
                  </button>
                </div>
              </div>
            </div>
            
            <div v-if="isAdmin" class="admin-actions">
              <h4>Admin Actions</h4>
              
              <div class="action-group">
                <label>Status:</label>
                <select v-model="ticketStatus" class="admin-select">
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Waiting for Customer">Waiting for Customer</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
                
                <label>Priority:</label>
                <select v-model="ticketPriority" class="admin-select">
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
                
                <button class="btn primary" @click="updateTicket">Update Ticket</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- New Ticket Modal -->
    <transition name="modal-fade">
      <div v-if="showNewTicketModal" class="modal-overlay" @click="showNewTicketModal = false">
        <div class="modal-container" @click.stop>
          <div class="modal-header">
            <h2>Create New Support Ticket</h2>
            <button class="modal-close" @click="showNewTicketModal = false">&times;</button>
          </div>
          
          <div class="modal-body">
            <div class="form-group">
              <label for="ticket-title">Title</label>
              <input 
                type="text" 
                id="ticket-title" 
                v-model="newTicket.title" 
                placeholder="Brief summary of your issue"
                class="form-input"
              />
            </div>
            
            <div class="form-group">
              <label for="ticket-description">Description</label>
              <textarea 
                id="ticket-description" 
                v-model="newTicket.description" 
                placeholder="Detailed description of your issue..."
                class="form-input"
                rows="5"
              ></textarea>
            </div>
            
            <div class="form-row">
              <div class="form-group half">
                <label for="ticket-category">Category</label>
                <select id="ticket-category" v-model="newTicket.category" class="form-input">
                  <option v-for="category in ticketCategories" :key="category" :value="category">
                    {{ category }}
                  </option>
                </select>
              </div>
              
              <div class="form-group half">
                <label for="ticket-priority">Priority</label>
                <select id="ticket-priority" v-model="newTicket.priority" class="form-input">
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
            </div>
            
            <div class="form-group">
              <label for="related-project">Related Project (Optional)</label>
              <select id="related-project" v-model="newTicket.relatedProjectId" class="form-input">
                <option value="">None</option>
                <option v-for="project in userProjects" :key="project.projectId" :value="project.projectId">
                  {{ project.projectName }}
                </option>
              </select>
            </div>
            
            <div class="form-actions">
              <button class="btn secondary" @click="showNewTicketModal = false">Cancel</button>
              <button 
                class="btn primary" 
                @click="submitNewTicket" 
                :disabled="!isNewTicketValid"
              >
                Submit Ticket
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- New Report Modal -->
    <transition name="modal-fade">
      <div v-if="showNewReportModal" class="modal-overlay" @click="showNewReportModal = false">
        <div class="modal-container" @click.stop>
          <div class="modal-header">
            <h2>Generate New Report</h2>
            <button class="modal-close" @click="showNewReportModal = false">&times;</button>
          </div>
          
          <div class="modal-body">
            <div class="form-group">
              <label for="report-type">Report Type</label>
              <select id="report-type" v-model="newReport.type" class="form-input">
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
                <option value="Custom">Custom</option>
              </select>
            </div>
            
            <div class="form-row">
              <div class="form-group half">
                <label for="report-start-date">Start Date</label>
                <input 
                  type="date" 
                  id="report-start-date" 
                  v-model="newReport.startDate" 
                  class="form-input"
                />
              </div>
              
              <div class="form-group half">
                <label for="report-end-date">End Date</label>
                <input 
                  type="date" 
                  id="report-end-date" 
                  v-model="newReport.endDate" 
                  class="form-input"
                />
              </div>
            </div>
            
            <div class="form-actions">
              <button class="btn secondary" @click="showNewReportModal = false">Cancel</button>
              <button 
                class="btn primary" 
                @click="generateReport" 
                :disabled="!isNewReportValid"
              >
                Generate Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useHelpdeskStore } from '@/stores/helpdeskStore';
import { useUserStore } from '@/stores/userStore';
import { useProjectStore } from '@/stores/projectStore';
import { Timestamp } from 'firebase/firestore';
import { 
  SupportTicket, 
  KnowledgeBaseArticle, 
  HelpdeskReport,
  TicketCategory, 
  TicketPriority, 
  TicketStatus 
} from '@/types/helpdesk';

// Stores
const helpdeskStore = useHelpdeskStore();
const userStore = useUserStore();
const projectStore = useProjectStore();

// State
const loading = ref(false);
const activeTab = ref('myTickets');
const showTicketModal = ref(false);
const showNewTicketModal = ref(false);
const showNewReportModal = ref(false);
const newComment = ref('');
const isInternalComment = ref(false);
const ticketStatus = ref<TicketStatus>('Open');
const ticketPriority = ref<TicketPriority>('Medium');

// Ticket filters
const statusFilter = ref<TicketStatus | 'All'>('All');
const priorityFilter = ref<TicketPriority | 'All'>('All');
const categoryFilter = ref<TicketCategory | 'All'>('All');
const searchTerm = ref('');

// Knowledge base filters
const kbSearchTerm = ref('');
const selectedCategory = ref<TicketCategory | 'All'>('All');

// Report filters
const reportTypeFilter = ref('All');
const reportStartDate = ref('');
const reportEndDate = ref('');

// New ticket form
const newTicket = ref({
  title: '',
  description: '',
  category: 'Technical Support' as TicketCategory,
  priority: 'Medium' as TicketPriority,
  relatedProjectId: ''
});

// New report form
const newReport = ref({
  type: 'Weekly',
  startDate: '',
  endDate: ''
});

// Computed properties
const isAdmin = computed(() => userStore.isAdmin);
const canAccessHelpdesk = computed(() => helpdeskStore.canAccessHelpdesk());
const activeTicket = computed(() => helpdeskStore.getActiveTicket);
const userTickets = computed(() => {
  if (statusFilter.value === 'All') {
    return helpdeskStore.getUserTickets;
  }
  return helpdeskStore.getUserTickets.filter(ticket => ticket.status === statusFilter.value);
});
const filteredTickets = computed(() => {
  return helpdeskStore.getFilteredTickets;
});
const ticketComments = computed(() => helpdeskStore.getActiveTicketComments);
const userProjects = computed(() => projectStore.projects);
const reports = computed(() => {
  if (reportTypeFilter.value === 'All') {
    return helpdeskStore.getReports;
  }
  return helpdeskStore.getReports.filter(report => report.reportType === reportTypeFilter.value);
});

// Knowledge base
const kbCategories = computed(() => {
  const categories = helpdeskStore.getPublishedArticles.map(article => article.category);
  return [...new Set(categories)];
});

const filteredArticles = computed(() => {
  let articles = helpdeskStore.getPublishedArticles;
  
  // Apply category filter
  if (selectedCategory.value !== 'All') {
    articles = articles.filter(article => article.category === selectedCategory.value);
  }
  
  // Apply search filter
  if (kbSearchTerm.value) {
    const search = kbSearchTerm.value.toLowerCase();
    articles = articles.filter(article => 
      article.title.toLowerCase().includes(search) || 
      article.content.toLowerCase().includes(search) ||
      article.tags.some(tag => tag.toLowerCase().includes(search))
    );
  }
  
  return articles;
});

// Validation
const isNewTicketValid = computed(() => {
  return (
    newTicket.value.title.trim() !== '' && 
    newTicket.value.description.trim() !== ''
  );
});

const isNewReportValid = computed(() => {
  return (
    newReport.value.startDate && 
    newReport.value.endDate && 
    new Date(newReport.value.startDate) <= new Date(newReport.value.endDate)
  );
});

// Constants
const ticketCategories: TicketCategory[] = [
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

const viewTicket = async (ticket: SupportTicket) => {
  loading.value = true;
  await helpdeskStore.fetchTicketById(ticket.id);
  ticketStatus.value = ticket.status;
  ticketPriority.value = ticket.priority;
  loading.value = false;
  showTicketModal.value = true;
};

const closeTicketModal = () => {
  showTicketModal.value = false;
  newComment.value = '';
  isInternalComment.value = false;
  helpdeskStore.clearActiveTicket();
};

const addComment = async () => {
  if (!activeTicket.value || !newComment.value.trim()) return;
  
  loading.value = true;
  await helpdeskStore.addTicketComment(
    activeTicket.value.id,
    newComment.value,
    isInternalComment.value
  );
  newComment.value = '';
  loading.value = false;
};

const updateTicket = async () => {
  if (!activeTicket.value) return;
  
  loading.value = true;
  await helpdeskStore.updateTicket(activeTicket.value.id, {
    status: ticketStatus.value,
    priority: ticketPriority.value
  });
  loading.value = false;
};

const submitNewTicket = async () => {
  if (!isNewTicketValid.value) return;
  
  loading.value = true;
  
  const ticketData: Partial<SupportTicket> = {
    title: newTicket.value.title,
    description: newTicket.value.description,
    category: newTicket.value.category,
    priority: newTicket.value.priority
  };
  
  // Add related project if selected
  if (newTicket.value.relatedProjectId) {
    const project = userProjects.value.find(p => p.projectId === newTicket.value.relatedProjectId);
    if (project) {
      ticketData.relatedProject = {
        projectId: project.projectId,
        projectName: project.projectName
      };
    }
  }
  
  try {
    await helpdeskStore.createTicket(ticketData);
    resetNewTicketForm();
    showNewTicketModal.value = false;
    activeTab.value = 'myTickets';
  } catch (error) {
    console.error('Failed to create ticket:', error);
  } finally {
    loading.value = false;
  }
};

const resetNewTicketForm = () => {
  newTicket.value = {
    title: '',
    description: '',
    category: 'Technical Support',
    priority: 'Medium',
    relatedProjectId: ''
  };
};

const resetTicketFilters = () => {
  statusFilter.value = 'All';
  priorityFilter.value = 'All';
  categoryFilter.value = 'All';
  searchTerm.value = '';
  helpdeskStore.resetFilters();
};

const resetKbFilters = () => {
  kbSearchTerm.value = '';
  selectedCategory.value = 'All';
};

const viewArticle = async (article: KnowledgeBaseArticle) => {
  // Track article view
  await helpdeskStore.trackArticleView(article.id);
  
  // In a real app, this would navigate to the article detail page
  // For now, we'll just log it
  console.log('Viewing article:', article);
};

const deleteTicket = async (ticketId: string) => {
  if (!confirm('Are you sure you want to delete this ticket? This action cannot be undone.')) {
    return;
  }
  
  // In a real app, this would call a delete method in the store
  // For this example, we'll just log it
  console.log('Deleting ticket:', ticketId);
};

const viewReport = (report: HelpdeskReport) => {
  // In a real app, this would navigate to a report detail page
  // For now, we'll just log it
  console.log('Viewing report:', report);
};

const generateReport = async () => {
  if (!isNewReportValid.value) return;
  
  loading.value = true;
  try {
    const startDate = new Date(newReport.value.startDate);
    const endDate = new Date(newReport.value.endDate);
    
    // Set end of day for end date
    endDate.setHours(23, 59, 59);
    
    await helpdeskStore.generateReport(
      newReport.value.type as any,
      startDate,
      endDate
    );
    
    showNewReportModal.value = false;
    resetNewReportForm();
  } catch (error) {
    console.error('Failed to generate report:', error);
  } finally {
    loading.value = false;
  }
};

const resetNewReportForm = () => {
  const today = new Date();
  const startDate = new Date();
  
  // Default to last week for Weekly reports
  startDate.setDate(today.getDate() - 7);
  
  newReport.value = {
    type: 'Weekly',
    startDate: startDate.toISOString().split('T')[0],
    endDate: today.toISOString().split('T')[0]
  };
};

const filterReports = () => {
  // This would apply the date range filters to reports
  console.log('Filtering reports by date range:', reportStartDate.value, reportEndDate.value);
};

// Watchers
watch([statusFilter, priorityFilter, categoryFilter, searchTerm], ([status, priority, category, search]) => {
  helpdeskStore.setTicketFilters({
    status,
    priority,
    category,
    searchTerm: search
  });
});

// Lifecycle hooks
onMounted(async () => {
  loading.value = true;
  resetNewReportForm();
  
  try {
    // Check if user can access helpdesk
    if (canAccessHelpdesk.value) {
      // Load user tickets
      await helpdeskStore.fetchUserTickets();
      
      // Load knowledge base
      await helpdeskStore.fetchKnowledgeBase();
      
      // Load projects for ticket creation
      await projectStore.fetchProjects();
      
      // Load admin data if admin
      if (isAdmin.value) {
        await helpdeskStore.fetchAllTickets();
        await helpdeskStore.fetchReports();
      }
    }
  } catch (error) {
    console.error('Error loading helpdesk data:', error);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.helpdesk-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-header h1 {
  margin: 0;
  font-size: 28px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

/* Tabs */
.helpdesk-tabs {
  display: flex;
  border-bottom: 1px solid #ddd;
  margin-bottom: 24px;
}

.tab-button {
  padding: 12px 24px;
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.2s;
}

.tab-button:hover {
  color: #4f46e5;
}

.tab-button.active {
  color: #4f46e5;
  border-bottom-color: #4f46e5;
}

.tab-content {
  min-height: 400px;
}

/* Loading indicator */
.loading-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
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

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Empty state */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  background-color: #f9fafb;
  border-radius: 8px;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-state h3 {
  margin-bottom: 8px;
  font-size: 20px;
}

.empty-state p {
  margin-bottom: 24px;
  color: #6b7280;
}

/* Buttons */
.btn {
  padding: 10px 16px;
  border-radius: 6px;
  border: none;
  font-weight: 600;
  cursor: pointer;
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

.btn.danger {
  background-color: #ef4444;
  color: white;
}

.btn.danger:hover {
  background-color: #dc2626;
}

.btn.small {
  padding: 6px 12px;
  font-size: 14px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Tickets list */
.tickets-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.tickets-filters {
  display: flex;
  gap: 12px;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background-color: white;
}

.tickets-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.ticket-card {
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #ddd;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: all 0.2s;
}

.ticket-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.ticket-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.ticket-id {
  font-family: monospace;
  color: #6b7280;
}

.ticket-status {
  font-size: 12px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 12px;
}

.ticket-status.open {
  background-color: #dbeafe;
  color: #1e40af;
}

.ticket-status.in-progress {
  background-color: #fef3c7;
  color: #92400e;
}

.ticket-status.waiting-for-customer {
  background-color: #e0e7ff;
  color: #4338ca;
}

.ticket-status.resolved {
  background-color: #d1fae5;
  color: #065f46;
}

.ticket-status.closed {
  background-color: #f3f4f6;
  color: #6b7280;
}

.ticket-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
}

.ticket-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.ticket-category {
  background-color: #f3f4f6;
  color: #1f2937;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 12px;
}

.ticket-priority {
  font-size: 12px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 12px;
}

.ticket-priority.low {
  background-color: #d1fae5;
  color: #065f46;
}

.ticket-priority.medium {
  background-color: #fef3c7;
  color: #92400e;
}

.ticket-priority.high {
  background-color: #fee2e2;
  color: #b91c1c;
}

.ticket-priority.critical {
  background-color: #ef4444;
  color: white;
}

.ticket-date {
  font-size: 12px;
  color: #6b7280;
}

.high-priority {
  border-left: 4px solid #ef4444;
}

.resolved {
  opacity: 0.7;
}

/* Admin tickets table */
.tickets-table {
  width: 100%;
  border-collapse: collapse;
}

.tickets-table th {
  text-align: left;
  padding: 12px 16px;
  background-color: #f9fafb;
  border-bottom: 1px solid #ddd;
  font-weight: 600;
}

.tickets-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #ddd;
}

.status-badge, .priority-badge {
  display: inline-block;
  font-size: 12px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 12px;
}

/* Admin filters */
.admin-filters {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.search-input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  width: 200px;
}

/* Knowledge base */
.kb-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.kb-search {
  width: 300px;
}

.kb-categories {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.category-btn {
  padding: 6px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background-color: white;
  cursor: pointer;
}

.category-btn.active {
  background-color: #4f46e5;
  color: white;
  border-color: #4f46e5;
}

.kb-articles {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 16px;
}

.article-card {
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #ddd;
  background-color: white;
  cursor: pointer;
  transition: all 0.2s;
}

.article-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.article-title {
  margin-top: 0;
  margin-bottom: 12px;
}

.article-preview {
  margin-bottom: 16px;
  color: #4b5563;
  font-size: 14px;
}

.article-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.article-category {
  background-color: #f3f4f6;
  color: #1f2937;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 12px;
}

.article-metrics {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #6b7280;
}

/* Reports */
.reports-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.report-filters {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  align-items: center;
}

.date-range {
  display: flex;
  gap: 8px;
  align-items: center;
}

.date-input {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 6px;
}

.reports-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.report-card {
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #ddd;
  background-color: white;
  cursor: pointer;
  transition: all 0.2s;
}

.report-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.report-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.report-header h3 {
  margin: 0;
}

.report-date {
  font-size: 12px;
  color: #6b7280;
}

.report-summary {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
}

.metric {
  text-align: center;
  flex: 1;
}

.metric-value {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 4px;
}

.metric-label {
  font-size: 12px;
  color: #6b7280;
}

.report-period {
  font-size: 12px;
  color: #6b7280;
  text-align: right;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-container {
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #ddd;
}

.modal-header h2 {
  margin: 0;
  font-size: 20px;
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #6b7280;
}

.modal-body {
  padding: 24px;
}

.modal-fade-enter-active, .modal-fade-leave-active {
  transition: opacity 0.3s;
}

.modal-fade-enter-from, .modal-fade-leave-to {
  opacity: 0;
}

/* Ticket detail */
.ticket-detail-header {
  margin-bottom: 16px;
}

.ticket-detail-title {
  margin-top: 0;
  margin-bottom: 12px;
  font-size: 20px;
}

.ticket-detail-meta {
  display: flex;
  gap: 8px;
}

.ticket-detail-info {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 24px;
  padding: 16px;
  background-color: #f9fafb;
  border-radius: 8px;
}

.ticket-detail-description {
  margin-bottom: 24px;
}

.ticket-detail-description h4 {
  margin-top: 0;
  margin-bottom: 8px;
}

.ticket-related-project {
  margin-bottom: 24px;
}

.ticket-related-project h4 {
  margin-top: 0;
  margin-bottom: 8px;
}

.project-link {
  color: #4f46e5;
  text-decoration: none;
}

.project-link:hover {
  text-decoration: underline;
}

/* Comments */
.ticket-comments {
  margin-bottom: 24px;
}

.ticket-comments h4 {
  margin-top: 0;
  margin-bottom: 16px;
}

.no-comments {
  font-style: italic;
  color: #6b7280;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.comment {
  padding: 16px;
  border-radius: 8px;
  background-color: #f9fafb;
  border-left: 4px solid #4f46e5;
}

.comment.internal-comment {
  background-color: #fef3c7;
  border-left-color: #eab308;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.comment-author {
  display: flex;
  align-items: center;
  gap: 8px;
}

.avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
}

.badge {
  font-size: 10px;
  font-weight: 600;
  padding: 1px 6px;
  border-radius: 8px;
}

.badge.admin {
  background-color: #4f46e5;
  color: white;
}

.badge.internal {
  background-color: #eab308;
  color: white;
}

.comment-date {
  font-size: 12px;
  color: #6b7280;
}

.comment-content {
  white-space: pre-line;
}

/* Add comment */
.add-comment {
  margin-top: 24px;
}

.add-comment h4 {
  margin-top: 0;
  margin-bottom: 8px;
}

.comment-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  resize: vertical;
  margin-bottom: 12px;
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
  font-size: 14px;
  color: #6b7280;
}

/* Admin actions */
.admin-actions {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #ddd;
}

.admin-actions h4 {
  margin-top: 0;
  margin-bottom: 16px;
}

.action-group {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.admin-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
}

/* Form styles */
.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
}

.form-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
}

.form-row {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.form-group.half {
  flex: 1;
  margin-bottom: 0;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

/* Upgrade container */
.upgrade-container {
  display: flex;
  justify-content: center;
  padding: 40px 20px;
}

.upgrade-card {
  max-width: 500px;
  padding: 32px;
  border-radius: 8px;
  background-color: white;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.upgrade-card h2 {
  margin-top: 0;
  margin-bottom: 16px;
  color: #4f46e5;
}

.upgrade-card p {
  margin-bottom: 24px;
  color: #4b5563;
}

.features {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
  text-align: left;
}

.feature {
  display: flex;
  align-items: center;
  gap: 8px;
}

.feature-icon {
  color: #10b981;
  font-weight: bold;
}

/* Responsive */
@media (max-width: 768px) {
  .modal-container {
    width: 95%;
  }
  
  .ticket-detail-info {
    grid-template-columns: 1fr;
  }
  
  .tickets-table {
    display: block;
    overflow-x: auto;
  }
  
  .form-row {
    flex-direction: column;
    gap: 16px;
  }
  
  .action-group {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .admin-select, .btn {
    width: 100%;
  }
}
</style>