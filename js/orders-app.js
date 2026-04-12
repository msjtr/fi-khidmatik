// js/orders-app.js
import { db } from './orders-firebase-db.js';
import { toast, getOrders } from './orders-logic.js'; 
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

const container = document.getElementById('ordersContainer');
const orderModal = document.getElementById('orderModal');
const orderForm = document.getElementById('orderForm');

async function renderOrders() {
    container.innerHTML = `<div class="col-span-full text-center py-20 opacity-50">جاري تحميل بيانات العملاء...</div>`;

    const orders = await getOrders();
    container.innerHTML = '';

    if (!orders || orders.length === 0) {
        container.innerHTML = '<p class="col-span-full text-center py-10 text-gray-500 text-lg">لا توجد طلبات مسجلة في مجموعة (customers)</p>';
        return;
    }

    orders.forEach(data => {
        const date = data.createdAt?.toDate ? data.createdAt.toDate().toLocaleDateString('ar-SA') : 'الآن';
        
        // مرونة في قراءة الحقول (الاسم، الجوال، الباقة)
        const name = data.customerName || data.name || "عميل منصة تيرا";
        const phone = data.phone || data.mobile || "0000";
        const pkg = data.packageName || data.package || "سوا";
        const price = data.price || pkg;

        const card = `
            <div class="order-card shadow-sm border border-gray-100 p-5 rounded-2xl bg-white transition-hover hover:shadow-md">
                <div class="flex justify-between items-start mb-4">
                    <span class="text-xs text-gray-400">${date}</span>
                    <span class="status-badge px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-600">جديد</span>
                </div>
                <h4 class="font-bold text-lg mb-2">${name}</h4>
                <p class="text-sm text-gray-500 mb-4"><i class="fas fa-box ml-1 text-blue-400"></i> باقة سوا: ${pkg} ريال</p>
                <div class="border-t pt-4 flex justify-between items-center">
                    <span class="font-bold text-blue-600">${price} ريال</span>
                    <a href="tel:${phone}" class="bg-blue-600 p-2 rounded-xl text-white hover:bg-blue-700 transition-all">
                        <i class="fas fa-phone-alt"></i> اتصل
                    </a>
                </div>
            </div>`;
        container.insertAdjacentHTML('beforeend', card);
    });

    if (document.getElementById('todayOrdersCount')) {
        document.getElementById('todayOrdersCount').textContent = orders.length;
    }
}

// حفظ طلب جديد في مجموعة customers
orderForm.onsubmit = async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.innerHTML = 'جاري الحفظ...';

    const newOrder = {
        customerName: document.getElementById('custName').value.trim(),
        phone: document.getElementById('custPhone').value.trim(),
        packageName: document.getElementById('packageSelect').value,
        price: document.getElementById('packageSelect').value,
        createdAt: serverTimestamp(),
        status: "جديد"
    };

    try {
        // الحفظ في customers ليظهر مع البقية
        await addDoc(collection(db, "customers"), newOrder);
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

// إدارة المودال
document.getElementById('newOrderBtn').onclick = () => { orderForm.reset(); orderModal.classList.remove('hidden'); };
document.getElementById('closeModalBtn').onclick = () => orderModal.classList.add('hidden');
document.getElementById('cancelModalBtn').onclick = () => orderModal.classList.add('hidden');

window.addEventListener('DOMContentLoaded', renderOrders);
