<template>
  <div class="user-settings">
    <h2 class="settings-title">User Settings</h2>
    
    <div class="settings-sections">
      <!-- Appearance settings -->
      <section class="settings-section">
        <h3 class="section-title">Appearance</h3>
        
        <div class="section-content">
          <div class="setting-item">
            <div class="setting-label">
              <span class="material-symbols-outlined">palette</span>
              <div class="setting-info">
                <h4>Theme</h4>
                <p>Choose between light and dark themes</p>
              </div>
            </div>
            
            <div class="setting-control">
              <ThemeToggle :showSettings="true" />
            </div>
          </div>
          
          <div class="setting-item">
            <div class="setting-label">
              <span class="material-symbols-outlined">format_color_fill</span>
              <div class="setting-info">
                <h4>Accent Color</h4>
                <p>Choose your preferred accent color</p>
              </div>
            </div>
            
            <div class="setting-control">
              <div class="color-options">
                <button 
                  v-for="color in accentColors" 
                  :key="color.value"
                  class="color-option"
                  :class="{ active: accentColor === color.value }"
                  :style="{ backgroundColor: color.hex }"
                  @click="setAccentColor(color.value)"
                  :title="color.name"
                ></button>
              </div>
            </div>
          </div>
          
          <div class="setting-item">
            <div class="setting-label">
              <span class="material-symbols-outlined">animation</span>
              <div class="setting-info">
                <h4>Animations</h4>
                <p>Enable or disable UI animations</p>
              </div>
            </div>
            
            <div class="setting-control">
              <label class="toggle-switch">
                <input 
                  type="checkbox" 
                  v-model="animationsEnabled"
                  @change="toggleAnimations"
                >
                <span class="switch"></span>
              </label>
            </div>
          </div>
        </div>
      </section>
      
      <!-- Notification settings -->
      <section class="settings-section">
        <h3 class="section-title">Notifications</h3>
        
        <div class="section-content">
          <div class="setting-item">
            <div class="setting-label">
              <span class="material-symbols-outlined">notifications</span>
              <div class="setting-info">
                <h4>In-App Notifications</h4>
                <p>Show notifications within the app</p>
              </div>
            </div>
            
            <div class="setting-control">
              <label class="toggle-switch">
                <input 
                  type="checkbox" 
                  v-model="inAppNotifications"
                  @change="updateNotificationSettings"
                >
                <span class="switch"></span>
              </label>
            </div>
          </div>
          
          <div class="setting-item">
            <div class="setting-label">
              <span class="material-symbols-outlined">email</span>
              <div class="setting-info">
                <h4>Email Notifications</h4>
                <p>Receive notifications via email</p>
              </div>
            </div>
            
            <div class="setting-control">
              <label class="toggle-switch">
                <input 
                  type="checkbox" 
                  v-model="emailNotifications"
                  @change="updateNotificationSettings"
                >
                <span class="switch"></span>
              </label>
            </div>
          </div>
        </div>
      </section>
      
      <!-- Privacy settings -->
      <section class="settings-section">
        <h3 class="section-title">Privacy</h3>
        
        <div class="section-content">
          <div class="setting-item">
            <div class="setting-label">
              <span class="material-symbols-outlined">visibility</span>
              <div class="setting-info">
                <h4>Profile Visibility</h4>
                <p>Control who can see your profile</p>
              </div>
            </div>
            
            <div class="setting-control">
              <select 
                v-model="profileVisibility"
                class="select-input"
                @change="updatePrivacySettings"
              >
                <option value="public">Public (Everyone)</option>
                <option value="community">Community Only</option>
                <option value="private">Private (Only You)</option>
              </select>
            </div>
          </div>
          
          <div class="setting-item">
            <div class="setting-label">
              <span class="material-symbols-outlined">trending_up</span>
              <div class="setting-info">
                <h4>Usage Analytics</h4>
                <p>Help improve the app by sharing usage data</p>
              </div>
            </div>
            
            <div class="setting-control">
              <label class="toggle-switch">
                <input 
                  type="checkbox" 
                  v-model="allowAnalytics"
                  @change="updatePrivacySettings"
                >
                <span class="switch"></span>
              </label>
            </div>
          </div>
        </div>
      </section>
      
      <!-- Advanced settings -->
      <section class="settings-section">
        <h3 class="section-title">Advanced</h3>
        
        <div class="section-content">
          <div class="setting-item">
            <div class="setting-label">
              <span class="material-symbols-outlined">delete</span>
              <div class="setting-info">
                <h4>Clear Cache</h4>
                <p>Clear local storage and app cache</p>
              </div>
            </div>
            
            <div class="setting-control">
              <button @click="clearCache" class="action-button danger">
                Clear Cache
              </button>
            </div>
          </div>
          
          <div class="setting-item">
            <div class="setting-label">
              <span class="material-symbols-outlined">backup</span>
              <div class="setting-info">
                <h4>Export Data</h4>
                <p>Download all your data</p>
              </div>
            </div>
            
            <div class="setting-control">
              <button @click="exportData" class="action-button">
                Export
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
    
    <!-- Save button -->
    <div class="settings-footer">
      <button @click="saveAllSettings" class="save-button hover-effect" :disabled="!hasChanges">
        Save Changes
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import ThemeToggle from '@/components/Theme/ThemeToggle.vue';
import { useUserStore } from '@/stores/userStore';
import { useErrorStore } from '@/stores/errorStore';

