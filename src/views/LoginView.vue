<template>
  <div class="login-view-container">
    <div class="auth-container">
      <h1 class="auth-title">{{ mode === 'signup' ? 'Sign Up' : 'Login' }}</h1>
      <p class="auth-description">{{ mode === 'signup' ? 'Create your account to start tracking your motorcycle projects' : 'Welcome back! Log in to continue' }}</p>
      
      <div v-if="userStore.isLoading">
        <div class="loading-indicator">Loading...</div>
      </div>
      <div v-else-if="userStore.user === null">
        <button @click="loginWithGoogle" id="loginGoogleBtn" class="google-auth-btn">
          <span class="google-icon"></span>
          {{ mode === 'signup' ? 'Sign up with Google' : 'Login with Google' }}
        </button>
        <div class="divider">
          <span>OR</span>
        </div>
        <button @click="loginAnonymously" id="loginAnonymousBtn" class="guest-auth-btn">
          Continue as Guest
        </button>
      </div>
      <div v-else-if="userStore.isAnonymous">
        <p class="guest-message" v-if="isDemoActive">You're currently using the demo mode!</p>
        <p class="guest-message" v-else>You're currently browsing as a guest.</p>

        <div v-if="isDemoActive" class="demo-time-info">
          <span class="material-symbols-outlined">timer</span>
          <span>{{ formattedTime }} remaining</span>
        </div>

        <p class="upgrade-message">Sign in to save your progress and access all features:</p>
        <button @click="loginWithGoogle" id="loginGoogleBtn" class="google-auth-btn">
          <span class="google-icon"></span>
          {{ mode === 'signup' ? 'Sign up with Google' : 'Login with Google' }}
        </button>

        <div v-if="isDemoActive" class="demo-features">
          <h3>Demo Features Available:</h3>
          <ul>
            <li>Project Management</li>
            <li>Parts Catalog</li>
            <li>Task Tracking</li>
            <li>Cost Management</li>
          </ul>
          <p class="demo-note">Note: Demo access expires in {{ formattedTime }}</p>
        </div>
      </div>
      <div v-else>
        <p class="welcome-message">Welcome, {{ userStore.userDisplayName }}!</p>
        <button @click="logOut" id="logoutBtn" class="logout-btn">Logout</button>
      </div>
      
      <div class="auth-switch">
        {{ mode === 'signup' ? 'Already have an account?' : 'Don\'t have an account?' }}
        <router-link :to="{ name: mode === 'signup' ? 'Login' : 'SignUp' }">
          {{ mode === 'signup' ? 'Login' : 'Sign Up' }}
        </router-link>
      </div>
    </div>

    <userProfileComponent v-if="userStore.isAuthenticated && !userStore.isAnonymous" :user="userStore.user" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useUserStore } from '../stores/userStore';
import { useErrorStore } from '@/stores/errorStore';
import userProfileComponent from '../components/Users/userProfileComponent.vue'
import { defineProps } from 'vue';
import {
  initDemoService,
  isDemoActive as checkDemoActive,
  getFormattedRemainingTime
} from '@/services/demoService';

const props = defineProps({
  mode: {
    type: String,
    default: 'login'
  }
});

const userStore = useUserStore();
const errorStore = useErrorStore();
const isDemoActive = ref(false);
const formattedTime = ref('');

// Update timer periodically
const updateTimer = () => {
  if (isDemoActive.value) {
    formattedTime.value = getFormattedRemainingTime();
  }
};

// Update demo status
onMounted(() => {
  initDemoService();
  isDemoActive.value = checkDemoActive();
  updateTimer();

  // Refresh timer every minute
  const interval = setInterval(updateTimer, 60000);

  // We'll omit cleanup as this component is unmounted with page navigation
});

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
.login-view-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 1rem;
}

.auth-container {
  max-width: 450px;
  width: 100%;
  margin: 0 auto 3rem;
  padding: 2.5rem 2rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg, 12px);
  background-color: var(--color-bg-secondary, #ffffff);
  box-shadow: var(--shadow-md, 0 4px 6px rgba(0, 0, 0, 0.1));
  text-align: center;
}

