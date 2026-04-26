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
                    <select id="filter-status" class="tera-input" style="width:150px;">
                        <option value="">حالة العميل</option>
                        <option value="نشط">نشط</option>
                        <option value="معلق">معلق</option>
                        <option value="موقوف">موقوف</option>
                    </select>
                    <select id="filter-type" class="tera-input" style="width:150px;">
                        <option value="">التصنيف</option>
                        <option value="فرد">فرد</option>
                        <option value="شركة">شركة</option>
                        <option value="VIP">VIP</option>
                    </select>
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

        // ملاحظة: Firestore snapshot يحتاج لاستخدام forEach الخاص به
        snapshot.forEach((docSnap) => {
            const d = docSnap.data();
            const id = docSnap.id;

            // تطبيق الفلترة الحية
            const matchesSearch = !searchTerm || 
                d.name?.toLowerCase().includes(searchTerm) || 
                d.phone?.includes(searchTerm) || 
                d.city?.toLowerCase().includes(searchTerm);
            
            const matchesStatus = !statusFilter || d.status === statusFilter;
            const matchesType = !typeFilter || d.type === typeFilter;

            if (matchesSearch && matchesStatus && matchesType) {
                stats.total++;
                if (d.status === 'نشط') stats.active++;
                if (!d.city || !d.district) stats.incomplete++;

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
        console.error("Error refreshing table:", err);
        tbody.innerHTML = `<tr><td colspan="17" style="color:red; text-align:center;">خطأ في تحميل البيانات: ${err.message}</td></tr>`;
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
            // تصفير Quill إذا كان موجوداً
            if (window.quill) window.quill.setContents([]);
            if (data) fillFormFields(data);
        }
    }
}

/**
 * وظيفة 2: التعديل
 */
window.editCustomerAction = async (id) => {
    const data = await Core.fetchCustomerById(id);
    if (data) openFormModal(data);
};

function fillFormFields(data) {
    // التأكد من وجود العناصر قبل التعبئة لتجنب أخطاء JS
    const fields = {
        'cust-name': data.name,
        'cust-phone': data.phone,
        'cust-key': data.countryKey,
        'cust-email': data.email,
        'cust-country': data.country,
        'cust-city': data.city,
        'cust-district': data.district,
        'cust-street': data.street,
        'cust-building': data.buildingNo,
        'cust-additional': data.additionalNo,
        'cust-zip': data.zipCode,
        'cust-pobox': data.poBox,
        'cust-status': data.status,
        'cust-type': data.type
    };

    for (let id in fields) {
        const el = document.getElementById(id);
        if (el) el.value = fields[id] || '';
    }
    
    if (data.notes && window.quill) {
        window.quill.root.innerHTML = data.notes;
    }
}

/**
 * وظيفة 3: الحفظ (تعديل أو إضافة)
 */
window.saveCustomerData = async () => {
    const formData = gatherFormData();
    if (!formData.name || !formData.phone) return alert("يرجى إدخال الاسم ورقم الجوال على الأقل.");

    try {
        if (editingId) {
            await Core.updateCustomer(editingId, formData);
        } else {
            await Core.addCustomer(formData);
        }
        
        if (window.closeCustomerModal) window.closeCustomerModal();
        refreshCustomerTable();
    } catch (err) {
        alert("حدث خطأ أثناء الحفظ: " + err.message);
    }
};

/**
 * وظيفة 4: الحذف
 */
window.deleteCustomerAction = async (id, name) => {
    if (confirm(`هل أنت متأكد من حذف العميل "${name}"؟`)) {
        try {
            await Core.deleteCustomer(id);
            refreshCustomerTable();
        } catch (err) {
            alert("فشل الحذف");
        }
    }
};

/**
 * وظيفة 5: الطباعة
 */
window.printCustomerAction = async (id) => {
    const data = await Core.fetchCustomerById(id);
    if (!data) return;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html dir="rtl">
        <head>
            <title>تقرير عميل - ${data.name}</title>
            <style>
                body { font-family: 'Tajawal', sans-serif; padding: 40px; }
                .report-header { border-bottom: 2px solid #2563eb; margin-bottom: 30px; text-align: center; }
                .data-row { margin-bottom: 15px; font-size: 1.1rem; }
                .label { font-weight: bold; color: #444; width: 150px; display: inline-block; }
            </style>
        </head>
        <body onload="window.print()">
            <div class="report-header">
                <h1>بطاقة بيانات عميل</h1>
                <p>نظام تيرا جيت واي (Tera Gateway)</p>
            </div>
            <div class="data-row"><span class="label">الاسم:</span> ${data.name}</div>
            <div class="data-row"><span class="label">الجوال:</span> ${data.phone}</div>
            <div class="data-row"><span class="label">البريد:</span> ${data.email || '-'}</div>
            <div class="data-row"><span class="label">العنوان:</span> ${data.city} - ${data.district}</div>
            <div class="data-row"><span class="label">الرمز البريدي:</span> ${data.zipCode || '-'}</div>
            <div class="data-row"><span class="label">الحالة:</span> ${data.status}</div>
        </body>
        </html>
    `);
    printWindow.document.close();
};

function gatherFormData() {
    return {
        name: document.getElementById('cust-name')?.value,
        phone: document.getElementById('cust-phone')?.value,
        countryKey: document.getElementById('cust-key')?.value,
        email: document.getElementById('cust-email')?.value,
        country: document.getElementById('cust-country')?.value,
        city: document.getElementById('cust-city')?.value,
        district: document.getElementById('cust-district')?.value,
        street: document.getElementById('cust-street')?.value,
        buildingNo: document.getElementById('cust-building')?.value,
        additionalNo: document.getElementById('cust-additional')?.value,
        zipCode: document.getElementById('cust-zip')?.value,
        poBox: document.getElementById('cust-pobox')?.value,
        status: document.getElementById('cust-status')?.value,
        type: document.getElementById('cust-type')?.value,
        notes: window.quill ? window.quill.root.innerHTML : ''
    };
}

function updateStatsUI(s) {
    const container = document.getElementById('stats-container');
    if (container) {
        container.innerHTML = `
            <div class="stat-card"><span>إجمالي العملاء</span><strong>${s.total}</strong></div>
            <div class="stat-card"><span>النشطين</span><strong>${s.active}</strong></div>
            <div class="stat-card"><span>بيانات غير مكتملة</span><strong style="color:#ef4444">${s.incomplete}</strong></div>
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
