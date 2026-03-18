import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

// ⚠️  Move these to .env.local for production:
//     NEXT_PUBLIC_FIREBASE_API_KEY=...  etc.
const firebaseConfig = {
  apiKey:
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
    "AIzaSyA1BA4YmHbv5yF_2kRLLDkIqiw_Ig3_tLo",
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    "progresstruth.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "progresstruth",
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    "progresstruth.firebasestorage.app",
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "341997019051",
  appId:
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID ||
    "1:341997019051:web:7fc7d76cbf1eca047dfcee",
};

// Prevent duplicate app initialization (Next.js hot reload safe)
const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Optional: Force account picker on every sign-in
provider.setCustomParameters({ prompt: "select_account" });

export { auth, provider, signInWithPopup };
