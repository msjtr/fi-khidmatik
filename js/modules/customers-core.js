/**
 * js/modules/customers-core.js - المحرك التشغيلي المطور (V12.12.8)
 * يدعم نظام البيانات الـ 17 المعتمد لمنصة تيرا جيت واي
 * الإصدار المستقر للمكتبة: 10.7.1
 * المطور: محمد بن صالح الشمري
 */

import { db } from '../core/firebase.js'; 
import { 
    collection, addDoc, updateDoc, deleteDoc, doc, getDoc, getDocs, query, orderBy, serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// المرجع الرئيسي لمجموعة العملاء في Firestore
const customersRef = collection(db, "customers");

/**
 * 1. إضافة عميل جديد
 * تم مطابقة المسميات مع هيكل قاعدة البيانات الفعلي
 */
export async function addCustomer(data) {
    const defaultData = {
        name: "",               // 1. الاسم الكامل
        phone: "",              // 2. رقم الجوال
        countryCode: "+966",    // 3. مفتاح الدولة (تم تعديل المسمى ليتطابق مع البيانات)
        email: "",              // 4. البريد الإلكتروني
        country: "المملكة العربية السعودية", // 5. الدولة
        city: "حائل",           // 6. المدينة
        district: "",           // 7. الحي
        street: "",             // 8. الشارع
        buildingNo: "",         // 9. رقم المبنى (مطابق لقاعدة البيانات)
        additionalNo: "",       // 10. الرقم الإضافي (مطابق لقاعدة البيانات)
        postalCode: "",         // 11. الرمز البريدي (مطابق لقاعدة البيانات)
        poBox: "",              // 12. صندوق البريد
        status: "نشط",          // 13. الحالة (نشط/محظور)
        tag: "عادي",            // 14. التصنيف (مطابق لحقل tag في البيانات: عادي/vip/تاجر)
        type: "فرد",            // 15. النوع (فرد/شركة)
        notes: "",              // 16. ملاحظات إضافية
        avatar: "",             // 17. رابط الصورة
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
    };

    // دمج البيانات المرسلة مع القيم الافتراضية
    const finalData = { ...defaultData, ...data };

    // تنظيف البيانات لضمان سلامة الـ Firestore
    Object.keys(finalData).forEach(key => {
        if (finalData[key] === undefined || finalData[key] === null) {
            finalData[key] = "";
        }
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
    if (!id) throw new Error("معرف العميل (ID) مطلوب لإتمام التحديث");
    
    const docRef = doc(db, "customers", id);
    const updateData = {
        ...data,
        updatedAt: serverTimestamp()
    };
    
    // حماية تاريخ الإنشاء وتنظيف الحقول
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
 * 4. جلب كافة العملاء (الأحدث أولاً)
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

/**
 * 5. حذف عميل
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
 * 6. إحصائيات لوحة التحكم
 */
export async function getCustomersStats() {
    try {
        const snapshot = await getDocs(customersRef);
        const stats = {
            total: 0,
            active: 0,
            blocked: 0,
            vip: 0,
            merchants: 0,
            hailRegion: 0 
        };

        snapshot.forEach(docSnap => {
            const d = docSnap.data();
            stats.total++;
            
            if (d.status === 'نشط') stats.active++;
            else if (d.status === 'محظور') stats.blocked++;

            // التحقق من الوسم (Tag)
            const customerTag = String(d.tag || "").toLowerCase();
            if (customerTag === 'vip') stats.vip++;
            if (customerTag === 'تاجر') stats.merchants++;
            
            // إحصائية أهل حائل
            if (d.city && d.city.includes("حائل")) stats.hailRegion++;
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
export async function importCustomersBatch(dataArray) {
    const results = { success: 0, failed: 0 };
    
    const promises = dataArray.map(async (item) => {
        try {
            await addCustomer(item);
            results.success++;
        } catch (err) {
            results.failed++;
        }
    });

    await Promise.all(promises);
    return results;
}
