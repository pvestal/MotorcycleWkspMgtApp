<template>
  <div class="data-retention-manager bg-white shadow-md rounded-lg p-6">
    <h2 class="text-2xl font-bold text-gray-800 mb-6">Data Retention Manager</h2>

    <div class="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
      <h3 class="text-xl font-semibold text-blue-800 mb-3">About Data Retention</h3>
      <p class="text-blue-700 mb-2">
        Records older than <span class="font-bold">{{ retentionPeriodDays }} days</span> are automatically cleaned up daily.
      </p>
      <p class="text-blue-700 mb-2">
        User activity data is summarized into monthly activity reports before deletion.
      </p>
      <p class="text-sm text-blue-500">
        Last scheduled cleanup: {{ lastCleanupDate ? formatDate(lastCleanupDate) : 'Not available' }}
      </p>
    </div>

    <!-- Collection Statistics -->
    <div class="mb-8">
      <h3 class="text-xl font-semibold text-gray-700 mb-4">Collection Statistics</h3>
      <div v-if="isLoadingStats" class="flex justify-center items-center py-6">
        <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div 
          v-for="(stat, collection) in collectionStats" 
          :key="collection" 
          class="p-4 bg-white rounded-lg border border-gray-200 shadow-sm"
        >
          <h4 class="font-medium text-gray-700 mb-2 flex justify-between">
            {{ formatCollectionName(collection) }}
            <span class="text-sm bg-blue-100 text-blue-700 py-1 px-2 rounded-full">{{ stat.count }} records</span>
          </h4>
          <div class="text-sm text-gray-500">
            <p>Oldest record: {{ stat.oldestDate ? formatDate(stat.oldestDate) : 'None' }}</p>
            <p>Records older than {{ retentionPeriodDays }} days: <span class="font-medium">{{ stat.oldRecordsCount || 0 }}</span></p>
            <div class="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div 
                class="bg-blue-500 h-2 rounded-full"
                :style="{ width: `${calculatePercentage(stat.oldRecordsCount, stat.count)}%` }"
                :title="`${calculatePercentage(stat.oldRecordsCount, stat.count)}% of records are older than ${retentionPeriodDays} days`"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Manual Cleanup -->
    <div class="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
      <h3 class="text-xl font-semibold text-gray-700 mb-4">Manual Cleanup</h3>
      <div class="bg-yellow-50 p-3 rounded-lg border border-yellow-200 mb-4">
        <p class="text-yellow-700 text-sm">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 inline-block mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
          <span class="font-medium">Warning:</span> Manual cleanup operations are irreversible. Summaries will be created for user activities.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <!-- Collection Selection -->
        <div>
          <label class="block mb-2 text-sm font-medium text-gray-700">Select Collections</label>
          <div class="space-y-2">
            <div v-for="collection in cleanableCollections" :key="collection">
              <label class="inline-flex items-center">
                <input type="checkbox" v-model="selectedCollections" :value="collection" class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50">
                <span class="ml-2 text-gray-700">{{ formatCollectionName(collection) }}</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Custom Settings -->
        <div>
          <div class="mb-4">
            <label class="block mb-2 text-sm font-medium text-gray-700">Custom Retention Period (Days)</label>
            <input 
              type="number" 
              v-model="customRetentionDays" 
              min="1" 
              max="365" 
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            >
          </div>
          
          <div class="mb-4">
            <label class="block mb-2 text-sm font-medium text-gray-700">Specific User ID (Optional)</label>
            <div class="flex">
              <input 
                type="text" 
                v-model="specificUserId" 
                placeholder="Leave empty to clean all users" 
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              >
              <button 
                @click="openUserSelector"
                type="button"
                class="ml-2 px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Browse
              </button>
            </div>
            <p v-if="selectedUserName" class="mt-1 text-sm text-gray-500">
              Selected: {{ selectedUserName }}
            </p>
          </div>
        </div>
      </div>

      <div class="flex justify-end space-x-3">
        <button 
          @click="refreshStats" 
          type="button"
          class="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Refresh Stats
        </button>
        <button 
          @click="performManualCleanup" 
          type="button"
          :disabled="isCleanupInProgress || selectedCollections.length === 0"
          :class="{ 
            'px-4 py-2 shadow-sm text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2': true,
            'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500': !isCleanupInProgress && selectedCollections.length > 0,
            'bg-gray-300 text-gray-500 cursor-not-allowed': isCleanupInProgress || selectedCollections.length === 0
          }"
        >
          <span v-if="isCleanupInProgress" class="flex items-center">
            <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </span>
          <span v-else>Start Cleanup</span>
        </button>
      </div>
    </div>

    <!-- Cleanup Results -->
    <div v-if="cleanupResults" class="mt-6 p-6 bg-green-50 rounded-lg border border-green-200">
      <h3 class="text-lg font-semibold text-green-800 mb-3">Cleanup Results</h3>
      <div class="space-y-2">
        <div v-for="(count, collection) in cleanupResults.deletedRecords" :key="collection">
          <div class="flex justify-between items-center">
            <span class="text-green-700">{{ formatCollectionName(collection) }}:</span>
            <span class="font-medium text-green-800">{{ count }} records removed</span>
          </div>
        </div>
        <div class="pt-2 mt-2 border-t border-green-200">
          <p class="text-green-700">Cleanup completed successfully at {{ formatDate(new Date()) }}</p>
        </div>
      </div>
    </div>

    <!-- User Selector Modal -->
    <div v-if="showUserSelector" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg max-w-xl w-full max-h-[80vh] flex flex-col">
        <div class="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 class="text-lg font-medium text-gray-900">Select User</h3>
          <button @click="showUserSelector = false" class="text-gray-500 hover:text-gray-700">
            <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="p-4 overflow-y-auto flex-grow">
          <input 
            type="text" 
            v-model="userSearchQuery" 
            placeholder="Search by name or email" 
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 mb-4"
          >
          <div v-if="isLoadingUsers" class="flex justify-center items-center py-12">
            <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
          <div v-else-if="filteredUsers.length === 0" class="py-12 text-center text-gray-500">
            No users found matching your search
          </div>
          <div v-else class="divide-y divide-gray-200">
            <div 
              v-for="user in filteredUsers" 
              :key="user.uid" 
              class="py-3 px-2 hover:bg-gray-50 flex items-center cursor-pointer"
              @click="selectUser(user)"
            >
              <img 
                :src="user.photoURL || 'https://api.dicebear.com/6.x/initials/svg?seed=' + user.displayName" 
                :alt="user.displayName"
                class="h-10 w-10 rounded-full object-cover mr-3"
              />
              <div>
                <div class="font-medium text-gray-900">{{ user.displayName }}</div>
                <div class="text-sm text-gray-500">{{ user.email }}</div>
              </div>
              <div v-if="user.uid === specificUserId" class="ml-auto text-blue-600">
                <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        <div class="p-4 border-t border-gray-200 flex justify-end">
          <button 
            @click="showUserSelector = false" 
            class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 mr-2"
          >
            Cancel
          </button>
          <button 
            @click="confirmUserSelection"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Confirm Selection
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useUserStore } from '@/stores/userStore';
import { useErrorStore } from '@/stores/errorStore';
import { db, functions } from '@/fbConfig';
import { collection, getDocs, query, orderBy, limit, where, Timestamp } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';

