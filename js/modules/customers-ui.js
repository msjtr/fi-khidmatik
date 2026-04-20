/**
 * js/modules/customers-ui.js
 * موديول العملاء - جلب بيانات حقيقية من Firebase
 */

import { db } from '../core/firebase.js';
import { 
    collection, getDocs, addDoc, updateDoc, deleteDoc, doc,
    query, orderBy, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

console.log('🚀 customers-ui.js تم تحميله');

// ===================== دوال مساعدة =====================

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: ${type === 'success' ? '#2ecc71' : '#e74c3c'};
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        z-index: 10001;
        font-weight: bold;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        direction: rtl;
        font-family: 'Tajawal', sans-serif;
    `;
    notification.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle'}"></i> ${message}`;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

function formatFullAddress(customer) {
    if (!customer) return '';
    const parts = [];
    if (customer.buildingNo) parts.push(`مبنى ${customer.buildingNo}`);
    if (customer.street) parts.push(`شارع ${customer.street}`);
    if (customer.district) parts.push(`حي ${customer.district}`);
    if (customer.city) parts.push(customer.city);
    if (customer.additionalNo) parts.push(`رقم إضافي ${customer.additionalNo}`);
    if (customer.poBox) parts.push(`ص.ب ${customer.poBox}`);
    if (customer.country) parts.push(customer.country);
    return parts.length > 0 ? parts.join('، ') : 'لا يوجد عنوان';
}

// ===================== جلب العملاء من Firebase =====================

async function loadCustomersFromFirebase() {
    try {
        const q = query(collection(db, "customers"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const customers = [];
        querySnapshot.forEach(doc => {
            customers.push({ id: doc.id, ...doc.data() });
        });
        return customers;
    } catch (error) {
        console.error("خطأ في جلب العملاء:", error);
        return [];
    }
}

// ===================== عرض العملاء =====================

async function renderCustomersTable() {
    const tbody = document.getElementById('customers-table-body');
    if (!tbody) return;
    
    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 40px;"><i class="fas fa-spinner fa-spin"></i> جاري تحميل العملاء...</td></tr>';
    
    const customers = await loadCustomersFromFirebase();
    
    if (!customers || customers.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 40px; color: #95a5a6;">
                    <i class="fas fa-users fa-2x" style="margin-bottom: 10px; display: block;"></i>
                    لا يوجد عملاء مسجلين حالياً
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = customers.map((customer, index) => {
        const fullAddress = formatFullAddress(customer);
        return `
            <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 12px;">${index + 1}</td>
                <td style="padding: 12px; font-weight: bold;">${escapeHtml(customer.name)}</td>
                <td style="padding: 12px; direction: ltr;">${escapeHtml(customer.phone)}</td>
                <td style="padding: 12px;">${escapeHtml(customer.email) || '-'}</td>
                <td style="padding: 12px;">${escapeHtml(customer.city) || '-'}</td>
                <td style="padding: 12px; max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${escapeHtml(fullAddress)}">
                    ${escapeHtml(fullAddress.length > 30 ? fullAddress.substring(0, 30) + '...' : fullAddress)}
                </td>
                <td style="padding: 12px; text-align: center;">
                    <button class="edit-customer-btn" data-id="${customer.id}" 
                            style="color: #f39c12; background: none; border: none; cursor: pointer; margin-left: 10px;">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="delete-customer-btn" data-id="${customer.id}" 
                            style="color: #e74c3c; background: none; border: none; cursor: pointer;">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
    
    // ربط أحداث التعديل والحذف
    document.querySelectorAll('.edit-customer-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const id = btn.dataset.id;
            const customer = customers.find(c => c.id === id);
            if (customer) showCustomerModal('edit', customer);
        });
    });
    
    document.querySelectorAll('.delete-customer-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            if (confirm('⚠️ هل أنت متأكد من حذف هذا العميل؟')) {
                const id = btn.dataset.id;
                await deleteDoc(doc(db, "customers", id));
                showNotification('تم حذف العميل بنجاح', 'success');
                await renderCustomersTable();
            }
        });
    });
}

// ===================== فتح وإغلاق المودال =====================

export function showCustomerModal(mode = 'add', customerData = null) {
    const modal = document.getElementById('customer-modal');
    if (!modal) return;
    
    const title = document.getElementById('modal-title');
    
    if (mode === 'add') {
        title.innerText = '➕ إضافة عميل جديد';
        document.getElementById('customer-form').reset();
        document.getElementById('edit-id').value = '';
    } else if (mode === 'edit' && customerData) {
        title.innerText = '✏️ تعديل بيانات العميل';
        document.getElementById('edit-id').value = customerData.id || '';
        document.getElementById('c-name').value = customerData.name || '';
        document.getElementById('c-phone').value = customerData.phone || '';
        document.getElementById('c-email').value = customerData.email || '';
        document.getElementById('c-city').value = customerData.city || '';
        document.getElementById('c-district').value = customerData.district || '';
        document.getElementById('c-street').value = customerData.street || '';
        document.getElementById('c-building').value = customerData.buildingNo || '';
        document.getElementById('c-additional').value = customerData.additionalNo || '';
        document.getElementById('c-pobox').value = customerData.poBox || '';
        document.getElementById('c-country').value = customerData.country || 'السعودية';
    }
    
    modal.style.display = 'flex';
}

export function closeCustomerModal() {
    const modal = document.getElementById('customer-modal');
    if (modal) modal.style.display = 'none';
    document.getElementById('customer-form').reset();
    document.getElementById('edit-id').value = '';
}

// ===================== حفظ العميل =====================

async function saveCustomer(e) {
    e.preventDefault();
    
    const id = document.getElementById('edit-id').value;
    const customerData = {
        name: document.getElementById('c-name').value,
        phone: document.getElementById('c-phone').value,
        email: document.getElementById('c-email').value,
        city: document.getElementById('c-city').value,
        district: document.getElementById('c-district').value,
        street: document.getElementById('c-street').value,
        buildingNo: document.getElementById('c-building').value,
        additionalNo: document.getElementById('c-additional').value,
        poBox: document.getElementById('c-pobox').value,
        country: document.getElementById('c-country').value,
        updatedAt: serverTimestamp()
    };
    
    try {
        if (id) {
            await updateDoc(doc(db, "customers", id), customerData);
            showNotification('تم تحديث بيانات العميل بنجاح', 'success');
        } else {
            customerData.createdAt = serverTimestamp();
            await addDoc(collection(db, "customers"), customerData);
            showNotification('تم إضافة العميل بنجاح', 'success');
        }
        closeCustomerModal();
        await renderCustomersTable();
    } catch (error) {
        console.error("خطأ في حفظ العميل:", error);
        showNotification('حدث خطأ في حفظ البيانات', 'error');
    }
}

// ===================== الدالة الرئيسية =====================

export async function initCustomers(container) {
    if (!container) return;
    
    container.innerHTML = `
        <div style="padding: 25px; font-family: 'Tajawal', sans-serif;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; flex-wrap: wrap; gap: 15px;">
                <div>
                    <h2 style="color: #2c3e50; margin: 0;">
                        <i class="fas fa-users" style="color: #e67e22;"></i> 
                        إدارة العملاء
                    </h2>
                    <p style="color: #7f8c8d; margin: 5px 0 0 0;">إدارة بيانات العملاء والعناوين</p>
                </div>
                <button id="add-customer-btn" style="background: #e67e22; color: white; border: none; padding: 10px 24px; border-radius: 10px; cursor: pointer; font-weight: bold;">
                    <i class="fas fa-user-plus"></i> إضافة عميل جديد
                </button>
            </div>
            
            <div style="margin-bottom: 20px;">
                <input type="text" id="search-customers" placeholder="بحث عن عميل..." 
                       style="width: 100%; max-width: 300px; padding: 10px; border: 1px solid #ddd; border-radius: 8px;">
            </div>
            
            <div style="background: white; border-radius: 15px; overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; min-width: 800px;">
                    <thead style="background: #f8f9fa;">
                        <tr>
                            <th style="padding: 15px;">#</th>
                            <th style="padding: 15px;">الاسم</th>
                            <th style="padding: 15px;">الجوال</th>
                            <th style="padding: 15px;">البريد</th>
                            <th style="padding: 15px;">المدينة</th>
                            <th style="padding: 15px;">العنوان</th>
                            <th style="padding: 15px;">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody id="customers-table-body">
                        <tr><td colspan="7" style="text-align: center; padding: 40px;"><i class="fas fa-spinner fa-spin"></i> جاري تحميل العملاء...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
        
        <div id="customer-modal" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 1000; justify-content: center; align-items: center;">
            <div style="background: white; width: 90%; max-width: 650px; padding: 25px; border-radius: 16px; max-height: 90vh; overflow-y: auto;">
                <h3 id="modal-title" style="margin: 0 0 20px 0;">إضافة عميل جديد</h3>
                <form id="customer-form">
                    <input type="hidden" id="edit-id">
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; margin-bottom: 15px;">
                        <div>
                            <label>الاسم الكامل *</label>
                            <input type="text" id="c-name" required style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 8px;">
                        </div>
                        <div>
                            <label>رقم الجوال *</label>
                            <input type="tel" id="c-phone" required style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 8px;">
                        </div>
                        <div>
                            <label>البريد الإلكتروني</label>
                            <input type="email" id="c-email" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 8px;">
                        </div>
                    </div>
                    
                    <h4 style="color: #e67e22; margin: 15px 0 10px 0;">العنوان الوطني</h4>
                    
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 15px;">
                        <div>
                            <label>الدولة</label>
                            <input type="text" id="c-country" value="السعودية" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 8px;">
                        </div>
                        <div>
                            <label>المدينة</label>
                            <input type="text" id="c-city" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 8px;">
                        </div>
                        <div>
                            <label>الحي</label>
                            <input type="text" id="c-district" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 8px;">
                        </div>
                        <div>
                            <label>الشارع</label>
                            <input type="text" id="c-street" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 8px;">
                        </div>
                        <div>
                            <label>رقم المبنى</label>
                            <input type="text" id="c-building" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 8px;">
                        </div>
                        <div>
                            <label>الرقم الإضافي</label>
                            <input type="text" id="c-additional" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 8px;">
                        </div>
                        <div>
                            <label>الرمز البريدي</label>
                            <input type="text" id="c-pobox" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 8px;">
                        </div>
                    </div>
                    
                    <div style="display: flex; gap: 15px;">
                        <button type="submit" style="flex: 2; background: #27ae60; color: white; border: none; padding: 12px; border-radius: 10px; cursor: pointer;">حفظ</button>
                        <button type="button" id="close-customer-modal" style="flex: 1; background: #95a5a6; color: white; border: none; padding: 12px; border-radius: 10px; cursor: pointer;">إلغاء</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    // ربط الأحداث
    document.getElementById('add-customer-btn').addEventListener('click', () => showCustomerModal());
    document.getElementById('close-customer-modal').addEventListener('click', () => closeCustomerModal());
    document.getElementById('customer-form').addEventListener('submit', saveCustomer);
    
    // تحميل العملاء
    await renderCustomersTable();
    
    // البحث
    document.getElementById('search-customers').addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const rows = document.querySelectorAll('#customers-table-body tr');
        rows.forEach(row => {
            const name = row.querySelector('td:nth-child(2)')?.innerText.toLowerCase() || '';
            const phone = row.querySelector('td:nth-child(3)')?.innerText.toLowerCase() || '';
            row.style.display = (name.includes(term) || phone.includes(term)) ? '' : 'none';
        });
    });
}

export default { initCustomers, showCustomerModal, closeCustomerModal };
