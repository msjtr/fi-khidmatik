// js/orders-app.js
import { db } from './orders-firebase-db.js';
import { toast, getOrders } from './orders-logic.js'; // استيراد الوظائف المشتركة
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

const container = document.getElementById('ordersContainer');
const orderModal = document.getElementById('orderModal');
const orderForm = document.getElementById('orderForm');

// 1. جلب وعرض الطلبات (تم استدعاء المنطق من orders-logic)
async function renderOrders() {
    container.innerHTML = `
        <div class="col-span-full flex flex-col items-center justify-center py-20 opacity-50">
            <div class="loading-spinner mb-4"></div>
            <p>جاري تحديث البيانات...</p>
        </div>`;

    const orders = await getOrders();
    container.innerHTML = '';

    if (orders.length === 0) {
        container.innerHTML = '<p class="col-span-full text-center py-10">لا يوجد طلبات مسجلة حالياً</p>';
        return;
    }

    orders.forEach(data => {
        const date = data.createdAt?.toDate ? data.createdAt.toDate().toLocaleDateString('ar-SA') : 'قيد المعالجة';
        
        const card = `
            <div class="order-card">
                <div class="flex justify-between items-start mb-4">
                    <span class="text-xs text-gray-400">${date}</span>
                    <span class="status-badge status-new">${data.status || 'جديد'}</span>
                </div>
                <h4 class="font-bold text-lg mb-2">${data.customerName}</h4>
                <p class="text-sm text-gray-500 mb-4"><i class="fas fa-box ml-1"></i> باقة: ${data.packageName} ريال</p>
                <div class="border-t pt-4 flex justify-between items-center">
                    <span class="font-bold text-blue-600">${data.price} ريال</span>
                    <a href="tel:${data.phone}" class="text-blue-500 hover:text-blue-700">
                        <i class="fas fa-phone-alt"></i>
                    </a>
                </div>
            </div>`;
        container.insertAdjacentHTML('beforeend', card);
    });

    // تحديث العدادات (اختياري)
    document.getElementById('todayOrdersCount').textContent = orders.length;
}

// 2. إدارة فتح وإغلاق المودال
document.getElementById('newOrderBtn').onclick = () => {
    orderForm.reset();
    orderModal.classList.remove('hidden');
};

document.getElementById('closeModalBtn').onclick = () => orderModal.classList.add('hidden');
document.getElementById('cancelModalBtn').onclick = () => orderModal.classList.add('hidden');

// 3. حفظ الطلب الجديد
orderForm.onsubmit = async (e) => {
    e.preventDefault();
    
    const custName = document.getElementById('custName').value.trim();
    const custPhone = document.getElementById('custPhone').value.trim();
    const packageVal = document.getElementById('packageSelect').value;

    if (!custName || !custPhone || !packageVal) {
        toast("يرجى تعبئة جميع الحقول", "error");
        return;
    }

    const btn = e.target.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin ml-2"></i> جاري الحفظ...';

    const newOrder = {
        customerName: custName,
        phone: custPhone,
        packageName: packageVal,
        price: packageVal, // السعر هو نفس قيمة الباقة حالياً
        createdAt: serverTimestamp(),
        status: "جديد"
    };

    try {
        await addDoc(collection(db, "orders"), newOrder);
        toast("تم إضافة الطلب بنجاح إلى منصة تيرا");
        orderModal.classList.add('hidden');
        renderOrders(); // إعادة تحميل القائمة
    } catch (err) {
        console.error(err);
        toast("فشل الاتصال بقاعدة البيانات", "error");
    } finally {
        btn.disabled = false;
        btn.textContent = "حفظ الطلب";
    }
};

// تشغيل النظام
window.addEventListener('DOMContentLoaded', renderOrders);
