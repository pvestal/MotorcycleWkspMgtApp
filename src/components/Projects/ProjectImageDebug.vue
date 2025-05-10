<template>
  <div class="debug-container">
    <h3 class="text-lg font-semibold mb-4">Project Image Debug</h3>
    
    <div v-if="loading" class="debug-loading">
      Loading project data...
    </div>
    
    <div v-else>
      <div class="debug-section">
        <h4 class="font-medium">Project ID</h4>
        <pre class="debug-value">{{ projectId }}</pre>
      </div>

      <div class="debug-section">
        <h4 class="font-medium">Project Images Array Structure</h4>
        <pre v-if="project && project.imageUrls" class="debug-value">
Type: {{ typeof project.imageUrls }}
Is Array: {{ Array.isArray(project.imageUrls) }}
Length: {{ project.imageUrls.length }}
        </pre>
        <div v-else class="debug-value error">
          No imageUrls found on project
        </div>
      </div>
      
      <div v-if="project && project.imageUrls && project.imageUrls.length > 0" class="debug-section">
        <h4 class="font-medium">First Image Structure</h4>
        <pre class="debug-value">{{ JSON.stringify(project.imageUrls[0], null, 2) }}</pre>
      </div>
      
      <div class="debug-section">
        <h4 class="font-medium">Raw Project Data</h4>
        <pre class="debug-value">{{ projectDataString }}</pre>
      </div>
      
      <div class="debug-section">
        <h4 class="font-medium">Test Image Display</h4>
        <div v-if="project && project.imageUrls && project.imageUrls.length > 0" class="debug-image-container">
          <div v-for="(image, index) in project.imageUrls" :key="index" class="debug-image-item">
            <div class="debug-image-header">
              Image {{ index + 1 }}:
              <span v-if="typeof image === 'string'">
                String URL
              </span>
              <span v-else-if="typeof image === 'object' && image !== null">
                Object with URL
              </span>
              <span v-else>
                Unknown Type
              </span>
            </div>
            
            <div v-if="typeof image === 'string'" class="debug-image-wrapper">
              <img :src="image" alt="Project Image (String URL)" class="debug-image" @error="handleImageError($event, index)" />
            </div>
            
            <div v-else-if="typeof image === 'object' && image !== null && image.url" class="debug-image-wrapper">
              <img :src="image.url" alt="Project Image (Object URL)" class="debug-image" @error="handleImageError($event, index)" />
              <div class="debug-image-meta">
                <div v-if="image.fileName">File name: {{ image.fileName }}</div>
                <div v-if="image.uploadDate">Upload date: {{ formatDate(image.uploadDate) }}</div>
              </div>
            </div>
            
            <div v-else class="debug-image-error">
              Invalid image format
            </div>
          </div>
        </div>
        <div v-else class="debug-value error">
          No images to display
        </div>
      </div>
      
      <div class="debug-actions">
        <button 
          @click="fetchProject" 
          class="debug-button"
        >
          Refresh Project Data
        </button>
        
        <button 
          v-if="project && project.imageUrls" 
          @click="fixImageUrls" 
          class="debug-button fix"
        >
          Attempt to Fix Image URLs
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useProjectStore } from '@/stores/projectStore';
import { useStorageStore } from '@/stores/storageStore';
import { useErrorStore } from '@/stores/errorStore';

const props = defineProps({
  projectId: {
    type: String,
    required: true
  }
});

const projectStore = useProjectStore();
const storageStore = useStorageStore();
const errorStore = useErrorStore();

const project = ref(null);
const loading = ref(true);
const imageErrors = ref({});

// Computed property to stringify the project data for debugging
const projectDataString = computed(() => {
  if (!project.value) return 'No project data';
  
  // Create a copy without the imageUrls to make it more readable
  const projectCopy = { ...project.value };
  if (projectCopy.imageUrls) {
    projectCopy.imageUrls = `[Array with ${projectCopy.imageUrls.length} items]`;
  }
  
  return JSON.stringify(projectCopy, null, 2);
});

