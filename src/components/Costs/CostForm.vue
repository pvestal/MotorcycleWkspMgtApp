<template>
  <div>
    <!-- Toggle Button -->
    <button class="btn-toggle" @click="toggleForm">
      {{ showForm ? 'Hide Form' : 'Show Form' }}
    </button>

    <!-- Form Container (Visible based on showForm state) -->
    <div v-if="showForm" class="form-container">
      <!-- <h2 class="form-title">{{ isEditing ? 'Edit' : 'Add' }} Item</h2> -->
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="priority">Priority:</label>
          <select v-model="item.priority" id="priority" class="form-control">
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
        </div>
        <div class="form-group">
          <label for="status">Status:</label>
          <select v-model="item.status" id="status" class="form-control">
            <option>Pending</option>
            <option>In Progress</option>
            <option>Completed</option>
          </select>
        </div>
        <div class="form-group">
          <label for="itemTitle">Item Title:</label>
          <input type="text" v-model="item.itemTitle" id="itemTitle" class="form-control" required maxlength="255" />
        </div>
        
        <div class="form-actions">
          <button type="submit" class="btn-submit">{{ isEditing ? 'Update' : 'Add' }} Item</button>
          <button type="button" class="btn-cancel" @click="cancelEdit">Cancel</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { usetaskStore } from '../../stores/taskStore';
import { useErrorStore } from '../../stores/errorStore';

const taskStore = usetaskStore();
const errorStore = useErrorStore();
const router = useRouter();
const route = useRoute();

const item = ref({ priority: 'Medium', status: 'Pending', itemTitle: '' });
const isEditing = ref(false);
const showForm = ref(false); // State to control form visibility

onMounted(() => {
  if (route.params.id) {
    isEditing.value = true;
    const existingItem = taskStore.items.find(i => i.id === route.params.id);
    if (existingItem) {
      item.value = { ...existingItem };
      showForm.value = true; // Automatically show the form when editing
    } else {
      errorStore.showError("Item not found");
      router.push('/progress');
    }
  }
});

const handleSubmit = async () => {
  try {
    if (isEditing.value) {
      await taskStore.updateItem(route.params.id, item.value);
      this.item = { priority: 'Medium', status: 'Pending', itemTitle: '' }
    } else {
      await taskStore.addItem(item.value);
      this.item = { priority: 'Medium', status: 'Pending', itemTitle: '' }
    }
    router.push('/tasks');
  } catch (error) {
    errorStore.showError(error.message || "An unexpected error occurred");
  }
};

const cancelEdit = () => {
  router.push('/tasks');
};

const toggleForm = () => {
  showForm.value = !showForm.value;
};
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
