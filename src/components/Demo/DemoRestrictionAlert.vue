<template>
  <div class="demo-restriction-alert">
    <div class="alert-content">
      <div class="alert-icon">
        <span class="material-symbols-outlined">lock</span>
      </div>
      <div class="alert-message">
        <h2>Feature Restricted in Demo Mode</h2>
        <p>{{ message || 'This feature is not available in the demo version.' }}</p>
        <div class="alert-actions">
          <button class="back-button" @click="goBack">Go Back</button>
          <button class="signup-button" @click="navigateToSignUp">Sign Up for Full Access</button>
        </div>
      </div>
    </div>
    
    <div class="demo-timer" v-if="isDemoActive">
      <span class="material-symbols-outlined">timer</span>
      <span>Demo time remaining: {{ formattedTime }}</span>
    </div>
    
    <div class="available-features">
      <h3>Available in Demo Mode:</h3>
      <ul>
        <li :class="{ active: isActive('project-management') }">
          <span class="material-symbols-outlined">emoji_objects</span>
          <span>Project Management</span>
        </li>
        <li :class="{ active: isActive('parts-catalog') }">
          <span class="material-symbols-outlined">handyman</span>
          <span>Parts Catalog</span>
        </li>
        <li :class="{ active: isActive('task-tracking') }">
          <span class="material-symbols-outlined">task</span>
          <span>Task Tracking</span>
        </li>
        <li :class="{ active: isActive('cost-tracking') }">
          <span class="material-symbols-outlined">paid</span>
          <span>Cost Management</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { isDemoActive, getFormattedRemainingTime, isFeatureAvailableInDemo } from '@/services/demoService';

const props = defineProps({
  message: {
    type: String,
    default: ''
  },
  featureAttempted: {
    type: String,
    default: ''
  }
});

const router = useRouter();
const formattedTime = ref(getFormattedRemainingTime());
const demoActive = ref(isDemoActive());

// Check if a specific feature is available and highlight it accordingly
const isActive = (feature: string): boolean => {
  return isFeatureAvailableInDemo(feature);
};

// Navigation methods
const goBack = () => {
  router.back();
};

const navigateToSignUp = () => {
  router.push({ name: 'SignUp' });
};

// Update timer every minute
onMounted(() => {
  const interval = setInterval(() => {
    formattedTime.value = getFormattedRemainingTime();
  }, 60000);
  
  // Clean up interval when component unmounts
  onUnmounted(() => {
    clearInterval(interval);
  });
});
</script>

<style scoped>
.demo-restriction-alert {
  max-width: 800px;
  margin: 3rem auto;
  padding: 2rem;
  border-radius: var(--radius-lg);
  background-color: var(--color-bg-secondary);
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--color-border);
}

.alert-content {
  display: flex;
  align-items: flex-start;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.alert-icon {
  background-color: var(--color-warning-light);
  color: var(--color-warning);
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.alert-icon .material-symbols-outlined {
  font-size: 2.5rem;
}

.alert-message {
  flex-grow: 1;
}

.alert-message h2 {
  font-size: 1.5rem;
  margin-bottom: 0.75rem;
  color: var(--color-text-primary);
}

.alert-message p {
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
  color: var(--color-text-secondary);
  line-height: 1.6;
}

.alert-actions {
  display: flex;
  gap: 1rem;
}

.back-button, .signup-button {
  padding: 0.75rem 1.25rem;
  border-radius: var(--radius-md);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.back-button {
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}

.signup-button {
  background-color: var(--color-primary);
  color: white;
}

.back-button:hover, .signup-button:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.back-button:hover {
  background-color: var(--color-bg-accent);
}

.signup-button:hover {
  background-color: var(--color-primary-hover);
}

.demo-timer {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
  padding: 0.75rem 1rem;
  background-color: var(--color-bg-accent);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  justify-content: center;
}

.demo-timer .material-symbols-outlined {
  color: var(--color-primary);
  font-size: 1.25rem;
}

.available-features {
  border-top: 1px solid var(--color-border);
  padding-top: 1.5rem;
}

.available-features h3 {
  font-size: 1.1rem;
  margin-bottom: 1rem;
  color: var(--color-text-primary);
  text-align: center;
}

.available-features ul {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.available-features li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: var(--radius-md);
  background-color: var(--color-bg-tertiary);
  transition: all 0.3s ease;
  opacity: 0.7;
}

.available-features li.active {
  opacity: 1;
  border: 1px solid var(--color-primary);
  background-color: var(--color-bg-accent);
}

.available-features li .material-symbols-outlined {
  color: var(--color-text-tertiary);
  font-size: 1.25rem;
}

.available-features li.active .material-symbols-outlined {
  color: var(--color-primary);
}

@media (max-width: 768px) {
  .demo-restriction-alert {
    margin: 2rem 1rem;
    padding: 1.5rem;
  }
  
  .alert-content {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .alert-actions {
    flex-direction: column;
    width: 100%;
  }
  
  .back-button, .signup-button {
    width: 100%;
  }
  
  .available-features ul {
    grid-template-columns: 1fr;
  }
}
</style>