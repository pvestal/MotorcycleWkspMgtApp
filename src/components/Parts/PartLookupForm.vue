<template>
  <div class="part-lookup-form">
    <h3 class="text-xl font-semibold mb-4">Part Search</h3>
    
    <!-- Search form -->
    <form @submit.prevent="handleSearch" class="mb-6">
      <div class="flex flex-col md:flex-row gap-3">
        <div class="flex-grow">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search for parts by name, number, or description"
            class="px-4 py-2 border border-gray-300 rounded w-full"
            :disabled="loading"
          />
        </div>
        <button
          type="submit"
          class="btn primary flex items-center justify-center gap-2"
          :disabled="loading"
        >
          <svg v-if="loading" class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Search
        </button>
      </div>
      
      <!-- Advanced search options -->
      <div class="mt-3">
        <button 
          type="button" 
          @click="showAdvanced = !showAdvanced"
          class="text-sm text-blue-600 dark:text-blue-400 flex items-center"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            class="h-4 w-4 mr-1 transition-transform" 
            :class="{'rotate-90': showAdvanced}"
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
          Advanced Search Options
        </button>
        
        <div v-if="showAdvanced" class="mt-3 p-4 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Categories -->
          <div class="form-group">
            <label for="category" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category
            </label>
            <select 
              id="category" 
              v-model="searchOptions.category"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300 dark:bg-gray-700"
            >
              <option value="">All Categories</option>
              <option v-for="category in categories" :key="category.id" :value="category.id">
                {{ category.name }}
              </option>
            </select>
          </div>
          
          <!-- Brands -->
          <div class="form-group">
            <label for="brand" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Brand
            </label>
            <select 
              id="brand" 
              v-model="searchOptions.brand"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300 dark:bg-gray-700"
            >
              <option value="">All Brands</option>
              <option v-for="brand in brands" :key="brand.id" :value="brand.id">
                {{ brand.name }}
              </option>
            </select>
          </div>
          
          <!-- Sort By -->
          <div class="form-group">
            <label for="sortBy" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Sort By
            </label>
            <select 
              id="sortBy" 
              v-model="searchOptions.sortBy"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300 dark:bg-gray-700"
            >
              <option value="relevance">Relevance</option>
              <option value="price">Price</option>
              <option value="name">Name</option>
              <option value="brand">Brand</option>
              <option value="rating">Rating</option>
            </select>
          </div>
          
          <!-- Sort Direction -->
          <div class="form-group">
            <label for="sortDirection" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Sort Direction
            </label>
            <select 
              id="sortDirection" 
              v-model="searchOptions.sortDirection"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300 dark:bg-gray-700"
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
          
          <!-- Result Limit -->
          <div class="form-group md:col-span-2">
            <label for="limit" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Results Per Page: {{ searchOptions.limit }}
            </label>
            <input 
              id="limit" 
              v-model="searchOptions.limit" 
              type="range" 
              min="10" 
              max="100" 
              step="10"
              class="w-full" 
            />
          </div>
        </div>
      </div>
    </form>
    
    <!-- Recent searches -->
    <div v-if="recentSearches.length && !searchResults.length" class="mb-6">
      <div class="flex justify-between items-center">
        <h4 class="text-md font-semibold text-gray-700 dark:text-gray-300">Recent Searches</h4>
        <button 
          @click="clearRecentSearches" 
          class="text-sm text-red-600 dark:text-red-400"
        >
          Clear
        </button>
      </div>
      <div class="mt-2 flex flex-wrap gap-2">
        <button 
          v-for="(search, index) in recentSearches" 
          :key="index"
          @click="selectRecentSearch(search)"
          class="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition"
        >
          {{ search }}
        </button>
      </div>
    </div>
    
    <!-- Search results -->
    <div v-if="searchResults.length" class="search-results">
      <h4 class="text-md font-semibold text-gray-700 dark:text-gray-300 mb-3">
        {{ searchResults.length }} results for "{{ lastSearchQuery }}"
      </h4>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div 
          v-for="part in searchResults" 
          :key="part.id"
          class="part-card p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition bg-white dark:bg-gray-800"
        >
          <div class="part-card-content">
            <!-- Part Image -->
            <div class="part-image w-full h-40 flex items-center justify-center mb-4 bg-gray-50 dark:bg-gray-900 rounded overflow-hidden">
              <img 
                v-if="part.imageUrl" 
                :src="part.imageUrl" 
                :alt="part.name"
                class="max-w-full max-h-full object-contain" 
              />
              <div v-else class="text-gray-400 dark:text-gray-500 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>No image available</span>
              </div>
            </div>
            
            <!-- Part Info -->
            <h5 class="part-name text-lg font-semibold mb-1 line-clamp-2">{{ part.name }}</h5>
            <div class="part-brand text-sm text-gray-600 dark:text-gray-400 mb-2">{{ part.brand }}</div>
            
            <!-- Part Number and Price -->
            <div class="flex justify-between mb-3">
              <div class="part-number text-sm">
                <span class="text-gray-500 dark:text-gray-400">Part #:</span> 
                <span class="font-mono">{{ part.partNumber }}</span>
              </div>
              <div v-if="part.price" class="part-price font-bold text-green-600 dark:text-green-400">
                ${{ part.price.toFixed(2) }}
              </div>
              <div v-else class="part-price text-gray-500 italic">
                Price unavailable
              </div>
            </div>
            
            <!-- Compatibility and Store Availability -->
            <div class="flex flex-wrap gap-2 mb-3">
              <span 
                v-if="part.inStock" 
                class="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100 text-xs rounded-full"
              >
                In Stock
              </span>
              <span 
                v-else-if="part.inStock === false" 
                class="px-2 py-1 bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100 text-xs rounded-full"
              >
                Out of Stock
              </span>
              <span 
                v-if="part.compatible === true" 
                class="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100 text-xs rounded-full"
              >
                Compatible
              </span>
              <span 
                v-else-if="part.compatible === false" 
                class="px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100 text-xs rounded-full"
              >
                Not Compatible
              </span>
            </div>
            
            <!-- Action buttons -->
            <div class="flex justify-between mt-4">
              <button 
                @click="viewPartDetails(part.id)"
                class="px-3 py-1 text-sm bg-blue-50 text-blue-600 dark:bg-blue-900 dark:text-blue-300 rounded hover:bg-blue-100 dark:hover:bg-blue-800"
              >
                View Details
              </button>
              <button 
                @click="addPartToProject(part.id)"
                class="px-3 py-1 text-sm bg-green-50 text-green-600 dark:bg-green-900 dark:text-green-300 rounded hover:bg-green-100 dark:hover:bg-green-800"
              >
                Add to Project
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Pagination -->
      <div v-if="searchResults.length >= searchOptions.limit" class="mt-6 flex justify-center">
        <button 
          @click="loadMoreResults"
          class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700"
          :disabled="loading"
        >
          <svg v-if="loading" class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Load More Results</span>
        </button>
      </div>
    </div>
    
    <!-- No results message -->
    <div v-if="searchPerformed && !searchResults.length && !loading" class="py-8 text-center">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <h4 class="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No parts found</h4>
      <p class="text-gray-500 dark:text-gray-400">Try adjusting your search or filters</p>
    </div>
    
    <!-- Loading Skeleton -->
    <div v-if="loading && !searchResults.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div 
        v-for="i in 6" 
        :key="i"
        class="part-card-skeleton p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 animate-pulse"
      >
        <div class="w-full h-40 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
        <div class="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-3/4"></div>
        <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-3 w-1/2"></div>
        <div class="flex justify-between mb-3">
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
        </div>
        <div class="flex space-x-2 mb-3">
          <div class="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-1/4"></div>
          <div class="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-1/4"></div>
        </div>
        <div class="flex justify-between mt-4">
          <div class="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div class="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useExternalPartsStore } from '@/stores/externalPartsStore';
