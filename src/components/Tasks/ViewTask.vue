<template>
    <div>
      <h2>Task Details</h2>
      <p><strong>Title:</strong> {{ task?.taskTitle }}</p>
      <p><strong>Priority:</strong> {{ task?.priority }}</p>
      <p><strong>Status:</strong> {{ task?.status }}</p>
      <p><strong>NbrHrs: {{ task?.nbrHrs }}</strong></p>
      <button @click="goBack">Back</button>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { useTaskStore } from '@/stores/taskStore';
  import { useErrorStore } from '@/stores/errorStore';
  
  const route = useRoute();
  const router = useRouter();
  const taskStore = useTaskStore();
  const errorStore = useErrorStore();
  const task = ref(null);
  
  
  onMounted(() => {
    const taskId = route.params.id;
    task.value = taskStore.tasks.find(i => i.id === taskId);
    if (!task.value) {
      errorStore.showError("err finding task by Id.")
    }
  });
  
  const goBack = () => {
    router.push('/tasks');
  };
  </script>
  