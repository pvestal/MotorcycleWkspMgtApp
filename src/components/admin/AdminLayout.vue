// src/components/Layouts/AdminLayout.vue
<template>
  <div class="admin-layout">
    <!-- Admin Navigation -->
    <div class="bg-gray-800 text-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center">
            <h1 class="text-xl font-bold">Admin Dashboard</h1>
          </div>
          <div class="flex">
            <nav class="flex space-x-4">
              <router-link 
                to="/admin/projects" 
                class="px-3 py-2 rounded-md text-sm font-medium" 
                :class="[$route.path.includes('/projects') ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white']"
              >
                Projects
              </router-link>
              <router-link 
                to="/admin/tasks" 
                class="px-3 py-2 rounded-md text-sm font-medium" 
                :class="[$route.path.includes('/tasks') ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white']"
              >
                Tasks
              </router-link>
              <router-link 
                to="/admin/parts" 
                class="px-3 py-2 rounded-md text-sm font-medium" 
                :class="[$route.path.includes('/parts') ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white']"
              >
                Parts
              </router-link>
              <router-link 
                to="/admin/costs" 
                class="px-3 py-2 rounded-md text-sm font-medium" 
                :class="[$route.path.includes('/costs') ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white']"
              >
                Costs
              </router-link>
              <router-link 
                to="/admin/data-retention" 
                class="px-3 py-2 rounded-md text-sm font-medium" 
                :class="[$route.path.includes('/data-retention') ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white']"
              >
                Data Retention
              </router-link>
            </nav>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router';

const route = useRoute();
</script>