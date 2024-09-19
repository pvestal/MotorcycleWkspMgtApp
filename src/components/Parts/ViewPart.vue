<template>
    <div>
      <h2>Part Details:</h2>
      <p v-if="projectId"><strong>ProjectId: {{ projectId }}</strong></p>
      <p><strong>Name:</strong> {{ part?.partName }}</p>
      <p><strong>Priority:</strong> {{ part?.partPriority }}</p>
      <p><strong>Status:</strong> {{ part?.partStatus }}</p>
      <button @click="goBack">Back</button>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { usePartStore } from '@/stores/partStore';
  import { useErrorStore } from '@/stores/errorStore';
  
  const route = useRoute();
  const router = useRouter();
  const partStore = usePartStore();
  const errorStore = useErrorStore();
  const part = ref(null);
  
  onMounted(() => {
    const partId = route.params.id;
    part.value = partStore.parts.find(i => i.id === partId);
    if (!part.value) {
      errorStore.showError("err finding part by Id.")
    }
  });
  
  const goBack = () => {
    router.push('/projects');
  };
  </script>
  