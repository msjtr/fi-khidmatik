/**
 * نظام إدارة العملاء الشامل - Tera Gateway
 * تنفيذ وربط فعلي لـ 17 حقلاً مع العمليات الحيوية
 */
import * as Core from './customers-core.js';

let editingId = null;

export async function initCustomersUI(container) {
    if (!container) return;

    // 1. بناء واجهة الإحصائيات والبحث والأزرار الأساسية
    container.innerHTML = `
        <div class="customers-dashboard" style="direction: rtl; font-family: 'Tajawal', sans-serif;">
            <div id="stats-container" class="stats-grid"></div>

            <div class="toolbar-card">
                <div class="search-box">
                    <i class="fas fa-search"></i>
                    <input type="text" id="main-search" placeholder="بحث بالاسم، الجوال، المدينة، أو التصنيف...">
                </div>
                
                <div class="filter-group" style="display:flex; gap:10px;">
                    <select id="filter-status" class="tera-input" style="width:150px;"><option value="">حالة العميل</option><option value="نشط">نشط</option><option value="معلق">معلق</option><option value="موقوف">موقوف</option></select>
                    <select id="filter-type" class="tera-input" style="width:150px;"><option value="">التصنيف</option><option value="فرد">فرد</option><option value="شركة">شركة</option><option value="VIP">VIP</option></select>
                    <button id="btn-add-customer" class="btn btn-primary"><i class="fas fa-user-plus"></i> إضافة عميل جديد</button>
                </div>
            </div>

            <div class="table-container">
                <table id="main-customers-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>الاسم الكامل</th>
                            <th>الجوال</th>
                            <th>المفتاح</th>
                            <th>البريد</th>
                            <th>الدولة</th>
                            <th>المدينة</th>
                            <th>الحي</th>
                            <th>الشارع</th>
                            <th>رقم المبنى</th>
                            <th>الإضافي</th>
                            <th>الرمز البريدي</th>
                            <th>ص.ب</th>
                            <th>التاريخ</th>
                            <th>الحالة</th>
                            <th>التصنيف</th>
                            <th class="sticky-actions">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody id="customers-tbody">
                        <tr><td colspan="17" style="text-align:center; padding:50px;"><i class="fas fa-spinner fa-spin"></i> جاري جلب البيانات من القاعدة...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;

    // 2. ربط الأحداث (Event Listeners)
    document.getElementById('btn-add-customer').onclick = () => openFormModal();
    document.getElementById('main-search').oninput = debounce(() => refreshCustomerTable(), 300);
    document.getElementById('filter-status').onchange = () => refreshCustomerTable();
    document.getElementById('filter-type').onchange = () => refreshCustomerTable();

    // 3. تحميل البيانات لأول مرة
    await refreshCustomerTable();
}

/**
 * وظيفة: جلب البيانات وتحديث الجدول والإحصائيات مع الفلترة
 */
async function refreshCustomerTable() {
    const tbody = document.getElementById('customers-tbody');
    const searchTerm = document.getElementById('main-search')?.value.toLowerCase() || '';
    const statusFilter = document.getElementById('filter-status')?.value || '';
    const typeFilter = document.getElementById('filter-type')?.value || '';

    try {
        const snapshot = await Core.fetchAllCustomers();
        let rowsHtml = '';
        let stats = { total: 0, active: 0, pending: 0, incomplete: 0 };
        let counter = 1;

        snapshot.forEach((docSnap) => {
            const d = docSnap.data();
            const id = docSnap.id;

            // تطبيق الفلترة الحية (Client-side search)
            const matchesSearch = d.name?.toLowerCase().includes(searchTerm) || d.phone?.includes(searchTerm) || d.city?.includes(searchTerm);
            const matchesStatus = !statusFilter || d.status === statusFilter;
            const matchesType = !typeFilter || d.type === typeFilter;

            if (matchesSearch && matchesStatus && matchesType) {
                // حساب الإحصائيات
                stats.total++;
                if (d.status === 'نشط') stats.active++;
                if (!d.city || !d.email) stats.incomplete++;

                rowsHtml += `
                    <tr class="customer-row">
                        <td>${counter++}</td>
                        <td style="font-weight:bold; color:var(--primary);">${d.name || '-'}</td>
                        <td dir="ltr">${d.phone || '-'}</td>
                        <td>${d.countryKey || '+966'}</td>
                        <td>${d.email || '-'}</td>
                        <td>${d.country || 'السعودية'}</td>
                        <td>${d.city || '-'}</td>
                        <td>${d.district || '-'}</td>
                        <td>${d.street || '-'}</td>
                        <td>${d.buildingNo || '-'}</td>
                        <td>${d.additionalNo || '-'}</td>
                        <td>${d.zipCode || '-'}</td>
                        <td>${d.poBox || '-'}</td>
                        <td>${d.createdAt ? d.createdAt.substring(0,10) : '-'}</td>
                        <td><span class="badge status-${d.status || 'معلق'}">${d.status || 'معلق'}</span></td>
                        <td><span class="badge type-${d.type || 'فرد'}">${d.type || 'فرد'}</span></td>
                        <td class="sticky-actions">
                            <button onclick="window.editCustomerAction('${id}')" class="btn-sm btn-edit" title="تعديل"><i class="fas fa-pen"></i></button>
                            <button onclick="window.printCustomerAction('${id}')" class="btn-sm btn-print" title="طباعة"><i class="fas fa-print"></i></button>
                            <button onclick="window.deleteCustomerAction('${id}', '${d.name}')" class="btn-sm btn-delete" title="حذف"><i class="fas fa-trash"></i></button>
                        </td>
                    </tr>`;
            }
        });

        tbody.innerHTML = rowsHtml || '<tr><td colspan="17" style="text-align:center; padding:30px;">لا توجد نتائج تطابق البحث</td></tr>';
        updateStatsUI(stats);
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="17" style="color:red; text-align:center;">خطأ: ${err.message}</td></tr>`;
    }
}

