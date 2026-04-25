/**
 * customers-ui.js - Tera Gateway
 * الإصدار النهائي المصلح: ترتيب شامل + إحصائيات + محرك بحث وتعديل فعال
 */

import * as Core from './customers-core.js';

let editingId = null;

/**
 * تهيئة الواجهة الرئيسية للعملاء
 */
export async function initCustomersUI(container) {
    if (!container) return;

    container.innerHTML = `
        <div class="cust-ui-wrapper" style="font-family: 'Tajawal', sans-serif; direction: rtl;">
            <div class="stats-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px;">
                <div class="stat-item" style="background:#fff; padding:15px; border-radius:10px; border-right:5px solid #2563eb; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
                    <small style="color:#64748b;">إجمالي العملاء</small>
                    <div id="stat-total" style="font-size:1.5rem; font-weight:800;">0</div>
                </div>
                <div class="stat-item" style="background:#fff; padding:15px; border-radius:10px; border-right:5px solid #059669; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
                    <small style="color:#64748b;">بيانات مكتملة</small>
                    <div id="stat-complete" style="font-size:1.5rem; font-weight:800; color:#059669;">0</div>
                </div>
                <div class="stat-item" style="background:#fff; padding:15px; border-radius:10px; border-right:5px solid #dc2626; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
                    <small style="color:#64748b;">بيانات غير مكتملة</small>
                    <div id="stat-incomplete" style="font-size:1.5rem; font-weight:800; color:#dc2626;">0</div>
                </div>
                <div class="stat-item" style="background:#fff; padding:15px; border-radius:10px; border-right:5px solid #e67e22; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
                    <small style="color:#64748b;">تصنيف العملاء</small>
                    <div id="stat-types" style="font-size:0.9rem; font-weight:700; color:#e67e22; margin-top:5px;">نشط: 0 | تميز: 0</div>
                </div>
            </div>

            <div class="action-bar" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; background:#f8fafc; padding:15px; border-radius:10px;">
                <div class="search-box" style="position: relative; flex: 1; max-width: 400px;">
                    <i class="fas fa-search" style="position: absolute; right: 12px; top: 12px; color: #94a3b8;"></i>
                    <input type="text" id="cust-filter" placeholder="بحث بالاسم، الجوال، المدينة..." 
                           style="width: 100%; padding: 10px 40px 10px 10px; border-radius: 8px; border: 1px solid #cbd5e1; outline: none; font-family: inherit;">
                </div>
                <button onclick="showAddCustomerModal()" style="background:#2563eb; color:white; border:none; padding:10px 25px; border-radius:8px; cursor:pointer; font-weight:bold; transition: 0.3s; display: flex; align-items: center; gap: 8px;">
                    <i class="fas fa-user-plus"></i> إضافة عميل جديد
                </button>
            </div>

            <div class="table-responsive" style="overflow-x: auto; background:#fff; border-radius:12px; box-shadow:0 4px 20px rgba(0,0,0,0.08);">
                <table style="width:100%; border-collapse: collapse; min-width:1600px; text-align: right;">
                    <thead style="background:#f8fafc; color:#475569; border-bottom: 2px solid #edf2f7;">
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
                            <th>حالة العميل</th>
                            <th>تصنيف العميل</th>
                            <th style="text-align:center;">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody id="customers-list-render">
                        <tr><td colspan="17" style="text-align:center; padding:50px; color:#64748b;"><i class="fas fa-spinner fa-spin"></i> جاري مزامنة بيانات تيرا...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    await loadAndRender();
    setupSearch();
}

/**
 * تحميل البيانات وحساب الإحصائيات الدقيقة
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
            list.innerHTML = '<tr><td colspan="17" style="text-align:center; padding:40px; color:#94a3b8;">لا يوجد عملاء مسجلين حالياً في النظام.</td></tr>';
            updateStatsDisplay(stats);
            return;
        }

        snapshot.forEach(docSnap => {
            const d = docSnap.data();
            const id = docSnap.id;

            // منطق الإحصائيات
            stats.total++;
            const isComplete = (d.name && d.Phone && d.city && d.district && d.buildingNo);
            if (isComplete) stats.complete++; else stats.incomplete++;
            if (d.status === 'مميز' || d.status === 'تميز') stats.vips++; else stats.active++;

            const dateStr = d.CreatedAt?.toDate ? d.CreatedAt.toDate().toLocaleDateString('ar-SA') : '-';

            // معالجة رقم الجوال والمفتاح
            let countryKey = d.countryCode || '+966';
            let purePhone = d.Phone || '-';

            list.innerHTML += `
                <tr class="cust-row" style="border-bottom:1px solid #f1f5f9; transition: 0.2s;" onmouseover="this.style.background='#fcfcfc'" onmouseout="this.style.background='transparent'">
                    <td style="padding:12px; color:#94a3b8;">${counter++}</td>
                    <td style="font-weight:bold; color:#1e293b;">${d.name || '-'}</td>
                    <td dir="ltr">${purePhone}</td>
                    <td dir="ltr" style="color:#64748b;">${countryKey}</td>
                    <td><small style="color:#2563eb;">${d.Email || '-'}</small></td>
                    <td>${d.country || 'السعودية'}</td>
                    <td>${d.city || '-'}</td>
                    <td>${d.district || '-'}</td>
                    <td>${d.street || '-'}</td>
                    <td>${d.buildingNo || '-'}</td>
                    <td>${d.additionalNo || '-'}</td>
                    <td>${d.postalCode || '-'}</td>
                    <td>${d.poBox || '-'}</td>
                    <td style="font-size:0.85rem; color:#64748b;">${dateStr}</td>
                    <td><span style="padding:4px 10px; border-radius:20px; font-size:0.75rem; background:#f0fdf4; color:#166534;">${d.customerStatus || 'نشط'}</span></td>
                    <td><b style="color:#2563eb;">${d.status || 'عادي'}</b></td>
                    <td style="text-align:center;">
                        <div style="display:flex; gap:10px; justify-content:center;">
                            <button onclick="handlePrint('${id}')" style="color:#64748b; background:none; border:none; cursor:pointer;" title="طباعة العقد"><i class="fas fa-print"></i></button>
                            <button onclick="handleEdit('${id}')" style="color:#2563eb; background:none; border:none; cursor:pointer;" title="تعديل"><i class="fas fa-edit"></i></button>
                            <button onclick="handleDelete('${id}')" style="color:#dc2626; background:none; border:none; cursor:pointer;" title="حذف"><i class="fas fa-trash-alt"></i></button>
                        </div>
                    </td>
                </tr>`;
        });

        updateStatsDisplay(stats);

    } catch (error) {
        list.innerHTML = '<tr><td colspan="17" style="text-align:center; color:#dc2626; padding:20px;">خطأ في الاتصال بقاعدة البيانات.</td></tr>';
    }
}

function updateStatsDisplay(s) {
    document.getElementById('stat-total').innerText = s.total;
    document.getElementById('stat-complete').innerText = s.complete;
    document.getElementById('stat-incomplete').innerText = s.incomplete;
    document.getElementById('stat-types').innerText = `نشط: ${s.active} | تميز: ${s.vips}`;
}

function setupSearch() {
    const input = document.getElementById('cust-filter');
    input.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        document.querySelectorAll('.cust-row').forEach(row => {
            row.style.display = row.innerText.toLowerCase().includes(term) ? '' : 'none';
        });
    });
}

// --- العمليات (الربط مع الـ Modal والمحرك) ---

window.showAddCustomerModal = () => {
    editingId = null;
    const form = document.getElementById('customer-form');
    if (form) form.reset();
    document.getElementById('modal-title').innerText = "إضافة عميل جديد (Tera)";
    document.getElementById('customer-modal').style.display = 'flex';
};

window.handleEdit = async (id) => {
    editingId = id;
    const d = await Core.fetchCustomerById(id);
    if (!d) return;

    // تعبئة النموذج
    document.getElementById('cust-name').value = d.name || '';
    document.getElementById('cust-phone').value = d.Phone || '';
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

    document.getElementById('modal-title').innerText = "تعديل بيانات العميل";
    document.getElementById('customer-modal').style.display = 'flex';
};

window.handleDelete = async (id) => {
    if (confirm('تنبيه: هل تريد حذف العميل نهائياً من منصة تيرا؟')) {
        const success = await Core.removeCustomer(id);
        if (success) await loadAndRender();
    }
};

/**
 * وظيفة حفظ البيانات (إضافة أو تعديل)
 * يتم استدعاؤها عند النقر على "حفظ" في المودال
 */
window.saveCustomerData = async () => {
    const data = {
        name: document.getElementById('cust-name').value,
        Phone: document.getElementById('cust-phone').value,
        Email: document.getElementById('cust-email').value,
        city: document.getElementById('cust-city').value,
        district: document.getElementById('cust-district').value,
        street: document.getElementById('cust-street').value,
        buildingNo: document.getElementById('cust-building').value,
        additionalNo: document.getElementById('cust-additional').value,
        postalCode: document.getElementById('cust-postal').value,
        poBox: document.getElementById('cust-pobox').value,
        customerStatus: document.getElementById('cust-status-active').value,
        status: document.getElementById('cust-category').value,
        country: 'السعودية',
        countryCode: '+966'
    };

    try {
        if (editingId) {
            await Core.updateCustomer(editingId, data);
        } else {
            await Core.addCustomer(data);
        }
        window.closeCustomerModal();
        await loadAndRender();
    } catch (err) {
        alert("حدث خطأ أثناء حفظ البيانات، يرجى المحاولة لاحقاً.");
    }
};

window.handlePrint = (id) => {
    alert("جاري تجهيز نسخة الطباعة للعميل...");
    window.open(`print-customer.html?id=${id}`, '_blank');
};

window.closeCustomerModal = () => {
    document.getElementById('customer-modal').style.display = 'none';
};
