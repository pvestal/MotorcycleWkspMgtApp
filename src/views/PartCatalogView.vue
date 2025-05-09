<template>
  <div class="part-catalog-view">
    <div class="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <h1 class="text-3xl font-bold mb-2">Part Catalog</h1>
      <p class="text-gray-500 dark:text-gray-400 mb-6">
        Search for motorcycle parts across multiple suppliers
      </p>
      
      <!-- Vehicle selection -->
      <div class="vehicle-selection bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <h2 class="text-xl font-semibold mb-4">Your Vehicle</h2>
        <p class="text-gray-600 dark:text-gray-400 mb-4">
          Select your vehicle to find compatible parts
        </p>
        
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <!-- Year -->
          <div class="form-group">
            <label for="vehicle-year" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Year
            </label>
            <select 
              id="vehicle-year" 
              v-model="vehicle.year"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300 dark:bg-gray-700"
              @change="resetModel"
            >
              <option value="">Select Year</option>
              <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
            </select>
          </div>
          
          <!-- Make -->
          <div class="form-group">
            <label for="vehicle-make" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Make
            </label>
            <select 
              id="vehicle-make" 
              v-model="vehicle.make"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300 dark:bg-gray-700"
              :disabled="!vehicle.year"
              @change="resetModel"
            >
              <option value="">Select Make</option>
              <option v-for="make in filteredMakes" :key="make" :value="make">{{ make }}</option>
            </select>
          </div>
          
          <!-- Model -->
          <div class="form-group">
            <label for="vehicle-model" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Model
            </label>
            <select 
              id="vehicle-model" 
              v-model="vehicle.model"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300 dark:bg-gray-700"
              :disabled="!vehicle.make"
            >
              <option value="">Select Model</option>
              <option v-for="model in filteredModels" :key="model" :value="model">{{ model }}</option>
            </select>
          </div>
          
          <!-- Clear button -->
          <div class="form-group flex items-end">
            <button 
              @click="clearVehicle" 
              class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 w-full"
            >
              Clear Vehicle
            </button>
          </div>
        </div>
        
        <!-- Selected vehicle display -->
        <div 
          v-if="hasVehicleSelected"
          class="selected-vehicle mt-4 p-3 bg-blue-50 dark:bg-blue-900 border border-blue-100 dark:border-blue-800 rounded-md"
        >
          <div class="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-500 dark:text-blue-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span class="text-blue-800 dark:text-blue-200 font-medium">
              Selected Vehicle: {{ vehicle.year }} {{ vehicle.make }} {{ vehicle.model }}
            </span>
          </div>
          <p class="text-sm text-blue-600 dark:text-blue-300 mt-1 ml-7">
            Parts will be filtered for compatibility with your vehicle when possible
          </p>
        </div>
      </div>
      
      <!-- Part lookup component -->
      <div class="part-lookup-container bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <PartLookupForm 
          :projectId="currentProjectId"
          :vehicle="vehicle"
          @part-selected="onPartSelected"
          @part-added="onPartAdded"
        />
      </div>
    </div>
    
    <!-- Part details modal could be added here if needed -->
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import PartLookupForm from '@/components/Parts/PartLookupForm.vue';
import { useProjectStore } from '@/stores/projectStore';
import { useUserStore } from '@/stores/userStore';
import { useRoute, useRouter } from 'vue-router';

// Initialize stores and router
const projectStore = useProjectStore();
const userStore = useUserStore();
const route = useRoute();
const router = useRouter();

// Vehicle data state
const vehicle = ref({
  year: '',
  make: '',
  model: '',
  trim: ''
});

// Project ID from route
const currentProjectId = computed(() => route.query.projectId || null);

