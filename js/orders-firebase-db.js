// js/orders-firebase-db.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import { getFirestore, doc, getDoc, collection } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

// إعدادات مشروعك msjt301 - متطابقة مع الصور
const firebaseConfig = {
    apiKey: "AIzaSyBWYW6Qqlhh904pBeuJ29wY7Cyjm2uklBA",
    authDomain: "msjt301-974bb.firebaseapp.com",
    projectId: "msjt301-974bb",
    storageBucket: "msjt301-974bb.firebasestorage.app",
    messagingSenderId: "186209858482",
    appId: "1:186209858482:web:186ca610780799ef562aab"
};

// تهيئة Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

/**
 * وظائف مساعدة لجلب البيانات القديمة
 * صُممت لتعمل مع المجموعات الثلاث: orders, customers, products
 */
window.getDocument = async (colName, id) => {
    try {
        const snap = await getDoc(doc(db, colName, id));
        if (snap.exists()) {
            return { id: snap.id, ...snap.data(), success: true };
        } else {
            console.warn(`الوثيقة ${id} غير موجودة في مجموعة ${colName}`);
            return { success: false, error: "not-found" };
        }
    } catch (error) {
        console.error("خطأ تقني في جلب الوثيقة:", error);
        return { success: false, error: error.message };
    }
};

// تصدير أسماء المجموعات لتوحيدها في كامل المشروع
export const COLS = {
    ORDERS: "orders",
    CUSTOMERS: "customers",
    PRODUCTS: "products"
};
