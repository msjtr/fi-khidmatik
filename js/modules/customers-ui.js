/**
 * موديول واجهة مستخدم العملاء - Tera Gateway
 * نسخة معالجة خطأ كائن Firestore v12
 */

import { 
    collection, 
    getDocs, 
    query, 
    orderBy, 
    doc, 
    deleteDoc 
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

export async function initCustomersUI(container) {
    console.log("🚀 جاري فحص محرك البيانات...");

    // التأكد من أن window.db هو كائن Firestore صحيح وليس مجرد نص أو undefined
    if (!window.db || typeof window.db !== 'object') {
        console.error("❌ خطأ: window.db ليس كائن Firestore صالح. راجع ملف main.js");
        return;
    }

    const tableBody = container.querySelector('#customers-data-rows');
    if (tableBody) {
        await renderCustomersTable(tableBody);
    }
}

async function renderCustomersTable(tableBody) {
    tableBody.innerHTML = '<tr><td colspan="17" style="text-align:center; padding:20px;">جاري سحب البيانات من السحابة...</td></tr>';

    try {
        // التأكد من تمرير window.db كأول معامل للدالة collection
        const db = window.db; 
        const customersRef = collection(db, "customers"); 
        const q = query(customersRef, orderBy("name", "asc"));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            tableBody.innerHTML = '<tr><td colspan="17" style="text-align:center; padding:30px;">قاعدة بيانات العملاء فارغة.</td></tr>';
            return;
        }

        let html = '';
        let stats = { total: 0, vip: 0, complete: 0, incomplete: 0 };
        let index = 1;

        querySnapshot.forEach((customerDoc) => {
            const data = customerDoc.data();
            const id = customerDoc.id;

            // تحديث الإحصائيات بناءً على حقولك الحقيقية
            stats.total++;
            if (data.tag === 'vip') stats.vip++;
            
            // فحص اكتمال البيانات الأساسية
            const isComplete = data.name && data.phone && data.city && data.buildingNo;
            isComplete ? stats.complete++ : stats.incomplete++;

            // تنسيق التاريخ من String إلى مقروء
            const dateDisplay = data.createdAt ? new Date(data.createdAt).toLocaleDateString('ar-SA') : '---';

            html += `
                <tr class="customer-row">
                    <td class="sticky-col">${index++}</td>
                    <td class="sticky-col-name"><strong>${data.name || '---'}</strong></td>
                    <td dir="ltr">${data.phone || '---'}</td>
                    <td>${data.countryCode || '+966'}</td>
                    <td>${data.email || '---'}</td>
                    <td>${data.country || 'المملكة العربية السعودية'}</td>
                    <td>${data.city || '---'}</td>
                    <td>${data.district || '---'}</td>
                    <td>${data.street || '---'}</td>
                    <td>${data.buildingNo || '---'}</td>
                    <td>${data.additionalNo || '---'}</td>
                    <td>${data.postalCode || '---'}</td>
                    <td>${data.poBox || '---'}</td>
                    <td>${dateDisplay}</td>
                    <td><span class="status-badge status-active">نشط</span></td>
                    <td><span class="badge ${data.tag === 'vip' ? 'vip' : 'reg'}">${data.tag || 'عادي'}</span></td>
                    <td class="sticky-actions">
                        <div class="table-actions">
                            <button onclick="window.editCustomer('${id}')" class="action-btn edit"><i class="fas fa-edit"></i></button>
                            <button onclick="window.deleteCustomer('${id}')" class="action-btn delete"><i class="fas fa-trash"></i></button>
                        </div>
                    </td>
                </tr>
            `;
        });

        tableBody.innerHTML = html;
        updateStats(stats);

    } catch (error) {
        console.error("🔴 فشل العرض النهائي:", error);
        tableBody.innerHTML = `<tr><td colspan="17" style="color:red; text-align:center;">خطأ في Firestore: ${error.message}</td></tr>`;
    }
}

function updateStats(s) {
    const fields = ['total', 'vip', 'complete', 'incomplete'];
    fields.forEach(f => {
        const el = document.getElementById(`stat-${f}`);
        if (el) el.innerText = s[f] || 0;
    });
}

// الدوال العالمية
window.deleteCustomer = async (id) => {
    if (confirm("هل تريد حذف بيانات العميل نهائياً؟")) {
        try {
            await deleteDoc(doc(window.db, "customers", id));
            renderCustomersTable(document.getElementById('customers-data-rows'));
        } catch (e) { alert("فشل الحذف: " + e.message); }
    }
};

window.editCustomer = (id) => window.openCustomerModal?.('edit', id);
