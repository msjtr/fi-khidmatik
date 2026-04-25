/**
 * customers-ui.js - Tera Gateway
 * الإصدار المحدث: ترتيب جدول شامل + إحصائيات دقيقة + نظام بحث وتعديل
 */

import * as Core from './customers-core.js';

let editingId = null;

/**
 * تهيئة الواجهة الرئيسية للعملاء
 */
export async function initCustomersUI(container) {
    if (!container) return;

    container.innerHTML = `
        <div class="cust-ui-wrapper" style="font-family: 'Tajawal', sans-serif;">
            <div class="stats-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px;">
                <div class="stat-item" style="background:#fff; padding:15px; border-radius:10px; border-right:5px solid #2563eb; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
                    <small>إجمالي العملاء</small>
                    <div id="stat-total" style="font-size:1.5rem; font-weight:800;">0</div>
                </div>
                <div class="stat-item" style="background:#fff; padding:15px; border-radius:10px; border-right:5px solid #059669; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
                    <small>بيانات مكتملة</small>
                    <div id="stat-complete" style="font-size:1.5rem; font-weight:800; color:#059669;">0</div>
                </div>
                <div class="stat-item" style="background:#fff; padding:15px; border-radius:10px; border-right:5px solid #dc2626; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
                    <small>بيانات غير مكتملة</small>
                    <div id="stat-incomplete" style="font-size:1.5rem; font-weight:800; color:#dc2626;">0</div>
                </div>
                <div class="stat-item" style="background:#fff; padding:15px; border-radius:10px; border-right:5px solid #e67e22; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
                    <small>تصنيفات العملاء</small>
                    <div id="stat-types" style="font-size:0.9rem; font-weight:700; color:#e67e22; margin-top:5px;">نشط: 0 | تميز: 0</div>
                </div>
            </div>

            <div class="action-bar" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; background:#f8fafc; padding:10px; border-radius:8px;">
                <div class="search-box" style="position: relative; flex: 1; max-width: 400px;">
                    <i class="fas fa-search" style="position: absolute; right: 10px; top: 12px; color: #94a3b8;"></i>
                    <input type="text" id="cust-filter" placeholder="بحث بالاسم، الجوال، المدينة أو الحي..." 
                           style="width: 100%; padding: 10px 35px 10px 10px; border-radius: 6px; border: 1px solid #cbd5e1; outline: none;">
                </div>
                <button class="btn-tera" onclick="showAddCustomerModal()" style="background:#2563eb; color:#white; border:none; padding:10px 20px; border-radius:6px; cursor:pointer; font-weight:bold;">
                    <i class="fas fa-user-plus"></i> إضافة عميل جديد
                </button>
            </div>

            <div class="table-responsive" style="overflow-x: auto; background:#fff; border-radius:10px; box-shadow:0 4px 15px rgba(0,0,0,0.05);">
                <table class="tera-table" style="width:100%; border-collapse: collapse; min-width:1500px;">
                    <thead style="background:#f1f5f9; text-align:right;">
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
                            <th>الرمز</th>
                            <th>ص.ب</th>
                            <th>تاريخ الإضافة</th>
                            <th>الحالة</th>
                            <th>التصنيف</th>
                            <th style="text-align:center;">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody id="customers-list-render">
                        <tr><td colspan="17" style="text-align:center; padding:50px;">جاري جلب البيانات من تيرا جيت واي...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    await loadAndRender();
    setupSearch();
}

/**
 * جلب البيانات وعرضها مع حساب الإحصائيات
 */
async function loadAndRender() {
    const list = document.getElementById('customers-list-render');
    if (!list) return;

    try {
        const snapshot = await Core.fetchAllCustomers();
        list.innerHTML = '';
        
        let stats = { total: 0, complete: 0, incomplete: 0, active: 0, vips: 0 };
        let counter = 1;

        if (snapshot.empty) {
            list.innerHTML = '<tr><td colspan="17" style="text-align:center; padding:30px;">لا يوجد عملاء مسجلين حالياً.</td></tr>';
            updateStatsDisplay(stats);
            return;
        }

        snapshot.forEach(docSnap => {
            const d = docSnap.data();
            const id = docSnap.id;

            // حساب الإحصائيات
            stats.total++;
            // العميل المكتمل هو من لديه (اسم، جوال، مدينة، حي، رقم مبنى، رمز بريدي)
            const isComplete = (d.name && d.Phone && d.city && d.district && d.buildingNo && d.postalCode);
            if (isComplete) stats.complete++; else stats.incomplete++;
            
            if (d.status === 'مميز') stats.vips++; else stats.active++;

            // تنسيق التاريخ
            const dateStr = d.CreatedAt?.toDate ? d.CreatedAt.toDate().toLocaleDateString('ar-SA') : '-';

            // فصل مفتاح الدولة عن الرقم للعرض
            let countryKey = '-';
            let purePhone = d.Phone || '-';
            if (d.Phone && d.Phone.includes(' ')) {
                const parts = d.Phone.split(' ');
                countryKey = parts[0];
                purePhone = parts[1];
            }

            list.innerHTML += `
                <tr class="cust-row" style="border-bottom:1px solid #f1f5f9;">
                    <td style="padding:12px;">${counter++}</td>
                    <td style="font-weight:bold; color:#1e293b;">${d.name || '-'}</td>
                    <td dir="ltr">${purePhone}</td>
                    <td dir="ltr" style="color:#64748b;">${countryKey}</td>
                    <td><small>${d.Email || '-'}</small></td>
                    <td>${d.country || 'السعودية'}</td>
                    <td>${d.city || '-'}</td>
                    <td>${d.district || '-'}</td>
                    <td>${d.street || '-'}</td>
                    <td>${d.buildingNo || '-'}</td>
                    <td>${d.additionalNo || '-'}</td>
                    <td>${d.postalCode || '-'}</td>
                    <td>${d.poBox || '-'}</td>
                    <td style="font-size:0.8rem;">${dateStr}</td>
                    <td><span class="tag">${d.customerStatus || 'نشط'}</span></td>
                    <td><span class="tag-cat" style="color:#2563eb;">${d.status || 'عادي'}</span></td>
                    <td style="text-align:center;">
                        <div style="display:flex; gap:8px; justify-content:center;">
                            <button onclick="handlePrint('${id}')" style="color:#64748b; background:none; border:none; cursor:pointer;" title="طباعة"><i class="fas fa-print"></i></button>
                            <button onclick="handleEdit('${id}')" style="color:#2563eb; background:none; border:none; cursor:pointer;" title="تعديل"><i class="fas fa-pen"></i></button>
                            <button onclick="handleDelete('${id}')" style="color:#dc2626; background:none; border:none; cursor:pointer;" title="حذف"><i class="fas fa-trash"></i></button>
                        </div>
                    </td>
                </tr>`;
        });

        updateStatsDisplay(stats);

    } catch (error) {
        list.innerHTML = '<tr><td colspan="17" style="text-align:center; color:red;">خطأ في جلب البيانات: ' + error.message + '</td></tr>';
    }
}

/**
 * تحديث لوحة الإحصائيات
 */
function updateStatsDisplay(s) {
    document.getElementById('stat-total').innerText = s.total;
    document.getElementById('stat-complete').innerText = s.complete;
    document.getElementById('stat-incomplete').innerText = s.incomplete;
    document.getElementById('stat-types').innerText = `عادي: ${s.active} | مميز: ${s.vips}`;
}

/**
 * نظام البحث المباشر
 */
function setupSearch() {
    const input = document.getElementById('cust-filter');
    input.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        document.querySelectorAll('.cust-row').forEach(row => {
            row.style.display = row.innerText.toLowerCase().includes(term) ? '' : 'none';
        });
    });
}

// --- أفعال الأزرار (أزرة التحكم) ---

window.showAddCustomerModal = () => {
    editingId = null;
    if (document.getElementById('customer-form')) document.getElementById('customer-form').reset();
    document.getElementById('modal-title').innerText = "إضافة عميل جديد لتيرا جيت واي";
    document.getElementById('customer-modal').style.display = 'flex';
};

window.handleEdit = async (id) => {
    editingId = id;
    const d = await Core.fetchCustomerById(id);
    if (!d) return;

    // تعبئة البيانات في النموذج (Modal)
    document.getElementById('cust-name').value = d.name || '';
    document.getElementById('cust-email').value = d.Email || '';
    document.getElementById('cust-city').value = d.city || '';
    document.getElementById('cust-district').value = d.district || '';
    document.getElementById('cust-street').value = d.street || '';
    document.getElementById('cust-building').value = d.buildingNo || '';
    document.getElementById('cust-additional').value = d.additionalNo || '';
    document.getElementById('cust-postal').value = d.postalCode || '';
    document.getElementById('cust-pobox').value = d.poBox || '';
    document.getElementById('cust-status-active').value = d.customerStatus || 'نشط';
    document.getElementById('cust-category').value = d.status || 'عادي';

    if (d.Phone && d.Phone.includes(' ')) {
        const parts = d.Phone.split(' ');
        document.getElementById('cust-country-code').value = parts[0];
        document.getElementById('cust-phone').value = parts[1];
    } else {
        document.getElementById('cust-phone').value = d.Phone || '';
    }

    document.getElementById('modal-title').innerText = "تعديل بيانات العميل";
    document.getElementById('customer-modal').style.display = 'flex';
};

window.handleDelete = async (id) => {
    if (confirm('هل أنت متأكد من حذف هذا العميل نهائياً من قاعدة بيانات تيرا؟')) {
        const ok = await Core.removeCustomer(id);
        if (ok) await loadAndRender();
    }
};

window.handlePrint = (id) => {
    window.open(`customer-print.html?id=${id}`, '_blank');
};

window.closeCustomerModal = () => {
    document.getElementById('customer-modal').style.display = 'none';
};
