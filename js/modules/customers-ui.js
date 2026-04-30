/** 
 * js/modules/customers-ui.js
 * نظام إدارة العملاء المتكامل - الإصدار V12.12.13
 * المطور: محمد بن صالح الشمري
 */

import { db } from '../core/firebase.js';
import { GeoEngine } from '../core/geo-engine.js'; // الربط مع نواة الخريطة المستقلة
import { 
    collection, getDocs, addDoc, updateDoc, deleteDoc, doc, 
    query, orderBy, getDoc 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

        <div id="customer-modal" class="modal-overlay" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.5); z-index:9999; align-items:center; justify-content:center;">
            <div id="modal-content-container" class="animate-slide-up" style="width: 95%; max-width: 900px; max-height: 90vh; overflow-y: auto;">
                <!-- المحتوى المحقون من customer-form.html -->
            </div>
        </div>
    `;

    setupEventListeners();
    loadAndRenderData();
}

// الدوال العالمية للتحكم من الجدول
window.editCustomer = async (id) => {
    const snap = await getDoc(doc(db, "customers", id));
    if (snap.exists()) openCustomerModal("تعديل بيانات العميل", id, snap.data());
};

window.deleteCustomer = async (id) => {
    if (confirm("هل أنت متأكد من حذف العميل من نظام تيرا؟")) {
        await deleteDoc(doc(db, "customers", id));
        loadAndRenderData();
    }
};

async function openCustomerModal(title, id = null, data = null) {
    const modal = document.getElementById('customer-modal');
    const container = document.getElementById('modal-content-container');
    
    // جلب النموذج
    const response = await fetch('components/customer-form.html');
    container.innerHTML = await response.text();
    
    const form = document.getElementById('customer-form');
    document.getElementById('form-action-title').innerText = title;
    
    // ملء البيانات إذا كان تعديل
    if (id) {
        document.getElementById('cust-id-hidden').value = id;
        CUSTOMER_FIELDS.forEach(f => {
            const el = form.querySelector(`[name="${f}"]`);
            if (el) el.value = data[f] || "";
        });
        if (window.quill) window.quill.root.innerHTML = data.customer_notes || "";
    }

    modal.style.display = 'flex';

    // ربط موديول الخريطة المستقل
    const btnMap = document.getElementById('btn-open-map');
    if (btnMap) {
        btnMap.onclick = async () => {
            const mapArea = document.getElementById('map-selection-area');
            mapArea.style.height = "300px";
            mapArea.classList.add('mb-3', 'rounded-3', 'border');
            
            // تهيئة الخريطة من النواة المستقلة
            const initialLat = data?.latitude ? parseFloat(data.latitude) : 27.5114;
            const initialLng = data?.longitude ? parseFloat(data.longitude) : 41.7208;
            
            await GeoEngine.initMap('map-selection-area', initialLat, initialLng);
            
            // تحديث الإحداثيات عند تحريك الماركر
            GeoEngine.marker.addListener("dragend", async () => {
                const pos = GeoEngine.marker.getPosition();
                form.querySelector('[name="latitude"]').value = pos.lat();
                form.querySelector('[name="longitude"]').value = pos.lng();
                
                // جلب العنوان تلقائياً
                const addr = await GeoEngine.getAddressFromCoords(pos.lat(), pos.lng());
                if (addr && form.querySelector('[name="district"]')) {
                    form.querySelector('[name="district"]').value = addr.district;
                }
            });
            btnMap.style.display = 'none'; // إخفاء الزر بعد فتح الخريطة
        };
    }

    // إغلاق وحفظ
    const close = () => modal.style.display = 'none';
    form.querySelector('.btn-close').onclick = close;
    form.querySelector('.btn-light').onclick = close;

    form.onsubmit = async (e) => {
        e.preventDefault();
        const finalData = Object.fromEntries(new FormData(form).entries());
        if (window.quill) finalData.customer_notes = window.quill.root.innerHTML;

        try {
            if (id) {
                await updateDoc(doc(db, "customers", id), finalData);
            } else {
                await addDoc(collection(db, "customers"), { ...finalData, createdAt: new Date() });
            }
            close();
            loadAndRenderData();
        } catch (err) { console.error("Save error:", err); }
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
            if (c.city === 'حائل') stats.hail++;
            if (['متعثر', 'محظور'].includes(c.customer_status)) stats.risky++;

            html += `
                <tr>
                    <td class="ps-4">
                        <div class="d-flex align-items-center">
                            <div class="avatar-circle bg-soft-primary text-primary fw-bold">
                                ${c.name ? c.name.charAt(0) : '?'}
                            </div>
                            <div class="ms-3">
                                <div class="fw-bold text-dark">${c.name || 'بدون اسم'}</div>
                                <span class="badge bg-light text-muted smaller">${c.user_type || 'أفراد'}</span>
                            </div>
                        </div>
                    </td>
                    <td>
                        <div class="small fw-bold">${c.phone || '-'}</div>
                        <div class="smaller text-muted">${c.country_code || '+966'}</div>
                    </td>
                    <td>
                        <div class="small">${c.district || 'غير محدد'}</div>
                        <a href="https://maps.google.com/?q=${c.latitude},${c.longitude}" target="_blank" class="text-primary smaller text-decoration-none">
                            <i class="fas fa-location-arrow me-1"></i> تتبع
                        </a>
                    </td>
                    <td><span class="badge-tera ${getBadgeClass(c.customer_type)}">${c.customer_type || 'عادي'}</span></td>
                    <td><span class="status-pill ${c.customer_status === 'طبيعي' ? 'status-ok' : 'status-alert'}">${c.customer_status || 'نشط'}</span></td>
                    <td class="text-center">
                        <div class="d-flex justify-content-center gap-2">
                            <button onclick="editCustomer('${id}')" class="btn-action btn-edit-icon"><i class="fas fa-pen"></i></button>
                            <button onclick="deleteCustomer('${id}')" class="btn-action btn-delete-icon text-danger"><i class="fas fa-trash-alt"></i></button>
                        </div>
                    </td>
                </tr>
            `;
        });

        tbody.innerHTML = html || '<tr><td colspan="6" class="text-center p-5 text-muted">لا يوجد عملاء</td></tr>';
        renderStats(stats, statsContainer);
    } catch (e) { console.error(e); }
}

function setupEventListeners() {
    document.getElementById('btn-add-new').onclick = () => openCustomerModal("إضافة عميل جديد");
}

function renderStats(stats, container) {
    container.innerHTML = `
        <div class="col-md-4"><div class="stat-card p-3 rounded-4 shadow-sm bg-white border-bottom border-4 border-primary"><small>العملاء</small><h4 class="fw-bold">${stats.total}</h4></div></div>
        <div class="col-md-4"><div class="stat-card p-3 rounded-4 shadow-sm bg-white border-bottom border-4 border-success"><small>حائل 📍</small><h4 class="fw-bold">${stats.hail}</h4></div></div>
        <div class="col-md-4"><div class="stat-card p-3 rounded-4 shadow-sm bg-white border-bottom border-4 border-danger"><small>المخاطر</small><h4 class="fw-bold text-danger">${stats.risky}</h4></div></div>
    `;
}

function getBadgeClass(type) {
    if (type === 'عميل VIP 💎') return 'badge-vip';
    if (type === 'عميل مميز') return 'badge-premium';
    return 'badge-regular';
}
