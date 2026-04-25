import { db } from '../core/config.js';
import { 
    doc, getDoc, deleteDoc, collection, getDocs, query, orderBy 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { UI } from './customers-ui.js';

// دالة جلب بيانات العميل وتعبئتها في الفورم بدقة
window.fetchCustomerToForm = async (id) => {
    try {
        const docSnap = await getDoc(doc(db, "customers", id));
        if (docSnap.exists()) {
            const data = docSnap.data();
            document.getElementById('cust-name').value = data.name || '';
            document.getElementById('cust-email').value = data.email || '';
            document.getElementById('cust-phone').value = data.phone || '';
            document.getElementById('cust-idNumber').value = data.idNumber || '';
            document.getElementById('cust-city').value = data.city || 'حائل';
            document.getElementById('cust-district').value = data.district || '';
            
            if (data.createdAt) {
                const joinBox = document.getElementById('join-date-box');
                const joinVal = document.getElementById('join-date-val');
                joinVal.innerText = new Date(data.createdAt).toLocaleDateString('ar-SA', {
                    year: 'numeric', month: 'long', day: 'numeric'
                });
                joinBox.style.display = 'block';
            }
        }
    } catch (e) { console.error("Error fetching customer:", e); }
};

// دالة حذف العميل
window.handleDelete = async (id) => {
    try {
        await deleteDoc(doc(db, "customers", id));
        window.closeCustomerModal();
        alert("تم الحذف بنجاح");
        location.reload(); // تحديث الجدول
    } catch (e) { alert("فشل الحذف، حاول مجدداً"); }
};

// ... (بقية دوال initCustomers و loadCustomers تبقى كما هي)
