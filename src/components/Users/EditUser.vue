<template>
  <div class="form-container">
    <h2 class="form-title">Edit User</h2>

    <!-- Loading state -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <div class="loading-text">Loading user data...</div>
    </div>

    <!-- Error message -->
    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <form v-if="!loading" @submit.prevent="submitEdit">
      <!-- Email field -->
      <div class="form-group">
        <label for="email" class="form-label">Email</label>
        <input
          type="email"
          id="email"
          v-model="userData.email"
          class="form-input"
          disabled
        />
        <div class="form-helper-text">Email cannot be changed</div>
      </div>

      <!-- Display Name field -->
      <div class="form-group">
        <label for="displayName" class="form-label required-field">Display Name</label>
        <input
          type="text"
          id="displayName"
          v-model="userData.displayName"
          class="form-input"
          required
        />
      </div>

      <div class="form-row">
        <!-- Role field -->
        <div class="form-group">
          <label for="role" class="form-label">Role</label>
          <select
            id="role"
            v-model="userData.role"
            class="form-select"
          >
            <option value="customer">Customer</option>
            <option value="admin">Admin</option>
            <option value="mechanic">Mechanic</option>
            <option value="sales">Sales</option>
          </select>
        </div>

        <!-- Status field -->
        <div class="form-group">
          <label for="status" class="form-label">Status</label>
          <select
            id="status"
            v-model="userData.userStatus"
            class="form-select"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      <!-- Form actions -->
      <div class="form-actions">
        <button
          type="button"
          @click="cancel"
          class="btn btn-secondary"
        >
          Cancel
        </button>
        <button
          type="submit"
          class="btn btn-primary"
        >
          Save Changes
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useUserStore } from "../../stores/userStore";
import { useErrorStore } from "../../stores/errorStore";
import { useRoute, useRouter } from "vue-router";
import '@/assets/form-styles.css';

const userStore = useUserStore();
const errorStore = useErrorStore();
const route = useRoute();
const router = useRouter();

let userId = route.params.id;

// Component state
const loading = ref(true);
const error = ref('');
const userData = ref({
  email: "",
  displayName: "",
  role: "customer",
  userStatus: "active",
});

// Load user data from store
const loadUser = async () => {
  loading.value = true;
  error.value = '';

  try {
    const user = userStore.users.find(user => user.uid === userId);
    if (user) {
      userData.value = { ...user }; // Populate the form with the user's data
    } else {
      error.value = 'User not found';

      // If the user doesn't exist after fetching all users
      if (userStore.users.length > 0) {
        setTimeout(() => {
          router.push({ name: "UserManagement" });
        }, 3000);
      }
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load user data';
    errorStore.showError(error.value);
  } finally {
    loading.value = false;
  }
};

// Form submission handler
const submitEdit = async () => {
  if (!validateForm()) return;

  loading.value = true;
  error.value = '';

  try {
    await userStore.updateUser(userId, userData.value);
    errorStore.showNotification('User updated successfully', 'success');
    router.push({ name: "UserManagement" });
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to update user';
    errorStore.showError(error.value);
    loading.value = false;
  }
};

// Form validation
const validateForm = () => {
  if (!userData.value.displayName.trim()) {
    error.value = 'Display name is required';
    return false;
  }
  return true;
};

// Cancel edit and return to user management
const cancel = () => {
  router.push({ name: "UserManagement" });
};

// Watch for route changes to update the user ID
watch(
  () => route.params.id,
  async (newId) => {
    userId = newId;
    await loadUser();
  }
);

// Load user data on component mount
onMounted(async () => {
  if (!userStore.users.length) {
    try {
      await userStore.fetchAllUsers(); // Fetch users if not already loaded
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch users';
      errorStore.showError(error.value);
    }
  }
  await loadUser();
});
</script>
