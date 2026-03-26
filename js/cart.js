// cart.js
window.cart = [];

function addToCart() {
    let code = document.getElementById('product_code').value.trim();
    let name = document.getElementById('product_name').value.trim();
    let desc = document.getElementById('product_desc').value.trim();
    let price = parseFloat(document.getElementById('product_price').value);
    let qty = parseInt(document.getElementById('product_qty').value);
    let discount = parseFloat(document.getElementById('product_discount').value) || 0;

    if (!code || !name || isNaN(price) || price <= 0) {
        alert('❌ يرجى إدخال كود المنتج واسم المنتج وسعر صحيح');
        return;
    }
    if (isNaN(qty) || qty < 1) qty = 1;
    if (isNaN(discount) || discount < 0) discount = 0;

    let existingIndex = window.cart.findIndex(item => item.code === code);
    if (existingIndex !== -1) {
        window.cart[existingIndex].qty += qty;
    } else {
        window.cart.push({
            code: code,
            name: name,
            desc: desc,
            price: price,
            qty: qty,
            discount: discount
        });
    }
    renderCart();

    document.getElementById('product_code').value = '';
    document.getElementById('product_name').value = '';
    document.getElementById('product_desc').value = '';
    document.getElementById('product_price').value = '';
    document.getElementById('product_qty').value = '1';
    document.getElementById('product_discount').value = '0';
}

function renderCart() {
    let cartDiv = document.getElementById('cart');
    if (!cartDiv) return;

    if (window.cart.length === 0) {
        cartDiv.innerHTML = '<div class="empty-cart">🛒 السلة فارغة</div>';
        return;
    }

    let html = '';
    let total = 0;

    for (let i = 0; i < window.cart.length; i++) {
        let item = window.cart[i];
        let itemTotal = (item.price * item.qty) - item.discount;
        total += itemTotal;

        html += `<div class="cart-item">
            <div class="cart-item-info">
                <strong>${escapeHtml(item.name)}</strong><br>
                <small>كود: ${escapeHtml(item.code)}</small>
                ${item.desc ? `<br><small>${escapeHtml(item.desc)}</small>` : ''}
            </div>
            <div>${item.price.toFixed(2)} ريال</div>
            <div class="cart-item-qty">
                <button class="qty-btn" onclick="updateQty(${i}, -1)">-</button>
                <span>${item.qty}</span>
                <button class="qty-btn" onclick="updateQty(${i}, 1)">+</button>
            </div>
            <div>خصم: ${item.discount.toFixed(2)}</div>
            <div class="cart-item-price">${itemTotal.toFixed(2)} ريال</div>
            <button class="remove-btn" onclick="removeItem(${i})">🗑️ حذف</button>
        </div>`;
    }

    html += `<div class="cart-total">💰 المجموع الكلي: ${total.toFixed(2)} ريال</div>`;
    cartDiv.innerHTML = html;
}

function updateQty(index, delta) {
    if (!window.cart[index]) return;
    let newQty = window.cart[index].qty + delta;
    if (newQty <= 0) {
        removeItem(index);
    } else {
        window.cart[index].qty = newQty;
        renderCart();
    }
}

function removeItem(index) {
    if (confirm('هل تريد حذف هذا المنتج؟')) {
        window.cart.splice(index, 1);
        renderCart();
    }
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

document.addEventListener('DOMContentLoaded', renderCart);
