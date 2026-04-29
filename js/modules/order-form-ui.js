/**
 * js/modules/order-form-ui.js
 * دوال واجهة المستخدم لنموذج الطلب - إصدار تيرا جيت واي المطور
 * @version 3.1.0
 */

// ===================== دوال مساعدة وتحسينات بصرية =====================

function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

/**
 * إشعار تفاعلي حديث
 */
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `tera-toast ${type}`;
    notification.style.cssText = `
        position: fixed; top: 25px; left: 50%; transform: translateX(-50%);
        background: ${type === 'success' ? '#10b981' : '#ef4444'};
        color: white; padding: 14px 28px; border-radius: 12px; z-index: 11000;
        font-weight: 600; box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        direction: rtl; font-family: 'Cairo', sans-serif; display: flex; align-items: center; gap: 10px;
        transition: all 0.3s ease;
    `;
    notification.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-double' : 'fa-triangle-exclamation'}"></i> ${message}`;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

/**
 * تنسيق العنوان الوطني السعودي بشكل احترافي
 */
function formatFullAddress(customer) {
    if (!customer) return '';
    const parts = [];
    if (customer.city) parts.push(customer.city);
    if (customer.district) parts.push(customer.district);
    if (customer.street) parts.push(customer.street);
    if (customer.buildingNo) parts.push(`مبنى ${customer.buildingNo}`);
    if (customer.additionalNo) parts.push(`إضافي ${customer.additionalNo}`);
    if (customer.postalCode) parts.push(customer.postalCode);
    
    return parts.length > 0 ? parts.join(' - ') : '';
}

// ===================== محرك حساب الإجماليات =====================

export function calculateItemTotals() {
    let subtotal = 0;
    const TAX_RATE = 0.15; // الضريبة المعتمدة 15%
    
    document.querySelectorAll('#items-body tr').forEach(row => {
        const qty = parseFloat(row.querySelector('.item-qty')?.value) || 0;
        const price = parseFloat(row.querySelector('.item-price')?.value) || 0;
        const rowTotal = qty * price;
        
        const totalCell = row.querySelector('.item-total');
        if (totalCell) totalCell.textContent = rowTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        subtotal += rowTotal;
    });
    
    const tax = subtotal * TAX_RATE;
    const total = subtotal + tax;
    
    // تحديث الواجهة
    const updateElement = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.textContent = val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    updateElement('val-subtotal', subtotal);
    updateElement('val-tax', tax);
    updateElement('val-total', total);
    
    return { subtotal, tax, total };
}

// ===================== إدارة صفوف المنتجات =====================

function attachItemEvents(row) {
    const inputs = row.querySelectorAll('.item-qty, .item-price');
    inputs.forEach(input => {
        input.addEventListener('input', () => calculateItemTotals());
        // تحديد النص عند التركيز لتسهيل المسح والكتابة
        input.addEventListener('focus', (e) => e.target.select());
    });
    
    const removeBtn = row.querySelector('.remove-item');
    if (removeBtn) {
        removeBtn.addEventListener('click', () => {
            if (document.querySelectorAll('#items-body tr').length > 1) {
                row.style.opacity = '0';
                setTimeout(() => {
                    row.remove();
                    calculateItemTotals();
                }, 200);
            } else {
                showNotification('يجب وجود بند واحد على الأقل في الفاتورة', 'error');
            }
        });
    }
}

export function addItemRow(item = null) {
    const tbody = document.getElementById('items-body');
    if (!tbody) return;
    
    const defaultItem = item || { name: '', quantity: 1, price: 0 };
    const rowTotal = (defaultItem.quantity * defaultItem.price).toFixed(2);
    
    const row = document.createElement('tr');
    row.className = 'item-row animate-in'; // إضافة class للأنيميشن
    row.innerHTML = `
        <td>
            <input type="text" class="item-name tera-input" value="${escapeHtml(defaultItem.name)}" 
                   placeholder="اسم الصنف أو الخدمة..." required>
        </td>
        <td style="width: 100px;">
            <input type="number" class="item-qty tera-input text-center" value="${defaultItem.quantity}" min="0.01" step="any">
        </td>
        <td style="width: 130px;">
            <div class="price-input-wrapper">
                <input type="number" class="item-price tera-input text-center" value="${defaultItem.price}" min="0" step="0.01">
            </div>
        </td>
        <td class="item-total text-center font-bold text-success">
            ${rowTotal}
        </td>
        <td class="text-center">
            <button type="button" class="remove-item btn-icon-delete" title="حذف البند">
                <i class="fas fa-trash-can"></i>
            </button>
        </td>
    `;
    
    tbody.appendChild(row);
    attachItemEvents(row);
    calculateItemTotals();
}

