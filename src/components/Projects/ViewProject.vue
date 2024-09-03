<template>
    <div v-if="project" class="project-detail-container">
      <button @click="router.back()">Back</button>
      <h1>{{ project.projectName }}</h1>
      <p>Project ID: {{ project.projectId }}</p>
      <div class="project-meta">
        <p><strong>Status:</strong> {{ project.status }}</p>
        <p><strong>Owner:</strong> {{ project.owner }}</p>
        <p><strong>Start Date:</strong> {{ formatDate(project.startDate) }}</p>
        <p v-if="project.endDate"><strong>End Date:</strong> {{ formatDate(project.endDate) }}</p>
      </div>
  
      <!-- Image Upload Section -->
      <section class="project-section">
        <h2>Project Images</h2>
        <ProjectFileUploader :projectId="project.projectId" @imageUploaded="handleImageUpload" />
        <!-- <div v-if="project.imageUrls && project.imageUrls.length">
          <h3>Uploaded Images</h3>
          <div v-for="url in project.imageUrls" :key="url" class="uploaded-image">
            <img :src="url" alt="Project Image" />
          </div>
        </div> -->
      </section>
  
      <!-- Tasks Section with Toggle -->
      <section class="project-section">
        <div class="section-header">
          <h2>Tasks</h2>
          <span class="material-symbols-outlined" @click="toggleSection('tasksVisible')">
            {{ tasksVisible ? 'expand_less' : 'expand_more' }}
          </span>
        </div>
        <ListTasks v-if="tasksVisible" :projectId="project.projectId" />
      </section>
  
      <!-- Parts Section with Toggle -->
      <section class="project-section">
        <div class="section-header">
          <h2>Parts</h2>
          <span class="material-symbols-outlined" @click="toggleSection('partsVisible')">
            {{ partsVisible ? 'expand_less' : 'expand_more' }}
          </span>
        </div>
        <PartList v-if="partsVisible" :projectId="project.projectId" />
      </section>
  
      <!-- Costs Section with Toggle -->
      <section class="project-section">
        <div class="section-header">
          <h2>Costs</h2>
          <span class="material-symbols-outlined" @click="toggleSection('costsVisible')">
            {{ costsVisible ? 'expand_less' : 'expand_more' }}
          </span>
        </div>
        <CostList v-if="costsVisible" :projectId="project.projectId" />
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
  import ListTasks from '@/components/Tasks/ListTasks.vue';
  import PartList from '@/components/Parts/ListParts.vue';
  import CostList from '@/components/Costs/ListCosts.vue';
  import ProjectFileUploader from './ProjectFileUploader.vue';
  import { useErrorStore } from '@/stores/errorStore';
  
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
  
  .project-section+.project-section {
    margin-top: 40px;
  }
  
  .uploaded-image img {
    max-width: 100px;
    height: auto;
    border-radius: 8px;
    margin: 5px;
  }
  </style>
  