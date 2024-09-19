<template>
  <div v-if="project">
    <!-- Main Project Form Section -->
    <section class="project-section">
      <div class="section-header">
        <h2>Project Details</h2>
        <span class="material-symbols-outlined" @click="toggleSection('mainVisible')">
          {{ mainVisible ? 'expand_less' : 'expand_more' }}
        </span>
      </div>
      <div v-if="mainVisible">
        <ProjectForm
          :projectId="route.params.id"
          :projectName="project.projectName"
          :isEditing="true"
          :formData="project"
          @handleProjectSave="handleProjectSave"
          @cancelEdit="cancelEdit"
        />
      </div>
    </section>

    <!-- Images Section -->
    <section class="project-section">
      <div class="section-header">
        <h2>Images</h2>
        <span class="material-symbols-outlined" @click="toggleSection('imagesVisible')">
          {{ imagesVisible ? 'expand_less' : 'expand_more' }}
        </span>
      </div>
        <!-- Optionally, enable the uploader -->
        <ProjectFileUploader v-if="project" :projectId="route.params.id" @imageUploaded="handleImageUpload" />
      <div v-if="imagesVisible" class="project-images">
        <div v-if="project.imageUrls" class="image-gallery">
          <div v-for="(imageUrl, index) in project.imageUrls" :key="index" class="image-wrapper">
            <img :src="imageUrl.url" alt="imageUrl.?fileName" class="uploaded-image" />
            <button @click="handleDeleteImage(imageUrl)" class="delete-button">Delete</button>
          </div>
        </div>
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
          <!-- Add Task Button -->
          <button @click="navigateToAddTask" class="add-button">Add Task</button>
      <ListTasks v-if="tasksVisible" :projectId="route.params.id" :projectName="project.projectName" />
    </section>

    <!-- Parts Section -->
    <section class="project-section">
      <div class="section-header">
        <h2>Parts</h2>
        <span class="material-symbols-outlined" @click="toggleSection('partsVisible')">
          {{ partsVisible ? 'expand_less' : 'expand_more' }}
        </span>
      </div>
          <!-- Add Part Button -->
    <button @click="navigateToAddPart" class="add-button">Add Part</button>
      <ListParts v-if="partsVisible" :projectId="route.params.id" />
    </section>

    <!-- Costs Section -->
    <section class="project-section">
      <div class="section-header">
        <h2>Costs</h2>
        <span class="material-symbols-outlined" @click="toggleSection('costsVisible')">
          {{ costsVisible ? 'expand_less' : 'expand_more' }}
        </span>
      </div>
            <!-- Add Cost Button -->
            <button @click="navigateToAddCost" class="add-button">Add Cost</button>
      <ListCosts v-if="costsVisible" :projectId="route.params.id" />
    </section>
  </div>
  
  <div v-else>
    <p>Loading project data...</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useProjectStore } from '@/stores/projectStore';
import { useErrorStore } from '@/stores/errorStore';
import { useStorageStore } from '@/stores/storageStore';

import ListTasks from '@/components/Tasks/ListTasks.vue';
import ListParts from '@/components/Parts/ListParts.vue';
import ListCosts from '@/components/Costs/ListCosts.vue';
import ProjectForm from './ProjectForm.vue';
import ProjectFileUploader from './ProjectFileUploader.vue';

const route = useRoute();
const projectStore = useProjectStore();
const errorStore = useErrorStore();
const storageStore = useStorageStore();

// Reactive reference to the project
const project = ref(null);

// Section visibility states
const mainVisible = ref(true);
const imagesVisible = ref(false);
const tasksVisible = ref(false);
const partsVisible = ref(false);
const costsVisible = ref(false);

// Toggle section visibility
const toggleSection = (section) => {
  switch (section) {
    case 'mainVisible':
      mainVisible.value = !mainVisible.value;
      break;
    case 'imagesVisible':
      imagesVisible.value = !imagesVisible.value;
      break;
    case 'tasksVisible':
      tasksVisible.value = !tasksVisible.value;
      break;
    case 'partsVisible':
      partsVisible.value = !partsVisible.value;
      break;
    case 'costsVisible':
      costsVisible.value = !costsVisible.value;
      break;
  }
};

onMounted(async () => {
  const projectId = route.params.id;
  try {
    // Fetch project data by ID and store it in `project`
    project.value = await projectStore.getProjectById(projectId);
    if (!project.value) {
      throw new Error("Project not found");
    }
  } catch (error) {
    errorStore.showError("Error fetching project data: " + error.message);
  }
});

// Handle project save event
const handleProjectSave = async (updatedProject) => {
  try {
    await projectStore.updateProject(route.params.id, updatedProject);
  } catch (error) {
    errorStore.showError("Error saving project: " + error.message);
  }
};

// Handle image upload event to update the project's image URLs
const handleImageUpload = async (imageUrl) => {
  if (project.value) {
    project.value.imageUrls = [...(project.value.imageUrls || []), imageUrl];
    await projectStore.updateProject(route.params.id, { imageUrls: project.value.imageUrls });
  }
};

// Handle image deletion
const handleDeleteImage = async (imageUrl) => {
  if (typeof imageUrl === 'string') {
    try {
      await storageStore.deleteProjectImage(imageUrl, project.value.projectId);
      project.value.imageUrls = project.value.imageUrls.filter(url => url !== imageUrl);
      await projectStore.updateProject(route.params.id, { imageUrls: project.value.imageUrls });
    } catch (error) {
      console.error('Failed to delete image:', error.message);
    }
  } else {
    console.error('Invalid imageUrl:', imageUrl);
  }
};

// Handle cancel action from form (implement if needed)
const cancelEdit = () => {
  return;
};
</script>


<style scoped>
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

.add-button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 8px 12px;
  margin-bottom: 16px;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
}

.add-button:hover {
  background-color: #0056b3;
}

</style>
