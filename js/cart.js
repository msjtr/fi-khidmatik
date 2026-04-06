// js/cart.js

// ========== المتغيرات ==========
let cart = [];
let cartTotal = 0;

// ========== التحميل والحفظ ==========
export function loadCart() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        try {
            cart = JSON.parse(savedCart);
            console.log(`✅ تم تحميل ${cart.length} منتج من السلة`);
        } catch(e) { 
            console.error('خطأ في تحميل السلة:', e);
            cart = []; 
        }
    }
    renderCart();
    updateCartCount();
}

export function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

export function clearCart() {
    if (confirm('⚠️ هل أنت متأكد من تفريغ السلة بالكامل؟')) {
        cart = [];
        saveCart();
        renderCart();
        showToast('🗑️ تم تفريغ السلة', 'success');
    }
}

// ========== إدارة السلة ==========
export function addToCart() {
    // التحقق من وجود العناصر
    const codeInput = document.getElementById('product_code');
    const nameInput = document.getElementById('product_name');
    const descInput = document.getElementById('product_desc');
    const priceInput = document.getElementById('product_price');
    const qtyInput = document.getElementById('product_qty');
    const discountInput = document.getElementById('product_discount');
    
    if (!codeInput || !nameInput || !priceInput) {
        console.error('❌ عناصر النموذج غير موجودة');
        showToast('حدث خطأ في النموذج', 'error');
        return;
    }
    
    const code = codeInput.value.trim();
    const name = nameInput.value.trim();
    const desc = descInput ? descInput.value.trim() : '';
    const price = parseFloat(priceInput.value);
    let qty = qtyInput ? parseInt(qtyInput.value) : 1;
    let discount = discountInput ? parseFloat(discountInput.value) : 0;

    // التحقق من صحة البيانات
    if (!code || !name || isNaN(price) || price <= 0) {
        showToast('❌ يرجى إدخال كود المنتج واسم المنتج وسعر صحيح', 'error');
        return;
    }
    
    if (isNaN(qty) || qty < 1) qty = 1;
    if (isNaN(discount) || discount < 0) discount = 0;

    // البحث عن منتج مكرر
    const existingIndex = cart.findIndex(item => item.code === code);
    if (existingIndex !== -1) {
        cart[existingIndex].qty += qty;
        showToast(`✅ تم تحديث كمية ${name}`, 'success');
    } else {
        cart.push({ 
            code, 
            name, 
            desc, 
            price, 
            qty, 
            discount,
            addedAt: new Date().toISOString()
        });
        showToast(`✅ تم إضافة ${name} إلى السلة`, 'success');
    }
    
    saveCart();
    renderCart();
    clearProductForm();
}

export function updateQty(index, delta) {
    if (!cart[index]) return;
    
    const newQty = cart[index].qty + delta;
    if (newQty <= 0) {
        removeItem(index);
    } else {
        cart[index].qty = newQty;
        saveCart();
        renderCart();
    }
}

export function removeItem(index) {
    const itemName = cart[index]?.name || 'المنتج';
    if (confirm(`⚠️ هل تريد حذف ${itemName} من السلة؟`)) {
        cart.splice(index, 1);
        saveCart();
        renderCart();
        showToast(`🗑️ تم حذف ${itemName}`, 'success');
    }
}

export function updateItemDiscount(index, newDiscount) {
    if (!cart[index]) return;
    cart[index].discount = Math.max(0, parseFloat(newDiscount) || 0);
    saveCart();
    renderCart();
}

// ========== عرض السلة ==========
export function renderCart() {
    const cartDiv = document.getElementById('cart');
    if (!cartDiv) return;

    if (cart.length === 0) {
        cartDiv.innerHTML = `
            <div class="empty-cart text-center py-8 text-gray-500">
                <i class="fas fa-shopping-cart text-4xl mb-2 block"></i>
                🛒 السلة فارغة
            </div>
        `;
        updateCartTotal(0);
        return;
    }

    let html = '<div class="cart-items space-y-3">';
    let total = 0;

    for (let i = 0; i < cart.length; i++) {
        const item = cart[i];
        const itemTotal = (item.price * item.qty) - item.discount;
        total += itemTotal;

        html += `
            <div class="cart-item bg-gray-50 rounded-lg p-3 flex flex-wrap items-center justify-between gap-2" data-index="${i}">
                <div class="cart-item-info flex-1 min-w-[150px]">
                    <div class="font-semibold text-gray-800">${escapeHtml(item.name)}</div>
                    <div class="text-xs text-gray-500">كود: ${escapeHtml(item.code)}</div>
                    ${item.desc ? `<div class="text-xs text-gray-400">${escapeHtml(item.desc.substring(0, 50))}</div>` : ''}
                </div>
                <div class="text-blue-600 font-bold min-w-[80px]">${item.price.toFixed(2)} ريال</div>
                <div class="cart-item-qty flex items-center gap-2">
                    <button class="qty-btn w-8 h-8 bg-gray-200 rounded-full hover:bg-gray-300 transition" onclick="window.updateQty(${i}, -1)">-</button>
                    <span class="min-w-[40px] text-center font-semibold">${item.qty}</span>
                    <button class="qty-btn w-8 h-8 bg-gray-200 rounded-full hover:bg-gray-300 transition" onclick="window.updateQty(${i}, 1)">+</button>
                </div>
                <div class="text-red-500 min-w-[80px]">- ${item.discount.toFixed(2)} ريال</div>
                <div class="font-bold text-green-600 min-w-[100px]">${itemTotal.toFixed(2)} ريال</div>
                <button class="remove-btn text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition" onclick="window.removeItem(${i})">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        `;
    }
    
    html += '</div>';
    html += `<div class="cart-total mt-4 pt-4 border-t text-right font-bold text-lg">
                💰 المجموع الكلي: <span class="text-green-600">${total.toFixed(2)} ريال</span>
             </div>`;
    
    cartDiv.innerHTML = html;
    updateCartTotal(total);
}

