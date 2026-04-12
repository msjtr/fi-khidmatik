/**
 * مدير الطلبات - موديول جلب البيانات من Firestore
 */
export const OrderManager = {
    // دالة داخلية لجلب المستندات لضمان عدم حدوث خطأ "getDocument is not defined"
    async getDocument(col, id) {
        if (!window.db) {
            throw new Error("قاعدة البيانات غير مهيأة بعد (window.db)");
        }
        try {
            const snap = await window.db.collection(col).doc(id).get();
            return snap.exists ? { id: snap.id, ...snap.data(), success: true } : { success: false };
        } catch (e) {
            console.error(`خطأ في جلب البيانات من ${col}:`, e);
            return { success: false, error: e.message };
        }
    },

    // جلب تفاصيل الطلب والعميل معاً
    async getOrderFullDetails(orderId) {
        try {
            const orderRes = await this.getDocument('orders', orderId);
            if (!orderRes.success) return null;

            // جلب بيانات العميل بناءً على المعرف الموجود في الطلب
            const customerRes = await this.getDocument('customers', orderRes.customerId);
            
            return {
                order: orderRes,
                customer: customerRes.success ? customerRes : { 
                    name: "عميل زائر", 
                    phone: orderRes.customerPhone || "---",
                    email: "---",
                    city: "غير محدد"
                }
            };
        } catch (error) {
            console.error("خطأ حرج في جلب تفاصيل الطلب:", error);
            return null;
        }
    },

    // تنسيق التاريخ والوقت
    formatDateTime(timestamp) {
        if (!timestamp) return { date: '---', time: '---' };
        // التعامل مع Firebase Timestamp أو Date عادي
        const d = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return {
            date: d.toLocaleDateString('ar-SA'),
            time: d.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
        };
    }
};
