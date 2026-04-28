/**
 * js/modules/customers-core.js - المحرك التشغيلي المطور (V12.12.1)
 * يدعم نظام البيانات الـ 17 المعتمد لمنصة تيرا جيت واي
 */

import { db } from '../core/firebase.js'; 
import { 
    collection, addDoc, updateDoc, deleteDoc, doc, getDoc, getDocs, query, orderBy, serverTimestamp 
} from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";

// المرجع الرئيسي لمجموعة العملاء
const customersRef = collection(db, "customers");

/**
 * 1. إضافة عميل جديد
 * تم تحسين دمج البيانات لضمان توافق الـ 17 حقلاً مع Firestore الحديث
 */
export async function addCustomer(data) {
    const defaultData = {
        name: "", 
        phone: "", 
        countryCode: "+966", 
        email: "",
        country: "المملكة العربية السعودية", 
        city: "", 
        district: "",
        street: "", 
        buildingNo: "", 
        additionalNo: "", 
        postalCode: "",
        poBox: "", 
        status: "نشط", 
        tag: "عادي", 
        type: "فرد", 
        notes: "",
        photoURL: "admin/images/default-product.png",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
    };

    // إزالة أي قيم undefined لمنع أخطاء Firestore الـ Payload
    const finalData = { ...defaultData, ...data };
    Object.keys(finalData).forEach(key => finalData[key] === undefined && delete finalData[key]);

    try {
        return await addDoc(customersRef, finalData);
    } catch (error) {
        console.error("🔴 Tera Core Error (Add):", error);
        throw error;
    }
}

/**
 * 2. تحديث بيانات عميل
 */
export async function updateCustomer(id, data) {
    const docRef = doc(db, "customers", id);
    const updateData = {
        ...data,
        updatedAt: serverTimestamp()
    };
    
    // إزالة الحقول التي لا يجب تحديثها أو التي قيمتها undefined
    delete updateData.createdAt; 
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    return await updateDoc(docRef, updateData);
}

/**
 * 3. جلب بيانات عميل واحد بالرقم المرجعي (ID)
 */
export async function fetchCustomerById(id) {
    try {
        const snap = await getDoc(doc(db, "customers", id));
        return snap.exists() ? { id: snap.id, ...snap.data() } : null;
    } catch (error) {
        console.error("🔴 Tera Core Error (Fetch):", error);
        throw error;
    }
}

/**
 * 4. جلب كافة العملاء مرتبين حسب الأحدث
 */
export async function fetchAllCustomers() {
    try {
        const q = query(customersRef, orderBy("createdAt", "desc"));
        return await getDocs(q);
    } catch (error) {
        console.error("🔴 Tera Core Error (FetchAll):", error);
        throw error;
    }
}

/**
 * 5. حذف عميل نهائياً
 */
export async function deleteCustomer(id) {
    const docRef = doc(db, "customers", id);
    return await deleteDoc(docRef);
}

/**
 * 6. جلب إحصائيات متقدمة لواجهة الإدارة
 * تم تحسين المنطق ليعطي نتائج دقيقة فورية
 */
export async function getCustomersStats() {
    try {
        const snapshot = await getDocs(customersRef);
        const stats = {
            total: 0,
            complete: 0,
            incomplete: 0,
            active: 0,
            suspended: 0,
            vip: 0,
            companies: 0,
            individuals: 0
        };

        snapshot.forEach(docSnap => {
            const d = docSnap.data();
            stats.total++;
            
            // معيار اكتمال الملف الشخصي للعميل في تيرا
            const isComplete = (d.name && d.phone && d.city && d.district && d.buildingNo);
            isComplete ? stats.complete++ : stats.incomplete++;

            if (d.status === 'نشط') stats.active++;
            else if (d.status === 'موقوف' || d.status === 'inactive') stats.suspended++;

            if (d.tag === 'VIP' || d.classification === 'VIP') stats.vip++;
            
            if (d.type === 'شركة') stats.companies++;
            else stats.individuals++;
        });

        return stats;
    } catch (error) {
        console.error("🔴 Tera Core Error (Stats):", error);
        return null;
    }
}

/**
 * 7. منطق الاستيراد الجماعي (Bulk Import)
 */
export async function importCustomersFromExcel(dataArray) {
    const results = { success: 0, failed: 0, logs: [] };
    
    for (const item of dataArray) {
        try {
            await addCustomer(item);
            results.success++;
        } catch (err) {
            results.failed++;
            results.logs.push(`فشل إضافة: ${item.name || 'مجهول'} - السبب: ${err.message}`);
        }
    }
    return results;
}
