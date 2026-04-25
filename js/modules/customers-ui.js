/**
 * js/modules/customers-ui.js
 * إصدار التفاصيل الكاملة - منصة Tera Gateway
 * تم فصل كافة الحقول + إصلاح الأزرار نهائياً + نظام مراقبة الأحداث
 */

import * as Core from './customers-core.js';

// مخزن مؤقت للبيانات
let customersCache = [];

/**
 * الدالة الرئيسية لبدء التشغيل
 */
export async function initCustomersUI(container) {
    if (!container) return;

    // 1. بناء الهيكل الأساسي
    renderAppSkeleton(container);
    
    // 2. ربط مراقبات الأحداث (الأزرار والبحث)
    attachEventListeners();

    // 3. جلب البيانات من السحابة
    await refreshData();
}

/**
 * رسم الهيكل العام مع جدول بيانات عريض لاستيعاب كافة الحقول
 */
function renderAppSkeleton(container) {
    container.innerHTML = `
        <div class="cust-ui-wrapper" style="font-family: 'Tajawal', sans-serif; padding: 10px;">
            
            <div class="stats-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-bottom: 20px;">
                <div style="background: white; padding: 15px; border-radius: 10px; border-right: 5px solid #2563eb; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                    <small style="color: #64748b;">إجمالي العملاء</small>
                    <div id="stat-total" style="font-size: 1.5rem; font-weight: 800;">0</div>
                </div>
            </div>

            <div style="display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap;">
                <input type="text" id="tera-search-input" placeholder="بحث شامل (اسم، جوال، حي)..." 
                       style="flex: 1; min-width: 250px; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0; outline: none;">
                <button id="btn-add-customer-trigger" style="background: #2563eb; color: white; border: none; padding: 0 20px; border-radius: 8px; cursor: pointer; font-weight: bold;">
                    <i class="fas fa-plus"></i> إضافة عميل
                </button>
            </div>

            <div style="background: white; border-radius: 12px; border: 1px solid #e2e8f0; overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; text-align: right; min-width: 1200px; font-size: 0.9rem;">
                    <thead style="background: #f8fafc; border-bottom: 2px solid #e2e8f0;">
                        <tr>
                            <th style="padding: 12px;">الاسم</th>
                            <th style="padding: 12px;">الدولة</th>
                            <th style="padding: 12px;">المفتاح</th>
                            <th style="padding: 12px;">رقم الجوال</th>
                            <th style="padding: 12px;">البريد الإلكتروني</th>
                            <th style="padding: 12px;">المدينة</th>
                            <th style="padding: 12px;">الحي</th>
                            <th style="padding: 12px;">الشارع</th>
                            <th style="padding: 12px;">الرمز البريدي</th>
                            <th style="padding: 12px;">التصنيف</th>
                            <th style="padding: 12px;">الحالة</th>
                            <th style="padding: 12px; text-align: center;">العمليات</th>
                        </tr>
                    </thead>
                    <tbody id="customers-list-body">
                        <tr><td colspan="12" style="text-align: center; padding: 50px; color: #94a3b8;">جاري تحميل البيانات...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

/**
 * نظام مراقبة الأحداث المركزي (لضمان عمل الأزرار)
 */
function attachEventListeners() {
    // 1. زر إضافة عميل
    const addBtn = document.getElementById('btn-add-customer-trigger');
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            const modal = document.getElementById('customer-modal');
            if (modal) {
                document.getElementById('customer-form').reset();
                delete document.getElementById('customer-form').dataset.editId;
                modal.style.display = 'flex';
            }
        });
    }

    // 2. مراقبة البحث
    const searchInput = document.getElementById('tera-search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const filtered = customersCache.filter(c => 
                (c.name || "").toLowerCase().includes(term) || 
                (c.phone || "").includes(term) || 
                (c.district || "").toLowerCase().includes(term)
            );
            renderTable(filtered);
        });
    }

    // 3. مراقبة نقرات الجدول (التعديل، الحذف، الطباعة)
    const tableBody = document.getElementById('customers-list-body');
    if (tableBody) {
        tableBody.addEventListener('click', async (e) => {
            const btn = e.target.closest('button');
            if (!btn) return;

            const action = btn.dataset.action;
            const id = btn.dataset.id;
            const cust = customersCache.find(c => c.id === id);

            if (!cust) return;

            if (action === 'edit') handleEditAction(cust);
            if (action === 'print') handlePrintAction(cust);
            if (action === 'delete') {
                if (confirm(`هل أنت متأكد من حذف العميل: ${cust.name}؟`)) {
                    const success = await Core.removeCustomer(id);
                    if (success) await refreshData();
                }
            }
        });
    }
}

/**
 * تعبئة البيانات في المودال عند التعديل
 */
function handleEditAction(cust) {
    const modal = document.getElementById('customer-modal');
    const form = document.getElementById('customer-form');
    if (modal && form) {
        // تعبئة كافة الحقول المتاحة في النموذج
        if (form.elements['name']) form.elements['name'].value = cust.name || '';
        if (form.elements['phone']) form.elements['phone'].value = cust.phone || '';
        if (form.elements['email']) form.elements['email'].value = cust.email || '';
        if (form.elements['city']) form.elements['city'].value = cust.city || '';
        if (form.elements['district']) form.elements['district'].value = cust.district || '';
        if (form.elements['street']) form.elements['street'].value = cust.street || '';
        if (form.elements['postalCode']) form.elements['postalCode'].value = cust.postalCode || '';
        if (form.elements['tag']) form.elements['tag'].value = cust.tag || 'regular';
        
        form.dataset.editId = cust.id;
        modal.style.display = 'flex';
    }
}

/**
 * طباعة تقرير العميل التفصيلي
 */
function handlePrintAction(cust) {
    const win = window.open('', '_blank');
    win.document.write(`
        <html dir="rtl">
        <head><title>تقرير عميل - ${cust.name}</title></head>
        <body style="font-family: 'Tajawal', sans-serif; padding: 30px;">
            <h2 style="color: #2563eb;">بيانات العميل التفصيلية - Tera Gateway</h2>
            <hr>
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                <tr><td style="padding: 10px; border: 1px solid #eee;"><b>الاسم:</b></td><td style="padding: 10px; border: 1px solid #eee;">${cust.name}</td></tr>
                <tr><td style="padding: 10px; border: 1px solid #eee;"><b>الجوال:</b></td><td style="padding: 10px; border: 1px solid #eee;">${cust.countryCode} ${cust.phone}</td></tr>
                <tr><td style="padding: 10px; border: 1px solid #eee;"><b>المدينة:</b></td><td style="padding: 10px; border: 1px solid #eee;">${cust.city}</td></tr>
                <tr><td style="padding: 10px; border: 1px solid #eee;"><b>الحي:</b></td><td style="padding: 10px; border: 1px solid #eee;">${cust.district}</td></tr>
                <tr><td style="padding: 10px; border: 1px solid #eee;"><b>الشارع:</b></td><td style="padding: 10px; border: 1px solid #eee;">${cust.street || '-'}</td></tr>
                <tr><td style="padding: 10px; border: 1px solid #eee;"><b>البريد:</b></td><td style="padding: 10px; border: 1px solid #eee;">${cust.email || '-'}</td></tr>
            </table>
        </body>
        </html>
    `);
    win.print();
}

/**
 * تحديث البيانات من السحابة
 */
async function refreshData() {
    try {
        const snapshot = await Core.fetchAllCustomers();
        customersCache = [];
        snapshot.forEach(doc => customersCache.push({ id: doc.id, ...doc.data() }));
        renderTable(customersCache);
        updateStats();
    } catch (err) {
        console.error("خطأ جلب البيانات:", err);
    }
}

/**
 * رسم صفوف الجدول مع كافة الحقول مفصلة
 */
function renderTable(dataArray) {
    const tbody = document.getElementById('customers-list-body');
    if (!tbody) return;

    if (dataArray.length === 0) {
        tbody.innerHTML = '<tr><td colspan="12" style="text-align: center; padding: 30px;">لا يوجد سجلات.</td></tr>';
        return;
    }

    tbody.innerHTML = dataArray.map(cust => `
        <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 12px; font-weight: bold;">${cust.name || '-'}</td>
            <td style="padding: 12px;">${cust.country || 'السعودية'}</td>
            <td style="padding: 12px;" dir="ltr">${cust.countryCode || '+966'}</td>
            <td style="padding: 12px;" dir="ltr">${cust.phone || '-'}</td>
            <td style="padding: 12px;">${cust.email || '-'}</td>
            <td style="padding: 12px; color: #2563eb; font-weight: 600;">${cust.city || '-'}</td>
            <td style="padding: 12px;">${cust.district || '-'}</td>
            <td style="padding: 12px;">${cust.street || '-'}</td>
            <td style="padding: 12px;">${cust.postalCode || '-'}</td>
            <td style="padding: 12px;">
                <span style="background: #fef3c7; color: #92400e; padding: 2px 8px; border-radius: 4px; font-size: 0.8rem;">
                    ${cust.tag || 'regular'}
                </span>
            </td>
            <td style="padding: 12px;">
                <span style="color: #10b981;">● نشط</span>
            </td>
            <td style="padding: 12px; text-align: center;">
                <div style="display: flex; gap: 5px; justify-content: center;">
                    <button data-action="edit" data-id="${cust.id}" style="border:1px solid #e2e8f0; background:white; cursor:pointer; width:30px; height:30px; border-radius:5px; color:#2563eb;"><i class="fas fa-edit"></i></button>
                    <button data-action="print" data-id="${cust.id}" style="border:1px solid #e2e8f0; background:white; cursor:pointer; width:30px; height:30px; border-radius:5px; color:#10b981;"><i class="fas fa-print"></i></button>
                    <button data-action="delete" data-id="${cust.id}" style="border:1px solid #fecdd3; background:#fff1f2; cursor:pointer; width:30px; height:30px; border-radius:5px; color:#e11d48;"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        </tr>
    `).join('');
}

/**
 * تحديث أرقام الإحصائيات
 */
function updateStats() {
    if (document.getElementById('stat-total')) {
        document.getElementById('stat-total').innerText = customersCache.length;
    }
}
