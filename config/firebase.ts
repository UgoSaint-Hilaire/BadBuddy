// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc  } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyASBOwDkpzXVHrca6uTnjHpftkwcCbUiuI",
  authDomain: "bad-buddy-55b94.firebaseapp.com",
  projectId: "bad-buddy-55b94",
  storageBucket: "bad-buddy-55b94.firebasestorage.app",
  messagingSenderId: "20313028403",
  appId: "1:20313028403:web:cc430a56d2834751bf7046",
  measurementId: "G-CQ0SRFYBYV",
};

// Initialize Firebase
export const FIREBASE_APP = initializeApp(firebaseConfig);
export const FIREBASE_AUTH = getAuth(FIREBASE_APP);
export const FIREBASE_DB = getFirestore();
export const FIREBASE_USER = doc(FIREBASE_DB, "users", "SeyzVcHlGXhrrnERBvAD");
export const getUser = async () => {
  return await getDoc(FIREBASE_USER);
};
export const FIREBASE_GET_USER = getUser();
