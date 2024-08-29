<template>
  <div class="auth-container">
    <label v-if="!userStore.isAuthenticated" for="loginGoogleBtn">Login</label>
    <button v-if="!userStore.isAuthenticated" @click="loginWithGoogle" name="loginGoogleBtn">Login with Google</button>

    <label v-if="userStore.isAuthenticated" for="logoutBtn">Logout</label>
    <button v-if="userStore.isAuthenticated" @click="logOut" name="logoutBtn">Logout</button>
  </div>

  <userProfileComponent v-if="userStore.isAuthenticated" :user="userStore.user" />
</template>


<script setup>
import { onMounted } from 'vue';
import { useUserStore } from '../stores/userStore'; 
import { useErrorStore } from '@/stores/errorStore';
import userProfileComponent from '../components/Users/userProfileComponent.vue'


const userStore = useUserStore(); 
const errorStore = useErrorStore();

onMounted(async () => {
  await userStore.fetchUser(); // Fetch user details on mount if already logged in
});

const loginWithGoogle = async () => {
  try {
    await userStore.loginWithGoogle();  // Use the login action from userStore
  } catch (error) {
    errorStore.showError('Google login error:', error.message);
  }
};

const logOut = async () => {
  try {
    await userStore.logout();
    console.log("User logged out");
  } catch (error) {
    errorStore.showError('Error logging out:', error.message);
  }
};
</script>


<style scoped>
.auth-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: #f9f9f9;
}

.auth-container h2 {
  margin-bottom: 16px;
}

.auth-container form {
  margin-bottom: 20px;
}

.auth-container label {
  display: block;
  margin-bottom: 8px;
}

.auth-container input {
  width: 100%;
  padding: 8px;
  margin-bottom: 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.auth-container button {
  width: 100%;
  padding: 10px;
  border: none;
  border-radius: 4px;
  background-color: #007bff;
  color: white;
  font-size: 16px;
  cursor: pointer;
  margin-bottom: 12px;
}

.auth-container button:hover {
  background-color: #0056b3;
}
</style>
