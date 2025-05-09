<template>
  <div class="part-details-view">
    <!-- Loading state -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading part details...</p>
    </div>
    
    <!-- Error state -->
    <div v-else-if="error" class="error-state">
      <div class="error-icon">❌</div>
      <h3>Error Loading Part</h3>
      <p>{{ error }}</p>
      <button @click="goBack" class="btn secondary">Go Back</button>
    </div>
    
    <!-- Part not found -->
    <div v-else-if="!part" class="not-found">
      <div class="not-found-icon">❓</div>
      <h3>Part Not Found</h3>
      <p>The requested part could not be found or does not exist.</p>
      <button @click="goBack" class="btn secondary">Go Back</button>
    </div>
    
    <!-- Part details content -->
    <div v-else class="part-content">
      <!-- Header with navigation actions -->
      <div class="header-actions mb-6 flex justify-between items-center">
        <button @click="goBack" class="btn secondary flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
          </svg>
          Back
        </button>
        <button
          v-if="projectId" 
          @click="addToProject"
          class="btn primary flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
          </svg>
          Add to Project
        </button>
      </div>
      
      <div class="part-detail-container bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <!-- Part header with main details -->
        <div class="part-header p-6 bg-blue-50 dark:bg-blue-900 border-b border-blue-100 dark:border-blue-800">
          <div class="part-id font-mono text-sm text-gray-500 dark:text-gray-400 mb-1">
            Part #{{ part.partNumber }}
          </div>
          <h1 class="text-2xl font-bold text-gray-800 dark:text-white">{{ part.name }}</h1>
          
          <div class="flex flex-wrap gap-2 mt-2">
            <span class="brand-badge px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100">
              {{ part.brand }}
            </span>
            <span 
              v-if="part.inStock" 
              class="stock-badge px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
            >
              In Stock
            </span>
            <span 
              v-else 
              class="stock-badge px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
            >
              Out of Stock
            </span>
          </div>
        </div>
        
        <!-- Part main content section -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
          <!-- Part image(s) -->
          <div class="md:col-span-1">
            <div class="part-image-container bg-gray-100 dark:bg-gray-900 rounded-lg p-4 flex items-center justify-center mb-4" style="min-height: 300px">
              <img 
                v-if="part.imageUrl" 
                :src="part.imageUrl" 
                :alt="part.name"
                class="max-w-full max-h-full object-contain" 
              />
              <div v-else class="text-gray-400 dark:text-gray-600 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-24 w-24 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>No image available</span>
              </div>
            </div>
            
            <!-- Additional images thumbnails if available -->
            <div v-if="part.additionalImages && part.additionalImages.length > 0" class="part-thumbnails flex gap-2 overflow-x-auto py-2">
              <div 
                v-for="(img, index) in part.additionalImages" 
                :key="index"
                class="thumbnail-item flex-shrink-0 cursor-pointer w-16 h-16 rounded overflow-hidden border-2"
                :class="{'border-blue-500': selectedImage === index, 'border-transparent': selectedImage !== index}"
                @click="selectedImage = index"
              >
                <img :src="img" :alt="`${part.name} view ${index + 1}`" class="w-full h-full object-cover" />
              </div>
            </div>
          </div>
          
          <!-- Part details -->
          <div class="md:col-span-2">
            <!-- Price and SKU -->
            <div class="flex flex-wrap justify-between items-center mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
              <div class="part-price text-3xl font-bold text-green-600 dark:text-green-400">
                {{ part.price ? `$${part.price.toFixed(2)}` : 'Price unavailable' }}
              </div>
              <div class="part-sku text-sm text-gray-500 dark:text-gray-400">
                <span>SKU: </span>
                <span class="font-mono">{{ part.sku || part.partNumber }}</span>
              </div>
            </div>
            
            <!-- Delivery and availability info -->
            <div v-if="availability" class="delivery-info mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
              <h3 class="text-lg font-medium mb-3">Availability</h3>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="availability-item">
                  <div class="text-sm text-gray-500 dark:text-gray-400">Availability</div>
                  <div class="font-medium flex items-center">
                    <span 
                      :class="{
                        'text-green-600 dark:text-green-400': availability.inStock,
                        'text-red-600 dark:text-red-400': !availability.inStock
                      }"
                    >
                      {{ availability.inStock ? 'In Stock' : 'Out of Stock' }}
                    </span>
                    <span v-if="availability.stockCount" class="ml-2 text-sm text-gray-500 dark:text-gray-400">
                      ({{ availability.stockCount }} available)
                    </span>
                  </div>
                </div>
                
                <div v-if="availability.estimatedDelivery" class="availability-item">
                  <div class="text-sm text-gray-500 dark:text-gray-400">Estimated Delivery</div>
                  <div class="font-medium">{{ availability.estimatedDelivery }}</div>
                </div>
                
                <div v-if="availability.shippingOptions && availability.shippingOptions.length" class="availability-item md:col-span-2">
                  <div class="text-sm text-gray-500 dark:text-gray-400 mb-1">Shipping Options</div>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div
                      v-for="(option, index) in availability.shippingOptions"
                      :key="index"
                      class="shipping-option p-2 border border-gray-200 dark:border-gray-700 rounded flex justify-between"
                    >
                      <span>{{ option.name }}</span>
                      <span class="font-medium">${{ option.price.toFixed(2) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Vehicle compatibility -->
            <div v-if="compatibility" class="compatibility-info mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
              <h3 class="text-lg font-medium mb-3">Compatibility</h3>
              
              <div v-if="vehicle && vehicle.make && vehicle.model && vehicle.year" class="vehicle-compatibility mb-4">
                <div class="font-medium mb-2">
                  Compatibility with {{ vehicle.year }} {{ vehicle.make }} {{ vehicle.model }}:
                </div>
                <div 
                  class="compatibility-result p-3 rounded-md"
                  :class="{
                    'bg-green-50 text-green-800 dark:bg-green-900 dark:text-green-200': compatibility.compatible,
                    'bg-red-50 text-red-800 dark:bg-red-900 dark:text-red-200': !compatibility.compatible
                  }"
                >
                  <div class="flex items-center">
                    <svg v-if="compatibility.compatible" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                    </svg>
                    <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                    </svg>
                    <span>{{ compatibility.message }}</span>
                  </div>
                </div>
              </div>
              
              <div v-if="part.compatibleVehicles && part.compatibleVehicles.length" class="compatible-vehicles">
                <div class="font-medium mb-2">Compatible with:</div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-1">
                  <div 
                    v-for="(vehicle, index) in part.compatibleVehicles.slice(0, showAllVehicles ? part.compatibleVehicles.length : 6)"
                    :key="index"
                    class="vehicle-item text-sm py-1"
                  >
                    {{ vehicle.year }} {{ vehicle.make }} {{ vehicle.model }} {{ vehicle.trim || '' }}
                  </div>
                </div>
                
                <button 
                  v-if="part.compatibleVehicles.length > 6 && !showAllVehicles"
                  @click="showAllVehicles = true"
                  class="text-sm text-blue-600 dark:text-blue-400 mt-2 hover:underline"
                >
                  Show all {{ part.compatibleVehicles.length }} compatible vehicles
                </button>
                
                <button 
                  v-else-if="showAllVehicles"
                  @click="showAllVehicles = false"
                  class="text-sm text-blue-600 dark:text-blue-400 mt-2 hover:underline"
                >
                  Show less
                </button>
              </div>
            </div>
            
            <!-- Part specifications -->
            <div v-if="part.specifications && Object.keys(part.specifications).length" class="part-specs mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
              <h3 class="text-lg font-medium mb-3">Specifications</h3>
              
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-y-2">
                <div 
                  v-for="(value, key) in part.specifications" 
                  :key="key"
                  class="spec-item"
                >
                  <div class="text-sm text-gray-500 dark:text-gray-400">{{ formatSpecName(key) }}</div>
                  <div class="font-medium">{{ value }}</div>
                </div>
              </div>
            </div>
            
            <!-- Description -->
            <div v-if="part.description" class="part-description mb-6">
              <h3 class="text-lg font-medium mb-3">Description</h3>
              <div class="description-content text-gray-700 dark:text-gray-300 prose dark:prose-dark max-w-none">
                <div v-html="formatDescription(part.description)"></div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Alternative parts -->
        <div v-if="alternatives && alternatives.length" class="alternative-parts p-6 border-t border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-medium mb-4">Alternative Parts</h3>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div 
              v-for="alt in alternatives" 
              :key="alt.id"
              class="alternative-part-card p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition"
              @click="viewPartDetails(alt.id)"
            >
              <div class="flex items-center space-x-3">
                <div class="part-thumb h-16 w-16 bg-gray-100 dark:bg-gray-900 rounded flex items-center justify-center flex-shrink-0">
                  <img 
                    v-if="alt.imageUrl" 
                    :src="alt.imageUrl" 
                    :alt="alt.name"
                    class="max-h-full max-w-full object-contain" 
                  />
                  <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                
                <div class="flex-grow">
                  <div class="font-medium text-sm line-clamp-2">{{ alt.name }}</div>
                  <div class="flex justify-between items-center mt-1">
                    <div class="text-xs text-gray-500 dark:text-gray-400">{{ alt.brand }}</div>
                    <div class="font-bold text-green-600 dark:text-green-400">
                      {{ alt.price ? `$${alt.price.toFixed(2)}` : '' }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Reviews and Q&A sections could be added here -->
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useExternalPartsStore } from '@/stores/externalPartsStore';
import { useErrorStore } from '@/stores/errorStore';

// Define props
const props = defineProps({
  partId: {
    type: String,
    default: null
  },
  projectId: {
    type: String,
    default: null
  },
  vehicle: {
    type: Object,
    default: () => ({})
  }
});

// Define emits
const emit = defineEmits(['part-added']);

// Setup router and stores
const route = useRoute();
const router = useRouter();
const partsStore = useExternalPartsStore();
const errorStore = useErrorStore();

// Reactive state
const loading = ref(true);
const error = ref(null);
const part = ref(null);
const availability = ref(null);
const compatibility = ref(null);
const alternatives = ref([]);
const selectedImage = ref(0);
const showAllVehicles = ref(false);

// Get the part ID from props or route
const partId = computed(() => props.partId || route.params.id);

// Computed properties
const vehicle = computed(() => props.vehicle);

// Format spec name function
const formatSpecName = (key) => {
  return key
    .replace(/([A-Z])/g, ' $1') // Add space before capital letters
    .replace(/_/g, ' ') // Replace underscores with spaces
    .replace(/^./, (str) => str.toUpperCase()); // Capitalize first letter
};

// Format description function
const formatDescription = (description) => {
  if (!description) return '';
  
  // Replace newlines with <br> tags
  return description
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold text
    .replace(/\*(.*?)\*/g, '<em>$1</em>'); // Italic text
};

// Load part details
const loadPartDetails = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    const details = await partsStore.getPartDetailsById(partId.value);
    
    if (details) {
      part.value = details;
      
      // Load additional information
      await Promise.all([
        loadAvailability(),
        loadCompatibility(),
        loadAlternatives()
      ]);
    } else {
      error.value = 'Part not found';
    }
  } catch (err) {
    console.error('Error loading part details:', err);
    error.value = err.message || 'Error loading part details';
    errorStore.showError(`Error loading part details: ${error.value}`);
  } finally {
    loading.value = false;
  }
};

