/**
 * customers-ui.js - Tera Gateway
 * إصلاح الأزرار: ربط الدوال بالنافذة العالمية (window) لضمان العمل
 */

import * as Core from './customers-core.js';

let editingId = null;

// --- دالة التهيئة الرئيسية ---
export async function initCustomersUI(container) {
    if (!container) return;

    container.innerHTML = `
        <div class="cust-ui-wrapper" style="font-family: 'Tajawal', sans-serif; direction: rtl; padding: 20px; background: #f9fbff;">
            
            <div class="stats-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; margin-bottom: 25px;">
                <div class="stat-card" style="background:#fff; padding:20px; border-radius:12px; border-right: 6px solid #2563eb; box-shadow:0 4px 12px rgba(0,0,0,0.05);">
                    <small>إجمالي العملاء</small>
                    <div id="stat-total" style="font-size:1.8rem; font-weight:800;">0</div>
                </div>
                <div class="stat-card" style="background:#fff; padding:20px; border-radius:12px; border-right: 6px solid #10b981; box-shadow:0 4px 12px rgba(0,0,0,0.05);">
                    <small>مكتمل البيانات</small>
                    <div id="stat-complete" style="font-size:1.8rem; font-weight:800; color:#10b981;">0</div>
                </div>
                <div class="stat-card" style="background:#fff; padding:20px; border-radius:12px; border-right: 6px solid #ef4444; box-shadow:0 4px 12px rgba(0,0,0,0.05);">
                    <small>غير مكتمل البيانات</small>
                    <div id="stat-incomplete" style="font-size:1.8rem; font-weight:800; color:#ef4444;">0</div>
                </div>
                <div class="stat-card" style="background:#fff; padding:20px; border-radius:12px; border-right: 6px solid #f59e0b; box-shadow:0 4px 12px rgba(0,0,0,0.05);">
                    <small>VIP</small>
                    <div id="stat-vips" style="font-size:1.8rem; font-weight:800; color:#f59e0b;">0</div>
                </div>
            </div>

            <div class="action-header" style="display: flex; justify-content: space-between; margin-bottom: 20px;">
                <button onclick="window.showAddCustomerModal()" style="background:#2563eb; color:white; border:none; padding:12px 25px; border-radius:10px; cursor:pointer; font-weight:bold;">
                    <i class="fas fa-plus"></i> اضافة عميل جديد
                </button>
                <input type="text" id="cust-filter" placeholder="بحث..." style="width:300px; padding:10px; border-radius:10px; border:1px solid #ddd;">
            </div>

            <div style="background:#fff; border-radius:15px; overflow-x:auto; box-shadow:0 4px 20px rgba(0,0,0,0.05);">
                <table style="width:100%; border-collapse: collapse; text-align: right; min-width:2000px;">
                    <thead style="background:#f8fafc;">
                        <tr>
                            <th style="padding:15px;">تسلسل</th>
                            <th>اسم العميل</th><th>الجوال</th><th>المفتاح</th><th>البريد</th>
                            <th>الدولة</th><th>المدينة</th><th>الحي</th><th>الشارع</th>
                            <th>المبنى</th><th>الإضافي</th><th>الرمز</th><th>الصندوق</th>
                            <th>التاريخ</th><th>الحالة</th><th>التصنيف</th><th>الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody id="customers-list-render"></tbody>
                </table>
            </div>
        </div>
    `;
    
    await loadAndRender();
    setupSearch();
}

// --- ربط الدوال بـ window لجعلها تعمل من الـ HTML ---

window.showAddCustomerModal = () => {
    editingId = null;
    document.getElementById('customer-form')?.reset();
    document.getElementById('modal-title').innerText = "إضافة عميل جديد";
    document.getElementById('customer-modal').style.display = 'flex';
};

window.closeCustomerModal = () => {
    document.getElementById('customer-modal').style.display = 'none';
};

