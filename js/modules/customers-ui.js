/**
 * customers-ui.js - Tera Gateway 
 * نظام إدارة العملاء الشامل - تنفيذ فعلي 100%
 */

import * as Core from './customers-core.js';

let editingId = null;

export async function initCustomersUI(container) {
    if (!container) return;

    // بناء الهيكل الأساسي مع الإحصائيات وتحسين التصميم
    container.innerHTML = `
        <div class="main-wrapper" style="direction: rtl; font-family: 'Tajawal', sans-serif; padding: 20px;">
            
            <div id="stats-board" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 25px;">
                </div>

            <div style="background:#fff; padding:20px; border-radius:20px; margin-bottom:20px; display:flex; flex-wrap:wrap; gap:15px; align-items:center; justify-content:space-between; box-shadow: var(--sidebar-shadow);">
                <div style="display:flex; gap:10px;">
                    <button id="btn-add-new" class="action-btn" style="background:#f97316; color:white; border:none; padding:12px 25px; border-radius:12px; cursor:pointer; font-weight:800; display:flex; align-items:center; gap:8px; transition: 0.3s;">
                        <i class="fas fa-plus-circle"></i> إضافة عميل جديد
                    </button>
                </div>
                
                <div style="display:flex; gap:12px; flex-grow:1; max-width:700px;">
                    <div style="position:relative; flex-grow:1;">
                        <i class="fas fa-search" style="position:absolute; right:15px; top:15px; color:#94a3b8;"></i>
                        <input type="text" id="global-search" placeholder="بحث باسم العميل، رقم الجوال، أو المدينة..." 
                               style="width:100%; padding:12px 45px 12px 15px; border-radius:12px; border:1px solid #e2e8f0; font-family:inherit;">
                    </div>
                    <select id="filter-status" style="padding:10px 20px; border-radius:12px; border:1px solid #e2e8f0; font-weight:600; color:#475569;">
                        <option value="">كل الحالات</option>
                        <option value="نشط">نشط</option>
                        <option value="معلق">معلق</option>
                        <option value="موقوف">موقوف</option>
                    </select>
                </div>
            </div>

            <div style="background:#fff; border-radius:20px; overflow:hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
                <div style="overflow-x:auto;">
                    <table id="customers-table" style="width:100%; text-align:right; border-collapse:collapse; min-width:1800px;">
                        <thead style="background:#f8fafc; color:#64748b;">
                            <tr>
                                <th style="padding:20px 15px;">#</th>
                                <th>العميل</th>
                                <th>الاتصال</th>
                                <th>الهوية</th>
                                <th>العنوان الوطني (المدينة/الحي)</th>
                                <th>رقم المبنى</th>
                                <th>جهة العمل</th>
                                <th>الراتب</th>
                                <th>حالة الالتزام</th>
                                <th>تاريخ الإضافة</th>
                                <th>الحالة</th>
                                <th style="position:sticky; left:0; background:#f8fafc; text-align:center; padding:0 20px;">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody id="render-area">
                            </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    // ربط الأحداث
    document.getElementById('btn-add-new').addEventListener('click', showAddModal);
    document.getElementById('global-search').addEventListener('input', handleSearch);
    document.getElementById('filter-status').addEventListener('change', handleSearch);

    // تحميل البيانات لأول مرة
    await loadAndRender();
}

/**
 * جلب البيانات من Firestore ورندرتها في الجدول
 */
async function loadAndRender() {
    const tbody = document.getElementById('render-area');
    if (!tbody) return;

    try {
        const snapshot = await Core.fetchAllCustomers(); 
        tbody.innerHTML = '';
        let stats = { total: 0, active: 0, pending: 0, badDebt: 0 };

        let index = 1;
        snapshot.forEach(docSnap => {
            const d = docSnap.data();
            const id = docSnap.id;
            
            // تحديث الإحصائيات
            stats.total++;
            if (d.status === 'نشط') stats.active++;
            if (d.status === 'معلق') stats.pending++;
            if (d.commitment === 'متعثر') stats.badDebt++;

            tbody.innerHTML += `
                <tr style="border-bottom:1px solid #f1f5f9; transition:0.2s;" class="customer-row">
                    <td style="padding:15px; font-weight:bold; color:#94a3b8;">${index++}</td>
                    <td>
                        <div style="display:flex; flex-direction:column;">
                            <span style="font-weight:800; color:#1e293b;">${d.name || '-'}</span>
                            <span style="font-size:0.75rem; color:#64748b;">${d.email || ''}</span>
                        </div>
                    </td>
                    <td dir="ltr" style="font-weight:600; color:#0f172a;">${d.phone || '-'}</td>
                    <td style="font-family:monospace; color:#475569;">${d.nationalId || d.idNumber || '-'}</td>
                    <td>${d.city || '-'} - ${d.district || '-'}</td>
                    <td style="font-weight:bold;">${d.buildingNo || '-'}</td>
                    <td>${d.employer || '-'}</td>
                    <td style="color:#10b981; font-weight:bold;">${d.salary ? Number(d.salary).toLocaleString() + ' ر.س' : '-'}</td>
                    <td><span class="commitment-tag ${d.commitment === 'متعثر' ? 'danger' : 'success'}">${d.commitment || 'ملتزم'}</span></td>
                    <td style="font-size:0.85rem; color:#94a3b8;">${d.createdAt ? d.createdAt.substring(0, 10) : '-'}</td>
                    <td><span class="status-badge ${getStatusClass(d.status)}">${d.status || 'معلق'}</span></td>
                    <td style="position:sticky; left:0; background:#fff; text-align:center; box-shadow:-5px 0 15px rgba(0,0,0,0.05); padding:10px 20px;">
                        <div style="display:flex; gap:10px; justify-content:center;">
                            <button onclick="window.handleEdit('${id}')" class="btn-icon edit" title="تعديل"><i class="fas fa-edit"></i></button>
                            <button onclick="window.handlePrint('${id}')" class="btn-icon print" title="طباعة العقد"><i class="fas fa-file-invoice"></i></button>
                            <button onclick="window.handleDelete('${id}', '${d.name}')" class="btn-icon delete" title="حذف"><i class="fas fa-trash-alt"></i></button>
                        </div>
                    </td>
                </tr>
            `;
        });

        updateStatsUI(stats);

    } catch (error) {
        console.error("خطأ أثناء عرض العملاء:", error);
    }
}

/**
 * إدارة المودال (إضافة/تعديل)
 */
function showAddModal() {
    editingId = null;
    const form = document.getElementById('customer-form');
    if (form) form.reset();
    window.openCustomerModal("إضافة عميل جديد لتيرا");
}

window.handleEdit = async (id) => {
    editingId = id;
    const data = await Core.fetchCustomerById(id);
    if (!data) return;

    // خريطة ربط الحقول (Field Map) لـ 17 حقلاً
    const fieldMap = {
        'cust-name': data.name,
        'cust-phone': data.phone,
        'cust-national-id': data.nationalId,
        'cust-email': data.email,
        'cust-dob': data.dob,
        'cust-gender': data.gender,
        'cust-city': data.city,
        'cust-district': data.district,
        'cust-street': data.street,
        'cust-building-no': data.buildingNo,
        'cust-zip-code': data.zipCode,
        'cust-additional-no': data.additionalNo,
        'cust-unit-no': data.unitNo,
        'cust-employer': data.employer,
        'cust-salary': data.salary,
        'cust-commitment': data.commitment,
        'cust-notes': data.notes,
        'cust-status': data.status
    };

    // تعبئة الفورم برمجياً
    Object.keys(fieldMap).forEach(key => {
        const el = document.getElementById(key);
        if (el) el.value = fieldMap[key] || '';
    });

    window.openCustomerModal("تعديل بيانات: " + data.name);
};

/**
 * الحفظ والحذف
 */
window.saveCustomerData = async () => {
    const form = document.getElementById('customer-form');
    if (!form.checkValidity()) {
        alert("يرجى ملء الحقول المطلوبة (الاسم والجوال)");
        return;
    }

    const formData = {
        name: document.getElementById('cust-name').value,
        phone: document.getElementById('cust-phone').value,
        nationalId: document.getElementById('cust-national-id').value,
        email: document.getElementById('cust-email').value,
        city: document.getElementById('cust-city').value,
        district: document.getElementById('cust-district').value,
        salary: document.getElementById