// Load availability information
const loadAvailability = async () => {
  try {
    const data = await partsStore.checkPriceAndAvailability(partId.value);
    availability.value = data;
  } catch (err) {
    console.error('Error loading availability:', err);
  }
};

// Load compatibility information
const loadCompatibility = async () => {
  if (!vehicle.value || !vehicle.value.make || !vehicle.value.model || !vehicle.value.year) {
    return;
  }
  
  try {
    const data = await partsStore.checkPartCompatibility(partId.value, vehicle.value);
    compatibility.value = data;
  } catch (err) {
    console.error('Error loading compatibility:', err);
  }
};

// Load alternative parts
const loadAlternatives = async () => {
  try {
    const data = await partsStore.getAlternatives(partId.value);
    alternatives.value = data;
  } catch (err) {
    console.error('Error loading alternative parts:', err);
  }
};

// View details of another part
const viewPartDetails = (id) => {
  router.push(`/part-details/${id}`);
};

// Go back function
const goBack = () => {
  router.back();
};

// Add part to project
const addToProject = async () => {
  if (!props.projectId) {
    errorStore.showError('Please select a project to add this part to');
    router.push('/projects');
    return;
  }
  
  try {
    const success = await partsStore.importPartToProject(partId.value, props.projectId);
    
    if (success) {
      errorStore.showSuccess('Part added to project');
      emit('part-added', { partId: partId.value, projectId: props.projectId });
    }
  } catch (err) {
    console.error('Error adding part to project:', err);
    errorStore.showError('Error adding part to project');
  }
};

