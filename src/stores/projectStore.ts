import { defineStore } from 'pinia';
import { db, auth } from '@/fbConfig'; // Firestore and Auth configuration
import { collection, doc, setDoc, updateDoc, getDoc, getDocs, deleteDoc, Timestamp, addDoc } from 'firebase/firestore';
import { useErrorStore } from './errorStore';
import { useUserStore } from './userStore';
import { Project, ProjectUpdate, UserReference } from '../types';

interface ProjectState {
  projects: Project[];
  selectedProject: Project | null;
  noteHistory?: any[]; // TODO: Define a proper type for note history
}

export const useProjectStore = defineStore('projectStore', {
  state: (): ProjectState => ({
    projects: [],
    selectedProject: null,
    noteHistory: [],
  }),
  getters: {
    // Retrieve a project by its ID
    getProjectById: (state) => (id: string): Project | undefined => {
      return state.projects.find(project => project.projectId === id);
    },
  },
  actions: {
    // Fetch all projects from Firestore
    async fetchProjects(): Promise<void> {
      const errorStore = useErrorStore();
      try {
        const querySnapshot = await getDocs(collection(db, 'projects'));
        this.projects = querySnapshot.docs.map(doc => doc.data() as Project);
      } catch (error: any) {
        errorStore.showError('Error fetching projects: ' + error.message);
      }
    },
    
    async fetchProjectById(projectId: string): Promise<Project> {
      const errorStore = useErrorStore();
      try {
        const projectDoc = doc(db, 'projects', projectId);
        const projectSnapshot = await getDoc(projectDoc);

        if (projectSnapshot.exists()) {
          this.selectedProject = projectSnapshot.data() as Project;
          return this.selectedProject;
        } else {
          throw new Error('No such project exists');
        }
      } catch (error: any) {
        errorStore.showError("Error fetching project: " + error.message);
        throw error;
      }
    },
    
    // Add a new project to Firestore
    async addProject(projectData: Partial<Project>): Promise<void> {
      const errorStore = useErrorStore();
      const userStore = useUserStore();
      try {
        const currentUser = auth.currentUser; // Get the current authenticated user
        if (!currentUser) throw new Error('No user is currently logged in.');

        const projectId = doc(collection(db, 'projects')).id; // Generate a unique ID
        
        const userRef: UserReference = {
          uid: currentUser.uid,
          displayName: currentUser.displayName || 'Unknown User',
          photoURL: currentUser.photoURL || '',
          role: userStore.currentUser?.role || 'customer',
          userStatus: userStore.currentUser?.userStatus || 'active',
        };
        
        const newProject: Project = {
          ...projectData as Project,
          projectId,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
          createdBy: userRef,
          updatedBy: userRef
        };

        await setDoc(doc(db, 'projects', projectId), newProject);
        this.projects.push(newProject);
      } catch (error: any) {
        errorStore.showError('Error adding project: ' + error.message);
      }
    },
    
    // Update an existing project in Firestore
    async updateProject(projectId: string, updatedData: ProjectUpdate): Promise<void> {
      const errorStore = useErrorStore();
      try {
        const currentUser = auth.currentUser; // Get the current authenticated user
        if (!currentUser) throw new Error('No user is currently logged in.');

        const projectRef = doc(db, 'projects', projectId);
        const updatePayload: ProjectUpdate = {
          ...updatedData,
          updatedAt: Timestamp.now(),
          updatedBy: {
            uid: currentUser.uid,
            displayName: currentUser.displayName || 'Unknown User',
            photoURL: currentUser.photoURL || '',
          }
        };

        await updateDoc(projectRef, updatePayload);
        const index = this.projects.findIndex(project => project.projectId === projectId);
        if (index !== -1) {
          this.projects[index] = { ...this.projects[index], ...updatePayload } as Project;
        }
      } catch (error: any) {
        errorStore.showError('Error updating project: ' + error.message);
      }
    },

    // Delete a project from Firestore
    async deleteProject(projectId: string): Promise<void> {
      const errorStore = useErrorStore();
      try {
        await deleteDoc(doc(db, 'projects', projectId));
        this.projects = this.projects.filter(project => project.projectId !== projectId);
      } catch (error: any) {
        errorStore.showError('Error deleting project: ' + error.message);
      }
    },

    async fetchNoteHistory(projectId: string): Promise<void> {
      try {
        const notesCollection = collection(db, 'projects', projectId, 'noteChanges');
        const noteSnapshots = await getDocs(notesCollection);
        this.noteHistory = noteSnapshots.docs.map(doc => doc.data());
      } catch (error: any) {
        const errorStore = useErrorStore();
        errorStore.showError('Error fetching note history: ' + error.message);
      }
    },

    async updateNote(projectId: string, newNote: string): Promise<void> {
      try {
        if (!this.selectedProject) {
          throw new Error('No project selected');
        }
        
        const userStore = useUserStore();
        const currentUser = userStore.currentUser;
        
        if (!currentUser) {
          throw new Error('User must be logged in to update notes');
        }
        
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
      } catch (error: any) {
        const errorStore = useErrorStore();
        errorStore.showError('Error updating note: ' + error.message);
      }
    },
  },
});