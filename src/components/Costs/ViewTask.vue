<template>
    <div>
      <h2>Todo Details</h2>
      <p><strong>Title:</strong> {{ item?.itemTitle }}</p>
      <p><strong>Priority:</strong> {{ item?.priority }}</p>
      <p><strong>Status:</strong> {{ item?.status }}</p>
      <button @click="goBack">Back</button>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { usetaskStore } from '@/stores/taskStore';
  import { useErrorStore } from '@/stores/errorStore';
  
  const route = useRoute();
  const router = useRouter();
  const taskStore = usetaskStore();
  const errorStore = useErrorStore();
  const item = ref(null);
  
  onMounted(() => {
    const itemId = route.params.id;
    item.value = taskStore.items.find(i => i.id === itemId);
    if (!item.value) {
      errorStore.showError("err finding item by Id.")
    }
  });
  
  const goBack = () => {
    router.push('/tasks');
  };
  </script>
  