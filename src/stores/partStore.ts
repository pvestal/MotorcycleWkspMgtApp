/**
 * Part Store
 * 
 * Manages the state and operations for parts in the application.
 * Handles fetching, adding, updating, and deleting parts from Firestore.
 */

import { defineStore } from 'pinia';
import { db } from '@/fbConfig'; 
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { useErrorStore } from './errorStore';
import { useUserStore } from './userStore';
import { Part, PartUpdate, UserReference } from '../types';

interface PartState {
  parts: Part[];
  loading: boolean;
}

export const usePartStore = defineStore('partStore', {
  state: (): PartState => ({
    parts: [],
    loading: false,
  }),
  
  getters: {
    /**
     * Get parts by project ID
     * @param projectId - The ID of the project
     * @returns Array of parts for the project
     */
    getPartsByProjectId: (state) => (projectId: string): Part[] => {
      return state.parts.filter(part => part.projectId === projectId);
    },
  },
  
  actions: {
    /**
     * Fetch all parts from Firestore
     * @returns Array of all parts
     */
    async fetchParts(): Promise<Part[]> {
      const errorStore = useErrorStore();
      this.loading = true;
      
      try {
        const querySnapshot = await getDocs(collection(db, "parts"));
        this.parts = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        } as Part));
        return this.parts;
      } catch (error: any) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        errorStore.showError('Failed to fetch parts: ' + message);
        return [];
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * Fetch parts by project ID
     * @param projectId - The ID of the project
     * @returns Array of parts for the project
     */
    async fetchPartsByProjectId(projectId: string): Promise<Part[]> {
      const errorStore = useErrorStore();
      this.loading = true;
      
      try {
        // Query parts for the specific project
        const q = query(collection(db, 'parts'), where('projectId', '==', projectId));
        const querySnapshot = await getDocs(q);
        
        // Extract parts from query results
        const projectParts = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        } as Part));
        
        // Update the parts in the store that belong to this project
        // First remove any existing parts for this project
        this.parts = this.parts.filter(part => part.projectId !== projectId);
        // Then add the newly fetched parts
        this.parts.push(...projectParts);
        
        return projectParts;
      } catch (error: any) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        errorStore.showError('Failed to fetch parts for project: ' + message);
        return [];
      } finally {
        this.loading = false;
      }
    },

    /**
     * Add a new part
     * @param partData - The part data to add
     * @returns The added part with ID
     */
    async addPart(partData: Partial<Part>): Promise<Part> {
      const errorStore = useErrorStore();
      const userStore = useUserStore();
      this.loading = true;
      
      try {
        // Get current user for reference
        const currentUser = userStore.currentUser;
        const userRef: UserReference = currentUser ? {
          uid: currentUser.uid,
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL,
          role: currentUser.role
        } : { uid: 'anonymous' };
        
        // Prepare part data with timestamps
        const newPart: Partial<Part> = {
          ...partData,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
          createdBy: userRef,
          updatedBy: userRef
        };
        
        // Add to Firestore
        const docRef = await addDoc(collection(db, 'parts'), newPart);
        
        // Add ID to the part object
        const partWithId: Part = {
          id: docRef.id,
          ...newPart
        } as Part;
        
        // Add to local state
        this.parts.push(partWithId);
        
        return partWithId;
      } catch (error: any) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        errorStore.showError('Failed to add part: ' + message);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Update an existing part
     * @param partId - The ID of the part to update
     * @param updatedData - The updated part data
     * @returns The updated part
     */
    async updatePart(partId: string, updatedData: PartUpdate): Promise<Part | null> {
      const errorStore = useErrorStore();
      const userStore = useUserStore();
      this.loading = true;
      
      try {
        // Get current user for reference
        const currentUser = userStore.currentUser;
        const userRef: UserReference = currentUser ? {
          uid: currentUser.uid,
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL,
          role: currentUser.role
        } : { uid: 'anonymous' };
        
        // Prepare update data
        const updateData: PartUpdate = {
          ...updatedData,
          updatedAt: Timestamp.now(),
          updatedBy: userRef
        };
        
        // Update in Firestore
        const partRef = doc(db, 'parts', partId);
        await updateDoc(partRef, updateData);
        
        // Update in local state
        const index = this.parts.findIndex(part => part.id === partId);
        if (index !== -1) {
          this.parts[index] = { 
            ...this.parts[index], 
            ...updateData 
          } as Part;
          return this.parts[index];
        }
        
        return null;
      } catch (error: any) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        errorStore.showError('Failed to update part: ' + message);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Delete a part
     * @param partId - The ID of the part to delete
     * @returns Success status
     */
    async deletePart(partId: string): Promise<boolean> {
      const errorStore = useErrorStore();
      this.loading = true;
      
      try {
        // Delete from Firestore
        const partRef = doc(db, 'parts', partId);
        await deleteDoc(partRef);
        
        // Remove from local state
        this.parts = this.parts.filter(part => part.id !== partId);
        
        return true;
      } catch (error: any) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        errorStore.showError('Failed to delete part: ' + message);
        return false;
      } finally {
        this.loading = false;
      }
    }
  }
});