// js/orders-app.js
import { db } from './orders-firebase-db.js';
import { collection, getDocs, addDoc, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

const container = document.getElementById('ordersContainer');
const orderModal = document.getElementById('orderModal');

// 1. جلب وعرض الطلبات
async function loadOrders() {
    try {
        const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        container.innerHTML = '';

        if (snapshot.empty) {
            container.innerHTML = '<p class="col-span-full text-center py-10">لا يوجد طلبات مسجلة حالياً</p>';
            return;
        }

        snapshot.forEach(doc => {
            const data = doc.data();
            const card = `
                <div class="order-card">
                    <div class="flex justify-between items-start mb-4">
                        <span class="text-xs text-gray-400">${data.createdAt?.toDate().toLocaleDateString('ar-SA') || 'قيد المعالجة'}</span>
                        <span class="status-badge status-new">جديد</span>
                    </div>
                    <h4 class="font-bold text-lg mb-2">${data.customerName}</h4>
                    <p class="text-sm text-gray-500 mb-4"><i class="fas fa-box ml-1"></i> باقة: ${data.packageName} ريال</p>
                    <div class="border-t pt-4 flex justify-between items-center">
                        <span class="font-bold text-blue-600">${data.price} ريال</span>
                        <a href="tel:${data.phone}" class="text-blue-500"><i class="fas fa-phone"></i></a>
                    </div>
                </div>`;
            container.insertAdjacentHTML('beforeend', card);
        });
    } catch (err) {
        showToast("خطأ في تحميل البيانات", "error");
    }
}

// 2. إظهار الإشعارات
function showToast(msg, type = "success") {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.className = `success ${type === 'error' ? 'bg-red-500' : 'bg-green-500'}`;
    toast.style.display = 'block';
    setTimeout(() => toast.style.display = 'none', 3000);
}

// 3. إدارة فتح وإغلاق المودال
document.getElementById('newOrderBtn').onclick = () => orderModal.classList.remove('hidden');
document.getElementById('closeModalBtn').onclick = () => orderModal.classList.add('hidden');
document.getElementById('cancelModalBtn').onclick = () => orderModal.classList.add('hidden');

// 4. حفظ الطلب الجديد
document.getElementById('orderForm').onsubmit = async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = "جاري الحفظ...";

    const newOrder = {
        customerName: document.getElementById('custName').value,
        phone: document.getElementById('custPhone').value,
        packageName: document.getElementById('packageSelect').value,
        price: document.getElementById('packageSelect').value, // مثال
        createdAt: serverTimestamp(),
        status: "جديد"
    };

    try {
        await addDoc(collection(db, "orders"), newOrder);
        showToast("تم حفظ الطلب بنجاح");
        orderModal.classList.add('hidden');
        loadOrders(); // تحديث القائمة
    } catch (err) {
        showToast("حدث خطأ أثناء الحفظ", "error");
    } finally {
        btn.disabled = false;
        btn.textContent = "حفظ الطلب";
    }
};

// تشغيل عند التحميل
window.onload = loadOrders;
