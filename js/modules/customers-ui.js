/**
 * customers-ui.js - Fi-Khidmatik Full Stack UI
 * إصدار "الظهور الكامل": عرض كافة العناصر الـ 17 بشكل منفصل
 */

import * as Core from './customers-core.js';

let editingId = null;
let quill = null; 
const FALLBACK_AVATAR = 'https://ui-avatars.com/api/?name=C&background=random';

export async function initCustomersUI(container) {
    if (!container) return;

    container.innerHTML = `
        <div class="cust-ui-wrapper">
            <div class="toolbar-card">
                <div class="search-box">
                    <i class="fas fa-search"></i>
                    <input type="text" id="cust-filter" placeholder="بحث باسم العميل...">
                </div>
                <button class="btn-action edit" onclick="openAddCustomer()">
                    <i class="fas fa-user-plus"></i> إضافة عميل جديد
                </button>
            </div>

            <div class="table-container">
                <table class="tera-table">
                    <thead>
                        <tr>
                            <th>العميل</th>
                            <th>رقم الجوال</th>
                            <th>المدينة</th>
                            <th>التصنيف</th>
                            <th>الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody id="customers-table-body">
                        <tr><td colspan="5" style="text-align:center;">جاري جلب البيانات...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div id="customer-modal" class="modal" style="display:none;">
            <div class="modal-content large">
                <div class="modal-header">
                    <h3 id="modal-title">إدارة بيانات المجموعة: Customers</h3>
                    <button type="button" onclick="closeCustomerModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="customer-form" onsubmit="event.preventDefault(); saveCustomer();">
                        
                        <div class="form-card-section">
                            <h4><i class="fas fa-id-badge"></i> الهوية والتواريخ</h4>
                            <div class="form-grid">
                                <div class="input-group full-width" style="text-align:center;">
                                    <img id="cust-image-preview" src="${FALLBACK_AVATAR}" class="main-avatar-preview">
                                    <input type="text" id="cust-image" placeholder="رابط صورة العميل (Field 17)" oninput="document.getElementById('cust-image-preview').src=this.value">
                                </div>
                                <div class="input-group"><label>تاريخ الإنشاء (15)</label><input type="text" id="info-createdAt" readonly class="readonly-input"></div>
                                <div class="input-group"><label>آخر تحديث (16)</label><input type="text" id="info-updatedAt" readonly class="readonly-input"></div>
                            </div>
                        </div>

                        <div class="form-card-section">
                            <h4><i class="fas fa-phone"></i> بيانات الاتصال</h4>
                            <div class="form-grid">
                                <div class="input-group"><label>الاسم الكامل (1)</label><input type="text" id="cust-name" required placeholder="اسم العميل"></div>
                                <div class="input-group"><label>مفتاح الدولة (3)</label><input type="text" id="cust-countryCode" value="+966"></div>
                                <div class="input-group"><label>رقم الجوال (2)</label><input type="text" id="cust-phone" required placeholder="5xxxxxxx"></div>
                                <div class="input-group"><label>البريد الإلكتروني (4)</label><input type="email" id="cust-email" placeholder="example@mail.com"></div>
                            </div>
                        </div>

                        <div class="form-card-section">
                            <h4><i class="fas fa-map-marker-alt"></i> العنوان الوطني والموقع</h4>
                            <div class="form-grid">
                                <div class="input-group"><label>الدولة (5)</label><input type="text" id="cust-country" value="المملكة العربية السعودية"></div>
                                <div class="input-group"><label>المدينة (6)</label><input type="text" id="cust-city" placeholder="مثلاً: حائل"></div>
                                <div class="input-group"><label>الحي (7)</label><input type="text" id="cust-district"></div>
                                <div class="input-group"><label>اسم الشارع (8)</label><input type="text" id="cust-street"></div>
                                <div class="input-group"><label>رقم المبنى (9)</label><input type="text" id="cust-buildingNo"></div>
                                <div class="input-group"><label>الرقم الإضافي (10)</label><input type="text" id="cust-additionalNo"></div>
                                <div class="input-group"><label>الرمز البريدي (11)</label><input type="text" id="cust-postalCode"></div>
                                <div class="input-group"><label>صندوق البريد (12)</label><input type="text" id="cust-poBox"></div>
                            </div>
                        </div>

                        <div class="form-card-section">
                            <h4><i class="fas fa-tags"></i> التصنيف والملاحظات</h4>
                            <div class="form-grid">
                                <div class="input-group full-width">
                                    <label>تصنيف العميل (14)</label>
                                    <select id="cust-tag">
                                        <option value="regular">Regular (عادي)</option>
                                        <option value="vip">VIP (مميز)</option>
                                        <option value="company">Company (شركة)</option>
                                        <option value="individual">Individual (فرد)</option>
                                    </select>
                                </div>
                                <div class="input-group full-width">
                                    <label>الملاحظات (13) - محرر نصوص</label>
                                    <div id="editor-container" style="height: 150px; background: #fff; border: 1px solid #ddd; border-radius: 8px;"></div>
                                </div>
                            </div>
                        </div>

                        <div class="modal-footer">
                            <button type="submit" class="btn-save-full">حفظ كافة بيانات العميل</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;

    initQuillEditor();
    setupBridge();
    await renderCustomerTable();
}

/**
 * تهيئة Quill محرر النصوص للحقل (13)
 */
function initQuillEditor() {
    if (typeof Quill !== 'undefined' && !quill) {
        quill = new Quill('#editor-container', {
            theme: 'snow',
            modules: { toolbar: [['bold', 'italic', 'underline'], [{ 'list': 'ordered'}, { 'list': 'bullet' }], ['clean']] }
        });
    }
}

/**
 * عرض الجدول
 */
export async function renderCustomerTable() {
    const tbody = document.getElementById('customers-table-body');
    if (!tbody) return;

    try {
        const snapshot = await Core.fetchAllCustomers();
        tbody.innerHTML = '';

        snapshot.forEach(doc => {
            const d = doc.data();
            tbody.innerHTML += `
                <tr>
                    <td>
                        <div class="user-info-cell">
                            <img src="${d.image || FALLBACK_AVATAR}" class="avatar-table">
                            <span>${d.name || '---'}</span>
                        </div>
                    </td>
                    <td dir="ltr">${d.countryCode || ''} ${d.phone || ''}</td>
                    <td>${d.city || '---'}</td>
                    <td><span class="badge-${d.tag || 'regular'}">${d.tag || 'regular'}</span></td>
                    <td>
                        <button class="btn-icon-action" onclick="editCustomer('${doc.id}')"><i class="fas fa-edit"></i></button>
                        <button class="btn-icon-action delete" onclick="deleteCustomer('${doc.id}')"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>`;
        });
    } catch (e) { console.error("Error UI Render:", e); }
}

function setupBridge() {
    window.openAddCustomer = () => {
        editingId = null;
        document.getElementById('customer-form').reset();
        document.getElementById('info-createdAt').value = "يُحدد عند الحفظ";
        document.getElementById('info-updatedAt').value = "يُحدد عند الحفظ";
        document.getElementById('cust-image-preview').src = FALLBACK_AVATAR;
        if(quill) quill.setContents([]);
        document.getElementById('customer-modal').style.display = 'flex';
    };

    window.closeCustomerModal = () => document.getElementById('customer-modal').style.display = 'none';

    window.editCustomer = async (id) => {
        editingId = id;
        const d = await Core.fetchCustomerById(id);
        if (!d) return;

        // تعبئة كل حقل بشكل منفصل تماماً
        document.getElementById('cust-name').value = d.name || '';
        document.getElementById('cust-phone').value = d.phone || '';
        document.getElementById('cust-countryCode').value = d.countryCode || '+966';
        document.getElementById('cust-email').value = d.email || '';
        document.getElementById('cust-country').value = d.country || '';
        document.getElementById('cust-city').value = d.city || '';
        document.getElementById('cust-district').value = d.district || '';
        document.getElementById('cust-street').value = d.street || '';
        document.getElementById('cust-buildingNo').value = d.buildingNo || '';
        document.getElementById('cust-additionalNo').value = d.additionalNo || '';
        document.getElementById('cust-postalCode').value = d.postalCode || '';
        document.getElementById('cust-poBox').value = d.poBox || '';
        document.getElementById('cust-tag').value = d.tag || 'regular';
        document.getElementById('cust-image').value = d.image || '';
        document.getElementById('cust-image-preview').src = d.image || FALLBACK_AVATAR;

        // التواريخ (15, 16)
        document.getElementById('info-createdAt').value = d.createdAt?.toDate().toLocaleString('ar-SA') || '---';
        document.getElementById('info-updatedAt').value = d.updatedAt?.toDate().toLocaleString('ar-SA') || '---';

        if (quill) quill.root.innerHTML = d.notes || '';
        document.getElementById('customer-modal').style.display = 'flex';
    };

    window.saveCustomer = async () => {
        const data = {
            name: document.getElementById('cust-name').value,
            phone: document.getElementById('cust-phone').value,
            countryCode: document.getElementById('cust-countryCode').value,
            email: document.getElementById('cust-email').value,
            country: document.getElementById('cust-country').value,
            city: document.getElementById('cust-city').value,
            district: document.getElementById('cust-district').value,
            street: document.getElementById('cust-street').value,
            buildingNo: document.getElementById('cust-buildingNo').value,
            additionalNo: document.getElementById('cust-additionalNo').value,
            postalCode: document.getElementById('cust-postalCode').value,
            poBox: document.getElementById('cust-poBox').value,
            tag: document.getElementById('cust-tag').value,
            notes: quill ? quill.root.innerHTML : '',
            image: document.getElementById('cust-image').value || FALLBACK_AVATAR
        };

        try {
            editingId ? await Core.updateCustomer(editingId, data) : await Core.addCustomer(data);
            window.closeCustomerModal();
            await renderCustomerTable();
        } catch (e) { alert("خطأ في الحفظ: " + e.message); }
    };

    window.deleteCustomer = async (id) => {
        if(confirm("هل تود حذف هذا العميل؟")) { 
            await Core.deleteCustomer(id); 
            await renderCustomerTable(); 
        }
    };
}
