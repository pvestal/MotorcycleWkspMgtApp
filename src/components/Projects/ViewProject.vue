<template>
  <div class="project-detail-container max-w-7xl mx-auto p-6">
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Loading project details...</p>
    </div>

    <div v-else-if="!project" class="not-found">
      <div class="not-found-icon">❓</div>
      <h3>Project Not Found</h3>
      <p>The requested project could not be found or you don't have permission to view it.</p>
      <button class="btn primary" @click="goBack">Go Back</button>
    </div>

    <div v-else>
      <!-- Header with navigation actions -->
      <div class="header-actions mb-6 flex justify-between items-center">
        <button @click="goBack" class="btn secondary flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
          </svg>
          Back
        </button>
        <button 
          @click="toggleEditMode" 
          class="btn primary flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
          {{ isEditing ? 'Cancel' : 'Edit' }}
        </button>
      </div>

      <!-- Project Form or Display -->
      <div v-if="isEditing">
        <!-- Use ProjectForm for editing -->
        <ProjectForm
          :isEditing="true"
          :initialFormData="project"
          @saveProject="handleProjectSave"
          @cancelEdit="toggleEditMode"
        />
      </div>
      <div v-else class="project-content bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden mb-6">
        <!-- Project header -->
        <div class="project-header p-6 bg-blue-50 dark:bg-blue-900 border-b border-blue-100 dark:border-blue-800">
          <div class="project-id font-mono text-sm text-gray-500 dark:text-gray-400 mb-1">Project #{{ projectId.substring(0, 8) }}</div>
          <h1 class="text-2xl font-bold text-gray-800 dark:text-white">{{ project.projectName }}</h1>
          
          <div class="flex flex-wrap gap-2 mt-2">
            <span 
              :class="{
                'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100': project.status === 'Completed',
                'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100': project.status === 'In Progress',
                'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100': project.status === 'On Hold'
              }"
              class="status-badge px-3 py-1 rounded-full text-sm font-medium"
            >
              {{ project.status }}
            </span>
          </div>
        </div>

        <!-- Project metadata -->
        <div class="project-meta grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-gray-50 dark:bg-gray-700">
          <div class="meta-item">
            <div class="meta-label text-sm text-gray-500 dark:text-gray-400">Owner</div>
            <div class="meta-value font-medium">{{ project.owner }}</div>
          </div>
          
          <div class="meta-item">
            <div class="meta-label text-sm text-gray-500 dark:text-gray-400">Start Date</div>
            <div class="meta-value font-medium">{{ formatDate(project.startDate) }}</div>
          </div>
          
          <div v-if="project.endDate" class="meta-item">
            <div class="meta-label text-sm text-gray-500 dark:text-gray-400">End Date</div>
            <div class="meta-value font-medium">{{ formatDate(project.endDate) }}</div>
          </div>
          
          <div v-if="project.vin" class="meta-item">
            <div class="meta-label text-sm text-gray-500 dark:text-gray-400">VIN</div>
            <div class="meta-value font-medium">{{ project.vin }}</div>
          </div>
          
          <div v-if="project.make" class="meta-item">
            <div class="meta-label text-sm text-gray-500 dark:text-gray-400">Make</div>
            <div class="meta-value font-medium">{{ project.make }}</div>
          </div>
          
          <div v-if="project.model" class="meta-item">
            <div class="meta-label text-sm text-gray-500 dark:text-gray-400">Model</div>
            <div class="meta-value font-medium">{{ project.model }}</div>
          </div>
          
          <div v-if="project.year" class="meta-item">
            <div class="meta-label text-sm text-gray-500 dark:text-gray-400">Year</div>
            <div class="meta-value font-medium">{{ project.year }}</div>
          </div>
          
          <div v-if="project.createdAt" class="meta-item">
            <div class="meta-label text-sm text-gray-500 dark:text-gray-400">Created</div>
            <div class="meta-value font-medium">{{ formatDate(project.createdAt) }}</div>
          </div>
          
          <div v-if="project.updatedAt" class="meta-item">
            <div class="meta-label text-sm text-gray-500 dark:text-gray-400">Last Updated</div>
            <div class="meta-value font-medium">{{ formatDate(project.updatedAt) }}</div>
          </div>
        </div>
        
        <!-- Project Description if available -->
        <div v-if="project.description" class="project-description p-6 border-t border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
            Description
          </h3>
          <div class="description-content text-gray-700 dark:text-gray-300 whitespace-pre-line">
            {{ project.description }}
          </div>
        </div>
      </div>

      <!-- Tasks Section -->
      <div class="section mb-6 bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
        <div class="section-header px-6 py-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 flex justify-between items-center">
          <h2 class="text-lg font-semibold text-gray-700 dark:text-gray-200">Tasks</h2>
          <button 
            @click="handleAddTask" 
            class="btn primary flex items-center gap-2"
          >
            <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
            </svg>
            Add Task
          </button>
        </div>

        <div class="px-6 py-4">
          <div v-if="!tasks.length" class="text-gray-500 text-center py-4">
            No tasks have been added to this project yet.
          </div>
          <ul v-else class="task-list">
            <li v-for="task in tasks" :key="task.id" class="p-4 border border-gray-200 rounded-md mb-3 flex flex-wrap md:flex-nowrap items-center justify-between gap-2">
              <div class="flex-grow">
                <span class="task-title font-medium">{{ task.taskTitle }}</span>
                <div class="flex mt-2 flex-wrap gap-2">
                  <span v-if="task.nbrHrs" class="bg-gray-100 text-gray-800 px-2 py-1 rounded-md text-xs">
                    {{ task.nbrHrs }} hrs
                  </span>
                  <span 
                    :class="{
                      'bg-blue-100 text-blue-800': task.status === 'In Progress',
                      'bg-green-100 text-green-800': task.status === 'Completed',
                      'bg-yellow-100 text-yellow-800': task.status === 'Pending'
                    }"
                    class="px-2 py-1 rounded-md text-xs font-medium"
                  >
                    {{ task.status }}
                  </span>
                  <span 
                    :class="{
                      'bg-red-100 text-red-800': task.priority === 'High',
                      'bg-yellow-100 text-yellow-800': task.priority === 'Medium',
                      'bg-green-100 text-green-800': task.priority === 'Low'
                    }"
                    class="px-2 py-1 rounded-md text-xs font-medium"
                  >
                    {{ task.priority }}
                  </span>
                </div>
              </div>
              <div class="flex space-x-2">
                <button @click="navigateToEditTask(task.id)" class="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded">
                  <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button @click="navigateToViewTask(task.id)" class="p-2 text-green-600 hover:text-green-800 hover:bg-green-100 rounded">
                  <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <!-- Parts Section -->
      <div class="section mb-6 bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
        <div class="section-header px-6 py-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 flex justify-between items-center">
          <h2 class="text-lg font-semibold text-gray-700 dark:text-gray-200">Parts</h2>
          <button 
            @click="handleAddPart" 
            class="btn primary flex items-center gap-2"
          >
            <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
            </svg>
            Add Part
          </button>
        </div>

        <div class="px-6 py-4">
          <div v-if="!parts.length" class="text-gray-500 text-center py-4">
            No parts have been added to this project yet.
          </div>
          <ul v-else class="part-list">
            <li v-for="part in parts" :key="part.id" class="p-4 border border-gray-200 rounded-md mb-3 flex flex-wrap md:flex-nowrap items-center justify-between gap-2">
              <div class="flex-grow">
                <span class="part-title font-medium">{{ part.partName }}</span>
                <div class="flex mt-2 flex-wrap gap-2">
                  <span 
                    :class="{
                      'bg-blue-100 text-blue-800': part.partStatus === 'Ordered',
                      'bg-purple-100 text-purple-800': part.partStatus === 'Shipped',
                      'bg-yellow-100 text-yellow-800': part.partStatus === 'BackOrder',
                      'bg-green-100 text-green-800': part.partStatus === 'Installed'
                    }"
                    class="px-2 py-1 rounded-md text-xs font-medium"
                  >
                    {{ part.partStatus }}
                  </span>
                  <span 
                    :class="{
                      'bg-red-100 text-red-800': part.partPriority === 'High',
                      'bg-yellow-100 text-yellow-800': part.partPriority === 'Medium',
                      'bg-green-100 text-green-800': part.partPriority === 'Low'
                    }"
                    class="px-2 py-1 rounded-md text-xs font-medium"
                  >
                    {{ part.partPriority }}
                  </span>
                </div>
              </div>
              <div class="flex space-x-2">
                <button @click="navigateToEditPart(part.id)" class="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded">
                  <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button @click="navigateToViewPart(part.id)" class="p-2 text-green-600 hover:text-green-800 hover:bg-green-100 rounded">
                  <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <!-- Costs Section -->
      <div class="section mb-6 bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
        <div class="section-header px-6 py-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 flex justify-between items-center">
          <h2 class="text-lg font-semibold text-gray-700 dark:text-gray-200">Costs</h2>
          <button 
            @click="handleAddCost" 
            class="btn primary flex items-center gap-2"
          >
            <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
            </svg>
            Add Cost
          </button>
        </div>

        <div class="px-6 py-4">
          <div v-if="!costs.length" class="text-gray-500 text-center py-4">
            No costs have been added to this project yet.
          </div>
          <ul v-else class="cost-list">
            <li v-for="cost in costs" :key="cost.id" class="p-4 border border-gray-200 rounded-md mb-3 flex flex-wrap md:flex-nowrap items-center justify-between gap-2">
              <div class="flex-grow">
                <span class="cost-title font-medium">{{ cost.description }}</span>
                <div class="flex mt-2 flex-wrap gap-2">
                  <span class="bg-green-100 text-green-800 px-2 py-1 rounded-md text-xs font-medium">
                    ${{ formatCurrency(cost.amount) }}
                  </span>
                  <span 
                    :class="{
                      'bg-blue-100 text-blue-800': cost.category === 'Parts',
                      'bg-purple-100 text-purple-800': cost.category === 'Labor',
                      'bg-yellow-100 text-yellow-800': cost.category === 'Tools',
                      'bg-teal-100 text-teal-800': cost.category === 'Other'
                    }"
                    class="px-2 py-1 rounded-md text-xs font-medium"
                  >
                    {{ cost.category }}
                  </span>
                  <span class="bg-gray-100 text-gray-800 px-2 py-1 rounded-md text-xs font-medium">
                    {{ formatDate(cost.date) }}
                  </span>
                </div>
              </div>
              <div class="flex space-x-2">
                <button @click="navigateToEditCost(cost.id)" class="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded">
                  <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button @click="navigateToViewCost(cost.id)" class="p-2 text-green-600 hover:text-green-800 hover:bg-green-100 rounded">
                  <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <!-- Images Section -->
      <div class="section mb-6 bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
        <div class="section-header px-6 py-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 flex justify-between items-center">
          <h2 class="text-lg font-semibold text-gray-700 dark:text-gray-200">Images</h2>
          <label
            for="imageUpload"
            class="btn primary flex items-center gap-2 cursor-pointer"
          >
            <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
            </svg>
            Upload Images
          </label>
          <input
            id="imageUpload"
            type="file"
            multiple
            @change="handleImageUpload"
            class="hidden"
          />
        </div>

        <div class="px-6 py-4">

          <div v-if="!project.imageUrls || !project.imageUrls.length" class="text-gray-500 text-center py-4">
            No images have been uploaded to this project yet.
          </div>

          <!-- Featured Image Carousel -->
          <div v-else-if="project.imageUrls.length > 0" class="mb-6">
            <div class="image-carousel-container relative bg-gradient-to-b from-gray-50 to-gray-100 rounded-xl shadow-lg p-4">
              <!-- Using a responsive aspect ratio container that adapts to screen width -->
              <div class="aspect-ratio-container relative w-full" style="padding-bottom: min(62.5%, 500px);">
                <!-- Main Featured Image -->
                <div class="featured-image-container absolute inset-0 overflow-hidden rounded-lg shadow-md bg-black flex items-center justify-center">
                  <div class="carousel-slide-container w-full h-full relative">
                    <transition-group 
                      tag="div" 
                      name="carousel-slide"
                      class="absolute inset-0 flex items-center justify-center"
                    >
                      <img
                        v-for="(image, idx) in project.imageUrls"
                        :key="typeof image === 'string' ? image : image.url"
                        v-show="idx === currentImageIndex"
                        :src="typeof image === 'string' ? image : image.url"
                        :alt="typeof image === 'string' ? 'Project image' : (image.fileName || 'Project image')"
                        class="featured-image max-h-full max-w-full cursor-pointer object-contain transform transition-all duration-500"
                        loading="lazy"
                        @click="openCarouselModal(idx)"
                      />
                    </transition-group>
                  </div>
                  
                  <!-- Image metadata -->
                  <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4 text-white">
                    <div class="flex justify-between items-end">
                      <div class="image-caption max-w-[70%]">
                        <h3 class="font-medium text-sm truncate">
                          {{ typeof project.imageUrls[currentImageIndex] === 'string'
                              ? 'Project image ' + (currentImageIndex + 1)
                              : (project.imageUrls[currentImageIndex].fileName || 'Project image ' + (currentImageIndex + 1)) }}
                        </h3>
                        <p v-if="typeof project.imageUrls[currentImageIndex] === 'object' && project.imageUrls[currentImageIndex].uploadDate" class="text-xs text-gray-300">
                          {{ formatDate(project.imageUrls[currentImageIndex].uploadDate) }}
                        </p>
                      </div>
                      
                      <!-- Fullscreen button -->
                      <button 
                        @click.stop="openCarouselModal(currentImageIndex)"
                        class="text-white hover:text-gray-200 transition-colors p-1"
                        aria-label="View fullscreen"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5-5-5m5 5v-4m0 4h-4" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <!-- Navigation buttons for the featured image -->
                  <div class="navigation-controls absolute inset-x-0 top-1/2 transform -translate-y-1/2 flex justify-between items-center px-4">
                    <button 
                      v-if="project.imageUrls.length > 1" 
                      @click.prevent.stop="prevImage" 
                      class="nav-arrow left-arrow p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70 transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white"
                      aria-label="Previous image"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    
                    <button 
                      v-if="project.imageUrls.length > 1" 
                      @click.prevent.stop="nextImage" 
                      class="nav-arrow right-arrow p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70 transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white"
                      aria-label="Next image"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              
              <!-- Image counter and progress bar -->
              <div v-if="project.imageUrls.length > 1" class="image-progress-container mt-4">
                <!-- Progress bar -->
                <div class="w-full bg-gray-200 rounded-full h-1.5 mb-2 overflow-hidden">
                  <div 
                    class="bg-indigo-600 h-full rounded-full transition-all duration-300 ease-out"
                    :style="{ width: `${(currentImageIndex + 1) / project.imageUrls.length * 100}%` }"
                  ></div>
                </div>
                <!-- Counter text -->
                <div class="flex justify-between text-xs text-gray-600">
                  <span>{{ currentImageIndex + 1 }} of {{ project.imageUrls.length }}</span>
                  <span v-if="typeof project.imageUrls[currentImageIndex] === 'object' && project.imageUrls[currentImageIndex].dimensions">
                    {{ project.imageUrls[currentImageIndex].dimensions.width }}x{{ project.imageUrls[currentImageIndex].dimensions.height }}
                  </span>
                </div>
              </div>
              
              <!-- Thumbnail gallery with carousel controls - optimized for responsive design -->
              <div v-if="project.imageUrls.length > 1" class="thumbnails-section mt-4">
                <div class="thumbnails-container relative">
                  <div class="thumbnails-scroll-container flex space-x-2 overflow-x-auto py-2 px-10 scroll-smooth hide-scrollbar touch-pan-x">
                    <div 
                      v-for="(image, index) in project.imageUrls" 
                      :key="index" 
                      @click="currentImageIndex = index"
                      class="thumbnail-item flex-shrink-0 cursor-pointer rounded-lg overflow-hidden transition-all duration-300"
                      :class="{ 
                        'ring-2 ring-indigo-500 ring-offset-2 shadow-lg transform scale-105': currentImageIndex === index,
                        'opacity-60 hover:opacity-100': currentImageIndex !== index
                      }"
                    >
                      <div class="thumbnail-frame h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24">
                        <img
                          :src="typeof image === 'string' ? image : image.url"
                          :alt="typeof image === 'string' ? 'Thumbnail' : (image.fileName || 'Thumbnail')"
                          class="h-full w-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <!-- Thumbnail navigation controls -->
                  <button 
                    class="thumbnail-nav-btn absolute left-0 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-1 shadow hover:bg-gray-100"
                    @click="scrollThumbnails('left')"
                    v-if="project.imageUrls.length > 5"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  
                  <button 
                    class="thumbnail-nav-btn absolute right-0 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-1 shadow hover:bg-gray-100"
                    @click="scrollThumbnails('right')"
                    v-if="project.imageUrls.length > 5"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Responsive Image Gallery Grid with fixed image sizes -->
          <div class="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
            <div v-for="(image, index) in project.imageUrls" :key="index" class="group relative">
              <div class="image-card">
                <div class="image-container w-full overflow-hidden rounded-md">
                  <img
                    :src="typeof image === 'string' ? image : image.url"
                    :alt="typeof image === 'string' ? 'Project image' : (image.fileName || 'Project image')"
                    class="w-full h-full object-cover rounded-md cursor-pointer hover:opacity-90 transition duration-300 transform hover:scale-105"
                    loading="lazy"
                    @click="openCarouselModal(index)"
                  />
                </div>
                <!-- Hover overlay with delete button -->
                <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <button 
                    @click.stop="deleteImage(image)" 
                    class="p-2 bg-red-500 rounded-full text-white hover:bg-red-600 transform hover:scale-110 transition-all"
                  >
                    <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                <!-- Image filename caption -->
                <div class="text-xs sm:text-sm text-gray-500 mt-1 truncate px-1">{{ image.fileName || 'Image ' + (index + 1) }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-else class="flex justify-center items-center p-12">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>

    <!-- Enhanced Image Carousel Modal -->
    <div v-if="carouselModalOpen" 
         class="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50"
         @keydown="handleModalKeydown"
         tabindex="0"
         ref="carouselModal">
      <div class="relative w-full h-full flex flex-col justify-center items-center" @click.self="closeCarouselModal">
        <!-- Top control bar -->
        <div class="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-50 bg-gradient-to-b from-black to-transparent">
          <!-- Left side controls -->
          <div class="flex space-x-4 items-center">
            <!-- Image info -->
            <div class="text-white">
              <span class="font-medium text-sm mr-2">{{ modalImageIndex + 1 }} / {{ project.imageUrls.length }}</span>
              <span class="text-gray-400 text-xs">{{
                typeof project.imageUrls[modalImageIndex] === 'string'
                  ? 'Image ' + (modalImageIndex + 1)
                  : (project.imageUrls[modalImageIndex].fileName || 'Image ' + (modalImageIndex + 1))
              }}</span>
            </div>
            
            <!-- Play/pause button -->
            <button 
              v-if="project.imageUrls.length > 1"
              @click.stop="toggleModalAutoplay" 
              class="p-2 text-white hover:text-gray-300 focus:outline-none focus:ring-1 focus:ring-white rounded-full"
              :title="modalAutoplayActive ? 'Pause slideshow' : 'Play slideshow'"
            >
              <svg v-if="!modalAutoplayActive" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </div>
          
          <!-- Right side controls -->
          <div class="flex space-x-3">
            <!-- Zoom controls -->
            <button 
              @click.stop="zoomIn" 
              class="p-2 text-white hover:text-gray-300 focus:outline-none focus:ring-1 focus:ring-white rounded-full"
              title="Zoom in"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
              </svg>
            </button>
            <button 
              @click.stop="zoomOut" 
              class="p-2 text-white hover:text-gray-300 focus:outline-none focus:ring-1 focus:ring-white rounded-full"
              title="Zoom out"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
              </svg>
            </button>
            <button 
              @click.stop="resetZoom" 
              class="p-2 text-white hover:text-gray-300 focus:outline-none focus:ring-1 focus:ring-white rounded-full"
              title="Reset zoom"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            
            <!-- Close button -->
            <button 
              @click.stop="closeCarouselModal" 
              class="p-2 text-white hover:text-gray-300 focus:outline-none focus:ring-1 focus:ring-white rounded-full"
              aria-label="Close modal"
              title="Close (Esc)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <!-- Main carousel image with zooming capabilities - improved for responsive display -->
        <div class="modal-image-container max-w-full max-h-[calc(100vh-160px)] w-full h-full flex items-center justify-center relative">
          <div 
            class="image-zoom-wrapper" 
            :style="{ transform: `scale(${currentZoomLevel})`, transition: 'transform 0.3s ease' }"
            @mousedown="startPan"
            @touchstart="startTouchPan"
            @mousemove="pan"
            @touchmove="touchPan"
            @mouseup="endPan"
            @touchend="endTouchPan"
            @mouseleave="endPan"
          >
            <transition 
              name="fade" 
              mode="out-in"
            >
              <img
                :key="typeof project.imageUrls[modalImageIndex] === 'string'
                      ? project.imageUrls[modalImageIndex]
                      : project.imageUrls[modalImageIndex].url"
                :src="typeof project.imageUrls[modalImageIndex] === 'string'
                      ? project.imageUrls[modalImageIndex]
                      : project.imageUrls[modalImageIndex].url"
                :alt="typeof project.imageUrls[modalImageIndex] === 'string'
                      ? 'Project image'
                      : (project.imageUrls[modalImageIndex].fileName || 'Project image')"
                class="modal-image max-w-full max-h-full object-contain transition-opacity duration-300"
                @load="onModalImageLoad"
                ref="modalImage"
              />
            </transition>
          </div>
          
          <!-- Navigation buttons - larger hit area -->
          <div class="navigation-areas absolute inset-0 flex pointer-events-none">
            <!-- Previous button area -->
            <div 
              v-if="project.imageUrls.length > 1"
              class="w-1/4 h-full pointer-events-auto cursor-w-resize"
              @click.stop="prevModalImage"
            >
              <button 
                class="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70 transition-all"
                aria-label="Previous image"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            </div>
            
            <!-- Middle area with no click action -->
            <div class="w-2/4 h-full pointer-events-none"></div>
            
            <!-- Next button area -->
            <div 
              v-if="project.imageUrls.length > 1"
              class="w-1/4 h-full pointer-events-auto cursor-e-resize"
              @click.stop="nextModalImage"
            >
              <button 
                class="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70 transition-all"
                aria-label="Next image"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        <!-- Bottom controls and thumbnails - responsive design for different screen sizes -->
        <div class="absolute bottom-0 left-0 right-0 p-2 sm:p-4 bg-gradient-to-t from-black to-transparent">
          <!-- Enhanced Thumbnails in modal -->
          <div v-if="project.imageUrls.length > 1" class="thumbnails-slider relative">
            <!-- Thumbnails scroll container with touch support -->
            <div class="thumbnails-track flex space-x-2 overflow-x-auto py-2 max-w-full px-8 sm:px-10 hide-scrollbar touch-pan-x scroll-smooth">
              <div 
                v-for="(image, index) in project.imageUrls" 
                :key="index" 
                @click.stop="modalImageIndex = index"
                class="modal-thumbnail flex-shrink-0 cursor-pointer rounded-md overflow-hidden transition-all duration-300"
                :class="{ 
                  'ring-2 ring-white transform scale-110 shadow-glow': modalImageIndex === index,
                  'opacity-60 grayscale hover:grayscale-0 hover:opacity-90': modalImageIndex !== index 
                }"
              >
                <img
                  :src="typeof image === 'string' ? image : image.url"
                  :alt="typeof image === 'string' ? 'Thumbnail' : (image.fileName || 'Thumbnail')"
                  class="h-12 w-16 sm:h-16 sm:w-24 object-cover"
                  loading="lazy"
                />
              </div>
            </div>
            
            <!-- Thumbnail navigation buttons -->
            <button 
              v-if="project.imageUrls.length > 4"
              class="absolute left-0 top-1/2 transform -translate-y-1/2 p-1 rounded-full bg-black bg-opacity-60 text-white hover:bg-opacity-80"
              @click.stop="scrollModalThumbnails('left')"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <button 
              v-if="project.imageUrls.length > 4"
              class="absolute right-0 top-1/2 transform -translate-y-1/2 p-1 rounded-full bg-black bg-opacity-60 text-white hover:bg-opacity-80"
              @click.stop="scrollModalThumbnails('right')"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
        
        <!-- Keyboard shortcuts help -->
        <div class="absolute bottom-4 right-4 text-gray-500 text-xs">
          <button 
            @click.stop="toggleKeyboardHelp"
            class="p-2 text-gray-400 hover:text-white focus:outline-none focus:ring-1 focus:ring-white rounded-full"
            title="Keyboard shortcuts"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </button>
          
          <div v-if="showKeyboardHelp" class="absolute bottom-10 right-0 bg-black bg-opacity-80 text-white p-3 rounded-lg text-xs w-48">
            <h4 class="font-medium mb-1">Keyboard Shortcuts:</h4>
            <ul class="space-y-1">
              <li>← / →: Previous/Next Image</li>
              <li>Space: Play/Pause Slideshow</li>
              <li>+ / -: Zoom In/Out</li>
              <li>0: Reset Zoom</li>
              <li>Esc: Close</li>
            </ul>
          </div>
        </div>
      </div>
      
      <!-- Loading indicator -->
      <div v-if="isModalImageLoading" class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
        <div class="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, defineProps, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useProjectStore } from '@/stores/projectStore';
