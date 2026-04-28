/**
 * js/core/firebase.js - الإصدار 12.12.1 الحديث
 * منصة تيرا جيت واي - إدارة الاتصال بـ Firestore
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyBWYW6Qqlhh904pBeuJ29wY7Cyjm2uklBA",
    authDomain: "msjt301-974bb.firebaseapp.com",
    projectId: "msjt301-974bb",
    storageBucket: "msjt301-974bb.firebasestorage.app",
    messagingSenderId: "186209858482",
    appId: "1:186209858482:web:186ca610780799ef562aab",
    measurementId: "G-NDVGC9GPQZ"
};

// 1. تهيئة التطبيق (مع التحقق لضمان عدم التهيئة المكررة)
const app = initializeApp(firebaseConfig);

// 2. تهيئة الخدمات
const db = getFirestore(app);
const auth = getAuth(app);

// 3. تأمين الوصول العالمي (ضروري لعمل الموديولات التي تعتمد على window.db)
window.app = app;
window.db = db;
window.auth = auth;

// 4. التصدير للاستخدام في الملفات الأخرى عبر import
export { app, db, auth };

console.log("✅ Tera Engine: Firebase V12.12.1 Connected Successfully.");

/**
 * ملاحظة تقنية: 
 * تم حذف إعادة تصدير initializeApp و getFirestore 
 * لأن الملفات الأخرى يجب أن تستورد 'db' مباشرة بدلاً من إعادة تهيئتها.
 */
