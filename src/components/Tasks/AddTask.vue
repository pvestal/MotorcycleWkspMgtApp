  <template>
    <!-- Other content -->
    <TaskForm :projectId="projectId" :projectName="projectName" :taskId="taskId" />
  </template>
  
  <script setup>
  import TaskForm from '@/components/Tasks/TaskForm.vue';
  import { defineProps } from 'vue';
  
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
  console.log('AddTask props:', projectId, projectName, taskId);
  </script>
  