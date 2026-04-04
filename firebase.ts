import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBTRYycZ3RcGaTfAW51gUuiC0Wr040Gp7U",
  authDomain: "notion-clone-fdd8c.firebaseapp.com",
  projectId: "notion-clone-fdd8c",
  storageBucket: "notion-clone-fdd8c.firebasestorage.app",
  messagingSenderId: "965561169060",
  appId: "1:965561169060:web:f42fdaffecf5bf0f89e231",
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { db };
