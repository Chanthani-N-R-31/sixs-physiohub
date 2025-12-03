// src/lib/firebase.ts

import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";
import { getAnalytics, isSupported, Analytics } from "firebase/analytics";

// ---------------------------------------------
//  FIREBASE CONFIG (from your .env.local file)
// ---------------------------------------------
const getFirebaseConfig = () => {
  const requiredEnvVars = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  // Validate required environment variables
  const missingVars = Object.entries(requiredEnvVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required Firebase environment variables: ${missingVars.join(", ")}`
    );
  }

  return {
    apiKey: requiredEnvVars.apiKey!,
    authDomain: requiredEnvVars.authDomain!,
    projectId: requiredEnvVars.projectId!,
    storageBucket: requiredEnvVars.storageBucket!,
    messagingSenderId: requiredEnvVars.messagingSenderId!,
    appId: requiredEnvVars.appId!,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID, // optional
  };
};

const firebaseConfig = getFirebaseConfig();

// ---------------------------------------------
//  INITIALIZE APP (prevent re-initialization)
// ---------------------------------------------
const app: FirebaseApp = !getApps().length
  ? initializeApp(firebaseConfig)
  : getApp();

// ---------------------------------------------
//  EXPORT AUTH + FIRESTORE + STORAGE
// ---------------------------------------------
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export const storage: FirebaseStorage = getStorage(app);

// ---------------------------------------------
//  OPTIONAL ANALYTICS (ONLY IN BROWSER)
// ---------------------------------------------
export const getAnalyticsInstance = async (): Promise<Analytics | null> => {
  // Avoid running analytics on server
  if (typeof window === "undefined") return null;

  try {
    const supported = await isSupported();
    return supported ? getAnalytics(app) : null;
  } catch (err) {
    console.warn("Analytics not supported", err);
    return null;
  }
};
