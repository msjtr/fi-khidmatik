/**
 * Tera Gateway - Customers Core Module
 * المسؤول عن كافة عمليات Firestore لمجموعة العملاء
 */

import { db } from '../core/config.js';
import { 
    collection, 
    query, 
    orderBy, 
    getDocs, 
    doc, 
    getDoc, 
    deleteDoc, 
    addDoc, 
    updateDoc, 
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/**
 * جلب جميع العملاء من مجموعة "customers"
 * يتضمن نظام محاولات لضمان الجلب حتى في حال عدم وجود فهرس (Index)
 */
export async function fetchAllCustomers() {
    try {
        console.log("🔍 محاولة جلب العملاء من مجموعة: customers");
        
        // المحاولة الأولى: الجلب مرتباً حسب تاريخ الإضافة كما في قاعدة بياناتك
        const primaryQuery = query(collection(db, "customers"), orderBy("CreatedAt", "desc"));
        const snapshot = await getDocs(primaryQuery);
        
        if (snapshot.empty) {
            // المحاولة الثانية: جلب البيانات بدون ترتيب (في حال فشل الفهرسة أو كانت المجموعة فارغة فعلياً)
            console.warn("⚠️ لم يتم العثور على بيانات مرتبة، جاري محاولة الجلب الخام...");
            const fallbackQuery = query(collection(db, "customers"));
            const fallbackSnapshot = await getDocs(fallbackQuery);
            
            if (fallbackSnapshot.empty) {
                console.error("❌ قاعدة بيانات العملاء فارغة تماماً في Firestore.");
            }
            return fallbackSnapshot;
        }

        return snapshot;
    } catch (error) {
        console.error("❌ فشل الاتصال بقاعدة البيانات:", error.message);
        
        // محاولة أخيرة بسيطة جداً لتجاوز أي قيود استعلام
        try {
            return await getDocs(collection(db, "customers"));
        } catch (finalError) {
            console.error("❌ خطأ حرج في الوصول لمجموعة customers:", finalError.message);
            throw finalError;
        }
    }
}

/**
 * جلب بيانات عميل واحد بواسطة المعرف (ID)
 */
export async function fetchCustomerById(id) {
    try {
        const docRef = doc(db, "customers", id);
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
    } catch (error) {
        console.error("❌ خطأ في جلب بيانات العميل:", error);
        return null;
    }
}

/**
 * إضافة عميل جديد - مع الالتزام التام بأسماء العناصر المطلوبة
 */
export async function addCustomer(data) {
    try {
        const docData = {
            // المعلومات الأساسية
            name: data.name || '',
            Email: data.Email || '',
            Phone: data.Phone || '', // يشمل مفتاح الدولة والرقم
            
            // العنوان الوطني (عناصر المجموعة)
            country: data.country || 'السعودية',
            city: data.city || '',
            district: data.district || '',
            street: data.street || '',
            buildingNo: data.buildingNo || '',
            additionalNo: data.additionalNo || '',
            postalCode: data.postalCode || '',
            poBox: data.poBox || '',
            
            // الحالة والملاحظات
            notes: data.notes || '', // مربع نص مدعوم بمحرر
            status: data.status || 'عادي', // (محتال، مميز، غير جدي...)
            
            // التاريخ
            CreatedAt: serverTimestamp()
        };

        const docRef = await addDoc(collection(db, "customers"), docData);
        console.log("✅ تمت إضافة العميل بنجاح، المعرف:", docRef.id);
        return docRef;
    } catch (error) {
        console.error("❌ خطأ أثناء إضافة العميل:", error);
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
            UpdatedAt: serverTimestamp() // تاريخ آخر تحديث
        });
        return true;
    } catch (error) {
        console.error("❌ خطأ أثناء التحديث:", error);
        return false;
    }
}

/**
 * حذف عميل من القاعدة
 */
export async function removeCustomer(id) {
    try {
        const docRef = doc(db, "customers", id);
        await deleteDoc(docRef);
        console.log("🗑️ تم حذف العميل:", id);
        return true;
    } catch (error) {
        console.error("❌ فشل عملية الحذف:", error);
        return false;
    }
}
