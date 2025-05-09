/**
 * Core application types
 */

import { Timestamp } from 'firebase/firestore';

// User-related types
export interface User {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  role: 'admin' | 'customer' | 'guest';
  userStatus: 'active' | 'inactive';
  isAnonymous?: boolean;
  lastLoginAt: Timestamp;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  points?: number;
  badges?: string[];
  subscriptionType?: 'free' | 'standard' | 'premium' | 'professional';
  subscriptionStatus?: 'active' | 'inactive' | 'cancelled';
  subscriptionEndDate?: Timestamp;
  subscriptionBillingCycle?: 'monthly' | 'yearly';
}

export interface UserReference {
  uid: string;
  displayName?: string;
  photoURL?: string;
  role?: string;
  userStatus?: string;
}

export interface UserUpdate {
  displayName?: string;
  email?: string;
  photoURL?: string;
  role?: 'admin' | 'customer' | 'guest' | 'mechanic' | 'sales';
  userStatus?: 'active' | 'inactive' | 'suspended';
  points?: number;
  badges?: string[];
  subscriptionType?: 'free' | 'standard' | 'premium' | 'professional';
  subscriptionStatus?: 'active' | 'inactive' | 'cancelled';
  subscriptionEndDate?: Timestamp;
  subscriptionBillingCycle?: 'monthly' | 'yearly';
  updatedAt?: Timestamp;
  updatedBy?: UserReference;
}

// Project-related types
export interface Project {
  id: string;
  projectId?: string; // Added for backward compatibility
  projectName: string;
  description?: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'On Hold';
  owner: string;
  startDate: Timestamp;
  endDate?: Timestamp;
  vin?: string;
  make?: string;
  model?: string;
  year?: string;
  manufacturer?: string;
  imageUrls?: {
    url: string;
    fileName: string;
    uploadDate?: string;
  }[];
  note?: string;
  createdAt: Timestamp;
  createdBy: string | UserReference;
  updatedAt?: Timestamp;
  updatedBy?: string | UserReference;
}

export interface ProjectUpdate {
  projectName?: string;
  description?: string;
  status?: 'Pending' | 'In Progress' | 'Completed' | 'On Hold';
  owner?: string;
  startDate?: Timestamp;
  endDate?: Timestamp;
  vin?: string;
  make?: string;
  model?: string;
  year?: string;
  imageUrls?: {
    url: string;
    fileName: string;
  }[];
  updatedAt?: Timestamp;
  updatedBy?: string;
}

// Task-related types
export interface Task {
  id: string;
  taskTitle: string;
  taskDesc?: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  priority: 'Low' | 'Medium' | 'High';
  assignedTo?: string;
  projectId: string;
  projectName: string;
  nbrHrs?: number;
  startDate?: Timestamp;
  dueDate?: Timestamp;
  completedDate?: Timestamp;
  createdAt: Timestamp;
  createdBy: string;
  updatedAt?: Timestamp;
  updatedBy?: string;
}

export interface TaskUpdate {
  taskTitle?: string;
  taskDesc?: string;
  status?: 'Pending' | 'In Progress' | 'Completed';
  priority?: 'Low' | 'Medium' | 'High';
  assignedTo?: string;
  projectId?: string;
  projectName?: string;
  nbrHrs?: number;
  startDate?: Timestamp;
  dueDate?: Timestamp;
  completedDate?: Timestamp;
  updatedAt?: Timestamp;
  updatedBy?: string;
}

// Part-related types
export interface Part {
  id: string;
  partName: string;
  partNumber?: string;
  partDesc?: string;
  partStatus: 'Ordered' | 'Shipped' | 'Delivered' | 'BackOrder' | 'Installed';
  partPriority: 'Low' | 'Medium' | 'High';
  projectId: string;
  price?: number;
  quantity?: number;
  provider?: string;
  location?: string;
  createdAt: Timestamp;
  createdBy: string;
  updatedAt?: Timestamp;
  updatedBy?: string;
}

