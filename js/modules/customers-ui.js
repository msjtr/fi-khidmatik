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

// الحقول الأساسية المتوافقة مع النموذج (Model)
const CUSTOMER_FIELDS = [
    "name", "phone", "country_code", "user_type", "birth_date", "gender",
    "city", "district", "street", "building_number", "additional_number", 
    "postal_code", "latitude", "longitude", "customer_type", 
    "customer_status", "customer_notes"
];

export async function initCustomers(container) {
    if (!container) return;

    container.innerHTML = `
        <div class="customers-module animate-fade-in" style="direction: rtl; font-family: 'Tajawal', sans-serif;">
            <!-- بطاقات الإحصائيات الذكية -->
            <div id="customers-stats" class="row g-3 mb-4"></div>

            <div class="module-header d-flex justify-content-between align-items-center mb-4">
                <h2 class="fw-bold"><i class="fas fa-users text-primary me-2"></i> إدارة العملاء</h2>
                <button id="btn-add-new" class="btn-add-customer shadow-sm">
                    <i class="fas fa-plus-circle"></i> إضافة عميل جديد
                </button>
            </div>

            <div class="table-container shadow-sm rounded-4 overflow-hidden bg-white">
                <div class="table-responsive">
                    <table class="table align-middle mb-0">
                        <thead class="bg-light text-muted">
                            <tr>
                                <th class="ps-4 py-3">العميل</th>
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

        <!-- المودال المتوافق مع Tera Gateway V12 -->
        <div id="customer-modal" class="modal-overlay" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.5); z-index:9999; align-items:center; justify-content:center;">
            <div id="modal-content-container" class="animate-slide-up" style="width: 95%; max-width: 900px;">
                <!-- سيتم حقن customer-form.html هنا برمجياً -->
            </div>
        </div>
    `;

    setupEventListeners();
    loadAndRenderData();
}

// دالة تعديل العميل (Global Scope)
window.editCustomer = async (id) => {
    try {
        const snap = await getDoc(doc(db, "customers", id));
        if (snap.exists()) {
            await openCustomerModal("تعديل بيانات العميل", id, snap.data());
        }
    } catch (e) {
        console.error("Error fetching customer:", e);
    }
};

// دالة حذف العميل (Global Scope)
window.deleteCustomer = async (id) => {
    if (confirm("هل أنت متأكد من حذف هذا العميل نهائياً من نظام تيرا؟")) {
        try {
            await deleteDoc(doc(db, "customers", id));
            loadAndRenderData();
        } catch (e) {
            alert("خطأ في الحذف: " + e.message);
        }
    }
};

