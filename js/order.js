import { db } from './firebase.js';
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/**
 * مدير الطباعة - النسخة المطابقة لهيكلة البيانات الهجينة (قديم + جديد)
 */
export const OrderManager = {
    // 1. جلب المستند باستخدام النسخة الحديثة SDK v10
    async fetchDoc(col, id) {
        if (!id) return { success: false };
        try {
            const docRef = doc(db, col, id);
            const snap = await getDoc(docRef);
            return snap.exists() ? { id: snap.id, ...snap.data(), success: true } : { success: false };
        } catch (e) {
            console.error(`Fetch Error in ${col}:`, e);
            return { success: false };
        }
    },

    // 2. جلب التفاصيل الكاملة مع الربط الذكي
    async getOrderFullDetails(orderId) {
        try {
            const orderRes = await this.fetchDoc('orders', orderId);
            if (!orderRes.success) return null;

            // جلب بيانات العميل (سواء من ID أو بيانات مخزنة داخل الطلب)
            let customerRes = { success: false };
            if (orderRes.customerId) {
                customerRes = await this.fetchDoc('customers', orderRes.customerId);
            }
            
            // دالة مطابقة المسميات (لحل مشكلة اختلاف المسميات بين القديم والجديد)
            const getField = (obj1, obj2, keys) => {
                for (let key of keys) {
                    if (obj1 && obj1[key]) return obj1[key];
                    if (obj2 && obj2[key]) return obj2[key];
                }
                return "---";
            };

            return {
                order: orderRes,
                customer: {
                    name: orderRes.customerName || customerRes.name || orderRes.customerData?.name || "عميل زائر",
                    phone: orderRes.customerPhone || customerRes.phone || orderRes.customerData?.phone || "---",
                    city: orderRes.deliveryCity || customerRes.city || orderRes.customerData?.address || "---",
                    district: orderRes.deliveryDistrict || customerRes.district || "---",
                    street: getField(orderRes, customerRes, ['deliveryStreet', 'quickStreet', 'street', 'address_street']),
                    buildingNumber: getField(orderRes, customerRes, ['deliveryBuildingNo', 'quickBuildingNo', 'buildingNumber']),
                    postalCode: getField(orderRes, customerRes, ['deliveryPoBox', 'postalCode', 'postal_code'])
                },
                // معالجة المنتجات (Array)
                items: orderRes.items || []
            };
        } catch (error) {
            console.error("خطأ في معالجة بيانات الطباعة:", error);
            return null;
        }
    },

    // 3. تنسيق التاريخ والوقت
    formatDateTime(data) {
        // إذا كان التاريخ مخزن كنص (بياناتك القديمة)
        if (typeof data.createdAt === 'string') {
            const d = new Date(data.createdAt);
            return {
                date: d.toLocaleDateString('ar-SA'),
                time: d.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
            };
        }
        // إذا كان مخزن كـ Firebase Timestamp
        if (data.createdAt?.toDate) {
            const d = data.createdAt.toDate();
            return {
                date: d.toLocaleDateString('ar-SA'),
                time: d.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
            };
        }
        return { date: data.orderDate || '---', time: data.orderTime || '---' };
    }
};

// تشغيل جلب البيانات فور تحميل الصفحة إذا كان هناك ID في الرابط
const urlParams = new URLSearchParams(window.location.search);
const orderId = urlParams.get('id');

if (orderId) {
    OrderManager.getOrderFullDetails(orderId).then(fullData => {
        if (fullData) {
            console.log("بيانات الفاتورة جاهزة:", fullData);
            // هنا تضع دوال تعبئة HTML بالبيانات (مثل document.getElementById().innerText)
            renderInvoice(fullData);
        }
    });
}

function renderInvoice(data) {
    // مثال لتعبئة البيانات في صفحة الطباعة
    if(document.getElementById('printOrderNo')) {
        document.getElementById('printOrderNo').innerText = data.order.orderNumber || data.order.orderNo;
        document.getElementById('printCustomerName').innerText = data.customer.name;
        // ... أكمل باقي الحقول بنفس الطريقة
    }
}
