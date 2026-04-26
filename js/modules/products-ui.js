/**
 * customers-ui.js - Tera Gateway 
 * الإصدار المصلح: معالجة البيانات، ربط النوافذ، وتصحيح الأخطاء البرمجية
 */

import * as Core from './customers-core.js';

let editingId = null;

export async function initCustomersUI(container) {
    if (!container) return;

    // بناء الهيكل الداخلي للموديول
    container.innerHTML = `
        <div class="cust-ui-wrapper">
            <div class="stats-grid">
                <div class="stat-item"><span>إجمالي العملاء</span><strong id="stat-total">0</strong></div>
                <div class="stat-item success"><span>عناوين مكتملة</span><strong id="stat-complete">0</strong></div>
                <div class="stat-item warning"><span>بملاحظات</span><strong id="stat-notes">0</strong></div>
            </div>

            <div class="toolbar-card">
                <div class="search-box">
                    <i class="fas fa-search"></i>
                    <input type="text" id="cust-filter" class="tera-input" placeholder="بحث بالاسم، الجوال، أو الرمز البريدي...">
                </div>
                <button class="btn btn-primary" onclick="openAddCustomer()">
                    <i class="fas fa-user-plus"></i> إضافة عميل جديد
                </button>
            </div>

            <div class="table-container">
                <table class="tera-table">
                    <thead>
                        <tr>
                            <th>العميل</th>
                            <th>الاتصال</th>
                            <th>العنوان الوطني</th>
                            <th>المبنى / الإضافي</th>
                            <th class="sticky-actions">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody id="customers-list-render">
                        <tr><td colspan="5" style="text-align:center; padding:30px;">جاري تحميل بيانات تيرا...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    // تشغيل العمليات الأساسية
    await loadAndRender();
    setupSearch();
    
    // تصحيح: ربط دالة الحفظ بالنموذج الموجود في HTML الرئيسي
    const form = document.getElementById('customer-form');
    if (form) {
        form.onsubmit = (e) => handleCustomerSubmit(e);
    }
}

async function loadAndRender() {
    const list = document.getElementById('customers-list-render');
    if (!list) return;

    const snapshot = await Core.fetchAllCustomers();
    list.innerHTML = '';
    
    let stats = { total: 0, complete: 0, notes: 0 };

    snapshot.forEach(docSnap => {
        const d = docSnap.data();
        const id = docSnap.id;

        stats.total++;
        if (d.notes) stats.notes++;
        if (d.postalCode && d.buildingNo) stats.complete++;

        list.innerHTML += `
            <tr class="customer-row">
                <td>
                    <div style="display:flex; align-items:center; gap:10px;">
                        <div style="width:35px; height:35px; background:#eff6ff; color:#2563eb; border-radius:50%; display:flex; justify-content:center; align-items:center; font-weight:bold;">
                            ${(d.name || '?').charAt(0)}
                        </div>
                        <div>
                            <div style="font-weight:600;">${d.name || 'بدون اسم'}</div>
                            <small style="color:#64748b;">${d.type || 'فرد'}</small>
                        </div>
                    </div>
                </td>
                <td dir="ltr" style="text-align:right;">
                    <div>${d.Phone || '-'}</div>
                    <small style="color:#64748b;">${d.Email || '-'}</small>
                </td>
                <td>
                    <div style="font-size:0.85rem;">
                        <strong>${d.city || '-'}</strong> - ${d.district || '-'}<br>
                        <span style="color:#64748b;">${d.street || '-'} | الرمز: ${d.postalCode || '-'}</span>
                    </div>
                </td>
                <td style="text-align:center;">
                    <div style="font-size:0.85rem;">
                        مبنى: ${d.buildingNo || '-'}<br>إضافي: ${d.additionalNo || '-'}
                    </div>
                </td>
                <td class="sticky-actions">
                    <button class="btn-sm btn-print" onclick="handlePrint('${id}')" title="طباعة"><i class="fas fa-print"></i></button>
                    <button class="btn-sm btn-edit" onclick="handleEdit('${id}')" title="تعديل"><i class="fas fa-pen"></i></button>
                    <button class="btn-sm btn-delete" onclick="handleDelete('${id}')" title="حذف"><i class="fas fa-trash"></i></button>
                </td>
            </tr>`;
    });
    updateStats(stats);
}

// --- إدارة النوافذ (Modals) ---

window.openAddCustomer = () => {
    editingId = null;
    const form = document.getElementById('customer-form');
    if (form) form.reset();
    
    if (window.quill) window.quill.setContents([]);
    
    if (window.openCustomerModal) window.openCustomerModal("إضافة عميل جديد لتيرا");
};

window.handleEdit = async (id) => {
    editingId = id;
    const d = await Core.fetchCustomerById(id);
    if (!d) return;

    // تعبئة الحقول (تأكد من تطابق IDs مع ملف customers.html)
    document.getElementById('cust-name').value = d.name || '';
    document.getElementById('cust-email').value = d.Email || '';
    document.getElementById('cust-country').value = d.country || 'السعودية';
    document.getElementById('cust-city').value = d.city || '';
    document.getElementById('cust-district').value = d.district || '';
    document.getElementById('cust-street').value = d.street || '';
    document.getElementById('cust-building').value = d.buildingNo || '';
    document.getElementById('cust-additional').value = d.additionalNo || '';
    document.getElementById('cust-zip').value = d.postalCode || ''; // تم تغيير المعرف ليتطابق مع ملف HTML
    document.getElementById('cust-pobox').value = d.poBox || '';
    document.getElementById('cust-status').value = d.status || 'نشط';
    document.getElementById('cust-type').value = d.type || 'فرد';
    
    // التعامل مع مفتاح الدولة والرقم
    if (d.Phone && d.Phone.includes(' ')) {
        const parts = d.Phone.split(' ');
        document.getElementById('cust-key').value = parts[0];
        document.getElementById('cust-phone').value = parts[1];
    } else {
        document.getElementById('cust-phone').value = d.Phone || '';
    }

    if (window.quill) {
        window.quill.root.innerHTML = d.notes || '';
    }

    if (window.openCustomerModal) window.openCustomerModal("تعديل بيانات العميل");
};

// الدالة المسؤولة عن الحفظ (تُستدعى من الزر أو الفورم)
window.saveCustomerData = async () => {
    const name = document.getElementById('cust-name').value;
    const phone = document.getElementById('cust-phone').value;
    const key = document.getElementById('cust-key').value;

    if (!name || !phone) {
        alert("يرجى إدخال الاسم ورقم الجوال على الأقل.");
        return;
    }

    const finalData = {
        name: name,
        Email: document.getElementById('cust-email').value,
        Phone: `${key} ${phone}`,
        country: document.getElementById('cust-country').value,
        city: document.getElementById('cust-city').value,
        district: document.getElementById('cust-district').value,
        street: document.getElementById('cust-street').value,
        buildingNo: document.getElementById('cust-building').value,
        additionalNo: document.getElementById('cust-additional').value,
        postalCode: document.getElementById('cust-zip').value,
        poBox: document.getElementById('cust-pobox').value,
        status: document.getElementById('cust-status').value,
        type: document.getElementById('cust-type').value,
        notes: window.quill ? window.quill.root.innerHTML : "",
        updatedAt: new Date()
    };

    try {
        if (editingId) {
            await Core.updateCustomer(editingId, finalData);
        } else {
            finalData.createdAt = new Date();
            await Core.addCustomer(finalData);
        }

        if (window.closeCustomerModal) window.closeCustomerModal();
        await loadAndRender();
    } catch (err) {
        alert("فشل الحفظ: " + err.message);
    }
};

// --- الدوال المساعدة ---

function updateStats(s) {
    if(document.getElementById('stat-total')) document.getElementById('stat-total').innerText = s.total;
    if(document.getElementById('stat-complete')) document.getElementById('stat-complete').innerText = s.complete;
    if(document.getElementById('stat-notes')) document.getElementById('stat-notes').innerText = s.notes;
}

function setupSearch() {
    const filterInput = document.getElementById('cust-filter');
    if (filterInput) {
        filterInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            document.querySelectorAll('.customer-row').forEach(row => {
                row.style.display = row.innerText.toLowerCase().includes(term) ? '' : 'none';
            });
        });
    }
}

window.handleDelete = async (id) => {
    if (confirm('هل أنت متأكد من حذف هذا العميل نهائياً من تيرا؟')) {
        try {
            await Core.removeCustomer(id);
            await loadAndRender();
        } catch (err) {
            alert("خطأ في الحذف: " + err.message);
        }
    }
};

window.handlePrint = (id) => {
    window.open(`admin/modules/customer-print.html?id=${id}`, '_blank');
};
