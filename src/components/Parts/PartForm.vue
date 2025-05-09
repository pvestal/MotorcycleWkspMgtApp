<template>
  <div class="form-container">
    <h2 class="form-title">{{ isEditing ? 'Edit Part' : 'Add Part' }}</h2>

    <!-- Loading state -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
    </div>

    <!-- Error message -->
    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <form v-if="!loading" @submit.prevent="handleSubmit">
      <!-- Part Name -->
      <div class="form-group">
        <label for="partName" class="form-label required-field">Part Name</label>
        <input 
          type="text" 
          v-model="part.partName" 
          id="partName" 
          class="form-input" 
          required 
          maxlength="255" 
        />
      </div>

      <!-- Part Number -->
      <div class="form-group">
        <label for="partNumber" class="form-label">Part Number</label>
        <input 
          type="text" 
          v-model="part.partNumber" 
          id="partNumber" 
          class="form-input" 
          placeholder="Enter part number for inventory tracking" 
        />
      </div>

      <div class="form-row">
        <!-- Price -->
        <div class="form-group">
          <label for="price" class="form-label">Price</label>
          <input 
            type="number" 
            v-model="part.price" 
            id="price" 
            class="form-input" 
            min="0" 
            step="0.01" 
            placeholder="0.00" 
          />
        </div>

        <!-- Quantity -->
        <div class="form-group">
          <label for="quantity" class="form-label">Quantity</label>
          <input 
            type="number" 
            v-model="part.quantity" 
            id="quantity" 
            class="form-input" 
            min="1" 
            step="1" 
            placeholder="1" 
          />
        </div>
      </div>

      <div class="form-row">
        <!-- Part Status -->
        <div class="form-group">
          <label for="partStatus" class="form-label">Part Status</label>
          <select 
            v-model="part.partStatus" 
            id="partStatus" 
            class="form-select"
          >
            <option value="Ordered">Ordered</option>
            <option value="Shipped">Shipped</option>
            <option value="BackOrder">BackOrder</option>
            <option value="Installed">Installed</option>
          </select>
        </div>

        <!-- Part Priority -->
        <div class="form-group">
          <label for="partPriority" class="form-label">Priority</label>
          <select 
            v-model="part.partPriority" 
            id="partPriority" 
            class="form-select"
          >
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      <!-- Part Description (Optional) -->
      <div class="form-group">
        <label for="description" class="form-label">Description</label>
        <textarea 
          v-model="part.description" 
          id="description" 
          rows="3" 
          class="form-textarea"
          placeholder="Enter any additional details about this part"
        ></textarea>
        <div class="form-helper-text">This field is optional</div>
      </div>

      <!-- Form Actions -->
      <div class="form-actions">
        <button 
          type="button" 
          @click="cancelEdit" 
          class="btn btn-secondary"
        >
          Cancel
        </button>
        <button 
          type="submit" 
          class="btn btn-primary"
        >
          {{ isEditing ? 'Update' : 'Add' }} Part
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { usePartStore } from '../../stores/partStore';
import { useErrorStore } from '../../stores/errorStore';
import { useInventoryStore } from '../../stores/inventoryStore';
import '@/assets/form-styles.css';

const partStore = usePartStore();
const errorStore = useErrorStore();
const inventoryStore = useInventoryStore();
const router = useRouter();
const route = useRoute();

// State variables
const loading = ref(true);
const error = ref('');
const isEditing = ref(false);

// Default part data
const part = ref({ 
  partPriority: 'Medium', 
  partStatus: 'Ordered', 
  partName: '',
  description: '',
  partNumber: '', // Added partNumber field to track in inventory
  price: 0,       // Added price for inventory
  quantity: 1,    // Default quantity
  projectId: route.params.projectId || '' 
});

// Load part data if editing
onMounted(async () => {
  try {
    // If there are no parts in the store, fetch them
    if (partStore.parts.length === 0) {
      await partStore.fetchParts();
    }

    if (route.params.id) {
      isEditing.value = true;
      const existingPart = partStore.parts.find(i => i.id === route.params.id);
      
      if (existingPart) {
        part.value = { ...existingPart };
      } else {
        error.value = "Part not found";
        setTimeout(() => {
          router.push('/parts');
        }, 3000);
      }
    }
  } catch (err) {
    error.value = err.message || "Failed to load part data";
  } finally {
    loading.value = false;
  }
});

// Form validation
const validateForm = () => {
  if (!part.value.partName.trim()) {
    error.value = "Part name is required";
    return false;
  }
  
  // If partNumber is provided, validate related fields
  if (part.value.partNumber && part.value.partNumber.trim() !== '') {
    // Validate price is a valid number
    if (isNaN(parseFloat(part.value.price)) || parseFloat(part.value.price) < 0) {
      error.value = "Please enter a valid price (0 or greater)";
      return false;
    }
    
    // Validate quantity is a positive integer
    if (!Number.isInteger(Number(part.value.quantity)) || Number(part.value.quantity) < 1) {
      error.value = "Quantity must be a positive whole number";
      return false;
    }
  }
  
  return true;
};

// Form submission handler
const handleSubmit = async () => {
  if (!validateForm()) return;
  
  error.value = '';
  loading.value = true;
  
  try {
    if (isEditing.value) {
      await partStore.updatePart(route.params.id, part.value);
      errorStore.showNotification('Part updated successfully', 'success');
    } else {
      // Add part to part store
      const addedPart = await partStore.addPart(part.value);
      errorStore.showNotification('Part added successfully', 'success');
      
      // If part has a part number, also add to inventory
      if (part.value.partNumber && part.value.partNumber.trim() !== '') {
        try {
          // Create inventory item from part data
          const inventoryItem = {
            partNumber: part.value.partNumber,
            description: part.value.description || part.value.partName,
            manufacturer: '', // Could be added to part form later
            category: 'Motorcycle Parts',
            price: parseFloat(part.value.price) || 0,
            quantity: parseInt(part.value.quantity) || 1,
            reorderThreshold: 5,
            status: part.value.partStatus === 'Ordered' ? 'on_order' : 'in_stock',
            location: 'Main Warehouse'
          };
          
          await inventoryStore.addInventoryItem(inventoryItem);
          errorStore.showNotification('Part added to inventory', 'success');
        } catch (inventoryErr) {
          // Don't fail the entire operation if inventory update fails
          console.error('Failed to add to inventory:', inventoryErr);
          errorStore.showError('Part added but failed to update inventory: ' + inventoryErr.message);
        }
      }
    }
    router.push('/parts');
  } catch (err) {
    error.value = err.message || "An unexpected error occurred";
    errorStore.showError(error.value);
  } finally {
    loading.value = false;
  }
};

// Cancel edit/add
const cancelEdit = () => {
  router.push('/parts');
};
</script>

<style scoped>
/* Component-specific styles or overrides can go here */
</style>