import { useTaskStore } from '@/stores/taskStore';
import { usePartStore } from '@/stores/partStore';
import { useCostStore } from '@/stores/costStore';
import { useStorageStore } from '@/stores/storageStore';
import { useErrorStore } from '@/stores/errorStore';

import ProjectForm from '@/components/Projects/ProjectForm.vue';

// Define props to properly handle ID
const props = defineProps({
  id: {
    type: String,
    default: ''
  }
});

// Initialize necessary hooks and stores
const route = useRoute();
const router = useRouter();
const projectStore = useProjectStore();
const taskStore = useTaskStore();
const partStore = usePartStore();
const costStore = useCostStore();
const storageStore = useStorageStore();
const errorStore = useErrorStore();

// Reactive references
const project = ref(null);
const tasks = ref([]);
const parts = ref([]);
const costs = ref([]);
const isEditing = ref(false);
const loading = ref(true);
const selectedImage = ref(null);

// Image carousel references
const currentImageIndex = ref(0);
const carouselModalOpen = ref(false);
const modalImageIndex = ref(0);

// Enhanced modal references
const carouselModal = ref(null);
const modalImage = ref(null);
const isModalImageLoading = ref(false);
const showKeyboardHelp = ref(false);
const currentZoomLevel = ref(1);
const modalAutoplayActive = ref(false);
const modalAutoplayInterval = 3000; // 3 seconds between slides in modal
let modalAutoplayTimer = null;

