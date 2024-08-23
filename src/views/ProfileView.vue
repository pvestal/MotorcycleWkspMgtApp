<template>
  <div v-if="userProfile" class="profile-container">
    <h2>User Profile</h2>
    <div class="profile-user-email"><span class="material-symbols-outlined">email</span> {{ userProfile.email }}</div>
    <img :src="userProfile.photoURL" alt="User Photo" />
    <br>
    <div class="profile-user-role"><strong>Role:</strong> {{ userProfile.role }}</div>
    <div class="profile-user-last-login"><strong>Last Login:</strong> {{ formatTimestamp(userProfile.lastSignInTime) }}</div>
    <button class="logout" @click="logout">Logout</button>
<br>
    <div>
      <button @click="handleGetUsers">Fetch Users</button>
      <p>allUsers:</p>
      <ol v-if="allUsers.length">
        <li v-for="user in allUsers" :key="user.uid">
          Name: {{ user.displayName }} Email: {{ user.email }} Role: {{ user.role }} Photo: <img :src="user.photoURL" alt="user photo" style="width: 30px; height: 30px; border-radius: 50%;" />
        </li>
      </ol>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { signOut } from 'firebase/auth';
import {auth } from '../fbConfig'
import { useUserStore } from '../stores/userStore';

const userStore = useUserStore();
const router = useRouter();

const userProfile = ref(null);  // Ref to hold user profile data

const handleGetUsers = async () => {
  await userStore.fetchAllUsers();
}

// Fetch user data from Firestore based on authenticated user
const loadUserProfile = async () => {
  const currentUser = auth.currentUser;
  if (currentUser) {
    await userStore.fetchUser();  // Fetch user data from Firestore
    userProfile.value = userStore.currentUser;
  }
};

// Load user profile data when component mounts
onMounted(async () => {
  await loadUserProfile();
});

const allUsers = computed(() => userStore.allUsers);

const logout = async () => {
  await userStore.logout();
  router.push('/');
};

// Format timestamp using the user's local time
const formatTimestamp = (timestamp) => {
  let date;
  if (timestamp instanceof Date) {
    date = timestamp;
  } else if (timestamp && typeof timestamp.seconds === 'number') {
    date = new Date(timestamp.seconds * 1000);
  }

  if (date) {
    return new Intl.DateTimeFormat(navigator.language, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);
  } else {
    return timestamp;
  }
};

</script>

<style scoped>
.profile-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: #f9f9f9;
  position: relative;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
  font-family: Arial, sans-serif;
}

.profile-container h2 {
  margin-bottom: 16px;
  text-align: center;
  font-size: 24px;
  color: #333;
}

/* Removed unnecessary image styling */

/* Updated existing styles */
.profile-user-email,
.profile-user-role,
.profile-user-last-login {
  margin-bottom: 10px;
  font-size: 16px;
  color: #555;
}

.profile-container strong {
  color: #333;
}

.profile-container button {
  display: block;
  width: 100%;
  padding: 10px;
  border: none;
  border-radius: 4px;
  background-color: #007bff;
  color: white;
  font-size: 16px;
  cursor: pointer;
  text-align: center;
}

.profile-container button:hover {
  background-color: #0056b3;
}
</style>
