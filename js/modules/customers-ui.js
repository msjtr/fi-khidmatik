/**
 * js/modules/customers-ui.js
 * الإصدار النهائي والخالي من الأخطاء - منصة Tera Gateway
 * تم إصلاح خطأ الـ Export، ودمج دوال الطباعة والتعديل الاحترافية
 */

import * as Core from './customers-core.js';

// مخزن مؤقت لضمان سرعة البحث والفلترة اللحظية
let customersCache = [];

/**
 * دالة التشغيل الرئيسية (تم تصديرها كـ Named Export لحل خطأ main.js)
 */
export async function initCustomersUI(container) {
    if (!container) return;

    // 1. رسم الهيكل الإبداعي (إحصائيات + بحث + جدول)
    renderAppSkeleton(container);
    
    // 2. تعريف الدوال العالمية للأزرار
    setupGlobalFunctions();

    // 3. تفعيل مراقب البحث والفلترة
    activateSearchFilter();

    // 4. جلب البيانات وعرضها
    await refreshData();
}

/**
 * رسم هيكل الواجهة (إحصائيات + شريط أدوات + جدول)
 */
function renderAppSkeleton(container) {
    container.innerHTML = `
        <div class="cust-ui-wrapper" style="font-family: 'Tajawal', sans-serif;">
            
            <div class="stats-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 25px;">
                <div class="stat-card" style="background: white; padding: 20px; border-radius: 16px; border: 1px solid #e2e8f0; border-right: 5px solid #2563eb; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
                    <small style="color: #64748b; font-weight: bold;">إجمالي عملاء تيرا</small>
                    <div id="stat-total" style="font-size: 2rem; font-weight: 900; color: #1e293b; margin-top: 5px;">0</div>
                </div>
                <div class="stat-card" style="background: white; padding: 20px; border-radius: 16px; border: 1px solid #e2e8f0; border-right: 5px solid #f59e0b; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
                    <small style="color: #64748b; font-weight: bold;">عملاء VIP ★</small>
                    <div id="stat-vip" style="font-size: 2rem; font-weight: 900; color: #b45309; margin-top: 5px;">0</div>
                </div>
                <div class="stat-card" style="background: white; padding: 20px; border-radius: 16px; border: 1px solid #e2e8f0; border-right: 5px solid #10b981; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
                    <small style="color: #64748b; font-weight: bold;">منطقة حائل</small>
                    <div id="stat-hail" style="font-size: 2rem; font-weight: 900; color: #065f46; margin-top: 5px;">0</div>
                </div>
            </div>

            <div class="action-bar" style="display: flex; gap: 15px; margin-bottom: 25px; align-items: center; flex-wrap: wrap;">
                <div style="position: relative; flex: 1; min-width: 300px;">
                    <i class="fas fa-search" style="position: absolute; right: 15px; top: 50%; transform: translateY(-50%); color: #94a3b8;"></i>
                    <input type="text" id="tera-search-input" placeholder="بحث بالاسم، الجوال، أو الحي (مثال: النقرة)..." 
                           style="width: 100%; padding: 14px 45px 14px 15px; border-radius: 12px; border: 1px solid #e2e8f0; outline: none; font-size: 1rem; box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);">
                </div>
                <button onclick="window.showAddCustomerModal()" class="btn-primary-tera" 
                        style="background: #2563eb; color: white; border: none; padding: 14px 28px; border-radius: 12px; cursor: pointer; font-weight: bold; display: flex; align-items: center; gap: 10px; transition: 0.3s; box-shadow: 0 4px 6px rgba(37, 99, 235, 0.2);">
                    <i class="fas fa-plus-circle"></i> إضافة عميل جديد
                </button>
            </div>

            <div class="table-holder" style="background: white; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05);">
                <table class="tera-table" style="width: 100%; border-collapse: collapse; text-align: right;">
                    <thead style="background: #f8fafc; border-bottom: 2px solid #e2e8f0;">
                        <tr>
                            <th style="padding: 18px; color: #475569;">العميل</th>
                            <th style="padding: 18px; color: #475569;">بيانات الاتصال</th>
                            <th style="padding: 18px; color: #475569;">العنوان الوطني (حائل)</th>
                            <th style="padding: 18px; color: #475569; text-align: center;">التصنيف</th>
                            <th style="padding: 18px; color: #475569; text-align: center;">العمليات</th>
                        </tr>
                    </thead>
                    <tbody id="customers-list-body">
                        <tr><td colspan="5" style="text-align: center; padding: 60px; color: #94a3b8;"><i class="fas fa-sync fa-spin"></i> جاري جلب البيانات من السحابة...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

/**
 * تجهيز الدوال العالمية (الإضافة، التعديل، الحذف، الطباعة)
 */
function setupGlobalFunctions() {
    // 1. فتح نافذة الإضافة
    window.showAddCustomerModal = () => {
        const modal = document.getElementById('customer-modal');
        const form = document.getElementById('customer-form');
        const title = document.querySelector('#customer-modal h3');
        if (modal && form) {
            form.reset();
            delete form.dataset.editId; // مسح أي ID سابق لضمان أنها عملية "إضافة"
            if (title) title.innerText = "➕ إضافة عميل جديد";
            modal.style.display = 'flex';
        }
    };

    // 2. إجراء التعديل (نسخة مطورة لتعبئة الحقول)
    window.handleEdit = (id) => {
        const cust = customersCache.find(c => c.id === id);
        if (cust) {
            window.showAddCustomerModal(); 
            
            const title = document.querySelector('#customer-modal h3');
            if (title) title.innerText = "📝 تعديل بيانات العميل";

            const form = document.getElementById('customer-form');
            if (form) {
                if (form.elements['name']) form.elements['name'].value = cust.name || '';
                if (form.elements['phone']) form.elements['phone'].value = cust.phone || '';
                if (form.elements['email']) form.elements['email'].value = cust.email || '';
                if (form.elements['city']) form.elements['city'].value = cust.city || 'حائل';
                if (form.elements['district']) form.elements['district'].value = cust.district || '';
                if (form.elements['street']) form.elements['street'].value = cust.street || '';
                if (form.elements['buildingNo']) form.elements['buildingNo'].value = cust.buildingNo || '';
                if (form.elements['additionalNo']) form.elements['additionalNo'].value = cust.additionalNo || '';
                if (form.elements['tag']) form.elements['tag'].value = cust.tag || 'regular';
                
                // حفظ الـ ID لمعرفة أننا في وضع التحديث
                form.dataset.editId = id; 
            }
        }
    };

    // 3. إجراء الحذف
    window.handleDelete = async (id) => {
        if (confirm("🚨 هل أنت متأكد من حذف هذا العميل من قاعدة بيانات تيرا؟")) {
            const success = await Core.removeCustomer(id);
            if (success) await refreshData();
        }
    };

    // 4. إجراء الطباعة (نسخة احترافية)
    window.handlePrint = (id) => {
        const cust = customersCache.find(c => c.id === id);
        if (cust) {
            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
                <html dir="rtl">
                <head>
                    <title>بطاقة عميل - ${cust.name || 'تيرا'}</title>
                    <style>
                        body { font-family: 'Tajawal', sans-serif; padding: 40px; color: #1e293b; }
                        .card { border: 2px solid #2563eb; padding: 30px; border-radius: 15px; max-width: 600px; margin: auto; }
                        .header { text-align: center; border-bottom: 2px solid #e2e8f0; margin-bottom: 20px; padding-bottom: 15px; }
                        .header h2 { color: #2563eb; margin: 0; }
                        .detail { margin-bottom: 12px; font-size: 1.2rem; }
                        b { color: #475569; display: inline-block; width: 120px; }
                    </style>
                </head>
                <body>
                    <div class="card">
                        <div class="header">
                            <h2>منصة Tera Gateway</h2>
                            <p style="color: #64748b; margin-top: 5px;">البطاقة التعريفية للعميل</p>
                        </div>
                        <div class="detail"><b>اسم العميل:</b> ${cust.name || '-'}</div>
                        <div class="detail"><b>رقم الجوال:</b> ${cust.countryCode || '+966'} ${cust.phone || '-'}</div>
                        <div class="detail"><b>البريد الإلكتروني:</b> ${cust.email || '-'}</div>
                        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
                        <div class="detail"><b>المدينة والحي:</b> ${cust.city || 'حائل'}، حي ${cust.district || '-'}</div>
                        <div class="detail"><b>الشارع:</b> ${cust.street || '-'}</div>
                        <div class="detail"><b>رقم المبنى:</b> ${cust.buildingNo || '-'}</div>
                        <div class="detail"><b>الرقم الإضافي:</b> ${cust.additionalNo || '-'}</div>
                        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
                        <div class="detail"><b>تصنيف العميل:</b> ${cust.tag === 'vip' ? '<span style="color: #b45309; font-weight: bold;">عميل مميز (VIP) ★</span>' : 'عميل عادي'}</div>
                    </div>
                    <script>window.onload = function() { window.print(); window.close(); }</script>
                </body>
                </html>
            `);
        }
    };
}

