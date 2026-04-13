import * as logic from './orders-logic.js';
import { db } from './firebase.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

let quill;
let currentItems = [];

document.addEventListener('DOMContentLoaded', async () => {
    if (document.getElementById('editor')) {
        quill = new Quill('#editor', { theme: 'snow' });
    }
    await initPage();
});

async function initPage() {
    // إعداد البيانات التلقائية
    document.getElementById('orderNo').value = logic.generateOrderNumber();
    document.getElementById('orderDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('orderTime').value = new Date().toLocaleTimeString('en-GB', {hour:'2-digit', minute:'2-digit'});

    // جلب العملاء من قاعدة البيانات
    const cSnap = await getDocs(collection(db, "customers"));
    const cSelect = document.getElementById('customerSelect');
    cSelect.innerHTML = '<option value="">-- عميل جديد / اختر عميل --</option>';
    cSnap.forEach(doc => {
        const c = doc.data();
        cSelect.innerHTML += `<option value='${JSON.stringify({id: doc.id, ...c})}'>${c.name}</option>`;
    });

    renderHistory();
}

// تعبئة بيانات العميل عند الاختيار
window.fillCustomerData = (json) => {
    if(!json) return;
    const c = JSON.parse(json);
    document.getElementById('cName').value = c.name || '';
    document.getElementById('cPhone').value = c.phone || '';
    document.getElementById('cEmail').value = c.email || '';
    document.getElementById('cCity').value = c.city || '';
};

// إضافة منتج للطلب الحالي
window.addItem = () => {
    const item = {
        name: document.getElementById('pName').value,
        qty: parseInt(document.getElementById('pQty').value) || 1,
        price: parseFloat(document.getElementById('pPrice').value) || 0,
        desc: quill.root.innerHTML
    };
    currentItems.push(item);
    updateSummary();
};

function updateSummary() {
    const subtotal = currentItems.reduce((s, i) => s + (i.price * i.qty), 0);
    const tax = subtotal * 0.15;
    document.getElementById('subtotalLabel').innerText = subtotal.toFixed(2);
    document.getElementById('taxLabel').innerText = tax.toFixed(2);
    document.getElementById('totalLabel').innerText = (subtotal + tax).toFixed(2);
}

// حفظ الطلب والطباعة
window.saveOrder = async () => {
    const orderData = {
        orderNumber: document.getElementById('orderNo').value,
        customerData: {
            name: document.getElementById('cName').value,
            phone: document.getElementById('cPhone').value,
            address: document.getElementById('cCity').value
        },
        items: currentItems,
        total: document.getElementById('totalLabel').innerText,
        paymentMethod: document.getElementById('payMethod').value,
        status: "جديد"
    };

    const docRef = await logic.saveToFirebase("orders", orderData);
    alert("تم الحفظ! جاري الانتقال للطباعة...");
    window.location.href = `../../fi-khidmatik/js/order.js?id=${docRef.id}`;
};

async function renderHistory() {
    const history = await logic.fetchHistory();
    const tbody = document.getElementById('ordersTableBody');
    tbody.innerHTML = history.map(o => `
        <tr class="border-b text-sm">
            <td class="p-4 font-bold">${o.orderNumber}</td>
            <td class="p-4">${o.customerName}</td>
            <td class="p-4">${o.total} ر.س</td>
            <td class="p-4 flex gap-2">
                <button onclick="window.location.href='../../fi-khidmatik/js/order.js?id=${o.id}'" class="text-blue-600"><i class="fas fa-print"></i></button>
                <button onclick="deleteOrder('${o.id}')" class="text-red-400"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}
