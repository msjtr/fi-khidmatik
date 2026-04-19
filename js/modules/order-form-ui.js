/**
 * js/modules/order-form-ui.js
 * دوال واجهة المستخدم لنموذج الطلب
 * @version 2.0.0
 */

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
    
    setTimeout(() => {
        if (notification.parentNode) notification.remove();
    }, 3000);
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

// ===================== حساب الإجماليات =====================

/**
 * حساب الإجماليات وتحديث الواجهة
 */
function calculateItemTotals() {
    let subtotal = 0;
    
    document.querySelectorAll('#items-body tr').forEach(row => {
        const qty = parseFloat(row.querySelector('.item-qty')?.value) || 0;
        const price = parseFloat(row.querySelector('.item-price')?.value) || 0;
        const rowTotal = qty * price;
        
        const totalCell = row.querySelector('.item-total');
        if (totalCell) totalCell.textContent = rowTotal.toFixed(2);
        
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

// ===================== إدارة صفوف المنتجات =====================

/**
 * ربط الأحداث بصف المنتج
 */
function attachItemEvents(row) {
    const qtyInput = row.querySelector('.item-qty');
    const priceInput = row.querySelector('.item-price');
    const removeBtn = row.querySelector('.remove-item');
    
    if (qtyInput) {
        qtyInput.addEventListener('input', () => calculateItemTotals());
    }
    
    if (priceInput) {
        priceInput.addEventListener('input', () => calculateItemTotals());
    }
    
    if (removeBtn) {
        removeBtn.addEventListener('click', () => {
            if (document.querySelectorAll('#items-body tr').length > 1) {
                row.remove();
                calculateItemTotals();
            } else {
                showNotification('لا يمكن حذف جميع البنود', 'error');
            }
        });
    }
}

/**
 * إضافة صف منتج جديد
 * @param {Object} item - بيانات المنتج { name, quantity, price }
 */
export function addItemRow(item = null) {
    const tbody = document.getElementById('items-body');
    if (!tbody) return;
    
    const defaultItem = item || { name: '', quantity: 1, price: 0 };
    const rowTotal = (defaultItem.quantity * defaultItem.price).toFixed(2);
    
    const row = document.createElement('tr');
    row.style.borderBottom = "1px solid #f1f5f9";
    row.innerHTML = `
        <td style="padding: 8px;">
            <input type="text" class="item-name" value="${escapeHtml(defaultItem.name)}" 
                   placeholder="اسم المنتج" 
                   style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 6px;">
        </td>
        <td style="padding: 8px; width: 100px;">
            <input type="number" class="item-qty" value="${defaultItem.quantity}" min="0.01" step="0.01"
                   style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 6px; text-align: center;">
        </td>
        <td style="padding: 8px; width: 120px;">
            <input type="number" class="item-price" value="${defaultItem.price}" min="0" step="0.01"
                   style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 6px; text-align: center;">
        </td>
        <td class="item-total" style="padding: 8px; text-align: center; font-weight: bold; color: #27ae60;">
            ${rowTotal}
        </td>
        <td style="padding: 8px; text-align: center; width: 50px;">
            <button type="button" class="remove-item" style="background: none; border: none; color: #e74c3c; cursor: pointer; font-size: 1.2rem;">
                <i class="fas fa-trash-alt"></i>
            </button>
        </td>
    `;
    
    tbody.appendChild(row);
    attachItemEvents(row);
    calculateItemTotals();
}

/**
 * إضافة صف فارغ (للوضع الافتراضي)
 */
export function addEmptyItemRow() {
    addItemRow({ name: '', quantity: 1, price: 0 });
}

/**
 * جمع بيانات المنتجات من النموذج
 * @returns {Array} مصفوفة من المنتجات
 */
export function collectOrderItems() {
    const items = [];
    document.querySelectorAll('#items-body tr').forEach(row => {
        const name = row.querySelector('.item-name')?.value?.trim();
        if (name) {
            items.push({
                name: name,
                quantity: parseFloat(row.querySelector('.item-qty')?.value) || 0,
                price: parseFloat(row.querySelector('.item-price')?.value) || 0
            });
        }
    });
    return items;
}

/**
 * تنظيف نموذج الطلب بالكامل
 */
export function resetOrderForm() {
    const form = document.getElementById('order-form');
    if (form) form.reset();
    
    const editId = document.getElementById('edit-id');
    if (editId) editId.value = '';
    
    const customerData = document.getElementById('customer-data');
    if (customerData) customerData.value = '';
    
    const itemsBody = document.getElementById('items-body');
    if (itemsBody) itemsBody.innerHTML = '';
    
    // إضافة صف فارغ افتراضي
    addEmptyItemRow();
    
    // إعادة تعيين الإجماليات
    calculateItemTotals();
}

// ===================== إدارة بيانات العميل =====================

/**
 * تعبئة بيانات العميل في النموذج
 * @param {Object} customer - بيانات العميل الكاملة
 * @param {Object} existingOrder - بيانات الطلب الحالي (للتعديل)
 */
export function fillCustomerData(customer, existingOrder = null) {
    // تعبئة الحقول الأساسية (مع fallback للطلب الحالي)
    const nameField = document.getElementById('c-name');
    const phoneField = document.getElementById('c-phone');
    const emailField = document.getElementById('c-email');
    const addressField = document.getElementById('c-address');
    
    if (nameField) {
        nameField.value = (existingOrder?.customerName) || customer.name || '';
    }
    if (phoneField) {
        phoneField.value = (existingOrder?.phone) || customer.phone || '';
    }
    if (emailField) {
        emailField.value = (existingOrder?.email) || customer.email || '';
    }
    
    // تنسيق العنوان الكامل
    const addressParts = [];
    if (customer.buildingNo) addressParts.push(`مبنى ${customer.buildingNo}`);
    if (customer.street) addressParts.push(`شارع ${customer.street}`);
    if (customer.district) addressParts.push(`حي ${customer.district}`);
    if (customer.city) addressParts.push(customer.city);
    if (customer.poBox) addressParts.push(`ص.ب ${customer.poBox}`);
    if (customer.country) addressParts.push(customer.country);
    
    const fullAddress = addressParts.length > 0 ? addressParts.join('، ') : '';
    
    if (addressField) {
        addressField.value = (existingOrder?.address) || fullAddress;
    }
    
    // تخزين بيانات العميل الكاملة في hidden field
    const customerDataField = document.getElementById('customer-data');
    if (customerDataField) {
        customerDataField.value = JSON.stringify(customer);
    }
}

/**
 * تنظيف حقول بيانات العميل
 */
export function clearCustomerFields() {
    const nameField = document.getElementById('c-name');
    const phoneField = document.getElementById('c-phone');
    const emailField = document.getElementById('c-email');
    const addressField = document.getElementById('c-address');
    const customerDataField = document.getElementById('customer-data');
    
    if (nameField) nameField.value = '';
    if (phoneField) phoneField.value = '';
    if (emailField) emailField.value = '';
    if (addressField) addressField.value = '';
    if (customerDataField) customerDataField.value = '';
}

/**
 * الحصول على بيانات العميل من النموذج
 * @returns {Object} بيانات العميل المدخلة
 */
export function getCustomerDataFromForm() {
    return {
        name: document.getElementById('c-name')?.value?.trim() || '',
        phone: document.getElementById('c-phone')?.value?.trim() || '',
        email: document.getElementById('c-email')?.value?.trim() || '',
        address: document.getElementById('c-address')?.value?.trim() || ''
    };
}

// ===================== إدارة مودال الطلب =====================

/**
 * فتح مودال الطلب
 * @param {string} mode - وضع التشغيل ('add' أو 'edit')
 * @param {Object} orderData - بيانات الطلب (في حالة التعديل)
 */
export function showOrderModal(mode = 'add', orderData = null) {
    const modal = document.getElementById('order-modal');
    if (!modal) {
        console.error('❌ order-modal غير موجود');
        return;
    }
    
    const title = document.getElementById('modal-title');
    const form = document.getElementById('order-form');
    
    if (!form) return;
    
    if (mode === 'add') {
        if (title) title.innerText = '📝 فاتورة مبيعات جديدة';
        resetOrderForm();
    } else if (mode === 'edit' && orderData) {
        if (title) title.innerText = `✏️ تعديل الفاتورة: ${orderData.orderNumber || ''}`;
        
        // تعبئة بيانات الطلب
        const nameField = document.getElementById('c-name');
        const phoneField = document.getElementById('c-phone');
        const emailField = document.getElementById('c-email');
        const addressField = document.getElementById('c-address');
        const editIdField = document.getElementById('edit-id');
        
        if (nameField) nameField.value = orderData.customerName || '';
        if (phoneField) phoneField.value = orderData.phone || '';
        if (emailField) emailField.value = orderData.email || '';
        if (addressField) addressField.value = orderData.address || '';
        if (editIdField) editIdField.value = orderData.id || '';
        
        // تنظيف وإضافة بنود المنتجات
        const itemsBody = document.getElementById('items-body');
        if (itemsBody) itemsBody.innerHTML = '';
        
        if (orderData.items && orderData.items.length > 0) {
            orderData.items.forEach(item => addItemRow(item));
        } else {
            addEmptyItemRow();
        }
    }
    
    modal.style.display = 'block';
}

/**
 * إغلاق مودال الطلب
 */
export function closeOrderModal() {
    const modal = document.getElementById('order-modal');
    if (modal) modal.style.display = 'none';
    resetOrderForm();
}

// ===================== التحقق من صحة النموذج =====================

/**
 * التحقق من صحة نموذج الطلب
 * @returns {Object} { valid: boolean, errors: Array }
 */
export function validateOrderForm() {
    const errors = [];
    
    const customerName = document.getElementById('c-name')?.value?.trim();
    const phone = document.getElementById('c-phone')?.value?.trim();
    const items = collectOrderItems();
    
    if (!customerName || customerName.length < 3) {
        errors.push('اسم العميل مطلوب (3 أحرف على الأقل)');
    }
    
    if (!phone || !/^(05|5)[0-9]{8}$/.test(phone.replace(/\s/g, ''))) {
        errors.push('رقم الجوال غير صحيح (يجب أن يبدأ بـ 05)');
    }
    
    if (items.length === 0) {
        errors.push('يجب إضافة منتج واحد على الأقل');
    }
    
    items.forEach((item, index) => {
        if (!item.name) {
            errors.push(`المنتج رقم ${index + 1}: اسم المنتج مطلوب`);
        }
        if (item.quantity <= 0) {
            errors.push(`المنتج ${item.name || index + 1}: الكمية يجب أن تكون أكبر من صفر`);
        }
        if (item.price < 0) {
            errors.push(`المنتج ${item.name || index + 1}: السعر لا يمكن أن يكون سالباً`);
        }
    });
    
    return {
        valid: errors.length === 0,
        errors: errors
    };
}

// ===================== تصدير الدوال =====================
export default {
    // إدارة المنتجات
    addItemRow,
    addEmptyItemRow,
    collectOrderItems,
    resetOrderForm,
    calculateItemTotals,
    
    // إدارة بيانات العميل
    fillCustomerData,
    clearCustomerFields,
    getCustomerDataFromForm,
    
    // إدارة المودال
    showOrderModal,
    closeOrderModal,
    
    // التحقق
    validateOrderForm
};
