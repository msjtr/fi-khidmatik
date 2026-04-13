import { db } from './orders-firebase-db.js';
import { getOrders, getStock, deleteOrder, toast } from './orders-logic.js';
import { collection, addDoc, updateDoc, doc, serverTimestamp, getDocs } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

const container = document.getElementById('ordersContainer');
const orderForm = document.getElementById('orderForm');
const orderModal = document.getElementById('orderModal');

// 1. توليد رقم طلب تلقائي
document.getElementById('genNumBtn').onclick = () => {
    const random = Math.floor(1000 + Math.random() * 9000);
    document.getElementById('orderNumber').value = `KF-${random}-P`;
};

// 2. إدارة جلب العميل من الداتا
document.getElementById('customerSource').onchange = async (e) => {
    const isDb = e.target.value === 'db';
    document.getElementById('dbCustomerSection').classList.toggle('hidden', !isDb);
    if(isDb) {
        const snap = await getDocs(collection(db, "customers"));
        const customers = snap.docs.map(d => ({id: d.id, ...d.data()}));
        document.getElementById('dbCustomerSelect').innerHTML = customers.map(c => 
            `<option value="${c.id}" data-name="${c.customerName}" data-phone="${c.phone}">${c.customerName}</option>`
        ).join('');
    }
};

// عند اختيار عميل من القائمة، تعبئة الحقول تلقائياً
document.getElementById('dbCustomerSelect').onchange = (e) => {
    const opt = e.target.options[e.target.selectedIndex];
    document.getElementById('custName').value = opt.dataset.name;
    document.getElementById('custPhone').value = opt.dataset.phone;
};

// 3. العرض المطور (مع زر التعديل)
async function render() {
    container.innerHTML = '<p class="col-span-full text-center py-10">جاري تحميل منصة تيرا...</p>';
    const orders = await getOrders();
    container.innerHTML = '';

    orders.forEach(order => {
        const div = document.createElement('div');
        div.className = "bg-white p-5 rounded-2xl shadow-sm border border-gray-100";
        div.innerHTML = `
            <div class="flex justify-between items-start mb-2">
                <span class="text-xs font-bold text-blue-600">${order.orderNumber || 'بدون رقم'}</span>
                <div class="flex gap-2">
                    <button class="edit-btn text-green-500"><i class="fas fa-edit"></i></button>
                    <button class="del-btn text-red-400"><i class="fas fa-trash"></i></button>
                </div>
            </div>
            <h4 class="font-bold">${order.customerName}</h4>
            <p class="text-xs text-gray-400 mb-4">${order.orderDateTime?.replace('T', ' ') || ''}</p>
            <div class="flex justify-between border-t pt-4">
                <span class="font-bold text-blue-600">${order.price} ريال</span>
                <button class="preview-btn bg-gray-100 px-3 py-1 rounded-lg text-xs font-bold">معاينة</button>
            </div>
        `;
        div.querySelector('.del-btn').onclick = async () => { if(await deleteOrder(order.id)) render(); };
        div.querySelector('.preview-btn').onclick = () => openPreview(order);
        div.querySelector('.edit-btn').onclick = () => openEdit(order);
        container.appendChild(div);
    });

    const products = await getStock();
    document.getElementById('stockSelect').innerHTML = products.map(p => `<option value="${p.price}">${p.name}</option>`).join('');
}

// 4. فتح التعديل
function openEdit(order) {
    document.getElementById('modalTitle').textContent = "تعديل طلب عاجل";
    document.getElementById('editOrderId').value = order.id;
    document.getElementById('orderNumber').value = order.orderNumber || "KF-000-P";
    document.getElementById('orderDateTime').value = order.orderDateTime || "";
    document.getElementById('custName').value = order.customerName;
    document.getElementById('custPhone').value = order.phone;
    document.getElementById('paymentMethod').value = order.paymentMethod;
    orderModal.classList.remove('hidden');
}

// 5. حفظ الطلب (إضافة أو تعديل)
orderForm.onsubmit = async (e) => {
    e.preventDefault();
    const id = document.getElementById('editOrderId').value;
    const data = {
        orderNumber: document.getElementById('orderNumber').value,
        orderDateTime: document.getElementById('orderDateTime').value,
        customerName: document.getElementById('custName').value,
        phone: document.getElementById('custPhone').value,
        paymentMethod: document.getElementById('paymentMethod').value,
        packageName: document.getElementById('stockSelect').options[document.getElementById('stockSelect').selectedIndex].text,
        price: document.getElementById('stockSelect').value,
        updatedAt: serverTimestamp()
    };

    try {
        if(id) {
            await updateDoc(doc(db, "customers", id), data);
            toast("تم تحديث البيانات");
        } else {
            data.createdAt = serverTimestamp();
            data.status = "جديد";
            await addDoc(collection(db, "customers"), data);
            toast("تم إنشاء الطلب بنجاح");
        }
        orderModal.classList.add('hidden');
        render();
    } catch (e) { toast("خطأ في العملية", "error"); }
};

// وظائف المودال الباقية (الإغلاق، المعاينة) كما في الملف السابق
window.addEventListener('DOMContentLoaded', () => {
    render();
    // ضبط الوقت الحالي تلقائياً
    const now = new Date().toISOString().slice(0, 16);
    document.getElementById('orderDateTime').value = now;
});

document.getElementById('newOrderBtn').onclick = () => {
    orderForm.reset();
    document.getElementById('editOrderId').value = "";
    document.getElementById('modalTitle').textContent = "إنشاء طلب جديد";
    orderModal.classList.remove('hidden');
};
document.getElementById('closeModalBtn').onclick = () => orderModal.classList.add('hidden');
