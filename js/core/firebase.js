/**
 * js/core/firebase.js
 * تهيئة محرك Firebase لـ "تيرا جيت واي"
 * الإصدار المستقر للمكتبة: 10.7.1 | إصدار النظام: V12.12.6
 */

// تصحيح الروابط لاستخدام الإصدار المستقر 10.7.1
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAnalytics, isSupported } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

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

// 2. تهيئة الخدمات مع معالجة التحليلات
let analytics;
isSupported().then(supported => {
    if (supported) analytics = getAnalytics(app);
});

const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

// 3. الحل الجذري: ربط الخدمات بنطاق النافذة (Global Scope)
// هذا يضمن أن ملفات HTML مثل customers.html يمكنها الوصول لـ db مباشرة
if (!window.db) {
    window.db = db;
    window.auth = auth;
    window.storage = storage;
    window.firebaseApp = app;
}

console.log("🚀 Tera Engine: تم تصحيح المسارات والمحرك جاهز الآن.");

export { app, db, auth, storage, analytics };
