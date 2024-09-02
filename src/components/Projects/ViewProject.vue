<template>
  <div class="project-detail-container">
    <h1>{{ project.projectName }}</h1>
    <div class="project-meta">
      <p><strong>Status:</strong> {{ project.status }}</p>
      <p><strong>Owner:</strong> {{ project.owner }}</p>
      <p><strong>Start Date:</strong> {{ formatDate(project.startDate) }}</p>
      <p v-if="project.endDate"><strong>End Date:</strong> {{ formatDate(project.endDate) }}</p>
    </div>

    <!-- Tasks Section with Toggle -->
    <section class="project-section">
      <div class="section-header">
        <h2>Tasks</h2>
        <span class="material-symbols-outlined" @click="toggleSection('tasksVisible')">
          {{ tasksVisible ? 'expand_less' : 'expand_more' }}
        </span>
      </div>
      <ListTasks v-if="tasksVisible" :projectId="route.params.id" />
    </section>

    <!-- Parts Section with Toggle -->
    <section class="project-section">
      <div class="section-header">
        <h2>Parts</h2>
        <span class="material-symbols-outlined" @click="toggleSection('partsVisible')">
          {{ partsVisible ? 'expand_less' : 'expand_more' }}
        </span>
      </div>
      <PartList v-if="partsVisible" :projectId="route.params.id" />
    </section>

    <!-- Costs Section with Toggle -->
    <section class="project-section">
      <div class="section-header">
        <h2>Costs</h2>
        <span class="material-symbols-outlined" @click="toggleSection('costsVisible')">
          {{ costsVisible ? 'expand_less' : 'expand_more' }}
        </span>
      </div>
      <CostList v-if="costsVisible" :projectId="route.params.id" />
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useProjectStore } from '@/stores/projectStore';
import ListTasks from '@/components/Tasks/ListTasks.vue';
import PartList from '@/components/Parts/ListParts.vue';
import CostList from '@/components/Costs/ListCosts.vue';

const route = useRoute();
const projectStore = useProjectStore();
const projectId = ref(route.params.id);
const project = ref({});

// Section visibility states
const tasksVisible = ref(true);
const partsVisible = ref(true);
const costsVisible = ref(true);

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
  await projectStore.fetchProjects();
  project.value = projectStore.getProjectById(projectId.value);
});

const formatDate = (date) => {
  return new Date(date).toLocaleDateString();
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

.project-section + .project-section {
  margin-top: 40px;
}
</style>