const userStore = useUserStore();
const errorStore = useErrorStore();

// State
const accentColors = [
  { name: 'Teal', value: 'teal', hex: '#4fd1c5' },
  { name: 'Blue', value: 'blue', hex: '#4299e1' },
  { name: 'Purple', value: 'purple', hex: '#805ad5' },
  { name: 'Pink', value: 'pink', hex: '#ed64a6' },
  { name: 'Red', value: 'red', hex: '#f56565' },
  { name: 'Orange', value: 'orange', hex: '#ed8936' },
  { name: 'Yellow', value: 'yellow', hex: '#ecc94b' },
  { name: 'Green', value: 'green', hex: '#48bb78' }
];

// Initialize state from user settings
const accentColor = ref('teal');
const animationsEnabled = ref(true);
const inAppNotifications = ref(true);
const emailNotifications = ref(false);
const profileVisibility = ref('community');
const allowAnalytics = ref(true);

// Original values for change detection
const originalSettings = ref({});

// Load user settings
const loadUserSettings = () => {
  if (!userStore.currentUser) return;
  
  const settings = userStore.currentUser.settings || {};
  
  // Apply stored settings or use defaults
  accentColor.value = settings.accentColor || 'teal';
  animationsEnabled.value = settings.animationsEnabled !== false;
  inAppNotifications.value = settings.notifications?.inApp !== false;
  emailNotifications.value = settings.notifications?.email === true;
  profileVisibility.value = settings.privacy?.profileVisibility || 'community';
  allowAnalytics.value = settings.privacy?.allowAnalytics !== false;
  
  // Store original values for change detection
  originalSettings.value = {
    accentColor: accentColor.value,
    animationsEnabled: animationsEnabled.value,
    inAppNotifications: inAppNotifications.value,
    emailNotifications: emailNotifications.value,
    profileVisibility: profileVisibility.value,
    allowAnalytics: allowAnalytics.value
  };
  
  // Apply accent color
  document.documentElement.style.setProperty('--color-primary', getColorHex(accentColor.value));
  document.documentElement.style.setProperty('--color-primary-hover', adjustColorBrightness(getColorHex(accentColor.value), -10));
  document.documentElement.style.setProperty('--color-primary-active', adjustColorBrightness(getColorHex(accentColor.value), -20));
  
  // Apply animation settings
  if (!animationsEnabled.value) {
    document.body.classList.add('animations-disabled');
  } else {
    document.body.classList.remove('animations-disabled');
  }
};

// Computed properties
const hasChanges = computed(() => {
  return (
    accentColor.value !== originalSettings.value.accentColor ||
    animationsEnabled.value !== originalSettings.value.animationsEnabled ||
    inAppNotifications.value !== originalSettings.value.inAppNotifications ||
    emailNotifications.value !== originalSettings.value.emailNotifications ||
    profileVisibility.value !== originalSettings.value.profileVisibility ||
    allowAnalytics.value !== originalSettings.value.allowAnalytics
  );
});

// Methods
const setAccentColor = (color) => {
  accentColor.value = color;
  
  // Apply color immediately for better user experience
  document.documentElement.style.setProperty('--color-primary', getColorHex(color));
  document.documentElement.style.setProperty('--color-primary-hover', adjustColorBrightness(getColorHex(color), -10));
  document.documentElement.style.setProperty('--color-primary-active', adjustColorBrightness(getColorHex(color), -20));
};

const toggleAnimations = () => {
  if (animationsEnabled.value) {
    document.body.classList.remove('animations-disabled');
  } else {
    document.body.classList.add('animations-disabled');
  }
};

const updateNotificationSettings = () => {
  // This would typically sync with backend/preferences
  // For now, just update local state
};

const updatePrivacySettings = () => {
  // This would typically sync with backend/preferences
  // For now, just update local state
};

const clearCache = () => {
  // Show confirmation dialog
  if (confirm('Are you sure you want to clear all app cache? This will log you out.')) {
    // Clear localStorage
    localStorage.clear();
    
    // Clear sessionStorage
    sessionStorage.clear();
    
    // Clear IndexedDB if applicable
    
    // Show success message and reload
    errorStore.showError('Cache cleared successfully. Reloading app...');
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  }
};

const exportData = () => {
  // This would typically call a backend endpoint to generate export
  // For now, just show a message
  errorStore.showError('Data export feature will be available in a future update.');
};

