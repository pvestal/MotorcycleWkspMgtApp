/**
 * Helpdesk Store
 * 
 * Manages the state and operations for the helpdesk feature of the application.
 * Handles tickets, comments, knowledge base articles, and admin reporting.
 */

import { defineStore } from 'pinia';
import { db } from '@/fbConfig';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc,
  getDocs, 
  doc, 
  query, 
  where, 
  orderBy,
  limit,
  Timestamp,
  writeBatch,
  increment
} from 'firebase/firestore';
import { useErrorStore } from './errorStore';
import { useUserStore } from './userStore';
import { 
  SupportTicket, 
  SupportTicketUpdate, 
  TicketComment, 
  TicketAttachment, 
  KnowledgeBaseArticle,
  HelpdeskReport,
  TicketCategory, 
  TicketPriority, 
  TicketStatus 
} from '../types/helpdesk';
import { User, UserReference } from '../types';

// Define the store state interface
interface HelpdeskState {
  tickets: SupportTicket[];
  userTickets: SupportTicket[];
  assignedTickets: SupportTicket[];
  activeTicket: SupportTicket | null;
  ticketComments: TicketComment[];
  knowledgeBase: KnowledgeBaseArticle[];
  reports: HelpdeskReport[];
  loading: boolean;
  ticketFilters: {
    status: TicketStatus | 'All';
    priority: TicketPriority | 'All';
    category: TicketCategory | 'All';
    assignedTo: string | 'All'; // User ID or 'All'
    searchTerm: string;
  };
  pagination: {
    currentPage: number;
    totalPages: number;
    itemsPerPage: number;
    totalItems: number;
  };
}

