/**
 * customers-ui.js - المحرك المطور لمجموعة العملاء
 * المسار: js/modules/customers-ui.js
 */
import { db } from '../core/firebase.js'; 
import { collection, getDocs, query, orderBy, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/**
 * الدالة الرئيسية لتشغيل واجهة العملاء
 */
export async function initCustomersUI(container) {
    const tableBody = document.getElementById('customers-data-rows');
    if (!tableBody) return;

    // 1. إظهار حالة التحميل
    tableBody.innerHTML = '<tr><td colspan="17" style="text-align:center; padding:40px;"><i class="fas fa-spinner fa-spin"></i> جاري جلب بيانات العملاء...</td></tr>';

    try {
        // 2. جلب البيانات من Firestore
        const customersRef = collection(db, "customers");
        const q = query(customersRef, orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);

        tableBody.innerHTML = ''; // تنظيف الجدول

        if (querySnapshot.empty) {
            tableBody.innerHTML = '<tr><td colspan="17" style="text-align:center;">لا يوجد عملاء مسجلين حالياً.</td></tr>';
            return;
        }

        let index = 1;
        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const tr = document.createElement('tr');
            tr.className = "customer-row";

            // 3. بناء الـ 17 عموداً بالترتيب الدقيق (أرقام إنجليزية 123)
            tr.innerHTML = `
                <td class="sticky-col">${index++}</td>                           <td class="sticky-col-name"><strong>${data.name || '---'}</strong></td> <td>${data.phone || '---'}</td>                                 <td>${data.countryKey || '+966'}</td>                           <td>${data.email || '---'}</td>                                 <td>${data.countryName || 'السعودية'}</td>                       <td>${data.city || '---'}</td>                                  <td>${data.district || '---'}</td>                              <td>${data.street || '---'}</td>                                <td>${data.buildingNo || '---'}</td>                            <td>${data.extraNo || '---'}</td>                               <td>${data.zipCode || '---'}</td>                               <td>${data.poBox || '---'}</td>                                 <td>${data.createdAt || '---'}</td>                             <td><span class="status-pill ${getStatusClass(data.status)}">${data.status || 'نشط'}</span></td> <td>${data.classification || data.type || 'عادي'}</td>          <td class="sticky-actions-cell">                                <div class="action-btns">
                        <button onclick="window.editCust('${docSnap.id}')" class="btn-sm btn-edit" title="تعديل"><i class="fas fa-edit"></i></button>
                        <button onclick="window.printCust('${docSnap.id}')" class="btn-sm btn-print" title="طباعة"><i class="fas fa-print"></i></button>
                        <button onclick="window.deleteCust('${docSnap.id}')" class="btn-sm btn-delete" title="حذف"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            `;
            tableBody.appendChild(tr);
        });

    } catch (error) {
        console.error("Firestore Error:", error);
        tableBody.innerHTML = '<tr><td colspan="17" style="text-align:center; color:red;">فشل الاتصال بقاعدة البيانات. راجع الكونسول.</td></tr>';
    }
}

/**
 * ربط الدوال بالنطاق العالمي (Global Scope) لتعمل مع onclick
 */

window.editCust = function(id) {
    console.log("تعديل العميل ID:", id);
    alert("سيتم فتح واجهة تعديل البيانات للعميل: " + id);
    // هنا يتم استدعاء Modal التعديل
};

window.printCust = function(id) {
    console.log("طباعة بيانات العميل ID:", id);
    window.print();
};

window.deleteCust = async function(id) {
    if (confirm("هل أنت متأكد من حذف هذا العميل نهائياً من مجموعة customers؟")) {
        try {
            await deleteDoc(doc(db, "customers", id));
            alert("تم حذف العميل بنجاح.");
            // تحديث الجدول بدون إعادة تحميل الصفحة بالكامل
            window.location.reload(); 
        } catch (error) {
            console.error("Delete Error:", error);
            alert("فشل إجراء الحذف.");
        }
    }
};

/**
 * دالة مساعدة لتحديد تنسيق الحالة
 */
function getStatusClass(status) {
    switch(status) {
        case 'نشط': return 'active';
        case 'معلق': return 'pending';
        case 'محظور': return 'inactive';
        default: return 'active';
    }
}