// Vehicle database
// This could be more sophisticated and come from an API in a real app
const vehicleDatabase = {
  years: Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i),
  makes: ['Honda', 'Yamaha', 'Suzuki', 'Kawasaki', 'Harley-Davidson', 'BMW', 'Ducati', 'KTM', 'Triumph', 'Indian'],
  models: {
    'Honda': ['CB500', 'CBR600RR', 'Africa Twin', 'Goldwing', 'Rebel 500', 'CRF450', 'Shadow', 'CB750', 'CBR1000RR', 'NC750X'],
    'Yamaha': ['MT-07', 'YZF-R6', 'Tenere 700', 'YZF-R1', 'V-Star', 'FZ-09', 'XSR700', 'Super Tenere', 'VMAX', 'FJR1300'],
    'Suzuki': ['GSX-R750', 'V-Strom 650', 'Hayabusa', 'SV650', 'DR-Z400', 'Boulevard', 'Katana', 'GSX-S750', 'RM-Z450', 'Burgman'],
    'Kawasaki': ['Ninja 400', 'Z900', 'Ninja ZX-6R', 'Versys 650', 'Vulcan', 'Ninja ZX-10R', 'KLR650', 'Z650', 'H2', 'W800'],
    'Harley-Davidson': ['Sportster', 'Street Glide', 'Fat Boy', 'Road King', 'Softail', 'Electra Glide', 'Road Glide', 'Forty-Eight', 'Iron 883', 'Low Rider'],
    'BMW': ['R1250GS', 'S1000RR', 'F850GS', 'R nineT', 'F750GS', 'K1600', 'G310R', 'R1250RT', 'C400X', 'S1000XR'],
    'Ducati': ['Panigale V4', 'Monster', 'Multistrada', 'Scrambler', 'Diavel', 'SuperSport', 'Hypermotard', 'Desert X', 'Streetfighter', 'XDiavel'],
    'KTM': ['390 Duke', '1290 Super Duke', 'Adventure 1290', 'RC 390', '690 Enduro', 'Super Adventure', '790 Duke', '890 Adventure', 'EXC', 'SMC'],
    'Triumph': ['Street Triple', 'Bonneville', 'Tiger 900', 'Trident 660', 'Speed Triple', 'Rocket 3', 'Scrambler', 'Daytona', 'Thruxton', 'Street Twin'],
    'Indian': ['Scout', 'Chieftain', 'FTR', 'Springfield', 'Roadmaster', 'Challenger', 'Chief', 'Vintage', 'Dark Horse', 'Pursuit']
  }
};

// Computed properties for vehicle selection
const years = computed(() => vehicleDatabase.years);

const filteredMakes = computed(() => {
  if (!vehicle.value.year) return [];
  return vehicleDatabase.makes;
});

const filteredModels = computed(() => {
  if (!vehicle.value.make) return [];
  return vehicleDatabase.models[vehicle.value.make] || [];
});

const hasVehicleSelected = computed(() => {
  return vehicle.value.year && vehicle.value.make && vehicle.value.model;
});

// Reset model when year or make changes
const resetModel = () => {
  vehicle.value.model = '';
};

// Clear vehicle selection
const clearVehicle = () => {
  vehicle.value = {
    year: '',
    make: '',
    model: '',
    trim: ''
  };
};

// Event handlers
const onPartSelected = (partId) => {
  router.push({
    path: `/part-details/${partId}`,
    query: { 
      projectId: currentProjectId.value,
      from: 'catalog'
    }
  });
};

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

// Save vehicle data to localStorage
const saveVehicleData = () => {
  try {
    localStorage.setItem('selectedVehicle', JSON.stringify(vehicle.value));
  } catch (e) {
    console.warn('Could not save vehicle data to localStorage', e);
  }
};

// Watch for vehicle changes and save to localStorage
watch(vehicle, (newVehicle) => {
  saveVehicleData();
}, { deep: true });

// On component mount
onMounted(() => {
  // Load vehicle data from localStorage
  loadVehicleData();
  
  // Load projects if needed
  if (currentProjectId.value) {
    projectStore.fetchProjects();
  }
});
</script>

<style scoped>
.part-catalog-view {
  padding-bottom: 2rem;
}

.no-scrollbar {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}

.no-scrollbar::-webkit-scrollbar {
  display: none;  /* Chrome, Safari, Opera */
}
</style>