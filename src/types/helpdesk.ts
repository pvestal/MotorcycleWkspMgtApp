/**
 * Helpdesk related types for the Motorcycle Workshop Management Application
 * 
 * This file contains TypeScript interfaces for the helpdesk feature,
 * providing support ticket management for premium and professional users
 */

import { Timestamp } from 'firebase/firestore';
import { UserReference } from './interfaces';

/**
 * Ticket status enum
 */
export type TicketStatus = 'Open' | 'In Progress' | 'Resolved' | 'Closed' | 'Waiting for Customer';

/**
 * Ticket priority enum
 */
export type TicketPriority = 'Low' | 'Medium' | 'High' | 'Critical';

/**
 * Ticket category enum
 */
export type TicketCategory = 
  'Account' | 
  'Billing' | 
  'Technical Support' | 
  'Feature Request' | 
  'Bug Report' | 
  'Project' | 
  'Parts' | 
  'Inventory' | 
  'Other';

/**
 * Support ticket interface
 */
export interface SupportTicket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: TicketCategory;
  userId: string;
  userEmail: string;
  userDisplayName: string;
  assignedTo?: UserReference;
  attachments?: TicketAttachment[];
  relatedProject?: {
    projectId: string;
    projectName: string;
  };
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  resolvedAt?: Timestamp;
  closedAt?: Timestamp;
  createdBy: UserReference;
  updatedBy?: UserReference;
}

/**
 * Ticket update interface
 */
export interface SupportTicketUpdate {
  title?: string;
  description?: string;
  status?: TicketStatus;
  priority?: TicketPriority;
  category?: TicketCategory;
  assignedTo?: UserReference;
  attachments?: TicketAttachment[];
  relatedProject?: {
    projectId: string;
    projectName: string;
  };
  updatedAt?: Timestamp;
  resolvedAt?: Timestamp;
  closedAt?: Timestamp;
  updatedBy?: UserReference;
}

/**
 * Ticket comment interface
 */
export interface TicketComment {
  id: string;
  ticketId: string;
  content: string;
  isInternal: boolean; // If true, only visible to support staff
  attachments?: TicketAttachment[];
  createdAt: Timestamp;
  createdBy: UserReference;
  updatedAt?: Timestamp;
  updatedBy?: UserReference;
}

/**
 * Ticket attachment interface
 */
export interface TicketAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedAt: Timestamp;
  uploadedBy: UserReference;
}

/**
 * Helpdesk agent interface
 * Extends the base user with helpdesk-specific properties
 */
export interface HelpdeskAgent {
  userId: string;
  displayName: string;
  email: string;
  photoURL?: string;
  role: 'admin' | 'support';
  isActive: boolean;
  specialties?: TicketCategory[];
  assignedTickets?: string[];
  availabilityStatus: 'Available' | 'Busy' | 'Away' | 'Offline';
  lastActiveAt?: Timestamp;
}

/**
 * Knowledge base article interface
 */
export interface KnowledgeBaseArticle {
  id: string;
  title: string;
  content: string;
  category: TicketCategory;
  tags: string[];
  isPublished: boolean;
  viewCount: number;
  helpfulCount: number;
  createdAt: Timestamp;
  createdBy: UserReference;
  updatedAt?: Timestamp;
  updatedBy?: UserReference;
}

/**
 * Admin reports interface
 */
export interface HelpdeskReport {
  id: string;
  reportType: 'Daily' | 'Weekly' | 'Monthly' | 'Custom';
  startDate: Timestamp;
  endDate: Timestamp;
  metrics: {
    totalTickets: number;
    newTickets: number;
    resolvedTickets: number;
    avgResolutionTime: number; // in hours
    ticketsByCategory: Record<TicketCategory, number>;
    ticketsByPriority: Record<TicketPriority, number>;
    ticketsPerAgent: Record<string, number>; // userId -> ticket count
  };
  generatedAt: Timestamp;
  generatedBy: UserReference;
}

/**
 * Extended subscription features for helpdesk
 */
export interface HelpdeskSubscriptionFeatures {
  canAccessHelpdesk: boolean;
  canSubmitTickets: boolean;
  ticketsPerMonth: number;
  prioritySupport: boolean;
  responseTimeGuarantee: boolean;
  guaranteedResponseTime?: number; // in hours
  knowledgeBaseAccess: boolean;
  canScheduleCall: boolean;
  canRequestScreenshare: boolean;
  canAccessPremiumKnowledgeBase: boolean;
}