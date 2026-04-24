/**
 * نظام إدارة العملاء المتكامل - Tera Gateway v3.5
 * يشمل: الجدول الرئيسي، الفلترة، الإضافة والتعديل المطور
 */

import { db } from '../core/config.js';

// 1. قائمة الدول المدعومة
const countryList = [
    { name: "المملكة العربية السعودية", code: "+966", flag: "🇸🇦", len: 9 },
    { name: "الإمارات", code: "+971", flag: "🇦🇪", len: 9 },
    { name: "الكويت", code: "+965", flag: "🇰🇼", len: 8 }
];

/**
 * الوظيفة الأساسية المطلوبة لعمل النظام (Entry Point)
 */
export async function initCustomers(container) {
    if (!container) return;

    // رسم شريط الأدوات العلوي
    container.innerHTML = `
        <div class="customers-dashboard">
            <div class="toolbar-header">
                <div class="search-section">
                    <input type="text" id="cust-search" placeholder="بحث ذكي (اسم، جوال، حي)...">
                    <select id="filter-status"><option value="">كل الحالات</option><option value="active">مكتمل</option></select>
                </div>
                <button class="btn-add-main" id="btnAddCustomer">
                    <i class="fas fa-plus-circle"></i> إضافة عميل جديد
                </button>
            </div>
            <div id="customers-list-render"></div>
        </div>
    `;

    // تفعيل زر الإضافة
    document.getElementById('btnAddCustomer').onclick = () => openCustomerModal();

    // جلب البيانات من Firebase (مثال توضيحي للتشغيل)
    renderStaticTable(); 
}

/**
 * رسم الجدول في القائمة الرئيسية
 */
