<template>
  <div class="project-form-container max-w-4xl mx-auto p-4 sm:p-6 bg-white shadow-md rounded-lg">
    <!-- Back button -->
    <div class="mb-6 flex justify-between items-center">
      <button 
        @click="cancelEdit" 
        class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
      >
        <span class="inline-flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </span>
      </button>
      <h2 class="text-xl font-bold text-gray-800">{{ isEditing ? 'Edit Project' : 'Create New Project' }}</h2>
    </div>

    <form @submit.prevent="handleProjectSave" class="space-y-6">
      <!-- Project Name Input -->
      <div class="form-group">
        <label for="projectName" class="block text-sm font-medium text-gray-700 mb-1">Project Name <span class="text-red-500">*</span></label>
        <input 
          type="text" 
          v-model="formData.projectName" 
          id="projectName" 
          class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
          required 
          :class="{'border-red-500': errors.projectName}"
        />
        <p v-if="errors.projectName" class="mt-1 text-xs text-red-500">{{ errors.projectName }}</p>
      </div>

      <!-- Project ID (display only) -->
      <p v-if="projectId" class="text-sm text-gray-500">Project ID: {{ projectId }}</p>

      <!-- Basic Information -->
      <div class="bg-gray-50 p-4 rounded-md">
        <h3 class="text-md font-semibold text-gray-700 mb-4">Basic Information</h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div class="form-group">
            <label for="owner" class="block text-sm font-medium text-gray-700 mb-1">Owner <span class="text-red-500">*</span></label>
            <input 
              type="text" 
              v-model="formData.owner" 
              id="owner" 
              class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
              required 
              :class="{'border-red-500': errors.owner}"
            />
            <p v-if="errors.owner" class="mt-1 text-xs text-red-500">{{ errors.owner }}</p>
          </div>

          <div class="form-group">
            <label for="status" class="block text-sm font-medium text-gray-700 mb-1">Status <span class="text-red-500">*</span></label>
            <select 
              v-model="formData.status" 
              id="status" 
              class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white" 
              required
            >
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="On Hold">On Hold</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="form-group">
            <label for="startDate" class="block text-sm font-medium text-gray-700 mb-1">Start Date <span class="text-red-500">*</span></label>
            <input 
              type="date" 
              v-model="formData.startDate" 
              id="startDate" 
              class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
              required 
              :class="{'border-red-500': errors.startDate}"
            />
            <p v-if="errors.startDate" class="mt-1 text-xs text-red-500">{{ errors.startDate }}</p>
          </div>
          
          <div class="form-group">
            <label for="endDate" class="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input 
              type="date" 
              v-model="formData.endDate" 
              id="endDate" 
              class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
              :min="formData.startDate"
              :class="{'border-red-500': errors.endDate}"
            />
            <p v-if="errors.endDate" class="mt-1 text-xs text-red-500">{{ errors.endDate }}</p>
          </div>
        </div>
      </div>

      <!-- Vehicle Information Section -->
      <div class="bg-gray-50 p-4 rounded-md">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-md font-semibold text-gray-700">Vehicle Information</h3>
          <button 
            type="button" 
            @click="toggleVehicleSection" 
            class="text-indigo-600 hover:text-indigo-800 text-sm font-medium focus:outline-none"
          >
            {{ showVehicleDetails ? 'Hide Details' : 'Show Details' }}
          </button>
        </div>

        <!-- VIN Input Field -->
        <div class="form-group mb-4">
          <label for="vin" class="block text-sm font-medium text-gray-700 mb-1">
            VIN (Vehicle Identification Number)
            <span v-if="isVinLoading" class="ml-2 inline-block animate-spin">⟳</span>
          </label>
          <div class="flex space-x-2">
            <input 
              type="text" 
              v-model="formData.vin" 
              id="vin" 
              class="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
              maxlength="17" 
              placeholder="Enter 17-character VIN"
              :class="{'border-red-500': errors.vin}"
            />
            <button 
              type="button" 
              @click="fetchVehicleData" 
              class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              :disabled="isVinLoading || !formData.vin || formData.vin.length !== 17"
            >
              Lookup
            </button>
          </div>
          <p v-if="errors.vin" class="mt-1 text-xs text-red-500">{{ errors.vin }}</p>
          <p class="mt-1 text-xs text-gray-500">Enter the 17-character VIN to auto-fill vehicle details.</p>
        </div>

        <!-- Collapsed/Expanded Vehicle Details -->
        <transition name="fade">
          <div v-if="showVehicleDetails" class="space-y-4">
            <!-- Basic Vehicle Details -->
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div class="form-group">
                <label for="make" class="block text-sm font-medium text-gray-700 mb-1">Make</label>
                <input 
                  type="text" 
                  v-model="formData.make" 
                  id="make" 
                  class="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100" 
                  readonly 
                />
              </div>
              
              <div class="form-group">
                <label for="model" class="block text-sm font-medium text-gray-700 mb-1">Model</label>
                <input 
                  type="text" 
                  v-model="formData.model" 
                  id="model" 
                  class="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100" 
                  readonly 
                />
              </div>
              
              <div class="form-group">
                <label for="year" class="block text-sm font-medium text-gray-700 mb-1">Year</label>
                <input 
                  type="text" 
                  v-model="formData.year" 
                  id="year" 
                  class="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100" 
                  readonly 
                />
              </div>
            </div>

            <!-- Additional Vehicle Details - First Row -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="form-group">
                <label for="manufacturer" class="block text-sm font-medium text-gray-700 mb-1">Manufacturer</label>
                <input 
                  type="text" 
                  v-model="formData.manufacturer" 
                  id="manufacturer" 
                  class="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100" 
                  readonly 
                />
              </div>
              
              <div class="form-group">
                <label for="bodyClass" class="block text-sm font-medium text-gray-700 mb-1">Body Class</label>
                <input 
                  type="text" 
                  v-model="formData.bodyClass" 
                  id="bodyClass" 
                  class="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100" 
                  readonly 
                />
              </div>
            </div>

            <!-- Additional Vehicle Details - Second Row -->
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div class="form-group">
                <label for="displacementCC" class="block text-sm font-medium text-gray-700 mb-1">Displacement (CC)</label>
                <input 
                  type="text" 
                  v-model="formData.displacementCC" 
                  id="displacementCC" 
                  class="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100" 
                  readonly 
                />
              </div>
              
              <div class="form-group">
                <label for="engineConfiguration" class="block text-sm font-medium text-gray-700 mb-1">Engine Config</label>
                <input 
                  type="text" 
                  v-model="formData.engineConfiguration" 
                  id="engineConfiguration" 
                  class="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100" 
                  readonly 
                />
              </div>
              
              <div class="form-group">
                <label for="engineHP" class="block text-sm font-medium text-gray-700 mb-1">Horsepower</label>
                <input 
                  type="text" 
                  v-model="formData.engineHP" 
                  id="engineHP" 
                  class="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100" 
                  readonly 
                />
              </div>
            </div>

            <!-- Additional Vehicle Details - Third Row -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="form-group">
                <label for="fuelTypePrimary" class="block text-sm font-medium text-gray-700 mb-1">Fuel Type</label>
                <input 
                  type="text" 
                  v-model="formData.fuelTypePrimary" 
                  id="fuelTypePrimary" 
                  class="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100" 
                  readonly 
                />
              </div>
              
              <div class="form-group">
                <label for="engineCylinders" class="block text-sm font-medium text-gray-700 mb-1">Engine Cylinders</label>
                <input 
                  type="text" 
                  v-model="formData.engineCylinders" 
                  id="engineCylinders" 
                  class="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100" 
                  readonly 
                />
              </div>
            </div>

            <!-- Additional Vehicle Details - Hidden until "Show More" -->
            <div v-if="showMoreVehicleDetails" class="space-y-4">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="form-group">
                  <label for="gvwr" class="block text-sm font-medium text-gray-700 mb-1">GVWR</label>
                  <input 
                    type="text" 
                    v-model="formData.gvwr" 
                    id="gvwr" 
                    class="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100" 
                    readonly 
                  />
                </div>
                
                <div class="form-group">
                  <label for="plantCountry" class="block text-sm font-medium text-gray-700 mb-1">Plant Country</label>
                  <input 
                    type="text" 
                    v-model="formData.plantCountry" 
                    id="plantCountry" 
                    class="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100" 
                    readonly 
                  />
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="form-group">
                  <label for="series" class="block text-sm font-medium text-gray-700 mb-1">Series</label>
                  <input 
                    type="text" 
                    v-model="formData.series" 
                    id="series" 
                    class="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100" 
                    readonly 
                  />
                </div>
                
                <div class="form-group">
                  <label for="valveTrainDesign" class="block text-sm font-medium text-gray-700 mb-1">Valve Train Design</label>
                  <input 
                    type="text" 
                    v-model="formData.valveTrainDesign" 
                    id="valveTrainDesign" 
                    class="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100" 
                    readonly 
                  />
                </div>
              </div>
            </div>

            <!-- Show More / Show Less Toggle -->
            <button 
              type="button" 
              @click="toggleMoreVehicleDetails" 
              class="mt-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium focus:outline-none"
            >
              {{ showMoreVehicleDetails ? 'Show Less' : 'Show More Details' }}
            </button>
          </div>
        </transition>
      </div>

      <!-- Description field with character count -->
      <div class="form-group">
        <label for="description" class="block text-sm font-medium text-gray-700 mb-1">
          Project Description
          <span class="text-gray-500 text-xs ml-2">({{ 500 - (formData.description?.length || 0) }} characters remaining)</span>
        </label>
        <textarea 
          v-model="formData.description" 
          id="description" 
          rows="4" 
          maxlength="500" 
          class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Enter a description of your project..."
        ></textarea>
      </div>

      <!-- Action buttons -->
      <div class="form-actions flex flex-col sm:flex-row gap-3 sm:justify-end mt-8">
        <button 
          type="button" 
          class="w-full sm:w-auto px-6 py-3 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          @click="cancelEdit"
        >
          Cancel
        </button>
        <button 
          type="submit" 
          class="w-full sm:w-auto px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50"
          :disabled="isSubmitting"
        >
          <span v-if="isSubmitting" class="inline-flex items-center">
            <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Saving...
          </span>
          <span v-else>
            {{ isEditing ? 'Update Project' : 'Create Project' }}
          </span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import axios from 'axios';
