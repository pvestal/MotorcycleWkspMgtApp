<template>
  <div>
    <h2>Edit User</h2>
    <form @submit.prevent="submitEdit">
      <div>
        <label>Email</label>
        <input type="email" v-model="userData.email" disabled />
      </div>
      <div>
        <label>Display Name</label>
        <input type="text" v-model="userData.displayName" />
      </div>
      <div>
        <label>Role</label>
        <select v-model="userData.role">
          <option value="customer">Customer</option>
          <option value="admin">Admin</option>
          <option value="mechanic">Mechanic</option>
          <option value="sales">Sales</option>
        </select>
      </div>
      <div>
        <label>Status</label>
        <select v-model="userData.userStatus">
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>
      <button type="submit">Save Changes</button>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useUserStore } from "../../stores/userStore";
import { useRoute, useRouter } from "vue-router";

const userStore = useUserStore();
const route = useRoute();
const router = useRouter();

let userId = route.params.id;

const userData = ref({
  email: "",
  displayName: "",
  role: "customer",
  userStatus: "active",
});

const loadUser = () => {
  const user = userStore.users.find(user => user.uid === userId);
  if (user) {
    userData.value = { ...user }; // Populate the form with the user's data
  }
};

const submitEdit = async () => {
  await userStore.updateUser(userId, userData.value);
  router.push({ name: "UserManagement" });
};

watch(
  () => route.params.id,
  async (newId) => {
    userId = newId;
    loadUser();
  }
);

onMounted(async () => {
  if (!userStore.users.length) {
    await userStore.fetchAllUsers(); // Fetch users if not already loaded
  }
  loadUser();
});
</script>
