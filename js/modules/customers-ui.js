/**
 * customers-ui.js
 * موديول إدارة واجهة العملاء - الإصلاح النهائي لجميع الدوال والأقواس
 */

import { db } from '../core/firebase.js';
import { 
    collection, 
    getDocs, 
    addDoc, 
    deleteDoc, 
    doc, 
    updateDoc 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// دالة التشغيل الرئيسية عند تحميل القسم
export async function initCustomersUI(container) {
    console.log("إعداد واجهة العملاء في Fi-Khidmatik...");
    await renderCustomerTable();
}

// دالة عرض جدول العملاء
export async function renderCustomerTable() {
    const tableBody = document.querySelector('#customers-table-body');
    if (!tableBody) return;

    try {
        const querySnapshot = await getDocs(collection(db, "customers"));
        tableBody.innerHTML = '';

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const row = `
                <tr class="customer-row">
                    <td>${data.name || '---'}</td>
                    <td>${data.phone || '---'}</td>
                    <td>${data.city || '---'}</td>
                    <td><span class="badge status-${data.status || 'نشط'}">${data.status || 'نشط'}</span></td>
                    <td class="sticky-actions">
                        <button class="btn-sm btn-edit" onclick="editCustomer('${doc.id}')"><i class="fas fa-edit"></i></button>
                        <button class="btn-sm btn-delete" onclick="deleteCustomer('${doc.id}')"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>`;
            tableBody.innerHTML += row;
        });
    } catch (error) {
        console.error("خطأ في جلب بيانات العملاء:", error);
    }
}

// فتح نافذة الإضافة
export async function openAddCustomer() {
    const modal = document.getElementById('customer-modal');
    if (modal) modal.style.display = 'flex';
}

// إغلاق نافذة الإضافة/التعديل
export function closeCustomerModal() {
    const modal = document.getElementById('customer-modal');
    if (modal) {
        modal.style.display = 'none';
        // مسح الحقول عند الإغلاق
        document.getElementById('cust-name').value = '';
        document.getElementById('cust-phone').value = '';
    }
}

// حفظ عميل جديد
export async function saveCustomer() {
    const name = document.getElementById('cust-name').value;
    const phone = document.getElementById('cust-phone').value;

    if (!name || !phone) {
        alert("يرجى ملء الاسم ورقم الجوال");
        return;
    }

    try {
        await addDoc(collection(db, "customers"), {
            name: name,
            phone: phone,
            status: "نشط",
            createdAt: new Date()
        });
        closeCustomerModal();
        await renderCustomerTable();
    } catch (e) {
        console.error("خطأ أثناء حفظ العميل:", e);
    }
}

// دالة تعديل العميل (تمت إضافتها لمنع الأخطاء)
export async function editCustomer(id) {
    console.log("تعديل العميل ذو المعرف:", id);
    // يمكنك إضافة منطق التعديل هنا لاحقاً
}

// حذف العميل
export async function deleteCustomer(id) {
    if (confirm("هل أنت متأكد من حذف هذا العميل نهائياً؟")) {
        try {
            await deleteDoc(doc(db, "customers", id));
            await renderCustomerTable();
        } catch (e) {
            console.error("خطأ أثناء الحذف:", e);
        }
    }
}

// القوس النهائي لضمان إغلاق الموديول بشكل صحيح وتجنب SyntaxError
