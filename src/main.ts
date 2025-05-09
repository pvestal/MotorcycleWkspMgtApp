import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';

import App from './App.vue';
import router from './router';
import { useUserStore } from './stores/userStore';

// Import global styles and theme
import './assets/theme.css';

// Create Vue app instance
const app = createApp(App);

// Initialize Pinia and router
app.use(createPinia());
app.use(router);

// Get Firebase auth instance
const auth = getAuth();

// Set up authentication state listener
onAuthStateChanged(auth, async (user: User | null) => {
  const userStore = useUserStore();

  if (user) {
    const isAnonymous = user.isAnonymous;
    if (isAnonymous) {
      await userStore.loginAnonymously();
    } else {
      await userStore.fetchUser();
    }
  } else {
    await userStore.loginAnonymously();
  }
});

// Mount the app
app.mount('#app');