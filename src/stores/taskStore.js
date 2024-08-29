import { defineStore } from 'pinia';
import { useErrorStore } from './errorStore';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../fbConfig';

export const usetaskStore = defineStore('taskStore', {
    state: () => ({
        tasks: [],
    }),
    getters: {
        getTasksByProjectId: (state) => (projectId) => state.tasks[projectId] || [],
        highPriorityTasks: (state) => {
            return state.tasks.filter(task => task.priority === 'High');
        },
        completedTasks: (state) => {
            return state.tasks.filter(task => task.status === 'Completed');
        },
    },
    actions: {
        async fetchtasks() {
            const errorStore = useErrorStore();
            try {
                const querySnapshot = await getDocs(collection(db, "tasks"));
                this.tasks = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
            } catch (err) {
                errorStore.showError(err)
            } finally {
                console.log("fetchtasks called")
            }
        },
        async addtask(task) {
            const errorStore = useErrorStore();
            try {
                const docRef = await addDoc(collection(db, "tasks"), task);
                const taskData = {
                    id: docRef.id,
                    projectId: task.projectId,
                    createdAt: Timestamp.now(),
                    updatedAt: Timestamp.now(),
                    createdBy: {
                      uid: currentUser.uid,
                      displayName: currentUser.displayName,
                      photoURL: currentUser.photoURL || 'default-url',
                      role: currentUser.role,
                      userStatus: currentUser.userStatus
                    },
                    updatedBy: { ...taskData.createdBy },
                }
                this.tasks.push({ id: taskData.id, ...taskData });
            } catch (err) {
                errorStore.showError(err)
            } finally {
                console.log("addtask called")
            }
        },
        async updatetask(id, updatedTask) {
            const errorStore = useErrorStore();
            try {
                const taskDoc = doc(db, "tasks", id);
                await updateDoc(taskDoc, updatedTask);
                const index = this.tasks.findIndex((task) => task.id === id);
                if (index !== -1) {
                    this.tasks[index] = { id, ...updatedTask };
                }
            } catch (err) {
                errorStore.showError(err)
            } finally {
                console.log("task updated")
            }
        },
        async removeTask(id) {
           
            try {
                await deleteDoc(doc(db, "tasks", id));
                this.tasks = this.tasks.filter((task) => task.id !== id);
            } catch (err) {
                this.error = err.message;
            } finally {
                console.log("task deleted")
            }
        },
        async fetchTasksByProjectId(projectId) {
        const errorStore = useErrorStore();
        try {
          if (!this.tasks[projectId]) {
            const q = query(collection(db, 'costs'), where('projectId', '==', projectId));
            const querySnapshot = await getDocs(q);
            this.costs[projectId] = querySnapshot.docs.map(doc => doc.data());
          }
        } catch (error) {
          errorStore.showError("An error occurred fetching costs: " + error.message);
        }
      },
    },
});
