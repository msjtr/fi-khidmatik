/**
 * fi-khidmatik/js/orders-logic.js
 * المنطق البرمجي لإدارة العمليات والحسابات - النسخة المعتمدة
 */

let currentOrderItems = [];

// --- 1. حسابات الفاتورة مع معالجة دقيقة للخصم والضريبة ---
export const calculateFinance = (discount = 0) => {
    const subtotal = currentOrderItems.reduce((sum, item) => {
        return sum + (item.price * item.quantity);
    }, 0);

    const taxRate = 0.15; 
    
    // تأمين الحسابات: الخصم لا يتجاوز المجموع والنتائج لا تقل عن صفر
    const validDiscount = Math.min(Math.max(0, discount), subtotal);
    const taxableAmount = subtotal - validDiscount;
    const tax = taxableAmount * taxRate;
    const total = taxableAmount + tax;

    return {
        subtotal: subtotal.toFixed(2),
        tax: tax.toFixed(2),
        total: total.toFixed(2),
        discount: validDiscount.toFixed(2)
    };
};

// --- 2. بناء واجهة قائمة المنتجات ديناميكياً ---
export const renderProductList = (containerId) => {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (currentOrderItems.length === 0) {
        container.innerHTML = `
            <div class="text-center py-10 opacity-40">
                <i class="fas fa-shopping-basket text-4xl mb-3 block"></i>
                <p class="text-sm font-bold">قائمة البنود فارغة</p>
            </div>`;
        
        if (typeof window.updateTotalDisplay === 'function') window.updateTotalDisplay();
        return;
    }

    container.innerHTML = currentOrderItems.map((item, index) => `
        <div class="flex items-center justify-between bg-white p-4 rounded-2xl mb-3 border border-slate-100 shadow-sm animate-fade-in group hover:border-blue-200 transition-all">
            <div class="flex-1">
                <div class="flex items-center gap-2">
                    <span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                    <h4 class="font-bold text-slate-700 text-sm">${item.name}</h4>
                </div>
                <p class="text-[11px] text-blue-600 font-black mt-1 tracking-wide">${item.price.toFixed(2)} ريال</p>
            </div>
            <div class="flex items-center gap-4">
                <div class="flex items-center bg-slate-50 rounded-xl p-1 border border-slate-100">
                    <button type="button" onclick="window.changeQty(${index}, -1)" class="w-8 h-8 flex items-center justify-center hover:bg-white hover:shadow-sm rounded-lg text-slate-400 hover:text-blue-600 transition-all font-bold">-</button>
                    <span class="px-2 text-xs font-black text-slate-700 min-w-[20px] text-center">${item.quantity}</span>
                    <button type="button" onclick="window.changeQty(${index}, 1)" class="w-8 h-8 flex items-center justify-center hover:bg-white hover:shadow-sm rounded-lg text-slate-400 hover:text-blue-600 transition-all font-bold">+</button>
                </div>
                <button type="button" onclick="window.removeItem(${index})" class="w-8 h-8 text-slate-300 hover:text-red-500 transition-colors">
                    <i class="fas fa-trash-alt text-xs"></i>
                </button>
            </div>
        </div>
    `).join('');

    if (typeof window.updateTotalDisplay === 'function') {
        window.updateTotalDisplay();
    }
};

// --- 3. الوظائف العالمية للتحكم من الـ UI ---
window.changeQty = (index, delta) => {
    if (currentOrderItems[index]) {
        const newQty = currentOrderItems[index].quantity + delta;
        if (newQty > 0) {
            currentOrderItems[index].quantity = newQty;
            renderProductList('productsContainer');
        } else {
            window.removeItem(index);
        }
    }
};

window.removeItem = (index) => {
    currentOrderItems.splice(index, 1);
    renderProductList('productsContainer');
};

// --- 4. العمليات التصديرية (Export) ---
export const resetLogic = () => { currentOrderItems = []; };

export const addItem = (product) => {
    const price = parseFloat(product.price) || 0;
    const name = product.name || "بند غير مسمى";
    const id = product.id || Date.now();

    const existing = currentOrderItems.find(item => item.id === id);
    if (existing) {
        existing.quantity += 1;
    } else {
        currentOrderItems.push({ id, name, price, quantity: 1 });
    }
    renderProductList('productsContainer');
};

export const getCurrentItems = () => currentOrderItems;

export const setCurrentItems = (items) => { 
    currentOrderItems = Array.isArray(items) ? items.map(item => ({
        ...item,
        price: parseFloat(item.price) || 0,
        quantity: parseInt(item.quantity) || 1
    })) : []; 
};
