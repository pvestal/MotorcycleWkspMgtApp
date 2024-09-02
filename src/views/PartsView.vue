<template>
    <div>
        <h1>Parts log.. [{{ parts.length }}]</h1>
        <ListParts v-if="parts.length" :parts="parts"/>
    </div>
</template> 

<script setup>
import { onMounted, ref } from 'vue';
import { usePartStore } from '@/stores/partStore';
import ListParts from '@/components/Parts/ListParts.vue';

const partStore = usePartStore();
const parts = ref(partStore.parts);

onMounted(async (projectId) => {
    partStore.getPartsByProjectId(projectId);
});
</script>

<style scoped>
/* Container for the ordered list */
ol.task-list {
    list-style-type: none;
    padding: 0;
    margin: 0;
    counter-reset: item;
}

.task-list li {
    display: flex;
    align-items: center;
    padding: 10px;
    margin-bottom: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
    background-color: #f9f9f9;
    counter-increment: item;
}

.task-list li::before {
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
</style>
