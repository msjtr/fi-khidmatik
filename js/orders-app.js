import { db } from './orders-firebase-db.js';
import { getOrders, getStock, deleteOrder, toast } from './orders-logic.js';
import { collection, addDoc, updateDoc, doc, serverTimestamp, getDocs } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

const container = document.getElementById('ordersContainer');
const orderForm = document.getElementById('orderForm');

// 1. توليد رقم الطلب تلقائياً
document.getElementById('genNumBtn').onclick = () => {
    const rand = Math.floor(1000 + Math.random() * 9000);
    document.getElementById('orderNumber').value = `KF-${rand}-P`;
};

// 2. تصفية وجلب الأسماء فقط من مجموعة customers
async function loadCustomerNames() {
    const snap = await getDocs(collection(db, "customers"));
    const seen = new Set();
    const uniqueNames = [];
    
    snap.docs.forEach(d => {
        const name = d.data().name || d.data().customerName;
        if(name && !seen.has(name)) {
            seen.add(name);
            uniqueNames.push({ name, phone: d.data().phone || "" });
        }
    });

    document.getElementById('dbCustomerSelect').innerHTML = '<option value="">-- اختر اسم عميل سابق --</option>' + 
        uniqueNames.map(c => `<option value="${c.name}" data-phone="${c.phone}">${c.name}</option>`).join('');
}

document.getElementById('dbCustomerSelect').onchange = (e) => {
    const opt = e.target.options[e.target.selectedIndex];
    document.getElementById('custName').value = opt.value;
    document.getElementById('custPhone').value = opt.dataset.phone;
};

// 3. ربط المعاينة بالطباعة و PDF بالبيانات الكاملة
window.openPreview = function(order) {
    const area = document.getElementById('printArea');
    area.innerHTML = `
        <div style="border: 2px solid #2563eb; padding: 25px; border-radius: 15px; direction: rtl; text-align: right; font-family: sans-serif;">
            <h2 style="text-align: center; color: #2563eb; margin-bottom: 20px;">فاتورة منصة تيرا</h2>
            <p><b>رقم الطلب:</b> ${order.orderNumber || 'KF-000-P'}</p>
            <p><b>العميل:</b> ${order.customerName || order.name}</p>
            <p><b>الجوال:</b> ${order.phone}</p>
            <p><b>الباقة:</b> ${order.packageName || order.product || 'طلب قديم'}</p>
            <hr style="margin: 15px 0;">
            <h3 style="text-align: center;">المبلغ الإجمالي: ${order.price || order.amount} ريال</h3>
        </div>
    `;
    document.getElementById('previewModal').classList.remove('hidden');
    document.getElementById('previewModal').classList.add('flex');

    document.getElementById('downloadPdfBtn').onclick = () => {
        const opt = { margin: 1, filename: `Tera-${order.orderNumber}.pdf`, html2canvas: { scale: 2 }, jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' } };
        html2pdf().from(area).set(opt).save();
    };
    document.getElementById('directPrintBtn').onclick = () => window.print();
};

// 4. عرض كافة السجلات
async function render() {
    container.innerHTML = '<p class="col-span-full text-center">جاري جلب بياناتك القديمة من 3 مجموعات...</p>';
    const orders = await getOrders();
    container.innerHTML = '';

    orders.forEach(order => {
        const div = document.createElement('div');
        div.className = "bg-white p-5 rounded-2xl shadow-sm border border-gray-100";
        div.innerHTML = `
            <div class="flex justify-between mb-2 text-xs font-bold text-blue-600">
                <span>${order.orderNumber || 'KF-000-P'}</span>
                <div class="flex gap-2">
                    <button class="edit-btn text-green-500"><i class="fas fa-edit"></i></button>
                    <button class="del-btn text-red-300"><i class="fas fa-trash"></i></button>
                </div>
            </div>
            <h4 class="font-bold">${order.customerName || order.name || 'بدون اسم'}</h4>
            <div class="flex justify-between items-center border-t mt-4 pt-4">
                <span class="font-bold text-blue-600">${order.price || order.amount || 0} ريال</span>
                <button class="view-btn bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-xs font-bold">معاينة</button>
            </div>
        `;
        div.querySelector('.del-btn').onclick = async () => { if(await deleteOrder(order.id)) render(); };
        div.querySelector('.view-btn').onclick = () => openPreview(order);
        div.querySelector('.edit-btn').onclick = () => openEdit(order);
        container.appendChild(div);
    });

    const products = await getStock();
    document.getElementById('stockSelect').innerHTML = products.map(p => `<option value="${p.price}">${p.name}</option>`).join('');
    loadCustomerNames();
}

// 5. حفظ وتعديل الطلب
orderForm.onsubmit = async (e) => {
    e.preventDefault();
    const id = document.getElementById('editOrderId').value;
    const data = {
        orderNumber: document.getElementById('orderNumber').value,
        customerName: document.getElementById('custName').value,
        phone: document.getElementById('custPhone').value,
        packageName: document.getElementById('stockSelect').options[document.getElementById('stockSelect').selectedIndex].text,
        price: document.getElementById('stockSelect').value,
        paymentMethod: document.getElementById('paymentMethod').value,
        orderDateTime: document.getElementById('orderDateTime').value
    };

    if(id) {
        await updateDoc(doc(db, "orders", id), data);
        toast("تم التعديل بنجاح");
    } else {
        data.createdAt = serverTimestamp();
        await addDoc(collection(db, "orders"), data);
        toast("تم إضافة الطلب للسجلات");
    }
    document.getElementById('orderModal').classList.add('hidden');
    render();
};

// فتح التعديل
function openEdit(order) {
    document.getElementById('modalTitle').textContent = "تعديل الطلب";
    document.getElementById('editOrderId').value = order.id;
    document.getElementById('orderNumber').value = order.orderNumber || "KF-000-P";
    document.getElementById('custName').value = order.customerName || order.name;
    document.getElementById('custPhone').value = order.phone;
    document.getElementById('orderModal').classList.remove('hidden');
}

// إغلاق المودالات
document.getElementById('newOrderBtn').onclick = () => {
    orderForm.reset();
    document.getElementById('editOrderId').value = "";
    document.getElementById('orderDateTime').value = new Date().toISOString().slice(0, 16);
    document.getElementById('orderModal').classList.remove('hidden');
};
document.getElementById('closeModalBtn').onclick = () => document.getElementById('orderModal').classList.add('hidden');
document.getElementById('closePreviewBtn').onclick = () => document.getElementById('previewModal').classList.add('hidden');

window.addEventListener('DOMContentLoaded', render);
