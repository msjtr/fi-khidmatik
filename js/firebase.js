import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBWYW6Qqlhh904pBeuJ29wY7Cyjm2uklBA",
    authDomain: "msjt301-974bb.firebaseapp.com",
    projectId: "msjt301-974bb",
    storageBucket: "msjt301-974bb.firebasestorage.app",
    messagingSenderId: "186209858482",
    appId: "1:186209858482:web:186ca610780799ef562aab"
};

// تهيئة التطبيق بنظام الـ Modules
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// تصدير db ليتم التعرف عليه في orders-logic.js
export const db = getFirestore(app);

// لجعل db متاحاً في الكونسول للمتصفح (اختياري كما فعلت أنت)
window.db = db;
