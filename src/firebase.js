import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore, collection, addDoc, serverTimestamp, query, where, orderBy, onSnapshot } from "firebase/firestore";

// Your exact verified credentials from the console
const firebaseConfig = {
  apiKey: "AIzaSyAZVLuhQ6fl9yhMTv1ZButEtSuZhW39lrk",
  authDomain: "chat-app-9a033.firebaseapp.com",
  projectId: "chat-app-9a033",
  storageBucket: "chat-app-9a033.firebasestorage.app",
  messagingSenderId: "267608946440",
  appId: "1:267608946440:web:7af3541a6a8ee50c8a1ebd",
  measurementId: "G-6TP4KF28WH"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);

// Exporting utilities so App.jsx can read/write data seamlessly
export { signInWithPopup, signOut, collection, addDoc, serverTimestamp, query, where, orderBy, onSnapshot };
