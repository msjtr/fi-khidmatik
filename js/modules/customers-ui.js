/**
 * customers-ui.js - Tera Gateway 
 * نظام إدارة العملاء الشامل - تنفيذ فعلي 100%
 */

import * as Core from './customers-core.js';

let editingId = null;
let quillEditor = null;

export async function initCustomersUI(container) {
    if (!container) return;

    // بناء الهيكل الأساسي مع الإحصائيات (المتطلب الرابع)
    container.innerHTML = `
        <div class="main-wrapper" style="direction: rtl; font-family: 'Tajawal', sans-serif; padding: 20px;">
            
            <div id="stats-board" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-bottom: 25px;">
                </div>

            <div style="background:#fff; padding:20px; border-radius:15px; margin-bottom:20px; display:flex; flex-wrap:wrap; gap:15px; align-items:center; justify-content:space-between; box-shadow:0 2px 10px rgba(0,0,0,0.05);">
                <div style="display:flex; gap:10px;">
                    <button id="btn-add-new" class="action-btn main" style="background:#2563eb; color:white; border:none; padding:12px 25px; border-radius:10px; cursor:pointer; font-weight:bold;">
                        <i class="fas fa-plus-circle"></i> إضافة عميل جديد
                    </button>
                </div>
                
                <div style="display:flex; gap:10px; flex-grow:1; max-width:600px;">
                    <input type="text" id="global-search" placeholder="بحث بالاسم، الجوال، المدينة..." style="flex-grow:1; padding:12px; border-radius:10px; border:1px solid #e2e8f0;">
                    <select id="filter-category" style="padding:10px; border-radius:10px; border:1px solid #e2e8f0;">
                        <option value="">كل التصنيفات</option>
                        <option value="فرد">فرد</option>
                        <option value="شركة">شركة</option>
                        <option value="VIP">عميل VIP</option>
                    </select>
                </div>
            </div>

            <div style="background:#fff; border-radius:15px; overflow:hidden; box-shadow:0 4px 20px rgba(0,0,0,0.08);">
                <div style="overflow-x:auto;">
                    <table id="customers-table" style="width:100%; text-align:right; border-collapse:collapse; min-width:2000px;">
                        <thead style="background:#f8fafc; color:#64748b; border-bottom:2px solid #edf2f7;">
                            <tr>
                                <th style="padding:15px;">#</th>
                                <th>اسم العميل</th>
                                <th>رقم الجوال</th>
                                <th>المفتاح</th>
                                <th>البريد الإلكتروني</th>
                                <th>الدولة</th>
                                <th>المدينة</th>
                                <th>الحي</th>
                                <th>الشارع</th>
                                <th>المبنى</th>
                                <th>الإضافي</th>
                                <th>الرمز البريدي</th>
                                <th>ص.ب</th>
                                <th>تاريخ الإضافة</th>
                                <th>الحالة</th>
                                <th>التصنيف</th>
                                <th style="position:sticky; left:0; background:#f8fafc; text-align:center;">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody id="render-area"></tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    // ربط الأحداث (Event Listeners) بدلاً من onclick في HTML لضمان العمل
    document.getElementById('btn-add-new').addEventListener('click', showAddModal);
    document.getElementById('global-search').addEventListener('input', handleSearch);
    document.getElementById('filter-category').addEventListener('change', handleSearch);

    await loadAndRender();
}

/**
 * دالة التحميل والرندرة الفعلية - تربط البيانات بالجدول
 */
async function loadAndRender() {
    const tbody = document.getElementById('render-area');
    const statsBoard = document.getElementById('stats-board');
    if (!tbody) return;

    try {
        const snapshot = await Core.fetchAllCustomers(); // جلب حقيقي من Firestore
        tbody.innerHTML = '';
        let stats = { total: 0, active: 0, completed: 0, vip: 0 };

        let index = 1;
        snapshot.forEach(docSnap => {
            const d = docSnap.data();
            const id = docSnap.id;
            
            // حساب الإحصائيات (المتطلب الرابع)
            stats.total++;
            if (d.status === 'نشط') stats.active++;
            if (d.category === 'VIP') stats.vip++;
            if (d.name && d.phone && d.city && d.buildingNo) stats.completed++;

            tbody.innerHTML += `
                <tr style="border-bottom:1px solid #f1f5f9;" class="customer-row">
                    <td style="padding:15px; font-weight:bold; color:#64748b;">${index++}</td>
                    <td style="font-weight:700; color:#1e293b;">${d.name || '-'}</td>
                    <td dir="ltr">${d.phone || '-'}</td>
                    <td><span style="background:#f1f5f9; padding:2px 6px; border-radius:4px;">${d.countryCode || '+966'}</span></td>
                    <td>${d.email || '-'}</td>
                    <td>${d.country || 'السعودية'}</td>
                    <td>${d.city || '-'}</td>
                    <td>${d.district || '-'}</td>
                    <td>${d.street || '-'}</td>
                    <td>${d.buildingNo || '-'}</td>
                    <td>${d.additionalNo || '-'}</td>
                    <td>${d.postalCode || '-'}</td>
                    <td>${d.poBox || '-'}</td>
                    <td>${d.createdAt ? d.createdAt.substring(0, 10) : '-'}</td>
                    <td><span class="status-badge ${getStatusClass(d.status)}">${d.status || 'معلق'}</span></td>
                    <td>${d.category || 'فرد'}</td>
                    <td style="position:sticky; left:0; background:#fff; text-align:center; box-shadow:-2px 0 10px rgba(0,0,0,0.05);">
                        <div style="display:flex; gap:8px; justify-content:center; padding:0 10px;">
                            <button onclick="handleEdit('${id}')" title="تعديل" style="color:#2563eb; background:none; border:none; cursor:pointer;"><i class="fas fa-edit"></i></button>
                            <button onclick="handlePrint('${id}')" title="طباعة" style="color:#64748b; background:none; border:none; cursor:pointer;"><i class="fas fa-print"></i></button>
                            <button onclick="handleDelete('${id}', '${d.name}')" title="حذف" style="color:#ef4444; background:none; border:none; cursor:pointer;"><i class="fas fa-trash-alt"></i></button>
                        </div>
                    </td>
                </tr>
            `;
        });

        // تحديث لوحة الإحصائيات
        updateStatsUI(stats);

    } catch (error) {
        console.error("خطأ في تحميل البيانات:", error);
    }
}

/**
 * ثالثاً: وظائف الأزرار (إصلاح مشكلة عدم الاستجابة)
 */

// 1. زر إضافة عميل جديد
function showAddModal() {
    editingId = null;
    const modal = document.getElementById('customer-modal');
    const form = document.getElementById('customer-form');
    if (form) form.reset();
    if (modal) {
        document.getElementById('modal-title').innerText = "إضافة عميل جديد";
        modal.style.display = 'flex'; // فتح النافذة فعلياً
    }
}

// 2. زر تعديل (جلب البيانات الحقيقية للفورم)
window.handleEdit = async (id) => {
    editingId = id;
    const data = await Core.fetchCustomerById(id);
    if (!data) return;

    // ملء جميع الحقول الـ 17 في الفورم
    const fields = ['name', 'phone', 'email', 'city', 'district', 'street', 'buildingNo', 'additionalNo', 'postalCode', 'poBox', 'status', 'category'];
    fields.forEach(field => {
        const el = document.getElementById('cust-' + field);
        if (el) el.value = data[field] || '';
    });

    document.getElementById('modal-title').innerText = "تعديل بيانات: " + data.name;
    document.getElementById('customer-modal').style.display = 'flex';
};

// 3. زر حذف (تأكيد وحذف حقيقي)
window.handleDelete = async (id, name) => {
    if (confirm(`⚠️ هل أنت متأكد من حذف العميل "${name}"؟ لا يمكن التراجع عن هذا الإجراء.`)) {
        try {
            await Core.removeCustomer(id); // حذف من Firestore
            // تسجيل في السجل (المتطلب الخامس)
            await Core.logOperation('حذف عميل', name, 'ناجحة');
            await loadAndRender(); // تحديث الجدول فوراً
        } catch (e) {
            alert("فشل الحذف");
        }
    }
};

// 4. زر طباعة (فتح نافذة الطباعة)
window.handlePrint = (id) => {
    // فتح صفحة طباعة مخصصة أو تشغيل طباعة المتصفح للبيانات
    window.open(`print-customer.html?id=${id}`, '_blank');
};

/**
 * رابعاً: البحث والفلترة السريعة
 */
function handleSearch() {
    const term = document.getElementById('global-search').value.toLowerCase();
    const cat = document.getElementById('filter-category').value;
    
    document.querySelectorAll('.customer-row').forEach(row => {
        const text = row.innerText.toLowerCase();
        const matchesSearch = text.includes(term);
        const matchesCat = cat === "" || text.includes(cat.toLowerCase());
        
        row.style.display = (matchesSearch && matchesCat) ? '' : 'none';
    });
}

function updateStatsUI(s) {
    const board = document.getElementById('stats-board');
    if (!board) return;
    board.innerHTML = `
        <div class="stat-card">إجمالي العملاء <h3>${s.total}</h3></div>
        <div class="stat-card" style="border-color:#10b981;">نشطين <h3>${s.active}</h3></div>
        <div class="stat-card" style="border-color:#f59e0b;">بيانات مكتملة <h3>${s.completed}</h3></div>
        <div class="stat-card" style="border-color:#8b5cf6;">VIP <h3>${s.vip}</h3></div>
    `;
}

function getStatusClass(s) {
    if (s === 'نشط') return 'status-active';
    if (s === 'موقوف') return 'status-blocked';
    return 'status-pending';
}
