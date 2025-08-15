// src/lib/firebase.ts

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDRqR1Ct9TbvtERO-4W9zHbW-HlAQANXAI",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "technical-test-be.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "technical-test-be",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "technical-test-be.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "226976768159",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:226976768159:web:ee0bbfda7b3df6248a02aa",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-222W0PH0NE"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;