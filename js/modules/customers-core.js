/**
 * js/modules/customers-core.js
 * نظام إدارة العملاء المطور - Tera Gateway
 */

import { db } from '../core/config.js';
// تأكد من استيراد الدوال اللازمة من Firebase إذا كنت تستخدم النسخة الحديثة
// import { collection, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// قائمة الدول المحدثة
const countryData = [
    { name: "السعودية", code: "+966", flag: "🇸🇦", phoneLen: 9 },
    { name: "الإمارات", code: "+971", flag: "🇦🇪", phoneLen: 9 },
    { name: "الكويت", code: "+965", flag: "🇰🇼", phoneLen: 8 },
    { name: "مصر", code: "+20", flag: "🇪🇬", phoneLen: 10 }
];

export async function initCustomers(container) {
    if (!container) return;

    // بناء الهيكل الرئيسي للموقع
    container.innerHTML = `
        <div class="customers-wrapper">
            <div class="header-section">
                <div class="search-bar">
                    <input type="text" id="customerSearch" placeholder="ابحث باسم العميل أو رقم الجوال...">
                    <i class="fas fa-search"></i>
                </div>
                <button class="btn-primary-tera" id="addCustomerBtn">
                    <i class="fas fa-user-plus"></i> إضافة عميل جديد
                </button>
            </div>

            <div class="table-container-tera">
                <table class="tera-table">
                    <thead>
                        <tr>
                            <th>العميل</th>
                            <th>الجوال</th>
                            <th>المنطقة</th>
                            <th>الرمز البريدي</th>
                            <th>الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody id="customersTableBody">
                        </tbody>
                </table>
            </div>
        </div>
    `;

    // ربط الأزرار
    document.getElementById('addCustomerBtn').onclick = () => openCustomerModal();
    loadCustomers(); // دالة جلب البيانات من Firebase
}

async function loadCustomers() {
    const tbody = document.getElementById('customersTableBody');
    // هنا نضع بيانات تجريبية مؤقتة للتأكد من الشكل، استبدلها بـ getDocs لاحقاً
    const customers = [
        { id: "1", name: "محمد صالح جميعان الشمري", phone: "+966597771565", city: "حائل", district: "النقرة", zip: "55421" },
        { id: "2", name: "سلطان خالد سعد العنزي", phone: "+966508205950", city: "الرياض", district: "حي النهضة", zip: "13222" }
    ];

    tbody.innerHTML = customers.map(c => `
        <tr>
            <td><strong>${c.name}</strong></td>
            <td dir="ltr">${c.phone}</td>
            <td>${c.city} - ${c.district || ''}</td>
            <td><span class="zip-badge">${c.zip || '-'}</span></td>
            <td>
                <div class="tera-actions">
                    <button class="t-btn t-edit" onclick="editCustomer('${c.id}')" title="تعديل"><i class="fas fa-edit"></i></button>
                    <button class="t-btn t-print" onclick="printCustomer('${c.id}')" title="طباعة"><i class="fas fa-print"></i></button>
                    <button class="t-btn t-delete" onclick="deleteCustomer('${c.id}')" title="حذف"><i class="fas fa-trash-alt"></i></button>
                </div>
            </td>
        </tr>
    `).join('');
}

