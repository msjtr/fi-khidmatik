/**
 * js/modules/orders-dashboard.js
 * موديول لوحة الطلبات والفواتير - تيرا جيتواي
 * @version 2.3.0
 */

import { db } from '../core/firebase.js';
import { 
    collection, getDocs, addDoc, doc, updateDoc, deleteDoc, 
    query, orderBy, serverTimestamp, getDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ===================== دوال مساعدة =====================

/**
 * منع هجمات XSS
 */
function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

/**
 * عرض إشعار منبثق
 */
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

/**
 * تنسيق العنوان الكامل من بيانات العميل
 */
function formatFullAddress(customer) {
    const parts = [];
    if (customer?.buildingNo) parts.push(`مبنى ${customer.buildingNo}`);
    if (customer?.street) parts.push(`شارع ${customer.street}`);
    if (customer?.district) parts.push(`حي ${customer.district}`);
    if (customer?.city) parts.push(customer.city);
    if (customer?.poBox) parts.push(`ص.ب ${customer.poBox}`);
    if (customer?.country) parts.push(customer.country);
    return parts.length > 0 ? parts.join('، ') : '';
}

/**
 * تنسيق العملة
 */
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount) + ' ر.س';
}

/**
 * إنشاء رقم طلب فريد
 */
function generateOrderNumber() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `INV-${year}${month}${day}-${random}`;
}

/**
 * التحقق من صحة الطلب
 */
function validateOrder(order) {
    const errors = [];
    
    if (!order.customerName || order.customerName.trim().length < 3) {
        errors.push('اسم العميل مطلوب (3 أحرف على الأقل)');
    }
    
    if (!order.phone || !/^(05|5)[0-9]{8}$/.test(order.phone.replace(/\s/g, ''))) {
        errors.push('رقم الجوال غير صحيح (يجب أن يبدأ بـ 05)');
    }
    
    if (!order.items || order.items.length === 0) {
        errors.push('يجب إضافة منتج واحد على الأقل');
    }
    
    order.items?.forEach((item, index) => {
        if (!item.name || item.name.trim() === '') {
            errors.push(`المنتج رقم ${index + 1}: اسم المنتج مطلوب`);
        }
        if (item.quantity <= 0) {
            errors.push(`المنتج ${item.name || index + 1}: الكمية يجب أن تكون أكبر من صفر`);
        }
        if (item.price < 0) {
            errors.push(`المنتج ${item.name || index + 1}: السعر لا يمكن أن يكون سالباً`);
        }
    });
    
    return errors;
}

// ===================== حساب الإجماليات =====================

function calculateTotals() {
    let subtotal = 0;
    
    document.querySelectorAll('#items-body tr').forEach(row => {
        const qty = parseFloat(row.querySelector('.p-qty')?.value) || 0;
        const price = parseFloat(row.querySelector('.p-price')?.value) || 0;
        const rowTotal = qty * price;
        
        const rowTotalEl = row.querySelector('.p-row-total');
        if (rowTotalEl) rowTotalEl.textContent = rowTotal.toFixed(2);
        subtotal += rowTotal;
    });
    
    const tax = subtotal * 0.15;
    const total = subtotal + tax;
    
    const subtotalEl = document.getElementById('val-subtotal');
    const taxEl = document.getElementById('val-tax');
    const totalEl = document.getElementById('val-total');
    
    if (subtotalEl) subtotalEl.textContent = subtotal.toFixed(2);
    if (taxEl) taxEl.textContent = tax.toFixed(2);
    if (totalEl) totalEl.textContent = total.toFixed(2);
    
    return { subtotal, tax, total };
}

// ===================== إدارة بنود المنتجات =====================

