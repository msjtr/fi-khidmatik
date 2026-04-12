// js/orders-app.js
import * as Logic from './orders-logic.js';

async function init() {
    const container = document.getElementById('ordersContainer');
    
    try {
        const orders = await Logic.getOrders();
        container.innerHTML = ''; // مسح علامة التحميل

        if (orders.length === 0) {
            container.innerHTML = '<p class="col-span-full text-center">لا توجد طلبات حالياً</p>';
            return;
        }

        orders.forEach(order => {
            const card = document.createElement('div');
            card.className = 'order-card';
            card.innerHTML = `
                <div class="flex justify-between mb-4">
                    <span class="font-bold">#${order.orderNumber || 'بدون رقم'}</span>
                    <span class="status-badge status-${order.status === 'جديد' ? 'new' : 'completed'}">${order.status}</span>
                </div>
                <p class="text-sm text-gray-600 mb-2"><i class="fas fa-user ml-2"></i>${order.customerName || 'عميل عام'}</p>
                <p class="text-lg font-bold text-blue-600">${order.totalAmount || 0} ريال</p>
                <div class="mt-4 pt-4 border-t flex justify-end">
                    <button class="text-gray-400 hover:text-blue-600"><i class="fas fa-eye"></i></button>
                </div>
            `;
            container.appendChild(card);
        });
    } catch (err) {
        Logic.toast('فشل في تحميل البيانات', 'error');
        console.error(err);
    }
}

// تشغيل عند التحميل
document.addEventListener('DOMContentLoaded', init);

// ربط زر "طلب جديد" (فتح المودال)
document.getElementById('newOrderBtn')?.addEventListener('click', () => {
    // كود فتح المودال سيوضع هنا
    Logic.toast('سيتم فتح نافذة الطلب الجديد');
});
