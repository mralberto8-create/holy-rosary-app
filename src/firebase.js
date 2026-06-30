import { initializeApp } from "firebase/app";
import { initializeFirestore, persistentLocalCache } from "firebase/firestore";
import { getAuth } from "firebase/auth";

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

// persistentLocalCache queues writes offline and replays on reconnect
export const db = initializeFirestore(app, { cache: persistentLocalCache() });
export const auth = getAuth(app);
