/**
 * js/modules/customers-core.js
 * نظام إدارة العملاء المتكامل - Tera Gateway
 */

import { db } from '../core/config.js';

// 1. قائمة الدول العالمية
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
 * دالة التشغيل الأساسية (المفقودة التي سببت الخطأ)
 */
export async function initCustomers(container) {
    if (!container) return;

    container.innerHTML = `
        <div class="customers-dashboard">
            <div class="table-toolbar">
                <div class="toolbar-right">
                    <div class="search-box">
                        <i class="fas fa-search"></i>
                        <input type="text" id="customer-search" placeholder="ابحث باسم العميل أو رقم الجوال...">
                    </div>
                </div>
                <div class="toolbar-left">
                    <button class="btn-add" id="add-new-cust-btn">
                        <i class="fas fa-user-plus"></i> إضافة عميل جديد
                    </button>
                </div>
            </div>
            <div id="customers-list-container">
                <p style="text-align:center; padding:20px; color:#666;">جاري جلب قائمة العملاء...</p>
            </div>
        </div>
    `;

    document.getElementById('add-new-cust-btn').addEventListener('click', () => openCustomerModal());
    
    // ملاحظة: هنا يجب استدعاء دالة جلب البيانات من Firebase وعرضها في الجدول
}

/**
 * دالة فتح نافذة العميل (للإضافة أو التعديل)
 */
export function openCustomerModal(customer = null) {
    const isEdit = !!customer;
    const selectedCountry = isEdit ? (countryData.find(c => customer.phone.startsWith(c.code.replace('+', ''))) || countryData[0]) : countryData[0];

    const modalHTML = `
    <div id="customer-modal" class="modal-overlay">
        <div class="modal-content">
            <div class="modal-header">
                <h2><i class="fas ${isEdit ? 'fa-user-edit' : 'fa-user-plus'}"></i> ${isEdit ? 'تعديل بيانات العميل' : 'إضافة عميل جديد'}</h2>
                <button type="button" onclick="document.getElementById('customer-modal').remove()" class="close-btn">&times;</button>
            </div>
            
            <form id="customer-form" class="customer-form">
                <input type="hidden" id="cust-id" value="${customer?.id || ''}">

                <div class="form-section">
                    <h3><i class="fas fa-id-card"></i> البيانات الأساسية والاتصال</h3>
                    <div class="input-group full">
                        <label>الاسم الكامل للعميل</label>
                        <input type="text" id="cust-name" value="${customer?.name || ''}" placeholder="أدخل الاسم الكامل" required>
                    </div>
                    
                    <div class="row">
                        <div class="input-group">
                            <label>دولة الجوال</label>
                            <select id="cust-country-select">
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
                                <input type="tel" id="cust-landline" value="${customer?.landline || ''}" placeholder="رقم ثابت">
                            </div>
                        </div>
                        <div class="input-group">
                            <label>البريد الإلكتروني</label>
                            <input type="email" id="cust-email" value="${customer?.email || ''}" placeholder="mail@example.com">
                        </div>
                    </div>
                </div>

                <div class="form-section">
                    <h3><i class="fas fa-map-marked-alt"></i> تفاصيل العنوان الوطني</h3>
                    <div class="row">
                        <div class="input-group"><label>المدينة</label><input type="text" id="cust-city" value="${customer?.city || 'حائل'}" required></div>
                        <div class="input-group"><label>الحي</label><input type="text" id="cust-district" value="${customer?.district || ''}"></div>
                    </div>
                    <div class="row">
                        <div class="input-group"><label>اسم الشارع</label><input type="text" id="cust-street" value="${customer?.street || ''}"></div>
                        <div class="input-group"><label>رقم المبنى</label><input type="text" id="cust-building" value="${customer?.buildingNo || ''}" maxlength="5"></div>
                    </div>
                    <div class="row">
                        <div class="input-group"><label>الرقم الإضافي</label><input type="text" id="cust-additional" value="${customer?.additionalNo || ''}" maxlength="4"></div>
                        <div class="input-group"><label>صندوق البريد</label><input type="text" id="cust-pobox" value="${customer?.poBox || ''}"></div>
                        <div class="input-group"><label>الرمز البريدي</label><input type="text" id="cust-zip" value="${customer?.postalCode || ''}"></div>
                    </div>
                </div>

                <div class="form-section">
                    <h3><i class="fas fa-edit"></i> ملاحظات إدارية</h3>
                    <div class="input-group full">
                        <label>وصف حالة العميل</label>
                        <textarea id="cust-notes" rows="3">${customer?.notes || ''}</textarea>
                    </div>
                </div>

                <div class="modal-footer">
                    <button type="button" onclick="document.getElementById('customer-modal').remove()" class="btn-cancel">إلغاء</button>
                    <button type="submit" class="btn-save">${isEdit ? 'تحديث' : 'حفظ'}</button>
                </div>
            </form>
        </div>
    </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // ربط أحداث التغيير داخل الـ Modal
    const select = document.getElementById('cust-country-select');
    select.addEventListener('change', (e) => {
        document.getElementById('prefix-display').innerText = e.target.value;
        document.getElementById('landline-prefix').innerText = e.target.value;
    });

    const poBox = document.getElementById('cust-pobox');
    poBox.addEventListener('input', (e) => {
        document.getElementById('cust-zip').value = e.target.value;
    });
}
