<template>
  <header class="navbar">
    <nav class="top-nav">
      <div class="user-avatar" @click="toggleSidebar">
        <!-- Always display an avatar, either user-specific or random -->
        <img :src="user?.photoURL || avatarURL" alt="User Avatar" />
      </div>
    </nav>

    <!-- Sidebar -->
    <aside :class="{ 'sidebar-open': sidebarOpen }" class="sidebar">
      <div class="sidebar-content">
        <!-- If user is not logged in, show public sidebar links -->
        <ul v-if="!loggedIn" class="nav-links">
          <li @click="navigate('/')"><span class="material-symbols-outlined">home</span> Home</li>
          <li @click="navigate('/about')"><span class="material-symbols-outlined">info</span> About Us</li>
          <li @click="navigate('/login')"><span class="material-symbols-outlined">login</span> Login/Register</li>
        </ul>

        <!-- If user is logged in, show profile section and user-specific links -->
        <div v-if="loggedIn" class="profile-section" @click="navigate('/profile')">
          <img :src="user.photoURL || avatarURL" alt="User Avatar" class="profile-avatar" />
          <h3 v-if="user.displayName"><span class="material-symbols-outlined">person</span> {{ user.displayName }}</h3>
          <p v-if="user.email"><span class="material-symbols-outlined">email</span> {{ user.email }}</p>
          <p v-if="user.role"><span class="material-symbols-outlined">build</span> {{ user.role }}</p>
        </div>
        
        <ul v-if="loggedIn" class="nav-links">
          <li @click="navigate('/')"><span class="material-symbols-outlined">home</span> Home</li>
          <li @click="navigate('/profile')"><span class="material-symbols-outlined">account_box</span> Profile</li>
          <li @click="handleLogout"><span class="material-symbols-outlined">logout</span> Logout</li>
        </ul>

        <!-- Admin-specific links -->
        <ul v-if="isAdmin" class="nav-links">
          <li><span class="material-symbols-outlined">key</span> Reserved</li>
          <li @click="navigate('/users')"><span class="material-symbols-outlined">manage_accounts</span> User Management</li>
          <li @click="navigate('/tasks')"><span class="material-symbols-outlined">menu</span> Tasks</li>
          <li @click="navigate('/projects')"><span class="material-symbols-outlined">emoji_objects</span> Projects</li>
          <li @click="navigate('/costs')"><span class="material-symbols-outlined">paid</span> Costs</li>
          <li @click="navigate('/parts')"><span class="material-symbols-outlined">handyman</span> Parts</li>
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
import { ref, watch, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { auth } from '../fbConfig';
import { useUserStore } from '@/stores/userStore';

const router = useRouter();
const userStore = useUserStore();

const sidebarOpen = ref(false);

const props = defineProps({
  projectId: {
    type: String,
    required: false,
  },
});

// Computed properties for reactivity
const loggedIn = computed(() => userStore.isAuthenticated);
const isAdmin = computed(() => userStore.isAdmin);

// Reactive references
const user = ref(null);
const avatarURL = ref("");

// Function to fetch a random avatar URL
const fetchRandomAvatar = () => {
  const seed = Math.random().toString(36).substring(7);
  avatarURL.value = `https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}&radius=50`;
};

// Function to load user profile
const loadUserProfile = async () => {
  const currentUser = auth.currentUser;
  if (currentUser) {
    await userStore.fetchUser();
    user.value = userStore.currentUser;
  }

  // Use user photo if available, otherwise generate a random avatar
  if (!user.value?.photoURL) {
    fetchRandomAvatar();
  }
};

onMounted(() => {
  loadUserProfile();
});

// Toggle sidebar visibility
const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value;
};

// Navigate to a specific route and close the sidebar
const navigate = (path) => {
  router.push(path).then(() => {
    sidebarOpen.value = false;
  });
};

// Handle logout functionality
const handleLogout = async () => {
  try {
    await userStore.logout();
    sidebarOpen.value = false;
    navigate('/login');
  } catch (error) {
    console.error("Logout failed:", error);
    // Optionally, display an error message to the user
  }
};

// Watch for changes in the currentUser to update the avatar if necessary
watch(() => userStore.currentUser, (newUser) => {
  user.value = newUser;
  if (!newUser?.photoURL) {
    fetchRandomAvatar();
  }
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
  border: 4px solid #4fd1c5;
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
  display: flex;
  align-items: center;
}

.nav-links li span.material-symbols-outlined {
  margin-right: 8px;
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

.material-symbols-outlined {
  vertical-align: -5px;
}
</style>