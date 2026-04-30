/**
 * js/modules/customers-core.js - المحرك التشغيلي المطور (V12.12.12)
 * يدعم نظام البيانات الـ 17 المعتمد لمنصة تيرا جيت واي
 * المتوافق مع Firebase 10.7.1 ومعايير UI/UX الحديثة
 * المطور: محمد بن صالح الشمري
 */

import { db } from '../core/firebase.js'; 
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
 * 1. إضافة عميل جديد
 * تم تحديث الهيكل ليشمل الإحداثيات الجغرافية والنوع الاجتماعي وتاريخ الميلاد
 */
export async function addCustomer(data) {
    const defaultData = {
        name: "",               // 1. الاسم الكامل
        phone: "",              // 2. رقم الجوال
        country_code: "+966",   // 3. مفتاح الدولة
        email: "",              // 4. البريد الإلكتروني
        user_type: "فرد",       // 5. النوع (فرد/شركة/متجر)
        birth_date: "",         // 6. تاريخ الميلاد
        gender: "ذكر",          // 7. الجنس
        city: "حائل",           // 8. المدينة
        district: "",           // 9. الحي
        street: "",             // 10. الشارع
        building_number: "",    // 11. رقم المبنى
        additional_number: "",  // 12. الرقم الإضافي
        postal_code: "",        // 13. الرمز البريدي
        po_box: "",             // 14. صندوق البريد
        latitude: "",           // 15. خط العرض (للموقع الجغرافي)
        longitude: "",          // 16. خط الطول (للموقع الجغرافي)
        customer_type: "عادي",  // 17. التصنيف (عادي/مميز/VIP)
        customer_status: "طبيعي",// حالة العميل أمنياً (طبيعي/مزعج/محتال)
        customer_notes: "",      // ملاحظات إضافية
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
    };

    const finalData = { ...defaultData, ...data };

    // تنظيف البيانات لضمان عدم وجود قيم undefined
    Object.keys(finalData).forEach(key => {
        if (finalData[key] === undefined || finalData[key] === null) {
            finalData[key] = "";
        }
    });

    try {
        const docRef = await addDoc(customersRef, finalData);
        console.log(`%c✅ Tera Core: تم تسجيل العميل بنجاح [${docRef.id}]`, "color: #22c55e; font-weight: bold;");
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error("🔴 Tera Core Error (Add):", error);
        throw error;
    }
}

/**
 * 2. تحديث بيانات العميل
 */
export async function updateCustomer(id, data) {
    if (!id) throw new Error("ID مطلوب للتحديث");
    
    const docRef = doc(db, "customers", id);
    const updateData = {
        ...data,
        updatedAt: serverTimestamp()
    };
    
    delete updateData.createdAt; 
    Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) delete updateData[key];
    });

    try {
        await updateDoc(docRef, updateData);
        return { success: true };
    } catch (error) {
        console.error("🔴 Tera Core Error (Update):", error);
        throw error;
    }
}

/**
 * 3. جلب الإحصائيات المتقدمة للوحة التحكم
 * تم تحديث الفلاتر لتشمل منطقة حائل والعملاء الـ VIP والتنبيهات الأمنية
 */
export async function getCustomersStats() {
    try {
        const snapshot = await getDocs(customersRef);
        const stats = {
            total: 0,
            vip: 0,
            hailRegion: 0,
            risky: 0, // عملاء محتالين أو مزعجين
            merchants: 0
        };

        snapshot.forEach(docSnap => {
            const d = docSnap.data();
            stats.total++;
            
            if (d.customer_type === 'عميل VIP') stats.vip++;
            if (d.user_type === 'متجر' || d.user_type === 'شركة') stats.merchants++;
            if (d.city && d.city.includes("حائل")) stats.hailRegion++;
            
            // فحص الحالة الأمنية للعميل
            if (d.customer_status === 'عميل محتال' || d.customer_status === 'عميل مزعج') {
                stats.risky++;
            }
        });

        return stats;
    } catch (error) {
        console.error("🔴 Tera Core Error (Stats):", error);
        return null;
    }
}

/**
 * 4. جلب قائمة العملاء كاملة
 */
export async function fetchAllCustomers() {
    try {
        const q = query(customersRef, orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("🔴 Tera Core Error (FetchAll):", error);
        throw error;
    }
}

export async function fetchCustomerById(id) {
    const snap = await getDoc(doc(db, "customers", id));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function deleteCustomer(id) {
    try {
        await deleteDoc(doc(db, "customers", id));
        return { success: true };
    } catch (error) {
        console.error("🔴 Tera Core Error (Delete):", error);
        throw error;
    }
}
