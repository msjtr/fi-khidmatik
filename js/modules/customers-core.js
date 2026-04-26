/**
 * customers-core.js - Tera Gateway
 * المحرك الرئيسي لإدارة مجموعة 'customers'
 * تم الإصلاح ليتوافق مع استدعاء import * as Core
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

// المرجع الرئيسي لمجموعة العملاء
const customersRef = collection(db, "customers");

/**
 * جلب جميع العملاء مرتبين بالأحدث
 */
export async function fetchAllCustomers() {
    try {
        console.log("🔄 جاري طلب بيانات العملاء من تيرا...");
        
        // الترتيب حسب createdAt الصغير (الموجود في قاعدة بياناتك)
        const q = query(customersRef, orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        
        return snapshot;
    } catch (error) {
        console.warn("⚠️ فشل الترتيب، يتم الجلب بدون ترتيب (Fallback):", error.message);
        // في حال عدم وجود فهرس (Index) أو تضارب أنواع البيانات
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
 * إضافة عميل جديد
 */
export async function addCustomer(customerData) {
    try {
        const payload = {
            ...customerData,
            createdAt: new Date().toISOString(), // متوافق مع صيغة النص في سجلاتك
            system_origin: "Tera Gateway",
            region: "Hail"
        };
        
        console.log("📤 إضافة عميل جديد...");
        return await addDoc(customersRef, payload);
    } catch (error) {
        console.error("❌ فشل addCustomer:", error);
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
            updatedAt: serverTimestamp() // طابع وقت التحديث من السيرفر
        });
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
        const docRef = doc(db, "customers", id);
        await deleteDoc(docRef);
        return true;
    } catch (error) {
        console.error("❌ فشل removeCustomer:", error);
        return false;
    }
}
