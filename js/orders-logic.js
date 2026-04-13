// orders-logic.js
import { db } from './firebase.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export { db };

export async function loadOrders() {
    try {
        // 1. جلب المجموعات الثلاث في وقت واحد (للسرعة)
        const [ordersSnap, customersSnap, productsSnap] = await Promise.all([
            getDocs(collection(db, "orders")),
            getDocs(collection(db, "customers")),
            getDocs(collection(db, "products"))
        ]);

        // 2. تحويل العملاء والمنتجات إلى خرائط (Maps) لسهولة البحث بداخلهم
        const customersMap = {};
        customersSnap.forEach(d => customersMap[d.id] = d.data());

        const productsMap = {};
        productsSnap.forEach(d => productsMap[d.id] = d.data());

        // 3. معالجة الطلبات وربطها بالبيانات الأخرى
        return ordersSnap.docs.map(doc => {
            const order = { id: doc.id, ...doc.data() };
            const customer = customersMap[order.customerId] || {};

            // دمج تفاصيل إضافية من مجموعة المنتجات الأصلية لكل عنصر في الطلب
            const enrichedItems = (order.items || []).map(item => {
                const originalProduct = productsMap[item.productId] || {};
                return {
                    ...item,
                    originalCategory: originalProduct.category || 'عام', // مثال لبيانات من مجموعة المنتجات
                    stockStatus: originalProduct.stock || 'متوفر'
                };
            });

            return {
                ...order,
                items: enrichedItems,
                customerFullName: customer.name || 'عميل غير مسجل',
                customerPhone: customer.phone || '---',
                customerAddress: `${customer.city || ''} - ${customer.district || ''}`,
                customerEmail: customer.email || ''
            };
        });

    } catch (e) {
        console.error("خطأ في الربط الشامل للبيانات:", e);
        return [];
    }
}
