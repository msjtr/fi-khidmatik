/**
 * موديول واجهة مستخدم العملاء - النسخة المطابقة لبيانات Firestore
 */

// 1. دالة تهيئة موديول العملاء
export async function initCustomersUI(container) {
    console.log("تنشيط واجهة العملاء...");
    
    // التأكد من وجود عنصر الجدول قبل البدء
    const tableBody = container.querySelector('#customers-tbody');
    if (tableBody) {
        await renderCustomersTable(container);
    } else {
        // في حال تأخر تحميل DOM المكونات
        setTimeout(() => renderCustomersTable(document), 200);
    }
}

// 2. دالة جلب البيانات من Firestore وعرضها في الجدول
export async function renderCustomersTable(context = document) {
    const tableBody = context.querySelector('#customers-tbody');
    if (!tableBody) return;

    // رسالة تحميل للمستخدم
    tableBody.innerHTML = '<tr><td colspan="12" style="text-align:center; padding:20px;">جاري جلب بيانات العملاء...</td></tr>';

    try {
        // التحقق من اتصال قاعدة البيانات
        if (!window.db) throw new Error("قاعدة البيانات غير متصلة");

        const querySnapshot = await window.db.collection("customers").orderBy("name").get();
        
        if (querySnapshot.empty) {
            tableBody.innerHTML = '<tr><td colspan="12" style="text-align:center; padding:20px;">لا يوجد سجلات عملاء حالياً.</td></tr>';
            return;
        }

        let rowsHTML = '';
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const id = doc.id;

            // معالجة القيم لتجنب ظهور undefined
            const name = data.name || '---';
            const phone = data.phone || '---';
            const city = data.city || '---';
            const classification = data.classification || 'REGULAR';
            const building = data.building_no || '---';
            const additional = data.additional_no || '---';
            const zip = data.zip_code || '---';
            const pobox = data.po_box || '---';

            rowsHTML += `
                <tr id="row-${id}">
                    <td class="customer-name-cell">
                        <div class="avatar-sm">${name.charAt(0)}</div>
                        <span>${name}</span>
                    </td>
                    <td dir="ltr">${phone}</td>
                    <td>${city}</td>
                    <td><span class="badge ${classification.toLowerCase()}">${classification}</span></td>
                    <td>${building}</td>
                    <td>${additional}</td>
                    <td>${zip}</td>
                    <td>${pobox}</td>
                    <td class="actions-cell">
                        <div class="action-buttons">
                            <button onclick="window.editCustomer('${id}')" class="btn-icon edit" title="تعديل"><i class="fas fa-edit"></i></button>
                            <button onclick="window.printCustomer('${id}')" class="btn-icon print" title="طباعة"><i class="fas fa-print"></i></button>
                            <button onclick="window.deleteCustomer('${id}')" class="btn-icon delete" title="حذف"><i class="fas fa-trash"></i></button>
                        </div>
                    </td>
                </tr>
            `;
        });

        tableBody.innerHTML = rowsHTML;

    } catch (error) {
        console.error("Firestore Error:", error);
        tableBody.innerHTML = `<tr><td colspan="12" style="color:red; text-align:center;">خطأ في تحميل البيانات: ${error.message}</td></tr>`;
    }
}

// 3. الدوال العالمية للتحكم (إضافة/تعديل/حذف)

window.openCustomerModal = function(mode = 'add', id = null) {
    const modal = document.getElementById('customer-modal');
    const form = document.getElementById('customer-form');
    if (!modal || !form) return;

    form.reset();
    form.dataset.mode = mode;
    form.dataset.id = id || '';

    if (mode === 'edit' && id) {
        document.getElementById('modal-title').innerText = 'تعديل بيانات العميل الكاملة';
        loadCustomerToForm(id);
    } else {
        document.getElementById('modal-title').innerText = 'إضافة بيانات العميل الكاملة';
    }

    modal.style.display = 'flex';
};

// تحميل البيانات للنموذج عند التعديل
async function loadCustomerToForm(id) {
    try {
        const doc = await window.db.collection("customers").doc(id).get();
        if (doc.exists) {
            const data = doc.data();
            const form = document.getElementById('customer-form');
            // ملء الحقول بناءً على الـ ID في modals.html
            form.elements['name'].value = data.name || '';
            form.elements['phone'].value = data.phone || '';
            form.elements['national_id'].value = data.national_id || '';
            form.elements['classification'].value = data.classification || 'REGULAR';
            form.elements['city'].value = data.city || '';
            form.elements['building_no'].value = data.building_no || '';
            // إضافة باقي الحقول حسب الحاجة...
        }
    } catch (e) { console.error("Error loading customer:", e); }
}

window.deleteCustomer = async function(id) {
    if (confirm("هل أنت متأكد من حذف هذا العميل نهائياً؟")) {
        try {
            await window.db.collection("customers").doc(id).delete();
            renderCustomersTable(); // تحديث الجدول بعد الحذف
        } catch (e) { alert("خطأ في الحذف: " + e.message); }
    }
};

export async function handleCustomerSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const mode = form.dataset.mode;
    const id = form.dataset.id;
    
    const formData = new FormData(form);
    const customerData = Object.fromEntries(formData.entries());
    customerData.updatedAt = new Date();

    try {
        if (mode === 'edit') {
            await window.db.collection("customers").doc(id).update(customerData);
        } else {
            customerData.createdAt = new Date();
            await window.db.collection("customers").add(customerData);
        }
        window.closeCustomerModal();
        renderCustomersTable();
    } catch (error) {
        alert("فشل الحفظ: " + error.message);
    }
}
