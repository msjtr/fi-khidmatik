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

// 2. واجهة المستخدم (UI)
const UI = {
    header: (seller) => `
        <div class="header-main">
            <img src="${seller.logo || ''}" class="main-logo">
            <div class="doc-label">فاتورة إلكترونية ضريبية</div>
            <div class="header-left-group">
                <div>شهادة العمل الحر: ${seller.licenseNumber || '---'}</div>
                <div>الرقم الضريبي: ${seller.taxNumber || '---'}</div>
            </div>
        </div>`,

    orderMeta: (order, customer, date, time) => `
        <div class="order-info-line">
            <span><b>رقم الفاتورة:</b> ${order.orderNumber || order.id}</span>
            <span><b>التاريخ:</b> ${date}</span>
            <span><b>الوقت:</b> ${time}</span>
            <span><b>حالة الطلب:</b> <span class="status-badge">تم التنفيذ</span></span>
        </div>

        <div class="dual-columns">
            <div class="address-card">
                <div class="card-head">مصدرة من</div>
                <div class="card-body">
                    <p class="company-name">منصة في خدمتك</p>
                    <p>المملكة العربية السعودية</p>
                    <p>حائل : حي النقرة : شارع : سعد المشاط</p>
                    <p>رقم المبنى: 3085 | الرقم الإضافي: 7718 | الرمز البريدي: 55431</p>
                </div>
            </div>
            <div class="address-card">
                <div class="card-head">مصدرة إلى</div>
                <div class="card-body">
                    <p><b>اسم العميل:</b> ${customer.name || '---'}</p>
                    <p><b>المدينة:</b> ${customer.city || '---'} | <b>الحي:</b> ${customer.district || '---'}</p>
                    <p><b>الشارع:</b> ${customer.street || '---'}</p>
                    <p><b>رقم المبنى:</b> ${customer.buildingNumber || '---'} | <b>الرقم الإضافي:</b> ${customer.additionalNumber || '---'} | <b>الرمز البريدي:</b> ${customer.postalCode || '---'}</p>
                    <p><b>الجوال:</b> ${customer.phone || '---'}</p>
                </div>
            </div>
        </div>

        <div class="order-info-line payment-line">
            <span><b>طريقة الدفع:</b> ${order.paymentMethod || 'إلكتروني'}</span>
            <span><b>طريقة الاستلام:</b> ${order.deliveryMethod || order.shippingMethod || 'تحميل رقمي'}</span>
        </div>`,

    footer: (current, total) => `
        <div class="final-footer">
            <div class="contact-info-strip">
                <span>الهاتف: 966534051317+</span> | <span>الواتساب: 966545312021+</span> | <span>info@fi-khidmatik.com</span>
            </div>
            <div class="page-number-box">صفحة ${current} من ${total}</div>
        </div>`
};

// 3. الوظيفة الرئيسية
window.onload = async () => {
    const orderId = new URLSearchParams(window.location.search).get('id');
    const loader = document.getElementById('loader');
    const printApp = document.getElementById('print-app');

    if (!orderId) return;

    try {
        // الاستدعاء من OrderManager لضمان توحيد البيانات (الشارع وغيرها)
        const fullDetails = await OrderManager.getOrderFullDetails(orderId);
        
        if (!fullDetails) {
            throw new Error("لم يتم العثور على بيانات الطلب عبر OrderManager");
        }

        const { order, customer } = fullDetails;
        const seller = window.invoiceSettings || {};
        const { date, time } = OrderManager.formatDateTime(order.createdAt);
        
        const termsArray = Object.values(TERMS_DATA);
        const items = order.items || [];
        const itemsPerPage = 6;
        const invPagesCount = Math.ceil(items.length / itemsPerPage) || 1;
        const totalPages = invPagesCount + Math.ceil(termsArray.length / 10);

        let html = '';

        for (let i = 0; i < invPagesCount; i++) {
            const pageItems = items.slice(i * itemsPerPage, (i + 1) * itemsPerPage);
            html += `
                <div class="page">
                    ${UI.header(seller)}
                    ${UI.orderMeta(order, customer, date, time)}
                    <table class="main-table">
                        <thead><tr><th>#</th><th>المنتج</th><th>الكمية</th><th>السعر</th></tr></thead>
                        <tbody>
                            ${pageItems.map((item, idx) => `
                                <tr>
                                    <td>${(i * itemsPerPage) + idx + 1}</td>
                                    <td><b>${item.name}</b></td>
                                    <td>${item.qty || 1}</td>
                                    <td>${(item.price || 0).toLocaleString()} ر.س</td>
                                </tr>`).join('')}
                        </tbody>
                    </table>
                    ${i === invPagesCount - 1 ? renderFinancials(order) : ''}
                    ${UI.footer(i + 1, totalPages)}
                </div>`;
        }

        // صفحات الشروط
        const termsPerPage = 10;
        for (let j = 0; j < termsArray.length; j += termsPerPage) {
            const pageTerms = termsArray.slice(j, j + termsPerPage);
            html += `
                <div class="page page-terms">
                    ${UI.header(seller)}
                    <h3 class="terms-title">الشروط والأحكام العامة</h3>
                    <div class="terms-container-print">
                        ${pageTerms.map(text => `<div class="term-row-print"><p>${text}</p></div>`).join('')}
                    </div>
                    ${UI.footer(invPagesCount + Math.floor(j/termsPerPage) + 1, totalPages)}
                </div>`;
        }

        printApp.innerHTML = html;
        if (loader) loader.style.display = 'none';

        if (typeof BarcodeManager !== 'undefined') {
            BarcodeManager.init(order.id, seller, order);
        }

    } catch (error) {
        console.error("Print Error:", error);
        if (loader) loader.innerHTML = "خطأ في الربط: " + error.message;
    }
};

function renderFinancials(order) {
    const subtotal = order.subtotal || 0;
    const total = order.total || 0;
    const tax = total - subtotal;
    return `
    <div class="financial-section">
        <div class="summary-box-final">
            <div class="s-line"><span>المجموع:</span> <span>${subtotal.toLocaleString()} ر.س</span></div>
            <div class="s-line"><span>الضريبة (15%):</span> <span>${tax.toLocaleString()} ر.س</span></div>
            <div class="s-line grand-total-line"><span>الإجمالي النهائي:</span> <span>${total.toLocaleString()} ر.س</span></div>
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
