/**
 * موديول واجهة مستخدم العملاء - إصدار Tera Engine V12.12.1
 * تم الإصلاح: إضافة الأقواس المفقودة، تصدير الدوال، وربط الجسر البرمجي
 */

import { 
    collection, 
    getDocs, 
    doc, 
    deleteDoc, 
    query, 
    orderBy,
    addDoc,
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";

// --- 1. الدالة الرئيسية لتشغيل الموديول ---
export async function initCustomersUI(container) {
    console.log("🚀 Tera Gateway: موديول العملاء نشط");
    const db = window.db;
    
    if (!db) {
        console.error("❌ قاعدة البيانات غير متصلة");
        return;
    }

    const tableBody = document.getElementById('customers-data-rows');
    if (tableBody) {
        await renderCustomersTable(db, tableBody);
    }
}

// --- 2. دالة جلب وعرض البيانات في الجدول ---
export async function renderCustomersTable(db, tableBody) {
    tableBody.innerHTML = '<tr><td colspan="17" style="text-align:center;">جاري تحميل البيانات...</td></tr>';

    try {
        const customersRef = collection(db, "customers");
        const q = query(customersRef, orderBy("name"));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            tableBody.innerHTML = '<tr><td colspan="17" style="text-align:center;">لا يوجد عملاء مسجلين حالياً.</td></tr>';
            return;
        }

        let html = '';
        let index = 1;

        querySnapshot.forEach((customerDoc) => {
            const data = customerDoc.data();
            const id = customerDoc.id;

            html += `
                <tr>
                    <td>${index++}</td>
                    <td><strong>${data.name || '---'}</strong></td>
                    <td dir="ltr">${data.phone || '---'}</td>
                    <td>${data.city || '---'}</td>
                    <td>${data.classification || 'عادي'}</td>
                    <td><span class="status-badge">${data.status || 'نشط'}</span></td>
                    <td>
                        <button onclick="editCustomerRow('${id}')" class="btn-edit"><i class="fas fa-edit"></i></button>
                        <button onclick="deleteCustomerRow('${id}')" class="btn-delete"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>`;
        });

        tableBody.innerHTML = html;

    } catch (error) {
        console.error("🔴 خطأ في عرض الجدول:", error);
        tableBody.innerHTML = `<tr><td colspan="17" style="color:red;">خطأ: ${error.message}</td></tr>`;
    }
}

// --- 3. دالة فتح مودال إضافة عميل جديد ---
export function openAddCustomerModal() {
    const modal = document.getElementById('customerModal') || document.getElementById('customer-modal');
    if (modal) {
        modal.style.display = 'flex';
        const form = modal.querySelector('form');
        if (form) form.reset();
        console.log("✅ تم فتح نافذة إضافة عميل");
    }
}

// --- 4. دالة حذف عميل ---
window.deleteCustomerRow = async (id) => {
    if (confirm("هل أنت متأكد من حذف هذا العميل نهائياً؟")) {
        try {
            await deleteDoc(doc(window.db, "customers", id));
            alert("تم الحذف بنجاح");
            const tableBody = document.getElementById('customers-data-rows');
            if (tableBody) renderCustomersTable(window.db, tableBody);
        } catch (e) {
            alert("خطأ في الحذف: " + e.message);
        }
    }
};

// --- 5. دالة تعديل عميل ---
window.editCustomerRow = (id) => {
    console.log("تعديل العميل ذو المعرف:", id);
    // هنا يتم وضع منطق فتح المودال وتعبئة البيانات
    if (window.openCustomerModal) window.openCustomerModal('edit', id);
};

// إغلاق أي أقواس مفتوحة لضمان عدم حدوث Syntax Error
console.log("✅ تم تحميل ملف customers-ui.js بالكامل.");
