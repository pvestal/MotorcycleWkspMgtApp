<template>
  <div class="image-uploader">
    <!-- File input for image upload -->
    <input type="file" @change="handleImageUpload" />
    <br>
    <br>
    <!-- Preview the uploaded image -->
    <div v-if="uploadedImageUrl" class="image-preview">
      <img :src="uploadedImageUrl" alt="Project Image" />
    </div>
    <br>
    <br>
    <!-- Display uploaded images -->
    <div v-if="props.projectId.imageUrls" class="project-images">
      <h2>Uploaded Images</h2>
      <div v-for="(imageData, index) in props.projectId.imageUrls" :key="index" class="image-wrapper">
        <img :src="imageData.url" :alt="`${imageData.fileName}`" class="uploaded-image" />
        <button @click="handleDeleteImage(imageData.url)" class="delete-button">Delete</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useStorageStore } from '@/stores/storageStore';
import { useErrorStore } from '@/stores/errorStore';

// Props passed from the parent
const props = defineProps({
  projectId: {
    type: String,
    required: true,
  },
});

// Emit an event when an image is uploaded
const emit = defineEmits(['imageUploaded']);

const storageStore = useStorageStore();
const errorStore = useErrorStore();

const uploadedImageUrl = ref('');

const handleImageUpload = async (event) => {
  const file = event.target.files[0];

  if (!file) {
    errorStore.showError('No file selected.');
    return;
  }

  try {
    // Upload the image and get its URL
    const imageUrl = await storageStore.uploadProjectPhoto([file], props.projectId);

    // Store the uploaded image URL
    uploadedImageUrl.value = imageUrl[0];

    // Emit the uploaded image URL to the parent component
    emit('imageUploaded', imageUrl[0]);
  } catch (error) {
    errorStore.showError('Image upload failed: ' + error.message);
  }
};
</script>

<style scoped>
.image-preview img {
  max-width: 50%;
  height: auto;
  border-radius: 8px;
  margin-bottom: 10px;
}
</style>