import { useProjectStore } from '@/stores/projectStore';
import { useErrorStore } from '@/stores/errorStore';

// Initialize stores and router instances
const projectStore = useProjectStore();
const errorStore = useErrorStore();
const router = useRouter();
const route = useRoute();

// Reactive variables
const formData = ref({
  projectId: '',
  projectName: '',
  description: '',
  startDate: new Date().toISOString().substr(0, 10), // Default to today
  endDate: '',
  status: 'In Progress',
  owner: '',
  vin: '',
  make: '',
  model: '',
  year: '',
  manufacturer: '',
  bodyClass: '',
  displacementCC: '',
  engineConfiguration: '',
  engineCylinders: '',
  engineHP: '',
  fuelTypePrimary: '',
  gvwr: '',
  plantCountry: '',
  series: '',
  valveTrainDesign: '',
  tasks: [],
  parts: [],
  costs: [],
  imageUrls: [],
});

// UI state variables
const isEditing = ref(false);
const isSubmitting = ref(false);
const isVinLoading = ref(false);
const showVehicleDetails = ref(false);
const showMoreVehicleDetails = ref(false);
const errors = ref({});

const emit = defineEmits(['updateProject', 'addProject', 'cancelEdit']);

// Computed properties
const projectId = computed(() => formData.value.projectId);
const projectName = computed(() => formData.value.projectName);

