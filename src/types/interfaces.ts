/**
 * Core Interfaces for the Motorcycle Project Management Application
 * 
 * This file contains TypeScript interfaces for the main data models used throughout
 * the application, ensuring type safety and providing documentation.
 */

import { Timestamp } from 'firebase/firestore';

/**
 * User interface representing application users
 */
export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'admin' | 'customer' | 'mechanic' | 'sales' | 'guest';
  userStatus: 'active' | 'inactive' | 'suspended';
  isAnonymous?: boolean;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  lastLoginAt?: Timestamp;
  // Subscription fields
  subscriptionType?: 'free' | 'standard' | 'premium' | 'professional';
  subscriptionStatus?: 'active' | 'inactive' | 'cancelled' | 'past_due';
  subscriptionBillingCycle?: 'monthly' | 'yearly';
  subscriptionEndDate?: Timestamp;
  subscriptionId?: string;
  points?: number;
  badges?: string[];
}

/**
 * Project interface representing motorcycle projects
 */
export interface Project {
  projectId: string;
  projectName: string;
  startDate: string;
  endDate?: string;
  status: 'In Progress' | 'Completed' | 'On Hold';
  owner: string;
  vin?: string;
  make?: string;
  model?: string;
  year?: string;
  manufacturer?: string;
  bodyClass?: string;
  displacementCC?: string;
  engineConfiguration?: string;
  engineCylinders?: string;
  engineHP?: string;
  fuelTypePrimary?: string;
  gvwr?: string;
  plantCountry?: string;
  series?: string;
  valveTrainDesign?: string;
  note?: string;
  imageUrls?: Array<ImageData>;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  createdBy?: UserReference;
  updatedBy?: UserReference;
}

/**
 * Image data interface for project images
 */
export interface ImageData {
  url: string;
  fileName: string;
  uploadDate: string;
}

/**
 * Simplified user reference for created/updated by fields
 */
export interface UserReference {
  uid: string;
  displayName?: string;
  photoURL?: string;
  role?: string;
  userStatus?: string;
}

/**
 * Task interface representing project tasks
 */
export interface Task {
  id?: string;
  projectId: string;
  projectName?: string;
  taskTitle: string;
  nbrHrs: number;
  status: 'Pending' | 'In Progress' | 'Completed';
  priority: 'High' | 'Medium' | 'Low';
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  createdBy?: UserReference;
  updatedBy?: UserReference;
}

/**
 * Part interface representing motorcycle parts
 */
export interface Part {
  id?: string;
  projectId: string;
  partName: string;
  partStatus: 'Ordered' | 'Shipped' | 'BackOrder' | 'Installed';
  partPriority: 'High' | 'Medium' | 'Low';
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  createdBy?: UserReference;
  updatedBy?: UserReference;
}

/**
 * Cost interface representing project costs
 */
export interface Cost {
  id?: string;
  projectId: string;
  description: string;
  amount: number;
  date: string;
  category: 'Parts' | 'Labor' | 'Tools' | 'Other';
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  createdBy?: UserReference;
  updatedBy?: UserReference;
}

/**
 * Contribution interface for community contributions
 */
export interface Contribution {
  id?: string;
  taskId: string;
  userId: string;
  feedback?: string;
  confirmation: boolean;
  pointsEarned: number;
  timestamp: Timestamp;
}

/**
 * Payment Method interface for user payment methods
 */
export interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'bank_account';
  name: string;
  info: string;
  isDefault: boolean;
  lastFour?: string;
  expiryDate?: string;
  providerToken?: string;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  deleted?: boolean;
  deletedAt?: Timestamp;
}

/**
 * Payment Transaction interface for subscription payments
 */
export interface PaymentTransaction {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: string;
  subscriptionPlan: string;
  billingCycle: 'monthly' | 'yearly';
  createdAt: Timestamp;
  updatedAt: Timestamp;
  receiptUrl?: string;
  invoiceId?: string;
  nextBillingDate?: Timestamp;
}

/**
 * User subscription update interface
 */
export interface UserUpdate {
  displayName?: string;
  photoURL?: string;
  role?: string;
  userStatus?: string;
  subscriptionType?: string;
  subscriptionStatus?: string;
  subscriptionBillingCycle?: 'monthly' | 'yearly';
  subscriptionEndDate?: Timestamp;
  subscriptionId?: string;
  updatedAt?: Timestamp;
  updatedBy?: UserReference;
  points?: number;
  badges?: string[];
}

/**
 * Subscription features interface
 */
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
  canAccessAiHelpdesk: boolean;
  aiHelpdeskMessagesPerMonth: number;
  canIntegrateWithShopSystems?: boolean;
  canUseWhiteLabel?: boolean;
  canAccessPrioritySuppport?: boolean;
  canUseApiAccess?: boolean;
  canCreateCustomForms?: boolean;
}