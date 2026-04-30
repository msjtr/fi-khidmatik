/**
 * js/modules/customers-ui.js
 * نظام إدارة العملاء المتكامل - الإصدار V12.12.12
 * المطور: محمد بن صالح الشمري
 */

import { db } from '../core/firebase.js';
import { 
    collection, getDocs, addDoc, updateDoc, deleteDoc, doc, 
    query, orderBy, getDoc 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// مصفوفة الحقول الموسعة لعام 2026
const CUSTOMER_FIELDS = [
    "name", "phone", "country_code", "user_type", "birth_date", "gender",
    "city", "district", "street", "building_number", "additional_number", 
    "postal_code", "po_box", "latitude", "longitude", "customer_type", 
    "customer_status", "customer_notes"
];

export async function initCustomers(container) {
    if (!container) return;

    // 1. رسم الهيكل العام بتصميم تيرا الحديث
    container.innerHTML = `
        <div class="tera-module-wrapper animate-fade-in" style="direction: rtl; font-family: 'Tajawal', sans-serif;">
            <!-- لوحة الإحصائيات الذكية -->
            <div id="customers-stats" class="row g-3 mb-4">
                <div class="col-md-4"><div class="stat-card shadow-sm p-3 bg-white rounded-4 border-start border-4 border-primary">جاري التحميل...</div></div>
            </div>

            <!-- شريط الأدوات المطور -->
            <div class="toolbar d-flex flex-wrap justify-content-between align-items-center mb-4 p-3 bg-white rounded-4 shadow-sm">
                <div class="search-box position-relative" style="min-width: 300px;">
                    <i class="fas fa-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
                    <input type="text" id="main-search" class="form-control ps-5 rounded-pill border-light bg-light" placeholder="بحث باسم العميل أو الجوال...">
                </div>
                <div class="action-buttons d-flex gap-2">
                    <button id="btn-add-new" class="btn btn-orange-gradient rounded-pill px-4 shadow-sm text-white">
                        <i class="fas fa-plus-circle me-1"></i> إضافة عميل
                    </button>
                    <button class="btn btn-outline-success rounded-pill px-3"><i class="fas fa-file-excel"></i></button>
                </div>
            </div>

            <!-- جدول البيانات الزجاجي -->
            <div class="table-container bg-white rounded-4 shadow-sm overflow-hidden">
                <div class="table-responsive">
                    <table class="table table-hover align-middle mb-0">
                        <thead class="bg-light">
                            <tr class="text-secondary small">
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

        <!-- مودال الإضافة/التعديل (Tera Modal) -->
        <div id="customer-modal" class="tera-modal-overlay" style="display:none;">
            <div class="tera-modal-content animate-slide-up">
                <div class="modal-header-custom d-flex justify-content-between align-items-center mb-4">
                    <h4 id="modal-title" class="fw-900 mb-0">إضافة عميل</h4>
                    <button id="modal-close" class="btn-close-custom">&times;</button>
                </div>
                <form id="customer-form-dynamic" class="row g-3">
                    <input type="hidden" id="edit-id">
                    <div id="fields-container" class="row g-3">
                        <!-- الحقول يتم حقنها برمجياً لضمان الدقة -->
                    </div>
                    <div class="col-12 mt-4 pt-3 border-top d-flex gap-2 justify-content-end">
                        <button type="button" id="btn-cancel" class="btn btn-light rounded-pill px-4">إلغاء</button>
                        <button type="submit" class="btn btn-primary rounded-pill px-5">حفظ البيانات</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    setupEventListeners();
    loadAndRenderData();
}

/**
 * جلب البيانات وعرضها مع دعم الفلترة الجغرافية لحائل
 */
async function loadAndRenderData() {
    const tbody = document.getElementById('customers-list-body');
    const statsContainer = document.getElementById('customers-stats');

    try {
        const snap = await getDocs(query(collection(db, "customers"), orderBy("name", "asc")));
        let html = "";
        let stats = { total: snap.size, vip: 0, hail: 0, risky: 0 };

        snap.forEach(docSnap => {
            const c = docSnap.data();
            if (c.customer_type === 'عميل VIP') stats.vip++;
            if (c.city === 'حائل') stats.hail++;
            if (c.customer_status === 'عميل محتال' || c.customer_status === 'عميل مزعج') stats.risky++;

            html += `
                <tr>
                    <td class="ps-4">
                        <div class="d-flex align-items-center">
                            <div class="avatar-sm me-3 bg-soft-primary text-primary rounded-circle d-flex align-items-center justify-content-center fw-bold">
                                ${c.name.charAt(0)}
                            </div>
                            <div>
                                <div class="fw-bold text-dark">${c.name}</div>
                                <small class="text-muted">${c.user_type || 'أفراد'}</small>
                            </div>
                        </div>
                    </td>
                    <td>
                        <div class="small">${c.country_code || '+966'} ${c.phone}</div>
                        <div class="text-muted smaller">${c.email || ''}</div>
                    </td>
                    <td>
                        <div class="small">${c.city} - ${c.district}</div>
                        <a href="https://maps.google.com/?q=${c.latitude},${c.longitude}" target="_blank" class="smaller text-blue text-decoration-none">
                            <i class="fas fa-external-link-alt"></i> فتح الخريطة
                        </a>
                    </td>
                    <td><span class="badge bg-soft-info text-info rounded-pill">${c.customer_type || 'لم يصنف'}</span></td>
                    <td>
                        <span class="badge ${c.customer_status === 'طبيعي' ? 'bg-soft-success text-success' : 'bg-soft-danger text-danger'} rounded-pill">
                            ${c.customer_status || 'نشط'}
                        </span>
                    </td>
                    <td class="text-center">
                        <div class="btn-group shadow-sm rounded-pill overflow-hidden">
                            <button onclick="window.editCustomer('${docSnap.id}')" class="btn btn-white btn-sm px-3 border-end"><i class="fas fa-edit text-primary"></i></button>
                            <button onclick="window.deleteCustomer('${docSnap.id}')" class="btn btn-white btn-sm px-3"><i class="fas fa-trash-alt text-danger"></i></button>
                        </div>
                    </td>
                </tr>
            `;
        });

        tbody.innerHTML = html || '<tr><td colspan="6" class="text-center p-5">لا يوجد عملاء مضافين</td></tr>';
        
        statsContainer.innerHTML = `
            <div class="col-md-4">
                <div class="stat-card bg-white p-3 rounded-4 shadow-sm border-start border-4 border-primary">
                    <small class="text-muted fw-bold">إجمالي العملاء</small>
                    <h3 class="fw-900 mb-0">${stats.total}</h3>
                </div>
            </div>
            <div class="col-md-4">
                <div class="stat-card bg-white p-3 rounded-4 shadow-sm border-start border-4 border-success">
                    <small class="text-muted fw-bold">منطقة حائل</small>
                    <h3 class="fw-900 mb-0">${stats.hail}</h3>
                </div>
            </div>
            <div class="col-md-4">
                <div class="stat-card bg-white p-3 rounded-4 shadow-sm border-start border-4 border-danger">
                    <small class="text-muted fw-bold">تنبيهات أمنية</small>
                    <h3 class="fw-900 mb-0 text-danger">${stats.risky}</h3>
                </div>
            </div>
        `;

    } catch (error) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-danger p-5">فشل الاتصال بـ Firestore</td></tr>';
    }
}

/**
 * إعداد مستمعات الأحداث والنموذج الديناميكي
 */
function setupEventListeners() {
    const modal = document.getElementById('customer-modal');
    const form = document.getElementById('customer-form-dynamic');
    const fieldsContainer = document.getElementById('fields-container');

    // إنشاء الحقول برمجياً لضمان تطابق ID مع Firestore
    fieldsContainer.innerHTML = CUSTOMER_FIELDS.map(field => `
        <div class="${['customer_notes'].includes(field) ? 'col-12' : 'col-md-6'}">
            <label class="form-label small fw-bold text-muted">${getLabelAr(field)}</label>
            ${field === 'customer_status' ? `
                <select id="f-${field}" class="form-select tera-input">
                    <option value="طبيعي" selected>طبيعي ✅</option>
                    <option value="عميل مزعج">عميل مزعج ⚠️</option>
                    <option value="عميل محتال">عميل محتال 🚩</option>
                </select>
            ` : field === 'customer_type' ? `
                <select id="f-${field}" class="form-select tera-input">
                    <option value="عميل عادي" selected>عميل عادي</option>
                    <option value="عميل مميز">عميل مميز</option>
                    <option value="عميل VIP">عميل VIP 💎</option>
                </select>
            ` : field === 'customer_notes' ? `
                <textarea id="f-${field}" class="form-control tera-input" rows="3"></textarea>
            ` : `
                <input type="text" id="f-${field}" class="form-control tera-input" placeholder="...">
            `}
        </div>
    `).join('');

    document.getElementById('btn-add-new').onclick = () => {
        form.reset();
        document.getElementById('edit-id').value = "";
        document.getElementById('modal-title').innerText = "إضافة عميل لتيرا";
        modal.style.display = 'flex';
    };

    document.getElementById('modal-close').onclick = () => modal.style.display = 'none';
    document.getElementById('btn-cancel').onclick = () => modal.style.display = 'none';

    form.onsubmit = async (e) => {
        e.preventDefault();
        const editId = document.getElementById('edit-id').value;
        const data = {};
        CUSTOMER_FIELDS.forEach(f => data[f] = document.getElementById(`f-${f}`).value);

        try {
            if (editId) {
                await updateDoc(doc(db, "customers", editId), { ...data, updatedAt: new Date().toISOString() });
            } else {
                await addDoc(collection(db, "customers"), { ...data, createdAt: new Date().toISOString() });
            }
            modal.style.display = 'none';
            loadAndRenderData();
        } catch (err) { alert("Error: " + err.message); }
    };

    window.deleteCustomer = async (id) => {
        if (confirm("حذف العميل نهائياً؟")) {
            await deleteDoc(doc(db, "customers", id));
            loadAndRenderData();
        }
    };

    window.editCustomer = async (id) => {
        const snap = await getDoc(doc(db, "customers", id));
        if (snap.exists()) {
            const d = snap.data();
            document.getElementById('edit-id').value = id;
            CUSTOMER_FIELDS.forEach(f => {
                const el = document.getElementById(`f-${f}`);
                if(el) el.value = d[f] || "";
            });
            modal.style.display = 'flex';
        }
    };
}

function getLabelAr(key) {
    const labels = {
        name: "اسم العميل", phone: "الجوال", country_code: "مفتاح الدولة",
        user_type: "نوع المستخدم", birth_date: "الميلاد", gender: "الجنس",
        city: "المدينة", district: "الحي", street: "الشارع",
        building_number: "المبنى", additional_number: "الإضافي",
        postal_code: "الرمز البريدي", po_box: "صندوق البريد",
        customer_type: "التصنيف", customer_status: "الحالة الأمنية",
        customer_notes: "ملاحظات إضافية", latitude: "خطي العرض", longitude: "خط الطول"
    };
    return labels[key] || key;
}
