/**
 * js/modules/customers-core.js
 * نظام إدارة العملاء الشامل - Tera Gateway v4.0
 * الميزات: إدارة دولية، محرر نصوص متقدم، إرفاق صور، وتفاصيل العنوان الوطني الكاملة
 */

import { db } from '../core/config.js';

// 1. قائمة الدول مع مفاتيح الاتصال
const countryData = [
    { name: "المملكة العربية السعودية", code: "+966", flag: "🇸🇦", phoneLen: 9 },
    { name: "الإمارات العربية المتحدة", code: "+971", flag: "🇦🇪", phoneLen: 9 },
    { name: "الكويت", code: "+965", flag: "🇰🇼", phoneLen: 8 },
    { name: "قطر", code: "+974", flag: "🇶🇦", phoneLen: 8 },
    { name: "سلطنة عمان", code: "+968", flag: "🇴🇲", phoneLen: 8 },
    { name: "البحرين", code: "+973", flag: "🇧🇭", phoneLen: 8 },
    { name: "مصر", code: "+20", flag: "🇪🇬", phoneLen: 10 },
    { name: "الأردن", code: "+962", flag: "🇯🇴", phoneLen: 9 }
];

/**
 * الوظيفة الأساسية لتشغيل الموديول في لوحة التحكم
 */
export async function initCustomers(container) {
    if (!container) return;
    
    container.innerHTML = `
        <div class="customers-dashboard">
            <div class="toolbar-header">
                <div class="search-section">
                    <input type="text" id="cust-search" placeholder="بحث ذكي عن عميل...">
                </div>
                <button class="btn-add-main" onclick="import('./customers-core.js').then(m => m.openCustomerModal())">
                    <i class="fas fa-plus-circle"></i> إضافة عميل جديد
                </button>
            </div>
            <div id="customers-list-area"></div>
        </div>
    `;
    // هنا يمكن إضافة كود جلب البيانات الفعلي من Firestore
}

/**
 * نافذة العميل المطورة (إضافة / تعديل)
 */