// Image panning (for zoomed images)
const isPanning = ref(false);
const panPosition = ref({ x: 0, y: 0 });
const startPanPosition = ref({ x: 0, y: 0 });
const lastTouchDistance = ref(0); // For pinch zoom functionality

// Autoplay configuration
const autoplayInterval = 5000; // 5 seconds between slides
let autoplayEnabled = false;
let carouselTimer = null;
let wasAutoplayingBeforeModal = false;

// Keyboard event handling
let keyboardEventsAttached = false;

// Use the ID from props or route params
const projectId = props.id || route.params.id;

// Load project data function
const loadProjectData = async (id) => {
  loading.value = true;
  try {
    // Fetch all necessary data
    await projectStore.fetchProjects();
    await taskStore.fetchTasks();
    await partStore.fetchParts();
    await costStore.fetchCosts();

    // Retrieve the specific project
    project.value = projectStore.getProjectById(id);

    // Retrieve tasks, parts, and costs for the project
    tasks.value = taskStore.getTasksByProjectId(id);
    parts.value = partStore.getPartsByProjectId(id);
    costs.value = costStore.getCostsByProjectId(id);

    if (!project.value) {
      errorStore.showError('Project not found');
      router.push('/projects');
      return;
    }

    // Ensure the project has the imageUrls property and it's properly formed
    if (!project.value.imageUrls) {
      project.value.imageUrls = [];
      console.log("Project has no imageUrls property, initializing as empty array");
    } else if (!Array.isArray(project.value.imageUrls)) {
      console.error("Project imageUrls is not an array, resetting to empty array", project.value.imageUrls);
      project.value.imageUrls = [];
    }

    // If there are no images in the project, try to fetch them from storage
    if (project.value.imageUrls.length === 0) {
      try {
        console.log("Attempting to fetch images from storage for project", id);
        const images = await storageStore.fetchProjectImages(id);
        if (images && images.length > 0) {
          console.log("Found images in storage", images);
          project.value.imageUrls = images;
        }
      } catch (storageError) {
        console.error("Error fetching images from storage:", storageError);
      }
    }

    // Normalize image URLs to ensure they're in the correct format for the carousel
    if (project.value.imageUrls.length > 0) {
      project.value.imageUrls = project.value.imageUrls.map((image, index) => {
        if (typeof image === 'string') {
          // Convert string URLs to object format
          return {
            url: image,
            fileName: `Image ${index + 1}`,
            uploadDate: new Date().toISOString()
          };
        }
        return image;
      });
    }
  } catch (error) {
    errorStore.showError('Something went wrong while fetching project data.');
    console.error(error);
  } finally {
    loading.value = false;
  }
};

