/**
 * Cost Store
 * 
 * Manages the state and operations for cost records in the application.
 * Handles fetching, adding, updating, and deleting costs from Firestore.
 */

import { defineStore } from 'pinia';
import { 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  writeBatch,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/fbConfig';
import { useErrorStore } from './errorStore';
import { useUserStore } from './userStore';
import { Cost, CostUpdate, UserReference } from '../types';

interface CostState {
  costs: Cost[];
  loading: boolean;
}

export const useCostStore = defineStore('costStore', {
  state: (): CostState => ({
    costs: [],
    loading: false,
  }),

  getters: {
    /**
     * Get all costs related to a specific project
     * @param projectId - The ID of the project
     * @returns Array of costs for the project
     */
    getCostsByProjectId: (state) => (projectId: string): Cost[] => {
      return state.costs.filter(cost => cost.projectId === projectId);
    },

    /**
     * Get total costs for a specific project
     * @param projectId - The ID of the project
     * @returns Total cost amount
     */
    totalCostsByProjectId: (state) => (projectId: string): number => {
      const projectCosts = state.costs.filter(cost => cost.projectId === projectId);
      return projectCosts.reduce((sum, cost) => sum + (parseFloat(cost.amount.toString()) || 0), 0);
    },

    /**
     * Get costs by category for a specific project
     * @param projectId - The ID of the project
     * @param category - The category to filter by
     * @returns Array of costs by category
     */
    getCostsByCategory: (state) => (projectId: string, category: string): Cost[] => {
      return state.costs.filter(cost => cost.projectId === projectId && cost.category === category);
    },

    /**
     * Get all global costs (not tied to a project)
     * @returns Array of global costs
     */
    getGlobalCosts: (state): Cost[] => {
      return state.costs.filter(cost => !cost.projectId);
    },

    /**
     * Get total costs by category for a specific project
     * @param projectId - The ID of the project
     * @param category - The category to filter by
     * @returns Total cost amount for the category
     */
    totalCostsByCategory: (state) => (projectId: string, category: string): number => {
      const categorizedCosts = state.costs.filter(cost => 
        cost.projectId === projectId && cost.category === category
      );
      return categorizedCosts.reduce((sum, cost) => sum + (parseFloat(cost.amount.toString()) || 0), 0);
    },
  },

  actions: {
    /**
     * Fetch costs by projectId from Firebase and update the state
     * @param projectId - The ID of the project to fetch costs for
     */
    async fetchCostsByProject(projectId: string): Promise<void> {
      const errorStore = useErrorStore();
      this.loading = true;
      
      try {
        const q = query(collection(db, 'costs'), where('projectId', '==', projectId));
        const querySnapshot = await getDocs(q);
        const costs = querySnapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data() 
        } as Cost));

        // Update the state: replace existing costs for this projectId
        this.costs = this.costs.filter(cost => cost.projectId !== projectId);
        this.costs.push(...costs);
      } catch (error: any) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        errorStore.showError('Failed to fetch costs: ' + message);
      } finally {
        this.loading = false;
      }
    },

    /**
     * Fetch all costs, optionally filtered by projectId
     * @param projectId - Optional project ID to filter costs by
     */
    async fetchCosts(projectId?: string): Promise<void> {
      const errorStore = useErrorStore();
      this.loading = true;
      
      try {
        let q;
        if (projectId) {
          q = query(collection(db, 'costs'), where('projectId', '==', projectId));
        } else {
          q = collection(db, 'costs');
        }

        const querySnapshot = await getDocs(q);
        this.costs = querySnapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data() 
        } as Cost));
      } catch (error: any) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        errorStore.showError('Failed to fetch costs: ' + message);
      } finally {
        this.loading = false;
      }
    },

    /**
     * Add a new cost record
     * @param cost - The cost object to add
     */
    async addCost(cost: Partial<Cost>): Promise<void> {
      const errorStore = useErrorStore();
      const userStore = useUserStore();
      
      try {
        if (!cost.amount || isNaN(Number(cost.amount))) {
          throw new Error('Invalid cost amount');
        }
        
        // Get current user for reference
        const currentUser = userStore.currentUser;
        if (!currentUser) {
          throw new Error('User must be logged in to add costs');
        }
        
        const userRef: UserReference = {
          uid: currentUser.uid,
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL,
          role: currentUser.role
        };
        
        // Prepare cost object with timestamps
        const newCost: Partial<Cost> = {
          ...cost,
          amount: Number(cost.amount),
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
          createdBy: userRef,
          updatedBy: userRef
        };
        
        // Add to Firestore
        const docRef = await addDoc(collection(db, 'costs'), newCost);
        
        // Add to local state
        this.costs.push({ id: docRef.id, ...newCost } as Cost);
      } catch (error: any) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        errorStore.showError('Failed to add cost: ' + message);
      }
    },

    /**
     * Update an existing cost
     * @param id - The ID of the cost to update
     * @param updatedCost - The updated cost data
     */
    async updateCost(id: string, updatedCost: CostUpdate): Promise<void> {
      const errorStore = useErrorStore();
      const userStore = useUserStore();
      
      try {
        if (updatedCost.amount !== undefined && isNaN(Number(updatedCost.amount))) {
          throw new Error('Invalid cost amount');
        }
        
        // Convert amount to number if present
        let updateData: CostUpdate = { ...updatedCost };
        if (updatedCost.amount !== undefined) {
          updateData.amount = Number(updatedCost.amount);
        }
        
        // Get current user for reference
        const currentUser = userStore.currentUser;
        if (!currentUser) {
          throw new Error('User must be logged in to update costs');
        }
        
        const userRef: UserReference = {
          uid: currentUser.uid,
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL,
          role: currentUser.role
        };
        
        // Prepare update data
        updateData = {
          ...updateData,
          updatedAt: Timestamp.now(),
          updatedBy: userRef
        };
        
        // Update in Firestore
        const costRef = doc(db, 'costs', id);
        await updateDoc(costRef, updateData);
        
        // Update local state
        const index = this.costs.findIndex(cost => cost.id === id);
        if (index !== -1) {
          this.costs[index] = { ...this.costs[index], ...updateData } as Cost;
        }
      } catch (error: any) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        errorStore.showError('Failed to update cost: ' + message);
      }
    },

    /**
     * Delete a cost record
     * @param id - The ID of the cost to delete
     */
    async deleteCost(id: string): Promise<void> {
      const errorStore = useErrorStore();
      
      try {
        // Delete from Firestore
        await deleteDoc(doc(db, 'costs', id));
        
        // Remove from local state
        this.costs = this.costs.filter(cost => cost.id !== id);
      } catch (error: any) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        errorStore.showError('Failed to delete cost: ' + message);
      }
    },

    /**
     * Add multiple costs in a batch operation
     * @param costs - Array of cost objects to add
     */
    async batchAddCosts(costs: Partial<Cost>[]): Promise<void> {
      const errorStore = useErrorStore();
      const userStore = useUserStore();
      const batch = writeBatch(db);
      
      try {
        // Get current user for reference
        const currentUser = userStore.currentUser;
        if (!currentUser) {
          throw new Error('User must be logged in to add costs');
        }
        
        const userRef: UserReference = {
          uid: currentUser.uid,
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL,
          role: currentUser.role
        };
        
        // Process each cost in the batch
        const processedCosts: Cost[] = [];
        
        costs.forEach(cost => {
          if (!cost.amount || isNaN(Number(cost.amount))) {
            throw new Error('Invalid cost amount in batch');
          }
          
          // Prepare cost with timestamps and references
          const newCost: Partial<Cost> = {
            ...cost,
            amount: Number(cost.amount),
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
            createdBy: userRef,
            updatedBy: userRef
          };
          
          // Create a new document reference
          const docRef = doc(collection(db, 'costs'));
          
          // Add to batch
          batch.set(docRef, newCost);
          
          // Store for local state update
          processedCosts.push({ id: docRef.id, ...newCost } as Cost);
        });
        
        // Commit the batch
        await batch.commit();
        
        // Update local state
        this.costs.push(...processedCosts);
      } catch (error: any) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        errorStore.showError('Failed to batch add costs: ' + message);
      }
    },
  },
});