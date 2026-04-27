/**
 * customers-core.js - المحرك التشغيلي لمجموعة العملاء
 * المسار المعتمد: js/modules/customers-core.js
 */

import { db } from '../core/firebase.js'; 
import { 
    collection, addDoc, updateDoc, deleteDoc, doc, getDoc, getDocs, query, orderBy, serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const customersRef = collection(db, "customers");

/**
 * 1. إضافة عميل جديد مع الحقول الـ 17 كاملة
 */
export async function addCustomer(data) {
    const defaultData = {
        name: "", phone: "", countryCode: "+966", email: "",
        country: "المملكة العربية السعودية", city: "", district: "",
        street: "", buildingNo: "", additionalNo: "", postalCode: "",
        poBox: "", status: "نشط", tag: "عادي", notes: "",
        photoURL: "assets/images/default-avatar.png", // الصورة الافتراضية
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
    };

    // دمج البيانات المدخلة مع القيم الافتراضية لضمان عدم نقص أي حقل
    return await addDoc(customersRef, { ...defaultData, ...data });
}

/**
 * 2. تحديث بيانات عميل (مطابقة تامة لعناصر المجموعة)
 */
export async function updateCustomer(id, data) {
    const docRef = doc(db, "customers", id);
    return await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
    });
}

/**
 * 3. جلب بيانات عميل واحد بالرقم المرجعي
 */
export async function fetchCustomerById(id) {
    const snap = await getDoc(doc(db, "customers", id));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

/**
 * 4. جلب كافة العملاء مرتبين حسب الأحدث
 */
export async function fetchAllCustomers() {
    const q = query(customersRef, orderBy("createdAt", "desc"));
    return await getDocs(q);
}

/**
 * 5. حذف عميل نهائياً
 */
export async function deleteCustomer(id) {
    return await deleteDoc(doc(db, "customers", id));
}

/**
 * 6. جلب إحصائيات المجموعة بشكل مفصل
 */
export async function getCustomersStats() {
    const snapshot = await getDocs(customersRef);
    const stats = {
        total: 0,
        complete: 0,
        incomplete: 0,
        active: 0,
        inactive: 0,
        suspended: 0,
        vip: 0,
        companies: 0,
        individuals: 0
    };

    snapshot.forEach(doc => {
        const d = doc.data();
        stats.total++;
        
        // فحص اكتمال البيانات الأساسية
        const isComplete = (d.name && d.phone && d.email && d.postalCode && d.buildingNo);
        isComplete ? stats.complete++ : stats.incomplete++;

        // تصنيف الحالة
        if (d.status === 'نشط') stats.active++;
        else if (d.status === 'موقف') stats.suspended++;
        else stats.inactive++;

        // تصنيف النوع
        if (d.tag?.toLowerCase() === 'vip') stats.vip++;
        if (d.tag === 'شركة') stats.companies++;
        if (d.tag === 'أفراد') stats.individuals++;
    });

    return stats;
}

/**
 * 7. منطق استيراد البيانات من Excel (قالب)
 */
export async function importCustomersFromExcel(dataArray) {
    const results = { success: 0, failed: 0, logs: [] };
    
    for (const item of dataArray) {
        try {
            await addCustomer(item);
            results.success++;
        } catch (err) {
            results.failed++;
            results.logs.push(`فشل إضافة: ${item.name || 'مجهول'}`);
        }
    }
    return results;
}