const saveAllSettings = async () => {
  // Prepare settings object
  const settings = {
    accentColor: accentColor.value,
    animationsEnabled: animationsEnabled.value,
    notifications: {
      inApp: inAppNotifications.value,
      email: emailNotifications.value
    },
    privacy: {
      profileVisibility: profileVisibility.value,
      allowAnalytics: allowAnalytics.value
    }
  };
  
  try {
    // Update user settings in Firestore
    await userStore.updateUser(userStore.currentUser.uid, { settings });
    
    // Update original settings for change detection
    originalSettings.value = {
      accentColor: accentColor.value,
      animationsEnabled: animationsEnabled.value,
      inAppNotifications: inAppNotifications.value,
      emailNotifications: emailNotifications.value,
      profileVisibility: profileVisibility.value,
      allowAnalytics: allowAnalytics.value
    };
    
    // Show success message
    errorStore.showError('Settings saved successfully');
  } catch (error) {
    errorStore.showError('Failed to save settings: ' + error.message);
  }
};

// Helper functions
const getColorHex = (colorName) => {
  const colorObj = accentColors.find(c => c.value === colorName);
  return colorObj ? colorObj.hex : '#4fd1c5'; // Default to teal
};

const adjustColorBrightness = (hex, percent) => {
  // Convert hex to RGB
  let r = parseInt(hex.slice(1, 3), 16);
  let g = parseInt(hex.slice(3, 5), 16);
  let b = parseInt(hex.slice(5, 7), 16);
  
  // Adjust brightness
  r = Math.max(0, Math.min(255, r + percent));
  g = Math.max(0, Math.min(255, g + percent));
  b = Math.max(0, Math.min(255, b + percent));
  
  // Convert back to hex
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

// Lifecycle hooks
onMounted(() => {
  loadUserSettings();
});
</script>

<style scoped>
.user-settings {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.settings-title {
  font-size: var(--font-size-2xl);
  color: var(--color-text-primary);
  margin-bottom: 32px;
  text-align: center;
}

.settings-sections {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.settings-section {
  background-color: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  overflow: hidden;
  transition: box-shadow var(--transition-normal);
}

.settings-section:hover {
  box-shadow: var(--shadow-lg);
}

.section-title {
  font-size: var(--font-size-lg);
  color: var(--color-text-primary);
  padding: 16px 24px;
  background-color: var(--color-bg-tertiary);
  border-bottom: 1px solid var(--color-border);
  margin: 0;
}

.section-content {
  padding: 16px 24px;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid var(--color-border);
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-label {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

.setting-label .material-symbols-outlined {
  font-size: 24px;
  color: var(--color-primary);
}

.setting-info h4 {
  margin: 0 0 4px;
  font-size: var(--font-size-md);
  color: var(--color-text-primary);
}

.setting-info p {
  margin: 0;
  font-size: var(--font-size-sm);
  color: var(--color-text-tertiary);
}

.setting-control {
  display: flex;
  align-items: center;
}

/* Toggle switch */
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 52px;
  height: 26px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.switch {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--color-bg-tertiary);
  transition: .4s;
  border-radius: 34px;
}

.switch:before {
  position: absolute;
  content: "";
  height: 20px;
  width: 20px;
  left: 4px;
  bottom: 3px;
  background-color: var(--color-text-inverse);
  transition: .4s;
  border-radius: 50%;
}

input:checked + .switch {
  background-color: var(--color-primary);
}

input:focus + .switch {
  box-shadow: 0 0 1px var(--color-primary);
}

input:checked + .switch:before {
  transform: translateX(24px);
}

/* Color options */
.color-options {
  display: flex;
  gap: 8px;
}

.color-option {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid var(--color-bg-tertiary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.color-option.active {
  border-color: var(--color-text-primary);
  transform: scale(1.2);
}

/* Select input */
.select-input {
  padding: 8px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  min-width: 180px;
}

/* Action buttons */
.action-button {
  padding: 8px 16px;
  border: none;
  border-radius: var(--radius-md);
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.action-button:hover {
  background-color: var(--color-primary);
  color: var(--color-text-inverse);
}

.action-button.danger {
  color: var(--color-error);
  border: 1px solid var(--color-error-light);
}

.action-button.danger:hover {
  background-color: var(--color-error);
  color: white;
}

/* Save button */
.settings-footer {
  display: flex;
  justify-content: center;
  margin-top: 32px;
}

.save-button {
  padding: 12px 48px;
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-normal);
}

.save-button:not(:disabled):hover {
  background-color: var(--color-primary-hover);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.save-button:not(:disabled):active {
  transform: translateY(0);
  box-shadow: var(--shadow-sm);
}

.save-button:disabled {
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-tertiary);
  cursor: not-allowed;
}

/* Responsive styles */
@media (max-width: 768px) {
  .setting-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .setting-control {
    align-self: flex-start;
    width: 100%;
  }
  
  .select-input {
    width: 100%;
  }
}
</style>