<template>
  <header class="navbar">
    <!-- Logo section on the left -->
    <div class="logo-section">
      <img src="../assets/Logo.PNG" alt="MotoCraft Logo" />
      <h1>MotoCraft-TwoHeads</h1>
    </div>
    
    <!-- Navigation and controls on the right -->
    <nav class="top-nav">
      <ThemeToggle class="theme-toggle" />
      <div class="user-avatar" @click="toggleSidebar">
        <!-- Always display an avatar, either user-specific or random -->
        <img :src="user?.photoURL || avatarURL" alt="User Avatar" />
      </div>
    </nav>

    <!-- Sidebar with improved transitions -->
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
          <img :src="user?.photoURL || avatarURL" alt="User Avatar" class="profile-avatar" />
          <h3 v-if="user?.displayName"><span class="material-symbols-outlined">person</span> {{ user?.displayName }}</h3>
          <p v-if="user?.email"><span class="material-symbols-outlined">email</span> {{ user?.email }}</p>
          <p v-if="user?.role"><span class="material-symbols-outlined">build</span> {{ user?.role }}</p>
        </div>
        
        <ul v-if="loggedIn" class="nav-links">
          <li @click="navigate('/')"><span class="material-symbols-outlined">home</span> Home</li>
          <li @click="navigate('/profile')"><span class="material-symbols-outlined">account_box</span> Profile</li>
          <li @click="handleLogout"><span class="material-symbols-outlined">logout</span> Logout</li>
        </ul>

        <!-- Admin-specific links -->
        <ul v-if="isAdmin" class="nav-links">
          <li @click="navigate('/projects')"><span class="material-symbols-outlined">emoji_objects</span> Projects</li>
          <li @click="navigate('/tasks')"><span class="material-symbols-outlined">task</span> Tasks</li>
          <li @click="navigate('/parts')"><span class="material-symbols-outlined">handyman</span> Parts</li>
          <li @click="navigate('/part-catalog')"><span class="material-symbols-outlined">menu_book</span> Part Catalog</li>
          <li @click="navigate('/costs')"><span class="material-symbols-outlined">paid</span> Costs</li>
          <li @click="navigate('/inventory')"><span class="material-symbols-outlined">inventory_2</span> Inventory</li>
        </ul>
        
        <!-- All users - subscription links -->
        <ul v-if="loggedIn" class="nav-links">
          <li @click="navigate('/subscription')"><span class="material-symbols-outlined">subscriptions</span> Subscription</li>
          <li @click="navigate('/helpdesk')" v-if="canAccessHelpdesk || isAdmin"><span class="material-symbols-outlined">support_agent</span> Helpdesk Support</li>
        </ul>

        <button class="close-btn hover-effect" @click="toggleSidebar">Close Menu</button>
      </div>
    </aside>
  </header>
  
  <!-- Main content with transition -->
  <main>
    <RouterView v-slot="{ Component }">
      <transition name="page" mode="out-in">
        <component :is="Component" />
      </transition>
    </RouterView>
  </main>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { auth } from '../fbConfig';
import { useUserStore } from '@/stores/userStore';
import { useHelpdeskStore } from '@/stores/helpdeskStore';
import ThemeToggle from '@/components/Theme/ThemeToggle.vue';
import { useThemeStore } from '@/stores/themeStore';
import { User } from '@/types';

// Initialize router and stores
const router = useRouter();
const userStore = useUserStore();
const themeStore = useThemeStore();
const helpdeskStore = useHelpdeskStore();

// State
const sidebarOpen = ref<boolean>(false);
const user = ref<User | null>(null);
const avatarURL = ref<string>("");

// Props definition with TypeScript
interface NavBarProps {
  projectId?: string;
}

const props = withDefaults(defineProps<NavBarProps>(), {
  projectId: undefined
});

// Computed properties for reactivity
const loggedIn = computed<boolean>(() => userStore.isAuthenticated);
const isAdmin = computed<boolean>(() => userStore.isAdmin);
const canAccessHelpdesk = computed<boolean>(() => {
  if (!userStore.currentUser) return false;
  
  // Only premium and professional subscribers can access helpdesk
  const premiumPlans = ['premium', 'professional'];
  return premiumPlans.includes(userStore.currentUser.subscriptionType || '') &&
         userStore.currentUser.subscriptionStatus === 'active';
});

// Function to fetch a random avatar URL
const fetchRandomAvatar = (): void => {
  const seed = Math.random().toString(36).substring(7);
  avatarURL.value = `https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}&radius=50`;
};

