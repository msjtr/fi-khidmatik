// js/orders-logic.js
import { db } from './orders-firebase-db.js';
import { collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

// حساب إجمالي الطلب لعمليات منصة تيرا
export function calculateTotals(products, discount = 0, type = 'fixed') {
    const subtotal = products.reduce((acc, p) => acc + (p.price * p.quantity), 0);
    const discountAmount = type === 'percent' ? (subtotal * discount / 100) : discount;
    const tax = (subtotal - discountAmount) * 0.15; // الضريبة المعتمدة 15%
    return {
        subtotal,
        tax,
        total: (subtotal - discountAmount) + tax
    };
}

// جلب الطلبات مع معالجة الأخطاء
export async function getOrders() {
    try {
        const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("فشل جلب الطلبات:", error);
        return [];
    }
}

// إظهار تنبيه يتوافق مع تصميم CSS الخاص بنا
export function toast(msg, type = 'success') {
    const t = document.getElementById('toast');
    if (!t) return;

    t.textContent = msg;
    // إضافة الكلاسات اللازمة للتنسيق والظهور
    t.className = `shadow-2xl transition-all duration-300 transform ${type}`;
    t.style.display = 'block';
    
    // إخفاء التنبيه بعد 3 ثوانٍ
    setTimeout(() => {
        t.style.display = 'none';
    }, 3000);
}
