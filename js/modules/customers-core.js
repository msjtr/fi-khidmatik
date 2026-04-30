/**
 * js/modules/customers-core.js - المحرك التشغيلي المطور (V12.12.8)
 * يدعم نظام البيانات الـ 17 المعتمد لمنصة تيرا جيت واي
 * المطور: محمد بن صالح الشمري
 */

// استيراد قاعدة البيانات - تأكد من صحة المسار لملف الإعدادات الخاص بك
import { db } from '../core/firebase.js'; 

// استيراد وظائف Firestore من الرابط المباشر لضمان عدم حدوث خطأ 404 في المكتبات
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

// المرجع الرئيسي لمجموعة العملاء
const customersRef = collection(db, "customers");

/**
 * 1. إضافة عميل جديد
 * تم مطابقة المسميات مع هيكل قاعدة البيانات الفعلي الموثق (buildingNo, additionalNo, tag)
 */
export async function addCustomer(data) {
    const defaultData = {
        name: "",               // 1. الاسم الكامل
        phone: "",              // 2. رقم الجوال
        countryCode: "+966",    // 3. مفتاح الدولة
        email: "",              // 4. البريد الإلكتروني
        country: "المملكة العربية السعودية", // 5. الدولة
        city: "حائل",           // 6. المدينة
        district: "",           // 7. الحي
        street: "",             // 8. الشارع
        buildingNo: "",         // 9. رقم المبنى
        additionalNo: "",       // 10. الرقم الإضافي
        postalCode: "",         // 11. الرمز البريدي
        poBox: "",              // 12. صندوق البريد
        status: "نشط",          // 13. الحالة (نشط/محظور)
        tag: "عادي",            // 14. التصنيف (عادي/vip/تاجر)
        type: "فرد",            // 15. النوع (فرد/شركة)
        notes: "",              // 16. ملاحظات
        avatar: "",             // 17. رابط الصورة
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
    };

    const finalData = { ...defaultData, ...data };

    // تنظيف القيم undefined لمنع أخطاء Firestore
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
    if (!id) throw new Error("ID مطلوب");
    
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
 * 3. جلب كافة العملاء
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
 * 4. إحصائيات لوحة التحكم
 * تعتمد على حقول 'tag' و 'status' و 'city' المحدثة
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

            const customerTag = String(d.tag || "").toLowerCase();
            if (customerTag === 'vip') stats.vip++;
            if (customerTag === 'تاجر') stats.merchants++;
            
            if (d.city && d.city.includes("حائل")) stats.hailRegion++;
        });

        return stats;
    } catch (error) {
        console.error("🔴 Tera Core Error (Stats):", error);
        return null;
    }
}

// تصدير بقية الدوال التقليدية
export async function fetchCustomerById(id) {
    const snap = await getDoc(doc(db, "customers", id));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function deleteCustomer(id) {
    await deleteDoc(doc(db, "customers", id));
    return { success: true };
}
