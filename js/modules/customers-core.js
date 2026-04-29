/**
 * js/modules/customers-core.js - المحرك التشغيلي المطور (V12.12.6)
 * يدعم نظام البيانات الـ 17 المعتمد لمنصة تيرا جيت واي
 * الإصدار المستقر للمكتبة: 10.7.1
 */

import { db } from '../core/firebase.js'; 
import { 
    collection, addDoc, updateDoc, deleteDoc, doc, getDoc, getDocs, query, orderBy, serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// المرجع الرئيسي لمجموعة العملاء
const customersRef = collection(db, "customers");

/**
 * 1. إضافة عميل جديد
 * تم تحسين دمج البيانات لضمان توافق الـ 17 حقلاً مع معايير تيرا
 */
export async function addCustomer(data) {
    const defaultData = {
        name: "", 
        phone: "", 
        countryCode: "+966", 
        email: "",
        country: "المملكة العربية السعودية", 
        city: "حائل",
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
        photoURL: "admin/images/default-avatar.png",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
    };

    const finalData = { ...defaultData, ...data };

    // تنظيف البيانات من القيم undefined لمنع أخطاء الـ Payload
    Object.keys(finalData).forEach(key => {
        if (finalData[key] === undefined) delete finalData[key];
    });

    try {
        const docRef = await addDoc(customersRef, finalData);
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error("🔴 Tera Core Error (Add):", error);
        throw error;
    }
}

/**
 * 2. تحديث بيانات عميل
 */
export async function updateCustomer(id, data) {
    if (!id) throw new Error("ID العميل مطلوب للتحديث");
    
    const docRef = doc(db, "customers", id);
    const updateData = {
        ...data,
        updatedAt: serverTimestamp()
    };
    
    delete updateData.createdAt; 
    Object.keys(updateData).forEach(key => (updateData[key] === undefined) && delete updateData[key]);

    try {
        await updateDoc(docRef, updateData);
        return { success: true };
    } catch (error) {
        console.error("🔴 Tera Core Error (Update):", error);
        throw error;
    }
}

/**
 * 3. جلب بيانات عميل واحد
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
 * 4. جلب كافة العملاء (مرتبين حسب الأحدث)
 */
export async function fetchAllCustomers() {
    try {
        // تأكد من وجود Index في Firebase لـ createdAt إذا لم تظهر النتائج
        const q = query(customersRef, orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("🔴 Tera Core Error (FetchAll):", error);
        throw error;
    }
}

/**
 * 5. حذف عميل نهائياً
 */
export async function deleteCustomer(id) {
    try {
        const docRef = doc(db, "customers", id);
        await deleteDoc(docRef);
        return { success: true };
    } catch (error) {
        console.error("🔴 Tera Core Error (Delete):", error);
        throw error;
    }
}

/**
 * 6. جلب إحصائيات متقدمة
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
            
            const isComplete = !!(d.name && d.phone && d.city && d.district && d.buildingNo);
            isComplete ? stats.complete++ : stats.incomplete++;

            if (d.status === 'نشط' || d.status === 'active') stats.active++;
            else stats.suspended++;

            if (d.tag?.toUpperCase() === 'VIP') stats.vip++;
            
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
 * 7. الاستيراد الجماعي
 */
export async function importCustomersFromExcel(dataArray) {
    const results = { success: 0, failed: 0, logs: [] };
    
    const promises = dataArray.map(async (item) => {
        try {
            await addCustomer(item);
            results.success++;
        } catch (err) {
            results.failed++;
            results.logs.push(`فشل: ${item.name || 'مجهول'} | ${err.message}`);
        }
    });

    await Promise.all(promises);
    return results;
}
