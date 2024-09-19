<template>
  <div class="image-uploader">
    <div v-if="uploadedImageUrls.length" class="image-preview">
      <div v-for="(imageUrl, index) in uploadedImageUrls" :key="index">
        <img :src="imageUrl.url" alt="Project Image" />
        <p>{{ imageUrl.fileName }} - Uploaded on {{ imageUrl.uploadDate }}</p>
      </div>
    </div>
    <input type="file" multiple @change="handleImageUpload" />
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

const handleImageUpload = async (event) => {
  const files = event.target.files;
  if (files.length > 0 && props.projectId) {
    try {
      const uploadedUrls = await storageStore.uploadProjectPhoto(files, props.projectId);
      uploadedImageUrls.value = uploadedUrls;
    } catch (error) {
      errorStore.showError("Image upload error.");
    }
  } else {
    errorStore.showError("No files selected or Project ID missing.");
  }
};
</script>

<style scoped>
.image-uploader {
  margin-bottom: 1em;
}

.image-preview img {
  max-width: 100px;
  height: auto;
  border-radius: 8px;
  margin-bottom: 10px;
}
</style>