/**
 * وظيفة 1: إضافة عميل جديد
 */
function openFormModal(data = null) {
    editingId = data ? data.id : null;
    if (window.openCustomerModal) {
        window.openCustomerModal(editingId ? `تعديل بيانات: ${data.name}` : "إضافة عميل جديد للنظام");
        const form = document.getElementById('customer-form');
        if (form) {
            form.reset();
            if (window.quill) window.quill.setContents([]); // تصفير محرر الملاحظات
            if (data) fillFormFields(data);
        }
    }
}

/**
 * وظيفة 2: التعديل (تعبئة الحقول الـ 17)
 */
window.editCustomerAction = async (id) => {
    const data = await Core.fetchCustomerById(id);
    if (data) openFormModal({ id, ...data });
};

function fillFormFields(data) {
    document.getElementById('cust-name').value = data.name || '';
    document.getElementById('cust-phone').value = data.phone || '';
    document.getElementById('cust-email').value = data.email || '';
    document.getElementById('cust-city').value = data.city || '';
    document.getElementById('cust-district').value = data.district || '';
    document.getElementById('cust-street').value = data.street || '';
    document.getElementById('cust-building').value = data.buildingNo || '';
    document.getElementById('cust-additional').value = data.additionalNo || '';
    document.getElementById('cust-zip').value = data.zipCode || '';
    document.getElementById('cust-pobox').value = data.poBox || '';
    document.getElementById('cust-status').value = data.status || 'نشط';
    document.getElementById('cust-type').value = data.type || 'فرد';
    
    // التعامل مع Select2 للدولة ومفتاح الاتصال
    if (data.country) {
        $('#cust-country').val(data.country).trigger('change');
    }
    
    // تعبئة الملاحظات في محرر Quill
    if (data.notes && window.quill) {
        window.quill.root.innerHTML = data.notes;
    }
}

