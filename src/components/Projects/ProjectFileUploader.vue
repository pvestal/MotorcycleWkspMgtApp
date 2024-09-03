<template>
  <div class="image-uploader">
    <div v-if="uploadedImageUrl" class="image-preview">
      <img :src="uploadedImageUrl" alt="Project Image" />
    </div>
    <input type="file" @change="handleImageUpload" />
  </div>
  <div class="project-images">
    <h2>Project Images</h2>
    <div v-if="projectImages.length > 0">
      <div v-for="(image, index) in projectImages" :key="index" class="image-wrapper">
        <img :src="image" alt="Project Image" />
      </div>
    </div>
    <p v-else>No images available for this project.</p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useStorageStore } from '@/stores/storageStore';
import { useErrorStore } from '@/stores/errorStore';
import { useProjectStore } from '@/stores/projectStore';
import { useRoute } from 'vue-router';

const storageStore = useStorageStore();
const errorStore = useErrorStore();
const projectStore = useProjectStore();
const route = useRoute();
const projectId = route.params.id;

const projectImages = computed(() => storageStore.projectImages);
const uploadedImageUrl = ref('');

onMounted(async () => {
  if (projectId) {
  await storageStore.fetchProjectImages(projectId);
  }
});

// Define props for projectId
const props = defineProps({
  projectId: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(['imageUploaded']);

const handleImageUpload = async (event) => {
  if (props.projectId) {
    const file = event.target.files[0];
    if (!file) {
      errorStore.showError("No file selected.");
      return;
    }

    try {
      // Upload the image and get its URL
      const imageUrl = await storageStore.uploadProjectPhoto(file, props.projectId);
      const updatedImageUrls = [...(projectStore.getProjectById(props.projectId).imageUrls || []), imageUrl];

      // Update the project with the new image URL
      await projectStore.updateProject(props.projectId, { imageUrls: updatedImageUrls });
      uploadedImageUrl.value = imageUrl;
      
      // Emit the imageUploaded event to notify the parent component
      emit('imageUploaded', imageUrl);
    } catch (error) {
      errorStore.showError("Image upload error: " + error.message);
    }
  } else {
    errorStore.showError("Project ID is missing.");
  }
};
</script>

<style scoped>
.image-uploader {
  margin-bottom: 1em;
}

.image-preview img {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin-bottom: 10px;
}

.project-images {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.image-wrapper {
  width: 200px;
  height: 200px;
  overflow: hidden;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.image-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
