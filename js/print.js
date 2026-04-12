import { TERMS_DATA } from './terms.js';
import { OrderManager } from './order.js';
import { BarcodeManager } from './barcodes.js';

const firebaseConfig = {
    apiKey: "AIzaSyBWYW6Qqlhh904pBeuJ29wY7Cyjm2uklBA",
    authDomain: "msjt301-974bb.firebaseapp.com",
    projectId: "msjt301-974bb",
    storageBucket: "msjt301-974bb.firebasestorage.app",
    messagingSenderId: "186209858482",
    appId: "1:186209858482:web:186ca610780799ef562aab"
};

if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
window.db = firebase.firestore();

const UI = {
    header: (title, seller) => `
        <div class="header-main">
            <img src="${seller.logo}" class="main-logo">
            <div class="doc-label">فاتورة إلكترونية</div>
            <div class="header-left-group">
                <div>شهادة العمل الحر: ${seller.licenseNumber}</div>
                <div>الرقم الضريبي: ${seller.taxNumber}</div>
            </div>
        </div>`,

    orderMeta: (order, customer, date, time, seller) => `
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
                    <p><b>الدولة:</b> المملكة العربية السعودية</p>
                    <p><b>العنوان:</b> ${customer.city || ''} : ${customer.district || ''} : ${customer.street || ''}</p>
                    <p>
                        <b>رقم المبنى:</b> ${customer.buildingNumber || '---'} | 
                        <b>الرقم الإضافي:</b> ${customer.additionalNumber || '---'} | 
                        <b>الرمز البريدي:</b> ${customer.postalCode || '---'}
                    </p>
                    <p><b>رقم الجوال:</b> ${customer.phone || '---'}</p>
                    <p><b>البريد الإلكتروني:</b> ${customer.email || '---'}</p>
                </div>
            </div>
        </div>

        <div class="order-info-line payment-line">
            <span><b>طريقة الدفع:</b> ${order.paymentMethod || 'إلكتروني'}</span>
            <span><b>رمز الموافقة على الطلب:</b> ${order.approvalCode || '---'}</span>
            <span><b>طريقة استلام المنتج:</b> ${order.deliveryMethod || 'تحميل رقمي'}</span>
        </div>`,

    footer: (current, total, seller) => `
        <div class="final-footer">
            <div class="contact-info-strip">
                <div class="contact-item"><span>الهاتف:</span><span class="num-dir">966534051317+</span></div>
                <div class="contact-item"><span>الواتس اب:</span><span class="num-dir">966545312021+</span></div>
                <div class="contact-item"><span>info@fi-khidmatik.com</span></div>
                <div class="contact-item"><span>www.khidmatik.com</span></div>
            </div>
            <div class="footer-legal-notice">هذه الفاتورة إلكترونية - نسخة معتمدة قانونياً</div>
            <div class="page-number-box">صفحة ${current} من ${total}</div>
        </div>`


        <div class="order-info-line payment-line">
            <span><b>طريقة الدفع:</b> ${order.paymentMethod || 'إلكتروني'}</span>
            <span><b>رمز الموافقة على الطلب:</b> ${order.approvalCode || '---'}</span>
            <span><b>طريقة استلام المنتج:</b> ${order.deliveryMethod || 'تحميل رقمي'}</span>
        </div>`,

        <div class="order-info-line payment-line">
            <span><b>طريقة الدفع:</b> ${order.paymentMethod || 'إلكتروني'}</span>
            <span><b>رمز الموافقة على الطلب:</b> ${order.approvalCode || '---'}</span>
            <span><b>طريقة استلام المنتج:</b> ${order.deliveryMethod || 'تحميل رقمي'}</span>
        </div>`,

    footer: (current, total, seller) => `
        <div class="final-footer">
            <div class="contact-info-strip">
                <div class="contact-item"><span>الهاتف:</span><span class="num-dir">966534051317+</span></div>
                <div class="contact-item"><span>الواتس اب:</span><span class="num-dir">966545312021+</span></div>
                <div class="contact-item"><span>info@fi-khidmatik.com</span></div>
                <div class="contact-item"><span>www.khidmatik.com</span></div>
            </div>
            <div class="footer-legal-notice">هذه الفاتورة إلكترونية - نسخة معتمدة قانونياً</div>
            <div class="page-number-box">صفحة ${current} من ${total}</div>
        </div>`
};

window.onload = async () => {
    const orderId = new URLSearchParams(window.location.search).get('id');
    if (!orderId) return;

    try {
        const data = await OrderManager.getOrderFullDetails(orderId);
        if (!data) throw new Error("لم يتم العثور على البيانات");

        const { order, customer } = data;
        const seller = window.invoiceSettings;
        const { date, time } = OrderManager.formatDateTime(order.createdAt);

        const termsArray = Object.values(TERMS_DATA);
        const itemsPerPage = 6;
        const termsPerPage = 10; 
        const invPages = Math.ceil((order.items?.length || 1) / itemsPerPage);
        const totalPages = invPages + Math.ceil(termsArray.length / termsPerPage);

        let html = '';

        for (let i = 0; i < invPages; i++) {
            const pageItems = (order.items || []).slice(i * itemsPerPage, (i + 1) * itemsPerPage);
            html += `
                <div class="page">
                    ${UI.header("فاتورة إلكترونية ضريبية", seller)}
                    ${UI.orderMeta(order, customer, date, time, seller)}
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

        for (let j = 0; j < termsArray.length; j += termsPerPage) {
            const pageTerms = termsArray.slice(j, j + termsPerPage);
            const pageNum = invPages + Math.floor(j / termsPerPage) + 1;
            html += `
                <div class="page page-terms">
                    ${UI.header("الشروط والأحكام العامة", seller)}
                    <div class="terms-container-print">
                        ${pageTerms.map((text) => {
                            const isTitle = /^(أولاً|ثانياً|ثالثاً|رابعاً|خامساً|سادساً|سابعاً|ثامناً|تاسعاً|عاشراً|حادي عشر|ثاني عشر)/.test(text);
                            return `
                                <div class="term-row-print ${isTitle ? 'term-title-style' : ''}">
                                    <p class="term-content-print">${text}</p>
                                </div>`;
                        }).join('')}
                    </div>
                    ${UI.footer(pageNum, totalPages, seller)}
                </div>`;
        }

        document.getElementById('print-app').innerHTML = html;
        BarcodeManager.init(orderId, seller, order);
        document.getElementById('loader').style.display = 'none';

    } catch (e) {
        console.error(e);
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
            <div id="downloadQR"></div>
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