/**
 * وظيفة 3: الحفظ الحقيقي (Add/Update)
 */
window.saveCustomerData = async () => {
    const formData = gatherFormData();
    if (!formData.name || !formData.phone) return alert("الاسم ورقم الجوال حقول إجبارية!");

    try {
        if (editingId) {
            await Core.updateCustomer(editingId, formData);
            await Core.logActivity(`تعديل بيانات العميل: ${formData.name}`);
        } else {
            formData.createdAt = new Date().toISOString();
            await Core.addCustomer(formData);
            await Core.logActivity(`إضافة عميل جديد: ${formData.name}`);
        }
        window.closeCustomerModal();
        refreshCustomerTable();
    } catch (err) {
        alert("فشل الحفظ: " + err.message);
    }
};

/**
 * وظيفة 4: الحذف الفعلي
 */
window.deleteCustomerAction = async (id, name) => {
    if (confirm(`هل أنت متأكد من حذف العميل "${name}" نهائياً؟`)) {
        try {
            await Core.deleteCustomer(id);
            await Core.logActivity(`حذف العميل: ${name}`);
            refreshCustomerTable();
        } catch (err) {
            alert("فشل الحذف");
        }
    }
};

/**
 * وظيفة 5: الطباعة الاحترافية
 */
window.printCustomerAction = async (id) => {
    const data = await Core.fetchCustomerById(id);
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html dir="rtl">
        <head>
            <title>بطاقة عميل - ${data.name}</title>
            <style>
                body { font-family: 'Tajawal', sans-serif; padding: 40px; color: #333; }
                .header { text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 20px; }
                .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 30px; }
                .info-item { border-bottom: 1px solid #eee; padding: 10px 0; }
                .label { font-weight: bold; color: #666; }
            </style>
        </head>
        <body onload="window.print()">
            <div class="header"><h1>ملف بيانات العميل</h1><p>تيرا جيت واي - Tera Gateway</p></div>
            <div class="info-grid">
                <div class="info-item"><span class="label">الاسم:</span> ${data.name}</div>
                <div class="info-item"><span class="label">الجوال:</span> ${data.phone}</div>
                <div class="info-item"><span class="label">المدينة:</span> ${data.city}</div>
                <div class="info-item"><span class="label">العنوان:</span> ${data.district} - ${data.street}</div>
                <div class="info-item"><span class="label">الحالة:</span> ${data.status}</div>
                <div class="info-item"><span class="label">التصنيف:</span> ${data.type}</div>
            </div>
        </body>
        </html>
    `);
    printWindow.document.close();
};

function gatherFormData() {
    return {
        name: document.getElementById('cust-name').value,
        phone: document.getElementById('cust-phone').value,
        countryKey: document.getElementById('cust-key').value,
        email: document.getElementById('cust-email').value,
        country: document.getElementById('cust-country').value,
        city: document.getElementById('cust-city').value,
        district: document.getElementById('cust-district').value,
        street: document.getElementById('cust-street').value,
        buildingNo: document.getElementById('cust-building').value,
        additionalNo: document.getElementById('cust-additional').value,
        zipCode: document.getElementById('cust-zip').value,
        poBox: document.getElementById('cust-pobox').value,
        status: document.getElementById('cust-status').value,
        type: document.getElementById('cust-type').value,
        notes: window.quill ? window.quill.root.innerHTML : '',
        updatedAt: new Date().toISOString()
    };
}

function updateStatsUI(s) {
    const container = document.getElementById('stats-container');
    if (container) {
        container.innerHTML = `
            <div class="stat-card"><span>إجمالي المسجلين</span><strong>${s.total}</strong></div>
            <div class="stat-card"><span>عملاء نشطين</span><strong>${s.active}</strong></div>
            <div class="stat-card"><span>تحتاج استكمال</span><strong style="color:var(--danger)">${s.incomplete}</strong></div>
        `;
    }
}

function debounce(func, timeout = 300) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => { func.apply(this, args); }, timeout);
    };
}
