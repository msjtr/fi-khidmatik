/**
 * customers-ui.js - Tera Gateway
 * الإصدار النهائي الموحد: يعالج الإحصائيات، الجدول الموسع، والمودال
 */

import * as Core from './customers-core.js';

let editingId = null;

/**
 * تشغيل واجهة العملاء
 */
export async function initCustomersUI(container) {
    if (!container) return;

    // بناء الهيكل الأساسي للواجهة داخل الحاوية
    container.innerHTML = `
        <div class="cust-ui-wrapper">
            <div class="grid-4" style="margin-bottom: 25px;">
                <div class="stat-item" style="border-right: 5px solid var(--primary);">
                    <small>إجمالي العملاء</small>
                    <div id="stat-total" style="font-size: 1.5rem; font-weight: 800;">0</div>
                </div>
                <div class="stat-item" style="border-right: 5px solid var(--hail-green);">
                    <small>مكتمل البيانات</small>
                    <div id="stat-complete" style="font-size: 1.5rem; font-weight: 800; color: var(--hail-green);">0</div>
                </div>
                <div class="stat-item" style="border-right: 5px solid #ef4444;">
                    <small>ناقص البيانات</small>
                    <div id="stat-incomplete" style="font-size: 1.5rem; font-weight: 800; color: #ef4444;">0</div>
                </div>
                <div class="stat-item" style="border-right: 5px solid var(--vip-gold);">
                    <small>عملاء VIP</small>
                    <div id="stat-vips" style="font-size: 1.5rem; font-weight: 800; color: var(--vip-gold);">0</div>
                </div>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; background: #fff; padding: 15px; border-radius: 15px; box-shadow: var(--shadow-sm);">
                <div style="position: relative; width: 400px;">
                    <i class="fas fa-search" style="position: absolute; right: 15px; top: 13px; color: #94a3b8;"></i>
                    <input type="text" id="cust-filter" class="tera-input" placeholder="بحث باسم العميل أو الجوال..." style="padding-right: 45px;">
                </div>
            </div>

            <div class="table-wrapper">
                <div style="overflow-x: auto;">
                    <table class="tera-table-modern">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>الاسم الكامل</th>
                                <th>الجوال</th>
                                <th>المدينة</th>
                                <th>الحي</th>
                                <th>المبنى</th>
                                <th>الرمز البريدي</th>
                                <th>التاريخ</th>
                                <th>التصنيف</th>
                                <th>الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody id="customers-list-render">
                            <tr><td colspan="10" style="text-align:center; padding:40px;">جاري المزامنة مع تيرا...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    // ربط البحث تلقائياً
    setupSearch();
    
    // جلب البيانات ورسمها
    await loadAndRender();
}

/**
 * جلب البيانات من فايربيس ورسم الجدول
 */
async function loadAndRender() {
    const list = document.getElementById('customers-list-render');
    if (!list) return;

    try {
        const snapshot = await Core.fetchAllCustomers();
        list.innerHTML = '';
        
        let stats = { total: 0, vips: 0, complete: 0, incomplete: 0 };
        let counter = 1;

        snapshot.forEach(docSnap => {
            const d = docSnap.data();
            const id = docSnap.id;
            stats.total++;

            // معيار اكتمال البيانات (اسم، جوال، مدينة، حي، مبنى)
            const isComplete = (d.name && d.phone && d.city && d.district && d.buildingNo);
            if (isComplete) stats.complete++; else stats.incomplete++;
            if (d.tag === 'vip' || d.tag === 'مميز') stats.vips++;

            list.innerHTML += `
                <tr class="cust-row">
                    <td>${counter++}</td>
                    <td style="font-weight: 800; color: var(--dark);">${d.name || '-'}</td>
                    <td dir="ltr" style="font-weight: 700; color: var(--primary);">${d.phone || '-'}</td>
                    <td>${d.city || 'حائل'}</td>
                    <td>${d.district || '-'}</td>
                    <td>${d.buildingNo || '-'}</td>
                    <td>${d.postalCode || '-'}</td>
                    <td style="font-size: 0.8rem; color: #64748b;">${d.createdAt ? d.createdAt.substring(0, 10) : '-'}</td>
                    <td>
                        <span class="${(d.tag === 'vip' || d.tag === 'مميز') ? 'tag-vip' : ''}" 
                              style="padding: 4px 10px; border-radius: 6px; font-size: 0.75rem; font-weight: bold; background: ${d.tag === 'vip' ? '#fff7ed' : '#f1f5f9'}; border: 1px solid ${d.tag === 'vip' ? 'var(--vip-gold)' : '#e2e8e0'};">
                            ${(d.tag || 'عادي').toUpperCase()}
                        </span>
                    </td>
                    <td>
                        <div style="display: flex; gap: 8px;">
                            <button onclick="handleEdit('${id}')" title="تعديل" style="color: var(--primary); border:none; background:none; cursor:pointer; font-size: 1.1rem;">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button onclick="handleDelete('${id}')" title="حذف" style="color: #ef4444; border:none; background:none; cursor:pointer; font-size: 1.1rem;">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
                    </td>
                </tr>`;
        });

        // تحديث أرقام الإحصائيات في الأعلى
        if(document.getElementById('stat-total')) document.getElementById('stat-total').innerText = stats.total;
        if(document.getElementById('stat-complete')) document.getElementById('stat-complete').innerText = stats.complete;
        if(document.getElementById('stat-incomplete')) document.getElementById('stat-incomplete').innerText = stats.incomplete;
        if(document.getElementById('stat-vips')) document.getElementById('stat-vips').innerText = stats.vips;

    } catch (error) {
        console.error("Render Error:", error);
        list.innerHTML = '<tr><td colspan="10" style="color:red; padding:20px;">خطأ في تحميل البيانات. تأكد من اتصال الإنترنت.</td></tr>';
    }
}

/**
 * وظائف النافذة المنبثقة (Modal)
 */
window.showAddCustomerModal = () => {
    editingId = null;
    const form = document.getElementById('customer-form');
    if (form) form.reset();
    
    const title = document.getElementById('modal-title');
    if (title) title.innerHTML = '<i class="fas fa-user-plus"></i> إضافة عميل جديد لتيرا';
    
    const modal = document.getElementById('customer-modal');
    if (modal) modal.style.display = 'flex';
};

window.closeCustomerModal = () => {
    const modal = document.getElementById('customer-modal');
    if (modal) modal.style.display = 'none';
};

/**
 * التعديل والحفظ
 */
window.handleEdit = async (id) => {
    editingId = id;
    try {
        const d = await Core.fetchCustomerById(id);
        if (!d) return;

        // تعبئة الحقول (تأكد من مطابقة الـ IDs في الـ HTML)
        const fill = (id, val) => { const el = document.getElementById(id); if(el) el.value = val || ''; };
        
        fill('cust-name', d.name);
        fill('cust-phone', d.phone);
        fill('cust-email', d.email);
        fill('cust-city', d.city);
        fill('cust-district', d.district);
        fill('cust-street', d.street);
        fill('cust-building', d.buildingNo); // مبنى
        fill('cust-additional', d.additionalNo); // إضافي
        fill('cust-postal', d.postalCode); // رمز
        fill('cust-pobox', d.poBox); // صندوق
        fill('cust-category', d.tag);

        const title = document.getElementById('modal-title');
        if (title) title.innerText = "تعديل بيانات العميل: " + (d.name || '');
        
        const modal = document.getElementById('customer-modal');
        if (modal) modal.style.display = 'flex';
    } catch (e) {
        console.error("Edit Error:", e);
    }
};

window.saveCustomerData = async () => {
    const get = (id) => document.getElementById(id)?.value;

    const data = {
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
        tag: get('cust-category'),
        updatedAt: new Date().toISOString()
    };

    try {
        if (editingId) {
            await Core.updateCustomer(editingId, data);
        } else {
            await Core.addCustomer(data);
        }
        closeCustomerModal();
        await loadAndRender();
    } catch (error) {
        alert("حدث خطأ أثناء الحفظ، يرجى المحاولة مرة أخرى.");
    }
};

window.handleDelete = async (id) => {
    if (confirm('هل أنت متأكد من حذف هذا العميل نهائياً من نظام تيرا؟')) {
        const success = await Core.removeCustomer(id);
        if (success) await loadAndRender();
    }
};

/**
 * نظام البحث السريع
 */
function setupSearch() {
    const filterInput = document.getElementById('cust-filter');
    if (!filterInput) return;

    filterInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const rows = document.querySelectorAll('.cust-row');
        
        rows.forEach(row => {
            const text = row.innerText.toLowerCase();
            row.style.display = text.includes(term) ? '' : 'none';
        });
    });
}
