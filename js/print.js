import { TERMS_DATA } from './terms.js';
import { OrderManager } from './order.js'; // إعادة الربط
import { BarcodeManager } from './barcodes.js';

// 1. إعدادات Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBWYW6Qqlhh904pBeuJ29wY7Cyjm2uklBA",
    authDomain: "msjt301-974bb.firebaseapp.com",
    projectId: "msjt301-974bb",
    storageBucket: "msjt301-974bb.firebasestorage.app",
    messagingSenderId: "186209858482",
    appId: "1:186209858482:web:186ca610780799ef562aab"
};

if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// ... (الإعدادات السابقة كما هي)

// تحديث واجهة بيانات العميل لتقرأ من الـ Snapshot
UI.orderMeta = (order, customer, date, time) => {
    // نتحقق أولاً هل البيانات مخزنة داخل Snapshot أم كبيانات مباشرة
    const cust = order.customerSnapshot || customer || {};
    const addr = cust.address || {};

    return `
        <div class="order-info-line">
            <span><b>رقم الفاتورة:</b> ${order.orderNumber || order.id}</span>
            <span><b>التاريخ:</b> ${order.orderDate || date}</span>
            <span><b>الوقت:</b> ${order.orderTime || time}</span>
            <span><b>حالة الطلب:</b> <span class="status-badge">تم التنفيذ</span></span>
        </div>

        <div class="dual-columns">
            <div class="address-card">
                <div class="card-head">مصدرة من</div>
                <div class="card-body">
                    <p class="company-name">منصة في خدمتك (تيرة)</p>
                    <p>المملكة العربية السعودية - حائل</p>
                    <p>حي النقرة : شارع سعد المشاط</p>
                    <p>رقم المبنى: 3085 | الرمز البريدي: 55431</p>
                </div>
            </div>
            <div class="address-card">
                <div class="card-head">مصدرة إلى (العميل)</div>
                <div class="card-body">
                    <p><b>اسم العميل:</b> ${cust.name || '---'}</p>
                    <p><b>الهاتف:</b> ${cust.phone || '---'}</p>
                    <p><b>العنوان:</b> ${addr.city || cust.city || ''} - ${addr.district || cust.district || ''}</p>
                    <p><b>الشارع:</b> ${addr.street || cust.street || '---'}</p>
                    <p><b>تفاصيل المبنى:</b> ${addr.building || cust.buildingNumber || '---'} | <b>الرمز البريدي:</b> ${addr.postal || cust.postalCode || '---'}</p>
                    <p><b>البريد:</b> ${cust.email || '---'}</p>
                </div>
            </div>
        </div>

        <div class="order-info-line payment-line">
            <span><b>طريقة الدفع:</b> ${order.payment?.method || order.paymentMethod || 'نقدي'}</span>
            <span><b>رقم الموافقة:</b> ${order.payment?.approvalNo || '---'}</span>
            <span><b>طريقة الاستلام:</b> ${order.shipping?.type || order.deliveryMethod || 'استلام من المقر'}</span>
        </div>`;
};

// تحديث عرض المنتجات ليشمل الوصف والصورة
// داخل حلقة الـ for الخاصة بالمنتجات، استبدل صف الجدول بـ:
/*
<tr>
    <td>${(i * itemsPerPage) + idx + 1}</td>
    <td class="product-cell">
        <div class="flex-prod">
            ${item.image ? `<img src="${item.image}" class="img-mini">` : ''}
            <div>
                <b>${item.name}</b>
                <div class="text-xs">${item.desc || ''}</div>
            </div>
        </div>
    </td>
    <td>${item.qty || 1}</td>
    <td>${parseFloat(item.price || 0).toFixed(2)} ر.س</td>
</tr>
*/

function renderFinancials(order) {
    // القراءة من كائن totals الذي أنشأناه في orders-app.js
    const t = order.totals || {};
    return `
    <div class="financial-section">
        <div class="summary-box-final">
            <div class="s-line"><span>المجموع الفرعي:</span> <span>${t.subtotal || 0} ر.س</span></div>
            <div class="s-line"><span>الضريبة (15%):</span> <span>${t.tax || 0} ر.س</span></div>
            <div class="s-line grand-total-line"><span>الإجمالي النهائي:</span> <span>${t.total || 0} ر.س</span></div>
        </div>
        <div class="barcode-group-print">
            <div id="zatcaQR"></div>
            <div id="websiteQR"></div>
        </div>
    </div>`;
}

document.getElementById('downloadPDF').onclick = () => {
    const element = document.getElementById('print-app');
    html2pdf().set({
        margin: 0, filename: `Invoice.pdf`,
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    }).from(element).save();
};

document.getElementById('printPage').onclick = () => window.print();