// Show vehicle details if VIN data is present
watch(() => formData.value.vin, (newVal) => {
  if (newVal && (formData.value.make || formData.value.model || formData.value.year)) {
    showVehicleDetails.value = true;
  }
});

// Initialize form data when the component is mounted
onMounted(async () => {
  if (route.params.id) {
    isEditing.value = true;
    await projectStore.fetchProjects();
    const existingProject = await projectStore.fetchProjectById(route.params.id);
    if (existingProject) {
      formData.value = { ...existingProject };
      
      // If there's VIN data, show the vehicle section
      if (formData.value.vin && (formData.value.make || formData.value.model)) {
        showVehicleDetails.value = true;
      }
    } else {
      errorStore.showError('Project not found');
      router.push('/projects');
    }
  }
});

const validateForm = () => {
  const newErrors = {};
  
  // Required fields validation
  if (!formData.value.projectName || formData.value.projectName.trim() === '') {
    newErrors.projectName = 'Project name is required';
  }
  
  if (!formData.value.owner || formData.value.owner.trim() === '') {
    newErrors.owner = 'Owner is required';
  }
  
  if (!formData.value.startDate) {
    newErrors.startDate = 'Start date is required';
  }
  
  // VIN validation
  if (formData.value.vin && !isValidVin(formData.value.vin)) {
    newErrors.vin = 'VIN must be 17 characters and contain only allowed characters (no I, O, Q)';
  }
  
  // End date validation
  if (formData.value.endDate && formData.value.startDate && 
      new Date(formData.value.endDate) < new Date(formData.value.startDate)) {
    newErrors.endDate = 'End date cannot be before start date';
  }
  
  errors.value = newErrors;
  return Object.keys(newErrors).length === 0;
};

