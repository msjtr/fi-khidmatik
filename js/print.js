import { TERMS_DATA } from './terms.js';
import { OrderManager } from './order.js';
import { BarcodeManager } from './barcodes.js';

// 1. التهيئة الفورية لقاعدة البيانات (يجب أن تسبق أي عملية جلب)
const firebaseConfig = {
    apiKey: "AIzaSyBWYW6Qqlhh904pBeuJ29wY7Cyjm2uklBA",
    authDomain: "msjt301-974bb.firebaseapp.com",
    projectId: "msjt301-974bb",
    storageBucket: "msjt301-974bb.firebasestorage.app",
    messagingSenderId: "186209858482",
    appId: "1:186209858482:web:186ca610780799ef562aab"
};

if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
window.db = firebase.firestore(); // تعريف عالمي

const UI = {
    header: (title, seller) => `
        <div class="header-main">
            <img src="${seller.logo}" class="main-logo">
            <div class="doc-label">${title}</div>
            <div class="header-left-group">
                <div>رخصة العمل الحر: ${seller.licenseNumber}</div>
                <div>الرقم الضريبي: ${seller.taxNumber}</div>
            </div>
        </div>`,

    orderMeta: (order, customer, date, time, seller) => {
        const fullAddress = [customer.city, customer.district, customer.street].filter(Boolean).join(' - ') || 'المملكة العربية السعودية';
        return `
        <div class="order-meta-row">
            <span><b>رقم الفاتورة:</b> ${order.orderNumber || order.id}</span>
            <span><b>التاريخ:</b> ${date} | ${time}</span>
        </div>
        <div class="dual-columns">
            <div class="address-card">
                <div class="card-head">المورد (البائع)</div>
                <div class="card-body">
                    <p><b>${seller.name}</b></p>
                    <p>${seller.address}</p>
                    <p>البريد: ${seller.email}</p>
                    <p>الجوال: ${seller.phone}</p>
                </div>
            </div>
            <div class="address-card">
                <div class="card-head">العميل (المشتري)</div>
                <div class="card-body">
                    <p><b>الاسم:</b> ${customer.name || '---'}</p>
                    <p><b>العنوان:</b> ${fullAddress}</p>
                    <p><b>البريد:</b> ${customer.email || '---'}</p>
                    <p><b>الجوال:</b> ${customer.phone || '---'}</p>
                </div>
            </div>
        </div>`;
    },

    footer: (current, total, seller) => `
        <div class="final-footer">
            <div class="contact-strip">${seller.phone} | ${seller.email} | ${seller.website}</div>
            <div class="page-number">صفحة ${current} من ${total}</div>
        </div>`
};

window.onload = async () => {
    const orderId = new URLSearchParams(window.location.search).get('id');
    if (!orderId) {
        document.getElementById('loader-text').innerText = "خطأ: لم يتم العثور على رقم الطلب";
        return;
    }

    try {
        const data = await OrderManager.getOrderFullDetails(orderId);
        if (!data) throw new Error("لم يتم العثور على بيانات الطلب");

        const { order, customer } = data;
        const seller = window.invoiceSettings;
        const { date, time } = OrderManager.formatDateTime(order.createdAt);

        const itemsPerPage = 6;
        const termsPerPage = 12;
        const invPages = Math.ceil((order.items?.length || 1) / itemsPerPage);
        const totalPages = invPages + Math.ceil(TERMS_DATA.length / termsPerPage);

        let html = '';

        for (let i = 0; i < invPages; i++) {
            const pageItems = (order.items || []).slice(i * itemsPerPage, (i + 1) * itemsPerPage);
            html += `
                <div class="page">
                    ${UI.header("فاتورة إلكترونية ضريبية", seller)}
                    ${i === 0 ? UI.orderMeta(order, customer, date, time, seller) : ''}
                    <table class="main-table">
                        <thead><tr><th>#</th><th>المنتج</th><th>الوصف</th><th>الصورة</th><th>الكمية</th><th>السعر</th></tr></thead>
                        <tbody>
                            ${pageItems.map((item, idx) => `
                                <tr>
                                    <td>${(i * itemsPerPage) + idx + 1}</td>
                                    <td><b>${item.name}</b></td>
                                    <td class="small-text">${item.description || '-'}</td>
                                    <td><img src="${item.image || 'images/placeholder.png'}" class="product-img-print"></td>
                                    <td>${item.qty}</td>
                                    <td>${(item.price || 0).toLocaleString()} ر.س</td>
                                </tr>`).join('')}
                        </tbody>
                    </table>
                    ${i === invPages - 1 ? renderFinancials(order) : ''}
                    ${UI.footer(i + 1, totalPages, seller)}
                </div>`;
        }

        // صفحات الشروط
        for (let j = 0; j < TERMS_DATA.length; j += termsPerPage) {
            const pageTerms = TERMS_DATA.slice(j, j + termsPerPage);
            const pageNum = invPages + Math.floor(j / termsPerPage) + 1;
            html += `
                <div class="page page-terms">
                    ${UI.header("الشروط والأحكام العامة", seller)}
                    <div class="terms-grid">
                        ${pageTerms.map((t, idx) => `
                            <div class="term-item"><span class="term-num">${j + idx + 1}</span><p class="term-text">${t}</p></div>
                        `).join('')}
                    </div>
                    ${UI.footer(pageNum, totalPages, seller)}
                </div>`;
        }

        document.getElementById('print-app').innerHTML = html;
        BarcodeManager.init(orderId, seller, order);
        document.getElementById('loader').style.display = 'none';

    } catch (e) {
        console.error("Print Engine Error:", e);
        document.getElementById('loader-text').innerHTML = `<span style="color:red">خطأ في التحميل: ${e.message}</span>`;
    }
};

function renderFinancials(order) {
    const subtotal = order.subtotal || 0;
    const total = order.total || 0;
    const tax = total - subtotal;
    return `
    <div class="financial-section">
        <div class="summary-box-final">
            <div class="s-line"><span>المجموع (بدون ضريبة):</span> <span>${subtotal.toLocaleString()} ر.س</span></div>
            <div class="s-line"><span>الضريبة (15%):</span> <span>${tax.toLocaleString()} ر.س</span></div>
            <div class="s-line grand-total-line"><span>الإجمالي النهائي:</span> <span>${total.toLocaleString()} ر.س</span></div>
        </div>
        <div class="barcode-group-print"><div id="zatcaQR"></div><div id="websiteQR"></div><div id="downloadQR"></div></div>
    </div>`;
}

// أفعال الأزرار
document.getElementById('downloadPDF').onclick = () => {
    const element = document.getElementById('print-app');
    html2pdf().set({
        margin: 0, filename: `Invoice_${new Date().getTime()}.pdf`,
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    }).from(element).save();
};
document.getElementById('printPage').onclick = () => window.print();
