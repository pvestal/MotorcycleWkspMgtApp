<template>
  <div>
    <h2>Edit Project</h2>
    <ProjectForm :project="project" @save="handleSave" />
    <ProjectFileUploader projectId="formData.projectId" @imageUploaded="handleImageUpload" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useProjectStore } from '@/stores/projectStore';
import { useTaskStore } from '@/stores/taskStore';
import ProjectForm from './ProjectForm.vue';
import ProjectFileUploader from './ProjectFileUploader.vue';

const route = useRoute();
const projectStore = useProjectStore();
const taskStore = useTaskStore();

const project = ref(null);
const tasks = ref([]);

onMounted(async () => {
  const projectId = route.params.id;
  project.value = await projectStore.getProjectById(projectId);
  tasks.value = await taskStore.fetchTasksByProjectId(projectId);
});

const handleSave = async (updatedProject) => {
  await projectStore.updateProject(route.params.id, updatedProject);
};

const handleImageUpload = (imageUrl) => {
  formData.value.imageUrl = imageUrl;
};
</script>
