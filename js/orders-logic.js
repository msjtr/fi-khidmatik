// orders-logic.js
import { db } from './firebase-config.js'; // تأكد من استيراد db
import { collection, getDocs, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// دالة جلب الطلبات
export async function getOrders() {
    try {
        const snap = await getDocs(collection(db, "orders"));
        return snap.docs.map(doc => {
            const data = doc.data();
            const firstItem = (data.items && data.items.length > 0) ? data.items[0] : {};
            
            return {
                id: doc.id,
                approvalCode: data.approvalCode || "N/A",
                orderNumber: data.orderNumber || "KF-000",
                customerName: data.customerName || "عميل منصة تيرا",
                packageName: firstItem.name || "باقة غير محددة",
                price: data.total || 0,
                paymentMethod: data.paymentMethodName || "تمارا",
                status: data.status || "مكتمل",
                ...data 
            };
        });
    } catch (e) {
        console.error("Error fetching orders:", e);
        return [];
    }
}

// --- الدالة المفقودة التي سببت الخطأ ---
export async function deleteOrder(orderId) {
    try {
        const orderRef = doc(db, "orders", orderId);
        await deleteDoc(orderRef);
        console.log(`Order ${orderId} deleted successfully`);
        return true;
    } catch (e) {
        console.error("Error deleting order:", e);
        return false;
    }
}

// دالة التنبيه (Toast)
export function showToast(message, type = "success") {
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.innerText = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add("show");
    }, 100);

    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}
