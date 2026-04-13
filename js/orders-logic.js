import { db } from './orders-firebase-db.js';
import { collection, getDocs, query, orderBy, doc, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

// جلب الطلبات من مجموعة orders لضمان ظهور بياناتك القديمة
export async function getOrders() {
    try {
        const colRef = collection(db, "orders");
        const snap = await getDocs(colRef);
        return snap.docs.map(doc => ({
            id: doc.id,
            customerName: doc.data().customerName || doc.data().name || "عميل سابق",
            phone: doc.data().phone || "000",
            price: doc.data().price || 0,
            packageName: doc.data().packageName || "طلب سابق",
            orderNumber: doc.data().orderNumber || "KF-000-P",
            ...doc.data()
        }));
    } catch (e) {
        console.error("خطأ في جلب الطلبات:", e);
        return [];
    }
}

// جلب المخزون من مجموعة products
export async function getStock() {
    const snap = await getDocs(collection(db, "products"));
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// حذف طلب
export async function deleteOrder(id) {
    if(confirm("هل تريد حذف هذا الطلب نهائياً؟")) {
        await deleteDoc(doc(db, "orders", id));
        return true;
    }
    return false;
}

export function toast(msg, type = 'success') {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.className = `fixed bottom-6 left-6 z-50 px-6 py-3 rounded-xl text-white font-bold transition-all ${type === 'error' ? 'bg-red-500' : 'bg-green-600'}`;
    t.style.display = 'block';
    setTimeout(() => t.style.display = 'none', 3000);
}