/**
 * جلب البيانات وتحديث الواجهة
 */
async function refreshData() {
    try {
        const snapshot = await Core.fetchAllCustomers();
        customersCache = [];
        snapshot.forEach(doc => {
            customersCache.push({ id: doc.id, ...doc.data() });
        });
        renderTable(customersCache);
        updateStatistics();
    } catch (error) {
        console.error("خطأ في المزامنة:", error);
    }
}

/**
 * رسم صفوف الجدول بناءً على البيانات
 */
function renderTable(dataArray) {
    const tbody = document.getElementById('customers-list-body');
    if (!tbody) return;

    if (dataArray.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 40px; color: #64748b;">لا توجد سجلات حالياً.</td></tr>';
        return;
    }

    tbody.innerHTML = dataArray.map(cust => `
        <tr class="cust-row" style="border-bottom: 1px solid #f1f5f9; transition: background 0.2s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
            <td style="padding: 15px;">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <div style="width: 42px; height: 42px; background: #eff6ff; color: #2563eb; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; border: 1px solid #dbeafe;">
                        ${(cust.name || "ع").charAt(0)}
                    </div>
                    <div>
                        <div style="font-weight: 700; color: #1e293b;">${cust.name || 'غير مسجل'}</div>
                        <div style="font-size: 0.8rem; color: #64748b;">${cust.email || '-'}</div>
                    </div>
                </div>
            </td>
            <td style="padding: 15px;" dir="ltr">
                <div style="font-weight: 600; color: #334155;">${cust.countryCode || '+966'} ${cust.phone || ''}</div>
            </td>
            <td style="padding: 15px; font-size: 0.85rem; line-height: 1.5;">
                <div style="font-weight: 700; color: #1e293b;">${cust.city || 'حائل'} - ${cust.district || '-'}</div>
                <div style="color: #64748b;">شارع ${cust.street || '-'} | م: ${cust.buildingNo || '-'} | إ: ${cust.additionalNo || '-'}</div>
            </td>
            <td style="padding: 15px; text-align: center;">
                <span style="display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: bold; 
                             ${cust.tag === 'vip' ? 'background: #fef3c7; color: #92400e; border: 1px solid #fde68a;' : 'background: #f1f5f9; color: #475569;'}">
                    ${(cust.tag || 'عادي').toUpperCase()}
                </span>
            </td>
            <td style="padding: 15px; text-align: center;">
                <div style="display: flex; gap: 8px; justify-content: center;">
                    <button onclick="window.handleEdit('${cust.id}')" title="تعديل" style="width: 32px; height: 32px; border-radius: 8px; border: 1px solid #e2e8f0; background: white; color: #2563eb; cursor: pointer;"><i class="fas fa-edit"></i></button>
                    <button onclick="window.handlePrint('${cust.id}')" title="طباعة" style="width: 32px; height: 32px; border-radius: 8px; border: 1px solid #e2e8f0; background: white; color: #10b981; cursor: pointer;"><i class="fas fa-print"></i></button>
                    <button onclick="window.handleDelete('${cust.id}')" title="حذف" style="width: 32px; height: 32px; border-radius: 8px; border: 1px solid #fecdd3; background: #fff1f2; color: #e11d48; cursor: pointer;"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        </tr>
    `).join('');
}

/**
 * نظام الفلترة والبحث اللحظي
 */
function activateSearchFilter() {
    const input = document.getElementById('tera-search-input');
    if (!input) return;

    input.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = customersCache.filter(c => 
            (c.name || "").toLowerCase().includes(term) || 
            (c.phone || "").toLowerCase().includes(term) || 
            (c.district || "").toLowerCase().includes(term)
        );
        renderTable(filtered);
    });
}

/**
 * تحديث لوحة الإحصائيات
 */
function updateStatistics() {
    const total = customersCache.length;
    const vip = customersCache.filter(c => c.tag === 'vip').length;
    const hail = customersCache.filter(c => (c.city || "").includes("حائل")).length;

    if (document.getElementById('stat-total')) document.getElementById('stat-total').innerText = total;
    if (document.getElementById('stat-vip')) document.getElementById('stat-vip').innerText = vip;
    if (document.getElementById('stat-hail')) document.getElementById('stat-hail').innerText = hail;
}

// قمنا بإزالة export default هنا لتفادي مشكلة الـ SyntaxError في main.js
