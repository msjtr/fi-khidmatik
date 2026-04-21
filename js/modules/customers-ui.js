/**
 * js/modules/customers-ui.js
 * موديول العملاء - نسخة كاملة مع جميع الوظائف
 */

import { db } from '../core/firebase.js';
import { 
    collection, getDocs, addDoc, updateDoc, deleteDoc, doc,
    query, orderBy, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

console.log('✅ customers-ui.js تم تحميله');

// ===================== دوال مساعدة =====================

function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>]/g, function(m) {
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
        font-family: 'Tajawal', sans-serif;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        direction: rtl;
    `;
    notification.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle'}"></i> ${message}`;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

// ===================== جلب العملاء =====================

async function loadCustomers() {
    try {
        const q = query(collection(db, "customers"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        const customers = [];
        snapshot.forEach(doc => {
            customers.push({ id: doc.id, ...doc.data() });
        });
        return customers;
    } catch (error) {
        console.error('خطأ في جلب العملاء:', error);
        return [];
    }
}

// ===================== عرض العملاء في جدول =====================

async function renderCustomersTable() {
    const tbody = document.getElementById('customers-table-body');
    if (!tbody) return;
    
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:40px;"><i class="fas fa-spinner fa-spin"></i> جاري التحميل...</td></tr>';
    
    const customers = await loadCustomers();
    
    if (customers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:40px;">لا يوجد عملاء مسجلين</td></tr>';
        return;
    }
    
    let html = '';
    customers.forEach((customer, index) => {
        html += `
            <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 12px;">${index + 1}</td>
                <td style="padding: 12px; font-weight: bold;">${escapeHtml(customer.name)}</td>
                <td style="padding: 12px; direction: ltr;">${escapeHtml(customer.phone)}</td>
                <td style="padding: 12px;">${escapeHtml(customer.email) || '-'}</td>
                <td style="padding: 12px;">${escapeHtml(customer.city) || '-'}</td>
                <td style="padding: 12px;">${escapeHtml(customer.district) || '-'}</td>
                <td style="padding: 12px;">${escapeHtml(customer.street) || '-'}</td>
                <td style="padding: 12px; text-align: center;">
                    <button class="edit-customer-btn" data-id="${customer.id}" style="background: #f39c12; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer; margin-left: 5px;">
                        <i class="fas fa-edit"></i> تعديل
                    </button>
                    <button class="delete-customer-btn" data-id="${customer.id}" style="background: #e74c3c; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer;">
                        <i class="fas fa-trash-alt"></i> حذف
                    </button>
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
    
    // ربط أحداث التعديل والحذف
    document.querySelectorAll('.edit-customer-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const id = btn.dataset.id;
            const customer = customers.find(c => c.id === id);
            if (customer) openEditModal(customer);
        });
    });
    
    document.querySelectorAll('.delete-customer-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            if (confirm('⚠️ هل أنت متأكد من حذف هذا العميل؟')) {
                await deleteDoc(doc(db, "customers", btn.dataset.id));
                showNotification('تم حذف العميل بنجاح', 'success');
                await renderCustomersTable();
            }
        });
    });
}

// ===================== فتح نافذة إضافة عميل =====================

function openAddModal() {
    const modal = document.getElementById('customer-modal');
    const title = document.getElementById('modal-title');
    const form = document.getElementById('customer-form');
    
    title.innerText = '➕ إضافة عميل جديد';
    form.reset();
    document.getElementById('edit-id').value = '';
    modal.style.display = 'flex';
}

// ===================== فتح نافذة تعديل عميل =====================

function openEditModal(customer) {
    const modal = document.getElementById('customer-modal');
    const title = document.getElementById('modal-title');
    
    title.innerText = '✏️ تعديل بيانات العميل';
    document.getElementById('edit-id').value = customer.id;
    document.getElementById('c-name').value = customer.name || '';
    document.getElementById('c-phone').value = customer.phone || '';
    document.getElementById('c-email').value = customer.email || '';
    document.getElementById('c-city').value = customer.city || '';
    document.getElementById('c-district').value = customer.district || '';
    document.getElementById('c-street').value = customer.street || '';
    document.getElementById('c-building').value = customer.buildingNo || '';
    document.getElementById('c-additional').value = customer.additionalNo || '';
    document.getElementById('c-pobox').value = customer.poBox || '';
    document.getElementById('c-country').value = customer.country || 'السعودية';
    
    modal.style.display = 'flex';
}

// ===================== إغلاق المودال =====================

function closeModal() {
    const modal = document.getElementById('customer-modal');
    modal.style.display = 'none';
    document.getElementById('customer-form').reset();
    document.getElementById('edit-id').value = '';
}

// ===================== حفظ العميل (إضافة أو تعديل) =====================

async function saveCustomer(event) {
    event.preventDefault();
    
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
            showNotification('تم تحديث العميل بنجاح', 'success');
        } else {
            customerData.createdAt = serverTimestamp();
            await addDoc(collection(db, "customers"), customerData);
            showNotification('تم إضافة العميل بنجاح', 'success');
        }
        closeModal();
        await renderCustomersTable();
    } catch (error) {
        console.error('خطأ في حفظ العميل:', error);
        showNotification('حدث خطأ في حفظ البيانات', 'error');
    }
}

// ===================== الدالة الرئيسية =====================

export async function initCustomers(container) {
    console.log('🚀 initCustomers تم استدعاؤها');
    
    if (!container) return;
    
    container.innerHTML = `
        <div style="padding: 25px; font-family: 'Tajawal', sans-serif;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; flex-wrap: wrap; gap: 15px;">
                <div>
                    <h2 style="color: #2c3e50; margin: 0;">
                        <i class="fas fa-users" style="color: #e67e22;"></i> 
                        إدارة العملاء
                    </h2>
                    <p style="color: #7f8c8d; margin: 5px 0 0;">إدارة بيانات العملاء والعناوين</p>
                </div>
                <button id="add-customer-btn" style="background: #e67e22; color: white; border: none; padding: 10px 24px; border-radius: 10px; cursor: pointer; font-weight: bold;">
                    <i class="fas fa-user-plus"></i> إضافة عميل جديد
                </button>
            </div>
            
            <div style="margin-bottom: 20px;">
                <input type="text" id="search-customers" placeholder="بحث عن عميل..." 
                       style="width: 100%; max-width: 300px; padding: 10px; border: 1px solid #ddd; border-radius: 8px;">
            </div>
            
            <div style="overflow-x: auto; background: white; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                <table style="width: 100%; border-collapse: collapse; min-width: 800px;">
                    <thead style="background: #f8f9fa; border-bottom: 2px solid #e9ecef;">
                        <tr>
                            <th style="padding: 12px;">#</th>
                            <th style="padding: 12px;">الاسم</th>
                            <th style="padding: 12px;">الجوال</th>
                            <th style="padding: 12px;">البريد</th>
                            <th style="padding: 12px;">المدينة</th>
                            <th style="padding: 12px;">الحي</th>
                            <th style="padding: 12px;">الشارع</th>
                            <th style="padding: 12px;">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody id="customers-table-body">
                        <tr><td colspan="8" style="text-align:center;padding:40px;"><i class="fas fa-spinner fa-spin"></i> جاري التحميل...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
        
        <!-- مودال إضافة/تعديل عميل -->
        <div id="customer-modal" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 1000; justify-content: center; align-items: center;">
            <div style="background: white; width: 90%; max-width: 700px; padding: 25px; border-radius: 16px; max-height: 90vh; overflow-y: auto;">
                <h3 id="modal-title" style="margin: 0 0 20px 0;">إضافة عميل جديد</h3>
                <form id="customer-form">
                    <input type="hidden" id="edit-id">
                    
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; margin-bottom: 15px;">
                        <div>
                            <label>الاسم الكامل *</label>
                            <input type="text" id="c-name" required style="width:100%; padding:10px; border:1px solid #ddd; border-radius:8px;">
                        </div>
                        <div>
                            <label>رقم الجوال *</label>
                            <input type="tel" id="c-phone" required style="width:100%; padding:10px; border:1px solid #ddd; border-radius:8px;">
                        </div>
                        <div>
                            <label>البريد الإلكتروني</label>
                            <input type="email" id="c-email" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:8px;">
                        </div>
                    </div>
                    
                    <h4 style="color:#e67e22; margin:15px 0 10px;">العنوان الوطني</h4>
                    
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 15px;">
                        <div>
                            <label>الدولة</label>
                            <input type="text" id="c-country" value="السعودية" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:8px;">
                        </div>
                        <div>
                            <label>المدينة</label>
                            <input type="text" id="c-city" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:8px;">
                        </div>
                        <div>
                            <label>الحي</label>
                            <input type="text" id="c-district" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:8px;">
                        </div>
                        <div>
                            <label>الشارع</label>
                            <input type="text" id="c-street" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:8px;">
                        </div>
                        <div>
                            <label>رقم المبنى</label>
                            <input type="text" id="c-building" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:8px;">
                        </div>
                        <div>
                            <label>الرقم الإضافي</label>
                            <input type="text" id="c-additional" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:8px;">
                        </div>
                        <div>
                            <label>الرمز البريدي</label>
                            <input type="text" id="c-pobox" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:8px;">
                        </div>
                    </div>
                    
                    <div style="display: flex; gap: 15px; margin-top: 20px;">
                        <button type="submit" style="flex:2; background:#27ae60; color:white; padding:12px; border:none; border-radius:10px; cursor:pointer;">💾 حفظ</button>
                        <button type="button" id="close-modal-btn" style="flex:1; background:#95a5a6; color:white; padding:12px; border:none; border-radius:10px; cursor:pointer;">❌ إلغاء</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    // عرض العملاء
    await renderCustomersTable();
    
    // ربط الأحداث
    document.getElementById('add-customer-btn').addEventListener('click', openAddModal);
    document.getElementById('close-modal-btn').addEventListener('click', closeModal);
    document.getElementById('customer-form').addEventListener('submit', saveCustomer);
    
    // إغلاق المودال عند النقر خارج المحتوى
    document.getElementById('customer-modal').addEventListener('click', (e) => {
        if (e.target === document.getElementById('customer-modal')) closeModal();
    });
    
    // البحث
    document.getElementById('search-customers').addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const rows = document.querySelectorAll('#customers-table-body tr');
        rows.forEach(row => {
            const text = row.innerText.toLowerCase();
            row.style.display = text.includes(term) ? '' : 'none';
        });
    });
}
