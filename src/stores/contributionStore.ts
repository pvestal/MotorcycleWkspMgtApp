import { defineStore } from "pinia";
import { db } from "../fbConfig";
import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  getDoc, 
  query, 
  where, 
  getDocs, 
  Timestamp, 
  DocumentReference,
  QuerySnapshot
} from "firebase/firestore";
import { useErrorStore } from "./errorStore";
import { useUserStore } from "./userStore";
import { Contribution } from "@/types";

// Type definitions
interface ContributionData extends Omit<Contribution, 'id'> {
  taskId: string;
  userId: string;
  feedback?: string;
  confirmation?: boolean;
  pointsEarned: number;
  timestamp: Timestamp;
}

interface ContributionWithId extends ContributionData {
  id: string;
}

interface ContributionPayload {
  taskId: string;
  feedback?: string;
  confirmation?: boolean;
}

interface ContributionState {
  contributions: ContributionWithId[];
  points: number;
  badges: string[];
  role: string;
}

export const useContributionStore = defineStore("contributionStore", {
  state: (): ContributionState => ({
    contributions: [],
    points: 0,
    badges: [],
    role: "contributor", // Default role
  }),
  
  getters: {
    userPoints: (state): number => state.points,
    userBadges: (state): string[] => state.badges,
    userRole: (state): string => state.role,
  },
  
  actions: {
    async fetchUserContributions(uid: string): Promise<void> {
      const errorStore = useErrorStore();
      try {
        const q = query(collection(db, "contributions"), where("userId", "==", uid));
        const querySnapshot: QuerySnapshot = await getDocs(q);
        this.contributions = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        })) as ContributionWithId[];

        // Calculate total points from contributions
        this.points = this.contributions.reduce(
          (acc, contrib) => acc + contrib.pointsEarned, 
          0
        );
      } catch (error) {
        const errMsg = error instanceof Error ? error.message : 'Unknown error';
        errorStore.showError("Failed to fetch user contributions: " + errMsg);
      }
    },

    async addContribution({ taskId, feedback, confirmation }: ContributionPayload): Promise<void> {
      const userStore = useUserStore();
      const errorStore = useErrorStore();
      const user = userStore.currentUser;

      if (!user) {
        errorStore.showError("User must be logged in to contribute.");
        return;
      }

      try {
        const newContribution: ContributionData = {
          taskId,
          userId: user.uid,
          feedback: feedback || "",
          confirmation: confirmation || false,
          pointsEarned: 10, // Set points based on contribution type
          timestamp: Timestamp.now(),
          contributorId: user.uid,
          contributionType: "task_validate", // Default type
          targetId: taskId,
        };

        const docRef = await addDoc(collection(db, "contributions"), newContribution);

        // Add contribution to the user's state
        this.contributions.push({ id: docRef.id, ...newContribution });
        this.points += 10; // Add points for the contribution

        // Check if user has earned a badge or new role
        this.checkForNewBadges();
        this.checkForRoleUpgrade();
      } catch (error) {
        const errMsg = error instanceof Error ? error.message : 'Unknown error';
        errorStore.showError("Failed to add contribution: " + errMsg);
      }
    },

    checkForNewBadges(): void {
      // Check if user qualifies for any new badges
      const badges: string[] = [];
      if (this.points >= 100 && !this.badges.includes("Contributor Level 1")) {
        badges.push("Contributor Level 1");
      }
      if (this.points >= 500 && !this.badges.includes("Contributor Level 2")) {
        badges.push("Contributor Level 2");
      }

      this.badges.push(...badges);

      // You could also save badges to Firestore if necessary.
    },

    checkForRoleUpgrade(): void {
      if (this.points >= 500 && this.role !== "moderator") {
        this.role = "moderator"; // Promote to moderator
        this.updateUserRole("moderator");
      } else if (this.points >= 100 && this.role !== "contributor") {
        this.role = "contributor"; // Promote to contributor
        this.updateUserRole("contributor");
      }
    },

    async updateUserRole(newRole: string): Promise<void> {
      const errorStore = useErrorStore();
      const userStore = useUserStore();
      const user = userStore.currentUser;

      if (!user) {
        errorStore.showError("User must be logged in to update role.");
        return;
      }

      try {
        const userRef: DocumentReference = doc(db, "users", user.uid);
        await updateDoc(userRef, { role: newRole });

        // Update the user store with the new role
        userStore.updateUser(user.uid, { role: newRole });
      } catch (error) {
        const errMsg = error instanceof Error ? error.message : 'Unknown error';
        errorStore.showError("Failed to update user role: " + errMsg);
      }
    },
  },
});