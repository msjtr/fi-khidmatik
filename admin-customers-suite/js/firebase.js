// الملف: js-logic/firebase.js
// منصة الإتقان بلس - إعدادات الاتصال بقاعدة البيانات والتخزين السحابي

// 1. استيراد الدوال الأساسية للإصدار 12.12.1
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-analytics.js";
// إضافة استيراد خدمة التخزين السحابي اللازمة للمرفقات
import { getStorage } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-storage.js";

// 2. إعدادات مشروعك الحقيقية (msjt301-974bb)
const firebaseConfig = {
    apiKey: "AIzaSyBWYW6Qqlhh904pBeuJ29wY7Cyjm2uklBA",
    authDomain: "msjt301-974bb.firebaseapp.com",
    projectId: "msjt301-974bb",
    storageBucket: "msjt301-974bb.firebasestorage.app",
    messagingSenderId: "186209858482",
    appId: "1:186209858482:web:186ca610780799ef562aab",
    measurementId: "G-NDVGC9GPQZ"
};

// 3. تهيئة التطبيق وتشغيل الإحصائيات
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// 4. تصدير خدمات قاعدة البيانات، المصادقة، والتخزين السحابي لاستخدامها في باقي الملفات
export const db = getFirestore(app);
export const auth = getAuth(app);
// تصدير خدمة التخزين لتعمل مع نظام المرفقات الجديد
export const storage = getStorage(app);
