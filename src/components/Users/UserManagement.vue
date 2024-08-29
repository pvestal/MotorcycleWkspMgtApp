<template>
  <div class="admin-dashboard">
    <h2>User Management Dashboard</h2>
    <p v-if="!isAdmin">You do not have permission to view this page.</p>
    <div v-if="isAdmin">
      <button class="load-users-btn" @click="fetchAllUsers">
        <span class="material-symbols-outlined">refresh</span> Load Users
      </button>
      <table v-if="users.length" class="styled-table">
        <thead>
          <tr>
            <th>Email</th>
            <th>Display Name</th>
            <th>User Photo</th>
            <th>Role</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.uid">
            <td>{{ user.email }}</td>
            <td>{{ user.displayName }}</td>
            <td><img :src="user.photoURL" alt="user avatar" class="user-avatar" /></td>
            <td>{{ user.role }}</td>
            <td>{{ user.userStatus }}</td>
            <td>
              <button class="action-btn edit-btn" @click="editUser(user)">
                <span class="material-symbols-outlined">edit</span>
              </button>
              <button class="action-btn delete-btn" @click="deleteUser(user.uid)">
                <span class="material-symbols-outlined">delete</span>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { useUserStore } from "../../stores/userStore";
import { computed } from "vue";
import { useRouter } from "vue-router";

const userStore = useUserStore();
const router = useRouter();

const isAdmin = computed(() => userStore.isAdmin);
const users = computed(() => userStore.users);

const fetchAllUsers = async () => {
  await userStore.fetchAllUsers();
};

const editUser = (user) => {
  // Navigate to the edit page with the user's ID
  router.push({ name: 'EditUser', params: { id: user.uid } });
};


const deleteUser = async (uid) => {
  if (confirm("Are you sure you want to delete this user?")) {
    await userStore.deleteUser(uid);
  }
};
</script>

<style scoped>
.admin-dashboard {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.load-users-btn {
  background-color: #007bff;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
}

.load-users-btn .material-symbols-outlined {
  font-size: 20px;
}

.styled-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

.styled-table th,
.styled-table td {
  padding: 12px 15px;
  text-align: left;
}

.styled-table thead tr {
  background-color: #007bff;
  color: white;
}

.styled-table tbody tr {
  border-bottom: 1px solid #dddddd;
}

.styled-table tbody tr:nth-of-type(even) {
  background-color: #f3f3f3;
}

.styled-table tbody tr:last-of-type {
  border-bottom: 2px solid #007bff;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.action-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #555;
  font-size: 24px;
  margin-right: 8px;
}

.edit-btn:hover {
  color: #007bff;
}

.delete-btn:hover {
  color: #ff5252;
}
</style>
