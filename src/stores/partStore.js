import { defineStore } from 'pinia';
import { db } from '@/fbConfig'; 
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where } from 'firebase/firestore';
import { useErrorStore } from './errorStore';

export const usePartStore = defineStore('partStore', {
  state: () => ({
    parts: [],
  }),
  getters: {
    getPartsByProjectId: (state) => (projectId) => state.parts[projectId] || [],
  },
  actions: {
    async fetchParts() {
      const errorStore = useErrorStore();
      try {
          const querySnapshot = await getDocs(collection(db, "parts"));
          this.tasks = querySnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
          }));
      } catch (err) {
          errorStore.showError(err);
      } finally {
          // console.log("fetchparts called from firestore.");
      }
  },
    // Fetch parts related to a specific project
    async fetchPartsByProjectId(projectId) {
      const errorStore = useErrorStore();
      try {
        if (!this.parts[projectId]) {
          const q = query(collection(db, 'parts'), where('projectId', '==', projectId));
          const querySnapshot = await getDocs(q);
          
          // Initialize the array for this projectId if not present
          this.parts[projectId] = querySnapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id, // Store document ID
          }));
        }
      } catch (error) {
        errorStore.showError("An error occurred fetching parts: " + error.message);
      }
    },

    // Add a part to Firestore and the state
    async addPart(projectId, partData) {
      const errorStore = useErrorStore();
      try {
        // Add the new part to Firestore
        const docRef = await addDoc(collection(db, 'parts'), {
          ...partData,
          projectId,
        });
        
        // Add the new part to the state
        if (!this.parts[projectId]) {
          this.parts[projectId] = [];
        }
        this.parts[projectId].push({
          ...partData,
          id: docRef.id,
        });
      } catch (error) {
        errorStore.showError("An error occurred adding the part: " + error.message);
      }
    },

    // Update a part in Firestore and the state
    async updatePart(projectId, partId, updatedData) {
      const errorStore = useErrorStore();
      try {
        // Update the part in Firestore
        const partRef = doc(db, 'parts', partId);
        await updateDoc(partRef, updatedData);

        // Update the part in the state
        const partIndex = this.parts[projectId].findIndex(part => part.id === partId);
        if (partIndex !== -1) {
          this.parts[projectId][partIndex] = {
            ...this.parts[projectId][partIndex],
            ...updatedData,
          };
        }
      } catch (error) {
        errorStore.showError("An error occurred updating the part: " + error.message);
      }
    },

    // Delete a part from Firestore and the state
    async deletePart(projectId, partId) {
      const errorStore = useErrorStore();
      try {
        // Delete the part from Firestore
        const partRef = doc(db, 'parts', partId);
        await deleteDoc(partRef);

        // Remove the part from the state
        this.parts[projectId] = this.parts[projectId].filter(part => part.id !== partId);
      } catch (error) {
        errorStore.showError("An error occurred deleting the part: " + error.message);
      }
    },
  },
});
