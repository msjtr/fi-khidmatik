import { db } from './firebase.js';
import { 
    collection, addDoc, getDocs, doc, deleteDoc, serverTimestamp, query, orderBy 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// توليد المعرفات الاحترافية
export const generateOrderID = () => `KF-000-PO-${Date.now().toString().slice(-6)}`;
export const generateBarcode = () => `BR-${Math.floor(100000000 + Math.random() * 900000000)}`;

// جلب البيانات مع الربط الكامل للماضي والحاضر
export const fetchFullData = async () => {
    try {
        const [oSnap, cSnap, pSnap] = await Promise.all([
            getDocs(query(collection(db, "orders"), orderBy("createdAt", "desc"))),
            getDocs(collection(db, "customers")),
            getDocs(collection(db, "products"))
        ]);

        const customers = Object.fromEntries(cSnap.docs.map(d => [d.id, {id: d.id, ...d.data()}]));
        const products = Object.fromEntries(pSnap.docs.map(d => [d.id, {id: d.id, ...d.data()}]));

        return oSnap.docs.map(doc => {
            const data = doc.data();
            const customer = customers[data.customerId] || data.customerData || {};
            return { id: doc.id, ...data, 
                customerName: customer.name || data.customerName || "عميل سابق",
                date: data.orderDate || new Date(data.createdAt?.toDate()).toLocaleDateString('ar-SA')
            };
        });
    } catch (e) { console.error("Error Fetching:", e); return []; }
};

export const saveData = async (col, data) => {
    return await addDoc(collection(db, col), { ...data, createdAt: serverTimestamp() });
};
