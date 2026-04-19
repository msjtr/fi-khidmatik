/**
 * js/modules/order-form-ui.js
 * دوال واجهة المستخدم لنموذج الطلب
 */

export function showOrderModal(mode = 'add', orderData = null) {
    const modal = document.getElementById('order-modal');
    if (!modal) return;
    
    const title = document.getElementById('modal-title');
    
    if (mode === 'add') {
        title.innerText = 'فاتورة مبيعات جديدة';
        document.getElementById('order-form').reset();
        document.getElementById('edit-id').value = '';
        document.getElementById('items-body').innerHTML = '';
        addEmptyItemRow();
    } else if (mode === 'edit' && orderData) {
        title.innerText = `تعديل الفاتورة: ${orderData.orderNumber}`;
        document.getElementById('edit-id').value = orderData.id;
        document.getElementById('c-name').value = orderData.customerName || '';
        document.getElementById('c-phone').value = orderData.phone || '';
        
        document.getElementById('items-body').innerHTML = '';
        orderData.items.forEach(item => addItemRow(item));
    }
    
    modal.style.display = 'block';
}

export function closeOrderModal() {
    const modal = document.getElementById('order-modal');
    if (modal) modal.style.display = 'none';
}

function addEmptyItemRow() {
    addItemRow({ name: '', quantity: 1, price: 0 });
}

function addItemRow(item) {
    const tbody = document.getElementById('items-body');
    if (!tbody) return;
    
    const row = document.createElement('tr');
    row.innerHTML = `
        <td><input type="text" class="item-name" value="${item.name}" placeholder="المنتج"></td>
        <td><input type="number" class="item-qty" value="${item.quantity}" min="1"></td>
        <td><input type="number" class="item-price" value="${item.price}" min="0"></td>
        <td class="item-total">${(item.quantity * item.price).toFixed(2)}</td>
        <td><button class="remove-item" style="color: #e74c3c; background: none; border: none; cursor: pointer;">✖</button></td>
    `;
    
    tbody.appendChild(row);
    attachItemEvents(row);
}