// Function to load user profile
const loadUserProfile = async (): Promise<void> => {
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

// Toggle sidebar visibility
const toggleSidebar = (): void => {
  sidebarOpen.value = !sidebarOpen.value;
};

// Navigate to a specific route and close the sidebar
const navigate = (path: string): void => {
  router.push(path).then(() => {
    sidebarOpen.value = false;
  });
};

// Handle logout functionality
const handleLogout = async (): Promise<void> => {
  try {
    await userStore.logout();
    sidebarOpen.value = false;
    navigate('/login');
  } catch (error) {
    console.error("Logout failed:", error);
    // Optionally, display an error message to the user
  }
};

// Lifecycle hooks
onMounted(() => {
  loadUserProfile();
});

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
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
  background-color: var(--color-navbar-bg);
  color: white;
  box-shadow: var(--shadow-md);
  position: sticky;
  top: 0;
  z-index: var(--z-index-sticky);
  transition: background-color var(--transition-normal), box-shadow var(--transition-normal);
}

/* Logo section */
.logo-section {
  display: flex;
  align-items: center;
}

.logo-section img {
  height: 36px;
  margin-right: 12px;
}

.logo-section h1 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

/* Top Navigation */
.top-nav {
  display: flex;
  align-items: center;
  gap: 16px;
}

.theme-toggle {
  margin-right: 8px;
}

.user-avatar {
  cursor: pointer;
  position: relative;
  transition: transform 0.2s ease;
}

.user-avatar:hover {
  transform: scale(1.05);
}

.user-avatar img {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: 3px solid var(--color-primary);
  transition: all var(--transition-normal);
  object-fit: cover;
  box-shadow: var(--shadow-sm);
}

.user-avatar img:hover {
  border-color: var(--color-primary-hover);
  box-shadow: var(--shadow-md);
}

/* Sidebar styles */
.sidebar {
  position: fixed;
  top: 0;
  right: -100%;
  width: 100%;
  max-width: 320px;
  height: 100%;
  background-color: var(--color-sidebar-bg);
  color: var(--color-text-inverse);
  transition: all var(--transition-normal);
  z-index: var(--z-index-modal);
  box-shadow: var(--shadow-lg);
  overflow-y: auto;
}

/* Ensure sidebar text is white in dark mode */
:global(.dark) .sidebar {
  color: white;
}

.sidebar-open {
  right: 0;
}

.sidebar-content {
  padding: 24px;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.profile-section {
  text-align: center;
  margin-bottom: 24px;
  padding: 16px;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.profile-section:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.profile-avatar {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  margin-bottom: 16px;
  border: 4px solid var(--color-primary);
  object-fit: cover;
  box-shadow: var(--shadow-md);
  transition: all var(--transition-normal);
}

.profile-section:hover .profile-avatar {
  transform: scale(1.05);
}

.profile-section h3 {
  margin: 8px 0;
  font-size: 18px;
}

.profile-section h3 .material-symbols-outlined,
.profile-section p .material-symbols-outlined {
  margin-right: 6px;
  vertical-align: middle;
  font-size: 18px;
  color: inherit; /* Inherit color from parent */
}

.profile-section p {
  margin: 4px 0;
  font-size: 14px;
  opacity: 0.8;
}

.nav-links {
  list-style: none;
  padding: 0;
  margin-bottom: 16px;
}

.nav-links li {
  margin-bottom: 8px;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  padding: 12px 16px;
}

.nav-links li span.material-symbols-outlined {
  margin-right: 12px;
  font-size: 20px;
  color: inherit; /* Inherit from parent for consistent coloring */
}

.nav-links li:hover {
  background-color: var(--color-primary);
  color: var(--color-text-inverse);
  transform: translateX(4px);
}

.nav-links li:active {
  transform: translateX(4px) scale(0.98);
}

.close-btn {
  margin-top: auto;
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  display: block;
  width: 100%;
  padding: 12px 20px;
  background-color: var(--color-primary);
  border-radius: var(--radius-md);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  transition: all var(--transition-fast);
  box-shadow: var(--shadow-sm);
}

.close-btn:hover {
  background-color: var(--color-primary-hover);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.close-btn:active {
  transform: translateY(1px);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

/* Responsive Design for Mobile */
@media (max-width: 768px) {
  .navbar {
    padding: 10px 16px;
  }
  
  .logo-section h1 {
    font-size: 16px;
  }
  
  .user-avatar img {
    width: 38px;
    height: 38px;
  }

  .sidebar {
    width: 85%;
  }
  
  .profile-section {
    padding: 12px;
  }
  
  .nav-links li {
    padding: 10px 12px;
  }
}

/* For very small screens */
@media (max-width: 480px) {
  .logo-section h1 {
    display: none;
  }
}

.material-symbols-outlined {
  vertical-align: middle;
}

/* Make icons white when in dark mode */
:global(.dark) .material-symbols-outlined {
  color: white;
}

:global(.light) .material-symbols-outlined {
  color: inherit;
}
</style>