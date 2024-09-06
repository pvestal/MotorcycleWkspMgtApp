import { defineStore } from 'pinia';
import { storage, db } from '@/fbConfig'; // Ensure firebase config is correct
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { doc, getDoc, Timestamp, updateDoc } from 'firebase/firestore';
import { useErrorStore } from './errorStore';

export const useStorageStore = defineStore('storageStore', {
  state: () => ({
    loading: false,
    imageUrls: {}, // Store image URLs for each project by projectId
  }),
  getters: {
    // Getter to access project images easily
    projectImages(state) {
      return (projectId) => state.imageUrls[projectId] || [];
    },
  },
  actions: {
    // Fetch project images and store them as a flat array in imageUrls
    async fetchProjectImages(projectId) {
      const errorStore = useErrorStore();
      this.loading = true;

      try {
        const docRef = doc(db, 'projects', projectId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const projectData = docSnap.data();
          // Ensure imageUrls is an array
          if (Array.isArray(projectData.imageUrls)) {
            // Save imageUrls in the local state for the project
            this.imageUrls[projectId] = projectData.imageUrls;
            return projectData.imageUrls;
          } else {
            this.imageUrls[projectId] = [];
            return [];
          }
        } else {
          throw new Error("Project not found");
        }
      } catch (error) {
        errorStore.showError('An error occurred while fetching project images: ' + error.message);
        return [];
      } finally {
        this.loading = false;
      }
    },

    // Action to upload project images to Firebase Storage and update Firestore
    async uploadProjectPhoto(files, projectId) {
      const errorStore = useErrorStore();
      this.loading = true;
      let imageUrls = [];
    
      try {
        if (!projectId) {
          throw new Error("Project ID is missing.");
        }
    
        // Normalize the files input
        if (!(files instanceof Array)) {
          files = files instanceof FileList ? Array.from(files) : [files];
        }
    
        // Fetch the existing project document
        const docRef = doc(db, 'projects', projectId);
        const docSnap = await getDoc(docRef);
    
        // Retrieve the current imageUrls if they exist
        if (docSnap.exists()) {
          const existingData = docSnap.data();
          imageUrls = existingData.imageUrls || [];
        }
    
        // Upload each image and get its download URL
        for (const file of files) {
          const uniqueFileName = `${Date.now()}_${file.name}`;
          const storageReference = storageRef(storage, `projects/${projectId}/${uniqueFileName}`);
          const snapshot = await uploadBytes(storageReference, file);
          const imageUrl = await getDownloadURL(snapshot.ref);
    
          // Store both the imageUrl and metadata (fileName and upload date)
          const imageData = {
            url: imageUrl,          // The URL of the image
            fileName: file.name,    // The original file name
            uploadDate: new Date().toISOString() // The upload date as ISO string
          };
          
    
          // Only add the new image URL if it doesn't already exist
          imageUrls.push(imageData); // Add the image data object to the array
        }
    
        // Update Firestore with the updated imageUrls array
        await updateDoc(docRef, { imageUrls });
    
        this.imageUrls[projectId] = imageUrls; // Update the local state
        return imageUrls;
      } catch (error) {
        errorStore.showError('An error occurred while uploading project images: ' + error.message);
        throw error;
      } finally {
        this.loading = false;
      }
    },    

    // Action to delete a project image from Firebase Storage and update Firestore
    async deleteProjectImage(imageUrl, projectId) {
      const errorStore = useErrorStore();
      this.loading = true;
    
      try {
        // Log the imageUrl to debug
        console.log('Deleting image with URL:', imageUrl);
    
        if (typeof imageUrl !== 'string' || !imageUrl) {
          throw new Error('Invalid image URL');
        }
    
        // Extract the Firebase storage path from the image URL
        const path = imageUrl.split('/o/')[1]?.split('?')[0];
        
        if (!path) {
          throw new Error('Failed to extract path from image URL');
        }
    
        const decodedPath = decodeURIComponent(path);
    
        // Create a reference to the image in Firebase Storage
        const imageRef = storageRef(storage, decodedPath);
    
        // Delete the image from Firebase Storage
        await deleteObject(imageRef);
    
        // Fetch the project document from Firestore
        const docRef = doc(db, 'projects', projectId);
        const docSnap = await getDoc(docRef);
    
        if (docSnap.exists()) {
          let { imageUrls } = docSnap.data();
    
          // Remove the deleted image URL from the imageUrls array
          imageUrls = imageUrls.filter(url => url !== imageUrl);
    
          // Update Firestore with the new imageUrls array
          await updateDoc(docRef, { imageUrls });
    
          // Update the local state to reflect the deletion
          this.imageUrls[projectId] = imageUrls;
        }
      } catch (error) {
        errorStore.showError('An error occurred while deleting the image: ' + error.message);
        console.error('Error deleting image:', error.message);
        throw error;
      } finally {
        this.loading = false;
      }
    }
  },    
});
