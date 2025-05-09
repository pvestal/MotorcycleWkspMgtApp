<template>
  <div class="theme-toggle">
    <button 
      class="toggle-button" 
      :class="{ 'dark-mode': isDarkTheme }"
      @click="toggleTheme"
      :title="isDarkTheme ? 'Switch to light mode' : 'Switch to dark mode'"
      aria-label="Toggle theme"
    >
      <div class="toggle-icon">
        <span v-if="!isDarkTheme" class="material-symbols-outlined sun-icon">light_mode</span>
        <span v-else class="material-symbols-outlined moon-icon">dark_mode</span>
      </div>
    </button>
    
    <div v-if="showSettings" class="theme-settings">
      <div class="setting-item">
        <span>Use system theme</span>
        <label class="toggle-switch">
          <input 
            type="checkbox" 
            v-model="useSystemThemeLocal"
            @change="handleSystemThemeChange"
          >
          <span class="switch"></span>
        </label>
      </div>
      
      <div class="theme-options" v-if="!useSystemThemeLocal">
        <button 
          class="theme-option"
          :class="{ active: themeLocal === 'light' }"
          @click="setTheme('light')"
        >
          <span class="material-symbols-outlined">light_mode</span>
          <span>Light</span>
        </button>
        <button 
          class="theme-option"
          :class="{ active: themeLocal === 'dark' }"
          @click="setTheme('dark')"
        >
          <span class="material-symbols-outlined">dark_mode</span>
          <span>Dark</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useThemeStore } from '@/stores/themeStore';

const themeStore = useThemeStore();

// Props
const props = defineProps({
  showSettings: {
    type: Boolean,
    default: false
  }
});

// Local reactive state
const themeLocal = ref(themeStore.theme);
const useSystemThemeLocal = ref(themeStore.useSystemTheme);

// Computed properties
const isDarkTheme = computed(() => themeStore.isDarkTheme());

// Watch for store changes
watch(() => themeStore.theme, (newTheme) => {
  themeLocal.value = newTheme;
});

watch(() => themeStore.useSystemTheme, (newValue) => {
  useSystemThemeLocal.value = newValue;
});

// Methods
const toggleTheme = () => {
  themeStore.toggleTheme();
};

const setTheme = (theme) => {
  themeStore.setTheme(theme);
  themeLocal.value = theme;
};

const handleSystemThemeChange = () => {
  themeStore.setUseSystemTheme(useSystemThemeLocal.value);
};

// Event handlers for clicking outside
const clickOutsideHandler = (event) => {
  if (props.showSettings && !event.target.closest('.theme-toggle')) {
    const emit = defineEmits(['close-settings']);
    emit('close-settings');
  }
};

// Lifecycle hooks
onMounted(() => {
  document.addEventListener('click', clickOutsideHandler);
});

onUnmounted(() => {
  document.removeEventListener('click', clickOutsideHandler);
});
</script>

<style scoped>
.theme-toggle {
  position: relative;
}

.toggle-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background-color: transparent;
  color: var(--color-text-tertiary);
  cursor: pointer;
  transition: all var(--transition-normal);
  overflow: hidden;
}

.toggle-button:hover {
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-primary);
}

.toggle-button.dark-mode {
  color: var(--color-text-accent);
}

.toggle-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  transition: transform 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55);
}

.toggle-button:hover .toggle-icon {
  transform: rotate(30deg);
}

.sun-icon, .moon-icon {
  font-size: 22px;
}

/* Theme settings panel */
.theme-settings {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 200px;
  background-color: var(--color-bg-secondary);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  padding: 16px;
  z-index: var(--z-index-dropdown);
  animation: slideInDown 0.2s ease-out;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
}

/* Toggle switch */
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 22px;
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
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 2px;
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
  transform: translateX(20px);
}

/* Theme options */
.theme-options {
  display: flex;
  gap: 8px;
}

.theme-option {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 10px;
  background-color: var(--color-bg-tertiary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.theme-option.active {
  background-color: var(--color-bg-accent);
  color: var(--color-text-accent);
  border-color: var(--color-primary);
}

.theme-option:hover:not(.active) {
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
}

.theme-option span:last-child {
  font-size: var(--font-size-xs);
}

@keyframes slideInDown {
  from {
    transform: translateY(-10px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>