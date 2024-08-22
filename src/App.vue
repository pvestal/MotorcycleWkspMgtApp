<script setup>
import { useErrorStore } from './stores/errorStore';
import navBar from '@/components/navBar.vue'

const errorStore = useErrorStore();

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
