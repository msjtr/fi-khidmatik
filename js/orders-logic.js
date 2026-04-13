import { db } from './firebase.js';
import { 
    collection, addDoc, getDocs, doc, updateDoc, deleteDoc, getDoc, query, orderBy 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 1. توليد رقم الطلب والباركود
export const generateId = (prefix) => `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;
export const generateOrderNumber = () => `KF-000-PO-${Date.now().toString().slice(-6)}`;

// 2. جلب البيانات مع الربط (الجلب الكامل)
export const fetchHistory = async () => {
    const [oSnap, cSnap, pSnap] = await Promise.all([
        getDocs(collection(db, "orders")),
        getDocs(collection(db, "customers")),
        getDocs(collection(db, "products"))
    ]);

    const customers = Object.fromEntries(cSnap.docs.map(d => [d.id, {id: d.id, ...d.data()}]));
    const products = Object.fromEntries(pSnap.docs.map(d => [d.id, {id: d.id, ...d.data()}]));

    return oSnap.docs.map(doc => {
        const data = doc.data();
        const customer = customers[data.customerId] || data.customerData || {};
        return {
            id: doc.id,
            ...data,
            customerName: customer.name || data.customerName || "عميل سابق",
            displayDate: data.orderDate || new Date(data.createdAt).toLocaleDateString('ar-SA')
        };
    });
};

// 3. حفظ البيانات
export const saveDoc = async (col, data) => {
    return await addDoc(collection(db, col), { ...data, createdAt: new Date().toISOString() });
};

// 4. حذف وتعديل
export const deleteOrder = async (id) => await deleteDoc(doc(db, "orders", id));
