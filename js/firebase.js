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
    addDoc(collection(db, 'orders'), {
        ...data,
        createdAt: new Date().toISOString(),
        status: data.status || 'جديد'
    });

export const updateOrder = (id, data) =>
    updateDoc(doc(db, 'orders', id), data);

export const deleteOrder = (id) =>
    deleteDoc(doc(db, 'orders', id));

// ===================== جلب الطلبات مع بيانات العميل =====================
export const getOrdersWithCustomers = async () => {
    const orders = await getCollection('orders');
    const customers = await loadCustomers();
    const customersMap = {};
    customers.forEach(c => {
        customersMap[c.id] = c;
    });

    return orders.map(order => ({
        ...order,
        customer: customersMap[order.customerId] || { 
            name: order.customer || 'غير معروف',
            phone: '',
            email: ''
        }
    }));
};

// ===================== العملاء =====================
export const loadCustomers = () => getCollection('customers');

export const addCustomer = (data) =>
    addDoc(collection(db, 'customers'), {
        ...data,
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
    });

export const updateCustomer = (id, data) =>
    updateDoc(doc(db, 'customers', id), {
        ...data,
        updatedAt: new Date().toISOString()
    });

export const deleteCustomer = (id) =>
    deleteDoc(doc(db, 'customers', id));

// ===================== الإعدادات =====================
export async function getSettings(id) {
    const d = await getDoc(doc(db, 'settings', id));
    return d.exists() ? d.data() : null;
}

export const setSettings = (id, data) =>
    setDoc(doc(db, 'settings', id), data, { merge: true });

// ===================== تصدير كل شيء =====================
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
