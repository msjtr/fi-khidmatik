/**
 * customers-ui.js - Fi-Khidmatik UI Engine
 * الحقول المعتمدة: 17 حقلاً لمجموعة 'customers'
 */

import * as Core from './customers-core.js';

let editingId = null;
let quill = null; 
const FALLBACK_AVATAR = 'https://ui-avatars.com/api/?name=C&background=random';

export async function initCustomersUI(container) {
    if (!container) return;

    // بناء هيكل الواجهة
    container.innerHTML = `
        <div class="cust-ui-wrapper">
            <div class="toolbar-card">
                <div class="search-box">
                    <i class="fas fa-search"></i>
                    <input type="text" id="cust-filter" placeholder="بحث باسم العميل أو الرقم...">
                </div>
                <button class="btn-action edit" onclick="openAddCustomer()">
                    <i class="fas fa-user-plus"></i> إضافة عميل جديد
                </button>
            </div>

            <div class="table-container">
                <table class="tera-table">
                    <thead>
                        <tr>
                            <th>العميل (17)</th>
                            <th>رقم الجوال (2)</th>
                            <th>المدينة (6)</th>
                            <th>التصنيف (14)</th>
                            <th class="sticky-actions">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody id="customers-table-body">
                        <tr><td colspan="5" style="text-align:center;">جاري التحميل من قاعدة البيانات...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div id="customer-modal" class="modal" style="display:none;">
            <div class="modal-content large">
                <div class="modal-header">
                    <h3 id="modal-title">بيانات العميل</h3>
                    <button type="button" onclick="closeCustomerModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="customer-form" onsubmit="event.preventDefault(); saveCustomer();">
                        <div class="form-grid">
                            <div class="input-group full-width" style="text-align:center;">
                                <div class="avatar-upload">
                                    <img id="cust-image-preview" src="${FALLBACK_AVATAR}" class="preview-img-large">
                                    <input type="text" id="cust-image-url" placeholder="رابط صورة العميل (17)">
                                </div>
                            </div>

                            <div class="input-group"><label>الاسم الكامل (1)</label><input type="text" id="cust-name" required></div>
                            <div class="input-group"><label>مفتاح الدولة (3)</label><input type="text" id="cust-countryCode" value="+966"></div>
                            <div class="input-group"><label>رقم الجوال (2)</label><input type="text" id="cust-phone" required></div>
                            <div class="input-group"><label>البريد الإلكتروني (4)</label><input type="email" id="cust-email"></div>
                            
                            <div class="input-group"><label>الدولة (5)</label><input type="text" id="cust-country" value="المملكة العربية السعودية"></div>
                            <div class="input-group"><label>المدينة (6)</label><input type="text" id="cust-city"></div>
                            <div class="input-group"><label>الحي (7)</label><input type="text" id="cust-district"></div>
                            <div class="input-group"><label>اسم الشارع (8)</label><input type="text" id="cust-street"></div>
                            <div class="input-group"><label>رقم المبنى (9)</label><input type="text" id="cust-buildingNo"></div>
                            <div class="input-group"><label>الرقم الإضافي (10)</label><input type="text" id="cust-additionalNo"></div>
                            <div class="input-group"><label>الرمز البريدي (11)</label><input type="text" id="cust-postalCode"></div>
                            <div class="input-group"><label>صندوق البريد (12)</label><input type="text" id="cust-poBox"></div>

                            <div class="input-group">
                                <label>تصنيف العميل (14)</label>
                                <select id="cust-tag">
                                    <option value="regular">Regular</option>
                                    <option value="vip">VIP</option>
                                    <option value="company">Company</option>
                                    <option value="individual">Individual</option>
                                </select>
                            </div>

                            <div class="input-group full-width">
                                <label>الملاحظات (13)</label>
                                <div id="editor-container" style="height: 150px; background: white;"></div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="submit" class="btn-save">حفظ العميل</button>
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
 * تهيئة محرر النصوص (Rich Text)
 */
function initQuillEditor() {
    if (typeof Quill !== 'undefined') {
        quill = new Quill('#editor-container', {
            theme: 'snow',
            placeholder: 'اكتب ملاحظاتك هنا (13)...'
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
                        <div style="display:flex; align-items:center; gap:10px;">
                            <img src="${d.image || FALLBACK_AVATAR}" class="table-avatar" onerror="this.src='${FALLBACK_AVATAR}'">
                            <strong>${d.name || '---'}</strong>
                        </div>
                    </td>
                    <td dir="ltr">${d.countryCode || ''} ${d.phone || ''}</td>
                    <td>${d.city || '---'}</td>
                    <td><span class="tag-badge tag-${d.tag || 'regular'}">${d.tag || 'regular'}</span></td>
                    <td class="sticky-actions">
                        <button class="btn-action edit" onclick="editCustomer('${doc.id}')"><i class="fas fa-pen"></i></button>
                        <button class="btn-action delete" onclick="deleteCustomer('${doc.id}')"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>`;
        });
    } catch (e) {
        console.error("Error rendering table:", e);
    }
}

/**
 * ربط الأزرار بالدوال (Bridge)
 */
function setupBridge() {
    window.openAddCustomer = () => {
        editingId = null;
        document.getElementById('customer-form').reset();
        if(quill) quill.setContents([]);
        document.getElementById('cust-image-preview').src = FALLBACK_AVATAR;
        document.getElementById('modal-title').innerText = "➕ إضافة عميل جديد";
        document.getElementById('customer-modal').style.display = 'flex';
    };

    window.closeCustomerModal = () => document.getElementById('customer-modal').style.display = 'none';

    window.editCustomer = async (id) => {
        editingId = id;
        const d = await Core.fetchCustomerById(id);
        if (!d) return;

        // تعبئة الـ 17 حقل في النموذج
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
        document.getElementById('cust-image-url').value = d.image || '';
        document.getElementById('cust-image-preview').src = d.image || FALLBACK_AVATAR;

        if (quill) quill.root.innerHTML = d.notes || '';

        document.getElementById('modal-title').innerText = "✏️ تعديل بيانات العميل";
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
            image: document.getElementById('cust-image-url').value || FALLBACK_AVATAR
            // createdAt & updatedAt يتم معالجتها في Core بواسطة serverTimestamp
        };

        try {
            editingId ? await Core.updateCustomer(editingId, data) : await Core.addCustomer(data);
            window.closeCustomerModal();
            await renderCustomerTable();
        } catch (e) {
            alert("فشل الحفظ: " + e.message);
        }
    };

    window.deleteCustomer = async (id) => {
        if (confirm("هل أنت متأكد من حذف هذا العميل؟")) {
            await Core.deleteCustomer(id);
            await renderCustomerTable();
        }
    };
}
