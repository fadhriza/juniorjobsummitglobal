// src/lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDRqR1Ct9TbvtERO-4W9zHbW-HlAQANXAI",
  authDomain: "technical-test-be.firebaseapp.com",
  projectId: "technical-test-be",
  storageBucket: "technical-test-be.firebasestorage.app",
  messagingSenderId: "226976768159",
  appId: "1:226976768159:web:ee0bbfda7b3df6248a02aa",
  measurementId: "G-222W0PH0NE"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;