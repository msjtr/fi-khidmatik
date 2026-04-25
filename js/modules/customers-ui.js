/**
 * customers-ui.js - Tera Gateway
 * الإصدار المعتمد نهائياً: متوافق مع مجموعة 'customers' والمسميات الدقيقة
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
                <div class="stat-item" style="background:#fff; padding:15px; border-radius:12px; border-right:5px solid #2563eb; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                    <small style="color:#64748b; display:block; margin-bottom:5px;">إجمالي العملاء</small>
                    <div id="stat-total" style="font-size:1.6rem; font-weight:800; color:#1e293b;">0</div>
                </div>
                <div class="stat-item" style="background:#fff; padding:15px; border-radius:12px; border-right:5px solid #eab308; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                    <small style="color:#64748b; display:block; margin-bottom:5px;">عملاء تميز (VIP)</small>
                    <div id="stat-vips" style="font-size:1.6rem; font-weight:800; color:#eab308;">0</div>
                </div>
                <div class="stat-item" style="background:#fff; padding:15px; border-radius:12px; border-right:5px solid #059669; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                    <small style="color:#64748b; display:block; margin-bottom:5px;">مركز العمليات</small>
                    <div style="font-size:1.2rem; font-weight:800; color:#059669; margin-top:5px;">حائل</div>
                </div>
            </div>

            <div class="action-bar" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; background:#fff; padding:15px; border-radius:12px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                <div class="search-box" style="position: relative; flex: 1; max-width: 400px;">
                    <i class="fas fa-search" style="position: absolute; right: 12px; top: 12px; color: #94a3b8;"></i>
                    <input type="text" id="cust-filter" placeholder="بحث بالاسم، الجوال، المدينة، أو الحي..." 
                           style="width: 100%; padding: 12px 40px 12px 12px; border-radius: 10px; border: 1px solid #e2e8f0; outline: none; font-family: inherit;">
                </div>
                <button onclick="showAddCustomerModal()" style="background:#2563eb; color:white; border:none; padding:12px 25px; border-radius:10px; cursor:pointer; font-weight:bold; display: flex; align-items: center; gap: 10px; box-shadow: 0 4px 12px rgba(37,99,235,0.2);">
                    <i class="fas fa-plus"></i> إضافة عميل جديد
                </button>
            </div>

            <div class="table-container" style="background:#fff; border-radius:15px; box-shadow:0 10px 25px rgba(0,0,0,0.05); overflow:hidden;">
                <div style="overflow-x: auto;">
                    <table style="width:100%; border-collapse: collapse; min-width:1200px; text-align: right;">
                        <thead style="background:#f8fafc; color:#64748b; font-size: 0.85rem;">
                            <tr>
                                <th style="padding:18px 15px;">اسم العميل</th>
                                <th>الجوال</th>
                                <th>المدينة والحي</th>
                                <th>العنوان الوطني</th>
                                <th>التصنيف</th>
                                <th>تاريخ التسجيل</th>
                                <th style="text-align:center;">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody id="customers-list-render">
                            <tr><td colspan="7" style="text-align:center; padding:50px;"><i class="fas fa-sync fa-spin"></i> جاري مزامنة عملاء تيرا...</td></tr>
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
 * معالج قراءة الحقول لضمان التوافق مع بياناتك
 */
function extractData(d, key) {
    const fieldMap = {
        'phone': d.phone || d.Phone || '-',
        'email': d.email || d.Email || '-',
        'tag': d.tag || d.status || 'عادي',
        'date': d.createdAt || (d.CreatedAt?.toDate ? d.CreatedAt.toDate().toLocaleDateString('ar-SA') : '-')
    };
    return fieldMap[key] || d[key] || '-';
}

/**
 * جلب البيانات وعرضها
 */
