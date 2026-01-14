import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

// 👇 YAHA APNA FIREBASE CONFIG PASTE KAR (Jo console se mila tha)
const firebaseConfig = {
  apiKey: "AIzaSyA1BA4YmHbv5yF_2kRLLDkIqiw_Ig3_tLo",
  authDomain: "progresstruth.firebaseapp.com",
  projectId: "progresstruth",
  storageBucket: "progresstruth.firebasestorage.app",
  messagingSenderId: "341997019051",
  appId: "1:341997019051:web:7fc7d76cbf1eca047dfcee",
  measurementId: "G-6B169NMKXE",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider, signInWithPopup };
