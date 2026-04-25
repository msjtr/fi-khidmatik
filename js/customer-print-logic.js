// 1. يجب أن تكون الاستيرادات في السطور الأولى دائماً
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

// 2. تعريف المرجع (تأكد أن db معرفة بشكل صحيح في config.js)
const customersRef = collection(db, "customers");

// 3. الدوال المصدرة
export async function fetchAllCustomers() {
    try {
        const q = query(customersRef, orderBy("CreatedAt", "desc"));
        return await getDocs(q);
    } catch (error) {
        console.warn("⚠️ تم التحويل للجلب الخام (Raw Fetch)");
        return await getDocs(customersRef);
    }
}

export async function fetchCustomerById(id) {
    try {
        const docRef = doc(db, "customers", id);
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? docSnap.data() : null;
    } catch (e) {
        console.error("Error fetching doc:", e);
        return null;
    }
}

export async function addCustomer(data) {
    return await addDoc(customersRef, {
        ...data,
        CreatedAt: serverTimestamp()
    });
}

export async function updateCustomer(id, data) {
    const docRef = doc(db, "customers", id);
    return await updateDoc(docRef, {
        ...data,
        UpdatedAt: serverTimestamp()
    });
}

export async function removeCustomer(id) {
    const docRef = doc(db, "customers", id);
    return await deleteDoc(docRef);
}
