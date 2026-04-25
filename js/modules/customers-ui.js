/**
 * customers-ui.js - Tera Gateway
 * الإصدار الاحترافي المصلح: معالجة البيانات القديمة + إصلاح التعديل والإضافة
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
                <div class="stat-item" style="background:#fff; padding:15px; border-radius:12px; border-right:5px solid #2563eb; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
                    <small style="color:#64748b; display:block; margin-bottom:5px;">إجمالي العملاء</small>
                    <div id="stat-total" style="font-size:1.6rem; font-weight:800; color:#1e293b;">0</div>
                </div>
                <div class="stat-item" style="background:#fff; padding:15px; border-radius:12px; border-right:5px solid #059669; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
                    <small style="color:#64748b; display:block; margin-bottom:5px;">نشط حالياً</small>
                    <div id="stat-active" style="font-size:1.6rem; font-weight:800; color:#059669;">0</div>
                </div>
                <div class="stat-item" style="background:#fff; padding:15px; border-radius:12px; border-right:5px solid #eab308; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
                    <small style="color:#64748b; display:block; margin-bottom:5px;">عملاء تميز/VIP</small>
                    <div id="stat-vips" style="font-size:1.6rem; font-weight:800; color:#eab308;">0</div>
                </div>
            </div>

            <div class="action-bar" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; background:#fff; padding:15px; border-radius:12px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                <div class="search-box" style="position: relative; flex: 1; max-width: 400px;">
                    <i class="fas fa-search" style="position: absolute; right: 12px; top: 12px; color: #94a3b8;"></i>
                    <input type="text" id="cust-filter" placeholder="ابحث بالاسم، الجوال، أو المدينة..." 
                           style="width: 100%; padding: 12px 40px 12px 12px; border-radius: 10px; border: 1px solid #e2e8f0; outline: none; font-family: inherit; font-size: 0.95rem;">
                </div>
                <button onclick="showAddCustomerModal()" style="background:#2563eb; color:white; border:none; padding:12px 25px; border-radius:10px; cursor:pointer; font-weight:bold; display: flex; align-items: center; gap: 10px; transition: all 0.3s; box-shadow: 0 4px 12px rgba(37,99,235,0.2);">
                    <i class="fas fa-plus-circle"></i> إضافة عميل جديد
                </button>
            </div>

            <div class="table-container" style="background:#fff; border-radius:15px; box-shadow:0 10px 25px -5px rgba(0,0,0,0.05); overflow:hidden;">
                <div style="overflow-x: auto;">
                    <table style="width:100%; border-collapse: collapse; min-width:1200px; text-align: right;">
                        <thead style="background:#f8fafc; color:#64748b; text-transform: uppercase; font-size: 0.85rem;">
                            <tr>
                                <th style="padding:18px 15px;">الاسم</th>
                                <th>رقم الجوال</th>
                                <th>المدينة / الحي</th>
                                <th>التصنيف</th>
                                <th>الحالة</th>
                                <th>تاريخ التسجيل</th>
                                <th style="text-align:center;">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody id="customers-list-render">
                            <tr><td colspan="7" style="text-align:center; padding:50px;"><i class="fas fa-sync fa-spin"></i> جاري جلب عملاء تيرا...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
    
    await loadAndRender();
    setupSearch();
}

/**
 * دالة قراءة البيانات بذكاء (لحل مشكلة العملاء القدامى)
 */
function getCustData(data, field) {
    const maps = {
        'phone': ['Phone', 'phone', 'mobile', 'رقم_الجوال'],
        'email': ['Email', 'email', 'البريد'],
        'name': ['name', 'Name', 'الاسم'],
        'status': ['status', 'customerType', 'التصنيف'],
        'cStatus': ['customerStatus', 'activeStatus', 'الحالة']
    };
    
    if (!maps[field]) return data[field] || '-';
    
    for (let key of maps[field]) {
        if (data[key] !== undefined && data[key] !== null) return data[key];
    }
    return '-';
}

/**
 * تحميل البيانات وحساب الإحصائيات
 */
