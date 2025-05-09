<template>
  <div class="cost-detail-container max-w-4xl mx-auto p-6">
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Loading cost details...</p>
    </div>

    <div v-else-if="!cost" class="not-found">
      <div class="not-found-icon">❓</div>
      <h3>Cost Not Found</h3>
      <p>The requested cost could not be found or you don't have permission to view it.</p>
      <button class="btn primary" @click="goBack">Go Back</button>
    </div>

    <div v-else>
      <!-- Header with back button -->
      <div class="header-actions mb-6 flex justify-between items-center">
        <button @click="goBack" class="btn secondary flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
          </svg>
          Back
        </button>
        <button 
          @click="navigateToEdit" 
          class="btn primary flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
          Edit
        </button>
      </div>

      <!-- Cost content card -->
      <div class="cost-content bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
        <!-- Cost header -->
        <div class="cost-header p-6 bg-green-50 dark:bg-green-900 border-b border-green-100 dark:border-green-800">
          <h1 class="text-2xl font-bold text-gray-800 dark:text-white">
            ${{ formatCurrency(cost.amount) }}
          </h1>
          <div class="text-lg text-gray-600 dark:text-gray-300 mt-1">
            {{ cost.description }}
          </div>
          <div class="flex flex-wrap gap-2 mt-2">
            <span 
              :class="{
                'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100': cost.category === 'Parts',
                'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100': cost.category === 'Labor',
                'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100': cost.category === 'Tools',
                'bg-teal-100 text-teal-800 dark:bg-teal-800 dark:text-teal-100': cost.category === 'Other'
              }"
              class="category-badge px-3 py-1 rounded-full text-sm font-medium"
            >
              {{ cost.category }}
            </span>
            <span class="date-badge bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 px-3 py-1 rounded-full text-sm font-medium">
              {{ formatDate(cost.date) }}
            </span>
          </div>
        </div>

        <!-- Cost details -->
        <div class="cost-details p-6">
          <!-- Basic cost info -->
          <div class="detail-section mb-6">
            <h2 class="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
              Cost Information
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="detail-item">
                <div class="detail-label text-sm text-gray-500 dark:text-gray-400">Cost ID</div>
                <div class="detail-value font-medium">{{ cost.id }}</div>
              </div>

              <div v-if="cost.vendor" class="detail-item">
                <div class="detail-label text-sm text-gray-500 dark:text-gray-400">Vendor</div>
                <div class="detail-value font-medium">{{ cost.vendor }}</div>
              </div>

              <div v-if="cost.receiptNumber" class="detail-item">
                <div class="detail-label text-sm text-gray-500 dark:text-gray-400">Receipt Number</div>
                <div class="detail-value font-medium">{{ cost.receiptNumber }}</div>
              </div>

              <div v-if="cost.paymentMethod" class="detail-item">
                <div class="detail-label text-sm text-gray-500 dark:text-gray-400">Payment Method</div>
                <div class="detail-value font-medium">{{ cost.paymentMethod }}</div>
              </div>

              <div v-if="cost.createdAt" class="detail-item">
                <div class="detail-label text-sm text-gray-500 dark:text-gray-400">Added on</div>
                <div class="detail-value font-medium">{{ formatDate(cost.createdAt) }}</div>
              </div>

              <div v-if="cost.updatedAt" class="detail-item">
                <div class="detail-label text-sm text-gray-500 dark:text-gray-400">Last Updated</div>
                <div class="detail-value font-medium">{{ formatDate(cost.updatedAt) }}</div>
              </div>
            </div>
          </div>

          <!-- Cost notes -->
          <div v-if="cost.notes" class="notes-section mb-6">
            <h2 class="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
              Notes
            </h2>
            <div class="notes-content text-gray-700 dark:text-gray-300 whitespace-pre-line">
              {{ cost.notes }}
            </div>
          </div>

          <!-- Related project information -->
          <div v-if="cost.projectId" class="related-section">
            <h2 class="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
              Related Project
            </h2>
            <div class="related-project-link mb-2">
              <router-link 
                :to="`/viewProject/${cost.projectId}`" 
                class="text-blue-600 dark:text-blue-400 hover:underline font-medium inline-flex items-center gap-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                </svg>
                View related project
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCostStore } from '@/stores/costStore';
import { useErrorStore } from '@/stores/errorStore';

const route = useRoute();
const router = useRouter();
const costStore = useCostStore();
const errorStore = useErrorStore();
const cost = ref(null);
const loading = ref(true);

onMounted(async () => {
  try {
    const costId = route.params.id;
    
    // Check if costs is populated, if not fetch them
    if (costStore.costs.length === 0) {
      await costStore.fetchCosts();
    }
    
    cost.value = costStore.costs.find(i => i.id === costId);
    
    if (!cost.value) {
      errorStore.showError("Unable to find cost by Id.");
    }
  } catch (err) {
    errorStore.showError("Error loading cost: " + err.message);
  } finally {
    loading.value = false;
  }
});

const formatDate = (timestamp) => {
  if (!timestamp) return 'N/A';
  
  // Handle Firebase timestamp objects
  if (timestamp.toDate) {
    timestamp = timestamp.toDate();
  } else if (typeof timestamp === 'string') {
    timestamp = new Date(timestamp);
  }
  
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(timestamp);
};

const formatCurrency = (value) => {
  if (value === undefined || value === null) return '0.00';
  return parseFloat(value).toFixed(2);
};

const navigateToEdit = () => {
  router.push(`/editCost/${cost.value.id}`);
};

const goBack = () => {
  if (cost.value?.projectId) {
    router.push(`/viewProject/${cost.value.projectId}`);
  } else {
    router.push('/costs');
  }
};
</script>

<style scoped>
.cost-detail-container {
  width: 100%;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: #4f46e5;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.not-found {
  text-align: center;
  padding: 60px 20px;
}

.not-found-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.not-found h3 {
  margin-bottom: 8px;
  font-size: 24px;
}

.not-found p {
  margin-bottom: 24px;
  color: #6b7280;
}

.detail-item {
  margin-bottom: 16px;
}

.detail-label {
  margin-bottom: 4px;
}

.btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.btn.primary {
  background-color: #4f46e5;
  color: white;
}

.btn.primary:hover {
  background-color: #4338ca;
}

.btn.secondary {
  background-color: #f3f4f6;
  color: #374151;
}

.btn.secondary:hover {
  background-color: #e5e7eb;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .btn.secondary {
    background-color: #374151;
    color: #f3f4f6;
  }

  .btn.secondary:hover {
    background-color: #4b5563;
  }
}
</style>