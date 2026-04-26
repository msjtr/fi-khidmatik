/**
 * customers-core.js - Fi-Khidmatik Engine
 * المحرك الرئيسي لإدارة مجموعة 'customers'
 * المسار الصحيح: js/core/customers-core.js
 */

// استيراد قاعدة البيانات بمسار نسبي صحيح لبيئة GitHub Pages
import { db } from './firebase.js'; 

import { 
    collection, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    doc, 
    getDoc, 
    getDocs, 
    query, 
    orderBy, 
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const customersRef = collection(db, "customers");

/**
 * إضافة عميل جديد (17 حقلاً)
 */
export async function addCustomer(data) {
    try {
        const payload = {
            // بيانات الاتصال الأساسية (1-4)
            name: data.name || '',
            phone: data.phone || '',
            countryCode: data.countryCode || '+966',
            email: data.email || '',
            
            // بيانات العنوان الوطني (5-12)
            country: data.country || 'المملكة العربية السعودية',
            city: data.city || '',
            district: data.district || '',
            street: data.street || '',
            buildingNo: data.buildingNo || '',
            additionalNo: data.additionalNo || '',
            postalCode: data.postalCode || '',
            poBox: data.poBox || '',
            
            // بيانات الإدارة والتصنيف (13-14)
            notes: data.notes || '', // Rich Text من المحرر
            tag: data.tag || 'regular',
            
            // التوقيت الآلي (15-16)
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            
            // الصورة (الحقل 17)
            image: data.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name || 'C')}&background=random`
        };
        
        return await addDoc(customersRef, payload);
    } catch (error) {
        console.error("❌ فشل إضافة العميل في Firestore:", error);
        throw error;
    }
}

/**
 * تحديث بيانات عميل موجود
 */
export async function updateCustomer(id, data) {
    if (!id) throw new Error("ID العميل مفقود");
    
    try {
        const docRef = doc(db, "customers", id);
        return await updateDoc(docRef, {
            ...data,
            updatedAt: serverTimestamp() // تحديث تلقائي للوقت عند كل تعديل
        });
    } catch (error) {
        console.error("❌ فشل تحديث العميل:", error);
        throw error;
    }
}

/**
 * جلب بيانات عميل واحد بواسطة الـ ID
 */
export async function fetchCustomerById(id) {
    if (!id) return null;
    try {
        const snap = await getDoc(doc(db, "customers", id));
        return snap.exists() ? { id: snap.id, ...snap.data() } : null;
    } catch (error) {
        console.error("❌ فشل جلب بيانات العميل:", error);
        return null;
    }
}

/**
 * جلب جميع العملاء مرتبين من الأحدث للأقدم
 */
export async function fetchAllCustomers() {
    try {
        const q = query(customersRef, orderBy("createdAt", "desc"));
        return await getDocs(q);
    } catch (error) {
        console.warn("⚠️ جاري الجلب بدون ترتيب (تأكد من إعداد الفهرس/Index):");
        return await getDocs(customersRef);
    }
}

/**
 * حذف العميل نهائياً من قاعدة البيانات
 */
export async function deleteCustomer(id) {
    try {
        const docRef = doc(db, "customers", id);
        await deleteDoc(docRef);
        return true;
    } catch (error) {
        console.error("❌ فشل عملية الحذف:", error);
        return false;
    }
}