// Use onMounted to load project data and set up keyboard event listeners
onMounted(async () => {
  if (projectId) {
    await loadProjectData(projectId);
  }
  
  // Set up keyboard event listeners for the whole app
  if (!keyboardEventsAttached) {
    window.addEventListener('keydown', handleGlobalKeydown);
    keyboardEventsAttached = true;
  }
});

// Clean up when component is unmounted
onUnmounted(() => {
  // Remove event listeners
  if (keyboardEventsAttached) {
    window.removeEventListener('keydown', handleGlobalKeydown);
    keyboardEventsAttached = false;
  }
  
  // Clear any running timers
  if (carouselTimer) {
    clearInterval(carouselTimer);
    carouselTimer = null;
  }
  
  if (modalAutoplayTimer) {
    clearInterval(modalAutoplayTimer);
    modalAutoplayTimer = null;
  }
});

// Format date function
const formatDate = (date) => {
  if (!date) return 'Not set';
  return new Date(date).toLocaleDateString();
};

// Format currency function
const formatCurrency = (value) => {
  return parseFloat(value).toFixed(2);
};

// Toggle edit mode
const toggleEditMode = () => {
  isEditing.value = !isEditing.value;
};

// Handle project save event from ProjectForm
const handleProjectSave = async (updatedProject) => {
  try {
    await projectStore.updateProject(projectId, updatedProject);
    project.value = { ...updatedProject };
    isEditing.value = false;
  } catch (error) {
    errorStore.showError('Error saving project: ' + error.message);
  }
};

