"use client";

import { initializeApp, getApps } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyDPp9w5B5Q1r1B0XgF9OpoCdaW00b4F1co",
  authDomain: "tracking-app-d6f0e.firebaseapp.com",
  projectId: "tracking-app-d6f0e",
  storageBucket: "tracking-app-d6f0e.firebasestorage.app",
  messagingSenderId: "805369599912",
  appId: "1:805369599912:web:44e7e9b77746e03df4af9d"
};

// Initialize once
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Persist logged-in session to avoid logout on refresh
if (typeof window !== "undefined") {
  setPersistence(auth, browserLocalPersistence);
}
