import { defineStore } from "pinia";
import { auth, googleProvider, signInWithPopup, signInAnonymously, db, analytics } from "../fbConfig";
import { collection, getDocs, setDoc, doc, getDoc, query, updateDoc, Timestamp } from "firebase/firestore";
import { useErrorStore } from "./errorStore";
import router from "../router";
import { logEvent } from 'firebase/analytics';
import { linkWithCredential, GoogleAuthProvider, getAuth, onAuthStateChanged } from "firebase/auth";

// Function to generate a random avatar URL using DiceBear
const generateAvatarURL = (gender) => {
  const seed = Math.random().toString(36).substring(7);
  const style = gender === 'male' ? 'adventurer' : 'adventurer-neutral';
  return `https://api.dicebear.com/6.x/${style}/svg?seed=${seed}`;
};

export const useUserStore = defineStore({
  id: "userStore",
  state: () => ({
    user: null,
    users: [],
  }),
  getters: {
    isAuthenticated: (state) => !!state.user && !state.user.isAnonymous,
    currentUser: (state) => state.user,
    userDisplayName: (state) => state.user ? state.user.displayName : "",
    isAdmin: (state) => state.user?.role === 'admin',
    userRole: (state) => state.user?.role || "none",
    allUsers: (state) => state.users,
    isAnonymous: (state) => state.user?.isAnonymous || false,
  },
  actions: {
    setUser(user) {
      const errorStore = useErrorStore();
      if (!user || !user.uid) {
        errorStore.showError("Invalid user object. User must be logged in and have a valid UID.");
        return;
      }

      try {
        const existingUserIndex = this.users.findIndex(u => u.uid === user.uid);
        if (existingUserIndex !== -1) {
          this.users[existingUserIndex] = user;
        } else {
          this.users.push(user);
        }

        this.user = user;
      } catch (error) {
        errorStore.showError("Failed to set user: " + error.message);
      }
    },
    clearUser() {
      this.user = null;
      this.users = [];
    },
    async loginWithGoogle() {
      const errorStore = useErrorStore();
      try {
        const result = await signInWithPopup(auth, googleProvider);
    
        if (auth.currentUser.isAnonymous) {
          // If the user is currently anonymous, link their account to the Google credentials
          const credential = GoogleAuthProvider.credential(result.user.accessToken);
          await linkWithCredential(auth.currentUser, credential);
        }
    
        const userRef = doc(db, "users", result.user.uid);
        const userDoc = await getDoc(userRef);
    
        let userData;
    
        if (!userDoc.exists()) {
          userData = {
            uid: result.user.uid,
            displayName: result.user.displayName || "No Name",
            email: result.user.email || "No Email",
            photoURL: result.user.photoURL || generateAvatarURL('neutral'),
            role: "customer",
            userStatus: "active",
            lastLoginAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
            createdAt: Timestamp.now(),
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
        // router.push('/tasks');
      } catch (error) {
        errorStore.showError("An error occurred during login: " + error.message);
      }
    },    
    async loginAnonymously() {
      const errorStore = useErrorStore();
      try {
        const result = await signInAnonymously(auth);
        const userRef = doc(db, "users", result.user.uid);
        const userDoc = await getDoc(userRef);

        let userData;

        if (!userDoc.exists()) {
          userData = {
            uid: result.user.uid,
            isAnonymous: true,
            displayName: "Anonymous",
            email: "anonymous@unknown.com",
            photoURL: generateAvatarURL('neutral'),
            role: "guest",
            userStatus: "active",
            lastLoginAt: Timestamp.now(),
            createdAt: Timestamp.now(),
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
        logEvent(analytics, 'login', { method: 'Anonymous' });
      } catch (error) {
        errorStore.showError("An error occurred during anonymous login: " + error.message);
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
            await this.loginAnonymously(); 
          }
        } else {
          this.clearUser();
        }
      } catch (error) {
        errorStore.showError("An error occurred while fetching the user: " + error.message);
      }
    },    
    async fetchAllUsers() {
      const errorStore = useErrorStore();
      try {
        const q = query(collection(db, "users"));
        const querySnapshot = await getDocs(q);
        this.users = querySnapshot.docs.map(doc => doc.data());
      } catch (error) {
        errorStore.showError("An error occurred fetching users: " + error.message);
      }
    },
    async updateUser(uid, updatedData) {
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
    async deleteUser(uid) {
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

        const userIndex = this.users.findIndex(u => u.uid === uid);
        if (userIndex !== -1) {
          this.users[userIndex] = { ...this.users[userIndex], ...updatedData };
        }

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
    setUpAuthListener() {
      const auth = getAuth();
      onAuthStateChanged(auth, (user) => {
        if (user) {
          this.setUser(user);
        } else {
          this.clearUser();
        }
      });
    },
  },
});
