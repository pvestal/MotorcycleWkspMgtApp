import { defineStore } from "pinia";
import { db } from "../fbConfig";
import { collection, addDoc, updateDoc, doc, getDoc, query, where, getDocs, Timestamp } from "firebase/firestore";
import { useErrorStore } from "./errorStore";
import { useUserStore } from "./userStore";

export const useContributionStore = defineStore("contributionStore", {
  state: () => ({
    contributions: [],
    points: 0,
    badges: [],
    role: "contributor", // Default role
  }),
  getters: {
    userPoints: (state) => state.points,
    userBadges: (state) => state.badges,
    userRole: (state) => state.role,
  },
  actions: {
    async fetchUserContributions(uid) {
      const errorStore = useErrorStore();
      try {
        const q = query(collection(db, "contributions"), where("userId", "==", uid));
        const querySnapshot = await getDocs(q);
        this.contributions = querySnapshot.docs.map((doc) => doc.data());

        // Calculate total points from contributions
        this.points = this.contributions.reduce((acc, contrib) => acc + contrib.pointsEarned, 0);
      } catch (error) {
        errorStore.showError("Failed to fetch user contributions: " + error.message);
      }
    },

    async addContribution({ taskId, feedback, confirmation }) {
      const userStore = useUserStore();
      const errorStore = useErrorStore();
      const user = userStore.currentUser;

      if (!user) {
        errorStore.showError("User must be logged in to contribute.");
        return;
      }

      try {
        const newContribution = {
          taskId,
          userId: user.uid,
          feedback: feedback || "",
          confirmation: confirmation || false,
          pointsEarned: 10, // Set points based on contribution type
          timestamp: Timestamp.now(),
        };

        const docRef = await addDoc(collection(db, "contributions"), newContribution);

        // Add contribution to the user's state
        this.contributions.push({ id: docRef.id, ...newContribution });
        this.points += 10; // Add points for the contribution

        // Check if user has earned a badge or new role
        this.checkForNewBadges();
        this.checkForRoleUpgrade();
      } catch (error) {
        errorStore.showError("Failed to add contribution: " + error.message);
      }
    },

    checkForNewBadges() {
      // Check if user qualifies for any new badges
      const badges = [];
      if (this.points >= 100 && !this.badges.includes("Contributor Level 1")) {
        badges.push("Contributor Level 1");
      }
      if (this.points >= 500 && !this.badges.includes("Contributor Level 2")) {
        badges.push("Contributor Level 2");
      }

      this.badges.push(...badges);

      // You could also save badges to Firestore if necessary.
    },

    checkForRoleUpgrade() {
      if (this.points >= 500 && this.role !== "moderator") {
        this.role = "moderator"; // Promote to moderator
        this.updateUserRole("moderator");
      } else if (this.points >= 100 && this.role !== "contributor") {
        this.role = "contributor"; // Promote to contributor
        this.updateUserRole("contributor");
      }
    },

    async updateUserRole(newRole) {
      const errorStore = useErrorStore();
      const userStore = useUserStore();
      const user = userStore.currentUser;

      try {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, { role: newRole });

        // Update the user store with the new role
        userStore.updateUser(user.uid, { role: newRole });
      } catch (error) {
        errorStore.showError("Failed to update user role: " + error.message);
      }
    },
  },
});
