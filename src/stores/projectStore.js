import { defineStore } from 'pinia';
import { db, auth } from '@/fbConfig'; // Firestore and Auth configuration
import { collection, doc, setDoc, getDoc, updateDoc, getDocs, deleteDoc, Timestamp } from 'firebase/firestore';
import { useErrorStore } from './errorStore';

export const useProjectStore = defineStore('projectStore', {
  state: () => ({
    projects: [],
  }),
  getters: {
    // Retrieve a project by its ID
    getProjectById: (state) => (id) => {
      return state.projects.find(project => project.projectId === id);
    },
  },
  actions: {
    // Fetch all projects from Firestore
    async fetchProjects() {
      const errorStore = useErrorStore();
      try {
        const querySnapshot = await getDocs(collection(db, 'projects'));
        this.projects = querySnapshot.docs.map(doc => doc.data());
      } catch (error) {
        errorStore.showError('Error fetching projects: ' + error.message);
      }
    },

    // Add a new project to Firestore
    async addProject(projectData) {
      const errorStore = useErrorStore();
      try {
        const currentUser = auth.currentUser; // Get the current authenticated user
        if (!currentUser) throw new Error('No user is currently logged in.');

        const projectId = doc(collection(db, 'projects')).id; // Generate a unique ID
        projectData.projectId = projectId;
        projectData.createdAt = Timestamp.now();
        projectData.updatedAt = Timestamp.now();
        projectData.createdBy = {
          uid: currentUser.uid,
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL || '',
          role: currentUser.role,
          userStatus: currentUser.userStatus,
        };
        projectData.updatedBy = { ...projectData.createdBy };

        await setDoc(doc(db, 'projects', projectId), projectData);
        this.projects.push(projectData);
      } catch (error) {
        errorStore.showError('Error adding project: ' + error.message);
      }
    },
    // Update an existing project in Firestore
    async updateProject(projectId, updatedData) {
      const errorStore = useErrorStore();
      try {
        const currentUser = auth.currentUser; // Get the current authenticated user
        if (!currentUser) throw new Error('No user is currently logged in.');

        const projectRef = doc(db, 'projects', projectId);
        updatedData.updatedAt = Timestamp.now();
        updatedData.updatedBy = {
          uid: currentUser.uid,
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL,
          role: currentUser.role,
          userStatus: currentUser.userStatus,
        };

        await updateDoc(projectRef, updatedData);
        const index = this.projects.findIndex(project => project.projectId === projectId);
        if (index !== -1) {
          this.projects[index] = { ...this.projects[index], ...updatedData };
        }
      } catch (error) {
        errorStore.showError('Error updating project: ' + error.message);
      }
    },

    // Delete a project from Firestore
    async deleteProject(projectId) {
      const errorStore = useErrorStore();
      try {
        await deleteDoc(doc(db, 'projects', projectId));
        this.projects = this.projects.filter(project => project.projectId !== projectId);
      } catch (error) {
        errorStore.showError('Error deleting project: ' + error.message);
      }
    },
  },
});
