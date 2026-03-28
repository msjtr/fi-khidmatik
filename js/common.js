import {
    db,
    collection,
    addDoc,
    doc,
    getDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    setDoc
} from './firebase.js';

export async function getCollection(name) {
    const snap = await getDocs(collection(db, name));import {
    db,
    collection,
    addDoc,
    doc,
    getDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    setDoc
} from './firebase.js';

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

// ===================== الطلبات (مهم جداً) =====================

// جلب الطلبات
export const loadOrders = () => getCollection('orders');

// إضافة طلب (متوافق مع بياناتك الحالية)
export const addOrder = (data) =>
    addDoc(collection(db, 'orders'), data);

// حذف طلب
export const deleteOrder = (id) =>
    deleteDoc(doc(db, 'orders', id));

// تحديث حالة الطلب
export const updateOrderStatus = (id, status) =>
    updateDoc(doc(db, 'orders', id), { status });

// ===================== الإعدادات =====================

export async function getSettings(id) {
    const d = await getDoc(doc(db, 'settings', id));
    return d.exists() ? d.data() : null;
}

export const setSettings = (id, data) =>
    setDoc(doc(db, 'settings', id), data, { merge: true });
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// منتجات
export const loadProducts = () => getCollection('products');

export const addProduct = (data) =>
    addDoc(collection(db, 'products'), data);

export const deleteProduct = (id) =>
    deleteDoc(doc(db, 'products', id));
