// js/core/firebase.js

// استيراد الدوال الأساسية من مكتبة Firebase (CDN)
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-analytics.js";

// استيراد إعدادات مشروعك من الملف المجاور له في نفس المجلد
import { firebaseConfig } from './config.js';

// تشغيل Firebase وإعداد قاعدة البيانات
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const analytics = getAnalytics(app);

// تصدير المتغيرات ليتمكن موديول الطلبات والعملاء من استخدامها
export { db, analytics };
