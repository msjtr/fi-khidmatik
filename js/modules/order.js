import { db } from './firebase.js';
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    if (id) {
        const docRef = doc(db, "orders", id);
        const snap = await getDoc(docRef);
        
        if (snap.exists()) {
            renderInvoice(snap.data());
        }
    }
});

function renderInvoice(data) {
    // تعبئة بيانات العميل من اللقطة المباشرة
    document.getElementById('inv-cust-name').innerText = data.customerSnapshot.name;
    document.getElementById('inv-cust-phone').innerText = data.customerSnapshot.phone;
    document.getElementById('inv-cust-address').innerText = `${data.customerSnapshot.address.city} - ${data.customerSnapshot.address.street}`;
    
    // الوقت والتاريخ
    document.getElementById('inv-date').innerText = data.orderDate;
    document.getElementById('inv-time').innerText = data.orderTime || "---";
    document.getElementById('inv-no').innerText = data.orderNumber;

    // المنتجات
    const itemsHtml = data.items.map(item => `
        <div class="flex justify-between border-b py-2">
            <span>${item.name} (x${item.qty})</span>
            <span>${item.total} ر.س</span>
        </div>
    `).join('');
    document.getElementById('inv-items').innerHTML = itemsHtml;

    // الإجماليات
    document.getElementById('inv-total').innerText = data.totals.total;

    // توليد QR الزكاة (مثال مبسط)
    const qrText = `Seller: Tera | Date: ${data.orderDate} | Total: ${data.totals.total}`;
    new QRCode(document.getElementById("qrcode"), qrText);
}
