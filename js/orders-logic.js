// js/orders-logic.js
import { db } from './orders-firebase-db.js';
import { collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

// حساب إجمالي الطلب
export function calculateTotals(products, discount = 0, type = 'fixed') {
    const subtotal = products.reduce((acc, p) => acc + (p.price * p.quantity), 0);
    const discountAmount = type === 'percent' ? (subtotal * discount / 100) : discount;
    const tax = (subtotal - discountAmount) * 0.15; // ضريبة 15%
    return {
        subtotal,
        tax,
        total: (subtotal - discountAmount) + tax
    };
}

// جلب الطلبات من الفايربيز
export async function getOrders() {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// إظهار تنبيه
export function toast(msg, type = 'success') {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.className = type;
    t.style.display = 'block';
    setTimeout(() => t.style.display = 'none', 3000);
}
