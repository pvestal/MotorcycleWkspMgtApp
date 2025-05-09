import { defineStore } from 'pinia';
import { useErrorStore } from './errorStore';
import { useUserStore } from './userStore';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where, Timestamp } from 'firebase/firestore';
import { db } from '../fbConfig';
import { Task, TaskUpdate, UserReference } from '../types';

interface TaskState {
  tasks: Task[];
}

export const useTaskStore = defineStore('taskStore', {
    state: (): TaskState => ({
        tasks: [],
    }),
    getters: {
        getTasksByProjectId: (state) => (projectId: string): Task[] => 
            state.tasks.filter(task => task.projectId === projectId),
            
        highPriorityTasks: (state): Task[] => {
            return state.tasks.filter(task => task.priority === 'High');
        },
        
        completedTasks: (state): Task[] => {
            return state.tasks.filter(task => task.status === 'Completed');
        },
        
        getTotalNbrHrsByProjectId: (state) => (projectId: string): number => {
            const tasks = state.tasks.filter(task => task.projectId === projectId);
            return tasks.reduce((total, task) => total + (task.nbrHrs || 0), 0);
        },
    },
    actions: {
        async fetchTasks(): Promise<void> {
            const errorStore = useErrorStore();
            try {
                const querySnapshot = await getDocs(collection(db, "tasks"));
                this.tasks = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                    nbrHrs: doc.data().nbrHrs || 0,
                } as Task));
            } catch (err: any) {
                errorStore.showError(err);
            }
        },
        
        async fetchTasksByProjectId(projectId: string): Promise<Task[]> {
            const errorStore = useErrorStore();
            try {
              const q = query(collection(db, 'tasks'), where('projectId', '==', projectId));
              const querySnapshot = await getDocs(q);
              const projectTasks = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                nbrHrs: doc.data().nbrHrs || 0,
                ...doc.data(),
              } as Task));
          
              // Append the project-specific tasks to the existing tasks array
              // Filter out duplicates by ID before adding new tasks
              const existingIds = new Set(this.tasks.map(task => task.id));
              const newTasks = projectTasks.filter(task => !existingIds.has(task.id));
              
              this.tasks = [...this.tasks, ...newTasks];
              return projectTasks;
            } catch (error: any) {
              errorStore.showError("An error occurred fetching tasks: " + error.message);
              return [];
            }
        },
        
        async addTask(task: Partial<Task>): Promise<void> {
            const errorStore = useErrorStore();
            const userStore = useUserStore();
            const currentUser = userStore.currentUser;
        
            if (!currentUser) {
                errorStore.showError("Must be logged in to add a task.");
                return;
            }
        
            try {
                const createdBy: UserReference = {
                    uid: currentUser.uid,
                    displayName: currentUser.displayName,
                    photoURL: currentUser.photoURL || "default",
                    role: currentUser.role,
                    userStatus: currentUser.userStatus,
                };
        
                const taskData: Partial<Task> = {
                    ...task,
                    projectId: task.projectId,
                    createdAt: Timestamp.now(),
                    updatedAt: Timestamp.now(),
                    createdBy: createdBy,
                    updatedBy: createdBy,
                };
        
                const docRef = await addDoc(collection(db, "tasks"), taskData);
                const newTask = {
                    ...taskData,
                    id: docRef.id,
                } as Task;
        
                // Optional: If you want to ensure the ID is saved in Firestore
                await updateDoc(docRef, { id: newTask.id });
        
                this.tasks.push(newTask);  // Add the task to the local state
            } catch (err: any) {
                errorStore.showError(err.message);
            }
        },

        async updateTask(id: string, updatedTask: TaskUpdate): Promise<void> {
            const errorStore = useErrorStore();
            try {
                const taskDoc = doc(db, "tasks", id);
                const updateData: TaskUpdate = {
                    ...updatedTask,
                    updatedAt: Timestamp.now() // Update the timestamp when the task is modified
                };
        
                await updateDoc(taskDoc, updateData);
        
                const index = this.tasks.findIndex((task) => task.id === id);
                if (index !== -1) {
                    this.tasks[index] = { 
                        ...this.tasks[index], 
                        ...updateData 
                    } as Task;
                }
            } catch (err: any) {
                errorStore.showError(err.message);
            }
        },
        
        async deleteTask(id: string): Promise<void> {
            const errorStore = useErrorStore();
            try {
                await deleteDoc(doc(db, "tasks", id));
                this.tasks = this.tasks.filter((task) => task.id !== id);
            } catch (err: any) {
                errorStore.showError(err.message);
            }
        },        
    },
});