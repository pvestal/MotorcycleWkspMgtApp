import { defineStore } from 'pinia';
import { db, auth } from '@/fbConfig'; // Firestore and Auth configuration
import { collection, doc, setDoc, updateDoc, getDocs, deleteDoc, Timestamp } from 'firebase/firestore';
import { useErrorStore } from './errorStore';
import { useUserStore } from './userStore';

export const useProjectStore = defineStore('projectStore', {
  state: () => ({
    projects: [],
    selectedProject: null,
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
    async fetchProjectById(projectId) {
      const projectDoc = doc(db, 'projects', projectId);
      const projectSnapshot = await getDoc(projectDoc);
      if (projectSnapshot.exists()) {
        this.selectedProject = projectSnapshot.data();
        await this.fetchNoteHistory(projectId);
      }
    },
    // Add a new project to Firestore
    async addProject(projectData) {
      const errorStore = useErrorStore();
      const userStore = useUserStore();
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
          photoURL: currentUser.photoURL || userStore.generateAvatarURL(),
          role: currentUser.role || 'admin',
          userStatus: currentUser.userStatus || 'active',
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

    async fetchNoteHistory(projectId) {
      const notesCollection = collection(db, 'projects', projectId, 'noteChanges');
      const noteSnapshots = await getDocs(notesCollection);
      this.noteHistory = noteSnapshots.docs.map(doc => doc.data());
    },

    async updateNote(projectId, newNote) {
      const userStore = useUserStore();
      const currentUser = userStore.currentUser();
      const projectDoc = doc(db, 'projects', projectId);
      const previousNote = this.selectedProject.note || '';

      // Save the previous note to the noteChanges sub-collection
      const notesCollection = collection(db, 'projects', projectId, 'noteChanges');
      await addDoc(notesCollection, {
        updatedAt: Timestamp.now(),
        previousNote,
        updatedBy: currentUser
      });

      // Update the main document's note field
      await updateDoc(projectDoc, { note: newNote });

      // Fetch the updated project and note history
      await this.fetchProjectById(projectId);
    },
  },
});
