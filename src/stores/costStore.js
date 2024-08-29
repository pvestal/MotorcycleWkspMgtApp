import { defineStore } from 'pinia';
import { db } from '@/fbConfig'; 
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useErrorStore } from './errorStore';

export const useCostStore = defineStore('costStore', {
  state: () => ({
    costs: [],
  }),
  getters: {
    getCostsByProjectId: (state) => (projectId) => state.costs[projectId] || [],
  },
  actions: {
    // Fetch costs related to a specific project
    async fetchCostsByProjectId(projectId) {
      const errorStore = useErrorStore();
      try {
        if (!this.costs[projectId]) {
          const q = query(collection(db, 'costs'), where('projectId', '==', projectId));
          const querySnapshot = await getDocs(q);
          this.costs[projectId] = querySnapshot.docs.map(doc => doc.data());
        }
      } catch (error) {
        errorStore.showError("An error occurred fetching costs: " + error.message);
      }
    },
  },
});
