/**
 * customers-core.js - Tera Gateway
 * المحرك الرئيسي لإدارة مجموعة 'customers'
 * تم التحديث لدعم كافة الحقول ونظام السجلات (Logs)
 */

import { db } from '../core/firebase.js'; 
import { 
    collection, 
    getDocs, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    doc, 
    getDoc, 
    query, 
    orderBy, 
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// المراجع الرئيسية
const customersRef = collection(db, "customers");
const logsRef = collection(db, "system_logs"); // مرجع سجل العمليات

/**
 * جلب جميع العملاء مرتبين بالأحدث
 */
export async function fetchAllCustomers() {
    try {
        console.log("🔄 جاري طلب بيانات العملاء من تيرا...");
        
        // الترتيب حسب تاريخ الإنشاء لضمان ظهور أحدث العملاء أولاً
        const q = query(customersRef, orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        
        return snapshot;
    } catch (error) {
        console.warn("⚠️ فشل الترتيب (قد يحتاج إلى Index في Firestore):", error.message);
        // Fallback في حال عدم وجود فهرس: جلب البيانات ثم ترتيبها برمجياً
        return await getDocs(customersRef);
    }
}

/**
 * جلب بيانات عميل واحد بواسطة المعرف (ID)
 */
export async function fetchCustomerById(id) {
    if (!id) return null;
    try {
        const docRef = doc(db, "customers", id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        }
        return null;
    } catch (error) {
        console.error("❌ خطأ في fetchCustomerById:", error);
        return null;
    }
}

/**
 * إضافة عميل جديد (مع دعم الـ 17 حقلاً)
 */
export async function addCustomer(customerData) {
    try {
        const payload = {
            ...customerData,
            createdAt: new Date().toISOString(),
            system_origin: "Tera Gateway",
            region: "Hail", // المنطقة الافتراضية
            lastAction: "إنشاء ملف"
        };
        
        const docRef = await addDoc(customersRef, payload);
        
        // تسجيل العملية في السجل
        await logOperation('إضافة عميل', customerData.name, 'ناجحة');
        
        return docRef;
    } catch (error) {
        console.error("❌ فشل addCustomer:", error);
        await logOperation('إضافة عميل', customerData.name || 'غير معروف', 'فاشلة: ' + error.message);
        throw error;
    }
}

/**
 * تحديث بيانات عميل موجود
 */
export async function updateCustomer(id, updatedData) {
    try {
        const docRef = doc(db, "customers", id);
        await updateDoc(docRef, {
            ...updatedData,
            updatedAt: serverTimestamp(),
            lastAction: "تحديث بيانات"
        });

        await logOperation('تعديل عميل', updatedData.name || id, 'ناجحة');
        return true;
    } catch (error) {
        console.error("❌ فشل updateCustomer:", error);
        throw error;
    }
}

/**
 * حذف عميل نهائياً
 */
export async function removeCustomer(id) {
    try {
        // جلب الاسم قبل الحذف للتوثيق في السجل
        const customer = await fetchCustomerById(id);
        const name = customer ? customer.name : id;

        const docRef = doc(db, "customers", id);
        await deleteDoc(docRef);

        await logOperation('حذف عميل', name, 'ناجحة');
        return true;
    } catch (error) {
        console.error("❌ فشل removeCustomer:", error);
        return false;
    }
}

/**
 * نظام تسجيل العمليات (System Logs)
 * يسجل من قام بالفعل، نوع الفعل، والنتيجة
 */
export async function logOperation(actionType, targetName, status) {
    try {
        await addDoc(logsRef, {
            action: actionType,
            target: targetName,
            status: status,
            timestamp: serverTimestamp(),
            admin: "مدير النظام" // يمكن ربطها لاحقاً بـ Auth
        });
    } catch (e) {
        console.error("⚠️ فشل تسجيل العملية في السجلات:", e);
    }
}
