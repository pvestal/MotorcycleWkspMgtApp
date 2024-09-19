<template>
  <div v-if="parts.value">
    <h2>Parts List</h2>
    <ul class="part-list">
      <li v-for="part in parts" :key="part.id">
        <span class="part-title">{{ part.partName }}</span>
        <span :class="`status ${part.partStatus.toLowerCase().replace(' ', '-')}`">{{ part.partStatus }}</span>
        <span :class="['priority', part.partPriority.toLowerCase()]">{{ part.partPriority }}</span>
        <button @click="navigateToEdit(part.id)"><span class="material-symbols-outlined">edit</span></button>
        <button @click="navigateToView(part.id)"><span class="material-symbols-outlined">visibility</span></button>
      </li>
    </ul>
  </div>
  <div v-else>
    <h2>No Parts Added.</h2>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { usePartStore } from '@/stores/partStore';

const partStore = usePartStore();
const router = useRouter();
const parts = ref([])

const props = defineProps({
  projectId: {
    type: String,
    required: true
  },
  parts: {
  type: Array,
  required: true,
  }
});

onMounted(async () => {
  if (props.projectId) {
    // Fetch parts just for the project
    parts.value = await partStore.fetchPartsByProjectId(props.projectId);
  } else {
    // Fetch all tasks (if applicable)
    parts.value = await partStore.fetchParts();
  }
});


const navigateToEdit = (id) => {
  router.push(`/editpart/${id}`);
};

const navigateToView = (id) => {
  router.push(`/viewpart/${id}`);
};
</script>


<style>
/* Container for the ordered list */
ol.part-list {
  list-style-type: none;
  padding: 0;
  margin: 0;
  counter-reset: part;
}

.part-list li {
  display: flex;
  align-parts: center;
  padding: 10px;
  margin-bottom: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: #f9f9f9;
  counter-increment: part;
}

.part-list li::before {
  content: counter(part) ".";
  margin-right: 10px;
  font-weight: bold;
  color: #333;
}

.part-number {
  margin-right: 10px;
  font-weight: bold;
}

.priority {
  margin-right: 20px;
  padding: 5px 10px;
  border-radius: 4px;
  font-weight: bold;
}

.priority.low {
  background-color: #e0f7fa;
  color: #00796b;
}

.priority.medium {
  background-color: #fff9c4;
  color: #f57f17;
}

.priority.high {
  background-color: #ffcdd2;
  color: #c62828;
}

.status {
  margin-right: 20px;
  padding: 5px 10px;
  border-radius: 4px;
  text-transform: uppercase;
  font-weight: bold;
}

.status.pending {
  background-color: #fff3e0;
  color: #ef6c00;
}

.status.in-progress {
  background-color: #e3f2fd;
  color: #1e88e5;
}

.status.completed {
  background-color: #c8e6c9;
  color: #2e7d32;
}

.part-title {
  flex-grow: 1;
  font-weight: normal;
}

.add-part {
  display: flex;
  align-parts: center;
  margin-bottom: 1em;
}

.add-part input {
  flex-grow: 1;
  margin-right: 1em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.btn-add {
  background: none;
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-parts: center;
  justify-content: center;
  font-size: 24px;
}

/* Mobile-specific styles */
@media (max-width: 600px) {
  .add-part {
    flex-direction: column;
    align-parts: flex-start;
  }

  .add-part input[name="inputpartElement"] {
    width: 100%;
    margin-right: 0;
    margin-bottom: 0.5em;
  }

  .add-part input[name="inputCategoryElement"],
  .btn-add {
    width: 100%;
  }

  .btn-add {
    justify-content: flex-start;
  }
}
</style>