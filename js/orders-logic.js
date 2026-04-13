import { db } from './firebase.js';
import { 
    collection, addDoc, getDocs, doc, deleteDoc, updateDoc, serverTimestamp, query, orderBy 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/**
 * توليد رقم الطلب بتنسيق احترافي: KF-000-PO-XXXXXX
 */
export const generateOrderID = () => `KF-000-PO-${Math.floor(100000 + Math.random() * 900000)}`;

/**
 * توليد باركود رقمي فريد للمنتجات (13 رقم متوافق مع المعايير الدولية)
 */
export const generateBarcode = () => `${Math.floor(1000000000000 + Math.random() * 9000000000000)}`;

/**
 * جلب البيانات مع الربط الشامل (Orders + Customers)
 */
export const fetchFullData = async () => {
    try {
        const [oSnap, cSnap] = await Promise.all([
            getDocs(query(collection(db, "orders"), orderBy("createdAt", "desc"))),
            getDocs(collection(db, "customers"))
        ]);

        const customers = Object.fromEntries(cSnap.docs.map(d => [d.id, { id: d.id, ...d.data() }]));

        return oSnap.docs.map(doc => {
            const data = doc.data();
            const customer = customers[data.customerId] || data.customerData || {};
            
            let displayDate = "---";
            if (data.orderDate) {
                displayDate = data.orderDate;
            } else if (data.createdAt) {
                const dateObj = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
                displayDate = dateObj.toLocaleDateString('ar-SA');
            }

            return { 
                id: doc.id, 
                ...data, 
                customerName: customer.name || data.customerName || "عميل سابق",
                date: displayDate
            };
        });
    } catch (e) { 
        console.error("خطأ في جلب البيانات:", e); 
        return []; 
    }
};

/**
 * جلب قائمة العملاء (لاستخدامها في قائمة الاختيار Select)
 */
export const fetchCustomers = async () => {
    try {
        const snap = await getDocs(collection(db, "customers"));
        return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) { return []; }
};

/**
 * حفظ البيانات (طلبات، عملاء، منتجات)
 */
export const saveData = async (col, data) => {
    try {
        return await addDoc(collection(db, col), { 
            ...data, 
            createdAt: serverTimestamp() 
        });
    } catch (e) {
        console.error(`خطأ أثناء الحفظ في ${col}:`, e);
        throw e;
    }
};

/**
 * حذف مستند
 */
export const deleteDocFromCol = async (col, id) => {
    try {
        await deleteDoc(doc(db, col, id));
        return { success: true };
    } catch (e) { return { success: false }; }
};

/**
 * تحديث حالة الطلب
 */
export const updateOrderStatus = async (orderId, newStatus) => {
    try {
        const orderRef = doc(db, "orders", orderId);
        await updateDoc(orderRef, { status: newStatus });
        return { success: true };
    } catch (e) { return { success: false }; }
};
