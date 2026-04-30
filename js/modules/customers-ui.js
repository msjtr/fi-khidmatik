/** 
 * js/modules/customers-ui.js
 * نظام إدارة العملاء المتكامل - الإصدار V12.12.13
 * المطور: محمد بن صالح الشمري
 */

import { db } from '../core/firebase.js';
import { 
    collection, getDocs, addDoc, updateDoc, deleteDoc, doc, 
    query, orderBy, getDoc 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const CUSTOMER_FIELDS = [
    "name", "phone", "country_code", "user_type", "birth_date", "gender",
    "city", "district", "street", "building_number", "additional_number", 
    "postal_code", "po_box", "latitude", "longitude", "customer_type", 
    "customer_status", "customer_notes"
];

export async function initCustomers(container) {
    if (!container) return;

    container.innerHTML = `
        <div class="customers-module animate-fade-in" style="direction: rtl; font-family: 'Tajawal', sans-serif;">
            <div id="customers-stats" class="row g-3 mb-4"></div>

            <div class="module-header">
                <h2>إدارة العملاء</h2>
                <button id="btn-add-new" class="btn-add-customer">
                    <i class="fas fa-plus-circle"></i> إضافة عميل جديد
                </button>
            </div>

            <div class="table-container">
                <div class="table-responsive">
                    <table class="table align-middle mb-0">
                        <thead>
                            <tr>
                                <th class="ps-4">العميل</th>
                                <th>الاتصال</th>
                                <th>الموقع (حائل)</th>
                                <th>التصنيف</th>
                                <th>الحالة</th>
                                <th class="text-center">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody id="customers-list-body">
                            <tr><td colspan="6" class="text-center py-5"><div class="spinner-border text-primary"></div></td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- نظام المودال الموحد لتيرا -->
        <div id="customer-modal" class="modal-overlay" style="display:none;">
            <div class="modal-card">
                <div class="modal-header-custom p-4 border-bottom d-flex justify-content-between align-items-center">
                    <h4 id="modal-title" class="fw-bold mb-0 text-dark">إضافة عميل</h4>
                    <button type="button" class="btn-close" id="modal-close-x"></button>
                </div>
                <form id="customer-form-dynamic">
                    <div class="modal-body">
                        <input type="hidden" id="edit-id">
                        <div id="fields-container" class="row g-3"></div>
                    </div>
                    <div class="modal-footer p-4 border-top d-flex gap-2 justify-content-end">
                        <button type="button" id="btn-cancel" class="btn btn-light rounded-pill px-4">إلغاء</button>
                        <button type="submit" class="btn-add-customer">حفظ البيانات</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    setupEventListeners();
    loadAndRenderData();
}

// تصدير الدوال للنطاق العالمي لضمان عمل الـ onclick من داخل الجدول
window.editCustomer = async (id) => {
    const snap = await getDoc(doc(db, "customers", id));
    if (snap.exists()) {
        const d = snap.data();
        document.getElementById('edit-id').value = id;
        document.getElementById('modal-title').innerText = "تعديل بيانات العميل";
        
        CUSTOMER_FIELDS.forEach(f => {
            const el = document.getElementById(`f-${f}`);
            if (el) el.value = d[f] || "";
        });
        document.getElementById('customer-modal').style.display = 'flex';
    }
};

window.deleteCustomer = async (id) => {
    if (confirm("هل أنت متأكد من حذف هذا العميل من نظام تيرا؟")) {
        await deleteDoc(doc(db, "customers", id));
        loadAndRenderData();
    }
};

async function loadAndRenderData() {
    const tbody = document.getElementById('customers-list-body');
    const statsContainer = document.getElementById('customers-stats');
    if (!tbody) return;

    try {
        const snap = await getDocs(query(collection(db, "customers"), orderBy("name", "asc")));
        let html = "";
        let stats = { total: snap.size, hail: 0, risky: 0 };

        snap.forEach(docSnap => {
            const c = docSnap.data();
            if (c.city === 'حائل') stats.hail++;
            if (['عميل محتال', 'عميل مزعج'].includes(c.customer_status)) stats.risky++;

            html += `
                <tr>
                    <td class="ps-4">
                        <div class="d-flex align-items-center">
                            <div class="table-user-img bg-light d-flex align-items-center justify-content-center text-primary fw-bold">
                                ${c.name ? c.name.charAt(0) : '?'}
                            </div>
                            <div class="ms-3">
                                <div class="fw-bold text-dark">${c.name || 'بدون اسم'}</div>
                                <small class="text-muted">${c.user_type || 'أفراد'}</small>
                            </div>
                        </div>
                    </td>
                    <td><div class="small">${c.country_code || '+966'} ${c.phone || ''}</div></td>
                    <td>
                        <div class="small">${c.city || ''} - ${c.district || ''}</div>
                        <a href="https://maps.google.com/?q=${c.latitude},${c.longitude}" target="_blank" class="text-primary smaller text-decoration-none">
                            <i class="fas fa-map-marker-alt"></i> معاينة الموقع
                        </a>
                    </td>
                    <td><span class="badge-tera badge-vip">${c.customer_type || 'عادي'}</span></td>
                    <td><span class="badge-tera ${c.customer_status === 'طبيعي' ? 'badge-regular' : 'badge-vip'}">${c.customer_status || 'نشط'}</span></td>
                    <td class="text-center">
                        <div class="actions-cell">
                            <button onclick="editCustomer('${docSnap.id}')" class="btn-action btn-edit"><i class="fas fa-edit"></i></button>
                            <button onclick="deleteCustomer('${docSnap.id}')" class="btn-action btn-map text-danger"><i class="fas fa-trash"></i></button>
                        </div>
                    </td>
                </tr>
            `;
        });

        tbody.innerHTML = html || '<tr><td colspan="6" class="text-center p-5">لا يوجد بيانات</td></tr>';
        renderStats(stats, statsContainer);
    } catch (e) { console.error(e); }
}

function setupEventListeners() {
    const modal = document.getElementById('customer-modal');
    const form = document.getElementById('customer-form-dynamic');
    const fieldsContainer = document.getElementById('fields-container');

    // توليد الحقول
    fieldsContainer.innerHTML = CUSTOMER_FIELDS.map(field => `
        <div class="${field === 'customer_notes' ? 'col-12' : 'col-md-4'}">
            <label class="form-label small fw-bold">${getLabelAr(field)}</label>
            <input type="text" id="f-${field}" class="tera-input-field w-100" placeholder="...">
        </div>
    `).join('');

    document.getElementById('btn-add-new').onclick = () => {
        form.reset();
        document.getElementById('edit-id').value = "";
        document.getElementById('modal-title').innerText = "إضافة عميل جديد";
        modal.style.display = 'flex';
    };

    const closeModal = () => modal.style.display = 'none';
    document.getElementById('modal-close-x').onclick = closeModal;
    document.getElementById('btn-cancel').onclick = closeModal;

    form.onsubmit = async (e) => {
        e.preventDefault();
        const editId = document.getElementById('edit-id').value;
        const data = {};
        CUSTOMER_FIELDS.forEach(f => data[f] = document.getElementById(`f-${f}`).value);

        if (editId) {
            await updateDoc(doc(db, "customers", editId), data);
        } else {
            await addDoc(collection(db, "customers"), data);
        }
        closeModal();
        loadAndRenderData();
    };
}

function renderStats(stats, container) {
    container.innerHTML = `
        <div class="col-md-4"><div class="stat-card p-3 bg-white rounded-4 shadow-sm border-start border-4 border-primary">العملاء: ${stats.total}</div></div>
        <div class="col-md-4"><div class="stat-card p-3 bg-white rounded-4 shadow-sm border-start border-4 border-success">حائل: ${stats.hail}</div></div>
        <div class="col-md-4"><div class="stat-card p-3 bg-white rounded-4 shadow-sm border-start border-4 border-danger">المخاطر: ${stats.risky}</div></div>
    `;
}

function getLabelAr(key) {
    const labels = {
        name: "الاسم", phone: "الجوال", country_code: "الكود", user_type: "النوع",
        city: "المدينة", district: "الحي", street: "الشارع", latitude: "العرض (Lat)", longitude: "الطول (Lng)",
        customer_type: "التصنيف", customer_status: "الحالة", customer_notes: "ملاحظات"
    };
    return labels[key] || key;
}
