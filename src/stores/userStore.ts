import { defineStore } from "pinia";
import { auth, googleProvider, signInWithPopup, signInAnonymously, db, analytics, functions } from "../fbConfig";
import { collection, getDocs, setDoc, doc, getDoc, query, updateDoc, Timestamp, where, deleteDoc } from "firebase/firestore";
import { useErrorStore } from "./errorStore";
import router from "../router";
import { logEvent } from 'firebase/analytics';
import { linkWithCredential, GoogleAuthProvider, getAuth, onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { httpsCallable } from 'firebase/functions';
import { User, UserUpdate, SubscriptionFeatures, PaymentMethod, PaymentTransaction } from "../types";

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
  paymentMethods: PaymentMethod[];
  paymentHistory: PaymentTransaction[];
}

export const useUserStore = defineStore({
  id: "userStore",
  state: (): UserState => ({
    user: null,
    users: [],
    subscriptionFeatures: null,
    paymentMethods: [],
    paymentHistory: [],
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
    // Payment related getters
    userPaymentMethods: (state): PaymentMethod[] => state.paymentMethods,
    defaultPaymentMethod: (state): PaymentMethod | undefined => state.paymentMethods.find(method => method.isDefault),
    paymentTransactions: (state): PaymentTransaction[] => state.paymentHistory,
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
      this.paymentMethods = [];
      this.paymentHistory = [];
      this.subscriptionFeatures = null;
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

            // Load payment methods for paid users
            const userData = userDoc.data() as User;
            if (userData.subscriptionType && userData.subscriptionType !== 'free') {
              await this.loadPaymentMethods();
              await this.loadPaymentHistory();
            }
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
    
    async updateSubscription(subscriptionType: string, billingCycle: 'monthly' | 'yearly' = 'monthly', subscriptionId?: string): Promise<boolean> {
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

        // If subscription ID is provided, add it to the update
        if (subscriptionId) {
          subscriptionData.subscriptionId = subscriptionId;
        }

        await this.updateUser(this.user.uid, subscriptionData);

        // Refresh subscription features
        await this.checkSubscription();

        return true;
      } catch (error: any) {
        errorStore.showError("Failed to update subscription: " + error.message);
        return false;
      }
    },

    // Payment Method Management
    async loadPaymentMethods(): Promise<PaymentMethod[]> {
      const errorStore = useErrorStore();
      try {
        if (!this.user || !this.user.uid) {
          throw new Error("User must be authenticated to load payment methods");
        }

        const paymentMethodsRef = collection(db, 'users', this.user.uid, 'paymentMethods');
        const querySnapshot = await getDocs(paymentMethodsRef);

        // Filter out deleted payment methods
        this.paymentMethods = querySnapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          } as PaymentMethod))
          .filter(method => !method.deleted);

        return this.paymentMethods;
      } catch (error: any) {
        errorStore.showError("Error loading payment methods: " + error.message);
        return [];
      }
    },

    async addPaymentMethod(paymentMethod: Partial<PaymentMethod>): Promise<PaymentMethod | null> {
      const errorStore = useErrorStore();
      try {
        if (!this.user || !this.user.uid) {
          throw new Error("User must be authenticated to add payment method");
        }

        const paymentMethodsRef = collection(db, 'users', this.user.uid, 'paymentMethods');

        // Check if this should be the default payment method
        let isDefault = paymentMethod.isDefault || false;

        // If this is the first payment method, make it default
        if (this.paymentMethods.length === 0) {
          isDefault = true;
        }

        // If setting as default, update any existing default methods
        if (isDefault && this.paymentMethods.length > 0) {
          const defaultMethod = this.paymentMethods.find(m => m.isDefault);
          if (defaultMethod) {
            await updateDoc(doc(db, 'users', this.user.uid, 'paymentMethods', defaultMethod.id), {
              isDefault: false
            });

            // Update in local state
            const index = this.paymentMethods.findIndex(m => m.id === defaultMethod.id);
            if (index !== -1) {
              this.paymentMethods[index].isDefault = false;
            }
          }
        }

        // Create a new payment method document
        const newPaymentMethod: PaymentMethod = {
          id: '', // will be set after doc creation
          type: paymentMethod.type || 'card',
          name: paymentMethod.name || 'Unnamed Card',
          info: paymentMethod.info || '',
          isDefault,
          lastFour: paymentMethod.lastFour,
          expiryDate: paymentMethod.expiryDate,
          providerToken: paymentMethod.providerToken,
          createdAt: Timestamp.now()
        };

        // Add to Firestore
        const docRef = doc(paymentMethodsRef);
        newPaymentMethod.id = docRef.id;
        await setDoc(docRef, newPaymentMethod);

        // Add to local state
        this.paymentMethods.push(newPaymentMethod);

        return newPaymentMethod;
      } catch (error: any) {
        errorStore.showError("Error adding payment method: " + error.message);
        return null;
      }
    },

    async updatePaymentMethod(methodId: string, updates: Partial<PaymentMethod>): Promise<boolean> {
      const errorStore = useErrorStore();
      try {
        if (!this.user || !this.user.uid) {
          throw new Error("User must be authenticated to update payment method");
        }

        const paymentMethodRef = doc(db, 'users', this.user.uid, 'paymentMethods', methodId);

        // Handle default flag updates
        if (updates.isDefault) {
          // Update any existing default methods
          const currentDefault = this.paymentMethods.find(m => m.isDefault && m.id !== methodId);
          if (currentDefault) {
            await updateDoc(doc(db, 'users', this.user.uid, 'paymentMethods', currentDefault.id), {
              isDefault: false
            });

            // Update in local state
            const index = this.paymentMethods.findIndex(m => m.id === currentDefault.id);
            if (index !== -1) {
              this.paymentMethods[index].isDefault = false;
            }
          }
        }

        // Update the method in Firestore
        await updateDoc(paymentMethodRef, {
          ...updates,
          updatedAt: Timestamp.now()
        });

        // Update in local state
        const index = this.paymentMethods.findIndex(m => m.id === methodId);
        if (index !== -1) {
          this.paymentMethods[index] = {
            ...this.paymentMethods[index],
            ...updates,
            updatedAt: Timestamp.now()
          };
        }

        return true;
      } catch (error: any) {
        errorStore.showError("Error updating payment method: " + error.message);
        return false;
      }
    },

    async deletePaymentMethod(methodId: string): Promise<boolean> {
      const errorStore = useErrorStore();
      try {
        if (!this.user || !this.user.uid) {
          throw new Error("User must be authenticated to delete payment method");
        }

        const paymentMethodRef = doc(db, 'users', this.user.uid, 'paymentMethods', methodId);

        // Get the method to check if it's default
        const methodIndex = this.paymentMethods.findIndex(m => m.id === methodId);
        if (methodIndex === -1) {
          throw new Error("Payment method not found");
        }

        const method = this.paymentMethods[methodIndex];

        // If deleting default method, set another one as default
        if (method.isDefault) {
          const otherMethods = this.paymentMethods.filter(m => m.id !== methodId);

          if (otherMethods.length > 0) {
            // Set the first other method as default
            await this.updatePaymentMethod(otherMethods[0].id, { isDefault: true });
          }
        }

        // Mark as deleted instead of actually deleting (soft delete)
        await updateDoc(paymentMethodRef, {
          deleted: true,
          deletedAt: Timestamp.now()
        });

        // Remove from local state
        this.paymentMethods = this.paymentMethods.filter(m => m.id !== methodId);

        return true;
      } catch (error: any) {
        errorStore.showError("Error deleting payment method: " + error.message);
        return false;
      }
    },

    async loadPaymentHistory(): Promise<PaymentTransaction[]> {
      const errorStore = useErrorStore();
      try {
        if (!this.user || !this.user.uid) {
          throw new Error("User must be authenticated to view payment history");
        }

        const transactionsQuery = query(
          collection(db, 'transactions'),
          where('userId', '==', this.user.uid)
        );

        const transactionsSnapshot = await getDocs(transactionsQuery);

        this.paymentHistory = transactionsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as PaymentTransaction)).sort((a, b) =>
          b.createdAt.toMillis() - a.createdAt.toMillis()
        );

        return this.paymentHistory;
      } catch (error: any) {
        errorStore.showError("Error loading payment history: " + error.message);
        return [];
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