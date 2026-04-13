// js/orders-app.js
import { getOrders, getStock, deleteOrder, toast } from './orders-logic.js';
import { db } from './orders-firebase-db.js';
import { collection, addDoc, updateDoc, doc, serverTimestamp, getDocs } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

const container = document.getElementById('ordersContainer');
const orderForm = document.getElementById('orderForm');

async function render(filter = 'الكل') {
    container.innerHTML = '<div class="col-span-full text-center py-10">جاري الاتصال بقاعدة بيانات تيرا...</div>';
    
    const orders = await getOrders(filter);
    
    if (!orders || orders.length === 0) {
        container.innerHTML = '<div class="col-span-full text-center py-10 text-gray-400">لا توجد بيانات حالياً في مجموعة customers</div>';
        return;
    }

    container.innerHTML = '';
    orders.forEach(order => {
        // معالجة مسميات الحقول المختلفة (دعم Name أو customerName)
        const name = order.customerName || order.name || "عميل بدون اسم";
        const phone = order.phone || order.mobile || "0000";
        const price = order.price || order.total || 0;
        const num = order.orderNumber || `KF-${order.id.substring(0,4)}-P`;

        const card = document.createElement('div');
        card.className = "bg-white p-5 rounded-2xl shadow-sm border border-gray-100 relative";
        card.innerHTML = `
            <div class="flex justify-between items-start mb-2">
                <span class="text-xs font-bold text-blue-600">${num}</span>
                <div class="flex gap-2">
                    <button class="edit-btn text-green-500 hover:scale-110 transition-transform"><i class="fas fa-edit"></i></button>
                    <button class="del-btn text-red-300 hover:text-red-500"><i class="fas fa-trash"></i></button>
                </div>
            </div>
            <h4 class="font-bold text-lg">${name}</h4>
            <div class="flex justify-between items-center mt-4 border-t pt-4">
                <span class="font-bold text-blue-600">${price} ريال</span>
                <a href="tel:${phone}" class="p-2 bg-blue-600 text-white rounded-lg text-xs">اتصال</a>
            </div>
        `;
        
        card.querySelector('.del-btn').onclick = async () => { if(await deleteOrder(order.id)) render(); };
        card.querySelector('.edit-btn').onclick = () => openEdit(order);
        container.appendChild(card);
    });
}

// دالة جلب العملاء للقائمة المنسدلة
async function loadDbCustomers() {
    const dbSelect = document.getElementById('dbCustomerSelect');
    if(!dbSelect) return;
    
    const snap = await getDocs(collection(db, "customers"));
    const customers = snap.docs.map(d => ({id: d.id, ...d.data()}));
    
    dbSelect.innerHTML = '<option value="">-- اختر عميل من النظام --</option>';
    customers.forEach(c => {
        const name = c.customerName || c.name;
        if(name) {
            dbSelect.innerHTML += `<option value="${c.id}" data-name="${name}" data-phone="${c.phone || c.mobile}">${name}</option>`;
        }
    });
}

// عند تغيير مصدر العميل
document.getElementById('customerSource').onchange = (e) => {
    const isDb = e.target.value === 'db';
    document.getElementById('dbCustomerSection').classList.toggle('hidden', !isDb);
    if(isDb) loadDbCustomers();
};

// ... (باقي دوال الحفظ والمودال تبقى كما هي)

window.addEventListener('DOMContentLoaded', () => render());
