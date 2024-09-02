import { defineStore } from 'pinia';
import { db } from '@/fbConfig'; 
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import { useErrorStore } from './errorStore';

export const useCostStore = defineStore('costStore', {
  state: () => ({
    costs: [],
    loading: false,
  }),
  
  getters: {
    getCostsByProjectId: (state) => (projectId) => {
      return state.costs.filter(cost => cost.projectId === projectId);
    },
    totalCostsByProjectId: (state) => (projectId) => {
      return state.getCostsByProjectId(projectId).reduce((sum, cost) => sum + cost.amount, 0);
    },
  },
  
  actions: {
    async fetchCosts() {
      const errorStore = useErrorStore();
      this.loading = true;
      try {
        const q = query(collection(db, 'costs'));
        const querySnapshot = await getDocs(q);
        this.costs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (error) {
        errorStore.showError('Failed to fetch costs: ' + error.message);
      } finally {
        this.loading = false;
      }
    },
    
    async addCost(cost) {
      const errorStore = useErrorStore();
      try {
        const docRef = await addDoc(collection(db, 'costs'), cost);
        this.costs.push({ id: docRef.id, ...cost });
      } catch (error) {
        errorStore.showError('Failed to add cost: ' + error.message);
      }
    },
    
    async updateCost(id, updatedCost) {
      const errorStore = useErrorStore();
      try {
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
    
    async deleteCost(id) {
      const errorStore = useErrorStore();
      try {
        await deleteDoc(doc(db, 'costs', id));
        this.costs = this.costs.filter(cost => cost.id !== id);
      } catch (error) {
        errorStore.showError('Failed to delete cost: ' + error.message);
      }
    },

    async fetchCostsByProjectId(projectId) {
      const errorStore = useErrorStore();
      this.loading = true;
      try {
        const q = query(collection(db, 'costs'), where('projectId', '==', projectId));
        const querySnapshot = await getDocs(q);
        this.costs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (error) {
        errorStore.showError('Failed to fetch costs by projectId: ' + error.message);
      } finally {
        this.loading = false;
      }
    },
  },
});
