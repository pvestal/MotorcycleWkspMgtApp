import { defineStore } from 'pinia';
import { storage, db } from '@/fbConfig'; // Ensure firebase config is correct
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject, StorageReference } from 'firebase/storage';
import { doc, getDoc, updateDoc, DocumentReference, DocumentSnapshot } from 'firebase/firestore';
import { useErrorStore } from './errorStore';

// Type definitions
interface ImageData {
  url: string;
  fileName: string;
  uploadDate?: string;
  dimensions?: {
    width: number;
    height: number;
  };
}

interface StorageState {
  loading: boolean;
  imageUrls: Record<string, ImageData[]>;
}

export const useStorageStore = defineStore('storageStore', {
  state: (): StorageState => ({
    loading: false,
    imageUrls: {}, // Store image URLs for each project by projectId
  }),
  
  getters: {
    // Getter to access project images easily
    projectImages: (state) => {
      return (projectId: string): ImageData[] => state.imageUrls[projectId] || [];
    },
  },
  
  actions: {
    // Fetch project images and store them as a flat array in imageUrls
    async fetchProjectImages(projectId: string): Promise<ImageData[]> {
      const errorStore = useErrorStore();
      this.loading = true;

      try {
        const docRef: DocumentReference = doc(db, 'projects', projectId);
        const docSnap: DocumentSnapshot = await getDoc(docRef);

        if (docSnap.exists()) {
          const projectData = docSnap.data();
          // Ensure imageUrls is an array
          if (Array.isArray(projectData.imageUrls)) {
            // Save imageUrls in the local state for the project
            this.imageUrls[projectId] = projectData.imageUrls;
            return projectData.imageUrls as ImageData[];
          } else {
            this.imageUrls[projectId] = [];
            return [];
          }
        } else {
          throw new Error("Project not found");
        }
      } catch (error) {
        const errMsg = error instanceof Error ? error.message : 'Unknown error';
        errorStore.showError('An error occurred while fetching project images: ' + errMsg);
        return [];
      } finally {
        this.loading = false;
      }
    },

    // Action to upload project images to Firebase Storage and update Firestore
    async uploadProjectPhoto(files: File[] | FileList | File, projectId: string): Promise<ImageData[]> {
      const errorStore = useErrorStore();
      this.loading = true;
      let imageUrls: ImageData[] = [];
    
      try {
        if (!projectId) {
          throw new Error("Project ID is missing.");
        }
    
        // Normalize the files input
        const fileArray: File[] = !(files instanceof Array) 
          ? files instanceof FileList ? Array.from(files) : [files as File]
          : files;
    
        // Fetch the existing project document
        const docRef: DocumentReference = doc(db, 'projects', projectId);
        const docSnap: DocumentSnapshot = await getDoc(docRef);
    
        // Retrieve the current imageUrls if they exist
        if (docSnap.exists()) {
          const existingData = docSnap.data();
          imageUrls = existingData.imageUrls || [];
        }
    
        // Upload each image and get its download URL
        for (const file of fileArray) {
          const uniqueFileName = `${Date.now()}_${file.name}`;  // Ensure unique filename
          const storageReference: StorageReference = storageRef(storage, `projects/${projectId}/${uniqueFileName}`);
          const snapshot = await uploadBytes(storageReference, file);
          const imageUrl = await getDownloadURL(snapshot.ref);
    
          // Store both the imageUrl and metadata (fileName and upload date)
          const imageData: ImageData = {
            url: imageUrl,          // The URL of the image
            fileName: file.name,    // The original file name
            uploadDate: new Date().toISOString() // The upload date as ISO string
          };
    
          // Add the new image data object to the array
          imageUrls.push(imageData);  // This ensures every image has unique metadata
        }
    
        // Update Firestore with the updated imageUrls array
        await updateDoc(docRef, { imageUrls });
    
        this.imageUrls[projectId] = imageUrls; // Update the local state
        return imageUrls;
      } catch (error) {
        const errMsg = error instanceof Error ? error.message : 'Unknown error';
        errorStore.showError('An error occurred while uploading project images: ' + errMsg);
        throw error;
      } finally {
        this.loading = false;
      }
    },    

    // Action to delete a project image from Firebase Storage and update Firestore
    async deleteProjectImage(imageUrl: string, projectId: string): Promise<void> {
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
        const imageRef: StorageReference = storageRef(storage, decodedPath);
    
        // Delete the image from Firebase Storage
        await deleteObject(imageRef);
    
        // Fetch the project document from Firestore
        const docRef: DocumentReference = doc(db, 'projects', projectId);
        const docSnap: DocumentSnapshot = await getDoc(docRef);
    
        if (docSnap.exists()) {
          const data = docSnap.data();
          let imageUrls = data.imageUrls || [];
    
          // Filter out deleted image
          // We need to handle both the old format (string URLs) and the new format (ImageData objects)
          if (typeof imageUrls[0] === 'string') {
            // Old format: array of string URLs
            imageUrls = imageUrls.filter((url: string) => url !== imageUrl);
          } else {
            // New format: array of ImageData objects
            imageUrls = imageUrls.filter((imgData: ImageData) => imgData.url !== imageUrl);
          }
    
          // Update Firestore with the new imageUrls array
          await updateDoc(docRef, { imageUrls });
    
          // Update the local state to reflect the deletion
          this.imageUrls[projectId] = imageUrls;
        }
      } catch (error) {
        const errMsg = error instanceof Error ? error.message : 'Unknown error';
        errorStore.showError('An error occurred while deleting the image: ' + errMsg);
        console.error('Error deleting image:', errMsg);
        throw error;
      } finally {
        this.loading = false;
      }
    }
  },    
});