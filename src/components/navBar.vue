<template>
  <header class="navbar">
    <!-- Right User Avatar for Profile Sidebar -->
    <nav class="top-nav">
      <div v-if="loggedIn" class="user-avatar" @click="toggleSidebar">
        <img v-if="user.photoURL" :src="user.photoURL" alt="User Avatar" />
      </div>
      <div v-else class="user-avatar" @click="toggleSidebar">
        <img :src="avatarURL" alt="Random Avatar" />
      </div>
    </nav>

    <!-- Sidebar -->
    <aside :class="{ 'sidebar-open': sidebarOpen }" class="sidebar">
      <div class="sidebar-content">
        <div v-if="loggedIn" class="profile-section" @click="navigate('/profile')">
          <img v-if="user.photoURL" :src="user.photoURL" alt="User Avatar" class="profile-avatar" />
          <h3>{{ user.displayName }}</h3>
          <p>{{ user.email }}</p>
          <p><span class="material-symbols-outlined">build</span> {{ user.role }}</p>
        </div>

        <ul v-if="loggedIn" class="nav-links">
          <li @click="navigate('/profile')"><span class="material-symbols-outlined">account_box</span> Profile</li>
          <li @click="navigate('/login')"><span class="material-symbols-outlined">logout</span> Logout</li>
          <li><span class="material-symbols-outlined">key</span> Reserved</li>
          <li @click="navigate('/admin')"><span class="material-symbols-outlined">manage_accounts</span> Admin</li>
          <!-- <li @click="navigate('/admin/edit/:id')">Edit User</li> -->
          <li @click="navigate('/progress')"><span class="material-symbols-outlined">menu</span> Todo List</li>
          <li @click="navigate('/about')"><span class="material-symbols-outlined">info</span> About Us</li>
        </ul>
        <ul v-if="!loggedIn" class="nav-links">
          <li @click="navigate('/about')"><span class="material-symbols-outlined">info</span> About Us</li>
          <li @click="navigate('/login')"><span class="material-symbols-outlined">login</span> Login/Register</li>
        </ul>
        <button class="close-btn" @click="toggleSidebar">Close</button>
      </div>
    </aside>
  </header>
  <main>
    <RouterView />
  </main>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/userStore'; // Import the userStore from Pinia

const router = useRouter();
const userStore = useUserStore(); // Access the userStore

const loggedIn = ref(userStore.isAuthenticated); // Bind to store's auth status
const sidebarOpen = ref(false);  // Toggle state for the right sidebar

const user = ref(userStore.user); // Bind to user info in the store
const avatarURL = ref(""); // Variable to hold the random avatar URL

// Function to fetch a random avatar URL
const fetchRandomAvatar = () => {
  const seed = Math.random().toString(36).substring(7);
  avatarURL.value = `https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}&radius=50`;
};

// Fetch the random avatar on component mount if not logged in
onMounted(() => {
  if (!loggedIn.value) {
    fetchRandomAvatar();
  }
});

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value;
};

// Updated navigate function to close the sidebar after navigation
const navigate = (path) => {
  router.push(path).then(() => {
    sidebarOpen.value = false; // Close the sidebar after navigation
  });
};

// Watch for changes in userStore to update the component's state
watch(() => userStore.isAuthenticated, (newVal) => {
  loggedIn.value = newVal;
  if (!newVal) {
    fetchRandomAvatar(); // Fetch a new random avatar when user logs out
  }
});

watch(() => userStore.user, (newUser) => {
  user.value = newUser;
});
</script>

<style scoped>
/* Navbar styles */
@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@48,400,0,0');

.navbar {
  display: flex;
  justify-content: flex-end; /* Aligns content to the right */
  align-items: center;
  padding: 10px 20px;
  background-color: #1a202c;
  color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Top Navigation */
.top-nav {
  display: flex;
  align-items: center;
}

.user-avatar {
  cursor: pointer;
}

.user-avatar img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid #4fd1c5;
  transition: border-color 0.3s ease;
}

.user-avatar img:hover {
  border-color: #2d3748;
}

/* Sidebar styles */
.sidebar {
  position: fixed;
  top: 0;
  right: -100%;
  width: 100%;
  max-width: 300px;
  height: 100%;
  background-color: #2d3748;
  color: #fff;
  transition: right 0.3s ease;
  z-index: 1000;
  box-shadow: -2px 0 5px rgba(0, 0, 0, 0.5);
}

.sidebar-open {
  right: 0;
}

.sidebar-content {
  padding: 20px;
}

.profile-section {
  text-align: center;
  margin-bottom: 20px;
}

.profile-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  margin-bottom: 10px;
  border: 3px solid #4fd1c5;
}

.nav-links {
  list-style: none;
  padding: 0;
}

.nav-links li {
  padding: 12px 0;
  cursor: pointer;
  border-bottom: 1px solid #4a5568;
  transition: background-color 0.3s ease;
}

.nav-links li:hover {
  background-color: #4fd1c5;
  color: #1a202c;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  margin-top: 20px;
  display: block;
  margin-left: auto;
  margin-right: auto;
  padding: 10px 20px;
  background-color: #4fd1c5;
  border-radius: 4px;
  font-size: 16px;
  transition: background-color 0.3s ease;
}

.close-btn:hover {
  background-color: #38b2ac;
}

/* Responsive Design for Mobile */
@media (max-width: 768px) {
  .user-avatar img {
    width: 50px;
    height: 50px;
  }

  .sidebar {
    width: 85%;
  }
}
</style>
