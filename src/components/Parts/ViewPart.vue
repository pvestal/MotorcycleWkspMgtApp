<template>
  <div class="part-detail-container max-w-4xl mx-auto p-6">
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Loading part details...</p>
    </div>

    <div v-else-if="!part" class="not-found">
      <div class="not-found-icon">❓</div>
      <h3>Part Not Found</h3>
      <p>The requested part could not be found or you don't have permission to view it.</p>
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

      <!-- Part content card -->
      <div class="part-content bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
        <!-- Part header -->
        <div class="part-header p-6 bg-blue-50 dark:bg-blue-900 border-b border-blue-100 dark:border-blue-800">
          <h1 class="text-2xl font-bold text-gray-800 dark:text-white">{{ part.partName }}</h1>
          <div class="flex flex-wrap gap-2 mt-2">
            <span 
              :class="{
                'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100': part.partStatus === 'Ordered',
                'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100': part.partStatus === 'Shipped',
                'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100': part.partStatus === 'BackOrder',
                'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100': part.partStatus === 'Installed'
              }"
              class="status-badge px-3 py-1 rounded-full text-sm font-medium"
            >
              {{ part.partStatus }}
            </span>
            <span 
              :class="{
                'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100': part.partPriority === 'High',
                'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100': part.partPriority === 'Medium',
                'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100': part.partPriority === 'Low'
              }"
              class="priority-badge px-3 py-1 rounded-full text-sm font-medium"
            >
              Priority: {{ part.partPriority }}
            </span>
          </div>
        </div>

        <!-- Part details -->
        <div class="part-details p-6">
          <!-- Basic part info -->
          <div class="detail-section mb-6">
            <h2 class="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
              Part Information
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="detail-item">
                <div class="detail-label text-sm text-gray-500 dark:text-gray-400">Part ID</div>
                <div class="detail-value font-medium">{{ part.id }}</div>
              </div>

              <div v-if="part.partNumber" class="detail-item">
                <div class="detail-label text-sm text-gray-500 dark:text-gray-400">Part Number</div>
                <div class="detail-value font-medium">{{ part.partNumber }}</div>
              </div>

              <div v-if="part.price !== undefined" class="detail-item">
                <div class="detail-label text-sm text-gray-500 dark:text-gray-400">Price</div>
                <div class="detail-value font-medium">${{ formatCurrency(part.price) }}</div>
              </div>

              <div v-if="part.quantity !== undefined" class="detail-item">
                <div class="detail-label text-sm text-gray-500 dark:text-gray-400">Quantity</div>
                <div class="detail-value font-medium">{{ part.quantity }}</div>
              </div>

              <div v-if="part.createdAt" class="detail-item">
                <div class="detail-label text-sm text-gray-500 dark:text-gray-400">Added on</div>
                <div class="detail-value font-medium">{{ formatDate(part.createdAt) }}</div>
              </div>

              <div v-if="part.updatedAt" class="detail-item">
                <div class="detail-label text-sm text-gray-500 dark:text-gray-400">Last Updated</div>
                <div class="detail-value font-medium">{{ formatDate(part.updatedAt) }}</div>
              </div>
            </div>
          </div>

          <!-- Part description -->
          <div v-if="part.description" class="description-section mb-6">
            <h2 class="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
              Description
            </h2>
            <div class="description-content text-gray-700 dark:text-gray-300 whitespace-pre-line">
              {{ part.description }}
            </div>
          </div>

          <!-- Related project information -->
          <div v-if="part.projectId" class="related-section">
            <h2 class="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
              Related Project
            </h2>
            <div class="related-project-link mb-2">
              <router-link 
                :to="`/viewProject/${part.projectId}`" 
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
import { usePartStore } from '@/stores/partStore';
import { useErrorStore } from '@/stores/errorStore';

const route = useRoute();
const router = useRouter();
const partStore = usePartStore();
const errorStore = useErrorStore();
const part = ref(null);
const loading = ref(true);

onMounted(async () => {
  try {
    const partId = route.params.id;
    
    // Check if parts is populated, if not fetch them
    if (partStore.parts.length === 0) {
      await partStore.fetchParts();
    }
    
    part.value = partStore.parts.find(i => i.id === partId);
    
    if (!part.value) {
      errorStore.showError("Unable to find part by Id.");
    }
  } catch (err) {
    errorStore.showError("Error loading part: " + err.message);
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
  router.push(`/editPart/${part.value.id}`);
};

const goBack = () => {
  if (part.value?.projectId) {
    router.push(`/viewProject/${part.value.projectId}`);
  } else {
    router.push('/parts');
  }
};
</script>

<style scoped>
.part-detail-container {
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