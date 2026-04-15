import { db } from './core/firebase.js';
import { doc, getDoc } from "firebase/firestore";
import { formatCurrency } from './utils/formatter.js';

const urlParams = new URLSearchParams(window.location.search);
const orderId = urlParams.get('orderId');

async function loadInvoice() {
    if (!orderId) return;
    const orderDoc = await getDoc(doc(db, "orders", orderId));
    if (!orderDoc.exists()) return;
    const order = orderDoc.data();
    const html = `
        <div class="invoice-header">
            <h1>فاتورة ضريبية</h1>
            <p>رقم الطلب: ${order.orderNumber}</p>
            <p>التاريخ: ${new Date(order.createdAt?.toDate()).toLocaleDateString()}</p>
            <p>العميل: ${order.customerName}</p>
        </div>
        <div class="invoice-items">
            <table>
                <thead><tr><th>المنتج</th><th>الكمية</th><th>السعر</th><th>الإجمالي</th></tr></thead>
                <tbody>
                    ${order.items.map(i => `<tr><td>${i.name}</td><td>${i.quantity}</td><td>${i.price}</td><td>${i.quantity * i.price}</td></tr>`).join('')}
                </tbody>
            </table>
            <h3>الإجمالي: ${formatCurrency(order.total)}</h3>
        </div>
        <div class="invoice-footer">
            <p>شكراً لثقتكم بخدماتي</p>
        </div>
    `;
    document.getElementById('invoice-content').innerHTML = html;
    window.print();
}

loadInvoice();