// دالة فتح النافذة المنبثقة (المودال)
window.openCustomerModal = function(customer = null) {
    const isEdit = !!customer;
    const modalHTML = `
        <div id="customerModal" class="tera-modal-overlay">
            <div class="tera-modal">
                <div class="modal-header-tera">
                    <h3>${isEdit ? 'تعديل بيانات العميل' : 'إضافة عميل جديد'}</h3>
                    <button onclick="closeModalTera()">&times;</button>
                </div>
                <form id="customerForm" class="modal-body-tera">
                    <div class="input-row">
                        <label>الاسم الكامل</label>
                        <input type="text" id="m_name" value="${customer?.name || ''}" required>
                    </div>
                    <div class="input-row">
                        <div class="sub-col">
                            <label>الدولة</label>
                            <select id="m_country" onchange="updatePrefix()">
                                ${countryData.map(d => `<option value="${d.code}">${d.flag} ${d.name}</option>`).join('')}
                            </select>
                        </div>
                        <div class="sub-col">
                            <label>رقم الجوال</label>
                            <div class="prefix-input">
                                <span id="m_prefix">+966</span>
                                <input type="tel" id="m_phone" value="${customer?.phone || ''}" placeholder="5xxxxxxxx">
                            </div>
                        </div>
                    </div>
                    <div class="input-row">
                         <div class="sub-col">
                            <label>المدينة</label>
                            <input type="text" id="m_city" value="${customer?.city || 'حائل'}">
                        </div>
                        <div class="sub-col">
                            <label>الحي</label>
                            <input type="text" id="m_district" value="${customer?.district || ''}">
                        </div>
                    </div>
                    <div class="input-row">
                        <div class="sub-col">
                            <label>صندوق البريد</label>
                            <input type="text" id="m_pobox" oninput="document.getElementById('m_zip').value=this.value" value="${customer?.poBox || ''}">
                        </div>
                        <div class="sub-col">
                            <label>الرمز البريدي</label>
                            <input type="text" id="m_zip" value="${customer?.zip || ''}">
                        </div>
                    </div>
                    <div class="input-row">
                        <label>ملاحظات العميل</label>
                        <textarea id="m_notes" rows="3">${customer?.notes || ''}</textarea>
                    </div>
                    <div class="modal-footer-tera">
                        <button type="submit" class="save-btn">${isEdit ? 'تحديث' : 'حفظ'}</button>
                        <button type="button" class="cancel-btn" onclick="closeModalTera()">إلغاء</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
};

window.closeModalTera = () => document.getElementById('customerModal').remove();
window.updatePrefix = () => {
    document.getElementById('m_prefix').innerText = document.getElementById('m_country').value;
};

// وظائف الأزرار
window.editCustomer = (id) => { console.log("تعديل العميل:", id); openCustomerModal({id, name: "جاري التحميل..."}); };
window.deleteCustomer = (id) => { if(confirm("هل أنت متأكد من حذف هذا العميل؟")) console.log("تم الحذف"); };
window.printCustomer = (id) => { window.print(); };

// --- CSS الموحد لضمان ثبات الشكل ---
const style = document.createElement('style');
style.textContent = `
    .customers-wrapper { padding: 20px; direction: rtl; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
    .header-section { display: flex; justify-content: space-between; margin-bottom: 20px; gap: 15px; }
    .search-bar { position: relative; flex: 1; }
    .search-bar input { width: 100%; padding: 12px 40px 12px 15px; border-radius: 8px; border: 1px solid #ddd; }
    .search-bar i { position: absolute; right: 15px; top: 15px; color: #aaa; }
    
    .btn-primary-tera { background: #e67e22; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: bold; }
    
    .table-container-tera { background: white; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); overflow: hidden; }
    .tera-table { width: 100%; border-collapse: collapse; }
    .tera-table th { background: #f8fafc; padding: 15px; text-align: right; color: #64748b; border-bottom: 2px solid #eee; }
    .tera-table td { padding: 15px; border-bottom: 1px solid #f1f5f9; }
    
    .zip-badge { background: #f1f5f9; padding: 4px 8px; border-radius: 5px; font-family: monospace; }
    
    .tera-actions { display: flex; gap: 5px; justify-content: center; }
    .t-btn { border: none; width: 35px; height: 35px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.2s; }
    .t-edit { background: #ebf5ff; color: #2563eb; }
    .t-print { background: #f0fdf4; color: #16a34a; }
    .t-delete { background: #fef2f2; color: #dc2626; }
    .t-btn:hover { transform: scale(1.1); }

    /* المودال */
    .tera-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 9999; }
    .tera-modal { background: white; width: 90%; max-width: 600px; border-radius: 15px; overflow: hidden; animation: slideUp 0.3s; }
    .modal-header-tera { background: #f8fafc; padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; }
    .modal-body-tera { padding: 20px; }
    .input-row { margin-bottom: 15px; display: flex; flex-direction: column; }
    .sub-col { flex: 1; display: flex; flex-direction: column; margin-left: 10px; }
    .input-row label { font-weight: bold; margin-bottom: 5px; font-size: 0.9rem; }
    .input-row input, .input-row select, .input-row textarea { padding: 10px; border: 1px solid #ddd; border-radius: 8px; }
    
    .prefix-input { display: flex; direction: ltr; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; }
    #m_prefix { background: #eee; padding: 10px; font-weight: bold; }
    .prefix-input input { border: none; flex: 1; }

    .modal-footer-tera { display: flex; gap: 10px; margin-top: 20px; }
    .save-btn { background: #16a34a; color: white; border: none; padding: 10px 25px; border-radius: 8px; cursor: pointer; flex: 2; }
    .cancel-btn { background: #eee; border: none; padding: 10px 25px; border-radius: 8px; cursor: pointer; flex: 1; }

    @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
`;
document.head.appendChild(style);
