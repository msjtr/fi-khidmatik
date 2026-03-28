import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
    getFirestore,
    collection,
    addDoc,
    doc,
    getDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    setDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// إعدادات Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBWYW6Qqlhh904pBeuJ29wY7Cyjm2uklBA",
    authDomain: "msjt301-974bb.firebaseapp.com",
    projectId: "msjt301-974bb",
    storageBucket: "msjt301-974bb.firebasestorage.app",
    messagingSenderId: "186209858482",
    appId: "1:186209858482:web:186ca610780799ef562aab"
};

// تشغيل Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 🔥 اختبار الاتصال
console.log("✅ Firebase Connected");

// ===================== دالة عامة =====================
export async function getCollection(name) {
    const snap = await getDocs(collection(db, name));
    return snap.docs.map(d => ({
        id: d.id,
        ...d.data()
    }));
}

// ===================== المنتجات =====================
export const loadProducts = () => getCollection('products');

export const addProduct = (data) =>
    addDoc(collection(db, 'products'), data);

export const deleteProduct = (id) =>
    deleteDoc(doc(db, 'products', id));

// ===================== الطلبات =====================
export const loadOrders = () => getCollection('orders');

export const addOrder = (data) =>
    addDoc(collection(db, 'orders'), data);

export const deleteOrder = (id) =>
    deleteDoc(doc(db, 'orders', id));

export const updateOrderStatus = (id, status) =>
    updateDoc(doc(db, 'orders', id), { status });

// ===================== العملاء =====================
export const loadCustomers = () => getCollection('customers');  // ✅ أضف هذا

export const addCustomer = (data) =>
    addDoc(collection(db, 'customers'), data);  // ✅ أضف هذا

export const deleteCustomer = (id) =>
    deleteDoc(doc(db, 'customers', id));  // ✅ أضف هذا

export const updateCustomer = (id, data) =>
    updateDoc(doc(db, 'customers', id), data);  // ✅ أضف هذا (اختياري)

// ===================== الإعدادات =====================
export async function getSettings(id) {
    const d = await getDoc(doc(db, 'settings', id));
    return d.exists() ? d.data() : null;
}

export const setSettings = (id, data) =>
    setDoc(doc(db, 'settings', id), data, { merge: true });

// تصدير الأساسيات
export {
    db,
    collection,
    addDoc,
    doc,
    getDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    setDoc
};
