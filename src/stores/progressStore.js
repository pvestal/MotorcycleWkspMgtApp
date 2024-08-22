import { defineStore } from 'pinia';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../fbConfig';

export const useProgressStore = defineStore('progressStore', {
    state: () => ({
        items: [],
        isLoading: false,
        error: null,
    }),
    getters: {
        highPriorityItems: (state) => {
            return state.items.filter(item => item.priority === 'High');
        },
        completedItems: (state) => {
            return state.items.filter(item => item.status === 'Completed');
        },
    },
    actions: {
        async fetchItems() {
            this.isLoading = true;
            try {
                const querySnapshot = await getDocs(collection(db, "progressItems"));
                this.items = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
            } catch (err) {
                this.error = err.message;
            } finally {
                this.isLoading = false;
            }
        },
        async addItem(item) {
            this.isLoading = true;
            try {
                const docRef = await addDoc(collection(db, "progressItems"), item);
                this.items.push({ id: docRef.id, ...item });
            } catch (err) {
                this.error = err.message;
            } finally {
                this.isLoading = false;
            }
        },
        async updateItem(id, updatedItem) {
            this.isLoading = true;
            try {
                const itemDoc = doc(db, "progressItems", id);
                await updateDoc(itemDoc, updatedItem);
                const index = this.items.findIndex((item) => item.id === id);
                if (index !== -1) {
                    this.items[index] = { id, ...updatedItem };
                }
            } catch (err) {
                this.error = err.message;
            } finally {
                this.isLoading = false;
            }
        },
        async removeItem(id) {
            this.isLoading = true;
            try {
                await deleteDoc(doc(db, "progressItems", id));
                this.items = this.items.filter((item) => item.id !== id);
            } catch (err) {
                this.error = err.message;
            } finally {
                this.isLoading = false;
            }
        },
    }
});
