/**
 * fi-khidmatik/js/orders-firebase-db.js
 * إدارة قاعدة بيانات الطلبات - Firebase Firestore
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import { 
    getFirestore, collection, addDoc, doc, getDocs, 
    updateDoc, deleteDoc, query, orderBy, serverTimestamp 
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

// إعدادات Firebase
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

// --- 1. جلب جميع الطلبات ---
export const fetchAllOrders = async () => {
    try {
        const q = query(ordersRef, orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        if (snapshot.empty) return [];
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error fetching orders:", error);
        throw error;
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
        if (snapshot.empty) return [];
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error fetching customers:", error);
        return [];
    }
};

// تصدير قاعدة البيانات لاستخدامها في ملفات أخرى إذا لزم الأمر
export { db };
