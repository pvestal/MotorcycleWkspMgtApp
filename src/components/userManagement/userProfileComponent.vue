<template>
    <div>
      <h3>User Details</h3>
      <!-- Toggle Button -->
      <button @click="toggleDetails">{{ detailsVisible ? 'Hide' : 'Show' }} Details</button>
      
      <!-- Conditional Rendering of User Details -->
      <div v-if="detailsVisible">
        <ol v-if="user">
          <!-- Outer loop to iterate through the top-level key-value pairs -->
          <li v-for="(value, key) in userDetails" :key="key">
            <strong>{{ key }}:</strong>
            <!-- Check if the value is an object or array -->
            <template v-if="isObjectOrArray(value)">
              <ol>
                <!-- Inner loop to iterate through nested objects or arrays -->
                <li v-for="(subValue, subKey) in value" :key="subKey">
                  <strong>{{ subKey }}:</strong>
                  <!-- Avoid circular references and complex objects -->
                  <template v-if="isTimestamp(subValue)">
                    {{ formatTimestamp(subValue) }}
                  </template>
                  <template v-else-if="isPrimitive(subValue)">
                    {{ subValue }}
                  </template>
                  <template v-else>
                    <span>(Complex structure)</span>
                  </template>
                </li>
              </ol>
            </template>
            <!-- Check if the value is a timestamp -->
            <template v-else-if="isTimestamp(value)">
              {{ formatTimestamp(value) }}
            </template>
            <!-- Otherwise, display the value directly -->
            <template v-else>
              {{ value }}
            </template>
          </li>
        </ol>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue';
  
  // Props
  const props = defineProps({
    user: {
      type: Object,
      required: false,
    },
  });
  
  // State for toggling the visibility of user details
  const detailsVisible = ref(false);
  
  // Function to toggle the visibility
  const toggleDetails = () => {
    detailsVisible.value = !detailsVisible.value;
  };
  
  // Utility function to check if a value is an object or an array
  const isObjectOrArray = (value) => {
    return value && typeof value === 'object';
  };
  
  // Utility function to check if a value is a primitive type (string, number, boolean, etc.)
  const isPrimitive = (value) => {
    return (
      value !== Object(value) ||
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean'
    );
  };
  
  // Utility function to check if a value is a Firebase timestamp (or Date object)
  const isTimestamp = (value) => {
    return (
      (value && typeof value === 'object' && typeof value.seconds === 'number') ||
      value instanceof Date
    );
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
        second: '2-digit',
      }).format(date);
    } else {
      return 'Invalid date';
    }
  };
  
  // Prepare the user details as key-value pairs for display
  const userDetails = computed(() => {
    const details = {};
    for (const key in props.user) {
      if (props.user.hasOwnProperty(key)) {
        const value =
          props.user[key] !== null &&
          props.user[key] !== undefined &&
          props.user[key] !== ''
            ? props.user[key]
            : 'No data available';
        details[key] = value;
      }
    }
    return details;
  });
  </script>
  
  <style scoped>
  ol {
    padding-left: 20px;
  }
  
  li {
    margin-bottom: 5px;
  }
  
  li ol {
    margin-top: 5px;
    padding-left: 20px;
    list-style-type: lower-alpha;
  }
  
  button {
    margin-bottom: 10px;
    padding: 5px 10px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }
  
  button:hover {
    background-color: #0056b3;
  }
  </style>
  