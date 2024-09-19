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

onAuthStateChanged(auth, async (user) => {
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

app.mount('#app');