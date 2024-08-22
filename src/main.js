import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { getAuth, onAuthStateChanged } from 'firebase/auth'; // Import Firebase auth
import { useUserStore } from './stores/userStore'; // Import Pinia userStore

import App from './App.vue';
import router from './router';

const app = createApp(App);

app.use(createPinia());
app.use(router);

// Initialize Firebase Auth
const auth = getAuth();

// Firebase auth state listener
onAuthStateChanged(auth, (user) => {
    const userStore = useUserStore();

    if (user) {
        // User is signed in, call setUser with user data
        userStore.setUser({
            uid: user.uid,
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            role: user.role,
        });
    } else {
        // User is signed out, clear the user state
        userStore.clearUser();
    }
});

app.mount('#app');
