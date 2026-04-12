// js/orders-app.js
import { db } from './orders-firebase-db.js';
import { toast, getOrders } from './orders-logic.js'; 
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

const container = document.getElementById('ordersContainer');
const orderModal = document.getElementById('orderModal');
const orderForm = document.getElementById('orderForm');

async function renderOrders() {
    // 1. إظهار مؤشر التحميل
    container.innerHTML = `
        <div class="col-span-full flex flex-col items-center justify-center py-20 opacity-50">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
            <p>جاري تحديث بيانات منصة تيرا...</p>
        </div>`;

    try {
        // 2. جلب البيانات من الدالة الموجودة في orders-logic
        const orders = await getOrders();
        
        // --- فحص أمان (اضغط F12 في المتصفح لرؤية هذا السطر) ---
        console.log("الطلبات التي وصلت للمتصفح:", orders);
        
        container.innerHTML = '';

        if (!orders || orders.length === 0) {
            container.innerHTML = `
                <div class="col-span-full text-center py-10">
                    <i class="fas fa-inbox text-4xl text-gray-200 mb-4"></i>
                    <p class="text-gray-500">لا يوجد طلبات مسجلة في "orders" حالياً</p>
                </div>`;
            return;
        }

        // 3. بناء الكروت
        orders.forEach(data => {
            const date = data.createdAt?.toDate ? data.createdAt.toDate().toLocaleDateString('ar-SA') : 'الآن';
            
            const card = `
                <div class="order-card shadow-sm border border-gray-100 p-5 rounded-2xl bg-white">
                    <div class="flex justify-between items-start mb-4">
                        <span class="text-xs text-gray-400">${date}</span>
                        <span class="status-badge px-3 py-1 rounded-full text-xs font-bold ${data.status === 'مكتمل' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}">
                            ${data.status || 'جديد'}
                        </span>
                    </div>
                    <h4 class="font-bold text-lg mb-2">${data.customerName}</h4>
                    <p class="text-sm text-gray-500 mb-4"><i class="fas fa-box ml-1 text-blue-400"></i> باقة سوا: ${data.packageName} ريال</p>
                    <div class="border-t pt-4 flex justify-between items-center">
                        <span class="font-bold text-blue-600">${data.price} ريال</span>
                        <a href="tel:${data.phone}" class="bg-blue-50 p-2 rounded-xl text-blue-600 hover:bg-blue-600 hover:text-white transition-all">
                            <i class="fas fa-phone-alt"></i>
                        </a>
                    </div>
                </div>`;
            container.insertAdjacentHTML('beforeend', card);
        });

        // تحديث عداد الإحصائيات
        const countElement = document.getElementById('todayOrdersCount');
        if (countElement) countElement.textContent = orders.length;

    } catch (err) {
        console.error("خطأ أثناء عرض البيانات:", err);
        toast("فشل عرض البيانات، تحقق من الكونسول", "error");
    }
}

// --- إدارة المودال والحفظ (بقية الكود الخاص بك سليمة) ---
document.getElementById('newOrderBtn').onclick = () => {
    orderForm.reset();
    orderModal.classList.remove('hidden');
};
document.getElementById('closeModalBtn').onclick = () => orderModal.classList.add('hidden');
document.getElementById('cancelModalBtn').onclick = () => orderModal.classList.add('hidden');

orderForm.onsubmit = async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin ml-2"></i> جاري الحفظ...';

    const newOrder = {
        customerName: document.getElementById('custName').value.trim(),
        phone: document.getElementById('custPhone').value.trim(),
        packageName: document.getElementById('packageSelect').value,
        price: document.getElementById('packageSelect').value,
        createdAt: serverTimestamp(),
        status: "جديد"
    };

    try {
        await addDoc(collection(db, "orders"), newOrder);
        toast("تم إضافة الطلب بنجاح");
        orderModal.classList.add('hidden');
        renderOrders(); 
    } catch (err) {
        toast("خطأ في الحفظ", "error");
    } finally {
        btn.disabled = false;
        btn.textContent = "حفظ الطلب";
    }
};

window.addEventListener('DOMContentLoaded', renderOrders);
