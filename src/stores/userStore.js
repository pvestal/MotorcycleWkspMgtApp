import { defineStore } from "pinia";
import { auth, googleProvider, signInWithPopup, signInAnonymously, db, analytics, functions } from "../fbConfig";
import { collection, getDocs, setDoc, doc, getDoc, query, updateDoc, Timestamp, writeBatch } from "firebase/firestore";
import { useErrorStore } from "./errorStore";
import router from "../router";
import { logEvent } from 'firebase/analytics';
import { linkWithCredential, GoogleAuthProvider, getAuth, onAuthStateChanged } from "firebase/auth";
import { httpsCallable } from 'firebase/functions';

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
    subscriptionFeatures: null,
  }),
  getters: {
    isAuthenticated: (state) => !!state.user && !state.user.isAnonymous,
    currentUser: (state) => state.user,
    userDisplayName: (state) => state.user ? state.user.displayName : "",
    isAdmin: (state) => state.user?.role === 'admin',
    userRole: (state) => state.user?.role || "none",
    allUsers: (state) => state.users,
    isAnonymous: (state) => state.user?.isAnonymous || false,
    userSubscription: (state) => state.user?.subscriptionType || 'free',
    hasPremiumAccess: (state) => {
      const premiumPlans = ['premium', 'professional'];
      return premiumPlans.includes(state.user?.subscriptionType);
    },
    hasStandardAccess: (state) => {
      const standardOrBetterPlans = ['standard', 'premium', 'professional'];
      return standardOrBetterPlans.includes(state.user?.subscriptionType);
    },
    subscriptionExpiration: (state) => state.user?.subscriptionEndDate || null,
    canUseFeature: (state) => (featureName) => {
      if (!state.subscriptionFeatures) return false;
      return state.subscriptionFeatures[featureName] === true;
    },
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
        if (analytics) {
          logEvent(analytics, 'login', { method: 'Google' });
        }
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
        if (analytics) {
          logEvent(analytics, 'login', { method: 'Anonymous' });
        }
      } catch (error) {
        errorStore.showError("An error occurred during anonymous login: " + error.message);
      }
    },

    async fetchUser() {
      const errorStore = useErrorStore();
      try {
        const currentUser = auth.currentUser;
    
        if (currentUser) {
          try {
            const userRef = doc(db, "users", currentUser.uid);
            const userDoc = await getDoc(userRef);
    
            if (userDoc.exists()) {
              this.setUser(userDoc.data());
              
              // Check subscription status using the cloud function
              try {
                await this.checkSubscription();
              } catch (subscriptionError) {
                console.warn("Subscription check failed, using default settings:", subscriptionError);
                // Continue with default subscription (handled inside checkSubscription)
              }
            } else {
              console.log("User document doesn't exist, creating anonymous profile");
              await this.loginAnonymously(); 
            }
          } catch (dbError) {
            console.error("Database error while fetching user:", dbError);
            // Create a minimal user object from auth data to keep app working
            this.setUser({
              uid: currentUser.uid,
              displayName: currentUser.displayName || "User",
              email: currentUser.email || "No Email",
              photoURL: currentUser.photoURL || null,
              isAnonymous: currentUser.isAnonymous,
              role: "guest",
              subscriptionType: "free"
            });
          }
        } else {
          this.clearUser();
        }
      } catch (error) {
        console.error("Critical error in fetchUser:", error);
        errorStore.showError("An error occurred while fetching the user: " + error.message);
        
        // Try anonymous login as fallback
        try {
          await this.loginAnonymously();
        } catch (anonError) {
          console.error("Anonymous login fallback failed:", anonError);
        }
      }
    },
    
    async checkSubscription() {
      try {
        if (!this.user || !this.user.uid) return;
        
        // Create default subscription data in case the call fails
        const defaultData = {
          subscriptionType: 'free',
          isActive: true,
          daysRemaining: null,
          features: {
            projectSharing: true,
            taskCreation: true,
            partsCatalog: true,
            helpdesk: false,
            inventory: false,
            analytics: false
          }
        };
        
        let userData;
        
        try {
          // Try to get the user's subscription from local Firestore data first
          const userRef = doc(db, "users", this.user.uid);
          const userDoc = await getDoc(userRef);
          
          if (userDoc.exists() && userDoc.data().subscriptionType) {
            // Use local data without calling the cloud function
            userData = {
              ...this.user,
              subscriptionType: userDoc.data().subscriptionType || 'free',
              subscriptionStatus: userDoc.data().subscriptionStatus || 'active',
              subscriptionEndDate: userDoc.data().subscriptionEndDate || null
            };
            
            // Set default features based on subscription type
            this.subscriptionFeatures = defaultData.features;
          } else {
            // If no local data, use defaults
            userData = {
              ...this.user,
              subscriptionType: 'free',
              subscriptionStatus: 'active',
              subscriptionEndDate: null
            };
            
            this.subscriptionFeatures = defaultData.features;
          }
          
          this.setUser(userData);
        } catch (firestoreError) {
          console.warn("Failed to get subscription from Firestore:", firestoreError);
          // Use default values if Firestore fails
          userData = {
            ...this.user,
            subscriptionType: 'free',
            subscriptionStatus: 'active',
            subscriptionEndDate: null
          };
          
          this.subscriptionFeatures = defaultData.features;
          this.setUser(userData);
        }
      } catch (error) {
        console.error("Critical error in subscription check:", error);
        // Don't show error to user as this is a background check
      }
    },
    
    async updateSubscription(subscriptionType, billingCycle = 'monthly') {
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
        
        const subscriptionData = {
          subscriptionType,
          subscriptionStatus: 'active',
          subscriptionBillingCycle: billingCycle,
          subscriptionStartDate: Timestamp.fromDate(now),
          subscriptionEndDate: Timestamp.fromDate(endDate),
          updatedAt: Timestamp.now()
        };
        
        await this.updateUser(this.user.uid, subscriptionData);
        
        // Refresh subscription features
        await this.checkSubscription();
        
        return true;
      } catch (error) {
        errorStore.showError("Failed to update subscription: " + error.message);
        return false;
      }
    },
    
    async addContributionCredits(contributionType, targetId = null) {
      const errorStore = useErrorStore();
      try {
        if (!this.user || !this.user.uid) {
          return false;
        }
        
        // Credit values for different contribution types
        const creditValues = {
          'answer_question': 5,
          'validate_answer': 2,
          'create_content': 10,
          'validate_content': 3
        };
        
        // Make sure it's a valid contribution type
        if (!Object.keys(creditValues).includes(contributionType)) {
          console.warn('Invalid contribution type:', contributionType);
          return false;
        }
        
        // Calculate credits to add
        const creditsToAdd = creditValues[contributionType] || 0;
        if (creditsToAdd <= 0) return false;
        
        // Get current user data
        const userRef = doc(db, "users", this.user.uid);
        const userDoc = await getDoc(userRef);
        
        if (!userDoc.exists()) return false;
        
        const userData = userDoc.data();
        
        // Update credit count
        const currentCredits = userData.contributionCredits || 0;
        const newCredits = currentCredits + creditsToAdd;
        
        // Calculate subscription extension (if applicable)
        let extensionDays = 0;
        let updatedSubscriptionEndDate = userData.subscriptionEndDate;
        
        // Only standard or lower subscriptions can get extension from credits
        const eligibleForExtension = ['free', 'standard'].includes(userData.subscriptionType || 'free');
        
        // Every 100 credits = 1 day of subscription extension (up to 30 days max per month)
        if (eligibleForExtension && newCredits >= 100) {
          // Calculate how many days to add
          extensionDays = Math.floor(newCredits / 100);
          
          // Cap at 30 days per month
          const thisMonth = new Date().getMonth();
          const thisYear = new Date().getFullYear();
          
          // Check if user has already received extensions this month
          const extensionsThisMonth = userData.creditExtensionsThisMonth || 0;
          const extensionMonth = userData.lastExtensionMonth || -1;
          const extensionYear = userData.lastExtensionYear || -1;
          
          // Reset counter if it's a new month
          let newExtensionsThisMonth = extensionsThisMonth;
          if (extensionMonth !== thisMonth || extensionYear !== thisYear) {
            newExtensionsThisMonth = 0;
          }
          
          // Limit to 30 days total per month
          const remainingDaysAllowed = 30 - newExtensionsThisMonth;
          if (extensionDays > remainingDaysAllowed) {
            extensionDays = remainingDaysAllowed;
          }
          
          // Update subscription end date if we have days to add
          if (extensionDays > 0) {
            // Get current end date or use now if none exists
            let currentEndDate = userData.subscriptionEndDate ? 
              userData.subscriptionEndDate.toDate() : new Date();
              
            // If expired, start from today
            if (currentEndDate < new Date()) {
              currentEndDate = new Date();
            }
            
            // Add the days
            const newEndDate = new Date(currentEndDate);
            newEndDate.setDate(newEndDate.getDate() + extensionDays);
            
            // Update tracking info
            updatedSubscriptionEndDate = Timestamp.fromDate(newEndDate);
            newExtensionsThisMonth += extensionDays;
          }
        }
        
        // Data to update
        const updateData = {
          contributionCredits: newCredits,
          lastContributionAt: Timestamp.now()
        };
        
        // Add subscription extension data if applicable
        if (extensionDays > 0) {
          updateData.subscriptionEndDate = updatedSubscriptionEndDate;
          updateData.lastExtensionMonth = new Date().getMonth();
          updateData.lastExtensionYear = new Date().getFullYear();
          updateData.creditExtensionsThisMonth = userData.creditExtensionsThisMonth || 0 + extensionDays;
          updateData.subscriptionStatus = 'active';
        }
        
        // Record the contribution
        const contributionData = {
          userId: this.user.uid,
          contributionType,
          targetId,
          creditsEarned: creditsToAdd,
          extensionDaysEarned: extensionDays,
          timestamp: Timestamp.now()
        };
        
        // Run as a batch to ensure atomicity
        const batch = writeBatch(db);
        
        // Update user data
        batch.update(userRef, updateData);
        
        // Record contribution
        const contributionRef = doc(collection(db, "contributions"));
        batch.set(contributionRef, contributionData);
        
        // Commit the batch
        await batch.commit();
        
        // Update local state
        this.user = {
          ...this.user,
          ...updateData
        };
        
        // Show notification if subscription was extended
        if (extensionDays > 0) {
          errorStore.showNotification(`Congratulations! You earned ${creditsToAdd} credits and extended your subscription by ${extensionDays} days!`);
        } else {
          errorStore.showNotification(`You earned ${creditsToAdd} credits for your contribution!`);
        }
        
        return true;
      } catch (error) {
        console.error("Error adding contribution credits:", error);
        return false;
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
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          try {
            // Get full user data from Firestore
            const userRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userRef);
            
            if (userDoc.exists()) {
              this.setUser(userDoc.data());
            } else {
              this.setUser(user);
            }
          } catch (error) {
            console.error("Error in auth listener:", error);
            this.setUser(user);
          }
        } else {
          this.clearUser();
        }
      });
    },
  },
});