export interface PartUpdate {
  partName?: string;
  partNumber?: string;
  partDesc?: string;
  partStatus?: 'Ordered' | 'Shipped' | 'Delivered' | 'BackOrder' | 'Installed';
  partPriority?: 'Low' | 'Medium' | 'High';
  projectId?: string;
  price?: number;
  quantity?: number;
  provider?: string;
  location?: string;
  updatedAt?: Timestamp;
  updatedBy?: string;
}

// Cost-related types
export interface Cost {
  id: string;
  amount: number;
  category: 'Parts' | 'Labor' | 'Tools' | 'Other';
  description: string;
  projectId: string;
  date: Timestamp;
  receipt?: {
    url: string;
    fileName: string;
  };
  createdAt: Timestamp;
  createdBy: string;
  updatedAt?: Timestamp;
  updatedBy?: string;
}

export interface CostUpdate {
  amount?: number;
  category?: 'Parts' | 'Labor' | 'Tools' | 'Other';
  description?: string;
  projectId?: string;
  date?: Timestamp;
  receipt?: {
    url: string;
    fileName: string;
  };
  updatedAt?: Timestamp;
  updatedBy?: string;
}

// Inventory-related types
export interface InventoryItem {
  id: string;
  partNumber: string;
  description: string;
  manufacturer?: string;
  category?: string;
  quantity: number;
  reorderThreshold?: number;
  price?: number;
  location?: string;
  status?: 'in_stock' | 'low_stock' | 'out_of_stock';
  source: 'manual' | 'api' | 'webhook';
  createdAt: string | Timestamp;
  updatedAt?: string | Timestamp;
  updatedBy?: string;
}

export interface InventoryUpdate {
  description?: string;
  manufacturer?: string;
  category?: string;
  quantity?: number;
  reorderThreshold?: number;
  price?: number;
  location?: string;
  status?: 'in_stock' | 'low_stock' | 'out_of_stock';
  updatedAt?: string | Timestamp;
  updatedBy?: string;
}

// Contribution/Badge-related types
export interface Contribution {
  id: string;
  contributorId: string;
  contributionType: 'project_create' | 'project_validate' | 'task_create' | 'task_validate' | 'part_create' | 'part_validate' | 'cost_create' | 'cost_validate';
  targetId: string;
  pointsEarned: number;
  timestamp: Timestamp;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'projects' | 'tasks' | 'parts' | 'validation' | 'general';
  requirement: number;
}

// Subscription-related types
export interface SubscriptionPlan {
  id: 'free' | 'standard' | 'premium' | 'professional';
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  yearlyDiscount: string;
  trialDays: number;
  features: Record<string, boolean | number>;
}

export interface SubscriptionFeatures {
  projectLimit: number;
  tasksPerProject: number;
  partsPerProject: number;
  costsPerProject: number;
  imageUploadLimit: number;
  canExportData: boolean;
  canAccessInventory: boolean;
  canUseAdvancedReporting: boolean;
  canCreateTemplates: boolean;
  canCreateTeam: boolean;
  canInviteMembers: boolean;
  canUseAdvancedAnalytics: boolean;
  canScheduleReminders: boolean;
  canReceiveAlerts: boolean;
  canIntegrateWithShopSystems?: boolean;
  canUseWhiteLabel?: boolean;
  canAccessPrioritySuppport?: boolean;
  canUseApiAccess?: boolean;
  canCreateCustomForms?: boolean;
  
  // Helpdesk features
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

// API and Integration types
export interface ApiKey {
  key: string;
  createdAt: Timestamp;
  lastUsed: Timestamp | null;
}

export interface InventoryProvider {
  id: string;
  name: string;
  apiEndpoint?: string;
  apiKey?: string;
  isActive?: boolean;
}

// Store types
export interface StoreState {
  isLoading: boolean;
  error: string | null;
}