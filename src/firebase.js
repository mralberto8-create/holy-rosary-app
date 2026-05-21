import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// ── FIREBASE CONFIG ────────────────────────────────────────────────────────
// Paste your Firebase project config values below.
// Get these from: Firebase Console → Project Settings → Your Apps → Web App
const firebaseConfig = {
  apiKey:            "AIzaSyDCFvy4XlqQ0Bdy9o8GbCreNwCeWZMVf98",
  authDomain:        "holy-rosary-app.firebaseapp.com",
  projectId:         "holy-rosary-app",
  storageBucket:     "holy-rosary-app.firebasestorage.app",
  messagingSenderId: "44895675913",
  appId:             "1:44895675913:web:d9f1137394791dcd6fbad8",
  measurementId:     "G-9DQESL40FB",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
