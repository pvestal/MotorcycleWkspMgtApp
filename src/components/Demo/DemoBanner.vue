<template>
  <div class="demo-banner">
    <div class="banner-content">
      <div class="banner-header">
        <span class="material-symbols-outlined">explore</span>
        <h2>Try MotoCraft-TwoHeads For Free!</h2>
      </div>
      <p>Experience all premium features for 24 hours. No credit card required!</p>
      <div class="banner-actions">
        <button 
          class="try-demo-button" 
          @click="activateDemo"
          :disabled="isDemoActive"
        >
          {{ isDemoActive ? 'Demo Active' : 'Start Free Demo' }}
        </button>
        <button class="learn-more-button" @click="navigateToSignUp">Sign Up</button>
      </div>
    </div>
    <div class="banner-image">
      <div class="feature-badges">
        <div class="feature-badge">
          <span class="material-symbols-outlined">emoji_objects</span>
          <span>Projects</span>
        </div>
        <div class="feature-badge">
          <span class="material-symbols-outlined">handyman</span>
          <span>Parts</span>
        </div>
        <div class="feature-badge">
          <span class="material-symbols-outlined">task</span>
          <span>Tasks</span>
        </div>
        <div class="feature-badge">
          <span class="material-symbols-outlined">paid</span>
          <span>Costs</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { 
  activateDemo as activateDemoMode, 
  isDemoActive as checkDemoActive 
} from '@/services/demoService';

const router = useRouter();
const isDemoActive = ref(false);

const activateDemo = () => {
  if (isDemoActive.value) return;
  
  const success = activateDemoMode();
  if (success) {
    isDemoActive.value = true;
    // Reload the page to apply demo mode changes
    window.location.reload();
  }
};

const navigateToSignUp = () => {
  router.push({ name: 'SignUp' });
};

onMounted(() => {
  isDemoActive.value = checkDemoActive();
});
</script>

<style scoped>
.demo-banner {
  display: flex;
  background: linear-gradient(135deg, var(--color-bg-tertiary) 0%, var(--color-bg-primary) 100%);
  border-radius: var(--radius-lg);
  overflow: hidden;
  margin: 2rem 0;
  box-shadow: var(--shadow-md);
  position: relative;
}

.banner-content {
  flex: 3;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.banner-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.banner-header .material-symbols-outlined {
  font-size: 2rem;
  color: var(--color-primary);
}

.banner-header h2 {
  font-size: 1.6rem;
  font-weight: 700;
  margin: 0;
  color: var(--color-text-primary);
}

.banner-content p {
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
  color: var(--color-text-secondary);
  line-height: 1.5;
}

.banner-actions {
  display: flex;
  gap: 1rem;
}

.try-demo-button, .learn-more-button {
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-md);
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.try-demo-button {
  background-color: var(--color-primary);
  color: white;
}

.try-demo-button:hover:not(:disabled) {
  background-color: var(--color-primary-hover);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.try-demo-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.learn-more-button {
  background-color: transparent;
  border: 2px solid var(--color-primary);
  color: var(--color-primary);
}

.learn-more-button:hover {
  background-color: rgba(79, 209, 197, 0.1);
}

.banner-image {
  flex: 2;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(79, 209, 197, 0.1);
  padding: 2rem;
}

.feature-badges {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  max-width: 300px;
}

.feature-badge {
  background-color: white;
  border-radius: var(--radius-md);
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;
}

.feature-badge:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-md);
}

.feature-badge .material-symbols-outlined {
  font-size: 2rem;
  color: var(--color-primary);
  margin-bottom: 0.5rem;
}

.feature-badge span:last-child {
  font-weight: 600;
  color: var(--color-text-primary);
}

@media (max-width: 768px) {
  .demo-banner {
    flex-direction: column;
  }
  
  .banner-content {
    padding: 1.5rem;
  }
  
  .banner-header h2 {
    font-size: 1.4rem;
  }
  
  .banner-content p {
    font-size: 1rem;
  }
  
  .banner-actions {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .try-demo-button, .learn-more-button {
    width: 100%;
  }
  
  .banner-image {
    padding: 1.5rem;
  }
  
  .feature-badges {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }
}
</style>