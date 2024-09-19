<template>
  <div class="form-container">
    <!-- Back button -->
    <button @click="cancelEdit">Back</button>

    <form @submit.prevent="handleProjectSave">
      <!-- Project Name Input -->
      <div class="form-group">
        <label for="projectName">Project Name:</label>
        <input type="text" v-model="formData.projectName" id="projectName" class="form-control" required />
      </div>

      <!-- Project ID (display only) -->
      <p v-if="projectId">Project ID: {{ projectId }}</p>

      <!-- Meta Information (make editable) -->
      <div class="form-group inline-group">
        <label for="owner">Owner:</label>
        <input type="text" v-model="formData.owner" id="owner" class="form-control" required />

        <label for="status">Status:</label>
        <select v-model="formData.status" id="status" class="form-control" required>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
          <option value="On Hold">On Hold</option>
        </select>
      </div>

      <!-- Start Date and End Date -->
      <div class="form-group inline-group">
        <div class="date-field">
          <label for="startDate">Start Date:</label>
          <input type="date" v-model="formData.startDate" id="startDate" class="form-control" required />
        </div>
        <div class="date-field">
          <label for="endDate">End Date:</label>
          <input type="date" v-model="formData.endDate" id="endDate" class="form-control" />
        </div>
      </div>

      <!-- VIN Input Field -->
      <div class="form-group">
        <label for="vin">VIN:</label>
        <input type="text" v-model="formData.vin" id="vin" class="form-control" @change="fetchVehicleData"
          maxlength="17" required />
      </div>

      <!-- Display Vehicle Details -->
      <!-- Start Date and End Date -->
      <div class="form-group inline-group">
        <div class="form-group">
          <label for="make">Make:</label>
          <input type="text" v-model="formData.make" id="make" class="form-control" readonly />
        </div>
        <div class="form-group">
          <label for="model">Model:</label>
          <input type="text" v-model="formData.model" id="model" class="form-control" readonly />
        </div>
        <div class="form-group">
          <label for="year">Year:</label>
          <input type="text" v-model="formData.year" id="year" class="form-control" readonly />
        </div>
      </div>

      <!-- Additional Vehicle Fields -->
      <div class="form-group">
        <label for="manufacturer">Manufacturer:</label>
        <input type="text" v-model="formData.manufacturer" id="manufacturer" class="form-control" readonly />
      </div>
      <div class="form-group">
        <label for="bodyClass">Body Class:</label>
        <input type="text" v-model="formData.bodyClass" id="bodyClass" class="form-control" readonly />
      </div>
      <div class="form-group">
        <label for="displacementCC">Displacement (CC):</label>
        <input type="text" v-model="formData.displacementCC" id="displacementCC" class="form-control" readonly />
      </div>
      <div class="form-group">
        <label for="engineConfiguration">Engine Configuration:</label>
        <input type="text" v-model="formData.engineConfiguration" id="engineConfiguration" class="form-control"
          readonly />
      </div>
      <div class="form-group">
        <label for="engineCylinders">Engine Cylinders:</label>
        <input type="text" v-model="formData.engineCylinders" id="engineCylinders" class="form-control" readonly />
      </div>
      <div class="form-group">
        <label for="engineHP">Engine Horsepower (HP):</label>
        <input type="text" v-model="formData.engineHP" id="engineHP" class="form-control" readonly />
      </div>
      <div class="form-group">
        <label for="fuelTypePrimary">Fuel Type:</label>
        <input type="text" v-model="formData.fuelTypePrimary" id="fuelTypePrimary" class="form-control" readonly />
      </div>
      <div class="form-group">
        <label for="gvwr">GVWR:</label>
        <input type="text" v-model="formData.gvwr" id="gvwr" class="form-control" readonly />
      </div>
      <div class="form-group">
        <label for="plantCountry">Plant Country:</label>
        <input type="text" v-model="formData.plantCountry" id="plantCountry" class="form-control" readonly />
      </div>
      <div class="form-group">
        <label for="series">Series:</label>
        <input type="text" v-model="formData.series" id="series" class="form-control" readonly />
      </div>
      <div class="form-group">
        <label for="valveTrainDesign">Valve Train Design:</label>
        <input type="text" v-model="formData.valveTrainDesign" id="valveTrainDesign" class="form-control" readonly />
      </div>

      <!-- Action buttons -->
      <div class="form-actions">
        <button type="submit" class="btn-submit">
          {{ isEditing ? 'Update Project' : 'Add Project' }}
        </button>
        <button type="button" class="btn-cancel" @click="cancelEdit">Cancel</button>
      </div>
    </form>
  </div>
</template>



<script setup>
import { ref, onMounted, computed } from 'vue';
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
  startDate: '',
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

const isEditing = ref(false);

const emit = defineEmits(['updateProject', 'addProject', 'cancelEdit']);

// Computed properties
const projectId = computed(() => formData.value.projectId);
const projectName = computed(() => formData.value.projectName);

// Initialize form data when the component is mounted
onMounted(async () => {
  if (route.params.id) {
    isEditing.value = true;
    await projectStore.fetchProjects();
    const existingProject = projectStore.fetchProjectById(route.params.id);
    if (existingProject) {
      formData.value = { ...existingProject };
      // Fetch vehicle data if VIN is present
      if (formData.value.vin) {
        await fetchVehicleData();
      }
    } else {
      errorStore.showError('Project not found');
      router.push('/projects');
    }
  }
});
const fetchVehicleData = async () => {
  let vin = formData.value.vin.trim().toUpperCase();
  formData.value.vin = vin; // Update VIN in formData to uppercase

  if (!isValidVin(vin)) {
    errorStore.showError('VIN must be 17 characters and contain only allowed characters (no I, O, Q).');
    clearVehicleData();
    return;
  }

    try {
      const vehicleData = await decodeVIN(vin);
      console.log('Vehicle Data:', vehicleData);

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

    } catch (error) {
      console.error('Error decoding VIN:', error);
      errorStore.showError('Failed to decode VIN. Please check your network connection and try again.');
      clearVehicleData();
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


const handleProjectSave = async () => {
  try {
    if (isEditing.value) {
      // Update existing project
      await projectStore.updateProject(projectId.value, formData.value);
      emit('updateProject', formData.value);
    } else {
      // Add new project
      const newProjectId = await projectStore.addProject(formData.value);
      formData.value.projectId = newProjectId; // Assign the new ID
      emit('addProject', formData.value);
    }

    clearFormData();
    router.push('/projects');
  } catch (error) {
    errorStore.showError(error.message || 'An unexpected error occurred');
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
    startDate: '',
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
/* Matching ViewProject styling */
.form-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: #f9f9f9;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  font-family: 'Arial', sans-serif;
}

.project-meta p {
  margin: 8px 0;
}

.project-detail-container button {
  margin-right: 15px;
}

h1 {
  font-size: 24px;
  margin-bottom: 10px;
}

/* Meta information section */
.project-meta {
  padding: 10px 0;
  border-bottom: 1px solid #ddd;
}

.material-symbols-outlined {
  font-size: 24px;
  cursor: pointer;
}

/* For expanding/collapsing sections */
.additional-fields {
  padding: 15px 0;
  transition: all 0.3s ease;
}

/* Action buttons (submit and cancel) */
.form-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
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
</style>