// Firebase Server-Side SDK for API routes
// Uses Firebase Client SDK (works server-side in Node.js)
// Admin SDK requires service account credentials we don't have in env
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

// Re-export the Firestore instance and all utility functions
export {
  db,
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
