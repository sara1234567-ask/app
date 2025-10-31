// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAfT8XvMwCXvLUcMw46dvgr87IKL6lxPfE",
  authDomain: "react-native-firebase-9bedf.firebaseapp.com",
  projectId: "react-native-firebase-9bedf",
  storageBucket: "react-native-firebase-9bedf.firebasestorage.app",
  messagingSenderId: "204425984553",
  appId: "1:204425984553:web:5726e6c16a8ad49cfe7a38",
  measurementId: "G-GCWR3H6NY7"
};

// инициализация
const app = initializeApp(firebaseConfig);

// экспорт
export const auth = getAuth(app);
export const db = getFirestore(app);
