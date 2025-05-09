<template>
  <div class="part-details-page">
    <div class="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <PartDetailsView 
        :partId="partId"
        :projectId="projectId"
        :vehicle="vehicle"
        @part-added="onPartAdded"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import PartDetailsView from '@/components/Parts/PartDetailsView.vue';

// Initialize router
const route = useRoute();
const router = useRouter();

// Part ID from route
const partId = computed(() => route.params.id);

// Project ID from query
const projectId = computed(() => route.query.projectId || null);

// Vehicle data from localStorage
const vehicle = ref({
  year: '',
  make: '',
  model: '',
  trim: ''
});

// Event handlers
const onPartAdded = ({ partId, projectId }) => {
  // Navigate to the project view
  router.push({
    path: `/viewProject/${projectId}`,
    query: { 
      addedPart: partId
    }
  });
};

// Try to load vehicle data from localStorage
const loadVehicleData = () => {
  try {
    const savedVehicle = localStorage.getItem('selectedVehicle');
    if (savedVehicle) {
      vehicle.value = JSON.parse(savedVehicle);
    }
  } catch (e) {
    console.warn('Could not load vehicle data from localStorage', e);
  }
};

// On component mount
onMounted(() => {
  // Load vehicle data from localStorage
  loadVehicleData();
});
</script>

<style scoped>
.part-details-page {
  padding-bottom: 2rem;
}
</style>