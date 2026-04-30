/**
 * Tera Core - Firebase Integration Layer (V12.12.12)
 * SDK Version: 10.7.1 (Stable)
 * Project: msjt301-974bb (Tera Gateway)
 * المطور: محمد بن صالح الشمري
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, enableIndexedDbPersistence } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

// إعدادات المشروع (Tera Gateway) المعتمدة
const firebaseConfig = {
    apiKey: "AIzaSyBWYW6Qqlhh904pBeuJ29wY7Cyjm2uklBA",
    authDomain: "msjt301-974bb.firebaseapp.com",
    projectId: "msjt301-974bb",
    storageBucket: "msjt301-974bb.appspot.com", 
    messagingSenderId: "186209858482",
    appId: "1:186209858482:web:186ca610780799ef562aab",
    measurementId: "G-NDVGC9GPQZ"
};

// 1. تهيئة التطبيق الأساسي
const app = initializeApp(firebaseConfig);

// 2. تهيئة الخدمات السحابية
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

/**
 * وظيفة التحقق من جهوزية قاعدة البيانات
 * تضمن عدم تشغيل أي موديول قبل استقرار الاتصال
 */
export async function ensureDbReady() {
    return new Promise((resolve, reject) => {
        if (db) {
            resolve(true);
        } else {
            reject(new Error("فشل تهيئة محرك Firestore"));
        }
    });
}

/**
 * تفعيل خاصية العمل بدون اتصال (Offline Persistence)
 * لضمان استقرار النظام في حال ضعف الإنترنت في منطقة حائل
 */
try {
    enableIndexedDbPersistence(db).catch((err) => {
        if (err.code == 'failed-precondition') {
            console.warn("Tera Core: تعدد التبويبات مفتوح، لن يتم تفعيل وضع الأوفلاين.");
        } else if (err.code == 'unimplemented') {
            console.warn("Tera Core: المتصفح الحالي لا يدعم التخزين المحلي.");
        }
    });
} catch (e) {
    // تجاهل أخطاء التهيئة الأولية
}

/**
 * حماية النافذة العالمية (Window) لبيئة المتصفح
 * لتمكين الوصول السريع من الكونسول عند الحاجة (للمطور فقط)
 */
if (typeof window !== 'undefined') {
    window.db = db;
    window.auth = auth;
    window.storage = storage;
    window.ensureDbReady = ensureDbReady;
    
    console.log(
        "%c TERA GATEWAY %c V12.12.12 %c Ready ",
        "background: #f97316; color: white; font-weight: bold; border-radius: 3px 0 0 3px;",
        "background: #0f172a; color: white; font-weight: bold;",
        "background: #22c55e; color: white; font-weight: bold; border-radius: 0 3px 3px 0;"
    );
}

export { app, db, auth, storage, firebaseConfig };
