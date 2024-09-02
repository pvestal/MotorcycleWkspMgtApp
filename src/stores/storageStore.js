import { defineStore } from 'pinia';
import { storage, db } from '@/fbConfig';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, addDoc, updateDoc, collection, Timestamp } from 'firebase/firestore';
import { useErrorStore } from './errorStore';

export const useStorageStore = defineStore('storageStore', {
  state: () => ({
    loading: false,
  }),
  actions: {
    async uploadProjectPhoto(payload) {
      const errorStore = useErrorStore();
      this.loading = true;
      let imageUrl = '';
      let projectId = '';

      try {
        // Add project data to Firestore
        const projectData = {
          projectName: payload.project.projectName,
          createdAt: Timestamp.now(),
        };

        const docRef = await addDoc(collection(db, 'projects'), projectData);
        projectId = docRef.id;

        // Upload image to Firebase Storage if image exists
        if (payload.image) {
          const fileName = payload.image.name;
          const ext = fileName.slice(fileName.lastIndexOf('.'));
          const storageReference = storageRef(storage, `projects/${projectId}${ext}`);
          const snapshot = await uploadBytes(storageReference, payload.image);
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