// Stores
const userStore = useUserStore();
const errorStore = useErrorStore();

// Data retention configuration
const retentionPeriodDays = ref(30);
const lastCleanupDate = ref(null);

// Collection statistics
const collectionStats = ref({});
const isLoadingStats = ref(true);

// Cleanup settings
const cleanableCollections = [
  'activities', 
  'contributions', 
  'aiMessages', 
  'userActivities'
];
const selectedCollections = ref([]);
const customRetentionDays = ref(30);
const specificUserId = ref('');
const selectedUserName = ref('');
const isCleanupInProgress = ref(false);
const cleanupResults = ref(null);

// User selector
const showUserSelector = ref(false);
const users = ref([]);
const isLoadingUsers = ref(false);
const userSearchQuery = ref('');
const tempSelectedUser = ref(null);

// Computed properties
const filteredUsers = computed(() => {
  if (!userSearchQuery.value) return users.value;
  
  const query = userSearchQuery.value.toLowerCase();
  return users.value.filter(user => 
    (user.displayName && user.displayName.toLowerCase().includes(query)) ||
    (user.email && user.email.toLowerCase().includes(query)) ||
    (user.uid && user.uid.includes(query))
  );
});

// Methods
const formatDate = (date) => {
  if (!date) return 'N/A';
  
  const dateObj = date instanceof Timestamp ? date.toDate() : new Date(date);
  return dateObj.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatCollectionName = (name) => {
  if (name === 'userActivities') return 'User Activities';
  return name.charAt(0).toUpperCase() + name.slice(1);
};

const calculatePercentage = (part, total) => {
  if (!total) return 0;
  return Math.round((part / total) * 100);
};

const fetchCollectionStats = async () => {
  isLoadingStats.value = true;
  
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionPeriodDays.value);
    const cutoffTimestamp = Timestamp.fromDate(cutoffDate);
    
    const stats = {};
    
    // Process main collections
    for (const collectionName of cleanableCollections) {
      if (collectionName === 'userActivities') continue; // Skip, handled separately
      
      // Get total count
      const collectionRef = collection(db, collectionName);
      const snapshot = await getDocs(collectionRef);
      
      // Get oldest record date
      const oldestQuery = query(collectionRef, orderBy('timestamp', 'asc'), limit(1));
      const oldestSnapshot = await getDocs(oldestQuery);
      
      // Get count of records older than cutoff
      const oldRecordsQuery = query(collectionRef, where('timestamp', '<', cutoffTimestamp));
      const oldRecordsSnapshot = await getDocs(oldRecordsQuery);
      
      stats[collectionName] = {
        count: snapshot.size,
        oldestDate: oldestSnapshot.empty ? null : oldestSnapshot.docs[0].data().timestamp,
        oldRecordsCount: oldRecordsSnapshot.size
      };
    }
    
    // Handle user activities (special case)
    const usersRef = collection(db, 'users');
    const usersSnapshot = await getDocs(usersRef);
    
    let totalUserActivities = 0;
    let oldUserActivities = 0;
    let oldestUserActivity = null;
    
    for (const userDoc of usersSnapshot.docs) {
      const activitiesRef = collection(db, 'users', userDoc.id, 'activities');
      const activitiesSnapshot = await getDocs(activitiesRef);
      
      totalUserActivities += activitiesSnapshot.size;
      
      if (activitiesSnapshot.size > 0) {
        // Check for oldest
        const oldestQuery = query(activitiesRef, orderBy('timestamp', 'asc'), limit(1));
        const oldestSnapshot = await getDocs(oldestQuery);
        
        if (!oldestSnapshot.empty) {
          const timestamp = oldestSnapshot.docs[0].data().timestamp;
          if (!oldestUserActivity || timestamp < oldestUserActivity) {
            oldestUserActivity = timestamp;
          }
        }
        
        // Check for old records
        const oldRecordsQuery = query(activitiesRef, where('timestamp', '<', cutoffTimestamp));
        const oldRecordsSnapshot = await getDocs(oldRecordsQuery);
        oldUserActivities += oldRecordsSnapshot.size;
      }
    }
    
    stats['userActivities'] = {
      count: totalUserActivities,
      oldestDate: oldestUserActivity,
      oldRecordsCount: oldUserActivities
    };
    
    collectionStats.value = stats;
  } catch (error) {
    console.error('Error fetching collection stats:', error);
    errorStore.showError('Failed to fetch collection statistics');
  } finally {
    isLoadingStats.value = false;
  }
};