export function openCustomerModal(customer = null) {
    const isEdit = !!customer;
    const now = new Date();
    const formattedDate = isEdit ? customer.createdAt : `${now.toLocaleDateString('ar-SA')} - ${now.toLocaleTimeString('ar-SA')}`;
    const selectedCountry = isEdit ? (countryData.find(c => customer.phone.startsWith(c.code.replace('+', ''))) || countryData[0]) : countryData[0];

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
                <input type="hidden" id="cust-id" value="${customer?.id || ''}">

                <div class="profile-header">
                    <div class="avatar-wrapper">
                        <div class="avatar-preview" id="imagePreview" style="background-image: url('${customer?.photoURL || 'https://via.placeholder.com/100'}');"></div>
                        <label for="imageUpload" class="cam-btn"><i class="fas fa-camera"></i></label>
                        <input type="file" id="imageUpload" hidden accept="image/*" onchange="window.previewAvatar()">
                    </div>
                    <div class="meta-info">
                        <label>تاريخ ووقت الإضافة</label>
                        <div class="time-stamp">${formattedDate}</div>
                    </div>
                </div>

                <div class="form-section">
                    <h3><i class="fas fa-id-card"></i> البيانات الأساسية</h3>
                    <div class="row">
                        <div class="input-group full">
                            <label>الاسم الكامل للعميل</label>
                            <input type="text" id="cust-name" value="${customer?.name || ''}" placeholder="الاسم الرباعي كما في الهوية" required>
                        </div>
                    </div>
                    
                    <div class="row">
                        <div class="input-group">
                            <label>دولة الجوال</label>
                            <select id="cust-country-select" onchange="window.updateCountrySync()">
                                ${countryData.map(c => `<option value="${c.code}" ${selectedCountry.code === c.code ? 'selected' : ''}>${c.flag} ${c.name} (${c.code})</option>`).join('')}
                            </select>
                        </div>
                        <div class="input-group flex-2">
                            <label>رقم الجوال (بدون الصفر)</label>
                            <div class="phone-wrapper">
                                <span id="prefix-display">${selectedCountry.code}</span>
                                <input type="tel" id="cust-phone" value="${isEdit ? customer.phone.replace(selectedCountry.code.replace('+', ''), '') : ''}" placeholder="5xxxxxxxx" required>
                            </div>
                        </div>
                    </div>

                    <div class="row">
                        <div class="input-group">
                            <label>الهاتف الثابت (اختياري)</label>
                            <div class="phone-wrapper">
                                <span id="landline-prefix">${selectedCountry.code}</span>
                                <input type="tel" id="cust-landline" value="${customer?.landline || ''}" placeholder="رقم الأرضي">
                            </div>
                        </div>
                        <div class="input-group">
                            <label>البريد الإلكتروني</label>
                            <input type="email" id="cust-email" value="${customer?.email || ''}" placeholder="example@domain.com">
                        </div>
                    </div>
                </div>

                <div class="form-section">
                    <h3><i class="fas fa-map-marked-alt"></i> تفاصيل العنوان الوطني</h3>
                    <div class="row">
                        <div class="input-group">
                            <label>المدينة</label>
                            <input type="text" id="cust-city" value="${customer?.city || 'حائل'}" required>
                        </div>
                        <div class="input-group">
                            <label>الحي</label>
                            <input type="text" id="cust-district" value="${customer?.district || ''}" placeholder="مثال: النقرة">
                        </div>
                        <div class="input-group">
                            <label>اسم الشارع</label>
                            <input type="text" id="cust-street" value="${customer?.street || ''}" placeholder="الشارع الرئيسي">
                        </div>
                    </div>
                    
                    <div class="row">
                        <div class="input-group">
                            <label>رقم المبنى</label>
                            <input type="text" id="cust-building" value="${customer?.buildingNo || ''}" maxlength="5" placeholder="8841">
                        </div>
                        <div class="input-group">
                            <label>الرقم الإضافي</label>
                            <input type="text" id="cust-additional" value="${customer?.additionalNo || ''}" maxlength="4" placeholder="2210">
                        </div>
                        <div class="input-group">
                            <label>صندوق البريد</label>
                            <input type="text" id="cust-pobox" oninput="document.getElementById('cust-zip').value = this.value" value="${customer?.poBox || ''}">
                        </div>
                        <div class="input-group">
                            <label>الرمز البريدي</label>
                            <input type="text" id="cust-zip" value="${customer?.postalCode || customer?.poBox || ''}">
                        </div>
                    </div>
                </div>

                <div class="form-section">
                    <h3><i class="fas fa-pen-fancy"></i> ملاحظات الموظف وإرفاق الصور</h3>
                    <div class="rich-editor">
                        <div class="editor-toolbar">
                            <button type="button" onclick="document.execCommand('bold')"><b>B</b></button>
                            <button type="button" onclick="document.execCommand('italic')"><i>I</i></button>
                            <button type="button" onclick="document.getElementById('noteImg').click()"><i class="fas fa-image"></i> إرفاق صورة</button>
                        </div>
                        <div id="cust-notes" class="editor-body" contenteditable="true">${customer?.notes || 'اكتب ملاحظاتك هنا...'}</div>
                        <input type="file" id="noteImg" hidden accept="image/*" onchange="window.insertImgToNote()">
                    </div>
                </div>

                <div class="modal-footer">
                    <button type="button" onclick="document.getElementById('customer-modal').remove()" class="btn-cancel">إلغاء</button>
                    <button type="submit" class="btn-save">${isEdit ? 'تحديث كافة البيانات' : 'حفظ العميل والبيانات'}</button>
                </div>
            </form>
        </div>
    </div>

    <style>
        .modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.85); display: flex; align-items: center; justify-content: center; z-index: 9999; padding: 20px; backdrop-filter: blur(5px); }
        .modal-content { background: #fff; width: 100%; max-width: 850px; border-radius: 20px; max-height: 95vh; overflow-y: auto; direction: rtl; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); }
        .modal-header { padding: 20px 30px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; background: #f8fafc; }
        .header-info { display: flex; align-items: center; gap: 12px; font-weight: bold; color: #1e293b; font-size: 1.2rem; }
        .close-btn { background: none; border: none; font-size: 2rem; cursor: pointer; color: #94a3b8; }
        
        .customer-form { padding: 25px 30px; }
        .profile-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; background: #fef5e8; padding: 20px; border-radius: 15px; border: 1px dashed #e67e22; }
        .avatar-wrapper { position: relative; width: 90px; height: 90px; }
        .avatar-preview { width: 100%; height: 100%; border-radius: 50%; background-size: cover; border: 4px solid #fff; box-shadow: 0 5px 15px rgba(0,0,0,0.1); }
        .cam-btn { position: absolute; bottom: 0; right: 0; background: #e67e22; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; border: 3px solid #fff; }
        
        .form-section { margin-top: 25px; }
        .form-section h3 { font-size: 1rem; color: #e67e22; margin-bottom: 20px; border-right: 4px solid #e67e22; padding-right: 12px; }
        
        .row { display: flex; gap: 20px; margin-bottom: 15px; }
        .input-group { display: flex; flex-direction: column; flex: 1; gap: 8px; }
        .input-group label { font-size: 0.85rem; font-weight: bold; color: #475569; }
        .input-group input, .input-group select { padding: 12px; border: 1px solid #cbd5e1; border-radius: 10px; font-size: 0.95rem; outline: none; }
        .input-group input:focus { border-color: #e67e22; box-shadow: 0 0 0 3px rgba(230,126,34,0.1); }

        .phone-wrapper { display: flex; direction: ltr; border: 1px solid #cbd5e1; border-radius: 10px; overflow: hidden; background: #fff; }
        .phone-wrapper span { padding: 12px; background: #f1f5f9; color: #64748b; font-weight: bold; border-right: 1px solid #cbd5e1; min-width: 60px; text-align: center; }
        .phone-wrapper input { border: none; width: 100%; border-radius: 0; }

        .rich-editor { border: 1px solid #cbd5e1; border-radius: 10px; overflow: hidden; margin-top: 10px; }
        .editor-toolbar { background: #f8fafc; padding: 10px; border-bottom: 1px solid #cbd5e1; display: flex; gap: 10px; }
        .editor-toolbar button { background: #fff; border: 1px solid #cbd5e1; padding: 5px 12px; border-radius: 5px; cursor: pointer; }
        .editor-body { padding: 15px; min-height: 120px; outline: none; background: #fff; }

        .modal-footer { display: flex; gap: 15px; margin-top: 30px; }
        .btn-save { background: #16a34a; color: white; border: none; padding: 15px; border-radius: 10px; font-weight: bold; flex: 2; cursor: pointer; font-size: 1.1rem; }
        .btn-cancel { background: #f1f5f9; color: #475569; border: none; padding: 15px; border-radius: 10px; flex: 1; cursor: pointer; }
    </style>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // الدوال المساعدة للنافذة
    window.updateCountrySync = () => {
        const val = document.getElementById('cust-country-select').value;
        document.getElementById('prefix-display').innerText = val;
        document.getElementById('landline-prefix').innerText = val;
    };

    window.previewAvatar = () => {
        const file = document.getElementById('imageUpload').files[0];
        const reader = new FileReader();
        reader.onload = (e) => document.getElementById('imagePreview').style.backgroundImage = `url(${e.target.result})`;
        if (file) reader.readAsDataURL(file);
    };

    window.insertImgToNote = () => {
        const file = document.getElementById('noteImg').files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = `<img src="${e.target.result}" style="max-width:250px; border-radius:10px; margin:10px; border: 1px solid #ddd;">`;
            document.getElementById('cust-notes').innerHTML += img;
        };
        if (file) reader.readAsDataURL(file);
    };
}
