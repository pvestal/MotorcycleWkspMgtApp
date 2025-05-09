<template>
  <div class="subscription-view">
    <SubscriptionManager />
  </div>
</template>

<script setup>
import SubscriptionManager from '@/components/Users/SubscriptionManager.vue';
</script>

<style scoped>
.subscription-view {
  padding: 0 20px;
  max-width: 100vw;
  overflow-x: hidden;
}
</style>