export function addEmptyItemRow() {
    addItemRow({ name: '', quantity: 1, price: 0 });
}

export function collectOrderItems() {
    return Array.from(document.querySelectorAll('#items-body tr')).map(row => ({
        name: row.querySelector('.item-name')?.value?.trim(),
        quantity: parseFloat(row.querySelector('.item-qty')?.value) || 0,
        price: parseFloat(row.querySelector('.item-price')?.value) || 0
    })).filter(item => item.name !== ""); // استبعاد البنود الفارغة
}

// ===================== معالجة بيانات العميل المتقدمة =====================

export function fillCustomerData(customer, existingOrder = null) {
    if (!customer) return;
    
    // الأولوية لبيانات الطلب المخزنة (في حالة التعديل) لضمان عدم تغير الفاتورة القديمة
    const data = {
        name: existingOrder?.customerName || customer.name || '',
        phone: existingOrder?.phone || customer.phone || '',
        email: existingOrder?.email || customer.email || '',
        address: existingOrder?.address || formatFullAddress(customer)
    };

    document.getElementById('c-name').value = data.name;
    document.getElementById('c-phone').value = data.phone;
    if (document.getElementById('c-email')) document.getElementById('c-email').value = data.email;
    if (document.getElementById('c-address')) document.getElementById('c-address').value = data.address;
    
    const customerDataField = document.getElementById('customer-data');
    if (customerDataField) customerDataField.value = JSON.stringify(customer);

    showNotification(`تم ربط العميل: ${data.name}`);
}

// ===================== إدارة المودال (النافذة المنبثقة) =====================

export function showOrderModal(mode = 'add', orderData = null) {
    const modal = document.getElementById('order-modal');
    if (!modal) return;
    
    const title = document.getElementById('modal-title');
    const submitBtn = document.getElementById('submit-order-btn');
    
    if (mode === 'add') {
        if (title) title.innerHTML = '<i class="fas fa-plus-circle"></i> إنشاء فاتورة جديدة';
        if (submitBtn) submitBtn.innerHTML = '<i class="fas fa-save"></i> حفظ الفاتورة';
        resetOrderForm();
    } else if (mode === 'edit' && orderData) {
        if (title) title.innerHTML = `<i class="fas fa-edit"></i> تعديل طلب #${orderData.orderNumber}`;
        if (submitBtn) submitBtn.innerHTML = '<i class="fas fa-sync"></i> تحديث البيانات';
        
        // تعبئة البيانات الأساسية
        document.getElementById('c-name').value = orderData.customerName || '';
        document.getElementById('c-phone').value = orderData.phone || '';
        document.getElementById('c-address').value = orderData.address || '';
        document.getElementById('edit-id').value = orderData.id || '';
        
        const itemsBody = document.getElementById('items-body');
        itemsBody.innerHTML = '';
        
        if (orderData.items && orderData.items.length > 0) {
            orderData.items.forEach(item => addItemRow(item));
        } else {
            addEmptyItemRow();
        }
    }
    
    modal.style.display = 'flex';
    modal.classList.add('fade-in');
}

export function resetOrderForm() {
    const form = document.getElementById('order-form');
    if (form) form.reset();
    
    document.getElementById('edit-id').value = '';
    document.getElementById('customer-data').value = '';
    document.getElementById('items-body').innerHTML = '';
    
    addEmptyItemRow();
    calculateItemTotals();
}

// ===================== التحقق والصدور =====================

export function validateOrderForm() {
    const errors = [];
    const data = {
        name: document.getElementById('c-name')?.value?.trim(),
        phone: document.getElementById('c-phone')?.value?.trim(),
        items: collectOrderItems()
    };
    
    if (!data.name || data.name.length < 3) errors.push('اسم العميل يجب أن يكون 3 أحرف فأكثر');
    if (!/^(05|5)[0-9]{8}$/.test(data.phone?.replace(/\s/g, ''))) errors.push('رقم الجوال السعودي غير صحيح (05xxxxxxxx)');
    if (data.items.length === 0) errors.push('يجب إضافة صنف واحد على الأقل للفاتورة');
    
    return { valid: errors.length === 0, errors };
}

export default {
    addItemRow,
    addEmptyItemRow,
    collectOrderItems,
    resetOrderForm,
    calculateItemTotals,
    fillCustomerData,
    showOrderModal,
    validateOrderForm
};
