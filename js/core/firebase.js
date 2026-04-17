// js/core/firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { firebaseConfig } from './config.js';

// تهيئة Firebase
const app = initializeApp(firebaseConfig);

// تصدير db بشكل صريح ومباشر
export const db = getFirestore(app);