async function loadAndRender() {
    const list = document.getElementById('customers-list-render');
    if (!list) return;

    try {
        const snapshot = await Core.fetchAllCustomers();
        list.innerHTML = '';
        
        let stats = { total: 0, vips: 0, active: 0 };

        if (!snapshot || snapshot.empty) {
            list.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:40px; color:#94a3b8;">لا يوجد بيانات حالياً.</td></tr>';
            return;
        }

        snapshot.forEach(docSnap => {
            const d = docSnap.data();
            const id = docSnap.id;

            // استخراج البيانات باستخدام محرك التوافق
            const name = getCustData(d, 'name');
            const phone = getCustData(d, 'phone');
            const city = d.city || 'غير محدد';
            const district = d.district || '';
            const status = getCustData(d, 'status');
            const cStatus = getCustData(d, 'cStatus');
            const createdAt = d.CreatedAt?.toDate ? d.CreatedAt.toDate().toLocaleDateString('ar-SA') : 'قديم';

            // تحديث الإحصائيات
            stats.total++;
            if (status === 'vip' || status === 'مميز' || status === 'تميز') stats.vips++;
            if (cStatus === 'نشط' || !cStatus) stats.active++;

            list.innerHTML += `
                <tr class="cust-row" style="border-bottom:1px solid #f1f5f9; transition: 0.2s;">
                    <td style="padding:15px; font-weight:700; color:#1e293b;">${name}</td>
                    <td dir="ltr" style="color:#2563eb; font-weight:600;">${phone}</td>
                    <td>${city} ${district ? '- ' + district : ''}</td>
                    <td><span style="background:#eff6ff; color:#2563eb; padding:4px 10px; border-radius:6px; font-size:0.8rem; font-weight:700;">${status}</span></td>
                    <td><span style="color:${cStatus === 'متأخر' ? '#dc2626' : '#059669'};">● ${cStatus || 'نشط'}</span></td>
                    <td style="color:#94a3b8; font-size:0.85rem;">${createdAt}</td>
                    <td>
                        <div style="display:flex; gap:8px; justify-content:center;">
                            <button onclick="handleEdit('${id}')" style="background:#f1f5f9; border:none; width:35px; height:35px; border-radius:8px; color:#2563eb; cursor:pointer;" title="تعديل"><i class="fas fa-edit"></i></button>
                            <button onclick="handleDelete('${id}')" style="background:#fff1f2; border:none; width:35px; height:35px; border-radius:8px; color:#dc2626; cursor:pointer;" title="حذف"><i class="fas fa-trash"></i></button>
                            <button onclick="handlePrint('${id}')" style="background:#f8fafc; border:none; width:35px; height:35px; border-radius:8px; color:#64748b; cursor:pointer;"><i class="fas fa-print"></i></button>
                        </div>
                    </td>
                </tr>`;
        });

        // تحديث أرقام الإحصائيات في الواجهة
        if (document.getElementById('stat-total')) document.getElementById('stat-total').innerText = stats.total;
        if (document.getElementById('stat-active')) document.getElementById('stat-active').innerText = stats.active;
        if (document.getElementById('stat-vips')) document.getElementById('stat-vips').innerText = stats.vips;

    } catch (error) {
        console.error("Fetch Error:", error);
        list.innerHTML = '<tr><td colspan="7" style="text-align:center; color:#dc2626; padding:20px;">فشل الاتصال بقاعدة بيانات تيرا.</td></tr>';
    }
}

/**
 * محرك البحث السريع
 */
function setupSearch() {
    const input = document.getElementById('cust-filter');
    if (!input) return;
    input.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        document.querySelectorAll('.cust-row').forEach(row => {
            row.style.display = row.innerText.toLowerCase().includes(term) ? '' : 'none';
        });
    });
}

// --- العمليات العالمية (أزرار التفاعل) ---

window.showAddCustomerModal = () => {
    editingId = null;
    const form = document.getElementById('customer-form');
    if (form) form.reset();
    
    const modal = document.getElementById('customer-modal');
    const title = document.getElementById('modal-title');
    
    if (title) title.innerText = "إضافة عميل جديد لتيرا";
    if (modal) modal.style.display = 'flex';
};

window.handleEdit = async (id) => {
    editingId = id;
    try {
        const d = await Core.fetchCustomerById(id);
        if (!d) return;

        // تعبئة النموذج مع مراعاة المسميات القديمة والجديدة
        const setVal = (fieldId, val) => {
            const el = document.getElementById(fieldId);
            if (el) el.value = val || '';
        };

        setVal('cust-name', getCustData(d, 'name'));
        setVal('cust-phone', getCustData(d, 'phone'));
        setVal('cust-email', getCustData(d, 'email'));
        setVal('cust-city', d.city);
        setVal('cust-district', d.district);
        setVal('cust-street', d.street);
        setVal('cust-building', d.buildingNo);
        setVal('cust-additional', d.additionalNo);
        setVal('cust-postal', d.postalCode);
        setVal('cust-pobox', d.poBox);
        setVal('cust-status-active', getCustData(d, 'cStatus'));
        setVal('cust-category', getCustData(d, 'status'));

        const modal = document.getElementById('customer-modal');
        const title = document.getElementById('modal-title');
        if (title) title.innerText = "تعديل بيانات العميل";
        if (modal) modal.style.display = 'flex';
    } catch (err) {
        alert("خطأ في جلب بيانات التعديل.");
    }
};

window.saveCustomerData = async () => {
    const getVal = (id) => document.getElementById(id)?.value || '';

    const payload = {
        name: getVal('cust-name'),
        Phone: getVal('cust-phone'),
        Email: getVal('cust-email'),
        city: getVal('cust-city'),
        district: getVal('cust-district'),
        street: getVal('cust-street'),
        buildingNo: getVal('cust-building'),
        additionalNo: getVal('cust-additional'),
        postalCode: getVal('cust-postal'),
        poBox: getVal('cust-pobox'),
        customerStatus: getVal('cust-status-active'),
        status: getVal('cust-category'),
        updatedAt: new Date()
    };

    try {
        if (editingId) {
            await Core.updateCustomer(editingId, payload);
        } else {
            payload.CreatedAt = new Date();
            await Core.addCustomer(payload);
        }
        
        window.closeCustomerModal();
        await loadAndRender(); // تحديث القائمة فوراً
    } catch (err) {
        console.error("Save Error:", err);
        alert("فشل الحفظ. تأكد من صلاحيات قاعدة البيانات.");
    }
};

window.handleDelete = async (id) => {
    if (confirm('هل أنت متأكد من حذف هذا العميل نهائياً من نظام تيرا؟')) {
        const success = await Core.removeCustomer(id);
        if (success) await loadAndRender();
    }
};

window.handlePrint = (id) => {
    window.open(`admin/modules/print-customer.html?id=${id}`, '_blank');
};

window.closeCustomerModal = () => {
    const modal = document.getElementById('customer-modal');
    if (modal) modal.style.display = 'none';
};
