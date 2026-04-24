/**
 * js/modules/customers-core.js
 * نظام إدارة العملاء الشامل - Tera Gateway
 * المعالجة: جلب كامل البيانات + فصل مفتاح الدولة + محرر ملاحظات متقدم
 */

import { db } from '../core/config.js';
import { collection, addDoc, updateDoc, doc, deleteDoc, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// قائمة مفاتيح الدول مع البحث
const countries = [
    { name: "المملكة العربية السعودية", code: "966", flag: "🇸🇦", len: 9 },
    { name: "الإمارات", code: "971", flag: "🇦🇪", len: 9 },
    { name: "الكويت", code: "965", flag: "🇰🇼", len: 8 },
    { name: "عمان", code: "968", flag: "🇴🇲", len: 8 },
    { name: "قطر", code: "974", flag: "🇶🇦", len: 8 },
    { name: "مصر", code: "20", flag: "🇪🇬", len: 10 }
];

/**
 * فتح نافذة العميل (إضافة أو تعديل) مع جلب كافة الحقول
 */
export async function openCustomerModal(customerData = null) {
    const isEdit = !!customerData;
    
    const modalHTML = `
    <div id="customer-modal" class="modal-overlay">
        <div class="modal-content">
            <div class="modal-header">
                <h2><i class="fas ${isEdit ? 'fa-user-edit' : 'fa-user-plus'}"></i> ${isEdit ? 'تعديل بيانات العميل' : 'إضافة عميل جديد'}</h2>
                <button type="button" onclick="this.closest('#customer-modal').remove()" class="close-btn">&times;</button>
            </div>
            
            <form id="customer-form">
                <div class="form-body">
                    <div class="section-box">
                        <h3 class="section-h"><i class="fas fa-id-badge"></i> البيانات الأساسية</h3>
                        <div class="f-row">
                            <div class="i-group full">
                                <label>اسم العميل الكامل</label>
                                <input type="text" id="cust-name" value="${customerData?.name || ''}" placeholder="أدخل الاسم الرباعي" required>
                            </div>
                        </div>
                        
                        <div class="f-row">
                            <div class="i-group">
                                <label>مفتاح الدولة</label>
                                <select id="cust-country-code">
                                    ${countries.map(c => `<option value="${c.code}" ${customerData?.countryCode === c.code ? 'selected' : ''}>${c.flag} +${c.code}</option>`).join('')}
                                </select>
                            </div>
                            <div class="i-group flex-2">
                                <label>رقم الجوال (يبدأ بـ 5)</label>
                                <input type="tel" id="cust-phone" value="${customerData?.phone || ''}" placeholder="5xxxxxxxx" required maxlength="9">
                            </div>
                            <div class="i-group flex-2">
                                <label>البريد الإلكتروني</label>
                                <input type="email" id="cust-email" value="${customerData?.email || ''}" placeholder="example@mail.com">
                            </div>
                        </div>
                    </div>

                    <div class="section-box">
                        <h3 class="section-h"><i class="fas fa-map-marked-alt"></i> العنوان الوطني والتوصيل</h3>
                        <div class="f-row">
                            <div class="i-group">
                                <label>الدولة</label>
                                <input type="text" id="cust-country-name" value="${customerData?.countryName || 'المملكة العربية السعودية'}">
                            </div>
                            <div class="i-group">
                                <label>المدينة</label>
                                <input type="text" id="cust-city" value="${customerData?.city || ''}" placeholder="مثال: حائل">
                            </div>
                            <div class="i-group">
                                <label>الحي</label>
                                <input type="text" id="cust-district" value="${customerData?.district || ''}" placeholder="مثال: النقرة">
                            </div>
                        </div>
                        
                        <div class="f-row">
                            <div class="i-group flex-2">
                                <label>اسم الشارع</label>
                                <input type="text" id="cust-street" value="${customerData?.street || ''}" placeholder="مثال: شارع سعد المشاط">
                            </div>
                            <div class="i-group">
                                <label>رقم المبنى</label>
                                <input type="text" id="cust-building" value="${customerData?.buildingNo || ''}" maxlength="5" placeholder="88043">
                            </div>
                            <div class="i-group">
                                <label>الرقم الإضافي</label>
                                <input type="text" id="cust-additional" value="${customerData?.additionalNo || ''}" maxlength="4" placeholder="7714">
                            </div>
                        </div>

                        <div class="f-row">
                            <div class="i-group">
                                <label>صندوق البريد (اختياري)</label>
                                <input type="text" id="cust-pobox" value="${customerData?.poBox || ''}" oninput="syncZip(this.value)">
                            </div>
                            <div class="i-group">
                                <label>الرمز البريدي</label>
                                <input type="text" id="cust-zip" value="${customerData?.postalCode || ''}" placeholder="يُسحب تلقائياً">
                            </div>
                        </div>
                    </div>

                    <div class="section-box">
                        <h3 class="section-h"><i class="fas fa-sticky-note"></i> ملاحظات إضافية</h3>
                        <div class="rich-editor-wrapper">
                            <div class="editor-tools">
                                <button type="button" onclick="document.execCommand('bold', false, null)" title="عريض"><i class="fas fa-bold"></i></button>
                                <button type="button" onclick="document.execCommand('italic', false, null)" title="مائل"><i class="fas fa-italic"></i></button>
                                <button type="button" onclick="document.execCommand('insertUnorderedList', false, null)" title="قائمة"><i class="fas fa-list-ul"></i></button>
                                <button type="button" onclick="document.execCommand('foreColor', false, '#e67e22')" title="تلوين"><i class="fas fa-tint"></i></button>
                            </div>
                            <div id="cust-notes" class="editor-area" contenteditable="true">
                                ${customerData?.notes || 'أدخل ملاحظاتك هنا...'}
                            </div>
                        </div>
                    </div>
                </div>

                <div class="modal-footer">
                    <button type="button" onclick="this.closest('#customer-modal').remove()" class="btn-secondary">إلغاء</button>
                    <button type="submit" class="btn-primary">${isEdit ? 'تحديث البيانات' : 'حفظ العميل الجديد'}</button>
                </div>
            </form>
        </div>
    </div>

    <style>
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 9999; direction: rtl; backdrop-filter: blur(5px); }
        .modal-content { background: #fff; width: 95%; max-width: 850px; border-radius: 15px; max-height: 90vh; overflow: hidden; display: flex; flex-direction: column; box-shadow: 0 25px 50px rgba(0,0,0,0.3); }
        .modal-header { padding: 20px 25px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; background: #fcfcfc; }
        .modal-header h2 { margin: 0; font-size: 1.3rem; color: #2c3e50; }
        .form-body { padding: 25px; overflow-y: auto; flex: 1; }
        .section-box { background: #f8fafc; padding: 20px; border-radius: 10px; margin-bottom: 20px; border: 1px solid #edf2f7; }
        .section-h { font-size: 1rem; color: #e67e22; margin-bottom: 15px; border-right: 4px solid #e67e22; padding-right: 10px; }
        
        .f-row { display: flex; gap: 15px; margin-bottom: 15px; }
        .i-group { display: flex; flex-direction: column; flex: 1; }
        .i-group.full { width: 100%; }
        .i-group label { font-size: 0.85rem; font-weight: bold; color: #4a5568; margin-bottom: 6px; }
        .i-group input, .i-group select { padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 0.95rem; }
        
        /* محرر الملاحظات المتقدم */
        .rich-editor-wrapper { border: 1px solid #cbd5e1; border-radius: 8px; background: #fff; overflow: hidden; }
        .editor-tools { background: #edf2f7; padding: 8px; border-bottom: 1px solid #cbd5e1; display: flex; gap: 10px; }
        .editor-tools button { background: white; border: 1px solid #cbd5e1; padding: 5px 12px; border-radius: 4px; cursor: pointer; color: #4a5568; }
        .editor-tools button:hover { background: #e67e22; color: white; border-color: #e67e22; }
        .editor-area { min-height: 120px; padding: 15px; outline: none; line-height: 1.6; }

        .modal-footer { padding: 20px 25px; border-top: 1px solid #eee; background: #fcfcfc; display: flex; justify-content: flex-end; gap: 12px; }
        .btn-primary { background: #e67e22; color: white; border: none; padding: 12px 35px; border-radius: 8px; font-weight: bold; cursor: pointer; transition: 0.3s; }
        .btn-secondary { background: #e2e8f0; color: #4a5568; border: none; padding: 12px 35px; border-radius: 8px; cursor: pointer; }
        .btn-primary:hover { background: #d35400; transform: translateY(-2px); }

        @media (max-width: 768px) { .f-row { flex-direction: column; } }
    </style>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // وظيفة مزامنة الرمز البريدي
    window.syncZip = (val) => { document.getElementById('cust-zip').value = val; };

    // التعامل مع الحفظ والتحديث
    const form = document.getElementById('customer-form');
    form.onsubmit = async (e) => {
        e.preventDefault();
        
        const customerObj = {
            name: document.getElementById('cust-name').value,
            countryCode: document.getElementById('cust-country-code').value,
            phone: document.getElementById('cust-phone').value,
            email: document.getElementById('cust-email').value,
            countryName: document.getElementById('cust-country-name').value,
            city: document.getElementById('cust-city').value,
            district: document.getElementById('cust-district').value,
            street: document.getElementById('cust-street').value,
            buildingNo: document.getElementById('cust-building').value,
            additionalNo: document.getElementById('cust-additional').value,
            poBox: document.getElementById('cust-pobox').value,
            postalCode: document.getElementById('cust-zip').value,
            notes: document.getElementById('cust-notes').innerHTML,
            lastUpdate: new Date().toISOString()
        };

        try {
            if (isEdit) {
                await updateDoc(doc(db, "customers", customerData.id), customerObj);
                alert("✅ تم تحديث بيانات العميل بنجاح");
            } else {
                customerObj.createdAt = new Date().toISOString();
                await addDoc(collection(db, "customers"), customerObj);
                alert("✅ تم إضافة العميل الجديد بنجاح");
            }
            document.getElementById('customer-modal').remove();
            if (window.refreshCustomerTable) window.refreshCustomerTable(); // استدعاء تحديث الجدول إذا وجد
        } catch (err) {
            console.error(err);
            alert("❌ خطأ في الاتصال بقاعدة البيانات");
        }
    };
}
