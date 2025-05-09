import { defineStore } from 'pinia';
import { ref, watch, computed } from 'vue';

export const useThemeStore = defineStore('theme', () => {
  // State
  const theme = ref(localStorage.getItem('theme') || 'light');
  const systemTheme = ref('light');
  const useSystemTheme = ref(localStorage.getItem('useSystemTheme') === 'true');
  const accentColor = ref(localStorage.getItem('accentColor') || 'teal');
  const animationsEnabled = ref(localStorage.getItem('animationsEnabled') !== 'false');
  
  // Available options
  const accentColorOptions = [
    { value: 'teal', label: 'Teal' },
    { value: 'purple', label: 'Purple' },
    { value: 'blue', label: 'Blue' },
    { value: 'green', label: 'Green' },
    { value: 'orange', label: 'Orange' },
    { value: 'red', label: 'Red' }
  ];
  
  // Computed values
  const effectiveTheme = computed(() => {
    return useSystemTheme.value ? systemTheme.value : theme.value;
  });
  
  const isDarkTheme = computed(() => effectiveTheme.value === 'dark');
  
  // Check for system preference
  const checkSystemTheme = () => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      systemTheme.value = 'dark';
    } else {
      systemTheme.value = 'light';
    }
  };
  
  // Apply the theme to the DOM
  const applyTheme = (newTheme) => {
    // Set data attribute for CSS variables
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Add theme-specific classes to the body for direct CSS targeting
    if (newTheme === 'dark') {
      document.body.classList.add('dark');
      document.body.classList.remove('light');
    } else {
      document.body.classList.add('light');
      document.body.classList.remove('dark');
    }
    
    // Apply accent color
    document.documentElement.setAttribute('data-accent', accentColor.value);
    
    // Apply animations setting
    if (animationsEnabled.value) {
      document.body.classList.remove('no-animations');
    } else {
      document.body.classList.add('no-animations');
    }
    
    // Add a class to enable transitions after initial load
    // This prevents transition flashes when the page first loads
    setTimeout(() => {
      document.body.classList.add('theme-transition-enabled');
    }, 100);
  };
  
  // Set the theme manually
  const setTheme = (newTheme) => {
    theme.value = newTheme;
    useSystemTheme.value = false;
    localStorage.setItem('useSystemTheme', 'false');
    applyTheme(newTheme);
  };
  
  // Toggle between light and dark themes
  const toggleTheme = () => {
    const newTheme = theme.value === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };
  
  // Enable or disable system theme preference
  const setUseSystemTheme = (value) => {
    useSystemTheme.value = value;
    localStorage.setItem('useSystemTheme', value.toString());
    
    if (value) {
      checkSystemTheme();
      applyTheme(systemTheme.value);
    } else {
      applyTheme(theme.value);
    }
  };
  
  // Set accent color
  const setAccentColor = (color) => {
    if (accentColorOptions.findIndex(opt => opt.value === color) >= 0) {
      accentColor.value = color;
      localStorage.setItem('accentColor', color);
      document.documentElement.setAttribute('data-accent', color);
    }
  };
  
  // Toggle animations on/off
  const setAnimationsEnabled = (enabled) => {
    animationsEnabled.value = enabled;
    localStorage.setItem('animationsEnabled', enabled.toString());
    
    // Apply animations class to body
    if (enabled) {
      document.body.classList.remove('no-animations');
    } else {
      document.body.classList.add('no-animations');
    }
  };
  
  // Listen for system theme changes
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      systemTheme.value = e.matches ? 'dark' : 'light';
      
      if (useSystemTheme.value) {
        applyTheme(systemTheme.value);
      }
    });
  }
  
  // Initialize theme
  checkSystemTheme();
  if (useSystemTheme.value) {
    applyTheme(systemTheme.value);
    theme.value = systemTheme.value;
  } else {
    applyTheme(theme.value);
  }
  
  // Apply accent color and animations on initialization
  document.documentElement.setAttribute('data-accent', accentColor.value);
  if (!animationsEnabled.value) {
    document.body.classList.add('no-animations');
  }
  
  // Watch for changes to system theme when useSystemTheme is true
  watch(systemTheme, (newTheme) => {
    if (useSystemTheme.value) {
      theme.value = newTheme;
      applyTheme(newTheme);
    }
  });
  
  return {
    theme,
    systemTheme,
    useSystemTheme,
    accentColor,
    accentColorOptions,
    animationsEnabled,
    effectiveTheme,
    isDarkTheme,
    toggleTheme,
    setTheme,
    setUseSystemTheme,
    setAccentColor,
    setAnimationsEnabled
  };
});