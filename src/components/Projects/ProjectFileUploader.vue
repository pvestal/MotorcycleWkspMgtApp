<template>
  <div class="image-uploader">
    <div v-if="uploadedImageUrls.length" class="image-preview">
      <div v-for="(imageUrl, index) in uploadedImageUrls" :key="index" class="image-item">
        <div class="image-container">
          <img :src="imageUrl.url" alt="Project Image" />
        </div>
        <div class="image-info">
          <p class="file-name">{{ imageUrl.fileName || `Image ${index + 1}` }}</p>
          <p class="upload-date">{{ formatDate(imageUrl.uploadDate) }}</p>
        </div>
      </div>
    </div>
    
    <label for="file-upload" class="file-upload-label">
      <span class="upload-icon">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
        </svg>
      </span>
      <span>Upload Images</span>
    </label>
    <input id="file-upload" type="file" multiple @change="handleImageUpload" class="file-input" />
    
    <div v-if="isUploading" class="upload-status">
      <div class="spinner"></div>
      <p>Uploading images...</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useStorageStore } from '@/stores/storageStore';
import { useErrorStore } from '@/stores/errorStore';

const storageStore = useStorageStore();
const errorStore = useErrorStore();

const props = defineProps({
  projectId: {
    type: String,
    required: true,
  },
});

const uploadedImageUrls = ref([]);
const isUploading = ref(false);

const handleImageUpload = async (event) => {
  const files = event.target.files;
  if (files.length > 0 && props.projectId) {
    isUploading.value = true;
    try {
      const uploadedUrls = await storageStore.uploadProjectPhoto(files, props.projectId);
      uploadedImageUrls.value = uploadedUrls;
    } catch (error) {
      errorStore.showError("Image upload error.");
    } finally {
      isUploading.value = false;
    }
  } else {
    errorStore.showError("No files selected or Project ID missing.");
  }
};

const formatDate = (date) => {
  if (!date) return 'Recently uploaded';
  return new Date(date).toLocaleDateString();
};
</script>

<style scoped>
.image-uploader {
  margin-bottom: 1.5em;
}

.image-preview {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.image-item {
  border-radius: 8px;
  overflow: hidden;
  background-color: #f9fafb;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.image-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.image-container {
  width: 100%;
  height: 150px;
  overflow: hidden;
  position: relative;
}

.image-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.image-item:hover .image-container img {
  transform: scale(1.05);
}

.image-info {
  padding: 0.75rem;
}

.file-name {
  font-weight: 500;
  margin-bottom: 0.25rem;
  font-size: 0.875rem;
  color: #374151;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.upload-date {
  font-size: 0.75rem;
  color: #6b7280;
}

.file-upload-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background-color: #f3f4f6;
  border-radius: 0.5rem;
  cursor: pointer;
  width: fit-content;
  transition: background-color 0.2s;
}

.file-upload-label:hover {
  background-color: #e5e7eb;
}

.upload-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  color: #4f46e5;
}

.file-upload-label span:not(.upload-icon) {
  font-weight: 500;
  color: #4b5563;
}

.file-input {
  display: none;
}

.upload-status {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 1rem;
  padding: 0.75rem;
  background-color: #f3f4f6;
  border-radius: 0.5rem;
}

.spinner {
  width: 1.25rem;
  height: 1.25rem;
  border: 0.2rem solid rgba(79, 70, 229, 0.2);
  border-top-color: #4f46e5;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.upload-status p {
  color: #4b5563;
  font-size: 0.875rem;
}

/* Dark mode styles */
:global(.dark) .image-item {
  background-color: #1f2937;
}

:global(.dark) .file-name {
  color: #e5e7eb;
}

:global(.dark) .upload-date {
  color: #9ca3af;
}

:global(.dark) .file-upload-label {
  background-color: #374151;
}

:global(.dark) .file-upload-label:hover {
  background-color: #4b5563;
}

:global(.dark) .file-upload-label span:not(.upload-icon) {
  color: #e5e7eb;
}

:global(.dark) .upload-status {
  background-color: #374151;
}

:global(.dark) .upload-status p {
  color: #e5e7eb;
}
</style>
