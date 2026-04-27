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
        type: "فرد", // تم إضافة نوع العميل للإحصائيات
        notes: "",
        photoURL: "admin/images/default-product.png", // المسار المعتمد حسب شجرتك
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
    };

    // دمج البيانات مع ضمان عدم وجود حقول undefined لـ Firestore
    const cleanData = Object.fromEntries(
        Object.entries({ ...defaultData, ...data }).filter(([_, v]) => v !== undefined)
    );

    return await addDoc(customersRef, cleanData);
}

/**
 * 2. تحديث بيانات عميل (مطابقة تامة لعناصر المجموعة)
 */
export async function updateCustomer(id, data) {
    const docRef = doc(db, "customers", id);
    const updateData = {
        ...data,
        updatedAt: serverTimestamp()
    };
    
    return await updateDoc(docRef, updateData);
}

/**
 * 3. جلب بيانات عميل واحد بالرقم المرجعي
 */
export async function fetchCustomerById(id) {
    try {
        const snap = await getDoc(doc(db, "customers", id));
        return snap.exists() ? { id: snap.id, ...snap.data() } : null;
    } catch (error) {
        console.error("Error fetching customer:", error);
        throw error;
    }
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
    const docRef = doc(db, "customers", id);
    return await deleteDoc(docRef);
}

/**
 * 6. جلب إحصائيات المجموعة بشكل مفصل (Logic Layer)
 */
export async function getCustomersStats() {
    const snapshot = await getDocs(customersRef);
    const stats = {
        total: 0,
        complete: 0,
        incomplete: 0,
        active: 0,
        suspended: 0,
        vip: 0,
        companies: 0,
        individuals: 0,
        withBalance: 0 // إحصائية إضافية للديون المستحقة مستقبلاً
    };

    snapshot.forEach(docSnap => {
        const d = docSnap.data();
        stats.total++;
        
        // معيار اكتمال البيانات لـ "تيرا جيت واي"
        const isComplete = (d.name && d.phone && d.city && d.district && d.buildingNo && d.postalCode);
        isComplete ? stats.complete++ : stats.incomplete++;

        // تصنيف الحالة برمجياً
        if (d.status === 'نشط') stats.active++;
        else if (d.status === 'موقوف') stats.suspended++;

        // تصنيف الأهمية والنوع
        if (d.tag === 'VIP') stats.vip++;
        if (d.type === 'شركة') stats.companies++;
        else stats.individuals++;
    });

    return stats;
}

/**
 * 7. منطق استيراد البيانات الضخم (Bulk Import)
 */
export async function importCustomersFromExcel(dataArray) {
    const results = { success: 0, failed: 0, logs: [] };
    
    // تنفيذ العمليات بشكل متسلسل لضمان استقرار Firestore
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
