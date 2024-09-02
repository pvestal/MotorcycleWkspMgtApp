import { defineStore } from 'pinia';
import { useErrorStore } from './errorStore';
import { useUserStore } from './userStore';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, setDoc, query, where, Timestamp } from 'firebase/firestore';
import { db } from '../fbConfig';

export const useTaskStore = defineStore('taskStore', {
    state: () => ({
        tasks: [],
    }),
    getters: {
        getTasksByProjectId: (state) => (projectId) => state.tasks.filter(task => task.projectId === projectId),
        highPriorityTasks: (state) => {
            return state.tasks.filter(task => task.priority === 'High');
        },
        completedTasks: (state) => {
            return state.tasks.filter(task => task.status === 'Completed');
        },
        getTotalNbrHrsByProjectId: (state) => (projectId) => {
            const tasks = state.tasks.filter(task => task.projectId === projectId);
            return tasks.reduce((total, task) => total + (task.NbrHrs || 0), 0);
          },
    },
    actions: {
        async fetchTasks() {
            const errorStore = useErrorStore();
            try {
                const querySnapshot = await getDocs(collection(db, "tasks"));
                this.tasks = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
            } catch (err) {
                errorStore.showError(err);
            } finally {
                console.log("fetchtasks called");
            }
        },
        async addTask(task) {
            const errorStore = useErrorStore();
            const userStore = useUserStore();
            const currentUser = await userStore.currentUser;
        
            if (!currentUser) {
                errorStore.showError("Must be logged in to add a task.");
                return;
            }
        
            try {
                const createdBy = {
                    uid: currentUser.uid,
                    displayName: currentUser.displayName,
                    photoURL: currentUser.photoURL || "default",
                    role: currentUser.role,
                    userStatus: currentUser.userStatus,
                };
        
                const taskData = {
                    ...task,
                    projectId: task.projectId, // Ensure this is passed correctly when calling addTask
                    createdAt: Timestamp.now(),
                    updatedAt: Timestamp.now(),
                    createdBy: createdBy,
                    updatedBy: createdBy,
                };
        
                const docRef = await addDoc(collection(db, "tasks"), taskData);
                taskData.id = docRef.id;  // Set the ID in the taskData object after the document is created
        
                // Optional: If you want to ensure the ID is saved in Firestore
                await updateDoc(docRef, { id: taskData.id });
        
                this.tasks.push(taskData);  // Add the task to the local state
            } catch (err) {
                errorStore.showError(err.message);
            } finally {
                console.log("addTask called");
            }
        },

        async updateTask(id, updatedTask) {
            const errorStore = useErrorStore();
            try {
                const taskDoc = doc(db, "tasks", id);
                updatedTask.updatedAt = Timestamp.now(); // Update the timestamp when the task is modified
        
                await updateDoc(taskDoc, updatedTask);
        
                const index = this.tasks.findIndex((task) => task.id === id);
                if (index !== -1) {
                    this.tasks[index] = { id, ...updatedTask };
                }
            } catch (err) {
                errorStore.showError(err.message);
            } finally {
                console.log("task updated");
            }
        },
        async deleteTask(id) {
            try {
                await deleteDoc(doc(db, "tasks", id));
                this.tasks = this.tasks.filter((task) => task.id !== id);
            } catch (err) {
                this.error = err.message;
            } finally {
                console.log("task deleted");
            }
        },
        async fetchTasksByProjectId(projectId) {
            const errorStore = useErrorStore();
            try {
                const q = query(collection(db, 'tasks'), where('projectId', '==', projectId));
                const querySnapshot = await getDocs(q);
                // this.tasks = querySnapshot.docs.map(doc => ({
                //     id: doc.id,
                //     ...doc.data(),
                // }));
                this.tasks = querySnapshot.docs.map(doc => doc.data());
            } catch (error) {
                errorStore.showError("An error occurred fetching tasks: " + error.message);
            }
        },
    },
});
