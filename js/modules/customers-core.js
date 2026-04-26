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
const logsRef = collection(db, "system_logs");

/**
 * جلب جميع العملاء
 * ملاحظة: تم استخدام catch للتعامل مع مشكلة الـ Index في Firestore
 */
export async function fetchAllCustomers() {
    try {
        const q = query(customersRef, orderBy("createdAt", "desc"));
        return await getDocs(q);
    } catch (error) {
        console.warn("⚠️ جاري الجلب بدون ترتيب (يُرجى إنشاء فهرس في Firestore):", error.message);
        return await getDocs(customersRef);
    }
}

/**
 * جلب بيانات عميل واحد
 */
export async function fetchCustomerById(id) {
    if (!id) return null;
    try {
        const docSnap = await getDoc(doc(db, "customers", id));
        return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
    } catch (error) {
        console.error("❌ خطأ fetchCustomerById:", error);
        return null;
    }
}

/**
 * إضافة عميل جديد (17 حقلاً)
 */
export async function addCustomer(customerData) {
    try {
        const payload = {
            ...customerData,
            createdAt: new Date().toISOString(), // تنسيق نصي للفرز السهل
            serverTime: serverTimestamp(),       // وقت الخادم للدقة
            system_origin: "Tera Gateway",
            lastAction: "إنشاء ملف"
        };
        
        const docRef = await addDoc(customersRef, payload);
        await logActivity(`إضافة عميل: ${customerData.name}`);
        return docRef;
    } catch (error) {
        console.error("❌ فشل addCustomer:", error);
        throw error;
    }
}

/**
 * تحديث بيانات عميل
 */
export async function updateCustomer(id, updatedData) {
    try {
        const docRef = doc(db, "customers", id);
        await updateDoc(docRef, {
            ...updatedData,
            updatedAt: serverTimestamp(),
            lastAction: "تحديث بيانات"
        });
        await logActivity(`تحديث بيانات العميل: ${updatedData.name || id}`);
        return true;
    } catch (error) {
        console.error("❌ فشل updateCustomer:", error);
        throw error;
    }
}

/**
 * حذف عميل
 * ملاحظة: تم تغيير الاسم من removeCustomer إلى deleteCustomer ليتوافق مع الـ UI
 */
export async function deleteCustomer(id) {
    try {
        const docRef = doc(db, "customers", id);
        await deleteDoc(docRef);
        await logActivity(`حذف نهائي للعميل ID: ${id}`);
        return true;
    } catch (error) {
        console.error("❌ فشل deleteCustomer:", error);
        return false;
    }
}

/**
 * نظام السجلات (Activity Logs)
 * متوافق مع طلبات الـ UI
 */
export async function logActivity(message) {
    try {
        await addDoc(logsRef, {
            action: message,
            timestamp: serverTimestamp(),
            admin: "Mohammad Al-Shammari", // توثيق المطور
            region: "Hail"
        });
    } catch (e) {
        console.error("⚠️ فشل التسجيل:", e);
    }
}