async function loadAndRender() {
    const list = document.getElementById('customers-list-render');
    if (!list) return;

    try {
        // يتم الجلب من مجموعة 'customers' كما هو معرف في core
        const snapshot = await Core.fetchAllCustomers();
        list.innerHTML = '';
        let stats = { total: 0, vips: 0 };

        if (!snapshot || snapshot.empty) {
            list.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:40px; color:#94a3b8;">قاعدة البيانات فارغة حالياً.</td></tr>';
            return;
        }

        snapshot.forEach(docSnap => {
            const d = docSnap.data();
            const id = docSnap.id;
            
            stats.total++;
            const currentTag = extractData(d, 'tag');
            if (currentTag.toLowerCase() === 'vip') stats.vips++;

            list.innerHTML += `
                <tr class="cust-row" style="border-bottom:1px solid #f1f5f9; transition: background 0.3s;">
                    <td style="padding:15px; font-weight:700; color:#1e293b;">${d.name || '-'}</td>
                    <td dir="ltr" style="font-weight:600; color:#2563eb;">${extractData(d, 'phone')}</td>
                    <td>${d.city || 'حائل'} - ${d.district || '-'}</td>
                    <td style="font-size:0.85rem; color:#64748b;">${d.street || '-'} | مبنى: ${d.buildingNo || '-'}</td>
                    <td><span style="background:${currentTag === 'vip' ? '#fefce8' : '#eff6ff'}; color:${currentTag === 'vip' ? '#a16207' : '#2563eb'}; padding:4px 10px; border-radius:6px; font-weight:bold; font-size:0.75rem; text-transform:uppercase;">${currentTag}</span></td>
                    <td style="font-size:0.85rem;">${extractData(d, 'date').substring(0, 10)}</td>
                    <td>
                        <div style="display:flex; gap:8px; justify-content:center;">
                            <button onclick="handleEdit('${id}')" style="background:#f1f5f9; border:none; width:34px; height:34px; border-radius:8px; color:#2563eb; cursor:pointer;" title="تعديل"><i class="fas fa-edit"></i></button>
                            <button onclick="handleDelete('${id}')" style="background:#fff1f2; border:none; width:34px; height:34px; border-radius:8px; color:#dc2626; cursor:pointer;" title="حذف"><i class="fas fa-trash-alt"></i></button>
                        </div>
                    </td>
                </tr>`;
        });

        if (document.getElementById('stat-total')) document.getElementById('stat-total').innerText = stats.total;
        if (document.getElementById('stat-vips')) document.getElementById('stat-vips').innerText = stats.vips;

    } catch (error) {
        console.error("Fetch Error:", error);
        list.innerHTML = '<tr><td colspan="7" style="text-align:center; color:#dc2626; padding:20px;">خطأ في الاتصال بمجموعة customers.</td></tr>';
    }
}

/**
 * نظام البحث المباشر
 */
function setupSearch() {
    const input = document.getElementById('cust-filter');
    if (input) {
        input.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            document.querySelectorAll('.cust-row').forEach(row => {
                row.style.display = row.innerText.toLowerCase().includes(term) ? '' : 'none';
            });
        });
    }
}

// --- إدارة البيانات (إضافة/تعديل/حذف) ---

window.showAddCustomerModal = () => {
    editingId = null;
    const form = document.getElementById('customer-form');
    if (form) form.reset();
    
    document.getElementById('modal-title').innerText = "إضافة عميل جديد - تيرا";
    document.getElementById('customer-modal').style.display = 'flex';
};

window.handleEdit = async (id) => {
    editingId = id;
    try {
        const d = await Core.fetchCustomerById(id);
        if (!d) return;

        const setField = (fid, val) => { 
            const el = document.getElementById(fid);
            if (el) el.value = val || ''; 
        };

        // التعبئة بناءً على المسميات الدقيقة لبياناتك
        setField('cust-name', d.name);
        setField('cust-phone', d.phone || d.Phone);
        setField('cust-email', d.email || d.Email);
        setField('cust-city', d.city);
        setField('cust-district', d.district);
        setField('cust-street', d.street);
        setField('cust-building', d.buildingNo);
        setField('cust-additional', d.additionalNo);
        setField('cust-postal', d.postalCode);
        setField('cust-pobox', d.poBox);
        setField('cust-category', d.tag || d.status);

        document.getElementById('modal-title').innerText = "تعديل بيانات العميل";
        document.getElementById('customer-modal').style.display = 'flex';
    } catch (err) {
        console.error("Edit fetch error:", err);
    }
};

window.saveCustomerData = async () => {
    const getValById = (id) => document.getElementById(id)?.value || '';

    // تجهيز الكائن بنفس مفاتيح قاعدة بياناتك (Small Letters)
    const payload = {
        name: getValById('cust-name'),
        phone: getValById('cust-phone'),
        email: getValById('cust-email'),
        city: getValById('cust-city'),
        district: getValById('cust-district'),
        street: getValById('cust-street'),
        buildingNo: getValById('cust-building'),
        additionalNo: getValById('cust-additional'),
        postalCode: getValById('cust-postal'),
        poBox: getValById('cust-pobox'),
        tag: getValById('cust-category'),
        country: 'المملكة العربية السعودية',
        countryCode: '+966',
        updatedAt: new Date().toISOString()
    };

    try {
        if (editingId) {
            await Core.updateCustomer(editingId, payload);
        } else {
            payload.createdAt = new Date().toISOString();
            await Core.addCustomer(payload);
        }
        window.closeCustomerModal();
        await loadAndRender(); // تحديث فوري للجدول
    } catch (err) {
        alert("خطأ في الحفظ، يرجى التحقق من الاتصال.");
    }
};

window.handleDelete = async (id) => {
    if (confirm('تنبيه: سيتم حذف بيانات العميل نهائياً من مجموعة customers. هل أنت متأكد؟')) {
        await Core.removeCustomer(id);
        await loadAndRender();
    }
};

window.closeCustomerModal = () => {
    document.getElementById('customer-modal').style.display = 'none';
};
