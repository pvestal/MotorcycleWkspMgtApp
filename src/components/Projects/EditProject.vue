<template>
  <div v-if="project">
    <ProjectForm :projectId="route.params.id" @updateProject="handleSave" />

    <!-- Project File Uploader to upload images, pass projectId as a prop -->
    <ProjectFileUploader :project="project" @imageUploaded="handleImageUpload" />

  </div>
  <div v-else>No project connected to edit.</div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useProjectStore } from '@/stores/projectStore';
import { useErrorStore } from '@/stores/errorStore';
import { useStorageStore } from '@/stores/storageStore';
import ProjectForm from './ProjectForm.vue';
import ProjectFileUploader from './ProjectFileUploader.vue';

const route = useRoute();
const projectStore = useProjectStore();
const errorStore = useErrorStore();
const storageStore = useStorageStore();

// Reactive reference to the project
const project = ref(null);

onMounted(async () => {
  const projectId = route.params.id;
  // Fetch project data by ID and store it in `project`
  project.value = await projectStore.getProjectById(projectId);
  if(!project.value) {
    errorStore.showError("project not detected onMounted.")
  }
});

// Handle project save event
const handleSave = async (updatedProject) => {
  await projectStore.updateProject(route.params.id, updatedProject);
};

// Handle image upload event to update the project's image URLs
const handleImageUpload = async (imageUrl) => {
  if (project.value) {
    project.value.imageUrls = [...(project.value.imageUrls || []), imageUrl];
    await projectStore.updateProject(route.params.id, { imageUrls: project.value.imageUrls });
  }
};

const handleDeleteImage = async (imageUrl) => {
  console.log('Attempting to delete image:', imageUrl); // Debugging log

  if (typeof imageUrl === 'string') {
    try {
      // Call delete method only if imageUrl is a valid string
      await storageStore.deleteProjectImage(imageUrl, project.value.projectId);

      // Remove only the deleted image from the imageUrls array
      project.value.imageUrls = project.value.imageUrls.filter(url => url !== imageUrl);

      // Update Firestore to save the changes (only the updated array without the deleted image)
      await projectStore.updateProject(route.params.id, { imageUrls: project.value.imageUrls });
    } catch (error) {
      console.error('Failed to delete image:', error.message);
    }
  } else {
    console.error('Invalid imageUrl:', imageUrl);
  }
};



</script>

<style scoped>
.project-images {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.image-wrapper {
  position: relative;
  width: 200px;
  height: 200px;
  overflow: hidden;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.uploaded-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.delete-button {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 5px 10px;
  background-color: #ff4d4d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.delete-button:hover {
  background-color: #d80000;
}
</style>
