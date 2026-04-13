import { db } from './firebase.js';
import { 
    collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy, serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 1. توليد أرقام تلقائية
export const generateOrderNumber = () => `KF-000-PO-${Math.floor(100000 + Math.random() * 900000)}`;
export const generateBarcode = () => `BR-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

// 2. جلب البيانات (الربط الشامل)
export const fetchHistory = async () => {
    try {
        const [oSnap, cSnap] = await Promise.all([
            getDocs(collection(db, "orders")),
            getDocs(collection(db, "customers"))
        ]);
        const customers = Object.fromEntries(cSnap.docs.map(d => [d.id, {id: d.id, ...d.data()}]));
        return oSnap.docs.map(doc => {
            const data = doc.data();
            const customer = customers[data.customerId] || data.customerData || {};
            return { id: doc.id, ...data, customerName: customer.name || "عميل سابق" };
        });
    } catch (e) { console.error(e); return []; }
};

// 3. دوال الحفظ والحذف
export const saveToFirebase = async (col, data) => await addDoc(collection(db, col), { ...data, createdAt: serverTimestamp() });
export const deleteFromFirebase = async (id) => await deleteDoc(doc(db, "orders", id));