// Watch for vehicle changes to update compatibility
watch(() => props.vehicle, async (newVehicle) => {
  if (!newVehicle || !newVehicle.make || !newVehicle.model || !newVehicle.year) {
    return;
  }
  
  // Update compatibility if we have a part loaded
  if (part.value) {
    await loadCompatibility();
  }
}, { deep: true });

// Watch for partId changes (when navigating between alternative parts)
watch(() => partId.value, async (newPartId, oldPartId) => {
  if (newPartId && newPartId !== oldPartId) {
    await loadPartDetails();
  }
});

// Load data on component mount
onMounted(async () => {
  if (partId.value) {
    await loadPartDetails();
  }
});
</script>

<style scoped>
.part-details-view {
  margin-bottom: 2rem;
}

.loading-state,
.error-state,
.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
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

.error-icon,
.not-found-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.error-state h3,
.not-found h3 {
  margin-bottom: 8px;
  font-size: 24px;
}

.error-state p,
.not-found p {
  margin-bottom: 24px;
  color: #6b7280;
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

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Dark mode support */
:global(.dark) .btn.primary {
  background-color: #4f46e5;
}

:global(.dark) .btn.primary:hover {
  background-color: #4338ca;
}

:global(.dark) .btn.secondary {
  background-color: #374151;
  color: #f3f4f6;
}

:global(.dark) .btn.secondary:hover {
  background-color: #4b5563;
}
</style>