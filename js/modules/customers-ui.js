/**
 * js/modules/customers-ui.js
 * الإصدار الشامل لمنصة Tera Gateway - (إصلاح شامل للأزرار والبيانات)
 */

import * as Core from './customers-core.js';

let customersCache = [];

/**
 * الدالة الأساسية لبدء تشغيل الواجهة
 */
export async function initCustomersUI(container) {
    if (!container) return;

    // 1. رسم الهيكل
    renderAppSkeleton(container);
    
    // 2. ربط الأحداث (البحث، الإضافة، أزرار الجدول)
    attachEventListeners();

    // 3. جلب البيانات الأولية
    await refreshData();
}

/**
 * بناء هيكل الجدول والأعمدة الجديدة
 */
function renderAppSkeleton(container) {
    container.innerHTML = `
        <div class="cust-ui-wrapper" style="font-family: 'Tajawal', sans-serif; padding: 15px;">
            
            <div class="stats-row" style="margin-bottom: 20px;">
                <div style="background: white; padding: 15px; border-radius: 10px; border-right: 5px solid #2563eb; display: inline-block; min-width: 200px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                    <small style="color: #64748b;">إجمالي قاعدة بيانات العملاء</small>
                    <div id="stat-total" style="font-size: 1.8rem; font-weight: 800; color: #1e293b;">0</div>
                </div>
            </div>

            <div class="actions-bar" style="display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap;">
                <div style="flex: 1; min-width: 300px; position: relative;">
                    <input type="text" id="tera-search-input" placeholder="بحث باسم العميل، الرقم، أو الحي..." 
                           style="width: 100%; padding: 12px 15px; border-radius: 8px; border: 1px solid #e2e8f0; outline: none;">
                </div>
                <button id="btn-add-customer-main" style="background: #2563eb; color: white; border: none; padding: 0 25px; border-radius: 8px; cursor: pointer; font-weight: bold; display: flex; align-items: center; gap: 8px;">
                    <i class="fas fa-plus"></i> إضافة عميل جديد
                </button>
            </div>

            <div style="background: white; border-radius: 12px; border: 1px solid #e2e8f0; overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; text-align: right; min-width: 1400px;">
                    <thead style="background: #f8fafc; border-bottom: 2px solid #e2e8f0;">
                        <tr>
                            <th style="padding: 15px;">الاسم الكامل</th>
                            <th style="padding: 15px;">رقم الجوال</th>
                            <th style="padding: 15px;">المفتاح</th>
                            <th style="padding: 15px;">البريد</th>
                            <th style="padding: 15px;">المدينة</th>
                            <th style="padding: 15px;">الحي</th>
                            <th style="padding: 15px;">الشارع</th>
                            <th style="padding: 15px;">رقم المبنى</th>
                            <th style="padding: 15px;">الرقم الإضافي</th>
                            <th style="padding: 15px;">التصنيف</th>
                            <th style="padding: 15px; text-align: center;">العمليات</th>
                        </tr>
                    </thead>
                    <tbody id="customers-list-body">
                        <tr><td colspan="11" style="text-align: center; padding: 50px;">جاري تحميل بيانات تيرا...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

/**
 * ربط الأحداث لضمان عمل الأزرار 100%
 */
function attachEventListeners() {
    // 1. زر إضافة عميل (Main Button)
    const addBtn = document.getElementById('btn-add-customer-main');
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            const modal = document.getElementById('customer-modal');
            const form = document.getElementById('customer-form');
            if (modal && form) {
                form.reset();
                delete form.dataset.editId;
                modal.style.display = 'flex';
            }
        });
    }

    // 2. محرك البحث
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

    // 3. مراقب نقرات الجدول (التعديل والحذف والطباعة)
    const tableBody = document.getElementById('customers-list-body');
    if (tableBody) {
        tableBody.addEventListener('click', async (e) => {
            const actionBtn = e.target.closest('button');
            if (!actionBtn) return;

            const action = actionBtn.dataset.action;
            const id = actionBtn.dataset.id;
            const cust = customersCache.find(c => c.id === id);

            if (!cust) return;

            if (action === 'edit') openEditModal(cust);
            if (action === 'print') printCustomerData(cust);
            if (action === 'delete') {
                if (confirm(`هل أنت متأكد من حذف العميل: ${cust.name}؟`)) {
                    await Core.removeCustomer(id);
                    await refreshData();
                }
            }
        });
    }
}

/**
 * فتح المودال وتعبئة البيانات للتعديل
 */
function openEditModal(cust) {
    const modal = document.getElementById('customer-modal');
    const form = document.getElementById('customer-form');
    if (modal && form) {
        if (form.elements['name']) form.elements['name'].value = cust.name || '';
        if (form.elements['phone']) form.elements['phone'].value = cust.phone || '';
        if (form.elements['city']) form.elements['city'].value = cust.city || 'حائل';
        if (form.elements['district']) form.elements['district'].value = cust.district || '';
        if (form.elements['street']) form.elements['street'].value = cust.street || '';
        if (form.elements['buildingNo']) form.elements['buildingNo'].value = cust.buildingNo || '';
        if (form.elements['additionalNo']) form.elements['additionalNo'].value = cust.additionalNo || '';
        
        form.dataset.editId = cust.id;
        modal.style.display = 'flex';
    }
}

/**
 * جلب البيانات وتحديث الجدول
 */
async function refreshData() {
    try {
        const snapshot = await Core.fetchAllCustomers();
        customersCache = [];
        snapshot.forEach(doc => customersCache.push({ id: doc.id, ...doc.data() }));
        renderTable(customersCache);
        
        const totalElem = document.getElementById('stat-total');
        if (totalElem) totalElem.innerText = customersCache.length;
    } catch (err) {
        console.error("خطأ في جلب البيانات:", err);
    }
}

/**
 * رسم الجدول بالترتيب المطلوب للحقول
 */
function renderTable(dataArray) {
    const tbody = document.getElementById('customers-list-body');
    if (!tbody) return;

    if (dataArray.length === 0) {
        tbody.innerHTML = '<tr><td colspan="11" style="text-align: center; padding: 30px;">لا توجد سجلات حالياً.</td></tr>';
        return;
    }

    tbody.innerHTML = dataArray.map(cust => `
        <tr style="border-bottom: 1px solid #f1f5f9; transition: background 0.2s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
            <td style="padding: 12px; font-weight: bold; color: #1e293b;">${cust.name || '-'}</td>
            <td style="padding: 12px;" dir="ltr">${cust.phone || '-'}</td>
            <td style="padding: 12px; color: #64748b;" dir="ltr">${cust.countryCode || '+966'}</td>
            <td style="padding: 12px; font-size: 0.8rem;">${cust.email || '-'}</td>
            <td style="padding: 12px; color: #2563eb; font-weight: 600;">${cust.city || 'حائل'}</td>
            <td style="padding: 12px;">${cust.district || '-'}</td>
            <td style="padding: 12px;">${cust.street || '-'}</td>
            <td style="padding: 12px; text-align: center;">${cust.buildingNo || '-'}</td>
            <td style="padding: 12px; text-align: center;">${cust.additionalNo || '-'}</td>
            <td style="padding: 12px; text-align: center;">
                <span style="background: #eff6ff; color: #1e40af; padding: 3px 8px; border-radius: 5px; font-size: 0.75rem;">
                    ${cust.tag || 'عادي'}
                </span>
            </td>
            <td style="padding: 12px;">
                <div style="display: flex; gap: 6px; justify-content: center;">
                    <button data-action="edit" data-id="${cust.id}" title="تعديل" style="border:1px solid #e2e8f0; background:white; cursor:pointer; width:32px; height:32px; border-radius:6px; color:#2563eb;"><i class="fas fa-edit"></i></button>
                    <button data-action="print" data-id="${cust.id}" title="طباعة" style="border:1px solid #e2e8f0; background:white; cursor:pointer; width:32px; height:32px; border-radius:6px; color:#10b981;"><i class="fas fa-print"></i></button>
                    <button data-action="delete" data-id="${cust.id}" title="حذف" style="border:1px solid #fecdd3; background:#fff1f2; cursor:pointer; width:32px; height:32px; border-radius:6px; color:#e11d48;"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        </tr>
    `).join('');
}

/**
 * وظيفة الطباعة
 */
function printCustomerData(cust) {
    const printWin = window.open('', '_blank');
    printWin.document.write(`
        <html dir="rtl"><body style="font-family: 'Tajawal', sans-serif; padding: 40px;">
            <h1 style="color: #2563eb;">Tera Gateway - بطاقة عميل</h1>
            <hr>
            <p><b>الاسم:</b> ${cust.name}</p>
            <p><b>الجوال:</b> ${cust.phone} (${cust.countryCode})</p>
            <p><b>العنوان:</b> ${cust.city} - حي ${cust.district} - شارع ${cust.street}</p>
            <p><b>المبنى:</b> ${cust.buildingNo} | <b>الإضافي:</b> ${cust.additionalNo}</p>
        </body></html>
    `);
    printWin.document.close();
    printWin.print();
}
