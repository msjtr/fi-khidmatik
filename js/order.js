/**
 * مدير الطلبات - موديول جلب البيانات من Firestore
 */
export const OrderManager = {
    // دالة داخلية لجلب المستندات من Firestore
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
            
            // في حال نجاح الجلب، نقوم بدمج البيانات لضمان عدم فقدان أي حقل عنوان
            return {
                order: orderRes,
                customer: customerRes.success ? {
                    ...customerRes,
                    // ضمان وجود الحقول حتى لو كانت فارغة لتجنب أخطاء الـ undefined في الطباعة
                    buildingNumber: customerRes.buildingNumber || customerRes.building_number || "---",
                    additionalNumber: customerRes.additionalNumber || customerRes.additional_number || "---",
                    postalCode: customerRes.postalCode || customerRes.postal_code || "---",
                    city: customerRes.city || "---",
                    district: customerRes.district || "---",
                    street: customerRes.street || "---"
                } : { 
                    name: "عميل زائر", 
                    phone: orderRes.customerPhone || "---",
                    email: "---",
                    city: "غير محدد",
                    buildingNumber: "---",
                    additionalNumber: "---",
                    postalCode: "---"
                }
            };
        } catch (error) {
            console.error("خطأ حرج في جلب تفاصيل الطلب:", error);
            return null;
        }
    },

    // تنسيق التاريخ والوقت ليناسب الفاتورة
    formatDateTime(timestamp) {
        if (!timestamp) return { date: '---', time: '---' };
        
        try {
            // التعامل مع Firebase Timestamp أو Date عادي
            const d = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
            
            // التحقق من أن التاريخ صالح
            if (isNaN(d.getTime())) throw new Error("Invalid Date");

            return {
                date: d.toLocaleDateString('en-GB'), // تنسيق يوم/شهر/سنة
                time: d.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit', hour12: true })
            };
        } catch (e) {
            return { date: '---', time: '---' };
        }
    }
};
