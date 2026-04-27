/**
 * js/modules/customers-ui.js
 * موديول واجهة مستخدم العملاء - النسخة المحدثة لربط كافة الحقول
 */

// 1. دالة تهيئة الواجهة وعرض الجدول
export async function initCustomersUI(container) {
    console.log("تنشيط واجهة العملاء...");
    await renderCustomersTable(container);
}

// 2. دالة جلب وعرض بيانات العملاء في الجدول
export async function renderCustomersTable(container) {
    const tableBody = container.querySelector('#customers-tbody');
    if (!tableBody) {
        console.error("خطأ: لم يتم العثور على #customers-tbody في الصفحة");
        return;
    }

    tableBody.innerHTML = '<tr><td colspan="12" class="loading-msg">جاري تحميل قاعدة البيانات...</td></tr>';

    try {
        // التأكد من استدعاء Firestore من النطاق العالمي
        const querySnapshot = await window.db.collection("customers").orderBy("name").get();
        
        if (querySnapshot.empty) {
            tableBody.innerHTML = '<tr><td colspan="12" style="text-align:center; padding:20px;">لا يوجد عملاء مسجلين حالياً.</td></tr>';
            return;
        }

        let rows = '';
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const id = doc.id;

            // معالجة رقم الجوال لتجنب ظهور undefined
            const phoneDisplay = data.phone ? data.phone : '---';

            rows += `
                <tr>
                    <td>
                        <div class="user-info">
                            <div class="user-avatar">${(data.name || 'C').charAt(0)}</div>
                            <span>${data.name || '---'}</span>
                        </div>
                    </td>
                    <td dir="ltr">${phoneDisplay}</td>
                    <td>${data.city || '---'}</td>
                    <td>
                        <span class="badge ${data.classification === 'VIP' ? 'vip' : 'regular'}">
                            ${data.classification || 'REGULAR'}
                        </span>
                    </td>
                    <td>${data.building_no || '---'}</td>
                    <td>${data.additional_no || '---'}</td>
                    <td>${data.zip_code || '---'}</td>
                    <td>${data.po_box || '---'}</td>
                    <td>
                        <div class="table-actions">
                            <button onclick="window.editCustomer('${id}')" title="تعديل"><i class="fas fa-edit"></i></button>
                            <button onclick="window.printCustomer('${id}')" title="طباعة"><i class="fas fa-print"></i></button>
                            <button onclick="window.deleteCustomer('${id}')" class="delete" title="حذف"><i class="fas fa-trash"></i></button>
                        </div>
                    </td>
                </tr>
            `;
        });
        tableBody.innerHTML = rows;

    } catch (error) {
        console.error("Firestore Error:", error);
        tableBody.innerHTML = `<tr><td colspan="12" style="color:red; text-align:center;">حدث خطأ أثناء جلب البيانات: ${error.message}</td></tr>`;
    }
}

// 3. دالة فتح النافذة المنبثقة (إضافة / تعديل)
export function openCustomerModal(mode = 'add', id = null) {
    const modal = document.getElementById('customer-modal');
    const form = document.getElementById('customer-form');
    const title = document.getElementById('modal-title');

    if (!modal || !form) return;

    form.reset();
    form.dataset.mode = mode;
    form.dataset.editId = id || '';

    if (mode === 'edit' && id) {
        title.innerHTML = '<i class="fas fa-user-edit"></i> تعديل بيانات العميل';
        loadCustomerDataToForm(id);
    } else {
        title.innerHTML = '<i class="fas fa-user-plus"></i> إضافة عميل جديد';
    }

    modal.style.display = 'flex';
}

// 4. دالة تحميل بيانات عميل معين إلى النموذج عند التعديل
async function loadCustomerDataToForm(id) {
    try {
        const doc = await window.db.collection("customers").doc(id).get();
        if (doc.exists) {
            const data = doc.data();
            const f = document.getElementById('customer-form').elements;
            
            f['name'].value = data.name || '';
            f['phone'].value = data.phone || '';
            f['national_id'].value = data.national_id || '';
            f['email'].value = data.email || '';
            f['dob'].value = data.dob || '';
            f['gender'].value = data.gender || 'ذكر';
            f['classification'].value = data.classification || 'REGULAR';
            f['city'].value = data.city || '';
            f['district'].value = data.district || '';
            f['street'].value = data.street || '';
            f['building_no'].value = data.building_no || '';
            f['additional_no'].value = data.additional_no || '';
            f['zip_code'].value = data.zip_code || '';
            f['po_box'].value = data.po_box || '';
            f['employer'].value = data.employer || '';
            f['salary'].value = data.salary || '';
            f['commitment_status'].value = data.commitment_status || 'ملتزم';
        }
    } catch (error) {
        console.error("Error loading customer:", error);
    }
}

// 5. دالة معالجة إرسال النموذج (حفظ أو تحديث)
export async function handleCustomerSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const mode = form.dataset.mode;
    const editId = form.dataset.editId;
    
    const f = form.elements;
    const customerData = {
        name: f['name'].value,
        phone: f['phone'].value,
        national_id: f['national_id'].value,
        email: f['email'].value,
        dob: f['dob'].value,
        gender: f['gender'].value,
        classification: f['classification'].value,
        city: f['city'].value,
        district: f['district'].value,
        street: f['street'].value,
        building_no: f['building_no'].value,
        additional_no: f['additional_no'].value,
        zip_code: f['zip_code'].value,
        po_box: f['po_box'].value,
        employer: f['employer'].value,
        salary: f['salary'].value,
        commitment_status: f['commitment_status'].value,
        updatedAt: new Date()
    };

    try {
        if (mode === 'edit') {
            await window.db.collection("customers").doc(editId).update(customerData);
        } else {
            customerData.createdAt = new Date();
            await window.db.collection("customers").add(customerData);
        }
        
        window.closeCustomerModal();
        renderCustomersTable(document.getElementById('module-container'));
    } catch (error) {
        alert("فشل في حفظ البيانات: " + error.message);
    }
}

// ربط الدوال بالنطاق العالمي لضمان عمل أزرار onclick في الجدول
window.editCustomer = (id) => openCustomerModal('edit', id);
window.deleteCustomer = async (id) => {
    if (confirm("هل أنت متأكد من حذف هذا العميل نهائياً؟")) {
        try {
            await window.db.collection("customers").doc(id).delete();
            renderCustomersTable(document.getElementById('module-container'));
        } catch (error) {
            alert("خطأ في الحذف: " + error.message);
        }
    }
};
