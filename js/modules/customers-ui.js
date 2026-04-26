/**
 * customers-ui.js - Fi-Khidmatik UI Engine
 * إدارة شاملة لـ 17 حقل لمجموعة Customers
 */

import * as Core from './customers-core.js';

let editingId = null;
let quill = null;
const FALLBACK_AVATAR = 'https://ui-avatars.com/api/?name=C&background=random';

export async function initCustomersUI(container) {
    if (!container) return;

    // حقن محتوى الواجهة (Form + Table) داخل الحاوية
    container.innerHTML = `
        <div class="cust-ui-wrapper">
            <div class="toolbar-card">
                <div class="search-box-wrapper">
                    <i class="fas fa-search"></i>
                    <input type="text" id="cust-search-input" placeholder="بحث باسم العميل أو المدينة...">
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
                        <tr><td colspan="5" style="text-align:center;">جاري التحميل...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div id="customer-modal" class="modal" style="display:none;">
            <div class="modal-content large">
                <div class="modal-header">
                    <h3>بيانات المجموعة: Customers</h3>
                    <button type="button" onclick="closeCustomerModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="customer-form" onsubmit="event.preventDefault(); saveCustomer();">
                        
                        <div class="form-card-section">
                            <h4><i class="fas fa-camera"></i> الصورة والتواريخ الآلية</h4>
                            <div class="form-grid">
                                <div class="input-group full-width" style="text-align:center;">
                                    <img id="cust-image-preview" src="${FALLBACK_AVATAR}" class="main-avatar-preview">
                                    <input type="text" id="cust-image" placeholder="رابط صورة العميل (Field 17)" oninput="document.getElementById('cust-image-preview').src=this.value || '${FALLBACK_AVATAR}'">
                                </div>
                                <div class="input-group"><label>تاريخ الإنشاء (15)</label><input type="text" id="info-createdAt" readonly class="readonly-input"></div>
                                <div class="input-group"><label>آخر تحديث (16)</label><input type="text" id="info-updatedAt" readonly class="readonly-input"></div>
                            </div>
                        </div>

                        <div class="form-card-section">
                            <h4><i class="fas fa-user"></i> البيانات الأساسية</h4>
                            <div class="form-grid">
                                <div class="input-group"><label>اسم العميل الكامل (1)</label><input type="text" id="cust-name" required></div>
                                <div class="input-group"><label>رقم الجوال (2)</label><input type="text" id="cust-phone" required></div>
                                <div class="input-group"><label>مفتاح الدولة (3)</label><input type="text" id="cust-countryCode" value="+966"></div>
                                <div class="input-group"><label>البريد الإلكتروني (4)</label><input type="email" id="cust-email"></div>
                            </div>
                        </div>

                        <div class="form-card-section">
                            <h4><i class="fas fa-map-marked-alt"></i> العنوان الوطني التفصيلي</h4>
                            <div class="form-grid">
                                <div class="input-group"><label>الدولة (5)</label><input type="text" id="cust-country" value="المملكة العربية السعودية"></div>
                                <div class="input-group"><label>المدينة (6)</label><input type="text" id="cust-city"></div>
                                <div class="input-group"><label>الحي (7)</label><input type="text" id="cust-district"></div>
                                <div class="input-group"><label>اسم الشارع (8)</label><input type="text" id="cust-street"></div>
                                <div class="input-group"><label>رقم المبنى (9)</label><input type="text" id="cust-buildingNo"></div>
                                <div class="input-group"><label>الرقم الإضافي (10)</label><input type="text" id="cust-additionalNo"></div>
                                <div class="input-group"><label>الرمز البريدي (11)</label><input type="text" id="cust-postalCode"></div>
                                <div class="input-group"><label>صندوق البريد (12)</label><input type="text" id="cust-poBox"></div>
                            </div>
                        </div>

                        <div class="form-card-section">
                            <h4><i class="fas fa-info-circle"></i> إضافات</h4>
                            <div class="form-grid">
                                <div class="input-group full-width">
                                    <label>تصنيف العميل (14)</label>
                                    <select id="cust-tag">
                                        <option value="regular">Regular</option>
                                        <option value="vip">VIP</option>
                                        <option value="company">Company</option>
                                        <option value="individual">Individual</option>
                                    </select>
                                </div>
                                <div class="input-group full-width">
                                    <label>الملاحظات المنسقة (13)</label>
                                    <div id="editor-container" style="height: 120px; background:white;"></div>
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

function initQuillEditor() {
    if (typeof Quill !== 'undefined' && !quill) {
        quill = new Quill('#editor-container', {
            theme: 'snow',
            modules: { toolbar: [['bold', 'italic'], ['link', 'blockquote'], [{ list: 'ordered' }, { list: 'bullet' }]] }
        });
    }
}

export async function renderCustomerTable() {
    const tbody = document.getElementById('customers-table-body');
    const countDisplay = document.getElementById('total-customers-count');
    if (!tbody) return;

    const snap = await Core.fetchAllCustomers();
    tbody.innerHTML = '';
    
    if (countDisplay) countDisplay.innerText = snap.size;

    snap.forEach(doc => {
        const d = doc.data();
        tbody.innerHTML += `
            <tr class="fade-in-row">
                <td>
                    <div style="display:flex; align-items:center; gap:10px;">
                        <img src="${d.image || FALLBACK_AVATAR}" style="width:35px; height:35px; border-radius:50%; object-fit:cover;">
                        <strong>${d.name}</strong>
                    </div>
                </td>
                <td dir="ltr">${d.countryCode} ${d.phone}</td>
                <td>${d.city || '---'}</td>
                <td><span class="tag-badge tag-${d.tag || 'regular'}">${d.tag || 'regular'}</span></td>
                <td>
                    <div class="action-btns">
                        <button class="btn-icon edit" onclick="editCustomer('${doc.id}')"><i class="fas fa-edit"></i></button>
                        <button class="btn-icon delete" onclick="deleteCustomer('${doc.id}')"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            </tr>`;
    });
}

function setupBridge() {
    window.openAddCustomer = () => {
        editingId = null;
        document.getElementById('customer-form').reset();
        document.getElementById('info-createdAt').value = "سيتم التحديد تلقائياً";
        document.getElementById('info-updatedAt').value = "سيتم التحديد تلقائياً";
        document.getElementById('cust-image-preview').src = FALLBACK_AVATAR;
        if(quill) quill.setContents([]);
        document.getElementById('customer-modal').style.display = 'flex';
    };

    window.closeCustomerModal = () => document.getElementById('customer-modal').style.display = 'none';

    window.editCustomer = async (id) => {
        editingId = id;
        const d = await Core.fetchCustomerById(id);
        if (!d) return;

        const fields = ['name', 'phone', 'countryCode', 'email', 'country', 'city', 'district', 'street', 'buildingNo', 'additionalNo', 'postalCode', 'poBox', 'tag', 'image'];
        fields.forEach(f => {
            const el = document.getElementById('cust-' + f);
            if(el) el.value = d[f] || '';
        });

        document.getElementById('cust-image-preview').src = d.image || FALLBACK_AVATAR;
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
        } catch (e) {
            alert("حدث خطأ أثناء الحفظ: " + e.message);
        }
    };

    window.deleteCustomer = async (id) => {
        if (confirm("هل أنت متأكد من حذف هذا العميل نهائياً؟")) {
            await Core.deleteCustomer(id);
            await renderCustomerTable();
        }
    };
}
