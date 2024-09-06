<template>
  <div v-if="project" class="project-detail-container">
    <button @click="router.back()">Back</button>
    <button @click="navigateToEdit(route.params.id)">Edit</button>

    <!-- Project Name and Meta Data -->
    <h1 v-if="project.projectName">{{ project.projectName }}</h1>
    <p>Project ID: {{ project.projectId }}</p>
    <div class="project-meta">
      <p><strong>Status:</strong> {{ project.status }}</p>
      <p><strong>Owner:</strong> {{ project.owner }}</p>
      <p><strong>Start Date:</strong> {{ formatDate(project.startDate) }}</p>
      <p v-if="project.endDate"><strong>End Date:</strong> {{ formatDate(project.endDate) }}</p>
    </div>

    <!-- Updated Project Images Section -->
    <section class="project-section">
      <div class="section-header">
        <h2>Project Images</h2>
        <span class="material-symbols-outlined" @click="toggleSection('imagesVisible')">
          {{ imagesVisible ? 'expand_less' : 'expand_more' }}
        </span>
      </div>

      <div v-if="imagesVisible" class="project-images">
        <h2>Uploaded Images</h2>
        <div v-if="project.imageUrls && project.imageUrls.length" class="image-gallery">
          <div v-for="(imageData, index) in project.imageUrls" :key="index" class="image-wrapper">
            <img :src="imageData.url"
                 :alt="`${imageData.fileName} - Uploaded on ${new Date(imageData.uploadDate).toLocaleDateString()}`"
                 class="uploaded-image"/>
            <button v-if="imageData.url" @click="handleDeleteImage(imageData.url)" class="delete-button">
              Delete
            </button>
          </div>
        </div>

        <!-- Project File Uploader -->
        <ProjectFileUploader :projectId="projectId" @imageUploaded="handleImageUpload" />
      </div>
    </section>

    <!-- Tasks Section -->
    <section class="project-section">
      <div class="section-header">
        <h2>Tasks</h2>
        <span class="material-symbols-outlined" @click="toggleSection('tasksVisible')">
          {{ tasksVisible ? 'expand_less' : 'expand_more' }}
        </span>
      </div>
      <ListTasks v-if="tasksVisible" :projectId="projectId" :projectName="project.projectName" />
    </section>

    <!-- Parts Section -->
    <section class="project-section">
      <div class="section-header">
        <h2>Parts</h2>
        <span class="material-symbols-outlined" @click="toggleSection('partsVisible')">
          {{ partsVisible ? 'expand_less' : 'expand_more' }}
        </span>
      </div>
      <PartList v-if="partsVisible" :projectId="projectId" />
    </section>

    <!-- Costs Section -->
    <section class="project-section">
      <div class="section-header">
        <h2>Costs</h2>
        <span class="material-symbols-outlined" @click="toggleSection('costsVisible')">
          {{ costsVisible ? 'expand_less' : 'expand_more' }}
        </span>
      </div>
      <CostList v-if="costsVisible" :projectId="projectId" />
    </section>
  </div>

  <div v-else>
    <p>Loading project details...</p>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useProjectStore } from '@/stores/projectStore';
import { useErrorStore } from '@/stores/errorStore';

import ListTasks from '@/components/Tasks/ListTasks.vue';
import PartList from '@/components/Parts/ListParts.vue';
import CostList from '@/components/Costs/ListCosts.vue';
import ProjectFileUploader from './ProjectFileUploader.vue';

const route = useRoute();
const router = useRouter();
const projectStore = useProjectStore();
const errorStore = useErrorStore();

const projectId = ref(route.params.id);
const project = ref(null);

// Section visibility states
const tasksVisible = ref(false);
const partsVisible = ref(false);
const costsVisible = ref(false);
const imagesVisible = ref(true); // Project images section visibility

onMounted(async () => {
  if (projectId.value) {
    await projectStore.fetchProjects();
    project.value = projectStore.getProjectById(projectId.value);
  }

  if (!project.value) {
    errorStore.showError("Project not found");
    router.push('/projects');
  }
});

// Watch for changes in route params and fetch project data
watch(
  () => route.params.id,
  async (newId) => {
    if (newId) {
      projectId.value = newId;
      project.value = projectStore.getProjectById(projectId.value);

      if (!project.value) {
        await projectStore.fetchProjects();
        project.value = projectStore.getProjectById(projectId.value);
      }

      if (!project.value) {
        errorStore.showError("Project not found");
        router.push('/projects');
      }
    }
  },
  { immediate: true }
);

const navigateToEdit = (id) => router.push(`/editProject/${id}`);

// Function to toggle section visibility
const toggleSection = (section) => {
  switch (section) {
    case 'tasksVisible':
      tasksVisible.value = !tasksVisible.value;

      break;
    case 'partsVisible':
      partsVisible.value = !partsVisible.value;
      break;
    case 'costsVisible':
      costsVisible.value = !costsVisible.value;
      break;
    case 'imagesVisible':
      imagesVisible.value = !imagesVisible.value;
      break;
  }
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString();
};

const handleImageUpload = async (imageUrl) => {
  try {
    const updatedImageUrls = [...(project.value.imageUrls || []), imageUrl];
    await projectStore.updateProject(projectId.value, { imageUrls: updatedImageUrls });
    project.value.imageUrls = updatedImageUrls;
  } catch (error) {
    errorStore.showError("Failed to update project with new image URL.");
  }
};
</script>


<style scoped>
.project-detail-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f5f5f5;
  border-radius: 8px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
}

.project-detail-container h1 {
  font-size: 2em;
  margin-bottom: 16px;
  color: #333;
}

.project-meta p {
  margin-bottom: 8px;
  font-size: 1.2em;
}

.project-section {
  margin-top: 20px;
  padding: 20px;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.material-symbols-outlined {
  cursor: pointer;
  font-size: 24px;
  color: #007bff;
}

.material-symbols-outlined:hover {
  color: #0056b3;
}

.image-gallery {
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