function renderStaticTable() {
    const listArea = document.getElementById('customers-list-render');
    const mockData = [
        { id: "1", name: "محمد صالح جميعان الشمري", phone: "+966597771565", city: "حائل", district: "النقرة", status: "active", createdAt: "2026/04/24" }
    ];

    listArea.innerHTML = `
        <div class="table-container">
            <table class="tera-table">
                <thead>
                    <tr>
                        <th>العميل</th>
                        <th>الجوال</th>
                        <th>العنوان الوطني</th>
                        <th>تاريخ الإضافة</th>
                        <th>الإجراءات</th>
                    </tr>
                </thead>
                <tbody>
                    ${mockData.map(c => `
                        <tr>
                            <td><div class="user-cell"><div class="avatar">${c.name[0]}</div><span>${c.name}</span></div></td>
                            <td dir="ltr">${c.phone}</td>
                            <td>${c.city}، ${c.district}</td>
                            <td>${c.createdAt}</td>
                            <td>
                                <button class="act-btn edit" onclick="window.editCustomer('${c.id}')"><i class="fas fa-edit"></i></button>
                                <button class="act-btn delete"><i class="fas fa-trash"></i></button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

/**
 * نافذة الإضافة والتعديل المطورة بالكامل
 */
export function openCustomerModal(customer = null) {
    const isEdit = !!customer;
    const now = new Date();
    const formattedDate = isEdit ? customer.createdAt : `${now.toLocaleDateString('ar-SA')} | ${now.toLocaleTimeString('ar-SA')}`;

    const modalHTML = `
    <div id="customer-modal" class="modal-overlay">
        <div class="modal-content">
            <div class="modal-header">
                <div class="header-info">
                    <i class="fas ${isEdit ? 'fa-user-edit' : 'fa-user-plus'}"></i>
                    <span>${isEdit ? 'تعديل بيانات العميل' : 'إضافة عميل جديد'}</span>
                </div>
                <button onclick="document.getElementById('customer-modal').remove()" class="close-btn">&times;</button>
            </div>
            
            <form id="customer-form" class="customer-form">
                <div class="top-row">
                    <div class="avatar-box">
                        <div class="avatar-preview" id="imagePreview" style="background-image: url('${customer?.photoURL || ''}');"></div>
                        <label for="imageUpload"><i class="fas fa-camera"></i></label>
                        <input type="file" id="imageUpload" hidden onchange="window.previewFile()">
                    </div>
                    <div class="reg-date">تاريخ الإدخال: <strong>${formattedDate}</strong></div>
                </div>

                <div class="form-section">
                    <h3><i class="fas fa-id-card"></i> البيانات الشخصية</h3>
                    <div class="grid-3">
                        <div class="field">
                            <label>الاسم الكامل</label>
                            <input type="text" id="c-name" value="${customer?.name || ''}" placeholder="الاسم كما في الهوية" required>
                        </div>
                        <div class="field">
                            <label>البريد الإلكتروني</label>
                            <input type="email" id="c-email" value="${customer?.email || ''}" placeholder="example@mail.com">
                        </div>
                        <div class="field">
                            <label>تصنيف العميل</label>
                            <select id="c-tag"><option>بدون تصنيف</option><option>عميل مميز</option></select>
                        </div>
                    </div>

                    <div class="grid-3">
                        <div class="field">
                            <label>دولة الاتصال</label>
                            <select id="c-country" onchange="window.updatePrefix()">
                                ${countryList.map(c => `<option value="${c.code}" data-len="${c.len}">${c.flag} ${c.name}</option>`).join('')}
                            </select>
                        </div>
                        <div class="field">
                            <label>رقم الجوال (5xxxxxxxx)</label>
                            <div class="prefix-input">
                                <span id="p-code">+966</span>
                                <input type="tel" id="c-phone" value="${customer?.phone || ''}" placeholder="5xxxxxxxx" required>
                            </div>
                        </div>
                        <div class="field">
                            <label>الهاتف الثابت (اختياري)</label>
                            <input type="tel" id="c-landline" value="${customer?.landline || ''}">
                        </div>
                    </div>
                </div>

                <div class="form-section">
                    <h3><i class="fas fa-map-marker-alt"></i> تفاصيل العنوان الوطني</h3>
                    <div class="grid-3">
                        <div class="field"><label>المدينة</label><input type="text" id="c-city" value="${customer?.city || ''}"></div>
                        <div class="field"><label>الحي</label><input type="text" id="c-district" value="${customer?.district || ''}"></div>
                        <div class="field"><label>اسم الشارع</label><input type="text" id="c-street" value="${customer?.street || ''}"></div>
                    </div>
                    <div class="grid-3">
                        <div class="field"><label>رقم المبنى</label><input type="text" id="c-build" value="${customer?.buildingNo || ''}"></div>
                        <div class="field"><label>الرقم الإضافي</label><input type="text" id="c-add" value="${customer?.additionalNo || ''}"></div>
                        <div class="field"><label>الرمز البريدي</label><input type="text" id="c-zip" value="${customer?.postalCode || ''}"></div>
                    </div>
                </div>

                <div class="form-section">
                    <h3><i class="fas fa-pen-nib"></i> ملاحظات الموظف</h3>
                    <div class="rich-editor">
                        <div class="editor-tools">
                            <button type="button" onclick="document.execCommand('bold')"><b>B</b></button>
                            <button type="button" onclick="document.execCommand('italic')"><i>I</i></button>
                        </div>
                        <div id="c-notes" class="editor-body" contenteditable="true">${customer?.notes || ''}</div>
                    </div>
                </div>

                <div class="modal-actions">
                    <button type="submit" class="btn-save-final">حفظ بيانات العميل</button>
                </div>
            </form>
        </div>
    </div>

    <style>
        /* التنسيقات مدمجة لضمان استقلالية الموديول */
        .modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.8); z-index: 9999; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(5px); }
        .modal-content { background: white; width: 900px; max-height: 95vh; overflow-y: auto; border-radius: 20px; direction: rtl; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); }
        .modal-header { display: flex; justify-content: space-between; padding: 20px 30px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; }
        .header-info { display: flex; align-items: center; gap: 10px; font-weight: bold; color: #1e293b; font-size: 1.2rem; }
        .close-btn { background: none; border: none; font-size: 2rem; color: #94a3b8; cursor: pointer; }
        
        .customer-form { padding: 30px; }
        .form-section { margin-bottom: 25px; }
        .form-section h3 { font-size: 0.95rem; color: #e67e22; margin-bottom: 20px; border-right: 4px solid #e67e22; padding-right: 12px; }
        
        .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-bottom: 15px; }
        .field { display: flex; flex-direction: column; gap: 8px; }
        .field label { font-size: 0.85rem; font-weight: 700; color: #475569; }
        .field input, .field select { padding: 12px; border: 1px solid #cbd5e1; border-radius: 10px; font-size: 0.9rem; transition: 0.3s; }
        .field input:focus { border-color: #e67e22; box-shadow: 0 0 0 4px rgba(230, 126, 34, 0.1); outline: none; }

        .prefix-input { display: flex; border: 1px solid #cbd5e1; border-radius: 10px; overflow: hidden; direction: ltr; }
        .prefix-input span { background: #f1f5f9; padding: 12px; font-weight: bold; border-right: 1px solid #cbd5e1; color: #64748b; }
        .prefix-input input { border: none; flex: 1; border-radius: 0; }

        .top-row { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 20px; border-bottom: 1px dashed #e2e8f0; padding-bottom: 20px; }
        .avatar-box { position: relative; width: 100px; height: 100px; }
        .avatar-preview { width: 100%; height: 100%; border-radius: 50%; background: #f1f5f9; background-size: cover; border: 4px solid #fff; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
        .avatar-box label { position: absolute; bottom: 0; right: 0; background: #e67e22; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; }

        .rich-editor { border: 1px solid #cbd5e1; border-radius: 10px; overflow: hidden; }
        .editor-tools { background: #f8fafc; padding: 10px; border-bottom: 1px solid #cbd5e1; display: flex; gap: 10px; }
        .editor-body { padding: 20px; min-height: 100px; outline: none; }
        
        .btn-save-final { width: 100%; padding: 18px; background: #16a34a; color: white; border: none; border-radius: 12px; font-size: 1.1rem; font-weight: bold; cursor: pointer; transition: 0.3s; }
        .btn-save-final:hover { background: #15803d; transform: translateY(-2px); }
    </style>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // ربط الدوال بالنافذة (Global context for simplified usage)
    window.updatePrefix = () => {
        document.getElementById('p-code').innerText = document.getElementById('c-country').value;
    };
    
    window.previewFile = () => {
        const file = document.getElementById('imageUpload').files[0];
        const reader = new FileReader();
        reader.onloadend = () => document.getElementById('imagePreview').style.backgroundImage = `url(${reader.result})`;
        if(file) reader.readAsDataURL(file);
    };
}
