/**
 * Tera Core - Firebase Integration Layer (V12.12.12)
 * SDK Version: 10.7.1 (Stable)
 * Project: msjt301-974bb (Tera Gateway)
 * تم التحديث لتجنب Deprecation Warning ودعم التخزين المحلي المطور
 * المطور: محمد بن صالح الشمري
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    initializeFirestore, 
    persistentLocalCache, 
    persistentMultipleTabManager 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

// إعدادات المشروع المعتمدة لمنصة تيرا جيت واي
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

/**
 * 2. تهيئة Firestore مع إعدادات الذاكرة التخزينية المحدثة
 * تفعيل خاصية persistentLocalCache يضمن بقاء البيانات حتى بعد إغلاق المتصفح
 * تفعيل persistentMultipleTabManager يسمح بفتح النظام في أكثر من تبويب دون تعارض
 */
const db = initializeFirestore(app, {
    localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager()
    })
});

// 3. تهيئة خدمات الهوية والمخزن السحابي
const auth = getAuth(app);
const storage = getStorage(app);

/**
 * وظيفة التحقق من جهوزية قاعدة البيانات
 * يتم استدعاؤها من محرك التشغيل الرئيسي في index.html
 */
export async function ensureDbReady() {
    return new Promise((resolve, reject) => {
        if (db) {
            resolve(true);
        } else {
            reject(new Error("فشل في تهيئة محرك البيانات السحابي (Firestore)"));
        }
    });
}

/**
 * حماية النافذة العالمية (Window) لبيئة المتصفح
 * لتمكين الوصول السريع من الكونسول للمطور عند الحاجة
 */
if (typeof window !== 'undefined') {
    window.db = db;
    window.auth = auth;
    window.storage = storage;
    window.ensureDbReady = ensureDbReady;
    
    // رسالة تأكيد الاتصال المحسنة
    console.log(
        "%c TERA GATEWAY %c V12.12.12 %c Optimized ",
        "background: #f97316; color: white; font-weight: bold; border-radius: 3px 0 0 3px; padding: 2px 5px;",
        "background: #0f172a; color: white; font-weight: bold; padding: 2px 5px;",
        "background: #22c55e; color: white; font-weight: bold; border-radius: 0 3px 3px 0; padding: 2px 5px;"
    );
}

// تصدير الخدمات للاستخدام في الملفات الأخرى
export { app, db, auth, storage, firebaseConfig };
