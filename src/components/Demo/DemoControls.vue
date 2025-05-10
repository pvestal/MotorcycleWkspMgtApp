<template>
  <div v-if="isDemoActive || showDemoButton" class="demo-controls" :class="{ 'floating': floating }">
    <div v-if="isDemoActive" class="demo-status">
      <div class="demo-timer">
        <span class="material-symbols-outlined">timer</span>
        <span class="time-remaining">{{ formattedTime }}</span>
      </div>
      <div class="demo-message">
        Demo Mode: Explore premium features for a limited time!
      </div>
      <div class="demo-actions">
        <button class="signup-button" @click="handleSignUp">Sign Up Now</button>
        <button class="learn-more-button" @click="toggleFeatureInfo">
          {{ showFeatureInfo ? 'Hide Features' : 'See Demo Features' }}
        </button>
      </div>
    </div>
    <div v-else-if="showDemoButton && !isDemoActive" class="demo-cta">
      <button class="activate-demo-button" @click="activateDemo">
        <span class="material-symbols-outlined">play_arrow</span>
        Try Demo Mode
      </button>
    </div>
    
    <div v-if="showFeatureInfo && isDemoActive" class="demo-features-info">
      <h3>Available in Demo Mode:</h3>
      <ul>
        <li>
          <span class="material-symbols-outlined">emoji_objects</span>
          <span>Project Management: Create and manage motorcycle projects</span>
        </li>
        <li>
          <span class="material-symbols-outlined">handyman</span>
          <span>Parts Catalog: Browse and search motorcycle parts</span>
        </li>
        <li>
          <span class="material-symbols-outlined">task</span>
          <span>Task Tracking: Create and assign maintenance tasks</span>
        </li>
        <li>
          <span class="material-symbols-outlined">paid</span>
          <span>Cost Tracking: Log and monitor maintenance costs</span>
        </li>
      </ul>
      <p class="demo-note">Note: All demo data will be reset after 24 hours</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/userStore';
import { 
  initDemoService, 
  activateDemo as activateDemoMode, 
  isDemoActive as checkDemoActive, 
  getFormattedRemainingTime,
  getRemainingDemoTime
} from '@/services/demoService';

const props = defineProps({
  floating: {
    type: Boolean,
    default: false
  },
  showDemoButton: {
    type: Boolean,
    default: true
  }
});

const router = useRouter();
const userStore = useUserStore();
const isDemoActive = ref(false);
const formattedTime = ref('');
const showFeatureInfo = ref(false);
const refreshTimerInterval = ref<number | null>(null);

// Update the timer display
const updateTimer = () => {
  if (isDemoActive.value) {
    formattedTime.value = getFormattedRemainingTime();
    
    // If demo time reaches 0, disable demo mode
    if (getRemainingDemoTime() <= 0) {
      isDemoActive.value = false;
      clearInterval(refreshTimerInterval.value as number);
      
      // Refresh the page to reflect demo expiration
      window.location.reload();
    }
  }
};

// Handle sign up button click
const handleSignUp = () => {
  router.push({ name: 'SignUp' });
};

// Toggle feature info display
const toggleFeatureInfo = () => {
  showFeatureInfo.value = !showFeatureInfo.value;
};

// Activate demo mode
const activateDemo = async () => {
  const success = activateDemoMode();
  if (success) {
    isDemoActive.value = true;
    
    // Set up timer refresh
    updateTimer();
    refreshTimerInterval.value = setInterval(updateTimer, 60000) as unknown as number; // Update every minute
    
    // If user is not logged in, ensure anonymous login
    if (!userStore.user) {
      await userStore.loginAnonymously();
    }
  }
};

onMounted(() => {
  initDemoService();
  isDemoActive.value = checkDemoActive();
  
  if (isDemoActive.value) {
    updateTimer();
    // Set up interval to update the timer
    refreshTimerInterval.value = setInterval(updateTimer, 60000) as unknown as number; // Update every minute
  }
});

onBeforeUnmount(() => {
  if (refreshTimerInterval.value) {
    clearInterval(refreshTimerInterval.value);
  }
});
</script>

<style scoped>
.demo-controls {
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 1rem;
  margin: 1rem 0;
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;
  overflow: hidden;
  max-width: 100%;
}

.demo-controls.floating {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 100;
  max-width: 350px;
  border-radius: var(--radius-lg);
  background-color: var(--color-bg-secondary);
  box-shadow: var(--shadow-lg);
  border: 2px solid var(--color-primary);
  padding: 0.75rem;
}

.demo-status {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.demo-timer {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: var(--color-primary);
}

.demo-timer .material-symbols-outlined {
  font-size: 1.25rem;
}

.time-remaining {
  font-size: 0.9rem;
}

.demo-message {
  font-size: 1rem;
  color: var(--color-text-primary);
}

.demo-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.signup-button, .learn-more-button, .activate-demo-button {
  padding: 0.5rem 1rem;
  border-radius: var(--radius-md);
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.signup-button {
  background-color: var(--color-primary);
  color: white;
}

.signup-button:hover {
  background-color: var(--color-primary-hover);
  transform: translateY(-2px);
}

.learn-more-button {
  background-color: transparent;
  border: 1px solid var(--color-primary);
  color: var(--color-primary);
}

.learn-more-button:hover {
  background-color: var(--color-bg-accent);
}

.activate-demo-button {
  background-color: var(--color-primary);
  color: white;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.2rem;
  font-size: 1rem;
}

.activate-demo-button:hover {
  background-color: var(--color-primary-hover);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.activate-demo-button .material-symbols-outlined {
  font-size: 1.2rem;
}

.demo-features-info {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--color-border);
  animation: fadeIn 0.3s ease;
}

.demo-features-info h3 {
  font-size: 1rem;
  margin-bottom: 0.75rem;
  color: var(--color-text-primary);
}

.demo-features-info ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.demo-features-info li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: var(--color-text-secondary);
}

.demo-features-info li .material-symbols-outlined {
  color: var(--color-primary);
  font-size: 1.1rem;
}

.demo-note {
  font-size: 0.8rem;
  color: var(--color-text-tertiary);
  margin-top: 0.75rem;
  font-style: italic;
}

.demo-cta {
  display: flex;
  justify-content: center;
}

/* Animation */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .demo-controls.floating {
    left: 10px;
    right: 10px;
    max-width: none;
  }
  
  .demo-actions {
    flex-direction: column;
  }
  
  .signup-button, .learn-more-button {
    width: 100%;
  }
}
</style>