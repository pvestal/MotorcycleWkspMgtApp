<template>
    <div>
        <h2>{{ $props.projectName }}</h2>
        <div class="form-group">
            <label><strong>Current Note:</strong> {{ project.note }}</label>
            <textarea v-model="newNote" class="form-control"></textarea>
            <button @click="updateNote" class="form-control">Update Note</button>
        </div>

        <h3>Note History</h3>
        <ul>
            <li v-for="(change, index) in noteHistory" :key="index">
                {{ change.timestamp.toDate().toLocaleString() }} - {{ change.previousNote }}
                (Updated by: {{ change.updatedBy }})
            </li>
        </ul>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useProjectStore } from '@/stores/projectStore';

const route = useRoute();
const projectStore = useProjectStore();
const projectId = route.params.id;

const newNote = ref(null);

const project = ref({});
const noteHistory = ref([]);

onMounted(async () => {
    await projectStore.fetchProjectById(projectId);
    project.value = projectStore.selectedProject;
    noteHistory.value = projectStore.noteHistory;
});

const updateNote = async () => {
    await projectStore.updateNote(projectId, newNote.value);
    newNote.value = ''; // Clear the input after updating
};
</script>