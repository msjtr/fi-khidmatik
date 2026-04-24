import { db } from '../core/config.js';
import { collection, query, getDocs, addDoc, updateDoc, doc, deleteDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const countryData = [
    { name: "المملكة العربية السعودية", code: "966", flag: "🇸🇦", len: 9 },
    { name: "الإمارات", code: "971", flag: "🇦🇪", len: 9 },
    { name: "الكويت", code: "965", flag: "🇰🇼", len: 8 },
    { name: "مصر", code: "20", flag: "🇪🇬", len: 10 }
];

// دالة البدء الرئيسية
export async function initCustomers(container) {
    if (!container) return;
    renderSkeleton(container);
    await fetchAndRenderCustomers();
}

function renderSkeleton(container) {
    container.innerHTML = `
        <div class="customer-admin-header">
            <div class="search-bar">
                <input type="text" id="cust-search-input" placeholder="ابحث باسم العميل أو رقم الجوال..." oninput="window.filterCustomers(this.value)">
                <i class="fas fa-search"></i>
            </div>
            <button class="btn-add-main" onclick="window.openCustomerModal()">
                <i class="fas fa-user-plus"></i> إضافة عميل جديد
            </button>
        </div>
        <div id="customers-list-wrapper">
            <div class="loading-state">جاري جلب قائمة العملاء من السحابة...</div>
        </div>
    `;
}

// جلب البيانات من Firestore
async function fetchAndRenderCustomers() {
    const wrapper = document.getElementById('customers-list-wrapper');
    try {
        const q = query(collection(db, "customers"));
        const querySnapshot = await getDocs(q);
        const customers = [];
        querySnapshot.forEach((doc) => customers.push({ id: doc.id, ...doc.data() }));
        
        window.allCustomers = customers; // حفظ للفلترة
        renderTable(customers);
    } catch (error) {
        wrapper.innerHTML = `<div class="error">خطأ في الاتصال: ${error.message}</div>`;
    }
}

function renderTable(data) {
    const wrapper = document.getElementById('customers-list-wrapper');
    if (data.length === 0) {
        wrapper.innerHTML = `<div class="empty-state">لا يوجد عملاء مضافين حالياً</div>`;
        return;
    }

    wrapper.innerHTML = `
        <table class="cust-table">
            <thead>
                <tr>
                    <th>العميل</th>
                    <th>الجوال</th>
                    <th>المنطقة</th>
                    <th>الرمز البريدي</th>
                    <th>الإجراءات</th>
                </tr>
            </thead>
            <tbody>
                ${data.map(c => `
                    <tr>
                        <td><strong>${c.name}</strong></td>
                        <td dir="ltr">+${c.phone}</td>
                        <td>${c.city} - ${c.district}</td>
                        <td><span class="zip-tag">${c.postalCode || '-'}</span></td>
                        <td class="ops">
                            <button class="btn-op edit" onclick='window.openCustomerModal(${JSON.stringify(c)})'><i class="fas fa-edit"></i></button>
                            <button class="btn-op print" onclick="window.printCustomer('${c.id}')"><i class="fas fa-print"></i></button>
                            <button class="btn-op del" onclick="window.deleteCustomer('${c.id}')"><i class="fas fa-trash"></i></button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// نافذة الإضافة والتعديل
window.openCustomerModal = function(customer = null) {
    const isEdit = !!customer;
    const modal = document.createElement('div');
    modal.id = "cust-modal";
    modal.className = "modal-overlay";
    
    modal.innerHTML = `
        <div class="modal-card">
            <div class="modal-header">
                <h3>${isEdit ? 'تعديل بيانات العميل' : 'إضافة عميل جديد'}</h3>
                <button onclick="this.closest('.modal-overlay').remove()">&times;</button>
            </div>
            <form id="modal-form" class="modal-form">
                <div class="form-grid">
                    <div class="field full">
                        <label>الاسم الكامل</label>
                        <input type="text" id="m-name" value="${customer?.name || ''}" required>
                    </div>
                    <div class="field">
                        <label>دولة الجوال</label>
                        <select id="m-country" onchange="updateDialCode()">
                            ${countryData.map(d => `<option value="${d.code}" ${customer?.phone?.startsWith(d.code) ? 'selected' : ''}>${d.flag} ${d.name}</option>`).join('')}
                        </select>
                    </div>
                    <div class="field">
                        <label>رقم الجوال (بدون 0)</label>
                        <div class="dial-input">
                            <span id="dial-code-preview">+966</span>
                            <input type="tel" id="m-phone" value="${customer?.phone ? customer.phone.replace(/^966|^971|^20/, '') : ''}" required>
                        </div>
                    </div>
                    <div class="field">
                        <label>الهاتف الثابت (اختياري)</label>
                        <input type="tel" id="m-landline" value="${customer?.landline || ''}">
                    </div>
                    <div class="field">
                        <label>المدينة</label>
                        <input type="text" id="m-city" value="${customer?.city || 'حائل'}">
                    </div>
                    <div class="field">
                        <label>الحي</label>
                        <input type="text" id="m-district" value="${customer?.district || ''}">
                    </div>
                    <div class="field">
                        <label>صندوق البريد</label>
                        <input type="text" id="m-pobox" value="${customer?.poBox || ''}" oninput="document.getElementById('m-zip').value=this.value">
                    </div>
                    <div class="field">
                        <label>الرمز البريدي</label>
                        <input type="text" id="m-zip" value="${customer?.postalCode || ''}">
                    </div>
                    <div class="field full">
                        <label>ملاحظات إدارية</label>
                        <textarea id="m-notes" rows="3">${customer?.notes || ''}</textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="submit" class="btn-save">حفظ البيانات</button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(modal);
    window.updateDialCode();

    document.getElementById('modal-form').onsubmit = async (e) => {
        e.preventDefault();
        const dial = document.getElementById('m-country').value;
        const phone = document.getElementById('m-phone').value;
        const data = {
            name: document.getElementById('m-name').value,
            phone: dial + phone,
            landline: document.getElementById('m-landline').value,
            city: document.getElementById('m-city').value,
            district: document.getElementById('m-district').value,
            poBox: document.getElementById('m-pobox').value,
            postalCode: document.getElementById('m-zip').value,
            notes: document.getElementById('m-notes').value,
            updatedAt: serverTimestamp()
        };

        if (isEdit) {
            await updateDoc(doc(db, "customers", customer.id), data);
        } else {
            data.createdAt = serverTimestamp();
            await addDoc(collection(db, "customers"), data);
        }
        modal.remove();
        fetchAndRenderCustomers();
    };
};

window.updateDialCode = () => {
    const code = document.getElementById('m-country').value;
    document.getElementById('dial-code-preview').innerText = '+' + code;
};

window.filterCustomers = (val) => {
    const filtered = window.allCustomers.filter(c => c.name.includes(val) || c.phone.includes(val));
    renderTable(filtered);
};
