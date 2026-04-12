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

    orderMeta: (order, customer, date, time, seller) => {
        // التحقق من الحقول بمسميات مختلفة لضمان جلب البيانات من Firebase
        const bldg = customer.buildingNumber || customer.building_number || customer.building || '---';
        const addl = customer.additionalNumber || customer.additional_number || customer.additional || '---';
        const post = customer.postalCode || customer.postal_code || customer.zipCode || '---';

        return `
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
                    <p><b>المدينة:</b> ${customer.city || '---'} | <b>الحي:</b> ${customer.district || '---'} | <b>الشارع:</b> ${customer.street || '---'}</p>
                    <p>
                        <b>رقم المبنى:</b> ${bldg} | 
                        <b>الرقم الإضافي:</b> ${addl} | 
                        <b>الرمز البريدي:</b> ${post}
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
        </div>`;
    },

    footer: (current, total, seller) => `
        <div class="final-footer">
            <div class="contact-info-strip">
                <div class="contact-item"><span>الهاتف:</span><span class="num-dir">966534051317+</span></div>
                <div class="contact-item"><span>الواتس اب:</span><span class="num-dir">966545312021+</span></div>
                <div class="contact-item">info@fi-khidmatik.com</div>
                <div class="contact-item">www.khidmatik.com</div>
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
                    ${UI.order