const fetchVehicleData = async () => {
  const vin = formData.value.vin.trim().toUpperCase();
  formData.value.vin = vin; // Update VIN in formData to uppercase
  errors.value.vin = null;

  if (!isValidVin(vin)) {
    errors.value.vin = 'VIN must be 17 characters and contain only allowed characters (no I, O, Q)';
    clearVehicleData();
    return;
  }

  try {
    isVinLoading.value = true;
    const vehicleData = await decodeVIN(vin);
    
    // Check for errors in the response
    if (vehicleData.ErrorCode && vehicleData.ErrorCode !== '0') {
      handleVinErrors(vehicleData.ErrorCode, vehicleData.ErrorText);
      clearVehicleData();
      return;
    }

    // Map vehicle data to formData
    formData.value.make = vehicleData.Make || '';
    formData.value.model = vehicleData.Model || '';
    formData.value.year = vehicleData.ModelYear || '';
    formData.value.manufacturer = vehicleData.Manufacturer || '';
    formData.value.bodyClass = vehicleData.BodyClass || '';
    formData.value.displacementCC = vehicleData.DisplacementCC || '';
    formData.value.engineConfiguration = vehicleData.EngineConfiguration || '';
    formData.value.engineCylinders = vehicleData.EngineCylinders || '';
    formData.value.engineHP = vehicleData.EngineHP || '';
    formData.value.fuelTypePrimary = vehicleData.FuelTypePrimary || '';
    formData.value.gvwr = vehicleData.GVWR || '';
    formData.value.plantCountry = vehicleData.PlantCountry || '';
    formData.value.series = vehicleData.Series || '';
    formData.value.valveTrainDesign = vehicleData.ValveTrainDesign || '';
    
    // Show the vehicle details section
    showVehicleDetails.value = true;
    
    // Success message
    errorStore.showNotification('Vehicle information loaded successfully', 'success');
  } catch (error) {
    console.error('Error decoding VIN:', error);
    errorStore.showError('Failed to decode VIN. Please check your network connection and try again.');
    clearVehicleData();
  } finally {
    isVinLoading.value = false;
  }
};

const isValidVin = (vin) => {
  const vinRegex = /^[A-HJ-NPR-Z0-9]{17}$/;
  return vinRegex.test(vin);
};

