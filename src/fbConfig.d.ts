import { Firestore } from "firebase/firestore";
import { Auth, GoogleAuthProvider } from "firebase/auth";
import { Analytics } from "firebase/analytics";
import { Storage } from "firebase/storage";
import { Functions } from "firebase/functions";

// Export the Firebase instances and helpers
export const db: Firestore;
export const auth: Auth;
export const signInWithPopup: Function;
export const signOut: Function;
export const googleProvider: GoogleAuthProvider;
export const analytics: Analytics | null;
export const signInAnonymously: Function;
export const storage: Storage;
export const functions: Functions;