import { defineStore } from "pinia";
import { auth, googleProvider, signInWithPopup, signInAnonymously, db, analytics, functions } from "../fbConfig";
import { collection, getDocs, setDoc, doc, getDoc, query, updateDoc, Timestamp } from "firebase/firestore";
import { useErrorStore } from "./errorStore";
import router from "../router";
import { logEvent } from 'firebase/analytics';
import { linkWithCredential, GoogleAuthProvider, getAuth, onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { httpsCallable } from 'firebase/functions';
import { User, UserUpdate, SubscriptionFeatures } from "../types";

// Function to generate a random avatar URL using DiceBear
const generateAvatarURL = (gender: string): string => {
  const seed = Math.random().toString(36).substring(7);
  const style = gender === 'male' ? 'adventurer' : 'adventurer-neutral';
  return `https://api.dicebear.com/6.x/${style}/svg?seed=${seed}`;
};

interface UserState {
  user: User | null;
  users: User[];
  subscriptionFeatures: Partial<SubscriptionFeatures> | null;
}

export const useUserStore = defineStore({
  id: "userStore",
  state: (): UserState => ({
    user: null,
    users: [],
    subscriptionFeatures: null,
  }),
  getters: {
    isAuthenticated: (state): boolean => !!state.user && !state.user.isAnonymous,
    currentUser: (state): User | null => state.user,
    userDisplayName: (state): string => state.user ? state.user.displayName : "",
    isAdmin: (state): boolean => state.user?.role === 'admin',
    userRole: (state): string => state.user?.role || "none",
    allUsers: (state): User[] => state.users,
    isAnonymous: (state): boolean => state.user?.isAnonymous || false,
    userSubscription: (state): string => state.user?.subscriptionType || 'free',
    hasPremiumAccess: (state): boolean => {
      const premiumPlans = ['premium', 'professional'];
      return !!state.user?.subscriptionType && premiumPlans.includes(state.user.subscriptionType);
    },
    hasStandardAccess: (state): boolean => {
      const standardOrBetterPlans = ['standard', 'premium', 'professional'];
      return !!state.user?.subscriptionType && standardOrBetterPlans.includes(state.user.subscriptionType);
    },
    subscriptionExpiration: (state): Timestamp | null => state.user?.subscriptionEndDate || null,
    canUseFeature: (state) => (featureName: string): boolean => {
      if (!state.subscriptionFeatures) return false;
      return state.subscriptionFeatures[featureName as keyof SubscriptionFeatures] === true;
    },
  },
  actions: {
    setUser(user: User): void {
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
      } catch (error: any) {
        errorStore.showError("Failed to set user: " + error.message);
      }
    },
    clearUser(): void {
      this.user = null;
      this.users = [];
    },
    async loginWithGoogle(): Promise<void> {
      const errorStore = useErrorStore();
      try {
        const result = await signInWithPopup(auth, googleProvider);
    
        if (auth.currentUser?.isAnonymous) {
          // If the user is currently anonymous, link their account to the Google credentials
          const credential = GoogleAuthProvider.credential(result.user.accessToken);
          await linkWithCredential(auth.currentUser, credential);
        }
    
        const userRef = doc(db, "users", result.user.uid);
        const userDoc = await getDoc(userRef);
    
        let userData: User;
    
        if (!userDoc.exists()) {
          userData = {
            uid: result.user.uid,
            displayName: result.user.displayName || "No Name",
            email: result.user.email || "No Email",
            photoURL: result.user.photoURL || generateAvatarURL('neutral'),
            role: 'customer',
            userStatus: 'active',
            lastLoginAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
            createdAt: Timestamp.now(),
          };
    
          await setDoc(userRef, userData);
        } else {
          userData = {
            ...userDoc.data() as User,
            lastLoginAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
          };
          await updateDoc(userRef, { lastLoginAt: Timestamp.now(), updatedAt: Timestamp.now() });
        }
    
        this.setUser(userData);
        logEvent(analytics, 'login', { method: 'Google' });
        // router.push('/tasks');
      } catch (error: any) {
        errorStore.showError("An error occurred during login: " + error.message);
      }
    },    
    async loginAnonymously(): Promise<void> {
      const errorStore = useErrorStore();
      try {
        const result = await signInAnonymously(auth);
        const userRef = doc(db, "users", result.user.uid);
        const userDoc = await getDoc(userRef);

        let userData: User;

        if (!userDoc.exists()) {
          userData = {
            uid: result.user.uid,
            isAnonymous: true,
            displayName: "Anonymous",
            email: "anonymous@unknown.com",
            photoURL: generateAvatarURL('neutral'),
            role: 'guest',
            userStatus: 'active',
            lastLoginAt: Timestamp.now(),
            createdAt: Timestamp.now(),
          };

          await setDoc(userRef, userData);
        } else {
          userData = {
            ...userDoc.data() as User,
            lastLoginAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
          };
          await updateDoc(userRef, { lastLoginAt: Timestamp.now(), updatedAt: Timestamp.now() });
        }

        this.setUser(userData);
        logEvent(analytics, 'login', { method: 'Anonymous' });
      } catch (error: any) {
        errorStore.showError("An error occurred during anonymous login: " + error.message);
      }
    },

    async fetchUser(): Promise<void> {
      const errorStore = useErrorStore();
      try {
        const currentUser = auth.currentUser;
    
        if (currentUser) {
          const userRef = doc(db, "users", currentUser.uid);
          const userDoc = await getDoc(userRef);
    
          if (userDoc.exists()) {
            this.setUser(userDoc.data() as User);
            
            // Check subscription status using the cloud function
            await this.checkSubscription();
          } else {
            await this.loginAnonymously(); 
          }
        } else {
          this.clearUser();
        }
      } catch (error: any) {
        errorStore.showError("An error occurred while fetching the user: " + error.message);
      }
    },
    
    async checkSubscription(): Promise<void> {
      try {
        if (!this.user || !this.user.uid) return;
        
        // Get the current Firebase Auth token
        const authToken = await auth.currentUser?.getIdToken();
        
        if (!authToken) return;
        
        // Call the HTTP function instead of callable function
        const response = await fetch('https://us-central1-motocraft-twoheads.cloudfunctions.net/checkSubscriptionHttp', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result) {
          // Update user subscription data
          const userData: User = {
            ...this.user,
            subscriptionType: result.subscriptionType || 'free',
            subscriptionStatus: result.isActive ? 'active' : 'inactive',
            subscriptionEndDate: result.daysRemaining ? 
              Timestamp.fromDate(new Date(Date.now() + (result.daysRemaining * 24 * 60 * 60 * 1000))) : 
              undefined
          };
          
          // Update features access
          this.subscriptionFeatures = result.features || null;
          
          // Update in Firestore and local state
          await this.updateUser(this.user.uid, {
            subscriptionType: userData.subscriptionType,
            subscriptionStatus: userData.subscriptionStatus,
            subscriptionEndDate: userData.subscriptionEndDate
          });
          
          this.setUser(userData);
        }
      } catch (error) {
        console.error("Failed to check subscription:", error);
        // Don't show error to user as this is a background check
      }
    },
    
    async updateSubscription(subscriptionType: string, billingCycle: 'monthly' | 'yearly' = 'monthly'): Promise<boolean> {
      const errorStore = useErrorStore();
      try {
        if (!this.user || !this.user.uid) {
          errorStore.showError("You must be logged in to manage subscriptions");
          return false;
        }
        
        // In a real app, this would call a backend endpoint to process payment
        // and update the subscription in a payment provider system
        
        // For demo purposes, directly update in Firestore
        const now = new Date();
        const endDate = new Date(now);
        
        // Set subscription end date based on billing cycle
        if (billingCycle === 'yearly') {
          endDate.setFullYear(endDate.getFullYear() + 1);
        } else {
          endDate.setMonth(endDate.getMonth() + 1);
        }
        
        const subscriptionData: UserUpdate = {
          subscriptionType,
          subscriptionStatus: 'active',
          subscriptionBillingCycle: billingCycle,
          subscriptionEndDate: Timestamp.fromDate(endDate),
          updatedAt: Timestamp.now()
        };
        
        await this.updateUser(this.user.uid, subscriptionData);
        
        // Refresh subscription features
        await this.checkSubscription();
        
        return true;
      } catch (error: any) {
        errorStore.showError("Failed to update subscription: " + error.message);
        return false;
      }
    },
    async fetchAllUsers(): Promise<void> {
      const errorStore = useErrorStore();
      try {
        const q = query(collection(db, "users"));
        const querySnapshot = await getDocs(q);
        this.users = querySnapshot.docs.map(doc => doc.data() as User);
      } catch (error: any) {
        errorStore.showError("An error occurred fetching users: " + error.message);
      }
    },
    async updateUser(uid: string, updatedData: UserUpdate): Promise<void> {
      const errorStore = useErrorStore();
      try {
        if (!this.user) {
          throw new Error("No authenticated user found");
        }
        
        const userRef = doc(db, "users", uid);
        const updatePayload: UserUpdate = {
          ...updatedData,
          updatedAt: Timestamp.now(),
          updatedBy: {
            uid: this.user.uid,
            displayName: this.user.displayName,
            photoURL: this.user.photoURL,
            role: this.user.role
          }
        };
        
        await updateDoc(userRef, updatePayload);

        const userIndex = this.users.findIndex(u => u.uid === uid);
        if (userIndex !== -1) {
          this.users[userIndex] = { ...this.users[userIndex], ...updatePayload };
        }
        if (uid === this.user?.uid) {
          this.setUser({ ...this.user, ...updatePayload } as User);
        }
      } catch (error: any) {
        errorStore.showError("An error occurred updating the user: " + error.message);
      }
    },
    async deleteUser(uid: string): Promise<void> {
      const errorStore = useErrorStore();
      try {
        if (!this.user) {
          throw new Error("No authenticated user found");
        }
        
        const userRef = doc(db, "users", uid);
        const updatedData: UserUpdate = {
          userStatus: "inactive",
          updatedAt: Timestamp.now(),
          updatedBy: {
            uid: this.user.uid,
            displayName: this.user.displayName,
            photoURL: this.user.photoURL,
            role: this.user.role
          }
        };

        await updateDoc(userRef, updatedData);

        const userIndex = this.users.findIndex(u => u.uid === uid);
        if (userIndex !== -1) {
          this.users[userIndex] = { ...this.users[userIndex], ...updatedData } as User;
        }

        if (uid === this.user?.uid) {
          this.clearUser();
          router.push({ name: "Login" });
        }
      } catch (error: any) {
        errorStore.showError("An error occurred deleting the user: " + error.message);
      }
    },

    async logout(): Promise<void> {
      const errorStore = useErrorStore();
      try {
        await auth.signOut();
        this.clearUser();
        router.push({ name: "Login" });
      } catch (error: any) {
        errorStore.showError("An error occurred during logout: " + error.message);
      }
    },
    setUpAuthListener(): void {
      const auth = getAuth();
      onAuthStateChanged(auth, (user: FirebaseUser | null) => {
        if (user) {
          // We need to fetch the full user data from Firestore
          this.fetchUser();
        } else {
          this.clearUser();
        }
      });
    },
  },
});