// Go back function
const goBack = () => {
  router.back();
};

// Image handling functions
const handleImageUpload = async (event) => {
  const files = event.target.files;
  if (files.length > 0 && project.value) {
    try {
      // Upload the photos
      const uploadedUrls = await storageStore.uploadProjectPhoto(files, projectId);

      // Initialize imageUrls if it doesn't exist
      if (!project.value.imageUrls) {
        project.value.imageUrls = [];
      }

      // Ensure it's an array
      if (!Array.isArray(project.value.imageUrls)) {
        project.value.imageUrls = [];
      }

      // Combine existing and new images
      project.value.imageUrls = [...project.value.imageUrls, ...uploadedUrls];

      // Normalize image URLs to ensure they're all in object format
      project.value.imageUrls = project.value.imageUrls.map((image, index) => {
        if (typeof image === 'string') {
          return {
            url: image,
            fileName: `Image ${index + 1}`,
            uploadDate: new Date().toISOString()
          };
        }
        return image;
      });

      // Update the project in Firestore
      await projectStore.updateProject(projectId, { imageUrls: project.value.imageUrls });

      // Reset file input
      event.target.value = '';

      // Show success message
      errorStore.showNotification('Images uploaded successfully', 'success');
    } catch (error) {
      errorStore.showError('Failed to upload images: ' + error.message);
      console.error('Image upload error:', error);
    }
  }
};

const deleteImage = async (image) => {
  if (project.value) {
    try {
      const imageUrl = typeof image === 'string' ? image : image.url;

      if (!imageUrl) {
        throw new Error('Invalid image format');
      }

      // Delete from Firebase Storage
      await storageStore.deleteProjectImage(imageUrl, projectId);

      // Remove from local state
      project.value.imageUrls = project.value.imageUrls.filter(img => {
        if (typeof img === 'string') {
          return img !== imageUrl;
        } else {
          return img.url !== imageUrl;
        }
      });

      // Update project in Firestore
      await projectStore.updateProject(projectId, { imageUrls: project.value.imageUrls });

      // Show success message
      errorStore.showNotification('Image deleted successfully', 'success');
    } catch (error) {
      errorStore.showError('Failed to delete image: ' + error.message);
      console.error('Image deletion error:', error);
    }
  }
};

// Carousel functions
const nextImage = () => {
  if (!project.value || !project.value.imageUrls || project.value.imageUrls.length <= 1) return;
  currentImageIndex.value = (currentImageIndex.value + 1) % project.value.imageUrls.length;
  
  // Ensure the selected thumbnail is visible by scrolling to it
  scrollToThumbnail(currentImageIndex.value);
};

