<template>
  <div>
    <h2>Costs for Project {{ projectId }}</h2>
    <div v-if="costStore.loading">Loading...</div>
    <div v-else>
      <ul>
        <li v-for="cost in costs" :key="cost.id">
          {{ cost.description }}: ${{ cost.amount }}
        </li>
      </ul>
      <p>Total Costs: ${{ totalCosts }}</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue';
import { useCostStore } from '@/stores/costStore';

const projectId = 'your-project-id'; // Replace with actual projectId
const costStore = useCostStore();

onMounted(async () => {
  await costStore.fetchCostsByProject(projectId);
});

const costs = computed(() => costStore.getCostsByProjectId(projectId));
const totalCosts = computed(() => costStore.totalCostsByProjectId(projectId));
</script>


<style scoped>
/* Toggle Button Styles */
.btn-toggle {
  display: block;
  margin: 20px auto;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  background-color: #007bff;
  color: white;
  cursor: pointer;
  text-align: center;
}

.btn-toggle:hover {
  background-color: #0056b3;
}

/* Form Styles */
.form-container {
  max-width: 500px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: #f9f9f9;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  font-family: 'Arial', sans-serif;
}

.form-title {
  text-align: center;
  font-size: 24px;
  margin-bottom: 20px;
  color: #333;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #555;
}

.form-control {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: #fff;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
}

.form-actions {
  display: flex;
  justify-content: space-between;
}

.btn-submit,
.btn-cancel {
  width: 48%;
  padding: 12px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  text-align: center;
}

.btn-submit {
  background-color: #007bff;
  color: white;
}

.btn-submit:hover {
  background-color: #0056b3;
}

.btn-cancel {
  background-color: #ccc;
  color: #333;
}

.btn-cancel:hover {
  background-color: #999;
}

/* Mobile-specific styles */
@media (max-width: 600px) {
  .form-container {
    padding: 15px;
  }

  .form-title {
    font-size: 20px;
  }

  .form-group {
    margin-bottom: 12px;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn-submit,
  .btn-cancel {
    width: 100%;
    margin-bottom: 10px;
  }

  .btn-submit {
    margin-bottom: 0;
  }
}
</style>
