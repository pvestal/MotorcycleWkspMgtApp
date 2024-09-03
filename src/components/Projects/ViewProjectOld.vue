<template>
  <button @click="route.back">Back</button>
  <!-- <div v-if="projectId" class="project-detail-container">
    <h1>{{ project.projectName }} : {{ projectId }}</h1>
    <div class="project-meta">
      <p><strong>Status:</strong> {{ project.status }}</p>
      <p><strong>Owner:</strong> {{ project.owner }}</p>
      <p><strong>Start Date:</strong> {{ formatDate(project.startDate) }}</p>
      <p v-if="project.endDate"><strong>End Date:</strong> {{ formatDate(project.endDate) }}</p>
    </div> -->

    <!--Image Upload Section-->
    <section class="project-section">
      <h2>Project Images</h2>
      <ProjectFileUploader :projectId="projectId" @imageUploaded="handleImageUpload"/>
    </section>

    <!-- Tasks Section with Toggle -->
    <!-- <section class="project-section">
      <div class="section-header">
        <h2>Tasks</h2>
        <span class="material-symbols-outlined" @click="toggleSection('tasksVisible')">
          {{ tasksVisible ? 'expand_less' : 'expand_more' }}
        </span>
      </div>
      <ListTasks v-if="tasksVisible" :projectId="projectId" />
    </section> -->

    <!-- Parts Section with Toggle -->
    <!-- <section class="project-section">
      <div class="section-header">
        <h2>Parts</h2>
        <span class="material-symbols-outlined" @click="toggleSection('partsVisible')">
          {{ partsVisible ? 'expand_less' : 'expand_more' }}
        </span>
      </div>
      <PartList v-if="partsVisible" :projectId="projectId" />
    </section> -->

    <!-- Costs Section with Toggle -->
    <!-- <section class="project-section">
      <div class="section-header">
        <h2>Costs</h2>
        <span class="material-symbols-outlined" @click="toggleSection('costsVisible')">
          {{ costsVisible ? 'expand_less' : 'expand_more' }}
        </span>
      </div>
      <CostList v-if="costsVisible" :projectId="projectId" />
    </section> -->

  <!-- </div> -->
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useProjectStore } from '@/stores/projectStore';
import ListTasks from '@/components/Tasks/ListTasks.vue';
import PartList from '@/components/Parts/ListParts.vue';
import CostList from '@/components/Costs/ListCosts.vue';
import ProjectFileUploader from './ProjectFileUploader.vue';
import { useStorageStore } from '@/stores/storageStore';
import { useErrorStore } from '@/stores/errorStore';

const route = useRouter();
const projectStore = useProjectStore();
const storageStore = useStorageStore();
const errorStore = useErrorStore();
const projectId = route.params.id;
const project = ref(null);

// Section visibility states
const tasksVisible = ref(false);
const partsVisible = ref(false);
const costsVisible = ref(false);

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

onMounted(async () => {
  try {
    await projectStore.fetchProjects();
    const fetchedProject = projectStore.getProjectById(projectId);
    if (fetchedProject) {
      project.value = fetchedProject;
    } else {
      errorStore.showError("Project not found");
      route.push('/projects');
    }
  } catch (error) {
    errorStore.showError("Error fetching project details");
  }
});

const formatDate = (date) => {
  return new Date(date).toLocaleDateString();
};

const handleImageUpload = (async (imageUrl) => {
  if (projectId) {
    storageStore.uploadProjectPhoto(imageUrl)
  } else {
    errorStore.showError("image upload error.")
  }
})

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
</style>
