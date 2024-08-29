<template>
  <div class="project-detail-container">
    <h1>{{ project.projectName }}</h1>
    <div class="project-meta">
      <p><strong>Status:</strong> {{ project.status }}</p>
      <p><strong>Owner:</strong> {{ project.owner }}</p>
      <p><strong>Start Date:</strong> {{ formatDate(project.startDate) }}</p>
      <p v-if="project.endDate"><strong>End Date:</strong> {{ formatDate(project.endDate) }}</p>
      <p><strong>Notes:</strong> {{ project.notes }}</p>
    </div>

    <section class="project-section">
      <ListTasks :projectId="projectId" />
    </section>

    <section class="project-section">
      <p>Parts</p>
      <!-- <PartList :projectId="projectId" /> -->
    </section>

    <!-- Optional Time Tracking Section -->
    <section class="project-section">
      <p>Time</p>
      <!-- <TimeEntryList :projectId="projectId" /> -->
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useProjectStore } from '@/stores/projectStore';
import ListTasks from '@/components/Tasks/ListTasks.vue';
// import PartList from '@/components/PartList.vue';
// import TimeEntryList from '@/components/TimeEntryList.vue'; 

const route = useRoute();
const projectStore = useProjectStore();
const projectId = ref(route.params.id);
const project = ref({});

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

.project-section + .project-section {
  margin-top: 40px;
}
</style>

  
  <!-- <script setup>
  import { ref, onMounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { useProjectStore } from '../../stores/projectStore';
  import { useErrorStore } from '../../stores/errorStore';
  
  const route = useRoute();
  const router = useRouter();
  const projectStore = useProjectStore();
  const errorStore = useErrorStore();
  const project = ref(null);
  
  onMounted(() => {
    const ProjectId = route.params.id;
    project.value = projectStore.projects.find(i => i.id === ProjectId);
    if (!project.value) {
      errorStore.showError("err finding project by Id.")
    }
  });
  
  const goBack = () => {
    router.push('/projects');
  };
  </script>
   -->