<template>
  <div class="auth-container">
    <div v-if="userStore.isLoading">
      Loading...
    </div>
    <div v-else-if="userStore.user === null">
      <label for="loginGoogleBtn">Login</label>
      <button @click="loginWithGoogle" id="loginGoogleBtn">Login with Google</button>
      <button @click="loginAnonymously" id="loginAnonymousBtn">Continue as Guest</button>
    </div>
    <div v-else-if="userStore.isAnonymous">
      <p>You're currently browsing as a guest.</p>
      <label for="loginGoogleBtn">Login</label>
      <button @click="loginWithGoogle" id="loginGoogleBtn">Login with Google</button>
    </div>
    <div v-else>
      <p>Welcome, {{ userStore.userDisplayName }}!</p>
      <label for="logoutBtn">Logout</label>
      <button @click="logOut" id="logoutBtn">Logout</button>
    </div>
  </div>

  <userProfileComponent v-if="userStore.isAuthenticated && !userStore.isAnonymous" :user="userStore.user" />
</template>

<script setup>
// import { watch } from 'vue';
import { useUserStore } from '../stores/userStore'; 
import { useErrorStore } from '@/stores/errorStore';
import userProfileComponent from '../components/Users/userProfileComponent.vue'

const userStore = useUserStore(); 
const errorStore = useErrorStore();

// watch(() => userStore.user, (newUser) => {
//   console.log("User state changed:", newUser);
// }, { deep: true });

const loginWithGoogle = async () => {
  console.log("Initiating Google login");
  try {
    await userStore.loginWithGoogle();
  } catch (error) {
    console.error("Google login error:", error);
    errorStore.showError('Google login error: ' + error.message);
  }
};

const loginAnonymously = async () => {
  console.log("Initiating anonymous login");
  try {
    await userStore.loginAnonymously();
  } catch (error) {
    console.error("Anonymous login error:", error);
    errorStore.showError('Anonymous login error: ' + error.message);
  }
};

const logOut = async () => {
  try {
    await userStore.logout();
    console.log("User logged out");
  } catch (error) {
    console.error("Error logging out:", error);
    errorStore.showError('Error logging out: ' + error.message);
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
