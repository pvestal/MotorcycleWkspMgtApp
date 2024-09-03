import { defineStore } from 'pinia';
import { storage, db } from '@/fbConfig';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, getDoc, updateDoc, setDoc, Timestamp } from 'firebase/firestore';
import { useErrorStore } from './errorStore';

export const useStorageStore = defineStore('storageStore', {
  state: () => ({
    loading: false,
    imageUrls: [],
  }),
  getters: {
    projectImages(state) {
      return state.imageUrls;
    },
  },
  actions: {
    async fetchProjectImages(projectId) {
      const errorStore = useErrorStore();
      this.loading = true;
  
      try {
        // Fetch project data from Firestore
        const docRef = doc(db, 'projects', projectId);
        const docSnap = await getDoc(docRef);
  
        if (docSnap.exists()) {
          const projectData = docSnap.data();
          if (projectData.imageUrls && projectData.imageUrls.length > 0) {
            this.imageUrls = projectData.imageUrls;
          } else {
            this.imageUrls = [];
          }
        } else {
          throw new Error("Project not found");
        }
      } catch (error) {
        errorStore.showError('An error occurred while fetching project images: ' + error.message);
        this.imageUrls = [];
      } finally {
        this.loading = false;
      }
    },
    async uploadProjectPhoto(file, projectId) {
      const errorStore = useErrorStore();
      this.loading = true;
      let imageUrl = '';

      try {
        // Ensure the projectId is available
        if (!projectId) {
          throw new Error("Project ID is missing.");
        }

        // Create the project data object (if it's a new project)
        const projectData = {
          projectId,
          createdAt: Timestamp.now(),
        };

        // Add project data to Firestore only if it's a new project
        const docRef = doc(db, 'projects', projectId);

        if (!docRef.exists) {
          await setDoc(docRef, projectData); // Assuming you want to add the projectData
        }

        // Upload image to Firebase Storage if image exists
        if (file) {
          const fileName = file.name;
          const ext = fileName.slice(fileName.lastIndexOf('.'));
          const storageReference = storageRef(storage, `projects/${projectId}${ext}`);
          const snapshot = await uploadBytes(storageReference, file);
          imageUrl = await getDownloadURL(snapshot.ref);

          // Update Firestore document with image URL
          await updateDoc(doc(db, 'projects', projectId), { imageUrl });
        }

        // Return project data with image URL and ID
        return {
          ...projectData,
          imageUrl,
          id: projectId,
        };
      } catch (error) {
        errorStore.showError('An error occurred while uploading project data: ' + error.message);
        throw error;
      } finally {
        this.loading = false;
      }
    },
  },

});
