<template>
  <div>
    <h2>Projects List</h2>
    <button><span @click="navigateToAdd" class="material-symbols-outlined">add_ad</span></button>
    <ul class="project-list">
      <li v-for="project in projects" :key="project.id">
        {{ project }}
        <span class="item-title">{{ project.projectName }}</span>
        <span><img v-if="project.updatedBy.photoURL" :src="project.updatedBy.photoURL"</span>
        <span :class="`status ${project.status.toLowerCase().replace(' ', '-')}`">{{ project.status }}</span>
        <!-- <span :class="['priority', item.priority.toLowerCase()]">{{ item.priority }}</span> -->
        <button @click="navigateToEdit(project.projectId)"><span class="material-symbols-outlined">edit</span></button>
        <button @click="navigateToView(project.projectId)"><span class="material-symbols-outlined">visibility</span></button>
      </li>
    </ul>

  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useProjectStore } from '../../stores/projectStore';

const projectStore = useProjectStore();
const router = useRouter();
const projects = computed(() => projectStore.projects);

onMounted(async () => {
  await projectStore.fetchProjects();
});

const navigateToAdd = () => {
  router.push('/addProject');
};

const navigateToEdit = (id) => {
  console.log("id:", id)
  router.push(`/editProject/${id}`);
};

const navigateToView = (id) => {
  console.log("id:", id)
  router.push(`/viewProject/${id}`);
};
</script>


<style>
/* Container for the ordered list */
ol.project-list {
  list-style-type: none;
  padding: 0;
  margin: 0;
  counter-reset: item;
}

.project-list li {
  display: flex;
  align-items: center;
  padding: 10px;
  margin-bottom: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: #f9f9f9;
  counter-increment: item;
}

.project-list li::before {
  content: counter(item) ".";
  margin-right: 10px;
  font-weight: bold;
  color: #333;
}

.item-number {
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

.item-title {
  flex-grow: 1;
  font-weight: normal;
}

.add-project {
  display: flex;
  align-items: center;
  margin-bottom: 1em;
}

.add-project input {
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
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

/* Mobile-specific styles */
@media (max-width: 600px) {
  .add-project {
    flex-direction: column;
    align-items: flex-start;
  }

  .add-project input[name="inputprojectElement"] {
    width: 100%;
    margin-right: 0;
    margin-bottom: 0.5em;
  }

  .add-project input[name="inputCategoryElement"],
  .btn-add {
    width: 100%;
  }

  .btn-add {
    justify-content: flex-start;
  }
}
</style>