import * as logic from './orders-logic.js';

// تعريف المتغيرات العامة للحالة
window.currentView = 'new'; 
let currentCart = [];

// جعل الدوال متاحة للـ HTML (حل مشكلة ReferenceError)
window.switchSystem = switchSystem;
window.submitOrder = submitOrder;
window.addToCart = addToCart;
window.toggleOrderForm = toggleOrderForm;

// 1. الدالة الأساسية للتبديل (التي كانت تسبب الخطأ)
async function switchSystem(type) {
    window.currentView = type;
    
    // تحديث الأزرار بصرياً
    const btnNew = document.getElementById('btn-new');
    const btnOld = document.getElementById('btn-old');
    
    if (btnNew && btnOld) {
        btnNew.classList.toggle('active-system', type === 'new');
        btnOld.classList.toggle('active-system', type === 'old');
    }

    // استدعاء الدالة التي كانت مفقودة
    await loadDashboardData();
}

// 2. الدالة المفقودة (loadDashboardData) التي تجلب وتصفي البيانات
async function loadDashboardData() {
    const tbody = document.getElementById('ordersTableBody');
    if (tbody) tbody.innerHTML = `<tr><td colspan="5" class="p-10 text-center text-blue-500"><i class="fas fa-spinner fa-spin ml-2"></i> جاري تحميل البيانات...</td></tr>`;

    try {
        const history = await logic.fetchFullData();
        
        // تصفية البيانات بناءً على النظام المختار
        const filtered = history.filter(order => {
            if (window.currentView === 'new') {
                // النظام المطور: يحتوي على لقطة عميل أو رقم طلب يبدأ بـ TR
                return order.customerSnapshot || (order.orderNumber && order.orderNumber.startsWith('TR'));
            } else {
                // الأرشيف: أي شيء لا ينطبق عليه شرط المطور
                return !order.customerSnapshot && !(order.orderNumber && order.orderNumber.startsWith('TR'));
            }
        });

        // استدعاء دالة الرسم التي راجعناها سابقاً
        renderOrdersTable(filtered);
    } catch (error) {
        console.error("فشل تحميل البيانات:", error);
    }
}

// 3. دالة رسم الجدول (التي راجعناها سابقاً)
function renderOrdersTable(data) {
    const tbody = document.getElementById('ordersTableBody');
    if (!tbody) return;

    if (!data || data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="p-20 text-center"><p class="text-slate-400 font-bold">لا توجد سجلات حالياً</p></td></tr>`;
        return;
    }

    tbody.innerHTML = data.map(o => {
        const name = o.customerSnapshot?.name || o.customerName || o.clientName || "عميل غير معروف";
        const rawTotal = o.totals?.total || o.total || 0;
        const finalTotal = parseFloat(rawTotal).toFixed(2);
        const orderId = o.orderNumber || (o.id ? o.id.slice(0, 8) : "---");

        return `
            <tr class="border-b border-slate-50 hover:bg-blue-50/40 transition-all group">
                <td class="p-4 font-bold text-blue-700 text-xs"><span class="bg-blue-50 px-3 py-1.5 rounded-lg">#${orderId}</span></td>
                <td class="p-4 font-bold text-slate-700">${name}</td>
                <td class="p-4 text-slate-500 text-[11px]">${o.orderDate || '---'}</td>
                <td class="p-4 font-black text-slate-800 text-left md:text-right">${finalTotal} ر.س</td>
                <td class="p-4 text-center">
                    <button onclick="window.open('../../print.html?id=${o.id}', '_blank')" 
                            class="bg-white text-blue-600 p-2 px-5 rounded-xl hover:bg-blue-600 hover:text-white transition shadow-sm border border-blue-100">
                        <i class="fas fa-print ml-1"></i> عرض
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// 4. تهيئة الصفحة عند التحميل
document.addEventListener('DOMContentLoaded', () => {
    // توليد بيانات أولية للنموذج
    const orderNoField = document.getElementById('orderNo');
    if(orderNoField) orderNoField.value = logic.generateOrderID();
    
    const dateField = document.getElementById('orderDate');
    if(dateField) dateField.value = new Date().toISOString().split('T')[0];

    // تشغيل نظام العرض تلقائياً
    window.switchSystem('new');
});

// --- وظائف إضافية لإدارة السلة وحفظ الطلب ---
function addToCart() { /* الكود الذي كتبناه سابقاً */ }
function submitOrder(event) { /* الكود الذي كتبناه سابقاً */ }
function toggleOrderForm() { /* الكود الذي في الـ HTML الأصلي */ }
