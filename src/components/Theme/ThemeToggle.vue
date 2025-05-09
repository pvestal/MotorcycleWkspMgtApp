<script setup>
import { ref, computed } from 'vue';
import { useThemeStore } from '@/stores/themeStore';

const themeStore = useThemeStore();

const mode = computed(() => {
  return themeStore.isDarkTheme ? 'dark' : 'light';
});

const toggleMode = () => {
  themeStore.toggleTheme();
};

const showDropdown = ref(false);
const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value;
};

const closeDropdown = () => {
  showDropdown.value = false;
};

const setSystemPreference = (value) => {
  themeStore.setUseSystemTheme(value);
  closeDropdown();
};
</script>

<template>
  <div class="theme-toggle-wrapper">
    <!-- Simple toggle button -->
    <button
      @click="toggleMode"
      class="theme-toggle-button"
      :aria-label="`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`"
      :title="`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`"
    >
      <!-- Sun icon for light mode -->
      <svg v-if="mode === 'dark'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="theme-icon">
        <path d="M12 18a6 6 0 1 1 0-12 6 6 0 0 1 0 12zm0-2a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM11 1h2v3h-2V1zm0 19h2v3h-2v-3zM3.515 4.929l1.414-1.414L7.05 5.636 5.636 7.05 3.515 4.93zM16.95 18.364l1.414-1.414 2.121 2.121-1.414 1.414-2.121-2.121zm2.121-14.85l1.414 1.415-2.121 2.121-1.414-1.414 2.121-2.121zM5.636 16.95l1.414 1.414-2.121 2.121-1.414-1.414 2.121-2.121zM23 11v2h-3v-2h3zM4 11v2H1v-2h3z" />
      </svg>
      <!-- Moon icon for dark mode -->
      <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="theme-icon">
        <path d="M10 7a7 7 0 0 0 12 4.9v.1c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2h.1A6.979 6.979 0 0 0 10 7zm-6 5a8 8 0 0 0 15.062 3.762A9 9 0 0 1 8.238 4.938 7.999 7.999 0 0 0 4 12z" />
      </svg>
    </button>
    
    <!-- Advanced settings dropdown -->
    <div class="theme-dropdown-container">
      <button @click="toggleDropdown" class="theme-settings-button" aria-label="Theme settings">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="theme-settings-icon">
          <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM11 7h2v2h-2V7zm0 4h2v6h-2v-6z" />
        </svg>
      </button>
      
      <div v-if="showDropdown" class="theme-dropdown">
        <div class="theme-dropdown-header">
          <h3>Theme Settings</h3>
          <button @click="closeDropdown" class="close-button">×</button>
        </div>
        
        <div class="theme-dropdown-content">
          <div class="theme-option">
            <label>
              <input 
                type="radio" 
                name="theme-preference" 
                :checked="themeStore.theme === 'light' && !themeStore.useSystemTheme" 
                @change="setSystemPreference(false); themeStore.setTheme('light')" 
              />
              <span>Light</span>
            </label>
          </div>
          
          <div class="theme-option">
            <label>
              <input 
                type="radio" 
                name="theme-preference" 
                :checked="themeStore.theme === 'dark' && !themeStore.useSystemTheme" 
                @change="setSystemPreference(false); themeStore.setTheme('dark')" 
              />
              <span>Dark</span>
            </label>
          </div>
          
          <div class="theme-option">
            <label>
              <input 
                type="radio" 
                name="theme-preference" 
                :checked="themeStore.useSystemTheme" 
                @change="setSystemPreference(true)" 
              />
              <span>Use system preference</span>
            </label>
          </div>
          
          <div class="theme-separator"></div>
          
          <div class="animations-toggle">
            <label class="toggle-switch">
              <span>Animations</span>
              <input 
                type="checkbox" 
                :checked="themeStore.animationsEnabled" 
                @change="themeStore.setAnimationsEnabled(!themeStore.animationsEnabled)" 
              />
              <span class="slider"></span>
            </label>
          </div>
          
          <div class="accent-colors">
            <h4>Accent Color</h4>
            <div class="accent-colors-grid">
              <button 
                v-for="color in themeStore.accentColorOptions" 
                :key="color.value"
                class="accent-color-button" 
                :class="[`accent-${color.value}`, { active: themeStore.accentColor === color.value }]"
                @click="themeStore.setAccentColor(color.value)"
                :title="color.label"
              ></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.theme-toggle-wrapper {
  display: flex;
  align-items: center;
  position: relative;
}

.theme-toggle-button, .theme-settings-button {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  transition: all 0.2s ease;
  margin-right: 5px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.theme-toggle-button:hover, .theme-settings-button:hover {
  background-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

.theme-icon, .theme-settings-icon {
  width: 22px;
  height: 22px;
  fill: currentColor;
  filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.5));
}

.theme-settings-icon {
  width: 18px;
  height: 18px;
}

/* Ensure icons are visible on light backgrounds too */
:global(.light-mode) .theme-toggle-button,
:global(.light-mode) .theme-settings-button {
  background: rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.1);
  color: #333;
}

:global(.light-mode) .theme-toggle-button:hover,
:global(.light-mode) .theme-settings-button:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

:global(.light-mode) .theme-icon,
:global(.light-mode) .theme-settings-icon {
  filter: none;
}

.theme-dropdown-container {
  position: relative;
}

.theme-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08);
  width: 240px;
  z-index: 1000;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.1);
  animation: fadeIn 0.2s forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.theme-dropdown-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  background-color: #f9fafb;
}

.theme-dropdown-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.close-button {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 20px;
  line-height: 1;
  color: #6b7280;
}

.theme-dropdown-content {
  padding: 12px 16px;
}

.theme-option {
  margin-bottom: 12px;
}

.theme-option label {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.theme-option input[type="radio"] {
  margin-right: 8px;
}

.theme-option span {
  color: #374151;
  font-size: 14px;
}

.theme-separator {
  height: 1px;
  background-color: rgba(0, 0, 0, 0.1);
  margin: 12px 0;
}

.animations-toggle {
  margin-top: 12px;
  margin-bottom: 16px;
}

.toggle-switch {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
}

.toggle-switch span {
  color: #374151;
  font-size: 14px;
}

.toggle-switch input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: relative;
  display: inline-block;
  width: 36px;
  height: 20px;
  background-color: #e5e7eb;
  border-radius: 10px;
  transition: 0.2s;
}

.slider:before {
  content: "";
  position: absolute;
  height: 16px;
  width: 16px;
  left: 2px;
  bottom: 2px;
  background-color: white;
  border-radius: 50%;
  transition: 0.2s;
}

input:checked + .slider {
  background-color: #4f46e5;
}

input:checked + .slider:before {
  transform: translateX(16px);
}

.accent-colors h4 {
  margin: 0 0 8px;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.accent-colors-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.accent-color-button {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  transition: 0.2s;
}

.accent-color-button.active {
  border-color: #111827;
  transform: scale(1.1);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.accent-color-button:hover {
  transform: scale(1.1);
}

.accent-teal {
  background-color: #4fd1c5;
}

.accent-purple {
  background-color: #805ad5;
}

.accent-blue {
  background-color: #4299e1;
}

.accent-green {
  background-color: #48bb78;
}

.accent-orange {
  background-color: #ed8936;
}

.accent-red {
  background-color: #f56565;
}

@media (max-width: 768px) {
  .theme-dropdown {
    width: 200px;
    right: -70px;
  }
}
</style>