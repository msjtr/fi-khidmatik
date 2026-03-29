// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-analytics.js";
import {
    getFirestore,
    collection,
    addDoc,
    doc,
    getDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    setDoc,
    deleteField
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBWYW6Qqlhh904pBeuJ29wY7Cyjm2uklBA",
    authDomain: "msjt301-974bb.firebaseapp.com",
    projectId: "msjt301-974bb",
    storageBucket: "msjt301-974bb.firebasestorage.app",
    messagingSenderId: "186209858482",
    appId: "1:186209858482:web:186ca610780799ef562aab",
    measurementId: "G-NDVGC9GPQZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

console.log("✅ Firebase Connected successfully");

// ===================== دالة عامة =====================
export async function getCollection(name) {
    try {
        const snap = await getDocs(collection(db, name));
        return snap.docs.map(d => ({
            id: d.id,
            ...d.data()
        }));
    } catch (error) {
        console.error(`خطأ في جلب مجموعة ${name}:`, error);
        throw error;
    }
}

// ===================== دوال المنتجات =====================
export const loadProducts = () => getCollection('products');
export const addProduct = (data) => addDoc(collection(db, 'products'), data);
export const updateProduct = (id, data) => updateDoc(doc(db, 'products', id), data);
export const deleteProduct = (id) => deleteDoc(doc(db, 'products', id));
export const updateProductStock = (id, newStock) => updateDoc(doc(db, 'products', id), { stock: newStock });

// ===================== دوال العملاء =====================
export const loadCustomers = () => getCollection('customers');
export const addCustomer = (data) => addDoc(collection(db, 'customers'), data);
export const updateCustomer = (id, data) => updateDoc(doc(db, 'customers', id), data);
export const deleteCustomer = (id) => deleteDoc(doc(db, 'customers', id));

// ===================== دوال الطلبات =====================
export const loadOrders = () => getCollection('orders');
export const addOrder = (data) => addDoc(collection(db, 'orders'), data);
export const updateOrder = (id, data) => updateDoc(doc(db, 'orders', id), data);
export const deleteOrder = (id) => deleteDoc(doc(db, 'orders', id));

export const getOrdersWithDetails = async () => {
    try {
        const orders = await getCollection('orders');
        const customers = await getCollection('customers');
        const products = await getCollection('products');
        
        const customersMap = Object.fromEntries(customers.map(c => [c.id, c]));
        const productsMap = Object.fromEntries(products.map(p => [p.id, p]));
        
        return orders.map(order => ({
            ...order,
            customer: customersMap[order.customerId] || { name: 'غير معروف' },
            items: order.items?.map(item => ({
                ...item,
                productDetails: productsMap[item.productId] || null
            })) || []
        }));
    } catch (error) {
        console.error('خطأ في جلب تفاصيل الطلبات:', error);
        throw error;
    }
};

// ===================== دوال الإعدادات =====================
export async function getSettings(id) {
    try {
        const d = await getDoc(doc(db, 'settings', id));
        return d.exists() ? d.data() : null;
    } catch (error) {
        console.error('خطأ في جلب الإعدادات:', error);
        throw error;
    }
}

export const setSettings = (id, data) => setDoc(doc(db, 'settings', id), data, { merge: true });

// ===================== تصدير الأساسيات =====================
export {
    db,
    collection,
    addDoc,
    doc,
    getDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    setDoc,
    deleteField,
    getCollection,
    loadProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    updateProductStock,
    loadCustomers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    loadOrders,
    addOrder,
    updateOrder,
    deleteOrder,
    getOrdersWithDetails,
    getSettings,
    setSettings
};
