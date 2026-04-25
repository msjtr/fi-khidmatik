/**
 * customers-core.js - Tera Gateway
 * المحرك الرئيسي لإدارة بيانات العملاء - متوافق مع هيكلية الحقول الشاملة
 * المسميات المعتمدة: (name, Phone, Email, country, city, district, street, buildingNo, additionalNo, postalCode, poBox, CreatedAt)
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

// المرجع الرئيسي لمجموعة العملاء في قاعدة بيانات تيرا
const customersRef = collection(db, "customers");

/**
 * جلب جميع العملاء مرتبين حسب تاريخ الإضافة (CreatedAt)
 */
export const fetchAllCustomers = async function() {
    try {
        console.log("🔄 جاري محاولة جلب بيانات العملاء من Tera Gateway...");
        
        // محاولة جلب مرتبة بالأحدث أولاً بناءً على مسمى الحقل في قاعدتك
        const q = query(customersRef, orderBy("CreatedAt", "desc"));
        const snapshot = await getDocs(q);
        
        console.log(`✅ تم جلب ${snapshot.size} عميل بنجاح (مرتب بالأحدث).`);
        return snapshot;
    } catch (error) {
        console.warn("⚠️ فشل الجلب المرتب (قد يحتاج لإنشاء Index في Firebase):", error.message);
        
        // جلب خام لضمان عدم توقف النظام في حال عدم وجود فهرس
        const rawSnapshot = await getDocs(customersRef);
        console.log(`✅ تم جلب ${rawSnapshot.size} عميل (جلب خام بدون ترتيب).`);
        return rawSnapshot;
    }
};

/**
 * جلب بيانات عميل واحد بواسطة المعرف (ID)
 */
export const fetchCustomerById = async function(id) {
    if (!id) return null;
    try {
        const docRef = doc(db, "customers", id);
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? docSnap.data() : null;
    } catch (error) {
        console.error("❌ خطأ في جلب بيانات العميل:", error);
        return null;
    }
};

/**
 * إضافة عميل جديد لمنصة تيرا مع الحقول الشاملة
 */
export const addCustomer = async function(customerData) {
    try {
        // نضمن استخدام serverTimestamp لضمان دقة التوقيت
        return await addDoc(customersRef, {
            ...customerData,
            CreatedAt: serverTimestamp(),
            system_origin: "Tera Gateway",
            region: "Hail" // توثيق المنطقة لبيانات تيرا في حائل
        });
    } catch (error) {
        console.error("❌ فشل إضافة العميل لقاعدة البيانات:", error);
        throw error;
    }
};

/**
 * تحديث بيانات عميل موجود (يشمل كافة حقول العنوان والاتصال)
 */
export const updateCustomer = async function(id, updatedData) {
    try {
        const docRef = doc(db, "customers", id);
        return await updateDoc(docRef, {
            ...updatedData,
            LastUpdate: serverTimestamp() // إضافة حقل لتتبع آخر تحديث
        });
    } catch (error) {
        console.error("❌ فشل تحديث بيانات العميل:", error);
        throw error;
    }
};

/**
 * حذف عميل نهائياً من النظام
 */
export const removeCustomer = async function(id) {
    try {
        const docRef = doc(db, "customers", id);
        await deleteDoc(docRef);
        console.log(`🗑️ تم حذف العميل ذو المعرف ${id} بنجاح.`);
        return true;
    } catch (error) {
        console.error("❌ فشل عملية الحذف:", error);
        return false;
    }
};

// التصدير الافتراضي لدعم طرق الاستيراد المختلفة
export default { 
    fetchAllCustomers, 
    fetchCustomerById, 
    addCustomer, 
    updateCustomer, 
    removeCustomer 
};
