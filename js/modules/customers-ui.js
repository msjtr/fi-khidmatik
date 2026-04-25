/**
 * js/modules/customers-ui.js
 * الإصدار الاحترافي لمنصة Tera Gateway
 * فصل المدينة والحي + إضافة تاريخ الإنشاء + حل مشكلة الأزرار
 */

import * as Core from './customers-core.js';

// مخزن مؤقت لضمان سرعة البحث والفلترة اللحظية
let customersCache = [];

/**
 * دالة التشغيل الرئيسية
 */
export async function initCustomersUI(container) {
    if (!container) return;

    // 1. رسم الهيكل (إحصائيات + بحث + جدول)
    renderAppSkeleton(container);
    
    // 2. تعريف الدوال ومراقب الأحداث للأزرار
    setupGlobalFunctions();

    // 3. تفعيل الفلترة اللحظية
    activateSearchFilter();

    // 4. جلب البيانات
    await refreshData();
}

/**
 * رسم هيكل الواجهة
 */
function renderAppSkeleton(container) {
    container.innerHTML = `
        <div class="cust-ui-wrapper" style="font-family: 'Tajawal', sans-serif;">
            
            <div class="stats-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px; margin-bottom: 25px;">
                <div class="stat-card" style="background: white; padding: 15px; border-radius: 12px; border-right: 5px solid #2563eb; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                    <small style="color: #64748b;">إجمالي العملاء</small>
                    <div id="stat-total" style="font-size: 1.5rem; font-weight: 800; color: #1e293b;">0</div>
                </div>
                <div class="stat-card" style="background: white; padding: 15px; border-radius: 12px; border-right: 5px solid #10b981; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                    <small style="color: #64748b;">منطقة حائل</small>
                    <div id="stat-hail" style="font-size: 1.5rem; font-weight: 800; color: #065f46;">0</div>
                </div>
            </div>

            <div class="action-bar" style="display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap;">
                <div style="position: relative; flex: 1; min-width: 250px;">
                    <i class="fas fa-search" style="position: absolute; right: 15px; top: 50%; transform: translateY(-50%); color: #94a3b8;"></i>
                    <input type="text" id="tera-search-input" placeholder="بحث بالاسم، الجوال، أو الحي..." 
                           style="width: 100%; padding: 12px 40px 12px 15px; border-radius: 10px; border: 1px solid #e2e8f0; outline: none;">
                </div>
                <button id="btn-add-customer" style="background: #2563eb; color: white; border: none; padding: 0 20px; border-radius: 10px; cursor: pointer; font-weight: bold; display: flex; align-items: center; gap: 8px;">
                    <i class="fas fa-plus"></i> إضافة عميل
                </button>
            </div>

            <div class="table-holder" style="background: white; border-radius: 12px; border: 1px solid #e2e8f0; overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; text-align: right; min-width: 800px;">
                    <thead style="background: #f8fafc; border-bottom: 2px solid #e2e8f0;">
                        <tr>
                            <th style="padding: 15px;">العميل</th>
                            <th style="padding: 15px;">المدينة / الحي</th>
                            <th style="padding: 15px;">تاريخ الإضافة</th>
                            <th style="padding: 15px; text-align: center;">الحالة</th>
                            <th style="padding: 15px; text-align: center;">العمليات</th>
                        </tr>
                    </thead>
                    <tbody id="customers-list-body">
                        <tr><td colspan="5" style="text-align: center; padding: 40px;">جاري التحميل...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

/**
 * إعداد الوظائف ومراقبة النقرات (لحل مشكلة الأزرار)
 */
function setupGlobalFunctions() {
    // زر الإضافة العلوي
    const addBtn = document.getElementById('btn-add-customer');
    if (addBtn) {
        addBtn.onclick = () => {
            const modal = document.getElementById('customer-modal');
            if (modal) {
                document.getElementById('customer-form').reset();
                delete document.getElementById('customer-form').dataset.editId;
                modal.style.display = 'flex';
            }
        };
    }

    // مراقب أحداث الجدول (Event Delegation)
    const tableBody = document.getElementById('customers-list-body');
    if (tableBody) {
        tableBody.addEventListener('click', async (e) => {
            const btn = e.target.closest('button');
            if (!btn) return;

            const action = btn.dataset.action;
            const id = btn.dataset.id;
            const cust = customersCache.find(c => c.id === id);

            if (action === 'edit') handleEditUI(cust);
            if (action === 'print') handlePrintUI(cust);
            if (action === 'delete') {
                if (confirm("هل تريد حذف العميل؟")) {
                    await Core.removeCustomer(id);
                    await refreshData();
                }
            }
        });
    }
}

/**
 * تعبئة المودال للتعديل
 */
function handleEditUI(cust) {
    const modal = document.getElementById('customer-modal');
    const form = document.getElementById('customer-form');
    if (modal && form) {
        form.elements['name'].value = cust.name || '';
        form.elements['phone'].value = cust.phone || '';
        form.elements['city'].value = cust.city || 'حائل';
        form.elements['district'].value = cust.district || '';
        form.dataset.editId = cust.id;
        modal.style.display = 'flex';
    }
}

/**
 * طباقة بيانات العميل
 */
function handlePrintUI(cust) {
    const win = window.open('', '_blank');
    win.document.write(`
        <html dir="rtl"><body style="font-family:sans-serif; padding:50px;">
            <h1>بيانات عميل - Tera Gateway</h1>
            <hr>
            <p><b>الاسم:</b> ${cust.name}</p>
            <p><b>الجوال:</b> ${cust.phone}</p>
            <p><b>المنطقة:</b> ${cust.city} - حي ${cust.district}</p>
            <p><b>تاريخ التسجيل:</b> ${new Date(cust.createdAt).toLocaleDateString('ar-SA')}</p>
        </body></html>
    `);
    win.print();
}

/**
 * جلب البيانات من السحابة
 */
async function refreshData() {
    const snapshot = await Core.fetchAllCustomers();
    customersCache = [];
    snapshot.forEach(doc => customersCache.push({ id: doc.id, ...doc.data() }));
    renderTable(customersCache);
    updateStatistics();
}

/**
 * رسم صفوف الجدول
 */
function renderTable(dataArray) {
    const tbody = document.getElementById('customers-list-body');
    if (!tbody) return;

    tbody.innerHTML = dataArray.map(cust => {
        // تنسيق التاريخ ليظهر بشكل مقروء
        const dateStr = cust.createdAt ? new Date(cust.createdAt).toLocaleDateString('ar-SA') : '-';
        
        return `
        <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 12px;">
                <div style="font-weight: bold;">${cust.name || 'بدون اسم'}</div>
                <div style="font-size: 0.8rem; color: #64748b;" dir="ltr">${cust.countryCode || '+966'} ${cust.phone || ''}</div>
            </td>
            <td style="padding: 12px;">
                <span style="color: #2563eb; font-weight: bold;">${cust.city || 'حائل'}</span>
                <div style="font-size: 0.85rem; color: #64748b;">حي ${cust.district || '-'}</div>
            </td>
            <td style="padding: 12px; font-size: 0.85rem; color: #475569;">
                <i class="far fa-calendar-alt"></i> ${dateStr}
            </td>
            <td style="padding: 12px; text-align: center;">
                <span style="padding: 4px 8px; border-radius: 6px; font-size: 0.7rem; background: #f1f5f9;">نشط</span>
            </td>
            <td style="padding: 12px; text-align: center;">
                <div style="display: flex; gap: 5px; justify-content: center;">
                    <button data-action="edit" data-id="${cust.id}" style="border:1px solid #e2e8f0; background:white; cursor:pointer; padding:5px 8px; border-radius:5px; color:#2563eb;"><i class="fas fa-edit"></i></button>
                    <button data-action="print" data-id="${cust.id}" style="border:1px solid #e2e8f0; background:white; cursor:pointer; padding:5px 8px; border-radius:5px; color:#10b981;"><i class="fas fa-print"></i></button>
                    <button data-action="delete" data-id="${cust.id}" style="border:1px solid #fecdd3; background:#fff1f2; cursor:pointer; padding:5px 8px; border-radius:5px; color:#e11d48;"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        </tr>
    `}).join('');
}

/**
 * تحديث الإحصائيات
 */
function updateStatistics() {
    const total = customersCache.length;
    const hail = customersCache.filter(c => c.city === "حائل").length;
    if (document.getElementById('stat-total')) document.getElementById('stat-total').innerText = total;
    if (document.getElementById('stat-hail')) document.getElementById('stat-hail').innerText = hail;
}

/**
 * نظام البحث
 */
function activateSearchFilter() {
    const input = document.getElementById('tera-search-input');
    if (!input) return;
    input.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = customersCache.filter(c => 
            (c.name || "").toLowerCase().includes(term) || 
            (c.district || "").toLowerCase().includes(term) ||
            (c.phone || "").includes(term)
        );
        renderTable(filtered);
    });
}
