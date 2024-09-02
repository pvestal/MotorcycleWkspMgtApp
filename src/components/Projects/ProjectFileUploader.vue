<template>
  <div class="image-uploader">
    <div v-if="uploadedImageUrl" class="image-preview">
      <img :src="uploadedImageUrl" alt="Project Image" />
    </div>
    <input type="file" @change="handleImageUpload" />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useStorageStore } from '@/stores/storageStore';
import { useErrorStore } from '@/stores/errorStore';

const storageStore = useStorageStore();
const errorStore = useErrorStore();

const props = defineProps({
  project: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(['imageUploaded']);

const uploadedImageUrl = ref('');

const handleImageUpload = async (event) => {
  const file = event.target.files[0];
  if (file) {
    try {
      const imageUrl = await storageStore.uploadProjectPhoto({
        project: props.project,
        image: file,
      });
      uploadedImageUrl.value = imageUrl;
      emit('imageUploaded', imageUrl); // Emit the image URL back to the parent component
    } catch (error) {
      errorStore.showError('An error occurred while uploading the image:', error);
    }
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
</style>
