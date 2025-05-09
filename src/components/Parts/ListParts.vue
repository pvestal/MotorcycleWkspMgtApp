<template>
  <div>
    <!-- Show message if no parts are available -->
    <div v-if="!displayParts.length">
      <p class="text-gray-500 p-4 text-center">No parts available to display.</p>
    </div>
    
    <div v-else class="parts-container">
      <h2 v-if="projectName" class="text-xl font-bold mb-4">Parts for Project: {{ projectName }}</h2>
      
      <!-- Parts list -->
      <ul class="part-list">
        <li v-for="part in displayParts" :key="part.id" class="bg-white rounded-lg shadow p-4 mb-3 flex justify-between items-center">
          <div>
            <span class="part-title text-lg font-medium">{{ part.partName }}</span>
            <div class="flex mt-2 space-x-2">
              <span 
                :class="{
                  'bg-blue-100 text-blue-800': part.partStatus === 'Ordered',
                  'bg-purple-100 text-purple-800': part.partStatus === 'Shipped',
                  'bg-yellow-100 text-yellow-800': part.partStatus === 'BackOrder',
                  'bg-green-100 text-green-800': part.partStatus === 'Installed'
                }"
                class="px-2 py-1 rounded-full text-xs font-medium"
              >
                {{ part.partStatus }}
              </span>
              <span 
                :class="{
                  'bg-red-100 text-red-800': part.partPriority === 'High',
                  'bg-yellow-100 text-yellow-800': part.partPriority === 'Medium',
                  'bg-green-100 text-green-800': part.partPriority === 'Low'
                }"
                class="px-2 py-1 rounded-full text-xs font-medium"
              >
                {{ part.partPriority }}
              </span>
            </div>
          </div>
          
          <div class="flex space-x-2">
            <button @click="navigateToEdit(part.id)" class="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button @click="navigateToView(part.id)" class="p-2 text-green-600 hover:text-green-800 hover:bg-green-100 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
          </div>
        </li>
      </ul>
      
      <!-- Add part button -->
      <div class="mt-4">
        <button 
          @click="navigateToAdd" 
          class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg class="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
          </svg>
          Add Part
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { usePartStore } from '@/stores/partStore';
import { useErrorStore } from '@/stores/errorStore';

// Define props with default values
const props = defineProps({
  projectId: {
    type: String,
    default: ''
  },
  projectName: {
    type: String,
    default: ''
  },
  parts: {
    type: Array,
    default: () => []
  }
});

// Store and router setup
const partStore = usePartStore();
const errorStore = useErrorStore();
const router = useRouter();

// Reactive state
const localParts = ref([]);
const loading = ref(false);

// Computed property to determine which parts to display
const displayParts = computed(() => {
  // If parts are provided via props, use them
  if (props.parts && props.parts.length > 0) {
    return props.parts;
  }
  // Otherwise, use the locally fetched parts
  return localParts.value;
});

// Fetch parts on component mount
onMounted(async () => {
  if (!props.parts || props.parts.length === 0) {
    loading.value = true;
    try {
      // If projectId is provided, fetch parts for that project
      if (props.projectId) {
        const projectParts = await partStore.fetchPartsByProjectId(props.projectId);
        localParts.value = projectParts || [];
      } else {
        // Otherwise, fetch all parts
        await partStore.fetchParts();
        localParts.value = partStore.parts || [];
      }
    } catch (error) {
      console.error('Error fetching parts:', error);
      errorStore.showError('Failed to load parts');
    } finally {
      loading.value = false;
    }
  }
});

// Navigation methods
const navigateToEdit = (id) => {
  router.push(`/editPart/${id}`);
};

const navigateToView = (id) => {
  router.push(`/viewPart/${id}`);
};

const navigateToAdd = () => {
  if (props.projectId) {
    router.push(`/addPart/${props.projectId}`);
  } else {
    router.push('/addPart');
  }
};
</script>

<style scoped>
.parts-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.part-list {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.part-title {
  display: block;
  margin-bottom: 4px;
}

/* Responsive styles */
@media (max-width: 640px) {
  .parts-container {
    padding: 16px;
  }
}
</style>