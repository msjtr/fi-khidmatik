/**
 * customers-ui.js
 * إدارة واجهة المستخدم والعمليات التفاعلية للعملاء
 */

import * as Core from './customers-core.js';

let editingId = null; // لتتبع حالة التعديل

export async function initCustomersUI(container) {
    if (!container) return;

    // حقن الهيكل الرئيسي
    container.innerHTML = `
        <div class="cust-ui-wrapper">
            <div class="stats-grid">
                <div class="stat-item"><span>إجمالي العملاء</span><strong id="stat-total">0</strong></div>
                <div class="stat-item success"><span>عناوين مكتملة</span><strong id="stat-complete">0</strong></div>
                <div class="stat-item danger"><span>بملاحظات</span><strong id="stat-notes">0</strong></div>
            </div>

            <div class="action-bar">
                <div class="search-box">
                    <i class="fas fa-search"></i>
                    <input type="text" id="cust-filter" placeholder="بحث بالاسم، المدينة، أو الجوال...">
                </div>
                <button class="btn-tera" onclick="showAddCustomerModal()">
                    <i class="fas fa-user-plus"></i> إضافة عميل جديد
                </button>
            </div>

            <div class="table-responsive">
                <table class="tera-table">
                    <thead>
                        <tr>
                            <th>العميل</th>
                            <th>الاتصال</th>
                            <th>العنوان الوطني</th>
                            <th>الحالة</th>
                            <th>الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody id="customers-list-render">
                        <tr><td colspan="5" style="text-align:center; padding:30px;">جاري المزامنة...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    await loadAndRender();

    // تفعيل البحث
    document.getElementById('cust-filter').addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        document.querySelectorAll('.cust-row').forEach(r => {
            r.style.display = r.innerText.toLowerCase().includes(term) ? '' : 'none';
        });
    });
}

async function loadAndRender() {
    const list = document.getElementById('customers-list-render');
    try {
        const snapshot = await Core.fetchAllCustomers();
        list.innerHTML = '';
        let stats = { total: 0, complete: 0, notes: 0 };

        snapshot.forEach(docSnap => {
            const d = docSnap.data();
            const id = docSnap.id;
            stats.total++;
            if (d.notes) stats.notes++;
            if (d.buildingNo && d.postalCode) stats.complete++;

            list.innerHTML += `
                <tr class="cust-row">
                    <td>
                        <div class="avatar-cell">
                            <div class="avatar-icon">${(d.name || '?').charAt(0)}</div>
                            <div><b>${d.name || 'غير مسجل'}</b><br><small>${d.Email || 'لا يوجد بريد'}</small></div>
                        </div>
                    </td>
                    <td dir="ltr" style="text-align:center;">${d.Phone || '-'}</td>
                    <td>
                        <div class="addr-details">
                            <b>${d.city || '-'}</b> - ${d.district || '-'}<br>
                            <small>مبنى: ${d.buildingNo || '-'} | فرعي: ${d.additionalNo || '-'}</small>
                        </div>
                    </td>
                    <td style="text-align:center;">
                        <span class="status-tag ${(d.status === 'محتال' ? 'danger' : d.status === 'مميز' ? 'success' : 'default')}">
                            ${d.status || 'عادي'}
                        </span>
                    </td>
                    <td>
                        <div class="row-actions">
                            <button onclick="handlePrint('${id}')" title="طباعة"><i class="fas fa-print"></i></button>
                            <button onclick="handleEdit('${id}')" title="تعديل"><i class="fas fa-pen"></i></button>
                            <button onclick="handleDelete('${id}')" class="text-danger" title="حذف"><i class="fas fa-trash"></i></button>
                        </div>
                    </td>
                </tr>`;
        });
        updateStatsDisplay(stats);
    } catch (e) { 
        list.innerHTML = '<tr><td colspan="5">فشل الاتصال بقاعدة البيانات</td></tr>'; 
    }
}

function updateStatsDisplay(s) {
    if (document.getElementById('stat-total')) document.getElementById('stat-total').innerText = s.total;
    if (document.getElementById('stat-complete')) document.getElementById('stat-complete').innerText = s.complete;
    if (document.getElementById('stat-notes')) document.getElementById('stat-notes').innerText = s.notes;
}

// --- العمليات العالمية ---

window.showAddCustomerModal = () => {
    editingId = null;
    document.getElementById('customer-form').reset();
    document.getElementById('modal-title').innerText = "إضافة عميل جديد";
    document.getElementById('customer-modal').style.display = 'flex';
};

window.handleEdit = async (id) => {
    editingId = id;
    const d = await Core.fetchCustomerById(id);
    if (!d) return;

    // تعبئة البيانات في الفورم (مطابقة للحقول التي أرسلتها)
    document.getElementById('cust-name').value = d.name || '';
    document.getElementById('cust-email').value = d.Email || '';
    document.getElementById('cust-city').value = d.city || '';
    document.getElementById('cust-district').value = d.district || '';
    document.getElementById('cust-street').value = d.street || '';
    document.getElementById('cust-building').value = d.buildingNo || '';
    document.getElementById('cust-additional').value = d.additionalNo || '';
    document.getElementById('cust-postal').value = d.postalCode || '';
    document.getElementById('cust-pobox').value = d.poBox || '';
    document.getElementById('cust-notes').value = d.notes || '';
    document.getElementById('cust-tag').value = d.status || 'عادي';

    if (d.Phone && d.Phone.includes(' ')) {
        const parts = d.Phone.split(' ');
        document.getElementById('cust-country-code').value = parts[0];
        document.getElementById('cust-phone').value = parts[1];
    } else {
        document.getElementById('cust-phone').value = d.Phone || '';
    }

    document.getElementById('modal-title').innerText = "تعديل بيانات العميل";
    document.getElementById('customer-modal').style.display = 'flex';
};

window.handleCustomerSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const formProps = Object.fromEntries(formData.entries());

    const finalData = {
        name: formProps.name,
        Email: formProps.Email,
        Phone: `${formProps.countryCode} ${formProps.Phone}`,
        country: formProps.country,
        city: formProps.city,
        district: formProps.district,
        street: formProps.street,
        buildingNo: formProps.buildingNo,
        additionalNo: formProps.additionalNo,
        postalCode: formProps.postalCode,
        poBox: formProps.poBox,
        notes: formProps.notes,
        status: formProps.status
    };

    try {
        const btn = event.target.querySelector('.btn-save');
        btn.disabled = true;
        btn.innerText = "جاري الحفظ...";

        if (editingId) {
            await Core.updateCustomer(editingId, finalData);
        } else {
            await Core.addCustomer(finalData);
        }

        window.closeCustomerModal();
        await loadAndRender();
    } catch (e) {
        alert("فشل الحفظ: " + e.message);
    } finally {
        const btn = event.target.querySelector('.btn-save');
        btn.disabled = false;
        btn.innerText = "حفظ البيانات";
    }
};

window.handleDelete = async (id) => {
    if (confirm('⚠️ هل أنت متأكد من حذف هذا العميل نهائياً من نظام تيرا؟')) {
        const success = await Core.removeCustomer(id);
        if (success) await loadAndRender();
    }
};

window.handlePrint = (id) => window.open(`print-card.html?id=${id}`, '_blank');
window.closeCustomerModal = () => document.getElementById('customer-modal').style.display = 'none';