export const useHelpdeskStore = defineStore('helpdeskStore', {
  state: (): HelpdeskState => ({
    tickets: [],
    userTickets: [],
    assignedTickets: [],
    activeTicket: null,
    ticketComments: [],
    knowledgeBase: [],
    reports: [],
    loading: false,
    ticketFilters: {
      status: 'All',
      priority: 'All',
      category: 'All',
      assignedTo: 'All',
      searchTerm: '',
    },
    pagination: {
      currentPage: 1,
      totalPages: 1,
      itemsPerPage: 10,
      totalItems: 0,
    },
  }),

  getters: {
    /**
     * Get all tickets
     */
    getAllTickets(state): SupportTicket[] {
      return state.tickets;
    },

    /**
     * Get current user's tickets
     */
    getUserTickets(state): SupportTicket[] {
      return state.userTickets;
    },

    /**
     * Get tickets assigned to current user
     */
    getAssignedTickets(state): SupportTicket[] {
      return state.assignedTickets;
    },

    /**
     * Get active ticket
     */
    getActiveTicket(state): SupportTicket | null {
      return state.activeTicket;
    },

    /**
     * Get tickets by status
     */
    getTicketsByStatus: (state) => (status: TicketStatus): SupportTicket[] => {
      return state.tickets.filter(ticket => ticket.status === status);
    },

    /**
     * Get tickets by priority
     */
    getTicketsByPriority: (state) => (priority: TicketPriority): SupportTicket[] => {
      return state.tickets.filter(ticket => ticket.priority === priority);
    },

    /**
     * Get tickets by category
     */
    getTicketsByCategory: (state) => (category: TicketCategory): SupportTicket[] => {
      return state.tickets.filter(ticket => ticket.category === category);
    },

    /**
     * Get filtered tickets based on current filters
     */
    getFilteredTickets(state): SupportTicket[] {
      let filtered = [...state.tickets];

      // Apply status filter
      if (state.ticketFilters.status !== 'All') {
        filtered = filtered.filter(ticket => ticket.status === state.ticketFilters.status);
      }

      // Apply priority filter
      if (state.ticketFilters.priority !== 'All') {
        filtered = filtered.filter(ticket => ticket.priority === state.ticketFilters.priority);
      }

      // Apply category filter
      if (state.ticketFilters.category !== 'All') {
        filtered = filtered.filter(ticket => ticket.category === state.ticketFilters.category);
      }

      // Apply assigned to filter
      if (state.ticketFilters.assignedTo !== 'All') {
        filtered = filtered.filter(ticket => 
          ticket.assignedTo?.uid === state.ticketFilters.assignedTo
        );
      }

      // Apply search term filter
      if (state.ticketFilters.searchTerm) {
        const searchTerm = state.ticketFilters.searchTerm.toLowerCase();
        filtered = filtered.filter(ticket => 
          ticket.title.toLowerCase().includes(searchTerm) ||
          ticket.description.toLowerCase().includes(searchTerm) ||
          ticket.userDisplayName.toLowerCase().includes(searchTerm) ||
          ticket.userEmail.toLowerCase().includes(searchTerm)
        );
      }

      return filtered;
    },

    /**
     * Get knowledge base articles
     */
    getKnowledgeBase(state): KnowledgeBaseArticle[] {
      return state.knowledgeBase;
    },

    /**
     * Get published knowledge base articles
     */
    getPublishedArticles(state): KnowledgeBaseArticle[] {
      return state.knowledgeBase.filter(article => article.isPublished);
    },

    /**
     * Get knowledge base articles by category
     */
    getArticlesByCategory: (state) => (category: TicketCategory): KnowledgeBaseArticle[] => {
      return state.knowledgeBase.filter(article => 
        article.category === category && article.isPublished
      );
    },

    /**
     * Get reports
     */
    getReports(state): HelpdeskReport[] {
      return state.reports;
    },

    /**
     * Get comments for active ticket
     */
    getActiveTicketComments(state): TicketComment[] {
      return state.activeTicket 
        ? state.ticketComments.filter(comment => comment.ticketId === state.activeTicket?.id)
        : [];
    },

    /**
     * Get public comments for active ticket (not internal)
     */
    getPublicComments(state): TicketComment[] {
      return state.ticketComments.filter(comment => !comment.isInternal);
    },
  },

  actions: {
    /**
     * Set ticket filters
     */
    setTicketFilters(filters: Partial<HelpdeskState['ticketFilters']>): void {
      this.ticketFilters = {
        ...this.ticketFilters,
        ...filters,
      };
      // Reset pagination when filters change
      this.pagination.currentPage = 1;
    },

    /**
     * Reset ticket filters
     */
    resetFilters(): void {
      this.ticketFilters = {
        status: 'All',
        priority: 'All',
        category: 'All',
        assignedTo: 'All',
        searchTerm: '',
      };
      // Reset pagination
      this.pagination.currentPage = 1;
    },

    /**
     * Set pagination
     */
    setPagination(page: number, itemsPerPage?: number): void {
      if (itemsPerPage) {
        this.pagination.itemsPerPage = itemsPerPage;
      }
      this.pagination.currentPage = page;
    },

    /**
     * Fetch all tickets (admin only)
     */
    async fetchAllTickets(): Promise<void> {
      const errorStore = useErrorStore();
      const userStore = useUserStore();
      this.loading = true;

      try {
        // Check if user is admin
        if (userStore.userRole !== 'admin') {
          throw new Error('Unauthorized access to admin tickets');
        }

        const q = query(
          collection(db, 'helpdesk_tickets'), 
          orderBy('createdAt', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        this.tickets = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        } as SupportTicket));

        // Update pagination
        this.pagination.totalItems = this.tickets.length;
        this.pagination.totalPages = Math.ceil(
          this.pagination.totalItems / this.pagination.itemsPerPage
        );
      } catch (error: any) {
        errorStore.showError('Failed to fetch tickets: ' + error.message);
      } finally {
        this.loading = false;
      }
    },

    /**
     * Fetch tickets for current user
     */
    async fetchUserTickets(): Promise<void> {
      const errorStore = useErrorStore();
      const userStore = useUserStore();
      this.loading = true;

      try {
        const currentUser = userStore.currentUser;
        if (!currentUser) {
          throw new Error('User must be logged in to view tickets');
        }

        const q = query(
          collection(db, 'helpdesk_tickets'),
          where('userId', '==', currentUser.uid),
          orderBy('createdAt', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        this.userTickets = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        } as SupportTicket));
      } catch (error: any) {
        errorStore.showError('Failed to fetch user tickets: ' + error.message);
      } finally {
        this.loading = false;
      }
    },

    /**
     * Fetch tickets assigned to the current user (support staff only)
     */
    async fetchAssignedTickets(): Promise<void> {
      const errorStore = useErrorStore();
      const userStore = useUserStore();
      this.loading = true;

      try {
        const currentUser = userStore.currentUser;
        if (!currentUser) {
          throw new Error('User must be logged in to view assigned tickets');
        }

        // Only admin or support staff can have assigned tickets
        if (currentUser.role !== 'admin') {
          throw new Error('Unauthorized access to assigned tickets');
        }

        const q = query(
          collection(db, 'helpdesk_tickets'),
          where('assignedTo.uid', '==', currentUser.uid),
          orderBy('createdAt', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        this.assignedTickets = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        } as SupportTicket));
      } catch (error: any) {
        errorStore.showError('Failed to fetch assigned tickets: ' + error.message);
      } finally {
        this.loading = false;
      }
    },

    /**
     * Fetch a specific ticket by ID
     */
    async fetchTicketById(ticketId: string): Promise<void> {
      const errorStore = useErrorStore();
      this.loading = true;

      try {
        const ticketDoc = doc(db, 'helpdesk_tickets', ticketId);
        const ticketSnapshot = await getDoc(ticketDoc);

        if (ticketSnapshot.exists()) {
          this.activeTicket = {
            id: ticketSnapshot.id,
            ...ticketSnapshot.data(),
          } as SupportTicket;

          // Fetch comments for this ticket
          await this.fetchTicketComments(ticketId);
        } else {
          throw new Error('Ticket not found');
        }
      } catch (error: any) {
        errorStore.showError('Failed to fetch ticket: ' + error.message);
      } finally {
        this.loading = false;
      }
    },

    /**
     * Fetch comments for a specific ticket
     */
    async fetchTicketComments(ticketId: string): Promise<void> {
      const errorStore = useErrorStore();
      
      try {
        const q = query(
          collection(db, 'helpdesk_tickets', ticketId, 'comments'),
          orderBy('createdAt', 'asc')
        );
        
        const querySnapshot = await getDocs(q);
        this.ticketComments = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        } as TicketComment));
      } catch (error: any) {
        errorStore.showError('Failed to fetch ticket comments: ' + error.message);
      }
    },

    /**
     * Create a new support ticket
     */
    async createTicket(ticketData: Partial<SupportTicket>): Promise<string> {
      const errorStore = useErrorStore();
      const userStore = useUserStore();
      this.loading = true;

      try {
        const currentUser = userStore.currentUser;
        if (!currentUser) {
          throw new Error('User must be logged in to create a ticket');
        }

        // Check if user's subscription allows ticket creation
        if (
          !['premium', 'professional'].includes(currentUser?.subscriptionType || '') &&
          currentUser.role !== 'admin'
        ) {
          throw new Error('Your subscription does not include helpdesk access. Please upgrade to Premium or Professional.');
        }

        const userRef: UserReference = {
          uid: currentUser.uid,
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL,
          role: currentUser.role
        };

        // Create new ticket
        const newTicket: SupportTicket = {
          id: '', // Will be set after creation
          title: ticketData.title || '',
          description: ticketData.description || '',
          status: 'Open',
          priority: ticketData.priority || 'Medium',
          category: ticketData.category || 'Technical Support',
          userId: currentUser.uid,
          userEmail: currentUser.email,
          userDisplayName: currentUser.displayName,
          relatedProject: ticketData.relatedProject,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
          createdBy: userRef,
          updatedBy: userRef
        };

        // Add to Firestore
        const docRef = await addDoc(collection(db, 'helpdesk_tickets'), newTicket);
        
        // Update with ID
        const ticketWithId: SupportTicket = {
          ...newTicket,
          id: docRef.id
        };

        // Update document with its own ID
        await updateDoc(docRef, { id: docRef.id });

        // Add to local state
        this.userTickets.unshift(ticketWithId);

        return docRef.id;
      } catch (error: any) {
        errorStore.showError('Failed to create ticket: ' + error.message);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Update an existing ticket
     */
    async updateTicket(ticketId: string, updateData: SupportTicketUpdate): Promise<void> {
      const errorStore = useErrorStore();
      const userStore = useUserStore();
      this.loading = true;

      try {
        const currentUser = userStore.currentUser;
        if (!currentUser) {
          throw new Error('User must be logged in to update a ticket');
        }

        // Get current user reference
        const userRef: UserReference = {
          uid: currentUser.uid,
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL,
          role: currentUser.role
        };

        // Prepare update data
        const updates: SupportTicketUpdate = {
          ...updateData,
          updatedAt: Timestamp.now(),
          updatedBy: userRef
        };

        // Set resolved timestamp if status is changed to Resolved
        if (updateData.status === 'Resolved' && this.activeTicket?.status !== 'Resolved') {
          updates.resolvedAt = Timestamp.now();
        }

        // Set closed timestamp if status is changed to Closed
        if (updateData.status === 'Closed' && this.activeTicket?.status !== 'Closed') {
          updates.closedAt = Timestamp.now();
        }

        // Update in Firestore
        const ticketRef = doc(db, 'helpdesk_tickets', ticketId);
        await updateDoc(ticketRef, updates);

        // Update in local state if active ticket
        if (this.activeTicket && this.activeTicket.id === ticketId) {
          this.activeTicket = {
            ...this.activeTicket,
            ...updates
          } as SupportTicket;
        }

        // Update in userTickets array
        const userTicketIndex = this.userTickets.findIndex(t => t.id === ticketId);
        if (userTicketIndex !== -1) {
          this.userTickets[userTicketIndex] = {
            ...this.userTickets[userTicketIndex],
            ...updates
          } as SupportTicket;
        }

        // Update in assignedTickets array
        const assignedTicketIndex = this.assignedTickets.findIndex(t => t.id === ticketId);
        if (assignedTicketIndex !== -1) {
          this.assignedTickets[assignedTicketIndex] = {
            ...this.assignedTickets[assignedTicketIndex],
            ...updates
          } as SupportTicket;
        }

        // Update in all tickets array (if admin)
        if (currentUser.role === 'admin') {
          const ticketIndex = this.tickets.findIndex(t => t.id === ticketId);
          if (ticketIndex !== -1) {
            this.tickets[ticketIndex] = {
              ...this.tickets[ticketIndex],
              ...updates
            } as SupportTicket;
          }
        }
      } catch (error: any) {
        errorStore.showError('Failed to update ticket: ' + error.message);
      } finally {
        this.loading = false;
      }
    },

    /**
     * Add a comment to a ticket
     */
    async addTicketComment(ticketId: string, content: string, isInternal: boolean = false): Promise<void> {
      const errorStore = useErrorStore();
      const userStore = useUserStore();
      
      try {
        const currentUser = userStore.currentUser;
        if (!currentUser) {
          throw new Error('User must be logged in to comment on a ticket');
        }

        // Only admins can add internal comments
        if (isInternal && currentUser.role !== 'admin') {
          throw new Error('Only support staff can add internal comments');
        }

        const userRef: UserReference = {
          uid: currentUser.uid,
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL,
          role: currentUser.role
        };

        // Create new comment
        const newComment: Omit<TicketComment, 'id'> = {
          ticketId,
          content,
          isInternal,
          createdAt: Timestamp.now(),
          createdBy: userRef
        };

        // Add to Firestore
        const commentsRef = collection(db, 'helpdesk_tickets', ticketId, 'comments');
        const docRef = await addDoc(commentsRef, newComment);
        
        // Update with ID
        const commentWithId: TicketComment = {
          ...newComment,
          id: docRef.id
        };

        // Add to local state
        this.ticketComments.push(commentWithId);

        // Update the ticket's updatedAt field
        await this.updateTicket(ticketId, { 
          updatedAt: Timestamp.now(),
          updatedBy: userRef
        });
      } catch (error: any) {
        errorStore.showError('Failed to add comment: ' + error.message);
      }
    },

    /**
     * Fetch knowledge base articles
     */
    async fetchKnowledgeBase(): Promise<void> {
      const errorStore = useErrorStore();
      this.loading = true;
      
      try {
        const q = query(
          collection(db, 'helpdesk_knowledge_base'),
          orderBy('createdAt', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        this.knowledgeBase = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        } as KnowledgeBaseArticle));
      } catch (error: any) {
        errorStore.showError('Failed to fetch knowledge base: ' + error.message);
      } finally {
        this.loading = false;
      }
    },

    /**
     * Create knowledge base article (admin only)
     */
    async createKnowledgeBaseArticle(articleData: Partial<KnowledgeBaseArticle>): Promise<string> {
      const errorStore = useErrorStore();
      const userStore = useUserStore();
      this.loading = true;
      
      try {
        const currentUser = userStore.currentUser;
        if (!currentUser || currentUser.role !== 'admin') {
          throw new Error('Only administrators can create knowledge base articles');
        }

        const userRef: UserReference = {
          uid: currentUser.uid,
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL,
          role: currentUser.role
        };

        // Create new article
        const newArticle: KnowledgeBaseArticle = {
          id: '', // Will be set after creation
          title: articleData.title || '',
          content: articleData.content || '',
          category: articleData.category || 'Technical Support',
          tags: articleData.tags || [],
          isPublished: articleData.isPublished ?? false,
          viewCount: 0,
          helpfulCount: 0,
          createdAt: Timestamp.now(),
          createdBy: userRef
        };

        // Add to Firestore
        const docRef = await addDoc(collection(db, 'helpdesk_knowledge_base'), newArticle);
        
        // Update with ID
        const articleWithId: KnowledgeBaseArticle = {
          ...newArticle,
          id: docRef.id
        };

        // Update the document with its own ID
        await updateDoc(docRef, { id: docRef.id });

        // Add to local state
        this.knowledgeBase.unshift(articleWithId);

        return docRef.id;
      } catch (error: any) {
        errorStore.showError('Failed to create knowledge base article: ' + error.message);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Update knowledge base article (admin only)
     */
    async updateKnowledgeBaseArticle(articleId: string, updateData: Partial<KnowledgeBaseArticle>): Promise<void> {
      const errorStore = useErrorStore();
      const userStore = useUserStore();
      this.loading = true;
      
      try {
        const currentUser = userStore.currentUser;
        if (!currentUser || currentUser.role !== 'admin') {
          throw new Error('Only administrators can update knowledge base articles');
        }

        const userRef: UserReference = {
          uid: currentUser.uid,
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL,
          role: currentUser.role
        };

        // Prepare update data
        const updates = {
          ...updateData,
          updatedAt: Timestamp.now(),
          updatedBy: userRef
        };

        // Update in Firestore
        const articleRef = doc(db, 'helpdesk_knowledge_base', articleId);
        await updateDoc(articleRef, updates);

        // Update in local state
        const articleIndex = this.knowledgeBase.findIndex(a => a.id === articleId);
        if (articleIndex !== -1) {
          this.knowledgeBase[articleIndex] = {
            ...this.knowledgeBase[articleIndex],
            ...updates
          } as KnowledgeBaseArticle;
        }
      } catch (error: any) {
        errorStore.showError('Failed to update knowledge base article: ' + error.message);
      } finally {
        this.loading = false;
      }
    },

    /**
     * Mark article as helpful
     */
    async markArticleHelpful(articleId: string): Promise<void> {
      const errorStore = useErrorStore();
      
      try {
        // Update in Firestore
        const articleRef = doc(db, 'helpdesk_knowledge_base', articleId);
        await updateDoc(articleRef, {
          helpfulCount: increment(1)
        });

        // Update in local state
        const articleIndex = this.knowledgeBase.findIndex(a => a.id === articleId);
        if (articleIndex !== -1) {
          this.knowledgeBase[articleIndex].helpfulCount += 1;
        }
      } catch (error: any) {
        errorStore.showError('Failed to mark article as helpful: ' + error.message);
      }
    },

    /**
     * Track article view
     */
    async trackArticleView(articleId: string): Promise<void> {
      const errorStore = useErrorStore();
      
      try {
        // Update in Firestore
        const articleRef = doc(db, 'helpdesk_knowledge_base', articleId);
        await updateDoc(articleRef, {
          viewCount: increment(1)
        });

        // Update in local state
        const articleIndex = this.knowledgeBase.findIndex(a => a.id === articleId);
        if (articleIndex !== -1) {
          this.knowledgeBase[articleIndex].viewCount += 1;
        }
      } catch (error: any) {
        errorStore.showError('Failed to track article view: ' + error.message);
      }
    },

    /**
     * Generate helpdesk report (admin only)
     */
    async generateReport(reportType: 'Daily' | 'Weekly' | 'Monthly' | 'Custom', 
                         startDate: Date, endDate: Date): Promise<string> {
      const errorStore = useErrorStore();
      const userStore = useUserStore();
      this.loading = true;
      
      try {
        const currentUser = userStore.currentUser;
        if (!currentUser || currentUser.role !== 'admin') {
          throw new Error('Only administrators can generate reports');
        }

        const userRef: UserReference = {
          uid: currentUser.uid,
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL,
          role: currentUser.role
        };

        // Convert dates to timestamps
        const startTimestamp = Timestamp.fromDate(startDate);
        const endTimestamp = Timestamp.fromDate(endDate);

        // Query tickets within date range
        const q = query(
          collection(db, 'helpdesk_tickets'),
          where('createdAt', '>=', startTimestamp),
          where('createdAt', '<=', endTimestamp)
        );
        
        const querySnapshot = await getDocs(q);
        const tickets = querySnapshot.docs.map(doc => doc.data() as SupportTicket);

        // Calculate metrics
        const totalTickets = tickets.length;
        const newTickets = tickets.filter(t => t.status === 'Open').length;
        const resolvedTickets = tickets.filter(t => t.resolvedAt).length;

        // Calculate average resolution time
        let totalResolutionTime = 0;
        let ticketsWithResolution = 0;

        tickets.forEach(ticket => {
          if (ticket.resolvedAt && ticket.createdAt) {
            // Calculate resolution time in hours
            const resolutionTime = (ticket.resolvedAt.toMillis() - ticket.createdAt.toMillis()) / (1000 * 60 * 60);
            totalResolutionTime += resolutionTime;
            ticketsWithResolution++;
          }
        });

        const avgResolutionTime = ticketsWithResolution ? totalResolutionTime / ticketsWithResolution : 0;

        // Count tickets by category
        const ticketsByCategory: Record<TicketCategory, number> = {
          'Account': 0,
          'Billing': 0,
          'Technical Support': 0,
          'Feature Request': 0,
          'Bug Report': 0,
          'Project': 0,
          'Parts': 0,
          'Inventory': 0,
          'Other': 0
        };

        // Count tickets by priority
        const ticketsByPriority: Record<TicketPriority, number> = {
          'Low': 0,
          'Medium': 0,
          'High': 0,
          'Critical': 0
        };

        // Count tickets per agent
        const ticketsPerAgent: Record<string, number> = {};

        tickets.forEach(ticket => {
          // Count by category
          ticketsByCategory[ticket.category] += 1;
          
          // Count by priority
          ticketsByPriority[ticket.priority] += 1;
          
          // Count by agent
          if (ticket.assignedTo?.uid) {
            if (!ticketsPerAgent[ticket.assignedTo.uid]) {
              ticketsPerAgent[ticket.assignedTo.uid] = 0;
            }
            ticketsPerAgent[ticket.assignedTo.uid] += 1;
          }
        });

        // Create report object
        const newReport: HelpdeskReport = {
          id: '',
          reportType,
          startDate: startTimestamp,
          endDate: endTimestamp,
          metrics: {
            totalTickets,
            newTickets,
            resolvedTickets,
            avgResolutionTime,
            ticketsByCategory,
            ticketsByPriority,
            ticketsPerAgent
          },
          generatedAt: Timestamp.now(),
          generatedBy: userRef
        };

        // Add to Firestore
        const docRef = await addDoc(collection(db, 'helpdesk_reports'), newReport);
        
        // Update with ID
        const reportWithId: HelpdeskReport = {
          ...newReport,
          id: docRef.id
        };

        // Update document with its own ID
        await updateDoc(docRef, { id: docRef.id });

        // Add to local state
        this.reports.unshift(reportWithId);

        return docRef.id;
      } catch (error: any) {
        errorStore.showError('Failed to generate report: ' + error.message);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Fetch reports (admin only)
     */
    async fetchReports(): Promise<void> {
      const errorStore = useErrorStore();
      const userStore = useUserStore();
      this.loading = true;
      
      try {
        const currentUser = userStore.currentUser;
        if (!currentUser || currentUser.role !== 'admin') {
          throw new Error('Only administrators can access reports');
        }

        const q = query(
          collection(db, 'helpdesk_reports'),
          orderBy('generatedAt', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        this.reports = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        } as HelpdeskReport));
      } catch (error: any) {
        errorStore.showError('Failed to fetch reports: ' + error.message);
      } finally {
        this.loading = false;
      }
    },

    /**
     * Check if user can access helpdesk 
     */
    canAccessHelpdesk(): boolean {
      const userStore = useUserStore();
      const currentUser = userStore.currentUser;
      
      // Admins always have access
      if (currentUser?.role === 'admin') {
        return true;
      }
      
      // Check subscription for premium or professional
      const premiumSubscriptions = ['premium', 'professional'];
      return !!currentUser?.subscriptionType && 
             premiumSubscriptions.includes(currentUser.subscriptionType) &&
             currentUser.subscriptionStatus === 'active';
    },

    /**
     * Clear active ticket
     */
    clearActiveTicket(): void {
      this.activeTicket = null;
      this.ticketComments = [];
    }
  }
});