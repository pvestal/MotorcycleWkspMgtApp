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

export const useCostStore = defineStore('costStore', {
  state: () => ({
    costs: [],
    loading: false,
  }),

  getters: {
    /**
     * Get all costs related to a specific project
     * @param {string} projectId - The ID of the project
     * @returns {Array} - Array of costs for the project
     */
    getCostsByProjectId: (state) => (projectId) => {
      return state.costs.filter(cost => cost.projectId === projectId);
    },

    /**
     * Get total costs for a specific project
     * @param {string} projectId - The ID of the project
     * @returns {number} - Total cost amount
     */
    totalCostsByProjectId: (state) => (projectId) => {
      return state.getCostsByProjectId(projectId).reduce((sum, cost) => sum + (parseFloat(cost.amount) || 0), 0);
    },

    /**
     * Get costs by category for a specific project
     * @param {string} projectId - The ID of the project
     * @param {string} category - The category to filter by
     * @returns {Array} - Array of costs by category
     */
    getCostsByCategory: (state) => (projectId, category) => {
      return state.getCostsByProjectId(projectId).filter(cost => cost.category === category);
    },

    /**
     * Get all global costs (not tied to a project)
     * @returns {Array} - Array of global costs
     */
    getGlobalCosts: (state) => {
      return state.costs.filter(cost => !cost.projectId);
    },

    /**
     * Get total costs by category for a specific project
     * @param {string} projectId - The ID of the project
     * @param {string} category - The category to filter by
     * @returns {number} - Total cost amount for the category
     */
    totalCostsByCategory: (state) => (projectId, category) => {
      return state.getCostsByCategory(projectId, category).reduce((sum, cost) => sum + (parseFloat(cost.amount) || 0), 0);
    },
  },

  actions: {
    /**
     * Fetch costs by projectId from Firebase and update the state
     * @param {string} projectId - The ID of the project to fetch costs for
     */
    async fetchCostsByProject(projectId) {
      const errorStore = useErrorStore();
      this.loading = true;
      
      try {
        const q = query(collection(db, 'costs'), where('projectId', '==', projectId));
        const querySnapshot = await getDocs(q);
        const costs = querySnapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data() 
        }));

        // Update the state: replace existing costs for this projectId
        this.costs = this.costs.filter(cost => cost.projectId !== projectId);
        this.costs.push(...costs);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        errorStore.showError('Failed to fetch costs: ' + message);
      } finally {
        this.loading = false;
      }
    },

    /**
     * Fetch all costs, optionally filtered by projectId
     * @param {string} projectId - Optional project ID to filter costs by
     */
    async fetchCosts(projectId) {
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
        }));
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        errorStore.showError('Failed to fetch costs: ' + message);
      } finally {
        this.loading = false;
      }
    },

    /**
     * Add a new cost record
     * @param {Object} cost - The cost object to add
     */
    async addCost(cost) {
      const errorStore = useErrorStore();
      const userStore = useUserStore();
      
      try {
        if (!cost.amount || isNaN(Number(cost.amount))) {
          throw new Error('Invalid cost amount');
        }
        
        // Get current user for reference
        const currentUser = userStore.currentUser;
        const userRef = currentUser ? {
          uid: currentUser.uid,
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL,
          role: currentUser.role
        } : { uid: 'anonymous' };
        
        // Prepare cost object with timestamps
        const newCost = {
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
        this.costs.push({ id: docRef.id, ...newCost });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        errorStore.showError('Failed to add cost: ' + message);
      }
    },

    /**
     * Update an existing cost
     * @param {string} id - The ID of the cost to update
     * @param {Object} updatedCost - The updated cost data
     */
    async updateCost(id, updatedCost) {
      const errorStore = useErrorStore();
      const userStore = useUserStore();
      
      try {
        if (updatedCost.amount !== undefined && isNaN(Number(updatedCost.amount))) {
          throw new Error('Invalid cost amount');
        }
        
        // Convert amount to number if present
        if (updatedCost.amount !== undefined) {
          updatedCost.amount = Number(updatedCost.amount);
        }
        
        // Get current user for reference
        const currentUser = userStore.currentUser;
        const userRef = currentUser ? {
          uid: currentUser.uid,
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL,
          role: currentUser.role
        } : { uid: 'anonymous' };
        
        // Prepare update data
        const updateData = {
          ...updatedCost,
          updatedAt: Timestamp.now(),
          updatedBy: userRef
        };
        
        // Update in Firestore
        const costRef = doc(db, 'costs', id);
        await updateDoc(costRef, updateData);
        
        // Update local state
        const index = this.costs.findIndex(cost => cost.id === id);
        if (index !== -1) {
          this.costs[index] = { ...this.costs[index], ...updateData };
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        errorStore.showError('Failed to update cost: ' + message);
      }
    },

    /**
     * Delete a cost record
     * @param {string} id - The ID of the cost to delete
     */
    async deleteCost(id) {
      const errorStore = useErrorStore();
      
      try {
        // Delete from Firestore
        await deleteDoc(doc(db, 'costs', id));
        
        // Remove from local state
        this.costs = this.costs.filter(cost => cost.id !== id);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        errorStore.showError('Failed to delete cost: ' + message);
      }
    },

    /**
     * Add multiple costs in a batch operation
     * @param {Array} costs - Array of cost objects to add
     */
    async batchAddCosts(costs) {
      const errorStore = useErrorStore();
      const userStore = useUserStore();
      const batch = writeBatch(db);
      
      try {
        // Get current user for reference
        const currentUser = userStore.currentUser;
        const userRef = currentUser ? {
          uid: currentUser.uid,
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL,
          role: currentUser.role
        } : { uid: 'anonymous' };
        
        // Process each cost in the batch
        const processedCosts = [];
        
        costs.forEach(cost => {
          if (!cost.amount || isNaN(Number(cost.amount))) {
            throw new Error('Invalid cost amount in batch');
          }
          
          // Prepare cost with timestamps and references
          const newCost = {
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
          processedCosts.push({ id: docRef.id, ...newCost });
        });
        
        // Commit the batch
        await batch.commit();
        
        // Update local state
        this.costs.push(...processedCosts);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        errorStore.showError('Failed to batch add costs: ' + message);
      }
    },
  },
});