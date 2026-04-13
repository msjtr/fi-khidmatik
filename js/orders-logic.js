// orders-logic.js
import { db } from './firebase.js'; 
import { collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 1. جلب كافة الطلبات
export async function getOrders() {
    try {
        const snap = await getDocs(collection(db, "orders"));
        return snap.docs.map(doc => ({
            id: doc.id,
            ...doc.data() // سيجلب كل الحقول الموجودة في الفايربيز مهما كان اسمها
        }));
    } catch (e) {
        console.error("خطأ في جلب الطلبات:", e);
        return [];
    }
}

// 2. جلب كافة العملاء
export async function getCustomers() {
    try {
        const snap = await getDocs(collection(db, "customers"));
        return snap.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (e) {
        console.error("خطأ في جلب العملاء:", e);
        return [];
    }
}

// 3. جلب كافة المنتجات
export async function getProducts() {
    try {
        const snap = await getDocs(collection(db, "products"));
        return snap.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (e) {
        console.error("خطأ في جلب المنتجات:", e);
        return [];
    }
}