window.saveCustomerData = async () => {
    const get = (id) => document.getElementById(id)?.value || '';
    const payload = {
        name: get('cust-name'),
        phone: get('cust-phone'),
        email: get('cust-email'),
        city: get('cust-city'),
        district: get('cust-district'),
        street: get('cust-street'),
        buildingNo: get('cust-building'),
        additionalNo: get('cust-additional'),
        postalCode: get('cust-postal'),
        poBox: get('cust-pobox'),
        tag: get('cust-category')
    };

    if (editingId) await Core.updateCustomer(editingId, payload);
    else await Core.addCustomer(payload);

    window.closeCustomerModal();
    await loadAndRender();
};

window.handleEdit = async (id) => {
    editingId = id;
    const d = await Core.fetchCustomerById(id);
    if (!d) return;

    const fill = (id, val) => { if(document.getElementById(id)) document.getElementById(id).value = val || ''; };
    fill('cust-name', d.name);
    fill('cust-phone', d.phone);
    fill('cust-email', d.email);
    fill('cust-city', d.city);
    fill('cust-district', d.district);
    fill('cust-street', d.street);
    fill('cust-building', d.buildingNo);
    fill('cust-additional', d.additionalNo);
    fill('cust-postal', d.postalCode);
    fill('cust-pobox', d.poBox);
    fill('cust-category', d.tag);

    document.getElementById('modal-title').innerText = "تعديل بيانات العميل";
    document.getElementById('customer-modal').style.display = 'flex';
};

window.handleDelete = async (id) => {
    if (confirm('تأكيد الحذف؟')) {
        await Core.removeCustomer(id);
        await loadAndRender();
    }
};

window.handlePrint = (id) => {
    window.open(`admin/modules/print-customer.html?id=${id}`, '_blank');
};

// --- وظائف العرض والبحث ---

async function loadAndRender() {
    const list = document.getElementById('customers-list-render');
    if (!list) return;

    const snapshot = await Core.fetchAllCustomers();
    list.innerHTML = '';
    let stats = { total: 0, complete: 0, incomplete: 0, vips: 0 };
    let i = 1;

    snapshot.forEach(docSnap => {
        const d = docSnap.data();
        const id = docSnap.id;
        const isComp = (d.name && d.phone && d.city && d.district);
        
        stats.total++;
        if (isComp) stats.complete++; else stats.incomplete++;
        if (d.tag === 'vip') stats.vips++;

        list.innerHTML += `
            <tr class="cust-row" style="border-bottom:1px solid #eee;">
                <td style="padding:12px;">${i++}</td>
                <td><b>${d.name || '-'}</b></td>
                <td dir="ltr">${d.phone || '-'}</td>
                <td>${d.countryCode || '+966'}</td>
                <td>${d.email || '-'}</td>
                <td>السعودية</td>
                <td>${d.city || '-'}</td>
                <td>${d.district || '-'}</td>
                <td>${d.street || '-'}</td>
                <td>${d.buildingNo || '-'}</td>
                <td>${d.additionalNo || '-'}</td>
                <td>${d.postalCode || '-'}</td>
                <td>${d.poBox || '-'}</td>
                <td>${d.createdAt?.substring(0, 10) || '-'}</td>
                <td>نشط</td>
                <td>${(d.tag || 'عادي').toUpperCase()}</td>
                <td>
                    <button onclick="window.handleEdit('${id}')" style="color:blue; border:none; background:none; cursor:pointer;"><i class="fas fa-edit"></i></button>
                    <button onclick="window.handlePrint('${id}')" style="color:gray; border:none; background:none; cursor:pointer;"><i class="fas fa-print"></i></button>
                    <button onclick="window.handleDelete('${id}')" style="color:red; border:none; background:none; cursor:pointer;"><i class="fas fa-trash"></i></button>
                </td>
            </tr>`;
    });

    document.getElementById('stat-total').innerText = stats.total;
    document.getElementById('stat-complete').innerText = stats.complete;
    document.getElementById('stat-incomplete').innerText = stats.incomplete;
    document.getElementById('stat-vips').innerText = stats.vips;
}

function setupSearch() {
    document.getElementById('cust-filter')?.addEventListener('input', (e) => {
        const val = e.target.value.toLowerCase();
        document.querySelectorAll('.cust-row').forEach(r => {
            r.style.display = r.innerText.toLowerCase().includes(val) ? '' : 'none';
        });
    });
}
