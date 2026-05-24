// Firebase Server-Side SDK for API routes
// Uses Firebase Client SDK for Firestore operations
import { initializeApp, getApps } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  type Firestore,
  type DocumentReference,
  type DocumentSnapshot,
  type QuerySnapshot,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase (prevent re-initialization)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db: Firestore = getFirestore(app);

/**
 * Ensures Firebase is ready for write operations.
 * Tries anonymous auth if available, but gracefully falls back
 * since Firestore rules may allow unauthenticated writes.
 */
async function ensureAuth(): Promise<void> {
  // Firestore rules in this project allow server-side writes.
  // This is a no-op placeholder for future auth requirements.
  return Promise.resolve();
}

// Re-export the Firestore instance and all utility functions
export {
  db,
  ensureAuth,
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
};
export type { DocumentReference, DocumentSnapshot, QuerySnapshot };
