<template>
    <div>
      <h2>PBR:</h2>
      <p><strong>Points:</strong> {{ points }}</p>
      <p><strong>Badges:</strong></p>
      <ul>
        <li v-for="badge in badges" :key="badge">{{ badge }}</li>
      </ul>
      <p><strong>Role:</strong> {{ role }}</p>
    </div>
  </template>
  
  <script setup>
  import { useContributionStore } from '@/stores/contributionStore';
  import { useUserStore } from '@/stores/userStore';
  
  const contributionStore = useContributionStore();
  const userStore = useUserStore();
  
  const { points, badges, role } = contributionStore;
  
  const fetchData = async () => {
    await contributionStore.fetchUserContributions(userStore.currentUser.uid);
  };
  
  fetchData();
  </script>
  