import { defineStore } from 'pinia';
import { db } from '@/fbConfig'; 
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where, writeBatch } from 'firebase/firestore';
import { useErrorStore } from './errorStore';

export const useCostStore = defineStore('costStore', {
  state: () => ({
    costs: [],
    loading: false,
  }),

  getters: {
    // Get all costs related to a specific project
    getCostsByProjectId: (state) => (projectId) => {
      return state.costs.filter(cost => cost.projectId === projectId);
    },

    // Get total costs for a specific project
    totalCostsByProjectId: (state) => (projectId) => {
      return state.getCostsByProjectId(projectId).reduce((sum, cost) => sum + (parseFloat(cost.amount) || 0), 0);
    },

    // Option to categorize costs (e.g., labor, materials)
    getCostsByCategory: (state) => (projectId, category) => {
      return state.getCostsByProjectId(projectId).filter(cost => cost.category === category);
    },

    // Get all global costs (not tied to a project)
    getGlobalCosts: (state) => {
      return state.costs.filter(cost => !cost.projectId);
    },

    // Get total costs by category
    totalCostsByCategory: (state) => (projectId, category) => {
      return state.getCostsByCategory(projectId, category).reduce((sum, cost) => sum + (parseFloat(cost.amount) || 0), 0);
    },
  },

  actions: {
    // Fetch costs by projectId from Firebase and update the state
    async fetchCostsByProject(projectId) {
      const errorStore = useErrorStore();
      this.loading = true;
      try {
        const q = query(collection(db, 'costs'), where('projectId', '==', projectId));
        const querySnapshot = await getDocs(q);
        const costs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Update the state: replace existing costs for this projectId
        this.costs = this.costs.filter(cost => cost.projectId !== projectId);
        this.costs.push(...costs);
      } catch (error) {
        errorStore.showError('Failed to fetch costs: ' + error.message);
      } finally {
        this.loading = false;
      }
    },

    // Fetch all costs (optionally filtered by projectId)
    async fetchCosts(projectId = null) {
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
        this.costs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (error) {
        errorStore.showError('Failed to fetch costs: ' + error.message);
      } finally {
        this.loading = false;
      }
    },

    // Add new cost with validation
    async addCost(cost) {
      const errorStore = useErrorStore();
      try {
        if (!cost.amount || isNaN(cost.amount)) {
          throw new Error('Invalid cost amount');
        }
        const docRef = await addDoc(collection(db, 'costs'), cost);
        this.costs.push({ id: docRef.id, ...cost });
      } catch (error) {
        errorStore.showError('Failed to add cost: ' + error.message);
      }
    },

    // Update existing cost
    async updateCost(id, updatedCost) {
      const errorStore = useErrorStore();
      try {
        if (updatedCost.amount && isNaN(updatedCost.amount)) {
          throw new Error('Invalid cost amount');
        }
        const costRef = doc(db, 'costs', id);
        await updateDoc(costRef, updatedCost);
        const index = this.costs.findIndex(cost => cost.id === id);
        if (index !== -1) {
          this.costs[index] = { ...this.costs[index], ...updatedCost };
        }
      } catch (error) {
        errorStore.showError('Failed to update cost: ' + error.message);
      }
    },

    // Delete cost
    async deleteCost(id) {
      const errorStore = useErrorStore();
      try {
        await deleteDoc(doc(db, 'costs', id));
        this.costs = this.costs.filter(cost => cost.id !== id);
      } catch (error) {
        errorStore.showError('Failed to delete cost: ' + error.message);
      }
    },

    // Batch add costs
    async batchAddCosts(costs) {
      const errorStore = useErrorStore();
      const batch = writeBatch(db);
      try {
        costs.forEach(cost => {
          const docRef = doc(collection(db, 'costs'));
          batch.set(docRef, cost);
        });
        await batch.commit();
        this.costs.push(...costs); // Optimistically adding to state
      } catch (error) {
        errorStore.showError('Failed to add costs: ' + error.message);
      }
    },
  },
});
