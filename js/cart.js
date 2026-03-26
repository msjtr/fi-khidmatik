// cart.js - إدارة سلة المشتريات

window.cart = window.cart || [];

function addToCart() {
    const name = document.getElementById('product_name').value.trim();
    const desc = document.getElementById('product_desc').value.trim();
    const price = parseFloat(document.getElementById('product_price').value);
    let qty = parseInt(document.getElementById('product_qty').value);

    if (!name || isNaN(price) || price <= 0) {
        alert('❌ يرجى إدخال اسم المنتج وسعر صحيح');
        return;
    }
    if (isNaN(qty) || qty < 1) qty = 1;

    // التحقق إذا كان المنتج موجوداً بالفعل
    const existing = window.cart.find(item => item.name === name && item.desc === desc);
    if (existing) {
        existing.qty += qty;
    } else {
        window.cart.push({
            name: name,
            desc: desc,
            price: price,
            qty: qty
        });
    }

    renderCart();

    // تفريغ الحقول
    document.getElementById('product_name').value = '';
    document.getElementById('product_desc').value = '';
    document.getElementById('product_price').value = '';
    document.getElementById('product_qty').value = '1';
}

function renderCart() {
    const cartDiv = document.getElementById('cart');
    if (!cartDiv) return;

    if (window.cart.length === 0) {
        cartDiv.innerHTML = '<div class="empty-cart">🛒 السلة فارغة، أضف منتجات</div>';
        return;
    }

    let html = '';
    let total = 0;

    window.cart.forEach((item, index) => {
        const itemTotal = item.price * item.qty;
        total += itemTotal;

        html += `
            <div class="cart-item">
                <div class="cart-item-info">
                    <strong>${escapeHtml(item.name)}</strong>
                    ${item.desc ? `<br><small>${escapeHtml(item.desc)}</small>` : ''}
                </div>
                <div class="cart-item-price">${item.price.toFixed(2)} ريال</div>
                <div class="cart-item-qty">
                    <button class="qty-btn" onclick="updateQty(${index}, -1)">-</button>
                    <span>${item.qty}</span>
                    <button class="qty-btn" onclick="updateQty(${index}, 1)">+</button>
                </div>
                <div class="cart-item-price">${itemTotal.toFixed(2)} ريال</div>
                <button class="remove-btn" onclick="removeItem(${index})">🗑️ حذف</button>
            </div>
        `;
    });

    html += `<div class="cart-total">💰 المجموع الكلي: ${total.toFixed(2)} ريال</div>`;
    cartDiv.innerHTML = html;
}

function updateQty(index, delta) {
    if (!window.cart[index]) return;
    const newQty = window.cart[index].qty + delta;
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

// helper لتجنب XSS
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// تحميل السلة عند بدء الصفحة
document.addEventListener('DOMContentLoaded', () => {
    if (typeof renderCart === 'function') renderCart();
});
