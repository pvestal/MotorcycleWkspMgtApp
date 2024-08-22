<template>
  <div>
    <h2>Todo List</h2>
    <ul class="todo-list">
      <li v-for="item in items" :key="item.id">
        <span class="item-title">{{ item.itemTitle }}</span>
        <span :class="`status ${item.status.toLowerCase().replace(' ', '-')}`">{{ item.status }}</span>
        <span :class="['priority', item.priority.toLowerCase()]">{{ item.priority }}</span>
        <button @click="navigateToEdit(item.id)">Edit</button>
        <button @click="navigateToView(item.id)">View</button>
      </li>
    </ul>
    <!-- <button @click="navigateToAdd">Add New Item</button> -->
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useProgressStore } from '../../stores/progressStore';

const progressStore = useProgressStore();
const router = useRouter();
const items = computed(() => progressStore.items);

onMounted(async () => {
  if (!items.value.length) {
    await progressStore.fetchItems();
  }
});

const navigateToAdd = () => {
  router.push('/addTodo');
};

const navigateToEdit = (id) => {
  router.push(`/editTodo/${id}`);
};

const navigateToView = (id) => {
  router.push(`/viewTodo/${id}`);
};
</script>


<style>
/* Container for the ordered list */
ol.todo-list {
  list-style-type: none;
  padding: 0;
  margin: 0;
  counter-reset: item;
}

.todo-list li {
  display: flex;
  align-items: center;
  padding: 10px;
  margin-bottom: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: #f9f9f9;
  counter-increment: item;
}

.todo-list li::before {
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

.add-todo {
  display: flex;
  align-items: center;
  margin-bottom: 1em;
}

.add-todo input {
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
  .add-todo {
    flex-direction: column;
    align-items: flex-start;
  }

  .add-todo input[name="inputTodoElement"] {
    width: 100%;
    margin-right: 0;
    margin-bottom: 0.5em;
  }

  .add-todo input[name="inputCategoryElement"],
  .btn-add {
    width: 100%;
  }

  .btn-add {
    justify-content: flex-start;
  }
}
</style>