import { useErrorStore } from '@/stores/errorStore';

// Define props
const props = defineProps({
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
const emit = defineEmits(['part-selected', 'part-added']);

// Setup router and stores
const router = useRouter();
const partsStore = useExternalPartsStore();
const errorStore = useErrorStore();

// Reactive state
const searchQuery = ref('');
const lastSearchQuery = ref('');
const searchPerformed = ref(false);
const showAdvanced = ref(false);
const loading = computed(() => partsStore.loading);
const searchResults = computed(() => partsStore.searchResults);
const recentSearches = computed(() => partsStore.recentSearches);
const categories = ref([]);
const brands = ref([]);
const loadingCategories = ref(false);
const loadingBrands = ref(false);

// Reactive search options
const searchOptions = reactive({
  category: '',
  brand: '',
  sortBy: 'relevance',
  sortDirection: 'desc',
  limit: 20,
  offset: 0
});

// Search for parts
const handleSearch = async () => {
  if (!searchQuery.value.trim()) {
    errorStore.showError('Please enter a search term');
    return;
  }
  
  searchOptions.offset = 0; // Reset offset for new search
  searchPerformed.value = true;
  lastSearchQuery.value = searchQuery.value;
  
  try {
    await partsStore.searchForParts(searchQuery.value, searchOptions);
  } catch (error) {
    console.error('Search error:', error);
  }
};

// Load more results
const loadMoreResults = async () => {
  searchOptions.offset += searchOptions.limit;
  
  try {
    const additionalResults = await partsStore.searchForParts(lastSearchQuery.value, searchOptions);
    // Results are merged in the store
  } catch (error) {
    console.error('Error loading more results:', error);
  }
};

// Select a recent search
const selectRecentSearch = (search) => {
  searchQuery.value = search;
  handleSearch();
};

// Clear recent searches
const clearRecentSearches = () => {
  partsStore.clearRecentSearches();
};

// View part details
const viewPartDetails = (partId) => {
  router.push(`/part-details/${partId}`);
  emit('part-selected', partId);
};

// Add part to project
const addPartToProject = async (partId) => {
  if (!props.projectId) {
    errorStore.showError('Please select a project to add this part to');
    router.push('/projects');
    return;
  }
  
  try {
    // First get the part details if we don't already have them
    let partDetails = partsStore.getPartDetails.value(partId);
    
    if (!partDetails) {
      partDetails = await partsStore.getPartDetailsById(partId);
    }
    
    if (partDetails) {
      const success = await partsStore.importPartToProject(partId, props.projectId);
      
      if (success) {
        errorStore.showSuccess('Part added to project');
        emit('part-added', { partId, projectId: props.projectId });
      }
    }
  } catch (error) {
    console.error('Error adding part to project:', error);
    errorStore.showError('Error adding part to project');
  }
};

// Load categories and brands on component mount
onMounted(async () => {
  loadingCategories.value = true;
  loadingBrands.value = true;
  
  try {
    // Load both simultaneously
    const [categoriesResult, brandsResult] = await Promise.all([
      partsStore.loadCategories(),
      partsStore.loadBrands()
    ]);
    
    categories.value = categoriesResult;
    brands.value = brandsResult;
  } catch (error) {
    console.error('Error loading form data:', error);
  } finally {
    loadingCategories.value = false;
    loadingBrands.value = false;
  }
  
  // Load recent searches
  partsStore.loadRecentSearches();
});

// Watch for vehicle changes to check compatibility
watch(() => props.vehicle, async (newVehicle) => {
  if (!newVehicle || !newVehicle.make || !newVehicle.model || !newVehicle.year) {
    return;
  }
  
  // Update compatibility for visible parts
  if (searchResults.value.length > 0) {
    for (const part of searchResults.value) {
      await partsStore.checkPartCompatibility(part.id, newVehicle);
    }
  }
}, { deep: true });
</script>

<style scoped>
.part-lookup-form {
  margin-bottom: 2rem;
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  transition: all 0.2s;
}

.btn.primary {
  background-color: #4f46e5;
  color: white;
}

.btn.primary:hover {
  background-color: #4338ca;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: .5;
  }
}

.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
</style>