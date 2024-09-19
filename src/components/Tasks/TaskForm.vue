<template>
  <div class="task-form-container">
    <h2>{{ isEditing ? 'Edit Task' : 'Add Task' }} 
      <span v-if="projectId && projectName"> - Project: {{ projectName }} - Id: {{ projectId }}</span>
    </h2>

    <form @submit.prevent="handleTaskSubmit">
      <div class="form-group">
        <label for="taskTitle">Task Title:</label>
        <input type="text" v-model="taskData.taskTitle" id="taskTitle" class="form-control" required />
      </div>
      <div class="form-group">
        <label for="priority">Priority:</label>
        <select v-model="taskData.priority" id="priority" class="form-control">
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      </div>
      <div class="form-group">
        <label for="status">Status:</label>
        <select v-model="taskData.status" id="status" class="form-control">
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>
      </div>
      <div class="form-group">
        <label for="nbrHrs">Time: (number of hours)</label>
        <input type="number" v-model="taskData.nbrHrs" id="nbrHrs" class="form-control" required />
      </div>

      <div class="form-actions">
        <button type="submit" class="btn-submit">{{ isEditing ? 'Update Task' : 'Add Task' }}</button>
        <button type="button" class="btn-cancel" @click="cancelTaskEdit">Cancel</button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted, defineProps } from 'vue';
import { useTaskStore } from '@/stores/taskStore';
import { useErrorStore } from '@/stores/errorStore';
import { useRouter } from 'vue-router';

const { projectId, projectName, taskId } = defineProps({
  projectId: {
    type: String,
    required: true,
  },
  projectName: {
    type: String,
    required: true,
  },
  taskId: {
    type: String,
    default: null,
  },
});

const router = useRouter();
const taskStore = useTaskStore();
const errorStore = useErrorStore();

const isEditing = ref(false);

const taskData = ref({
  taskTitle: '',
  priority: 'Medium',
  status: 'Pending',
  nbrHrs: 1,
  projectId,
  projectName,
});

onMounted(() => {
  if (taskId) {
    isEditing.value = true;
    const existingTask = taskStore.getTasksByProjectId(taskId);
    if (existingTask) {
      taskData.value = { ...existingTask };
    } else {
      errorStore.showError('Task not found');
    }
  }
});

const handleTaskSubmit = async () => {
  try {
    taskData.value.projectId = projectId;

    if (isEditing.value) {
      await taskStore.updateTask(taskId, taskData.value);
    } else {
      await taskStore.addTask(taskData.value);
    }

    clearTaskData();
      // Navigate back to the project view
  router.push({
    name: 'ViewProject',
    params: { id: projectId },
  });
  } catch (error) {
    errorStore.showError('An error occurred:', error);
  }
};

const cancelTaskEdit = () => {
  clearTaskData();
    // Navigate back to the project view
    router.push({
    name: 'ViewProject',
    params: { id: projectId },
  });
};

const clearTaskData = () => {
  taskData.value = {
    taskTitle: '',
    priority: 'Medium',
    status: 'Pending',
    nbrHrs: 1,
    projectId,
    projectName,
  };
  isEditing.value = false;
};

console.log('TaskForm props:', projectId, projectName, taskId);
</script>


<style scoped>
/* Toggle Button Styles */
.btn-toggle {
  display: block;
  margin: 20px auto;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  background-color: #007bff;
  color: white;
  cursor: pointer;
  text-align: center;
}

.btn-toggle:hover {
  background-color: #0056b3;
}

/* Form Styles */
.form-container {
  max-width: 500px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: #f9f9f9;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  font-family: 'Arial', sans-serif;
}

.form-title {
  text-align: center;
  font-size: 24px;
  margin-bottom: 20px;
  color: #333;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #555;
}

.form-control {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: #fff;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
}

.form-actions {
  display: flex;
  justify-content: space-between;
}

.btn-submit,
.btn-cancel {
  width: 48%;
  padding: 12px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  text-align: center;
}

.btn-submit {
  background-color: #007bff;
  color: white;
}

.btn-submit:hover {
  background-color: #0056b3;
}

.btn-cancel {
  background-color: #ccc;
  color: #333;
}

.btn-cancel:hover {
  background-color: #999;
}

.btn-add-task {
  display: block;
  margin-bottom: 20px;
  padding: 10px 20px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-add-task:hover {
  background-color: #218838;
}


/* Mobile-specific styles */
@media (max-width: 600px) {
  .form-container {
    padding: 15px;
  }

  .form-title {
    font-size: 20px;
  }

  .form-group {
    margin-bottom: 12px;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn-submit,
  .btn-cancel {
    width: 100%;
    margin-bottom: 10px;
  }

  .btn-submit {
    margin-bottom: 0;
  }
}
</style>
