// Firebase configuration for client-side usage
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB-ysWC9I5CBOTjMFcKd2q2l68_NLVbEzU",
  authDomain: "cineverse-bc951.firebaseapp.com",
  projectId: "cineverse-bc951",
  storageBucket: "cineverse-bc951.firebasestorage.app",
  messagingSenderId: "838134026814",
  appId: "1:838134026814:web:4dd1a6e401a4296974776f",
  measurementId: "G-MHMPKW6529"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const firestore = getFirestore(app);
const auth = getAuth(app);

export { app, firestore, auth };