const prevImage = () => {
  if (!project.value || !project.value.imageUrls || project.value.imageUrls.length <= 1) return;
  currentImageIndex.value = (currentImageIndex.value - 1 + project.value.imageUrls.length) % project.value.imageUrls.length;
  
  // Ensure the selected thumbnail is visible by scrolling to it
  scrollToThumbnail(currentImageIndex.value);
};

/**
 * Handles auto-advancing of the carousel
 */
const startAutoplay = () => {
  if (carouselTimer) clearInterval(carouselTimer);
  
  carouselTimer = setInterval(() => {
    if (autoplayEnabled && !carouselModalOpen.value) {
      nextImage();
    }
  }, autoplayInterval);
};

/**
 * Stops the carousel autoplay
 */
const stopAutoplay = () => {
  if (carouselTimer) {
    clearInterval(carouselTimer);
    carouselTimer = null;
  }
};

/**
 * Toggles autoplay on/off
 */
const toggleAutoplay = () => {
  autoplayEnabled = !autoplayEnabled;
  if (autoplayEnabled) {
    startAutoplay();
  } else {
    stopAutoplay();
  }
  return autoplayEnabled;
};

/**
 * Scrolls the thumbnail container to show the thumbnail at the specified index
 * @param {number} index - The index of the thumbnail to scroll to
 */
const scrollToThumbnail = (index) => {
  // Use setTimeout to ensure DOM has updated
  setTimeout(() => {
    const thumbnailsContainer = document.querySelector('.thumbnails-scroll-container');
    if (!thumbnailsContainer) return;
    
    const thumbnail = thumbnailsContainer.children[index];
    if (!thumbnail) return;
    
    // Calculate the scroll position to center the thumbnail
    const containerWidth = thumbnailsContainer.clientWidth;
    const thumbnailLeft = thumbnail.offsetLeft;
    const thumbnailWidth = thumbnail.clientWidth;
    
    const scrollLeft = thumbnailLeft - (containerWidth / 2) + (thumbnailWidth / 2);
    thumbnailsContainer.scrollTo({ left: scrollLeft, behavior: 'smooth' });
  }, 50);
};

/**
 * Handles scrolling the thumbnails container left or right
 * @param {string} direction - 'left' or 'right'
 */
const scrollThumbnails = (direction) => {
  const thumbnailsContainer = document.querySelector('.thumbnails-scroll-container');
  if (!thumbnailsContainer) return;
  
  const scrollAmount = 200; // pixels to scroll
  const currentScrollLeft = thumbnailsContainer.scrollLeft;
  
  thumbnailsContainer.scrollTo({
    left: direction === 'left' 
      ? currentScrollLeft - scrollAmount 
      : currentScrollLeft + scrollAmount,
    behavior: 'smooth'
  });
};

/**
 * Opens the fullscreen carousel modal
 * @param {number} index - The index of the image to display
 */
const openCarouselModal = (index) => {
  if (!project.value || !project.value.imageUrls) return;
  modalImageIndex.value = index;
  carouselModalOpen.value = true;
  document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
  isModalImageLoading.value = true;
  
  // Stop autoplay when modal is open
  wasAutoplayingBeforeModal = autoplayEnabled;
  if (autoplayEnabled) {
    stopAutoplay();
  }
  
  // Reset zoom and pan state
  currentZoomLevel.value = 1;
  panPosition.value = { x: 0, y: 0 };
  
  // Preload adjacent images for smoother navigation
  preloadAdjacentImages(index);
  
  // Focus the modal for keyboard navigation
  nextTick(() => {
    if (carouselModal.value) {
      carouselModal.value.focus();
    }
  });
};

/**
 * Closes the fullscreen carousel modal
 */
const closeCarouselModal = () => {
  // Stop modal autoplay if active
  if (modalAutoplayActive.value) {
    stopModalAutoplay();
  }
  
  // Reset modal state
  carouselModalOpen.value = false;
  document.body.style.overflow = ''; // Re-enable scrolling
  currentZoomLevel.value = 1;
  showKeyboardHelp.value = false;
  
  // Resume autoplay if it was active before opening modal
  if (wasAutoplayingBeforeModal) {
    autoplayEnabled = true;
    startAutoplay();
  }
};

/**
 * Handle image load event in modal
 */
const onModalImageLoad = () => {
  isModalImageLoading.value = false;
};

/**
 * Toggle keyboard shortcuts help dialog
 */
const toggleKeyboardHelp = () => {
  showKeyboardHelp.value = !showKeyboardHelp.value;
};

/**
 * Handle keyboard events in the modal
 */
const handleModalKeydown = (event) => {
  // Only handle keyboard events when modal is open
  if (!carouselModalOpen.value) return;
  
  switch (event.key) {
    case 'ArrowLeft':
      prevModalImage();
      event.preventDefault();
      break;
    case 'ArrowRight':
      nextModalImage();
      event.preventDefault();
      break;
    case ' ':
      toggleModalAutoplay();
      event.preventDefault();
      break;
    case 'Escape':
      closeCarouselModal();
      event.preventDefault();
      break;
    case '+':
    case '=':
      zoomIn();
      event.preventDefault();
      break;
    case '-':
      zoomOut();
      event.preventDefault();
      break;
    case '0':
      resetZoom();
      event.preventDefault();
      break;
  }
};

/**
 * Handle global keyboard events (when not in modal)
 */
const handleGlobalKeydown = (event) => {
  // Skip if modal is open (handled separately)
  if (carouselModalOpen.value) return;
  
  // Skip if the event target is an input element or if focus is in an input field
  if (event.target.tagName === 'INPUT' || 
      event.target.tagName === 'TEXTAREA' ||
      event.target.isContentEditable) {
    return;
  }
  
  // Only handle when viewing a project with images
  if (!project.value || !project.value.imageUrls || project.value.imageUrls.length <= 0) return;
  
  switch (event.key) {
    case 'ArrowLeft':
      prevImage();
      event.preventDefault();
      break;
    case 'ArrowRight':
      nextImage();
      event.preventDefault();
      break;
    case ' ':
      toggleAutoplay();
      event.preventDefault();
      break;
  }
};

/**
 * Zoom in on the image
 */
const zoomIn = () => {
  if (currentZoomLevel.value < 3) { // Max zoom of 3x
    currentZoomLevel.value += 0.25;
  }
};

/**
 * Zoom out of the image
 */
const zoomOut = () => {
  if (currentZoomLevel.value > 0.5) { // Min zoom of 0.5x
    currentZoomLevel.value -= 0.25;
  }
};

/**
 * Reset zoom to original size
 */
