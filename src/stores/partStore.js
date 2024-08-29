import { defineStore } from 'pinia';
import { db } from '@/fbConfig'; 
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useErrorStore } from './errorStore';

export const usePartStore = defineStore('partStore', {
  state: () => ({
    parts: {},  // Object to store parts keyed by projectId
  }),
  getters: {
    getPartsByProjectId: (state) => (projectId) => state.parts[projectId] || [],
  },
  actions: {
    // Fetch parts related to a specific project
    async fetchPartsByProjectId(projectId) {
      const errorStore = useErrorStore();
      try {
        if (!this.parts[projectId]) {
          const q = query(collection(db, 'parts'), where('projectId', '==', projectId));
          const querySnapshot = await getDocs(q);
          this.parts[projectId] = querySnapshot.docs.map(doc => doc.data());
        }
      } catch (error) {
        errorStore.showError("An error occurred fetching parts: " + error.message);
      }
    },
  },
});