async function openCustomerModal(title, id = null, data = null) {
    const modal = document.getElementById('customer-modal');
    const container = document.getElementById('modal-content-container');
    
    // جلب ملف HTML الخارجي للنموذج لضمان توحيد التصميم
    const response = await fetch('components/customer-form.html');
    container.innerHTML = await response.text();
    
    const form = document.getElementById('customer-form');
    document.getElementById('form-action-title').innerText = title;
    
    if (id) {
        document.getElementById('cust-id-hidden').value = id;
        // ملء الحقول بالبيانات المسترجعة
        CUSTOMER_FIELDS.forEach(f => {
            const el = form.querySelector(`[name="${f}"]`);
            if (el) el.value = data[f] || "";
        });
        
        // تحديث محرر النصوص إذا كان موجوداً (Quill)
        if (window.quill) window.quill.root.innerHTML = data.customer_notes || "";
    }

    modal.style.display = 'flex';

    // إعداد زر الإغلاق داخل الفورم المحقون
    form.querySelector('.btn-close').onclick = () => modal.style.display = 'none';
    form.querySelector('.btn-light').onclick = () => modal.style.display = 'none';

    // معالجة الحفظ
    form.onsubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const finalData = Object.fromEntries(formData.entries());
        
        // إضافة بيانات محرر النصوص
        if (window.quill) finalData.customer_notes = window.quill.root.innerHTML;

        try {
            if (id) {
                await updateDoc(doc(db, "customers", id), finalData);
            } else {
                await addDoc(collection(db, "customers"), { ...finalData, createdAt: new Date() });
            }
            modal.style.display = 'none';
            loadAndRenderData();
        } catch (error) {
            console.error("Save Error:", error);
        }
    };
}

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
            const id = docSnap.id;
            
            // حساب الإحصائيات (منطقة حائل والمخاطر)
            if (c.city === 'حائل') stats.hail++;
            if (['متعثر', 'محظور'].includes(c.customer_status)) stats.risky++;

            html += `
                <tr>
                    <td class="ps-4">
                        <div class="d-flex align-items-center">
                            <div class="avatar-circle bg-soft-primary text-primary fw-bold shadow-sm">
                                ${c.name ? c.name.charAt(0) : '?'}
                            </div>
                            <div class="ms-3">
                                <div class="fw-bold text-dark mb-0">${c.name || 'غير معروف'}</div>
                                <span class="badge bg-light text-muted smaller">${c.user_type || 'أفراد'}</span>
                            </div>
                        </div>
                    </td>
                    <td>
                        <div class="small fw-bold text-secondary">${c.phone || '-'}</div>
                        <div class="smaller text-muted">${c.country_code || '+966'}</div>
                    </td>
                    <td>
                        <div class="small text-dark">${c.district || 'حي غير محدد'}</div>
                        <a href="https://maps.google.com/?q=${c.latitude},${c.longitude}" target="_blank" class="text-primary smaller text-decoration-none hover-link">
                            <i class="fas fa-location-arrow me-1"></i> تتبع الموقع
                        </a>
                    </td>
                    <td><span class="badge-tera ${getBadgeClass(c.customer_type)}">${c.customer_type || 'عادي'}</span></td>
                    <td><span class="status-pill ${c.customer_status === 'طبيعي' ? 'status-ok' : 'status-alert'}">${c.customer_status || 'نشط'}</span></td>
                    <td class="text-center">
                        <div class="d-flex justify-content-center gap-2">
                            <button onclick="editCustomer('${id}')" class="btn-action btn-edit-icon" title="تعديل"><i class="fas fa-pen"></i></button>
                            <button onclick="deleteCustomer('${id}')" class="btn-action btn-delete-icon text-danger" title="حذف"><i class="fas fa-trash-alt"></i></button>
                        </div>
                    </td>
                </tr>
            `;
        });

        tbody.innerHTML = html || '<tr><td colspan="6" class="text-center p-5 text-muted">لا يوجد عملاء مسجلين حالياً</td></tr>';
        renderStats(stats, statsContainer);
    } catch (e) { 
        console.error("Render Error:", e);
        tbody.innerHTML = `<tr><td colspan="6" class="text-center p-4 text-danger">فشل تحميل البيانات: ${e.message}</td></tr>`;
    }
}

function setupEventListeners() {
    document.getElementById('btn-add-new').onclick = () => openCustomerModal("إضافة عميل جديد لتيرا");
}

function renderStats(stats, container) {
    container.innerHTML = `
        <div class="col-md-4">
            <div class="stat-card p-3 rounded-4 shadow-sm bg-white border-bottom border-4 border-primary">
                <small class="text-muted d-block mb-1">إجمالي العملاء</small>
                <h4 class="fw-bold mb-0">${stats.total}</h4>
            </div>
        </div>
        <div class="col-md-4">
            <div class="stat-card p-3 rounded-4 shadow-sm bg-white border-bottom border-4 border-success">
                <small class="text-muted d-block mb-1">منطقة حائل 📍</small>
                <h4 class="fw-bold mb-0">${stats.hail}</h4>
            </div>
        </div>
        <div class="col-md-4">
            <div class="stat-card p-3 rounded-4 shadow-sm bg-white border-bottom border-4 border-danger">
                <small class="text-muted d-block mb-1">عملاء المخاطر/التعثر</small>
                <h4 class="fw-bold mb-0 text-danger">${stats.risky}</h4>
            </div>
        </div>
    `;
}

function getBadgeClass(type) {
    if (type === 'عميل VIP 💎') return 'badge-vip';
    if (type === 'عميل مميز') return 'badge-premium';
    return 'badge-regular';
}
