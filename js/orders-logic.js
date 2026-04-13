import { db } from './orders-firebase-db.js';
import { collection, getDocs, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

// جلب شامل لكل الطلبات من مجموعة orders
export async function getOrders() {
    try {
        const snap = await getDocs(collection(db, "orders"));
        return snap.docs.map(doc => {
            const data = doc.data();
            // الكود هنا ذكي: يبحث عن أي مسمى للاسم أو السعر موجود في بياناتك القديمة
            return {
                id: doc.id,
                customerName: data.customerName || data.name || data.client || "اسم غير مسجل",
                price: data.price || data.amount || data.total || 0,
                packageName: data.packageName || data.product || data.item || "باقة سابقة",
                orderNumber: data.orderNumber || data.id || "KF-OLD",
                phone: data.phone || data.mobile || "لا يوجد رقم",
                paymentMethod: data.paymentMethod || "غير محدد",
                ...data // جلب بقية البيانات أياً كانت
            };
        });
    } catch (e) {
        console.error("خطأ في جلب المجموعات:", e);
        return [];
    }
}

// جلب المنتجات من مجموعة products
export async function getStock() {
    try {
        const snap = await getDocs(collection(db, "products"));
        return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) { return []; }
}

export async function deleteOrder(id) {
    if(confirm("هل تريد حذف هذا السجل نهائياً؟")) {
        await deleteDoc(doc(db, "orders", id));
        return true;
    }
    return false;
}

export function toast(msg, type = 'success') {
    const t = document.getElementById('toast');
    if(!t) return;
    t.textContent = msg;
    t.className = `fixed bottom-6 left-6 z-50 px-6 py-3 rounded-xl text-white font-bold ${type === 'error' ? 'bg-red-500' : 'bg-green-600'}`;
    t.style.display = 'block';
    setTimeout(() => t.style.display = 'none', 3000);
}