function addItemRow(itemData = null) {
    const tbody = document.getElementById('items-body');
    if (!tbody) return;
    
    const row = document.createElement('tr');
    row.style.borderBottom = "1px solid #f1f2f6";
    
    const name = itemData?.name || '';
    const quantity = itemData?.quantity || 1;
    const price = itemData?.price || 0;
    
    row.innerHTML = `
        <td style="padding:10px;">
            <input type="text" class="p-name" value="${escapeHtml(name)}" 
                   placeholder="اسم المنتج/الخدمة" 
                   style="width:100%; padding:8px; border:1px solid #ddd; border-radius:5px;">
        </td>
        <td style="padding:10px;">
            <input type="number" class="p-qty" value="${quantity}" min="0.01" step="0.01"
                   style="width:100%; padding:8px; border:1px solid #ddd; border-radius:5px; text-align:center;">
        </td>
        <td style="padding:10px;">
            <input type="number" class="p-price" value="${price}" min="0" step="0.01"
                   style="width:100%; padding:8px; border:1px solid #ddd; border-radius:5px; text-align:center;">
        </td>
        <td style="padding:10px; text-align:center; font-weight:bold; color:#34495e;" class="p-row-total">
            ${(quantity * price).toFixed(2)}
        </td>
        <td style="padding:10px; text-align:center;">
            <button type="button" class="del-row-btn" style="background:none; border:none; color:#e74c3c; cursor:pointer; font-size:1.2rem;">
                <i class="fas fa-trash-alt"></i>
            </button>
        </td>
    `;
    
    const inputs = row.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('input', () => calculateTotals());
    });
    
    const deleteBtn = row.querySelector('.del-row-btn');
    deleteBtn.addEventListener('click', () => {
        if (document.querySelectorAll('#items-body tr').length > 1) {
            row.remove();
            calculateTotals();
        } else {
            showNotification('لا يمكن حذف جميع البنود', 'error');
        }
    });
    
    tbody.appendChild(row);
    calculateTotals();
}

function collectItems() {
    const items = [];
    document.querySelectorAll('#items-body tr').forEach(row => {
        const name = row.querySelector('.p-name')?.value?.trim();
        if (name) {
            items.push({
                name: name,
                quantity: parseFloat(row.querySelector('.p-qty')?.value) || 0,
                price: parseFloat(row.querySelector('.p-price')?.value) || 0
            });
        }
    });
    return items;
}

// ===================== تحميل البيانات =====================

/**
 * تحميل خيارات العملاء في القائمة المنسدلة (مع جميع بيانات العميل)
 */
async function loadCustomerOptions() {
    const sel = document.getElementById('sel-customer');
    if (!sel) return;
    
    try {
        const snap = await getDocs(collection(db, "customers"));
        sel.innerHTML = '<option value="">-- اختيار عميل من القاعدة أو إضافة جديد --</option>';
        
        snap.forEach(doc => {
            const c = doc.data();
            // تخزين جميع بيانات العميل كاملة (name, phone, email, city, district, street, buildingNo, additionalNo, poBox, country)
            const customerData = {
                id: doc.id,
                name: c.name || '',
                phone: c.phone || '',
                email: c.email || '',
                city: c.city || '',
                district: c.district || '',
                street: c.street || '',
                buildingNo: c.buildingNo || '',
                additionalNo: c.additionalNo || '',
                poBox: c.poBox || '',
                country: c.country || 'السعودية'
            };
            
            const option = document.createElement('option');
            option.value = doc.id;
            option.textContent = `${customerData.name} (${customerData.phone})`;
            option.dataset.customer = JSON.stringify(customerData);
            sel.appendChild(option);
        });
        
        // ربط حدث تغيير العميل
        sel.addEventListener('change', (e) => {
            const selected = e.target.options[e.target.selectedIndex];
            if (!selected.value) {
                clearCustomerFields();
                return;
            }
            try {
                const customer = JSON.parse(selected.dataset.customer);
                fillCustomerData(customer);
            } catch (err) {
                console.error("Error parsing customer data:", err);
            }
        });
    } catch (error) {
        console.error("Error loading customers:", error);
        showNotification('فشل تحميل قائمة العملاء', 'error');
    }
}

/**
 * تنظيف حقول بيانات العميل
 */
function clearCustomerFields() {
    document.getElementById('c-name').value = '';
    document.getElementById('c-phone').value = '';
    document.getElementById('c-email').value = '';
    document.getElementById('c-address').value = '';
}

/**
 * تعبئة بيانات العميل في النموذج (مع Fallback)
 * @param {Object} customer - بيانات العميل من قاعدة البيانات (كاملة)
 * @param {Object} existingOrder - بيانات الطلب الحالي (في حالة التعديل)
 */
