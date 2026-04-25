/**
 * js/core/firebase.js
 * الملف المركزي لتهيئة Firebase ونظام الكاش المتطور لمنصة تيرا
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    initializeFirestore, 
    persistentLocalCache, 
    persistentMultipleTabManager 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// إعدادات مشروع منصة تيرا
const firebaseConfig = {
    apiKey: "AIzaSyBWYW6Qqlhh904pBeuJ29wY7Cyjm2uklBA",
    authDomain: "msjt301-974bb.firebaseapp.com",
    projectId: "msjt301-974bb",
    storageBucket: "msjt301-974bb.firebasestorage.app",
    messagingSenderId: "186209858482",
    appId: "1:186209858482:web:186ca610780799ef562aab"
};

// 1. تهيئة التطبيق الأساسي
const app = initializeApp(firebaseConfig);

/**
 * 2. تهيئة Firestore بنظام الكاش المتعدد (Persistent Multi-Tab)
 * يضمن سرعة تحميل البيانات في حائل والمناطق ذات الإنترنت المتغير
 */
const db = initializeFirestore(app, {
    localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager()
    })
});

// 3. تهيئة نظام المصادقة
const auth = getAuth(app);

// 4. ثوابت النظام
export const APP_CONFIG = {
    name: "Tera Gateway",
    region: "Hail",
    version: "2.0.0"
};

/**
 * 5. التصدير الموحد والمباشر
 * لضمان عدم حدوث خطأ SyntaxError: Unexpected token '{'
 */
export { app, db, auth };

// أداة انتظار الجاهزية
export const waitForFirebase = () => Promise.resolve(true);

export default { app, db, auth, APP_CONFIG };
