/**
 * Tera Core - Firebase Integration Layer
 * SDK Version: 10.7.1 (Stable)
 * Project: msjt301-974bb (Tera Gateway)
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

// إعدادات المشروع الخاصة بك
const firebaseConfig = {
    apiKey: "AIzaSyBWYW6Qqlhh904pBeuJ29wY7Cyjm2uklBA",
    authDomain: "msjt301-974bb.firebaseapp.com",
    projectId: "msjt301-974bb",
    storageBucket: "msjt301-974bb.firebasestorage.app",
    messagingSenderId: "186209858482",
    appId: "1:186209858482:web:186ca610780799ef562aab",
    measurementId: "G-NDVGC9GPQZ"
};

// 1. تهيئة التطبيق
const app = initializeApp(firebaseConfig);

// 2. تهيئة الخدمات الأساسية
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

/**
 * تصدير للنافذة (window) لضمان التوافق مع السكربتات القديمة
 * وجداول البيانات التي تعتمد على الوصول المباشر
 */
window.db = db;
window.auth = auth;
window.storage = storage;
window.teraApp = app;

console.log("%c✅ Tera Engine:", "color: #2563eb; font-weight: bold;", "تم تصحيح الروابط والمحرك متصل الآن بـ Firebase v10.7.1");

// 3. التصدير للموديولات الحديثة (Core Config)
export { app, db, auth, storage, analytics };
