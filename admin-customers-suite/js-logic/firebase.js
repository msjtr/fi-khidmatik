/**
 * المحرك الأساسي لنظام Tera - مؤسسة الإتقان بلس
 * إصدار Firebase 10.7.1
 */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

// ⚠️ تأكد من تعبئة هذه البيانات من لوحة تحكم Firebase الخاصة بك
const firebaseConfig = {
    apiKey: "AIzaSy...", 
    authDomain: "tera-system-xxxx.firebaseapp.com",
    projectId: "tera-system-xxxx", // هذا هو الحقل الذي يسبب الخطأ الأول
    storageBucket: "tera-system-xxxx.appspot.com",
    messagingSenderId: "xxxx",
    appId: "1:xxxx:web:xxxx"
};

// تهيئة التطبيق
const app = initializeApp(firebaseConfig);

// تعريف الخدمات
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app); // تعريف خدمة التخزين لحل الخطأ الثاني

// تعريف المجموعات (Collections) لضمان المركزية
export const COLLECTIONS = {
    customers: 'customers',
    orders: 'orders',
    logs: 'audit_logs',
    payments: 'payments',
    inventory: 'inventory_cards'
};

// تصدير الخدمات والمجموعات لاستخدامها في api-connector.js
export { app, db, auth, storage };
