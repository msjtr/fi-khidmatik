/**
 * مدير الطلبات - النسخة المطابقة لمسميات HTML (إدارة الطلبات)
 */
export const OrderManager = {
    async fetchDoc(col, id) {
        if (!window.db) return { success: false };
        try {
            const snap = await window.db.collection(col).doc(id).get();
            return snap.exists ? { id: snap.id, ...snap.data(), success: true } : { success: false };
        } catch (e) {
            console.error("Fetch Error:", e);
            return { success: false };
        }
    },

    async getOrderFullDetails(orderId) {
        try {
            const orderRes = await this.fetchDoc('orders', orderId);
            if (!orderRes.success) return null;

            const customerRes = await this.fetchDoc('customers', orderRes.customerId);
            
            // دالة مطابقة المسميات بناءً على كود HTML المرفق (id="deliveryStreet", id="quickStreet" etc)
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
                    name: customerRes.name || orderRes.customerName || "عميل زائر",
                    phone: customerRes.phone || orderRes.customerPhone || orderRes.deliveryPhone || "---",
                    city: customerRes.city || orderRes.deliveryCity || orderRes.quickCity || "---",
                    district: customerRes.district || "---",
                    
                    // تم التحديث بناءً على IDs الحقول في كودك:
                    // الشارع: deliveryStreet أو quickStreet
                    street: getField(customerRes, orderRes, ['street', 'deliveryStreet', 'quickStreet']),
                    
                    // الرقم الإضافي: deliveryAdditionalNo أو quickAdditionalNo
                    additionalNumber: getField(customerRes, orderRes, ['additionalNumber', 'deliveryAdditionalNo', 'quickAdditionalNo']),
                    
                    // الرمز البريدي أو صندوق البريد: deliveryPoBox أو quickPoBox
                    postalCode: getField(customerRes, orderRes, ['postalCode', 'deliveryPoBox', 'quickPoBox', 'postal_code'])
                }
            };
        } catch (error) {
            console.error("خطأ حرج:", error);
            return null;
        }
    },

    formatDateTime(timestamp) {
        if (!timestamp) return { date: '---', time: '---' };
        const d = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return {
            date: d.toLocaleDateString('en-GB'),
            time: d.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit', hour12: true })
        };
    }
};
