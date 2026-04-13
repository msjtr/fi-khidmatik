import { db } from './firebase.js';
import { collection, addDoc, getDocs, doc, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 1. توليد بيانات الطلب التلقائية
export const generateOrderMeta = () => {
    const sequence = Math.floor(1000 + Math.random() * 9000);
    return {
        orderId: `KF-000-PO-${sequence}`,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    };
};

// 2. توليد باركود تلقائي للمنتج
export const generateBarcode = () => 'BR-' + Math.random().toString(36).substr(2, 9).toUpperCase();

// 3. جلب البيانات من المجموعات (Customers, Products, Orders)
export const fetchCollection = async (collectionName) => {
    try {
        const q = query(collection(db, collectionName));
        const snap = await getDocs(q);
        return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
        console.error("خطأ في جلب البيانات:", e);
        return [];
    }
};

// 4. حسابات الفاتورة (الضريبة 15%)
export const calculateFinalTotals = (items, discount = 0) => {
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const taxBase = subtotal - discount;
    const vat = taxBase * 0.15;
    return {
        subtotal: subtotal.toFixed(2),
        vat: vat.toFixed(2),
        total: (taxBase + vat).toFixed(2)
    };
};

// 5. حفظ الطلب في Firebase
export const saveOrderToFirebase = async (orderData) => {
    return await addDoc(collection(db, "orders"), orderData);
};
