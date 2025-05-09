<template>
  <div class="profile-page">
    <div v-if="userProfile" class="profile-container">
      <div class="profile-header">
        <h1>User Profile</h1>
        <div class="profile-actions">
          <button @click="navigateToSubscription" class="subscription-btn hover-effect">
            <span class="material-symbols-outlined">workspace_premium</span>
            Subscription
          </button>
          <button @click="logout" class="logout-btn">
            <span class="material-symbols-outlined">logout</span>
            Logout
          </button>
        </div>
      </div>
      
      <div class="profile-content">
        <div class="profile-main">
          <div class="profile-avatar">
            <img :src="userProfile.photoURL || defaultAvatar" alt="User Photo" />
            <button class="change-avatar-btn">
              <span class="material-symbols-outlined">photo_camera</span>
            </button>
          </div>
          
          <div class="profile-info">
            <h2>{{ userProfile.displayName || 'User' }}</h2>
            <div class="profile-user-email">
              <span class="material-symbols-outlined">email</span> 
              {{ userProfile.email || 'No email provided' }}
            </div>
            
            <div class="profile-user-role">
              <span class="material-symbols-outlined">person</span> 
              Role: {{ userProfile.role || 'Standard User' }}
            </div>
            
            <div class="profile-user-last-login">
              <span class="material-symbols-outlined">event</span> 
              Last Login: {{ formatTimestamp(userProfile.lastLoginAt) }}
            </div>
            
            <div v-if="userProfile.subscriptionType && userProfile.subscriptionType !== 'free'" class="profile-subscription">
              <span class="material-symbols-outlined">workspace_premium</span>
              Subscription: {{ formatSubscriptionName(userProfile.subscriptionType) }}
            </div>
          </div>
        </div>
        
        <userPointsBadgesRole v-if="isAuthenticated" :user="userProfile" class="points-badges-section" />
        
        <div class="advanced-settings">
          <h3>Advanced Settings</h3>
          <div class="settings-toggles">
            <div class="toggle-item">
              <label>
                <span>Show Debug Info</span>
                <input type="checkbox" v-model="showDebugInfo">
                <span class="toggle-switch"></span>
              </label>
            </div>
          </div>
          
          <userProfileComponent v-if="isAuthenticated && showDebugInfo" :user="userProfile" />
        </div>
      </div>
    </div>
    
    <div v-else class="loading-container">
      <div class="loading-spinner"></div>
      <p>Loading profile...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/userStore';
import userProfileComponent from '@/components/Users/userProfileComponent.vue';
import userPointsBadgesRole from '@/components/Users/userPointsBadgesRole.vue';

const userStore = useUserStore();
const router = useRouter();

const userProfile = ref(null);  // Ref to hold user profile data
const isAuthenticated = ref(userStore.isAuthenticated);
const showDebugInfo = ref(false);
const defaultAvatar = 'https://api.dicebear.com/9.x/avataaars/svg?seed=default&radius=50';

// Fetch user data from Firestore based on authenticated user
const loadUserProfile = async () => {
  const currentUser = userStore.currentUser;
  if (currentUser) {
    await userStore.fetchUser();  // Fetch user data from Firestore
    userProfile.value = userStore.currentUser;
  }
};

// Load user profile data when component mounts
onMounted(async () => {
  userStore.fetchUser();
  await loadUserProfile();
});

// Navigate to subscription page
const navigateToSubscription = () => {
  router.push('/subscription');
};

// Logout function
const logout = async () => {
  await userStore.logout();
  router.push('/');
};

// Format timestamp using the user's local time
const formatTimestamp = (timestamp) => {
  let date;
  if (timestamp instanceof Date) {
    date = timestamp;
  } else if (timestamp && typeof timestamp.seconds === 'number') {
    date = new Date(timestamp.seconds * 1000);
  }

  if (date) {
    return new Intl.DateTimeFormat(navigator.language, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } else {
    return timestamp || 'N/A';
  }
};

// Format subscription name
const formatSubscriptionName = (subscriptionType) => {
  if (!subscriptionType) return 'Free';
  
  const subscriptionNames = {
    'free': 'Free',
    'standard': 'Standard',
    'premium': 'Premium',
    'professional': 'Professional'
  };
  
  return subscriptionNames[subscriptionType] || subscriptionType.charAt(0).toUpperCase() + subscriptionType.slice(1);
};

</script>

<style scoped>
.profile-page {
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

.profile-container {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  font-family: 'Inter', sans-serif;
}

.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e2e8f0;
}

.profile-header h1 {
  font-size: 1.8rem;
  color: #1a202c;
  margin: 0;
  font-weight: 700;
}

.profile-actions {
  display: flex;
  gap: 12px;
}

.subscription-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background-color: #4fd1c5;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.subscription-btn:hover {
  background-color: #38b2ac;
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background-color: #e2e8f0;
  color: #4a5568;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.logout-btn:hover {
  background-color: #cbd5e0;
}

.profile-content {
  padding: 30px;
}

.profile-main {
  display: flex;
  gap: 24px;
  margin-bottom: 40px;
}

.profile-avatar {
  position: relative;
}

.profile-avatar img {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #4fd1c5;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.change-avatar-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #4fd1c5;
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.change-avatar-btn:hover {
  background-color: #38b2ac;
  transform: scale(1.1);
}

.change-avatar-btn .material-symbols-outlined {
  font-size: 18px;
}

.profile-info {
  flex: 1;
}

.profile-info h2 {
  font-size: 1.5rem;
  color: #1a202c;
  margin: 0 0 16px 0;
  font-weight: 600;
}

.profile-user-email,
.profile-user-role,
.profile-user-last-login,
.profile-subscription {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  font-size: 1rem;
  color: #4a5568;
}

.profile-subscription {
  color: #38b2ac;
  font-weight: 500;
}

.points-badges-section {
  margin-bottom: 40px;
  padding: 24px;
  background-color: #f7fafc;
  border-radius: 10px;
}

.advanced-settings {
  border-top: 1px solid #e2e8f0;
  padding-top: 30px;
}

.advanced-settings h3 {
  font-size: 1.2rem;
  color: #1a202c;
  margin: 0 0 16px 0;
}

.settings-toggles {
  margin-bottom: 20px;
}

.toggle-item {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.toggle-item label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  cursor: pointer;
}

.toggle-item label span:first-child {
  color: #4a5568;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
  background-color: #e2e8f0;
  border-radius: 12px;
  transition: all 0.3s;
}

.toggle-switch::after {
  content: '';
  position: absolute;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background-color: white;
  top: 3px;
  left: 3px;
  transition: all 0.3s;
}

input[type="checkbox"] {
  display: none;
}

input[type="checkbox"]:checked + .toggle-switch {
  background-color: #4fd1c5;
}

input[type="checkbox"]:checked + .toggle-switch::after {
  transform: translateX(26px);
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(79, 209, 197, 0.3);
  border-radius: 50%;
  border-top-color: #4fd1c5;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.material-symbols-outlined {
  vertical-align: middle;
  font-size: 20px;
}

/* Responsive styles */
@media (max-width: 768px) {
  .profile-main {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .profile-avatar {
    margin-bottom: 20px;
  }
  
  .profile-info {
    width: 100%;
  }
  
  .profile-user-email,
  .profile-user-role,
  .profile-user-last-login,
  .profile-subscription {
    justify-content: center;
  }
  
  .profile-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .profile-actions {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .profile-actions {
    flex-direction: column;
  }
  
  .subscription-btn,
  .logout-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