// Function to decode VIN using NHTSA API
const decodeVIN = async (vin) => {
  const url = `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValuesExtended/${vin}?format=json`;
  try {
    const response = await axios.get(url);
    const vehicleData = response.data.Results[0];
    return vehicleData;
  } catch (error) {
    console.error('Error decoding VIN:', error);
    throw error;
  }
};

const handleVinErrors = (errorCodeStr, errorTextStr) => {
  const errorCodes = errorCodeStr.split(',');
  const errorMessages = errorTextStr.split(';').map(msg => msg.trim());

  // Create a map of error codes to messages
  const errorMap = {};
  errorCodes.forEach((code, index) => {
    errorMap[code.trim()] = errorMessages[index] || 'Unknown error';
  });

  // Display errors to the user
  let fullErrorMessage = 'VIN decoding errors:\n';
  for (const code in errorMap) {
    fullErrorMessage += `${errorMap[code]}\n`;
  }

  errorStore.showError(fullErrorMessage);
};

// Toggle visibility of vehicle details section
const toggleVehicleSection = () => {
  showVehicleDetails.value = !showVehicleDetails.value;
};

// Toggle visibility of more vehicle details
const toggleMoreVehicleDetails = () => {
  showMoreVehicleDetails.value = !showMoreVehicleDetails.value;
};

const handleProjectSave = async () => {
  // Validate form first
  if (!validateForm()) {
    errorStore.showError('Please fix the errors in the form before submitting.');
    return;
  }
  
  try {
    isSubmitting.value = true;
    
    if (isEditing.value) {
      // Update existing project
      await projectStore.updateProject(projectId.value, formData.value);
      emit('updateProject', formData.value);
      errorStore.showNotification('Project updated successfully', 'success');
    } else {
      // Add new project
      const newProjectId = await projectStore.addProject(formData.value);
      formData.value.projectId = newProjectId; // Assign the new ID
      emit('addProject', formData.value);
      errorStore.showNotification('Project created successfully', 'success');
    }

    clearFormData();
    router.push('/projects');
  } catch (error) {
    errorStore.showError(error.message || 'An unexpected error occurred');
  } finally {
    isSubmitting.value = false;
  }
};

// Cancel editing or adding a project
const cancelEdit = () => {
  emit('cancelEdit');
  clearFormData();
  router.push('/projects');
};

// Clear form data
const clearFormData = () => {
  formData.value = {
    projectId: null,
    projectName: '',
    description: '',
    startDate: new Date().toISOString().substr(0, 10),
    endDate: '',
    status: 'In Progress',
    owner: '',
    vin: '',
    make: '',
    model: '',
    year: '',
    manufacturer: '',
    bodyClass: '',
    displacementCC: '',
    engineConfiguration: '',
    engineCylinders: '',
    engineHP: '',
    fuelTypePrimary: '',
    gvwr: '',
    plantCountry: '',
    series: '',
    valveTrainDesign: '',
    tasks: [],
    parts: [],
    costs: [],
    imageUrls: [],
  };
  showVehicleDetails.value = false;
  showMoreVehicleDetails.value = false;
  errors.value = {};
};

// Function to clear vehicle data
const clearVehicleData = () => {
  formData.value.make = '';
  formData.value.model = '';
  formData.value.year = '';
  formData.value.manufacturer = '';
  formData.value.bodyClass = '';
  formData.value.displacementCC = '';
  formData.value.engineConfiguration = '';
  formData.value.engineCylinders = '';
  formData.value.engineHP = '';
  formData.value.fuelTypePrimary = '';
  formData.value.gvwr = '';
  formData.value.plantCountry = '';
  formData.value.series = '';
  formData.value.valveTrainDesign = '';
};
</script>

<style scoped>
/* Transition animations */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s, max-height 0.3s ease-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  max-height: 0;
  overflow: hidden;
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
  max-height: 1000px;
}
</style>