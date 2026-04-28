// js/core/firebase.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-analytics.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-storage.js";

const firebaseConfig = {
    apiKey: "AIzaSyBWYW6Qqlhh904pBeuJ29wY7Cyjm2uklBA",
    authDomain: "msjt301-974bb.firebaseapp.com",
    projectId: "msjt301-974bb",
    storageBucket: "msjt301-974bb.firebasestorage.app",
    messagingSenderId: "186209858482",
    appId: "1:186209858482:web:186ca610780799ef562aab",
    measurementId: "G-NDVGC9GPQZ"
};

// 1. تهيئة Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// 2. تصدير الخدمات لسهولة الوصول إليها في المشروع
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

// 3. ربط الخدمات بنطاق النافذة (Window) لكي تراها الموديولات التي تعتمد على window.db
window.firebaseApp = app;
window.db = db;
window.auth = auth;
window.storage = storage;

console.log("✅ Tera Engine: تم ربط محرك Firebase بنجاح.");

// اختياري: تصديرهم كموديول أيضاً
export { app, db, auth, storage };
