import { defineStore } from "pinia";
import { auth, googleProvider, signInWithPopup, db, analytics } from "../fbConfig";
import {
  collection,
  getDocs,
  setDoc,
  doc,
  getDoc,
  query,
  updateDoc,
  Timestamp,
} from "firebase/firestore";
import { useErrorStore } from "./errorStore";
import router from "../router";
import { logEvent } from 'firebase/analytics';

// Generate 10 dummy users (kept for initial state but can be removed if real data is being fetched)
const dummyUsers = [
  {
    uid: "uid_001",
    email: "customer1@example.com",
    displayName: "John Doe",
    photoURL: "https://randomuser.me/api/portraits/men/1.jpg",
    role: "customer",
    userStatus: "active",
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    updatedBy: {
      uid: "uid_admin_001",
      displayName: "Admin Jane",
      photoURL: "https://randomuser.me/api/portraits/women/1.jpg",
      role: "admin",
    },
  },
  // Other dummy users...
];

export const useUserStore = defineStore({
  id: "userStore",
  state: () => ({
    user: null,
    users: dummyUsers, // Initial dummy users
  }),
  getters: {
    isAuthenticated: (state) => !!state.user,
    currentUser: (state) => state.user,
    userDisplayName: (state) => state.user ? state.user.displayName : "",
    isAdmin: (state) => state.user?.role === 'admin',
    userRole: (state) => state.user?.role || "none",
    allUsers: (state) => state.users,
  },
  actions: {
    setUser(user) {
      const err = useErrorStore()
      if (!user || !user.uid) {
        err.showError("Invalid user object. User must be logged in and have a valid UID.");
        return;
      }
      console.log("Setting user v2:", user);
      this.user = user;
    
      const existingUserIndex = this.users.findIndex(u => u.uid === user.uid);
      if (existingUserIndex !== -1) {
        this.users[existingUserIndex] = user;
      } else {
        this.users.push(user);
      }
    },    
    clearUser() {
      this.user = null;
      // Consider whether you want to clear the entire users array or not. Currently, it's left intact.
    },

    async login() {
      const errorStore = useErrorStore();
      try {
        const result = await signInWithPopup(auth, googleProvider);
        const userRef = doc(db, "users", result.user.uid);
        const userDoc = await getDoc(userRef);
    
        let userData;
    
        if (!userDoc.exists()) {
          userData = {
            uid: result.user.uid,
            displayName: result.user.displayName || "No Name",
            email: result.user.email || "No Email",
            photoURL: result.user.photoURL || "default-url",
            role: "customer",
            userStatus: "active",
            lastLoginAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
            createdAt: Timestamp.now(),
            updatedBy: {
              uid: result.user.uid,
              displayName: result.user.displayName,
              photoURL: result.user.photoURL,
              role: result.user.role,
              userStatus: result.user.userStatus,
            },
          };
    
          await setDoc(userRef, userData);
        } else {
          userData = {
            ...userDoc.data(),
            lastLoginAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
          };
    
          await updateDoc(userRef, { lastLoginAt: Timestamp.now(), updatedAt: Timestamp.now() });
        }
    
        this.setUser(userData);
        logEvent(analytics, 'login', { method: 'Google' });
        router.push('/profile'); // Redirect after login
      } catch (error) {
        errorStore.showError("An error occurred during login: " + error.message);
      }
    },
    async fetchUser() {
      const errorStore = useErrorStore();
      try {
        const currentUser = auth.currentUser;
        if (currentUser) {
          const userRef = doc(db, "users", currentUser.uid);
          const userDoc = await getDoc(userRef);

          if (userDoc.exists()) {
            this.setUser(userDoc.data());
          } else {
            this.clearUser();
          }
        } else {
          this.clearUser();
        }
      } catch (error) {
        errorStore.showError("An error occurred fetching the user: " + error.message);
      }
    },

    async fetchAllUsers() {  // Fetch all users for admin management
      const errorStore = useErrorStore();
      try {
        const q = query(collection(db, "users"));
        const querySnapshot = await getDocs(q);
        this.users = querySnapshot.docs.map(doc => doc.data());
      } catch (error) {
        errorStore.showError("An error occurred fetching users: " + error.message);
      }
    },

    async updateUser(uid, updatedData) { // Update user information
      const errorStore = useErrorStore();
      try {
        const userRef = doc(db, "users", uid);
        updatedData.updatedAt = Timestamp.now();
        updatedData.updatedBy = {
          uid: this.user.uid,
          displayName: this.user.displayName,
          photoURL: this.user.photoURL,
          role: this.user.role,
        };
        await updateDoc(userRef, updatedData);

        // Update local state
        const userIndex = this.users.findIndex(u => u.uid === uid);
        if (userIndex !== -1) {
          this.users[userIndex] = { ...this.users[userIndex], ...updatedData };
        }
        if (uid === this.user?.uid) {
          this.setUser({ ...this.user, ...updatedData });
        }
      } catch (error) {
        errorStore.showError("An error occurred updating the user: " + error.message);
      }
    },

    async deleteUser(uid) { // Delete a user
      const errorStore = useErrorStore();
      try {
        const userRef = doc(db, "users", uid);
        const updatedData = {
          userStatus: "inactive",
          updatedAt: Timestamp.now(),
          updatedBy: {
            uid: this.user.uid,
            displayName: this.user.displayName,
            photoURL: this.user.photoURL,
            role: this.user.role,
          }
        };

        await updateDoc(userRef, updatedData);

        // Update local state
        const userIndex = this.users.findIndex(u => u.uid === uid);
        if (userIndex !== -1) {
          this.users[userIndex] = { ...this.users[userIndex], ...updatedData };
        }

        // If the deleted user is the current user, clear the local state
        if (uid === this.user?.uid) {
          this.clearUser();
          router.push({ name: "Login" });
        }
      } catch (error) {
        errorStore.showError("An error occurred deleting the user: " + error.message);
      }
    },

    async logout() {
      const errorStore = useErrorStore();
      try {
        await auth.signOut();
        this.clearUser();
        router.push({ name: "Login" });
      } catch (error) {
        errorStore.showError("An error occurred during logout: " + error.message);
      }
    },
  },
});
