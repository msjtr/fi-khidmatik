import { 
    getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, getDoc, query, orderBy, serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const db = getFirestore();
const customersRef = collection(db, "customers");

export async function fetchAllCustomers() {
    try {
        // محاولة الجلب المرتب حسب CreatedAt (تأكد من كتابتها هكذا في Firestore)
        const q = query(customersRef, orderBy("CreatedAt", "desc"));
        return await getDocs(q);
    } catch (error) {/**
 * customers-core.js
 * التعامل مع قاعدة البيانات لموديول العملاء
 */

import { db } from '../core/config.js'; 
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

// مرجع مجموعة العملاء
const customersRef = collection(db, "customers");

/**
 * جلب كافة العملاء
 */
export async function fetchAllCustomers() {
    try {
        // محاولة جلب مرتبة حسب تاريخ الإضافة
        const q = query(customersRef, orderBy("CreatedAt", "desc"));
        return await getDocs(q);
    } catch (error) {
        console.warn("⚠️ جلب البيانات بدون ترتيب (قد لا يتوفر حقل CreatedAt في بعض السجلات):", error);
        return await getDocs(customersRef);
    }
}

/**
 * جلب بيانات عميل واحد بالـ ID
 */
export async function fetchCustomerById(id) {
    try {
        const docRef = doc(db, "customers", id);
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? docSnap.data() : null;
    } catch (error) {
        console.error("❌ خطأ في جلب بيانات العميل:", error);
        return null;
    }
}

/**
 * إضافة عميل جديد
 */
export async function addCustomer(data) {
    return await addDoc(customersRef, {
        ...data,
        CreatedAt: serverTimestamp() // إضافة الوقت تلقائياً من السيرفر
    });
}

/**
 * تحديث بيانات عميل موجود
 */
export async function updateCustomer(id, data) {
    const docRef = doc(db, "customers", id);
    return await updateDoc(docRef, {
        ...data,
        UpdatedAt: serverTimestamp() // إضافة وقت التحديث
    });
}

/**
 * حذف عميل نهائياً
 */
export async function removeCustomer(id) {
    try {
        await deleteDoc(doc(db, "customers", id));
        return true;
    } catch (e) {
        console.error("❌ فشل الحذف:", e);
        return false;
    }
}
        console.warn("⚠️ تنبيه: جلب البيانات بدون ترتيب بسبب نقص حقل CreatedAt في بعض السجلات.");
        return await getDocs(customersRef);
    }
}

export async function fetchCustomerById(id) {
    const docSnap = await getDoc(doc(db, "customers", id));
    return docSnap.exists() ? docSnap.data() : null;
}

export async function addCustomer(data) {
    return await addDoc(customersRef, {
        ...data,
        CreatedAt: serverTimestamp() // إضافة تاريخ الإنشاء آلياً
    });
}

export async function updateCustomer(id, data) {
    const docRef = doc(db, "customers", id);
    return await updateDoc(docRef, data);
}

export async function removeCustomer(id) {
    try {
        await deleteDoc(doc(db, "customers", id));
        return true;
    } catch (e) { return false; }
}
