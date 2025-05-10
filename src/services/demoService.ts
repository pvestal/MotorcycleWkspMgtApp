import { ref, Ref } from 'vue';
import { useUserStore } from '@/stores/userStore';

// Interface for demo state
interface DemoState {
  isActive: boolean;
  activatedAt: number | null;
  expiresAt: number | null;
  remainingTime: number | null; // in seconds
}

// Demo configuration
const DEMO_DURATION_MS = 24 * 60 * 60 * 1000; // 1 day in milliseconds
const DEMO_STORAGE_KEY = 'motocraft_demo_state';
const DEMO_FEATURES = [
  'project-management',
  'parts-catalog',
  'task-tracking',
  'cost-tracking',
];

// Demo state ref
const demoState: Ref<DemoState> = ref({
  isActive: false,
  activatedAt: null,
  expiresAt: null,
  remainingTime: null,
});

/**
 * Initialize demo service by checking localStorage for existing demo state
 */
export function initDemoService(): void {
  const storedState = localStorage.getItem(DEMO_STORAGE_KEY);
  const userStore = useUserStore();
  
  if (storedState) {
    try {
      const parsedState = JSON.parse(storedState) as DemoState;
      const now = Date.now();
      
      // If demo has expired, clear it
      if (parsedState.expiresAt && parsedState.expiresAt < now) {
        clearDemoState();
        return;
      }
      
      // Update demo state with remaining time
      demoState.value = {
        ...parsedState,
        remainingTime: parsedState.expiresAt ? Math.floor((parsedState.expiresAt - now) / 1000) : null
      };
    } catch (error) {
      console.error('Failed to parse demo state:', error);
      clearDemoState();
    }
  }
}

/**
 * Activate the demo mode for the user
 * @returns {boolean} Whether activation was successful
 */
export function activateDemo(): boolean {
  const userStore = useUserStore();
  
  // If user is already authenticated (not anonymously), don't activate demo
  if (userStore.isAuthenticated && !userStore.isAnonymous) {
    return false;
  }
  
  const now = Date.now();
  const expiresAt = now + DEMO_DURATION_MS;
  
  // Update demo state
  demoState.value = {
    isActive: true,
    activatedAt: now,
    expiresAt: expiresAt,
    remainingTime: Math.floor(DEMO_DURATION_MS / 1000),
  };
  
  // Save to localStorage
  saveDemoState();
  
  // Handle anonymous login if not already logged in
  if (!userStore.user) {
    userStore.loginAnonymously();
  }
  
  return true;
}

/**
 * Clear the demo state completely
 */
export function clearDemoState(): void {
  demoState.value = {
    isActive: false,
    activatedAt: null,
    expiresAt: null,
    remainingTime: null,
  };
  
  localStorage.removeItem(DEMO_STORAGE_KEY);
}

/**
 * Save current demo state to localStorage
 */
function saveDemoState(): void {
  localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(demoState.value));
}

/**
 * Check if the demo is currently active
 * @returns {boolean} Whether demo is active
 */
export function isDemoActive(): boolean {
  const now = Date.now();
  
  // Check if demo has expired
  if (demoState.value.expiresAt && demoState.value.expiresAt < now) {
    clearDemoState();
    return false;
  }
  
  return demoState.value.isActive;
}

/**
 * Get the time remaining in the demo period
 * @returns {number} Seconds remaining in demo, or 0 if expired
 */
export function getRemainingDemoTime(): number {
  const now = Date.now();
  
  if (!demoState.value.expiresAt || !demoState.value.isActive) {
    return 0;
  }
  
  const remaining = Math.max(0, Math.floor((demoState.value.expiresAt - now) / 1000));
  demoState.value.remainingTime = remaining;
  
  return remaining;
}

/**
 * Format the remaining time as a human-readable string
 * @returns {string} Formatted time string (e.g., "23 hours, 59 minutes")
 */
export function getFormattedRemainingTime(): string {
  const seconds = getRemainingDemoTime();
  
  if (seconds <= 0) {
    return 'Expired';
  }
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''}, ${minutes} minute${minutes > 1 ? 's' : ''}`;
  } else {
    return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  }
}

/**
 * Get the demo state
 * @returns {DemoState} Current demo state
 */
export function getDemoState(): DemoState {
  return demoState.value;
}

/**
 * Check if a specific feature is available in demo mode
 * @param {string} featureName Name of the feature to check
 * @returns {boolean} Whether feature is available
 */
export function isFeatureAvailableInDemo(featureName: string): boolean {
  return isDemoActive() && DEMO_FEATURES.includes(featureName);
}

export default {
  initDemoService,
  activateDemo,
  clearDemoState,
  isDemoActive,
  getRemainingDemoTime,
  getFormattedRemainingTime,
  getDemoState,
  isFeatureAvailableInDemo,
};