.auth-title {
  font-size: 2rem;
  margin-bottom: 1rem;
  color: var(--color-text-primary, #2d3748);
  font-weight: 700;
}

.auth-description {
  font-size: 1rem;
  margin-bottom: 2rem;
  color: var(--color-text-secondary, #4a5568);
}

.loading-indicator {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100px;
  font-size: 1rem;
  color: var(--color-text-secondary, #4a5568);
}

.google-auth-btn, .guest-auth-btn, .logout-btn {
  width: 100%;
  padding: 0.875rem 1.5rem;
  border: none;
  border-radius: var(--radius-md, 8px);
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  transition: all 0.2s ease;
}

.google-auth-btn {
  background-color: #ffffff;
  color: #757575;
  border: 1px solid #dadce0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.google-auth-btn:hover {
  background-color: #f8f9fa;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.12);
}

.google-icon {
  width: 18px;
  height: 18px;
  margin-right: 10px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'%3E%3Cdefs%3E%3Cpath id='a' d='M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z'/%3E%3C/defs%3E%3CclipPath id='b'%3E%3Cuse href='%23a' overflow='visible'/%3E%3C/clipPath%3E%3Cpath clip-path='url(%23b)' fill='%23FBBC05' d='M0 37V11l17 13z'/%3E%3Cpath clip-path='url(%23b)' fill='%23EA4335' d='M0 11l17 13 7-6.1L48 14V0H0z'/%3E%3Cpath clip-path='url(%23b)' fill='%2334A853' d='M0 37l30-23 7.9 1L48 0v48H0z'/%3E%3Cpath clip-path='url(%23b)' fill='%234285F4' d='M48 48L17 24l-4-3 35-10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
}

.guest-auth-btn {
  background-color: var(--color-primary, #4fd1c5);
  color: white;
}

.guest-auth-btn:hover {
  background-color: var(--color-primary-hover, #38b2ac);
  transform: translateY(-1px);
}

.logout-btn {
  background-color: #f56565;
  color: white;
}

.logout-btn:hover {
  background-color: #e53e3e;
}

.divider {
  display: flex;
  align-items: center;
  margin: 1.5rem 0;
  color: var(--color-text-secondary, #4a5568);
  font-size: 0.875rem;
}

.divider::before, .divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background-color: var(--color-border, #e2e8f0);
}

.divider span {
  padding: 0 1rem;
}

.guest-message {
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
  color: var(--color-text-primary, #2d3748);
}

.upgrade-message {
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
  color: var(--color-text-secondary, #4a5568);
}

.welcome-message {
  font-size: 1.25rem;
  font-weight: 500;
  margin-bottom: 1.5rem;
  color: var(--color-text-primary, #2d3748);
}

.auth-switch {
  margin-top: 1.5rem;
  font-size: 0.9rem;
  color: var(--color-text-secondary, #4a5568);
}

.auth-switch a {
  color: var(--color-primary, #4fd1c5);
  font-weight: 500;
  margin-left: 0.5rem;
  text-decoration: none;
}

.auth-switch a:hover {
  text-decoration: underline;
}

/* Demo-specific styles */
.demo-time-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding: 0.5rem 1rem;
  background-color: rgba(79, 209, 197, 0.1);
  border-radius: var(--radius-md, 8px);
  color: var(--color-primary, #4fd1c5);
}

.demo-time-info .material-symbols-outlined {
  font-size: 1.25rem;
}

.demo-features {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--color-border, #e2e8f0);
  text-align: left;
}

.demo-features h3 {
  font-size: 1.1rem;
  margin-bottom: 0.75rem;
  color: var(--color-text-primary, #2d3748);
}

.demo-features ul {
  list-style-type: none;
  padding: 0;
  margin: 0 0 1rem 0;
}

.demo-features li {
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--color-border, #e2e8f0);
  font-size: 0.9rem;
  color: var(--color-text-secondary, #4a5568);
}

.demo-features li:before {
  content: '✓';
  color: var(--color-primary, #4fd1c5);
  margin-right: 0.5rem;
}

.demo-note {
  font-size: 0.8rem;
  color: var(--color-text-tertiary, #718096);
  margin-top: 0.75rem;
  font-style: italic;
}

@media (max-width: 480px) {
  .auth-container {
    padding: 1.5rem 1rem;
  }

  .auth-title {
    font-size: 1.5rem;
  }

  .auth-description {
    font-size: 0.9rem;
  }
}
</style>