const resetZoom = () => {
  currentZoomLevel.value = 1;
  // Reset any panning offset
  panPosition.value = { x: 0, y: 0 };
  if (modalImage.value) {
    modalImage.value.style.transform = 'translate(0px, 0px)';
  }
};

/**
 * Start panning (moving) a zoomed image with mouse
 */
const startPan = (event) => {
  if (currentZoomLevel.value <= 1) return; // Only allow panning when zoomed in
  
  isPanning.value = true;
  startPanPosition.value = {
    x: event.clientX,
    y: event.clientY
  };
};

/**
 * Start panning (moving) a zoomed image with touch
 */
const startTouchPan = (event) => {
  if (event.touches.length === 1 && currentZoomLevel.value > 1) {
    // Single touch - start panning
    isPanning.value = true;
    startPanPosition.value = {
      x: event.touches[0].clientX,
      y: event.touches[0].clientY
    };
  } else if (event.touches.length === 2) {
    // Two touches - track for pinch zoom
    lastTouchDistance.value = getTouchDistance(event.touches[0], event.touches[1]);
  }
  
  // Prevent default to avoid page scrolling while interacting with image
  event.preventDefault();
};

/**
 * Calculate distance between two touch points for pinch zoom
 */
const getTouchDistance = (touch1, touch2) => {
  const dx = touch1.clientX - touch2.clientX;
  const dy = touch1.clientY - touch2.clientY;
  return Math.sqrt(dx * dx + dy * dy);
};

/**
 * Pan (move) a zoomed image with mouse
 */
const pan = (event) => {
  if (!isPanning.value || !modalImage.value) return;
  
  const deltaX = event.clientX - startPanPosition.value.x;
  const deltaY = event.clientY - startPanPosition.value.y;
  
  panPosition.value = {
    x: panPosition.value.x + deltaX,
    y: panPosition.value.y + deltaY
  };
  
  // Apply the panning transformation
  modalImage.value.style.transform = `translate(${panPosition.value.x}px, ${panPosition.value.y}px)`;
  
  // Update start position for next move
  startPanPosition.value = {
    x: event.clientX,
    y: event.clientY
  };
};

/**
 * Pan (move) or pinch zoom a zoomed image with touch
 */
const touchPan = (event) => {
  if (event.touches.length === 1 && isPanning.value && modalImage.value) {
    // Single touch - panning
    const deltaX = event.touches[0].clientX - startPanPosition.value.x;
    const deltaY = event.touches[0].clientY - startPanPosition.value.y;
    
    panPosition.value = {
      x: panPosition.value.x + deltaX,
      y: panPosition.value.y + deltaY
    };
    
    // Apply the panning transformation
    modalImage.value.style.transform = `translate(${panPosition.value.x}px, ${panPosition.value.y}px)`;
    
    // Update start position for next move
    startPanPosition.value = {
      x: event.touches[0].clientX,
      y: event.touches[0].clientY
    };
  } else if (event.touches.length === 2) {
    // Two touches - pinch zoom
    const currentDistance = getTouchDistance(event.touches[0], event.touches[1]);
    
    if (lastTouchDistance.value > 0) {
      const distanceChange = currentDistance - lastTouchDistance.value;
      
      // Adjust zoom based on pinch/spread gesture
      // Scale the change to make it more subtle
      const zoomChange = distanceChange * 0.01;
      
      // Update zoom level with constraints
      const newZoom = Math.max(0.5, Math.min(3, currentZoomLevel.value + zoomChange));
      if (newZoom !== currentZoomLevel.value) {
        currentZoomLevel.value = newZoom;
      }
    }
    
    lastTouchDistance.value = currentDistance;
  }
  
  // Prevent default to avoid page scrolling
  event.preventDefault();
};

/**
 * End panning of a zoomed image with mouse
 */
const endPan = () => {
  isPanning.value = false;
};

/**
 * End panning of a zoomed image with touch
 */
const endTouchPan = (event) => {
  isPanning.value = false;
  lastTouchDistance.value = 0;
};

/**
 * Toggle modal autoplay on/off
 */
const toggleModalAutoplay = () => {
  if (modalAutoplayActive.value) {
    stopModalAutoplay();
  } else {
    startModalAutoplay();
  }
};

/**
 * Start autoplay for the modal slideshow
 */
const startModalAutoplay = () => {
  modalAutoplayActive.value = true;
  
  if (modalAutoplayTimer) {
    clearInterval(modalAutoplayTimer);
  }
  
  modalAutoplayTimer = setInterval(() => {
    nextModalImage();
  }, modalAutoplayInterval);
};

/**
 * Stop autoplay for the modal slideshow
 */
const stopModalAutoplay = () => {
  modalAutoplayActive.value = false;
  
  if (modalAutoplayTimer) {
    clearInterval(modalAutoplayTimer);
    modalAutoplayTimer = null;
  }
};

/**
 * Scroll thumbnails in the modal
 */
const scrollModalThumbnails = (direction) => {
  const thumbnailsTrack = document.querySelector('.thumbnails-track');
  if (!thumbnailsTrack) return;
  
  const scrollAmount = 240; // pixels to scroll
  const currentScrollLeft = thumbnailsTrack.scrollLeft;
  
  thumbnailsTrack.scrollTo({
    left: direction === 'left' 
      ? currentScrollLeft - scrollAmount 
      : currentScrollLeft + scrollAmount,
    behavior: 'smooth'
  });
};

/**
 * Shows the next image in the modal
 */
const nextModalImage = () => {
  if (!project.value || !project.value.imageUrls || project.value.imageUrls.length <= 1) return;
  modalImageIndex.value = (modalImageIndex.value + 1) % project.value.imageUrls.length;
  
  // Preload next images for smoother navigation
  preloadAdjacentImages(modalImageIndex.value);
};

/**
 * Shows the previous image in the modal
 */
const prevModalImage = () => {
  if (!project.value || !project.value.imageUrls || project.value.imageUrls.length <= 1) return;
  modalImageIndex.value = (modalImageIndex.value - 1 + project.value.imageUrls.length) % project.value.imageUrls.length;
  
  // Preload adjacent images for smoother navigation
  preloadAdjacentImages(modalImageIndex.value);
};

/**
 * Preloads adjacent images to ensure smooth navigation
 * @param {number} currentIndex - The current image index
 */
const preloadAdjacentImages = (currentIndex) => {
  if (!project.value || !project.value.imageUrls) return;
  
  const totalImages = project.value.imageUrls.length;
  if (totalImages <= 1) return;
  
  // Calculate indices of next and previous images
  const nextIndex = (currentIndex + 1) % totalImages;
  const prevIndex = (currentIndex - 1 + totalImages) % totalImages;
  
  // Create Image objects to load the adjacent images into browser cache
  const nextImage = new Image();
  nextImage.src = project.value.imageUrls[nextIndex].url;
  
  const prevImage = new Image();
  prevImage.src = project.value.imageUrls[prevIndex].url;
};

