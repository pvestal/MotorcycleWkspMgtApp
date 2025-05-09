<script setup>
import { useErrorStore } from './stores/errorStore';
import { useUserStore } from './stores/userStore';
import { useThemeStore } from './stores/themeStore';
import navBar from '@/components/navBar.vue'
import { onMounted } from 'vue';
import '@/assets/theme.css';

const errorStore = useErrorStore();
const userStore = useUserStore();
const themeStore = useThemeStore();

onMounted(() => {
  userStore.setUpAuthListener();
  // Theme is already initialized in the store
});

</script>

<template>
  <div class="app-container theme-transition">
    <div class="systemError" v-if="errorStore.errorVisible">{{ errorStore.errorMessage }}</div>
    
    <div class="notification" 
         v-if="errorStore.notificationVisible"
         :class="errorStore.notificationType">
      {{ errorStore.notificationMessage }}
      <button class="notification-close" @click="errorStore.clearNotification">&times;</button>
    </div>
    
    <navBar />
  </div>
</template>

<style>
/* Global styles */
body {
  margin: 0;
  padding: 0;
  font-family: 'Inter', sans-serif;
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
}

.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* System error styling */
.systemError {
  background-color: var(--color-error);
  color: white;
  font-weight: bold;
  padding: 10px 16px;
  border-radius: var(--radius-md);
  margin: 8px;
  box-shadow: var(--shadow-md);
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: var(--z-index-dropdown);
  max-width: 80%;
  animation: slideIn var(--transition-normal) ease-out;
}

/* Notification styling */
.notification {
  padding: 10px 16px;
  border-radius: var(--radius-md);
  margin: 8px;
  box-shadow: var(--shadow-md);
  position: fixed;
  bottom: 16px;
  right: 16px;
  z-index: var(--z-index-dropdown);
  max-width: 80%;
  animation: slideIn var(--transition-normal) ease-out;
  display: flex;
  align-items: center;
  gap: 8px;
}

.notification.success {
  background-color: var(--color-success, #48bb78);
  color: white;
}

.notification.error {
  background-color: var(--color-error, #f56565);
  color: white;
}

.notification.info {
  background-color: var(--color-info, #4299e1);
  color: white;
}

.notification.warning {
  background-color: var(--color-warning, #ed8936);
  color: white;
}

.notification-close {
  background: transparent;
  border: none;
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0 6px;
  margin-left: 8px;
  opacity: 0.7;
  transition: opacity var(--transition-fast);
}

.notification-close:hover {
  opacity: 1;
}

/* Animation for system error and notifications */
@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Page transitions */
.page-enter-active,
.page-leave-active {
  transition: opacity var(--transition-normal), transform var(--transition-normal);
}

.page-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* Common button styles */
button {
  transition: all var(--transition-fast);
}

/* Common hover effects */
.hover-effect {
  transition: all var(--transition-fast);
}

.hover-effect:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

/* Responsive container */
.responsive-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-4);
}

@media (max-width: 768px) {
  .responsive-container {
    padding: 0 var(--space-3);
  }
}

/* No animations class */
.no-animations * {
  transition: none !important;
  animation: none !important;
}
</style>