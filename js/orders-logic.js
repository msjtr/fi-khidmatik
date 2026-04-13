/**
 * fi-khidmatik/js/orders-logic.js
 * المنطق البرمجي لإدارة العمليات والحسابات
 */

let currentOrderItems = [];

// --- 1. حسابات الفاتورة ---
export const calculateFinance = (discount = 0) => {
    const subtotal = currentOrderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const taxRate = 0.15; // الضريبة 15%
    const taxableAmount = Math.max(0, subtotal - discount);
    const tax = taxableAmount * taxRate;
    const total = taxableAmount + tax;

    return {
        subtotal: subtotal.toFixed(2),
        tax: tax.toFixed(2),
        total: total.toFixed(2)
    };
};

// --- 2. إدارة قائمة المنتجات (UI) ---
export const renderProductList = (containerId, updateCallback) => {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (currentOrderItems.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-400 py-4 text-sm">لم يتم إضافة منتجات بعد</p>';
        return;
    }

    container.innerHTML = currentOrderItems.map((item, index) => `
        <div class="flex items-center justify-between bg-gray-50 p-3 rounded-xl mb-2 border border-gray-100 animate-fade-in">
            <div class="flex-1">
                <h4 class="font-bold text-gray-700 text-sm">${item.name}</h4>
                <p class="text-xs text-blue-600">${item.price} ريال</p>
            </div>
            <div class="flex items-center gap-3">
                <div class="flex items-center border rounded-lg bg-white overflow-hidden">
                    <button type="button" onclick="window.changeQty(${index}, -1)" class="px-2 py-1 hover:bg-gray-100 text-gray-500">-</button>
                    <span class="px-3 text-sm font-medium">${item.quantity}</span>
                    <button type="button" onclick="window.changeQty(${index}, 1)" class="px-2 py-1 hover:bg-gray-100 text-gray-500">+</button>
                </div>
                <button type="button" onclick="window.removeItem(${index})" class="text-red-400 hover:text-red-600 p-1">
                    <i class="fas fa-trash-alt text-xs"></i>
                </button>
            </div>
        </div>
    `).join('');

    // تحديث المجموع عند أي تغيير في القائمة
    if (typeof window.updateTotalDisplay === 'function') {
        window.updateTotalDisplay();
    }
};

// --- 3. وظائف التعديل (Global لسهولة الوصول من HTML) ---
window.changeQty = (index, delta) => {
    if (currentOrderItems[index] && currentOrderItems[index].quantity + delta > 0) {
        currentOrderItems[index].quantity += delta;
        renderProductList('productsContainer');
    }
};

window.removeItem = (index) => {
    currentOrderItems.splice(index, 1);
    renderProductList('productsContainer');
};

// --- 4. أدوات مساعدة ---
export const resetLogic = () => {
    currentOrderItems = [];
};

export const addItem = (product) => {
    const existing = currentOrderItems.find(item => item.id === product.id);
    if (existing) {
        existing.quantity += 1;
    } else {
        currentOrderItems.push({
            id: product.id || Date.now(),
            name: product.name,
            price: parseFloat(product.price) || 0,
            quantity: 1
        });
    }
    renderProductList('productsContainer');
};

export const getCurrentItems = () => currentOrderItems;
export const setCurrentItems = (items) => { 
    currentOrderItems = Array.isArray(items) ? items : []; 
};
