import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

import App from './App.vue';
import router from './router';
import { useUserStore } from './stores/userStore';

const app = createApp(App);

app.use(createPinia());
app.use(router);

const auth = getAuth();

function handleUserStateChange(user) {
  const userStore = useUserStore();

  if (user) {
    // If a user is logged in, set the user state
    userStore.setUser({
      uid: user.uid,
      displayName: user.displayName || 'Anonymous',
      email: user.email || 'unknown@unknown.com',
      photoURL: user.photoURL || '',
      role: user.role || 'customer',
      userStatus: user.userStatus || 'active',
    });
  } else {
    // If no user is logged in, initiate anonymous login
    userStore.loginAnonymously();
  }
}

// Handle user authentication state globally
onAuthStateChanged(auth, handleUserStateChange);

app.mount('#app');
