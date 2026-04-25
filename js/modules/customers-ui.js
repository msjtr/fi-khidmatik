/**
 * js/modules/customers-ui.js
 * الإصدار الإبداعي والمصحح - منصة Tera Gateway
 * تم إصلاح خطأ setupGlobalFunctions وربط كافة حقول العنوان الوطني
 */

import * as Core from './customers-core.js';

// مخزن مؤقت لضمان سرعة البحث والفلترة اللحظية
let customersCache = [];

/**
 * دالة التشغيل الرئيسية التي يتم استدعاؤها من main.js
 */
export async function initCustomersUI(container) {
    if (!container) return;

    // 1. رسم الهيكل الإبداعي (إحصائيات + بحث + جدول)
    renderAppSkeleton(container);
    
    // 2. تعريف الدوال العالمية للأزرار (إصلاح الخطأ السابق هنا)
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
            
            <div class="stats-grid">
                <div class="stat-card" style="border-right: 5px solid #2563eb;">
                    <small style="color: #64748b; font-weight: bold;">إجمالي عملاء تيرا</small>
                    <div id="stat-total" style="font-size: 2rem; font-weight: 900; color: #1e293b; margin-top: 5px;">0</div>
                </div>
                <div class="stat-card" style="border-right: 5px solid #f59e0b;">
                    <small style="color: #64748b; font-weight: bold;">عملاء VIP ★</small>
                    <div id="stat-vip" style="font-size: 2rem; font-weight: 900; color: #b45309; margin-top: 5px;">0</div>
                </div>
                <div class="stat-card" style="border-right: 5px solid #10b981;">
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
                        style="background: #2563eb; color: white; border: none; padding: 14px 28px; border-radius: 12px; cursor: pointer; font-weight: bold; display: flex; align-items: center; gap: 10px; transition: 0.3s;">
                    <i class="fas fa-plus-circle"></i> إضافة عميل جديد
                </button>
            </div>

            <div class="table-holder">
                <table class="tera-table" style="width: 100%; border-collapse: collapse; text-align: right;">
                    <thead>
                        <tr>
                            <th style="padding: 18px;">العميل</th>
                            <th style="padding: 18px;">بيانات الاتصال</th>
                            <th style="padding: 18px;">العنوان الوطني (حائل)</th>
                            <th style="padding: 18px; text-align: center;">التصنيف</th>
                            <th style="padding: 18px; text-align: center;">العمليات</th>
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
 * إصلاح وتوحيد الدوال العالمية
 */
function setupGlobalFunctions() {
    // 1. فتح نافذة الإضافة
    window.showAddCustomerModal = () => {
        const modal = document.getElementById('customer-modal');
        if (modal) {
            document.getElementById('customer-form').reset();
            modal.style.display = 'flex';
        }
    };

    // 2. إجراء التعديل
    window.handleEdit = (id) => {
        const cust = customersCache.find(c => c.id === id);
        if (cust) {
            console.log("تعديل بيانات:", cust.name);
            // هنا يتم فتح المودال وتعبئة الحقول ببيانات cust
        }
    };

    // 3. إجراء الحذف
    window.handleDelete = async (id) => {
        if (confirm("🚨 هل أنت متأكد من حذف هذا العميل من قاعدة بيانات تيرا؟")) {
            const success = await Core.removeCustomer(id);
            if (success) await refreshData();
        }
    };

    // 4. إجراء الطباعة
    window.handlePrint = (id) => {
        const cust = customersCache.find(c => c.id === id);
        if (cust) {
            alert("جاري تجهيز تقرير العميل: " + cust.name);
            window.print();
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
 * رسم صفوف الجدول بناءً على البيانات (تشمل additionalNo و buildingNo)
 */
function renderTable(dataArray) {
    const tbody = document.getElementById('customers-list-body');
    if (!tbody) return;

    if (dataArray.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 40px; color: #64748b;">لا توجد سجلات حالياً.</td></tr>';
        return;
    }

    tbody.innerHTML = dataArray.map(cust => `
        <tr class="cust-row" style="border-bottom: 1px solid #f1f5f9;">
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
                <span class="status-tag ${cust.tag === 'vip' ? 'tag-vip' : 'tag-regular'}">
                    ${(cust.tag || 'عادي').toUpperCase()}
                </span>
            </td>
            <td style="padding: 15px; text-align: center;">
                <div class="row-actions" style="display: flex; gap: 5px; justify-content: center;">
                    <button onclick="window.handleEdit('${cust.id}')" class="btn-edit" title="تعديل"><i class="fas fa-edit"></i></button>
                    <button onclick="window.handlePrint('${cust.id}')" class="btn-print" title="طباعة"><i class="fas fa-print"></i></button>
                    <button onclick="window.handleDelete('${cust.id}')" class="btn-delete" title="حذف"><i class="fas fa-trash"></i></button>
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

export default { initCustomersUI };
