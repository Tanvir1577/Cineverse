// Firebase configuration for client-side usage
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB-ysWC9I5CBOTjMFcKd2q2l68_NLVbEzU",
  authDomain: "cineverse-bc951.firebaseapp.com",
  projectId: "cineverse-bc951",
  storageBucket: "cineverse-bc951.firebasestorage.app",
  messagingSenderId: "838134026814",
  appId: "1:838134026814:web:4dd1a6e401a4296974776f",
  measurementId: "G-MHMPKW6529"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
const firestore = getFirestore(app);
const auth = getAuth(app);

export { app, firestore, auth, analytics };