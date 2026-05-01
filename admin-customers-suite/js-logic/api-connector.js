/**
 * نظام Tera V12 - الموصل المركزي (API Connector)
 * مؤسسة الإتقان بلس | حائل
 */

// 1. استيراد الإعدادات والخدمات من الملف الأساسي
import { db, auth, storage, COLLECTIONS } from './firebase.js';

export const APIConnector = {
    /**
     * جلب بيانات عميل واحد بواسطة الرقم القومي
     */
    async getCustomerById(nationalId) {
        try {
            const querySnapshot = await db.collection(COLLECTIONS.customers)
                .where("nationalId", "==", nationalId)
                .limit(1)
                .get();

            if (querySnapshot.empty) return null;
            
            return { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() };
        } catch (error) {
            this.handleError("getCustomerById", error);
            return null;
        }
    },

    /**
     * تحديث بيانات عميل موجود في نظام الإتقان بلس
     */
    async updateCustomer(docId, updatedData) {
        try {
            await db.collection(COLLECTIONS.customers).doc(docId).update({
                ...updatedData,
                lastEditAt: new Date(),
                editedBy: "أبا صالح الشمري"
            });
            
            if (window.LogTracker) {
                await window.LogTracker.logAction("تحديث عميل", `تم تعديل بيانات الوثيقة: ${docId}`);
            }
            return true;
        } catch (error) {
            this.handleError("updateCustomer", error);
            return false;
        }
    },

    /**
     * أرشفة عميل (تغيير الحالة لضمان حفظ سجلات حائل)
     */
    async archiveCustomer(docId) {
        return await this.updateCustomer(docId, { status: "مؤرشف" });
    },

    /**
     * جلب كافة إحصائيات النظام الحية
     */
    async fetchSystemStats() {
        try {
            const snapshot = await db.collection(COLLECTIONS.customers).get();
            return {
                count: snapshot.size,
                timestamp: new Date()
            };
        } catch (error) {
            this.handleError("fetchSystemStats", error);
            return { count: 0 };
        }
    },

    /**
     * معالج الأخطاء المركزي
     */
    handleError(source, error) {
        console.error(`❌ Tera API Error [${source}]:`, error.message);
        if (window.LogTracker) {
            window.LogTracker.logError(`API-${source}`, error.message);
        }
    }
}; // إغلاق الكائن الرئيسي

// تصدير افتراضي لسهولة الاستخدام في الموديولات الأخرى
export default APIConnector;
