// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAXaB48gwdPWVpgB-j5ttQaHw-SAhi5Tgc",
  authDomain: "ai-interview-6a132.firebaseapp.com",
  projectId: "ai-interview-6a132",
  storageBucket: "ai-interview-6a132.firebasestorage.app",
  messagingSenderId: "457866045859",
  appId: "1:457866045859:web:3980b55caf26be0616d216"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export default app;