function fillCustomerData(customer, existingOrder = null) {
    // تطبيق Fallback: استخدم بيانات الطلب إذا موجودة، وإلا استخدم بيانات العميل
    const nameField = document.getElementById('c-name');
    const phoneField = document.getElementById('c-phone');
    const emailField = document.getElementById('c-email');
    const addressField = document.getElementById('c-address');
    
    if (nameField) {
        nameField.value = (existingOrder?.customerName) || customer?.name || '';
    }
    if (phoneField) {
        phoneField.value = (existingOrder?.phone) || customer?.phone || '';
    }
    if (emailField) {
        emailField.value = (existingOrder?.email) || customer?.email || '';
    }
    
    // تنسيق العنوان من بيانات العميل (وليس من shippingAddress)
    const fullAddress = formatFullAddress(customer);
    if (addressField) {
        addressField.value = (existingOrder?.address) || fullAddress;
    }
}

// ===================== تحميل وعرض الطلبات =====================

async function loadOrders() {
    const list = document.getElementById('orders-list');
    if (!list) return;
    
    list.innerHTML = `
        <div style="grid-column:1/-1; text-align:center; padding:50px;">
            <i class="fas fa-spinner fa-spin fa-2x" style="color:#3498db;"></i>
            <p>جاري تحميل الفواتير...</p>
        </div>
    `;
    
    try {
        const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        
        if (snap.empty) {
            list.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:40px; color:#95a5a6;">
                <i class="fas fa-file-invoice fa-3x" style="margin-bottom:10px; display:block;"></i>
                لا توجد طلبات مسجلة حالياً.
                <button id="create-demo-order" style="display:block; margin:20px auto; background:#e67e22; color:white; border:none; padding:10px 20px; border-radius:8px; cursor:pointer;">
                    <i class="fas fa-plus"></i> إنشاء طلب تجريبي
                </button>
            </div>`;
            
            const demoBtn = document.getElementById('create-demo-order');
            if (demoBtn) {
                demoBtn.addEventListener('click', () => {
                    document.getElementById('btn-create-order')?.click();
                });
            }
            return;
        }
        
        list.innerHTML = snap.docs.map(doc => {
            const order = doc.data();
            const date = order.createdAt?.toDate?.() 
                ? order.createdAt.toDate().toLocaleDateString('ar-SA') 
                : '---';
            
            const status = order.status || 'pending';
            const statusColors = {
                paid: { bg: '#d4edda', color: '#155724', text: 'مدفوع' },
                pending: { bg: '#fff3cd', color: '#856404', text: 'قيد الانتظار' },
                overdue: { bg: '#f8d7da', color: '#721c24', text: 'متأخر' }
            };
            const statusStyle = statusColors[status] || statusColors.pending;
            
            return `
                <div class="order-card" data-id="${doc.id}" data-status="${status}" style="background:white; padding:20px; border-radius:15px; box-shadow:0 4px 15px rgba(0,0,0,0.05); border-right:6px solid #3498db; transition:0.3s;">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:15px;">
                        <div>
                            <span class="order-number" style="background:#e3f2fd; color:#1976d2; padding:4px 10px; border-radius:6px; font-size:0.8rem; font-weight:bold;">
                                ${escapeHtml(order.orderNumber || '---')}
                            </span>
                            <div style="font-size:0.75rem; color:#95a5a6; margin-top:5px;">
                                <i class="far fa-calendar-alt"></i> ${date}
                            </div>
                        </div>
                        <div style="display:flex; gap:8px;">
                            <button class="edit-order-btn" data-id="${doc.id}" 
                                    style="color:#f39c12; background:#fff9f0; border:1px solid #ffeeba; width:35px; height:35px; border-radius:8px; cursor:pointer; transition:0.3s;">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="delete-order-btn" data-id="${doc.id}" 
                                    style="color:#e74c3c; background:#fff5f5; border:1px solid #fab1a0; width:35px; height:35px; border-radius:8px; cursor:pointer; transition:0.3s;">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
                    </div>
                    <h4 class="customer-name" style="margin:0 0 10px 0; color:#2c3e50;">${escapeHtml(order.customerName)}</h4>
                    <div style="font-size:0.8rem; color:#7f8c8d; margin-bottom:10px;">
                        <i class="fas fa-phone"></i> ${escapeHtml(order.phone)}
                    </div>
                    ${order.address ? `<div style="font-size:0.75rem; color:#95a5a6; margin-bottom:10px;"><i class="fas fa-location-dot"></i> ${escapeHtml(order.address)}</div>` : ''}
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-top:15px; padding-top:15px; border-top:1px solid #f1f2f6;">
                        <div>
                            <div style="color:#27ae60; font-size:1.2rem; font-weight:800;">
                                ${order.total?.toFixed(2) || '0.00'} <small style="font-size:0.7rem;">ريال</small>
                            </div>
                            <span style="display:inline-block; margin-top:5px; padding:2px 8px; border-radius:12px; font-size:0.7rem; background:${statusStyle.bg}; color:${statusStyle.color};">
                                ${statusStyle.text}
                            </span>
                        </div>
                        <div style="display:flex; gap:8px;">
                            <button class="print-order-btn" data-id="${doc.id}" 
                                    style="background:#34495e; color:white; border:none; padding:8px 15px; border-radius:6px; cursor:pointer; font-size:0.85rem; transition:0.3s;">
                                <i class="fas fa-print"></i> طباعة
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        attachOrderEvents();
        await calculateTotalStats();
        
    } catch (error) {
        console.error("Error loading orders:", error);
        list.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:40px; color:#e74c3c;">
            <i class="fas fa-exclamation-triangle fa-2x"></i>
            <p>حدث خطأ في تحميل البيانات: ${error.message}</p>
            <button onclick="location.reload()" style="margin-top:15px; padding:8px 20px; background:#e67e22; color:white; border:none; border-radius:8px; cursor:pointer;">
                <i class="fas fa-sync-alt"></i> إعادة المحاولة
            </button>
        </div>`;
        showNotification('فشل تحميل قائمة الطلبات', 'error');
    }
}

async function calculateTotalStats() {
    try {
        const snap = await getDocs(collection(db, "orders"));
        let totalAmount = 0;
        let totalOrders = 0;
        let paidOrders = 0;
        let pendingOrders = 0;
        let overdueOrders = 0;
        
        snap.forEach(doc => {
            const order = doc.data();
            totalAmount += order.total || 0;
            totalOrders++;
            
            const status = order.status || 'pending';
            if (status === 'paid') paidOrders++;
            else if (status === 'pending') pendingOrders++;
            else if (status === 'overdue') overdueOrders++;
        });
        
        const statsContainer = document.getElementById('orders-stats');
        if (statsContainer) {
            statsContainer.innerHTML = `
                <div style="display: flex; gap: 15px; justify-content: center; margin-bottom: 20px; flex-wrap: wrap;">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 15px 20px; border-radius: 12px; color: white; text-align: center; min-width: 120px;">
                        <div style="font-size: 1.5rem; font-weight: bold;">${totalOrders}</div>
                        <div style="font-size: 0.7rem;">إجمالي الطلبات</div>
                    </div>
                    <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 15px 20px; border-radius: 12px; color: white; text-align: center; min-width: 120px;">
                        <div style="font-size: 1.5rem; font-weight: bold;">${formatCurrency(totalAmount)}</div>
                        <div style="font-size: 0.7rem;">إجمالي المبيعات</div>
                    </div>
                    <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 15px 20px; border-radius: 12px; color: white; text-align: center; min-width: 120px;">
                        <div style="font-size: 1.5rem; font-weight: bold;">${paidOrders}</div>
                        <div style="font-size: 0.7rem;">مدفوعة</div>
                    </div>
                    <div style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); padding: 15px 20px; border-radius: 12px; color: white; text-align: center; min-width: 120px;">
                        <div style="font-size: 1.5rem; font-weight: bold;">${pendingOrders}</div>
                        <div style="font-size: 0.7rem;">معلقة</div>
                    </div>
                    <div style="background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); padding: 15px 20px; border-radius: 12px; color: white; text-align: center; min-width: 120px;">
                        <div style="font-size: 1.5rem; font-weight: bold;">${overdueOrders}</div>
                        <div style="font-size: 0.7rem;">متأخرة</div>
                    </div>
                </div>
            `;
        }
    } catch (error) {
        console.error("Error calculating stats:", error);
    }
}

function attachOrderEvents() {
    document.querySelectorAll('.edit-order-btn').forEach(btn => {
        btn.removeEventListener('click', btn._editHandler);
        const handler = () => editOrder(btn.dataset.id);
        btn.addEventListener('click', handler);
        btn._editHandler = handler;
    });
    
    document.querySelectorAll('.delete-order-btn').forEach(btn => {
        btn.removeEventListener('click', btn._deleteHandler);
        const handler = () => deleteOrder(btn.dataset.id);
        btn.addEventListener('click', handler);
        btn._deleteHandler = handler;
    });
    
    document.querySelectorAll('.print-order-btn').forEach(btn => {
        btn.removeEventListener('click', btn._printHandler);
        const handler = () => printInvoice(btn.dataset.id);
        btn.addEventListener('click', handler);
        btn._printHandler = handler;
    });
}

// ===================== عمليات CRUD =====================

async function saveOrder(orderData, id = null) {
    const submitBtn = document.querySelector('#order-form button[type="submit"]');
    const originalText = submitBtn?.innerHTML;
    
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الحفظ...';
    }
    
    try {
        const data = {
            customerName: orderData.customerName,
            phone: orderData.phone,
            email: orderData.email || '',
            address: orderData.address || '',
            items: orderData.items,
            subtotal: orderData.subtotal,
            tax: orderData.tax,
            total: orderData.total,
            updatedAt: serverTimestamp()
        };
        
        if (id) {
            await updateDoc(doc(db, "orders", id), data);
            showNotification('تم تحديث الفاتورة بنجاح', 'success');
        } else {
            data.createdAt = serverTimestamp();
            data.orderNumber = generateOrderNumber();
            data.status = 'pending';
            await addDoc(collection(db, "orders"), data);
            showNotification('تم إنشاء الفاتورة بنجاح', 'success');
        }
        
        closeOrderModal();
        await loadOrders();
        await calculateTotalStats();
        
    } catch (error) {
        console.error("Error saving order:", error);
        showNotification('حدث خطأ أثناء الحفظ: ' + error.message, 'error');
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    }
}

async function editOrder(id) {
    if (!id) return;
    
    try {
        const snap = await getDoc(doc(db, "orders", id));
        if (!snap.exists()) {
            showNotification('الطلب غير موجود', 'error');
            return;
        }
        
        const order = snap.data();
        
        // تعبئة الحقول الأساسية من الطلب
        document.getElementById('edit-id').value = id;
        document.getElementById('c-name').value = order.customerName || '';
        document.getElementById('c-phone').value = order.phone || '';
        document.getElementById('c-email').value = order.email || '';
        document.getElementById('c-address').value = order.address || '';
        
        // إذا كان هناك customerId في الطلب، جلب بيانات العميل الكاملة لتطبيق fallback
        if (order.customerId) {
            try {
                const customerSnap = await getDoc(doc(db, "customers", order.customerId));
                if (customerSnap.exists()) {
                    const customer = customerSnap.data();
                    
                    // تطبيق fallback: إذا كانت بيانات الطلب ناقصة، أكملها من بيانات العميل
                    if (!order.customerName && customer.name) {
                        document.getElementById('c-name').value = customer.name;
                    }
                    if (!order.phone && customer.phone) {
                        document.getElementById('c-phone').value = customer.phone;
                    }
                    if (!order.email && customer.email) {
                        document.getElementById('c-email').value = customer.email;
                    }
                    if (!order.address && (customer.city || customer.district)) {
                        document.getElementById('c-address').value = formatFullAddress(customer);
                    }
                }
            } catch (err) {
                console.warn("Could not fetch customer data for fallback:", err);
            }
        }
        
        // تنظيف وإضافة بنود المنتجات
        const itemsBody = document.getElementById('items-body');
        if (itemsBody) itemsBody.innerHTML = '';
        
        if (order.items && order.items.length > 0) {
            order.items.forEach(item => addItemRow(item));
        } else {
            addItemRow();
        }
        
        const titleEl = document.getElementById('modal-title');
        if (titleEl) titleEl.innerText = `✏️ تعديل الفاتورة: ${order.orderNumber || ''}`;
        
        const modal = document.getElementById('order-modal');
        if (modal) modal.style.display = 'block';
        
    } catch (error) {
        console.error("Error loading order for edit:", error);
        showNotification('حدث خطأ في تحميل بيانات الطلب', 'error');
    }
}

async function deleteOrder(id) {
    if (!confirm("⚠️ هل أنت متأكد من حذف هذه الفاتورة؟\nلا يمكن التراجع عن هذا الإجراء.")) {
        return;
    }
    
    const card = document.querySelector(`.order-card[data-id="${id}"]`);
    if (card) {
        card.style.opacity = '0.5';
        card.style.transition = 'opacity 0.3s';
    }
    
    try {
        await deleteDoc(doc(db, "orders", id));
        showNotification('تم حذف الفاتورة بنجاح', 'success');
        await loadOrders();
        await calculateTotalStats();
    } catch (error) {
        console.error("Error deleting order:", error);
        showNotification('حدث خطأ أثناء الحذف: ' + error.message, 'error');
        await loadOrders();
    }
}

async function printInvoice(id) {
    try {
        const snap = await getDoc(doc(db, "orders", id));
        if (!snap.exists()) {
            showNotification('الطلب غير موجود', 'error');
            return;
        }
        
        const order = snap.data();
        const printWindow = window.open('', '_blank', 'width=800,height=600');
        
        if (!printWindow) {
            showNotification('الرجاء السماح بالنوافذ المنبثقة', 'error');
            return;
        }
        
        const itemsHtml = order.items.map(item => `
            <tr>
                <td style="padding:8px; border-bottom:1px solid #eee;">${escapeHtml(item.name)}</td>
                <td style="padding:8px; border-bottom:1px solid #eee; text-align:center;">${item.quantity}</td>
                <td style="padding:8px; border-bottom:1px solid #eee; text-align:center;">${item.price.toFixed(2)}</td>
                <td style="padding:8px; border-bottom:1px solid #eee; text-align:center;">${(item.quantity * item.price).toFixed(2)}</td>
            </tr>
        `).join('');
        
        const date = new Date().toLocaleDateString('ar-SA');
        
        printWindow.document.write(`
            <!DOCTYPE html>
            <html dir="rtl">
            <head>
                <meta charset="UTF-8">
                <title>فاتورة ${order.orderNumber}</title>
                <style>
                    body { font-family: 'Tajawal', Arial, sans-serif; margin: 0; padding: 20px; background: white; }
                    .invoice-container { max-width: 800px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; border-radius: 10px; }
                    .header { text-align: center; border-bottom: 2px solid #3498db; padding-bottom: 15px; margin-bottom: 20px; }
                    .info { margin-bottom: 20px; padding: 10px; background: #f8f9fa; border-radius: 8px; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                    th { background: #34495e; color: white; padding: 10px; text-align: center; }
                    td { padding: 8px; }
                    .totals { text-align: left; margin-top: 20px; padding-top: 10px; border-top: 2px solid #ddd; }
                    .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #95a5a6; }
                </style>
            </head>
            <body>
                <div class="invoice-container">
                    <div class="header">
                        <h2 style="color:#3498db; margin:0;">تيرا جيتواي</h2>
                        <p>فاتورة رقم: ${order.orderNumber}</p>
                    </div>
                    <div class="info">
                        <p><strong>العميل:</strong> ${escapeHtml(order.customerName)}</p>
                        <p><strong>الجوال:</strong> ${escapeHtml(order.phone)}</p>
                        ${order.email ? `<p><strong>البريد:</strong> ${escapeHtml(order.email)}</p>` : ''}
                        ${order.address ? `<p><strong>العنوان:</strong> ${escapeHtml(order.address)}</p>` : ''}
                        <p><strong>التاريخ:</strong> ${date}</p>
                    </div>
                    <table>
                        <thead><tr><th>المنتج</th><th>الكمية</th><th>السعر</th><th>الإجمالي</th></tr></thead>
                        <tbody>${itemsHtml}</tbody>
                    </table>
                    <div class="totals">
                        <p><strong>المجموع الفرعي:</strong> ${order.subtotal?.toFixed(2) || '0.00'} ريال</p>
                        <p><strong>الضريبة (15%):</strong> ${order.tax?.toFixed(2) || '0.00'} ريال</p>
                        <h3><strong>الإجمالي النهائي:</strong> ${order.total?.toFixed(2) || '0.00'} ريال</h3>
                    </div>
                    <div class="footer"><p>شكراً لتعاملكم مع تيرا جيتواي</p></div>
                </div>
                <script>window.onload = () => window.print();</script>
            </body>
            </html>
        `);
        
        printWindow.document.close();
        
    } catch (error) {
        console.error("Error printing invoice:", error);
        showNotification('حدث خطأ في طباعة الفاتورة', 'error');
    }
}

function closeOrderModal() {
    const modal = document.getElementById('order-modal');
    if (modal) modal.style.display = 'none';
    
    const form = document.getElementById('order-form');
    if (form) form.reset();
    document.getElementById('edit-id').value = '';
    
    const itemsBody = document.getElementById('items-body');
    if (itemsBody) itemsBody.innerHTML = '';
}

// ===================== إعداد الواجهة =====================

function setupLogic() {
    const modal = document.getElementById('order-modal');
    const createBtn = document.getElementById('btn-create-order');
    const closeBtn = document.getElementById('close-modal');
    const addItemBtn = document.getElementById('add-item-btn');
    const form = document.getElementById('order-form');
    
    if (!modal || !createBtn || !closeBtn || !addItemBtn || !form) {
        console.error("❌ بعض عناصر الواجهة غير موجودة");
        return;
    }
    
    createBtn.onclick = () => {
        form.reset();
        document.getElementById('edit-id').value = '';
        
        const itemsBody = document.getElementById('items-body');
        if (itemsBody) itemsBody.innerHTML = '';
        
        addItemRow();
        
        const titleEl = document.getElementById('modal-title');
        if (titleEl) titleEl.innerText = "📝 فاتورة مبيعات جديدة";
        
        modal.style.display = 'block';
    };
    
    closeBtn.onclick = closeOrderModal;
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeOrderModal();
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display === 'block') {
            closeOrderModal();
        }
    });
    
    addItemBtn.onclick = () => addItemRow();
    
    form.onsubmit = async (e) => {
        e.preventDefault();
        
        const items = collectItems();
        const subtotalResult = calculateTotals();
        
        const orderData = {
            customerName: document.getElementById('c-name')?.value?.trim() || '',
            phone: document.getElementById('c-phone')?.value?.trim() || '',
            email: document.getElementById('c-email')?.value?.trim() || '',
            address: document.getElementById('c-address')?.value?.trim() || '',
            items: items,
            subtotal: subtotalResult.subtotal,
            tax: subtotalResult.tax,
            total: subtotalResult.total
        };
        
        const errors = validateOrder(orderData);
        if (errors.length > 0) {
            showNotification(errors.join('\n'), 'error');
            return;
        }
        
        const editId = document.getElementById('edit-id')?.value;
        await saveOrder(orderData, editId || null);
    };
}

// ===================== الدوال الرئيسية =====================

export async function initOrdersDashboard(container) {
    console.log('🚀 initOrdersDashboard تم استدعاؤها');
    
    if (!container) {
        console.error("❌ container غير موجود");
        return;
    }
    
    container.innerHTML = `
        <div class="orders-mgmt" dir="rtl" style="font-family: 'Tajawal', sans-serif; padding:20px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:25px; flex-wrap: wrap; gap: 15px;">
                <h2 style="color:#2c3e50; margin:0;">
                    <i class="fas fa-file-invoice" style="color:#3498db; margin-left:10px;"></i> 
                    نظام فواتير تيرا جيتواي
                </h2>
                <button id="btn-create-order" style="background:#27ae60; color:white; border:none; padding:12px 25px; border-radius:10px; cursor:pointer; font-weight:bold; box-shadow:0 4px 10px rgba(39,174,96,0.2); transition: all 0.3s ease;">
                    <i class="fas fa-plus-circle"></i> إنشاء طلب جديد
                </button>
            </div>

            <div id="orders-stats"></div>
            
            <div id="orders-list" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap:20px;">
                <div style="grid-column:1/-1; text-align:center; padding:50px;">
                    <i class="fas fa-spinner fa-spin fa-2x" style="color:#3498db;"></i>
                    <p>جاري مزامنة الفواتير...</p>
                </div>
            </div>
        </div>

        <!-- مودال إضافة/تعديل طلب -->
        <div id="order-modal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); z-index:9999; overflow-y:auto; padding:20px;">
            <div style="background:white; max-width:900px; margin:20px auto; border-radius:15px; padding:30px; box-shadow:0 10px 30px rgba(0,0,0,0.3);">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; border-bottom:2px solid #f1f2f6; padding-bottom:15px;">
                    <h3 id="modal-title" style="color:#3498db; margin:0;">تفاصيل الفاتورة</h3>
                    <button type="button" id="close-modal" style="background:none; border:none; font-size:1.8rem; cursor:pointer; color:#95a5a6;">&times;</button>
                </div>
                
                <form id="order-form">
                    <input type="hidden" id="edit-id">
                    <input type="hidden" id="customer-data">
                    
                    <div style="background:#f9fbff; padding:20px; border-radius:12px; margin-bottom:25px; display:grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap:15px; border:1px solid #e3f2fd;">
                        <div style="grid-column: 1/-1;">
                            <label style="display:block; margin-bottom:8px; font-weight:bold; color:#34495e;">اختيار عميل مسجل</label>
                            <select id="sel-customer" style="width:100%; padding:12px; border-radius:8px; border:1px solid #ddd;"></select>
                        </div>
                        <div>
                            <label style="display:block; margin-bottom:8px; font-weight:bold;">اسم العميل *</label>
                            <input type="text" id="c-name" placeholder="الاسم الكامل" required style="width:100%; padding:12px; border-radius:8px; border:1px solid #ddd;">
                        </div>
                        <div>
                            <label style="display:block; margin-bottom:8px; font-weight:bold;">رقم الجوال *</label>
                            <input type="tel" id="c-phone" placeholder="05xxxxxxxx" required style="width:100%; padding:12px; border-radius:8px; border:1px solid #ddd;">
                        </div>
                        <div>
                            <label style="display:block; margin-bottom:8px; font-weight:bold;">البريد الإلكتروني</label>
                            <input type="email" id="c-email" placeholder="example@domain.com" style="width:100%; padding:12px; border-radius:8px; border:1px solid #ddd;">
                        </div>
                        <div style="grid-column: 1/-1;">
                            <label style="display:block; margin-bottom:8px; font-weight:bold;">العنوان</label>
                            <textarea id="c-address" rows="2" placeholder="العنوان الكامل (المدينة، الحي، الشارع، رقم المبنى...)" style="width:100%; padding:12px; border-radius:8px; border:1px solid #ddd; font-family: 'Tajawal', sans-serif;"></textarea>
                        </div>
                    </div>

                    <div style="margin-bottom:25px;">
                        <h4 style="color:#e67e22; border-right:4px solid #e67e22; padding-right:10px; margin-bottom:15px;">
                            <i class="fas fa-boxes"></i> المنتجات والخدمات
                        </h4>
                        <div style="overflow-x:auto;">
                            <table style="width:100%; border-collapse:collapse; min-width:500px;" id="items-table">
                                <thead>
                                    <tr style="background:#f8f9fa;">
                                        <th style="padding:12px; text-align:right;">المنتج</th>
                                        <th style="padding:12px; text-align:center; width:80px;">الكمية</th>
                                        <th style="padding:12px; text-align:center; width:120px;">السعر</th>
                                        <th style="padding:12px; text-align:center; width:120px;">الإجمالي</th>
                                        <th style="padding:12px; width:50px;"></th>
                                    </tr>
                                </thead>
                                <tbody id="items-body"></tbody>
                            </table>
                        </div>
                        <button type="button" id="add-item-btn" style="margin-top:15px; background:#3498db; color:white; border:none; padding:10px 20px; border-radius:8px; cursor:pointer; font-weight:bold;">
                            <i class="fas fa-plus"></i> إضافة بند جديد
                        </button>
                    </div>

                    <div style="background:#2c3e50; padding:20px; border-radius:12px; color:white;">
                        <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                            <span>المجموع الفرعي:</span> 
                            <span><span id="val-subtotal">0</span> ريال</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; margin-bottom:10px; color:#bdc3c7;">
                            <span>الضريبة (15%):</span> 
                            <span><span id="val-tax">0</span> ريال</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; font-size:1.4rem; font-weight:bold; border-top:1px solid #455a64; margin-top:10px; padding-top:10px; color:#2ecc71;">
                            <span>الإجمالي النهائي:</span> 
                            <span><span id="val-total">0</span> ريال</span>
                        </div>
                    </div>

                    <div style="margin-top:25px;">
                        <button type="submit" style="width:100%; background:#2ecc71; color:white; padding:15px; border:none; border-radius:10px; font-size:1.1rem; font-weight:bold; cursor:pointer;">
                            <i class="fas fa-save"></i> اعتماد وحفظ الفاتورة
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    setupLogic();
    await loadCustomerOptions();
    await loadOrders();
    await calculateTotalStats();
}

// دالة مبسطة للتوافق مع main.js
export async function initOrders(container) {
    return initOrdersDashboard(container);
}

// ===================== تصدير الدوال للاستخدام الخارجي =====================
export { loadOrders, saveOrder, deleteOrder, editOrder, printInvoice, initOrders, initOrdersDashboard }; 
// ===================== تصدير الدوال للاستخدام الخارجي =====================
export { loadOrders, saveOrder, deleteOrder, editOrder, printInvoice, initOrders, initOrdersDashboard };

// تصدير افتراضي أيضاً
export default { initOrdersDashboard, initOrders };
