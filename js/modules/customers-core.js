import { db } from '../core/config.js'; 
import { 
    collection, getDocs, addDoc, updateDoc, deleteDoc, doc, getDoc, query, orderBy, serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// تعريف المرجع مباشرة
const customersRef = collection(db, "customers");

// تصدير الدوال باستخدام const يمنع أخطاء الـ Syntax في السطر 18
export const fetchAllCustomers = async function() {
    try {
        const q = query(customersRef, orderBy("CreatedAt", "desc"));
        const snapshot = await getDocs(q);
        return snapshot;
    } catch (error) {
        console.warn("جلب البيانات بدون ترتيب...");
        return await getDocs(customersRef);
    }
};

export const fetchCustomerById = async function(id) {
    try {
        const docRef = doc(db, "customers", id);
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? docSnap.data() : null;
    } catch (e) {
        return null;
    }
};

export const addCustomer = async function(data) {
    return await addDoc(customersRef, {
        ...data,
        CreatedAt: serverTimestamp()
    });
};

export const updateCustomer = async function(id, data) {
    const docRef = doc(db, "customers", id);
    return await updateDoc(docRef, {
        ...data,
        UpdatedAt: serverTimestamp()
    });
};

export const removeCustomer = async function(id) {
    const docRef = doc(db, "customers", id);
    return await deleteDoc(docRef);
};
