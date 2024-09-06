<template>
  <div class="task-form-container">
    <h2>TF-{{ isEditing ? 'Edit Task' : 'Add Task' }} 
      <span v-if="props.projectName"> - Project: {{ props.projectName }}</span>
      <br>
      <span>toggle</span>
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
      <!-- <div class="form-group">
        <label for="notes">Notes:</label>
        <textarea v-model="taskData.notes" id="notes" class="form-control"></textarea>
      </div> -->
      <NoteForm :projectId="projectId" :projectName="projectName" class="form-control" />
      <div class="form-actions">
        <button type="submit" class="btn-submit">{{ isEditing ? 'Update Task' : 'Add Task' }}</button>
        <button type="button" class="btn-cancel" @click="cancelTaskEdit">Cancel</button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useTaskStore } from '@/stores/taskStore';
import { useErrorStore } from '@/stores/errorStore';
import { useRouter } from 'vue-router';
import NoteForm from '../Projects/NoteForm.vue';

const router = useRouter();
const taskStore = useTaskStore();
const errorStore = useErrorStore();

const props = defineProps({
  project: {
    type: Object,
    required: true,
  },
  projectName: {
    type: String,
    required: true,
  },
  projectId: {
    type: String,
    required: true,
  },
  taskId: {
    type: String,
    default: null,
  },
});

const taskData = ref({
  taskTitle: '',
  priority: 'Medium',
  status: 'Pending',
  nbrHrs: 1,
  // notes: '',
  projectId: props.projectId,
});

const isEditing = ref(false);

onMounted(() => {
  if (props.projectId) {
    isEditing.value = true;
    const existingProjectTasks = taskStore.fetchTasksByProjectId(props.projectId);
    if (existingProjectTasks) {
      taskData.value = { ...existingProjectTasks };
    } else {
      errorStore.showError("Task not found");
    }
  }
});

const handleTaskSubmit = async () => {
  try {
    if (isEditing.value) {
      await taskStore.updateTask(props.taskId, taskData.value);
    } else {
      await taskStore.addTask(taskData.value);
    }
    clearTaskData();
    router.push(`/viewProject/${props.projectId}`);
  } catch (error) {
   errorStore.showError('An error occurred:', error);
  }
};


  const cancelTaskEdit = () => {
  clearTaskData();
  emit('cancel-task');
  router.push(`/viewProject/${props.projectId}`);
};

const clearTaskData = () => {
  taskData.value = {
    taskTitle: '',
    priority: 'Medium',
    status: 'Pending',
    nbrHrs: 1,
    // notes: '',
    projectId: props.projectId,
  };
  isEditing.value = false;
};

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
