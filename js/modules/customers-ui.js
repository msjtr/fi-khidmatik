/**
 * customers-ui.js
 * المسار المعتمد: js/modules/customers-ui.js
 */

// الاستدعاء من نفس المجلد لضمان التوافق
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
                    <input type="text" id="cust-filter" placeholder="بحث في العملاء...">
                </div>
                <div class="button-group">
                    <button class="btn-action edit" onclick="openAddCustomer()">
                        <i class="fas fa-user-plus"></i> إضافة عميل جديد
                    </button>
                </div>
            </div>

            <div class="table-container">
                <table class="tera-table">
                    <thead>
                        <tr>
                            <th>العميل</th>
                            <th>الاتصال</th>
                            <th>المدينة</th>
                            <th>التصنيف</th>
                            <th class="sticky-actions">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody id="customers-table-body">
                        <tr><td colspan="5" style="text-align:center;">جاري التحميل...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div id="customer-modal" class="modal" style="display:none;">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 id="modal-title">بيانات العميل</h3>
                    <button type="button" onclick="closeCustomerModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="customer-form" onsubmit="event.preventDefault(); saveCustomer();">
                        <div class="form-grid">
                            <div class="input-group full-width" style="text-align:center;">
                                <img id="cust-image-preview" src="${FALLBACK_AVATAR}" class="preview-img">
                                <input type="hidden" id="cust-image-url">
                            </div>
                            <div class="input-group"><label>الاسم الكامل</label><input type="text" id="cust-name" required></div>
                            <div class="input-group"><label>رقم الجوال</label><input type="text" id="cust-phone" required></div>
                            <div class="input-group"><label>مفتاح الدولة</label><input type="text" id="cust-countryCode" value="+966"></div>
                            <div class="input-group"><label>البريد الإلكتروني</label><input type="email" id="cust-email"></div>
                            <div class="input-group"><label>المدينة</label><input type="text" id="cust-city"></div>
                            <div class="input-group"><label>الحي</label><input type="text" id="cust-district"></div>
                            <div class="input-group"><label>التصنيف</label>
                                <select id="cust-tag">
                                    <option value="regular">Regular</option>
                                    <option value="vip">VIP</option>
                                    <option value="company">Company</option>
                                </select>
                            </div>
                            <div class="input-group full-width">
                                <label>الملاحظات</label>
                                <div id="editor-container" style="height: 100px; background: #fff;"></div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="submit" class="btn-save">حفظ البيانات</button>
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
    const el = document.getElementById('editor-container');
    if (el && typeof Quill !== 'undefined') {
        quill = new Quill('#editor-container', { theme: 'snow' });
    }
}

export async function renderCustomerTable() {
    const tbody = document.getElementById('customers-table-body');
    if (!tbody) return;
    const snapshot = await Core.fetchAllCustomers();
    tbody.innerHTML = '';
    snapshot.forEach(doc => {
        const d = doc.data();
        tbody.innerHTML += `
            <tr>
                <td><strong>${d.name}</strong></td>
                <td>${d.phone}</td>
                <td>${d.city || '---'}</td>
                <td><span class="tag-badge tag-${d.tag}">${d.tag}</span></td>
                <td class="sticky-actions">
                    <button class="btn-action edit" onclick="editCustomer('${doc.id}')"><i class="fas fa-pen"></i></button>
                    <button class="btn-action delete" onclick="deleteCustomer('${doc.id}')"><i class="fas fa-trash"></i></button>
                </td>
            </tr>`;
    });
}

function setupBridge() {
    window.openAddCustomer = () => {
        editingId = null;
        document.getElementById('customer-form').reset();
        if(quill) quill.setContents([]);
        document.getElementById('customer-modal').style.display = 'flex';
    };
    window.closeCustomerModal = () => document.getElementById('customer-modal').style.display = 'none';
    window.editCustomer = async (id) => {
        editingId = id;
        const d = await Core.fetchCustomerById(id);
        if (!d) return;
        document.getElementById('cust-name').value = d.name || '';
        document.getElementById('cust-phone').value = d.phone || '';
        document.getElementById('cust-tag').value = d.tag || 'regular';
        if (quill) quill.root.innerHTML = d.notes || '';
        document.getElementById('customer-modal').style.display = 'flex';
    };
    window.saveCustomer = async () => {
        const data = {
            name: document.getElementById('cust-name').value,
            phone: document.getElementById('cust-phone').value,
            tag: document.getElementById('cust-tag').value,
            notes: quill ? quill.root.innerHTML : '',
            image: document.getElementById('cust-image-url').value || FALLBACK_AVATAR
        };
        editingId ? await Core.updateCustomer(editingId, data) : await Core.addCustomer(data);
        window.closeCustomerModal();
        await renderCustomerTable();
    };
    window.deleteCustomer = async (id) => {
        if(confirm("حذف العميل؟")) { await Core.deleteCustomer(id); await renderCustomerTable(); }
    };
}
