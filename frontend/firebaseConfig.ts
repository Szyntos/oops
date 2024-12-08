import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const getEnvVariable = (key: string, fallback: string = ""): string => {
  const value = (import.meta.env[key] as string | undefined) ?? fallback;
  if (!value) {
    console.warn(`Environment variable ${key} is not defined.`);
  }
  return value;
};

export const firebaseConfig = {
  apiKey: getEnvVariable("VITE_FIREBASE_API_KEY"),
  authDomain: getEnvVariable("VITE_FIREBASE_AUTH_DOMAIN"),
  projectId: getEnvVariable("VITE_FIREBASE_PROJECT_ID"),
  storageBucket: getEnvVariable("VITE_FIREBASE_STORAGE_BUCKET"),
  messagingSenderId: getEnvVariable("VITE_FIREBASE_MESSAGING_SENDER_ID"),
  appId: getEnvVariable("VITE_FIREBASE_APP_ID"),
  measurementId: getEnvVariable("VITE_FIREBASE_MEASUREMENT_ID"),
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
