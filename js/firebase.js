// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBWYW6Qqlhh904pBeuJ29wY7Cyjm2uklBA",
  authDomain: "msjt301-974bb.firebaseapp.com",
  projectId: "msjt301-974bb",
  storageBucket: "msjt301-974bb.firebasestorage.app",
  messagingSenderId: "186209858482",
  appId: "1:186209858482:web:186ca610780799ef562aab",
  measurementId: "G-NDVGC9GPQZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