// Legacy image modal function (keeping for compatibility)
const openImageModal = (imageUrl) => {
  selectedImage.value = imageUrl;
};

// Navigation functions
const handleAddTask = () => {
  if (project.value) {
    router.push({
      path: `/addTask/${projectId}/${encodeURIComponent(project.value.projectName)}`,
    });
  }
};

const navigateToEditTask = (taskId) => {
  router.push(`/editTask/${taskId}`);
};

const navigateToViewTask = (taskId) => {
  router.push(`/viewTask/${taskId}`);
};

const handleAddPart = () => {
  if (project.value) {
    router.push({
      path: `/addPart/${projectId}`,
    });
  }
};

const navigateToEditPart = (partId) => {
  router.push(`/editPart/${partId}`);
};

const navigateToViewPart = (partId) => {
  router.push(`/viewPart/${partId}`);
};

const handleAddCost = () => {
  if (project.value) {
    router.push({
      path: `/addCost/${projectId}`,
    });
  }
};

const navigateToEditCost = (costId) => {
  router.push(`/editCost/${costId}`);
};

const navigateToViewCost = (costId) => {
  router.push(`/viewCost/${costId}`);
};
</script>

<style scoped>
.project-detail-container {
  background-color: #f5f5f5;
  border-radius: 8px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: #4f46e5;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.not-found {
  text-align: center;
  padding: 60px 20px;
}

.not-found-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.not-found h3 {
  margin-bottom: 8px;
  font-size: 24px;
}

.not-found p {
  margin-bottom: 24px;
  color: #6b7280;
}

.section {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.task-list li,
.part-list li,
.cost-list li {
  transition: background-color 0.2s;
}

.task-list li:hover,
.part-list li:hover,
.cost-list li:hover {
  background-color: #f9f9f9;
}

.meta-item {
  margin-bottom: 16px;
}

.meta-label {
  margin-bottom: 4px;
}

.btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.btn.primary {
  background-color: #4f46e5;
  color: white;
}

.btn.primary:hover {
  background-color: #4338ca;
}

.btn.secondary {
  background-color: #f3f4f6;
  color: #374151;
}

.btn.secondary:hover {
  background-color: #e5e7eb;
}

/* Dark mode support */
:global(.dark) .btn.primary {
  background-color: #4f46e5;
}

:global(.dark) .btn.primary:hover {
  background-color: #4338ca;
}

:global(.dark) .btn.secondary {
  background-color: #374151;
  color: #f3f4f6;
}

:global(.dark) .btn.secondary:hover {
  background-color: #4b5563;
}

/* Image carousel styles - optimized for responsive design */
.featured-image-container {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 640px) {
  .featured-image-container {
    max-height: 300px; /* Smaller height on mobile */
  }
}

.featured-image {
  max-width: 100%;
  height: auto;
  transition: all 0.3s ease;
  object-fit: contain;
}

/* Hide scrollbar but allow scrolling */
.hide-scrollbar {
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE/Edge */
}

.hide-scrollbar::-webkit-scrollbar {
  display: none; /* Chrome/Safari/Opera */
}

.thumbnails-container,
.thumbnails-scroll-container,
.thumbnails-track {
  scrollbar-width: thin;
  scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
  -webkit-overflow-scrolling: touch; /* Smooth scrolling on iOS */
}

/* Only show scrollbars on desktop */
@media (min-width: 768px) {
  .thumbnails-container::-webkit-scrollbar,
  .thumbnails-scroll-container::-webkit-scrollbar,
  .thumbnails-track::-webkit-scrollbar {
    height: 6px;
  }

  .thumbnails-container::-webkit-scrollbar-track,
  .thumbnails-scroll-container::-webkit-scrollbar-track,
  .thumbnails-track::-webkit-scrollbar-track {
    background: transparent;
  }

  .thumbnails-container::-webkit-scrollbar-thumb,
  .thumbnails-scroll-container::-webkit-scrollbar-thumb,
  .thumbnails-track::-webkit-scrollbar-thumb {
    background-color: rgba(156, 163, 175, 0.5);
    border-radius: 20px;
  }
}

.thumbnail-item {
  border: 2px solid transparent;
  transition: all 0.2s ease;
  position: relative;
}

.thumbnail-item:hover {
  transform: scale(1.05);
}

/* Aspect ratio container for consistent image display */
.aspect-ratio-container {
  width: 100%;
}

/* Navigation controls */
.nav-arrow {
  opacity: 0.7;
  transition: all 0.2s ease;
}

.nav-arrow:hover {
  opacity: 1;
  transform: scale(1.1);
}

.thumbnail-nav-btn {
  transition: all 0.2s ease;
}

.thumbnail-nav-btn:hover {
  transform: translateY(-50%) scale(1.1);
}

/* Touch-friendly navigation buttons */
@media (max-width: 768px) {
  .nav-arrow, .thumbnail-nav-btn {
    padding: 10px; /* Larger hit area for touch */
  }
}

/* Modal styles */
.image-counter {
  font-size: 0.8rem;
  padding: 2px 8px;
  border-radius: 9999px;
}

.modal-image {
  user-select: none;
  touch-action: pan-x pan-y; /* Allow native touch gestures */
}

.image-zoom-wrapper {
  transform-origin: center;
  will-change: transform;
  touch-action: none; /* Disable browser handling of gestures when zoomed */
}

.shadow-glow {
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
}

/* Thumbnail transitions */
.modal-thumbnail {
  transition: all 0.3s ease;
}

.modal-thumbnail:hover {
  transform: scale(1.1);
  opacity: 0.9;
}

/* Fade transition for images */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Carousel slide transition */
.carousel-slide-enter-active,
.carousel-slide-leave-active {
  transition: opacity 0.5s ease, transform 0.5s ease;
  position: absolute;
}

.carousel-slide-enter-from {
  opacity: 0;
  transform: translateX(50px);
}

.carousel-slide-leave-to {
  opacity: 0;
  transform: translateX(-50px);
}

/* Cursor styles for panning */
.cursor-grab {
  cursor: grab;
}

.cursor-grabbing {
  cursor: grabbing;
}

/* Responsive grid enhancements */
.image-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #f9fafb;
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s, box-shadow 0.2s;
}

.image-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.image-container {
  position: relative;
  width: 100%;
  height: 150px; /* Fixed height for consistency */
  overflow: hidden;
}

.image-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Dark mode support */
:global(.dark) .image-card {
  background-color: #1f2937;
}

/* Enable smooth scrolling for the entire page */
html {
  scroll-behavior: smooth;
}

/* Touch-friendly styling for mobile devices */
@media (max-width: 640px) {
  .touch-pan-x {
    touch-action: pan-x; /* Allow horizontal swipe */
  }
}
</style>