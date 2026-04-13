import { db } from './firebase.js';
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/**
 * جلب كافة الطلبات مع معالجة ذكية للترتيب
 */
export async function fetchFullData() {
    try {
        const ordersRef = collection(db, "orders");
        // جلب البيانات (بدون orderBy في البداية لضمان وصول الطلبات القديمة التي تفتقر لحقل التاريخ)
        const querySnapshot = await getDocs(ordersRef);
        
        let allOrders = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // ترتيب البيانات يدوياً لضمان عدم ضياع أي طلب قديم
        return allOrders.sort((a, b) => {
            const dateA = new Date(a.orderDate || 0);
            const dateB = new Date(b.orderDate || 0);
            return dateB - dateA; // من الأحدث للأقدم
        });

    } catch (error) {
        console.error("خطأ أثناء جلب البيانات:", error);
        return [];
    }
}

/**
 * حفظ طلب جديد مع إضافة طابع زمني تلقائي
 */
export async function saveData(collName, data) {
    try {
        // إضافة timestamp لضمان الترتيب في المستقبل
        const dataWithTimestamp = {
            ...data,
            createdAt: serverTimestamp(), 
            lastUpdated: serverTimestamp()
        };
        const docRef = await addDoc(collection(db, collName), dataWithTimestamp);
        return docRef;
    } catch (error) {
        throw new Error("فشل حفظ البيانات في Firestore: " + error.message);
    }
}

/**
 * توليد رقم طلب احترافي يبدأ بـ TR
 */
export function generateOrderID() {
    // استخدام التاريخ مع الرقم العشوائي لضمان عدم التكرار نهائياً
    const datePart = new Date().toISOString().slice(2,10).replace(/-/g, '');
    const randomPart = Math.floor(1000 + Math.random() * 9000);
    return `TR-${datePart}-${randomPart}`;
}

/**
 * توليد SKU للمنتجات
 */
export function generateSKU() {
    return 'SKU-' + Math.random().toString(36).substr(2, 6).toUpperCase();
}
