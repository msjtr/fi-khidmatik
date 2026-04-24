/**
 * js/modules/customers-core.js
 * نظام إدارة العملاء المطور - Tera Gateway 
 * تحديث: نقل صندوق البريد للرمز البريدي + عرض كافة البيانات + معالجة حقول العنوان
 */

import { db } from '../core/config.js';
import { collection, getDocs, query, orderBy, doc, deleteDoc, updateDoc, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const countryData = [
    { name: "المملكة العربية السعودية", code: "+966", flag: "🇸🇦", phoneLen: 9 },
    { name: "الإمارات العربية المتحدة", code: "+971", flag: "🇦🇪", phoneLen: 9 },
    { name: "الكويت", code: "+965", flag: "🇰🇼", phoneLen: 8 }
];

export async function initCustomers(container) {
    if (!container) return;

    container.innerHTML = `
        <div class="customers-wrapper">
            <div class="header-section">
                <div class="search-bar">
                    <input type="text" id="customerSearch" placeholder="ابحث باسم العميل أو رقم الجوال...">
                    <i class="fas fa-search"></i>
                </div>
                <button class="btn-primary-tera" id="addNewCustomer">
                    <i class="fas fa-user-plus"></i> إضافة عميل جديد
                </button>
            </div>

            <div class="table-container-tera">
                <table class="tera-table">
                    <thead>
                        <tr>
                            <th>العميل</th>
                            <th>رقم الجوال</th>
                            <th>العنوان الوطني الكامل</th>
                            <th>الرمز البريدي</th>
                            <th>الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody id="customersTableBody">
                        <tr><td colspan="5" style="text-align:center;">جاري تحميل كافة العملاء...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;

    document.getElementById('addNewCustomer').onclick = () => openCustomerModal();
    loadAllCustomers();
}

async function loadAllCustomers() {
    const tbody = document.getElementById('customersTableBody');
    try {
        const q = query(collection(db, "customers"), orderBy("name", "asc"));
        const querySnapshot = await getDocs(q);
        
        let html = "";
        querySnapshot.forEach((docSnapshot) => {
            const c = docSnapshot.data();
            const id = docSnapshot.id;
            
            // بناء العنوان الوطني الكامل ليظهر في القائمة
            const fullAddress = `${c.city || ''} - ${c.district || ''} - ${c.street || ''} (مبنى: ${c.buildingNo || '-'})`;
            
            html += `
                <tr id="row-${id}">
                    <td><strong>${c.name || 'بدون اسم'}</strong></td>
                    <td dir="ltr">${c.phone || '-'}</td>
                    <td>${fullAddress}</td>
                    <td><span class="zip-badge">${c.postalCode || c.poBox || '-'}</span></td>
                    <td>
                        <div class="tera-actions">
                            <button class="t-btn t-edit" onclick="editCustomer('${id}')"><i class="fas fa-edit"></i></button>
                            <button class="t-btn t-print" onclick="printCustomer('${id}')"><i class="fas fa-print"></i></button>
                            <button class="t-btn t-delete" onclick="deleteCustomer('${id}')"><i class="fas fa-trash-alt"></i></button>
                        </div>
                    </td>
                </tr>
            `;
        });
        tbody.innerHTML = html || `<tr><td colspan="5" style="text-align:center;">لا يوجد بيانات حالياً.</td></tr>`;
    } catch (error) {
        tbody.innerHTML = `<tr><td colspan="5" style="color:red; text-align:center;">خطأ في تحميل البيانات.</td></tr>`;
    }
}

window.openCustomerModal = function(customerData = null, docId = null) {
    const isEdit = !!customerData;
    const modalHTML = `
        <div id="customerModal" class="tera-modal-overlay">
            <div class="tera-modal">
                <div class="modal-header-tera">
                    <h3>${isEdit ? 'تعديل بيانات العميل' : 'إضافة عميل جديد'}</h3>
                    <button onclick="closeModalTera()">&times;</button>
                </div>
                <form id="customerForm" class="modal-body-tera">
                    <div class="input-row">
                        <label>الاسم الكامل للعميل</label>
                        <input type="text" id="m_name" value="${customerData?.name || ''}" required>
                    </div>
                    
                    <div class="row-flex">
                        <div class="sub-col">
                            <label>الدولة</label>
                            <input type="text" id="m_country" value="المملكة العربية السعودية" readonly class="bg-gray">
                        </div>
                        <div class="sub-col">
                            <label>رقم الجوال</label>
                            <input type="tel" id="m_phone" value="${customerData?.phone || ''}" placeholder="9665xxxxxxxx">
                        </div>
                    </div>

                    <div class="row-flex">
                         <div class="sub-col">
                            <label>المدينة</label>
                            <input type="text" id="m_city" value="${customerData?.city || 'حائل'}">
                        </div>
                        <div class="sub-col">
                            <label>الحي</label>
                            <input type="text" id="m_district" value="${customerData?.district || ''}">
                        </div>
                    </div>

                    <div class="row-flex">
                        <div class="sub-col">
                            <label>اسم الشارع</label>
                            <input type="text" id="m_street" value="${customerData?.street || ''}">
                        </div>
                        <div class="sub-col">
                            <label>رقم المبنى</label>
                            <input type="text" id="m_building" value="${customerData?.buildingNo || ''}">
                        </div>
                        <div class="sub-col">
                            <label>الرقم الإضافي</label>
                            <input type="text" id="m_additional" value="${customerData?.additionalNo || ''}">
                        </div>
                    </div>

                    <div class="row-flex">
                        <div class="sub-col">
                            <label>صندوق البريد</label>
                            <input type="text" id="m_pobox" oninput="syncZip(this.value)" value="${customerData?.poBox || ''}">
                        </div>
                        <div class="sub-col">
                            <label>الرمز البريدي (تلقائي)</label>
                            <input type="text" id="m_zip" value="${customerData?.postalCode || customerData?.poBox || ''}" class="highlight-input">
                        </div>
                    </div>

                    <div class="modal-footer-tera">
                        <button type="submit" class="save-btn">${isEdit ? 'تحديث البيانات' : 'حفظ العميل'}</button>
                        <button type="button" class="cancel-btn" onclick="closeModalTera()">إلغاء</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    document.getElementById('customerForm').onsubmit = async (e) => {
        e.preventDefault();
        const data = {
            name: document.getElementById('m_name').value,
            phone: document.getElementById('m_phone').value,
            city: document.getElementById('m_city').value,
            district: document.getElementById('m_district').value,
            street: document.getElementById('m_street').value,
            buildingNo: document.getElementById('m_building').value,
            additionalNo: document.getElementById('m_additional').value,
            poBox: document.getElementById('m_pobox').value,
            postalCode: document.getElementById('m_zip').value, // هنا يتم حفظ القيمة المنقولة
            country: "المملكة العربية السعودية",
            updatedAt: new Date().toISOString()
        };

        try {
            if (isEdit) {
                await updateDoc(doc(db, "customers", docId), data);
            } else {
                data.createdAt = new Date().toISOString();
                await addDoc(collection(db, "customers"), data);
            }
            closeModalTera();
            loadAllCustomers();
        } catch (e) { alert("حدث خطأ أثناء الحفظ"); }
    };
};

window.syncZip = (val) => { document.getElementById('m_zip').value = val; };
window.closeModalTera = () => { const m = document.getElementById('customerModal'); if(m) m.remove(); };

// تنسيقات CSS لضمان مظهر احترافي
const style = document.createElement('style');
style.textContent = `
    .customers-wrapper { padding: 20px; direction: rtl; }
    .header-section { display: flex; justify-content: space-between; margin-bottom: 20px; }
    .table-container-tera { background: white; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); overflow-x: auto; }
    .tera-table { width: 100%; border-collapse: collapse; min-width: 900px; }
    .tera-table th { background: #f8fafc; padding: 15px; text-align: right; border-bottom: 2px solid #edf2f7; }
    .tera-table td { padding: 15px; border-bottom: 1px solid #f1f5f9; }
    .zip-badge { background: #e0f2fe; color: #0369a1; padding: 4px 10px; border-radius: 6px; font-weight: bold; }
    .row-flex { display: flex; gap: 10px; margin-bottom: 15px; }
    .sub-col { flex: 1; display: flex; flex-direction: column; }
    .bg-gray { background: #f1f5f9; }
    .highlight-input { border: 2px solid #e67e22 !important; font-weight: bold; }
    .tera-actions { display: flex; gap: 8px; }
    .t-btn { border: none; width: 34px; height: 34px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
    .t-edit { background: #eff6ff; color: #3b82f6; }
    .t-delete { background: #fef2f2; color: #ef4444; }
    .save-btn { background: #16a34a; color: white; border: none; padding: 10px 25px; border-radius: 8px; cursor: pointer; flex: 2; }
`;
document.head.appendChild(style);