const fetchCleanupMetadata = async () => {
  try {
    // Try to get the last cleanup date
    const metadataRef = collection(db, 'system');
    const metadataSnapshot = await getDocs(metadataRef);
    
    const cleanupDoc = metadataSnapshot.docs.find(doc => doc.id === 'dataRetention');
    if (cleanupDoc) {
      const data = cleanupDoc.data();
      lastCleanupDate.value = data.lastCleanupDate;
      retentionPeriodDays.value = data.retentionPeriodDays || 30;
    }
  } catch (error) {
    console.error('Error fetching cleanup metadata:', error);
  }
};

const fetchUsers = async () => {
  isLoadingUsers.value = true;
  
  try {
    const usersQuery = query(collection(db, 'users'), limit(100));
    const usersSnapshot = await getDocs(usersQuery);
    
    users.value = usersSnapshot.docs.map(doc => doc.data());
  } catch (error) {
    console.error('Error fetching users:', error);
    errorStore.showError('Failed to fetch users');
  } finally {
    isLoadingUsers.value = false;
  }
};

const openUserSelector = () => {
  if (users.value.length === 0) {
    fetchUsers();
  }
  showUserSelector.value = true;
};

const selectUser = (user) => {
  tempSelectedUser.value = user;
};

const confirmUserSelection = () => {
  if (tempSelectedUser.value) {
    specificUserId.value = tempSelectedUser.value.uid;
    selectedUserName.value = tempSelectedUser.value.displayName;
  }
  showUserSelector.value = false;
};

const refreshStats = () => {
  fetchCollectionStats();
};

const performManualCleanup = async () => {
  if (selectedCollections.value.length === 0) {
    errorStore.showError('Please select at least one collection to clean up');
    return;
  }
  
  // Confirm before proceeding
  if (!confirm(`Are you sure you want to permanently delete records older than ${customRetentionDays.value} days? This action cannot be undone.`)) {
    return;
  }
  
  isCleanupInProgress.value = true;
  cleanupResults.value = null;
  
  try {
    // Prepare request data
    const requestData = {
      collectionNames: selectedCollections.value,
      customRetentionDays: parseInt(customRetentionDays.value),
    };
    
    if (specificUserId.value) {
      requestData.specificUserId = specificUserId.value;
    }
    
    // Call the cloud function
    const manualCleanup = httpsCallable(functions, 'manualCleanup');
    const result = await manualCleanup(requestData);
    
    cleanupResults.value = result.data;
    
    // Refresh stats after cleanup
    await fetchCollectionStats();
    
    errorStore.showNotification('Data cleanup completed successfully', 'success');
  } catch (error) {
    console.error('Error performing manual cleanup:', error);
    errorStore.showError('Failed to perform cleanup: ' + (error.message || 'Unknown error'));
  } finally {
    isCleanupInProgress.value = false;
  }
};

// Initialize data
onMounted(async () => {
  await fetchCleanupMetadata();
  await fetchCollectionStats();
});
</script>

<style scoped>
/* 
* Add any custom styling here if needed 
*/
</style>