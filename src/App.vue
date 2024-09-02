<script setup>
import { useErrorStore } from './stores/errorStore';
import { useUserStore } from './stores/userStore';
import navBar from '@/components/navBar.vue'
import { onMounted } from 'vue';

const errorStore = useErrorStore();
const userStore = useUserStore();

onMounted(() => {
  userStore.setUpAuthListener();
});

</script>

<template>
  <div class="systemError" v-if="errorStore.errorVisible">{{ errorStore.errorMessage }}</div>
  <navBar />
</template>

<style scoped>
.systemError {
  background-color: red;
  color: white;
  font-weight: bold;
}
</style>