// ========== تحديث العدد والإجمالي ==========
function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.qty, 0);
    const cartCountEl = document.getElementById('cartCount');
    if (cartCountEl) {
        cartCountEl.textContent = count;
        cartCountEl.style.display = count > 0 ? 'inline-block' : 'none';
    }
}

function updateCartTotal(total) {
    cartTotal = total;
    const cartTotalEl = document.getElementById('cartTotal');
    if (cartTotalEl) {
        cartTotalEl.textContent = total.toFixed(2) + ' ريال';
    }
}

// ========== الحصول على بيانات السلة ==========
export function getCart() {
    return [...cart];
}

export function getCartTotal() {
    return cartTotal;
}

export function getCartItemsCount() {
    return cart.reduce((sum, item) => sum + item.qty, 0);
}

export function getCartSummary() {
    return {
        items: [...cart],
        total: cartTotal,
        count: getCartItemsCount()
    };
}

// ========== مسح النموذج ==========
export function clearProductForm() {
    const fields = ['product_code', 'product_name', 'product_desc', 'product_price', 'product_qty', 'product_discount'];
    fields.forEach(fieldId => {
        const el = document.getElementById(fieldId);
        if (el) {
            if (fieldId === 'product_qty') el.value = '1';
            else if (fieldId === 'product_discount') el.value = '0';
            else el.value = '';
        }
    });
    
    // التركيز على حقل الكود
    const codeInput = document.getElementById('product_code');
    if (codeInput) codeInput.focus();
}

// ========== دالة مساعدة ==========
function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

function showToast(message, type = 'success') {
    // إنشاء عنصر التوست إذا لم يكن موجوداً
    let toast = document.getElementById('cartToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'cartToast';
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #10b981;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 10000;
            font-size: 14px;
            animation: slideInRight 0.3s ease;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        document.body.appendChild(toast);
        
        // إضافة animation إذا لم تكن موجودة
        if (!document.querySelector('#cartToastStyles')) {
            const style = document.createElement('style');
            style.id = 'cartToastStyles';
            style.textContent = `
                @keyframes slideInRight {
                    from { transform: translateX(100px); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    toast.textContent = message;
    toast.style.backgroundColor = type === 'error' ? '#ef4444' : (type === 'warning' ? '#f59e0b' : '#10b981');
    toast.style.display = 'block';
    
    setTimeout(() => {
        toast.style.display = 'none';
    }, 3000);
}

// ========== دالة لربط الأحداث ==========
export function bindCartEvents() {
    const addToCartBtn = document.getElementById('addToCartBtn');
    if (addToCartBtn) {
        addToCartBtn.onclick = addToCart;
    }
    
    const clearCartBtn = document.getElementById('clearCartBtn');
    if (clearCartBtn) {
        clearCartBtn.onclick = clearCart;
    }
    
    // دعم إدخال Enter في حقول النموذج
    const inputs = ['product_code', 'product_name', 'product_price'];
    inputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    addToCart();
                }
            });
        }
    });
}

// ========== ربط الدوال بـ window للاستخدام في onclick ==========
window.updateQty = updateQty;
window.removeItem = removeItem;
window.addToCart = addToCart;
window.clearCart = clearCart;

// ========== التهيئة ==========
document.addEventListener('DOMContentLoaded', () => {
    console.log('🛒 تهيئة سلة المشتريات...');
    loadCart();
    bindCartEvents();
    
    // تعيين التاريخ والوقت الحاليين
    const dateInput = document.getElementById('order_date');
    const timeInput = document.getElementById('order_time');
    if (dateInput && !dateInput.value) {
        dateInput.value = new Date().toISOString().slice(0,10);
    }
    if (timeInput && !timeInput.value) {
        timeInput.value = new Date().toLocaleTimeString('ar-SA').slice(0,5);
    }
    
    console.log('✅ تم تهيئة سلة المشتريات بنجاح');
});

// ========== تصدير الدوال للاستخدام في ملفات أخرى ==========
export { cart, cartTotal };
