// js/orders-logic.js
import { db } from './orders-firebase-db.js';
import { collection, getDocs, query, orderBy, where, doc, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

export async function getOrders(statusFilter = 'الكل') {
    try {
        const colRef = collection(db, "customers");
        let q;
        
        // محاولة الجلب بالفلترة والترتيب (تتطلب Index)
        if (statusFilter === 'الكل') {
            q = query(colRef, orderBy("createdAt", "desc"));
        } else {
            q = query(colRef, where("status", "==", statusFilter), orderBy("createdAt", "desc"));
        }

        try {
            const snap = await getDocs(q);
            if (snap.empty) throw "Empty";
            return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (innerError) {
            console.warn("فشل الجلب المُرتب، يتم الجلب بدون ترتيب لضمان ظهور البيانات...");
            // جلب احتياطي (بدون ترتيب) في حال عدم تفعيل الـ Index
            const basicSnap = await getDocs(colRef);
            let data = basicSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
            if (statusFilter !== 'الكل') {
                return data.filter(d => d.status === statusFilter);
            }
            return data;
        }
    } catch (e) {
        console.error("خطأ عام في الجلب:", e);
        return [];
    }
}

export async function getStock() {
    try {
        const snap = await getDocs(collection(db, "products"));
        return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
        console.error("خطأ في المخزون:", e);
        return [];
    }
}

export async function deleteOrder(id) {
    if(confirm("حذف العميل نهائياً؟")) {
        await deleteDoc(doc(db, "customers", id));
        return true;
    }
    return false;
}

export function toast(msg, type = 'success') {
    const t = document.getElementById('toast');
    if(!t) return;
    t.textContent = msg;
    t.className = `fixed bottom-6 left-6 z-50 px-6 py-3 rounded-xl text-white font-bold ${type === 'error' ? 'bg-red-500' : 'bg-green-600'}`;
    t.style.display = 'block';
    setTimeout(() => t.style.display = 'none', 3000);
}
