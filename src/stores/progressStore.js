import { defineStore } from 'pinia';
import { useErrorStore } from './errorStore';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../fbConfig';

export const useProgressStore = defineStore('progressStore', {
    state: () => ({
        items: [],
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
            const errorStore = useErrorStore();
            try {
                const querySnapshot = await getDocs(collection(db, "progressItems"));
                this.items = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
            } catch (err) {
                errorStore.showError(err)
            } finally {
                console.log("fetchItems called")
            }
        },
        async addItem(item) {
            const errorStore = useErrorStore();
            try {
                const docRef = await addDoc(collection(db, "progressItems"), item);
                itemData.id = docRef.id;
                itemData.createdAt = Timestamp.now();
                itemData.updatedAt = Timestamp.now();
                itemData.createdBy = {
                  uid: currentUser.uid,
                  displayName: currentUser.displayName,
                  photoURL: currentUser.photoURL || '',
                  role: currentUser.role,
                  userStatus: currentUser.userStatus
                };
                itemData.updatedBy = { ...itemData.createdBy };
                this.items.push({ id: itemData.id, ...itemData });
            } catch (err) {
                errorStore.showError(err)
            } finally {
                console.log("addItem called")
            }
        },
        async updateItem(id, updatedItem) {
            const errorStore = useErrorStore();
            try {
                const itemDoc = doc(db, "progressItems", id);
                await updateDoc(itemDoc, updatedItem);
                const index = this.items.findIndex((item) => item.id === id);
                if (index !== -1) {
                    this.items[index] = { id, ...updatedItem };
                }
            } catch (err) {
                errorStore.showError(err)
            } finally {
                console.log("item updated")
            }
        },
        async removeItem(id) {
           
            try {
                await deleteDoc(doc(db, "progressItems", id));
                this.items = this.items.filter((item) => item.id !== id);
            } catch (err) {
                this.error = err.message;
            } finally {
              
            }
        },
    }
});
