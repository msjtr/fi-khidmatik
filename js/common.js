// استيراد من firebase.js فقط
import {
    db,
    collection,
    addDoc,
    doc,
    getDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    setDoc,
    getCollection,
    loadProducts,
    addProduct,
    deleteProduct,
    loadOrders,
    addOrder,
    deleteOrder,
    updateOrderStatus,
    getSettings,
    setSettings
} from './firebase.js';

// إعادة تصدير للاستخدام في الملفات الأخرى
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
    getCollection,
    loadProducts,
    addProduct,
    deleteProduct,
    loadOrders,
    addOrder,
    deleteOrder,
    updateOrderStatus,
    getSettings,
    setSettings
};
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

// ===================== الإعدادات =====================
export async function getSettings(id) {
    const d = await getDoc(doc(db, 'settings', id));
    return d.exists() ? d.data() : null;
}

export const setSettings = (id, data) =>
    setDoc(doc(db, 'settings', id), data, { merge: true });