// Fetch the project data
const fetchProject = async () => {
  loading.value = true;
  try {
    // Reset image errors
    imageErrors.value = {};
    
    // Get project from store
    await projectStore.fetchProjects();
    project.value = projectStore.getProjectById(props.projectId);
    
    // Fetch project images
    if (project.value && (!project.value.imageUrls || project.value.imageUrls.length === 0)) {
      const images = await storageStore.fetchProjectImages(props.projectId);
      if (images && images.length > 0) {
        if (!project.value.imageUrls) {
          project.value.imageUrls = [];
        }
        project.value.imageUrls = [...images];
      }
    }
  } catch (error) {
    errorStore.showError("Error fetching project data: " + error.message);
    console.error("Error fetching project data:", error);
  } finally {
    loading.value = false;
  }
};

// Handle image loading errors
const handleImageError = (event, index) => {
  imageErrors.value[index] = true;
  console.error(`Error loading image at index ${index}:`, event);
};

// Format date for display
const formatDate = (date) => {
  if (!date) return 'No date';
  return new Date(date).toLocaleDateString();
};

// Attempt to fix image URLs structure
const fixImageUrls = async () => {
  if (!project.value || !project.value.imageUrls) return;
  
  try {
    loading.value = true;
    
    // Convert string URLs to objects if needed
    const fixedImageUrls = project.value.imageUrls.map((image, index) => {
      if (typeof image === 'string') {
        return {
          url: image,
          fileName: `Image ${index + 1}`,
          uploadDate: new Date().toISOString()
        };
      }
      return image;
    });
    
    // Update the project
    await projectStore.updateProject(props.projectId, { imageUrls: fixedImageUrls });
    
    // Refresh data
    await fetchProject();
    
    errorStore.showNotification("Image URLs structure has been fixed", "success");
  } catch (error) {
    errorStore.showError("Error fixing image URLs: " + error.message);
    console.error("Error fixing image URLs:", error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchProject();
});
</script>

<style scoped>
.debug-container {
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
  font-family: monospace;
}

.debug-section {
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px dashed #e9ecef;
}

.debug-value {
  background-color: #edf2ff;
  padding: 8px;
  border-radius: 4px;
  white-space: pre-wrap;
  word-break: break-word;
  margin-top: 8px;
  font-size: 12px;
  max-height: 200px;
  overflow-y: auto;
}

.debug-value.error {
  background-color: #ffe9e9;
  color: #e53e3e;
}

.debug-loading {
  background-color: #f0f4f8;
  padding: 12px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.debug-actions {
  display: flex;
  gap: 8px;
  margin-top: 16px;
}

.debug-button {
  background-color: #4a5568;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: background-color 0.2s;
}

.debug-button:hover {
  background-color: #2d3748;
}

.debug-button.fix {
  background-color: #3182ce;
}

.debug-button.fix:hover {
  background-color: #2c5282;
}

.debug-image-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
  margin-top: 8px;
}

.debug-image-item {
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  overflow: hidden;
  background-color: white;
}

.debug-image-header {
  padding: 8px;
  background-color: #edf2f7;
  font-size: 12px;
  font-weight: bold;
}

.debug-image-wrapper {
  padding: 8px;
}

.debug-image {
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 4px;
}

.debug-image-meta {
  margin-top: 8px;
  font-size: 11px;
  color: #718096;
}

.debug-image-error {
  padding: 8px;
  background-color: #fed7d7;
  color: #c53030;
  font-size: 12px;
  text-align: center;
}

/* Dark mode support */
:global(.dark) .debug-container {
  background-color: #2d3748;
  border-color: #4a5568;
}

:global(.dark) .debug-section {
  border-color: #4a5568;
}

:global(.dark) .debug-value {
  background-color: #2c3e50;
  color: #e2e8f0;
}

:global(.dark) .debug-value.error {
  background-color: #742a2a;
  color: #fc8181;
}

:global(.dark) .debug-loading {
  background-color: #2c5282;
  color: #e2e8f0;
}

:global(.dark) .debug-image-item {
  border-color: #4a5568;
  background-color: #2d3748;
}

:global(.dark) .debug-image-header {
  background-color: #4a5568;
  color: #e2e8f0;
}

:global(.dark) .debug-image-meta {
  color: #a0aec0;
}

:global(.dark) .debug-image-error {
  background-color: #742a2a;
  color: #fc8181;
}
</style>