// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBa5JgoDsj-sqSbe2hzuJQwA-SFfAyxvBY",
  authDomain: "resalesneakers-e17cb.firebaseapp.com",
  databaseURL: "https://resalesneakers-e17cb-default-rtdb.firebaseio.com",
  projectId: "resalesneakers-e17cb",
  storageBucket: "resalesneakers-e17cb.firebasestorage.app",
  messagingSenderId: "698715655625",
  appId: "1:698715655625:web:fde7f7a7f2da0037792c18",
  measurementId: "G-WVNMT06HJS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const analytics = getAnalytics(app);

export { app, auth, db, storage, analytics }; 