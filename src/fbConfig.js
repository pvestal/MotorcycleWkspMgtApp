import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics, isSupported, settings as getAnalyticsSettings } from 'firebase/analytics';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';
import { getAuth, signInWithPopup, signOut, GoogleAuthProvider, signInAnonymously} from "firebase/auth";

// Create provider after importing GoogleAuthProvider
const googleProvider = new GoogleAuthProvider();

const fbcf = {
  apiKey: "AIzaSyCS-hfHzACm7nNrJjqEcGZAdyVX-_AhFWA",
  authDomain: "motocraft-twoheads.firebaseapp.com",
  projectId: "motocraft-twoheads",
  storageBucket: "motocraft-twoheads.appspot.com",
  messagingSenderId: "320362990178",
  appId: "1:320362990178:web:349e29b207804548ae1f3b",
  measurementId: "G-M1PDFTP63T"
};

// Initialize Firebase
const app = initializeApp(fbcf);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);
const functions = getFunctions(app);

// Initialize analytics conditionally to avoid heartbeat errors
let analytics = null;
try {
  // Only initialize analytics if it's supported in this environment
  const initAnalytics = async () => {
    try {
      const supported = await isSupported();
      if (supported) {
        // Initialize analytics with consent settings at creation time
        const analyticsOptions = {
          consent: {
            'analytics_storage': 'granted',
            'functionality_storage': 'granted',
            'personalization_storage': 'denied',
            'ad_storage': 'denied',
            'ad_user_data': 'denied',
            'ad_personalization': 'denied'
          }
        };

        analytics = getAnalytics(app);

        // Configure analytics settings
        getAnalyticsSettings(analytics).setConsent(analyticsOptions.consent);

        // Disable analytics debug mode in production
        if (typeof self !== 'undefined') {
          self.FIREBASE_ANALYTICS_DEBUG_MODE = false;
        }
      }
    } catch (error) {
      console.log('Analytics support check failed:', error);
    }
  };

  // Initialize analytics but don't wait for it
  initAnalytics();
} catch (error) {
  console.log('Analytics not supported in this environment:', error);
}

export { db, auth, signInWithPopup, signOut, googleProvider, analytics, signInAnonymously, storage, functions};
