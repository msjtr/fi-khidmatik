/**
 * fi-khidmatik/js/orders-firebase-db.js
 * إدارة قاعدة بيانات الطلبات - Firebase Firestore (النسخة المستقرة)
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getFirestore, collection, addDoc, doc, getDocs, 
    updateDoc, deleteDoc, query, orderBy, serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// إعدادات Firebase الخاصة بك
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
const db = getFirestore(app);
const ordersRef = collection(db, "orders");

// --- 1. جلب جميع الطلبات (مع إصلاح مشكلة التعليق) ---
export const fetchAllOrders = async () => {
    try {
        // إذا استمر التعليق، احذف "orderBy" مؤقتاً للتأكد من الربط
        const q = query(ordersRef, orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.warn("خطأ في الاستعلام المنظم، جاري المحاولة بدون ترتيب:", error);
        // محاولة بديلة في حال عدم وجود Index
        try {
            const snapshot = await getDocs(ordersRef);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (err) {
            console.error("فشل نهائي في جلب البيانات:", err);
            throw err;
        }
    }
};

// --- 2. إضافة طلب جديد ---
export const createOrder = async (orderData) => {
    try {
        const docRef = await addDoc(ordersRef, {
            ...orderData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
        return docRef.id;
    } catch (error) {
        console.error("Error creating order:", error);
        throw error;
    }
};

// --- 3. تحديث طلب موجود ---
export const updateExistingOrder = async (orderId, updatedData) => {
    try {
        const docIdRef = doc(db, "orders", orderId);
        await updateDoc(docIdRef, {
            ...updatedData,
            updatedAt: serverTimestamp()
        });
        return true;
    } catch (error) {
        console.error("Error updating order:", error);
        throw error;
    }
};

// --- 4. حذف طلب ---
export const removeOrder = async (orderId) => {
    try {
        const docIdRef = doc(db, "orders", orderId);
        await deleteDoc(docIdRef);
        return true;
    } catch (error) {
        console.error("Error deleting order:", error);
        throw error;
    }
};

// --- 5. جلب بيانات العملاء ---
export const fetchCustomersList = async () => {
    try {
        const customersRef = collection(db, "customers");
        const snapshot = await getDocs(customersRef);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error fetching customers:", error);
        return [];
    }
};

export { db };
