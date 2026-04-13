import { TERMS_DATA } from './terms.js';
import { OrderManager } from './order.js'; 
import { BarcodeManager } from './barcodes.js';
// تأكد من استيراد db إذا كنت تستخدم الإصدار الحديث
// import { db } from './firebase.js'; 

// 2. واجهة المستخدم (UI) - محسنة لدعم الـ Snapshot
const UI = {
    header: (seller) => `
        <div class="header-main">
            <img src="${seller.logo || 'assets/logo.png'}" class="main-logo">
            <div class="doc-label">فاتورة إلكترونية ضريبية</div>
            <div class="header-left-group">
                <div class="text-xs">شهادة العمل الحر: ${seller.licenseNumber || '---'}</div>
                <div class="text-xs">الرقم الضريبي: ${seller.taxNumber || '300000000000003'}</div>
            </div>
        </div>`,

    orderMeta: (order, customer, date, time) => {
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
                    <p class="company-name text-blue-600 font-bold">منصة تيرة (في خدمتك)</p>
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
                </div>
            </div>
        </div>

        <div class="order-info-line payment-line">
            <span><b>طريقة الدفع:</b> ${order.payment?.method || order.paymentMethod || 'إلكتروني'}</span>
            <span><b>طريقة الاستلام:</b> ${order.shipping?.type || order.deliveryMethod || 'تحميل رقمي'}</span>
        </div>`;
    },

    footer: (current, total) => `
        <div class="final-footer">
            <div class="contact-info-strip">
                <span>الهاتف: 966534051317+</span> | <span>الواتساب: 966545312021+</span> | <span>info@fi-khidmatik.com</span>
            </div>
            <div class="page-number-box">صفحة ${current} من ${total}</div>
        </div>`
};

window.onload = async () => {
    const orderId = new URLSearchParams(window.location.search).get('id');
    const loader = document.getElementById('loader');
    const printApp = document.getElementById('print-app');

    if (!orderId) return;

    try {
        const fullDetails = await OrderManager.getOrderFullDetails(orderId);
        if (!fullDetails) throw new Error("لم يتم العثور على بيانات الطلب");

        const { order, customer } = fullDetails;
        const seller = window.invoiceSettings || { taxNumber: "300000000000003" };
        const { date, time } = OrderManager.formatDateTime(order.createdAt);
        
        const termsArray = Object.values(TERMS_DATA);
        const items = order.items || [];
        const itemsPerPage = 6;
        const invPagesCount = Math.ceil(items.length / itemsPerPage) || 1;
        const totalPages = invPagesCount + Math.ceil(termsArray.length / 10);

        let html = '';

        // إنشاء صفحات الفاتورة
        for (let i = 0; i < invPagesCount; i++) {
            const pageItems = items.slice(i * itemsPerPage, (i + 1) * itemsPerPage);
            html += `
                <div class="page">
                    ${UI.header(seller)}
                    ${UI.orderMeta(order, customer, date, time)}
                    <table class="main-table text-right">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>المنتج</th>
                                <th>الكمية</th>
                                <th>السعر</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${pageItems.map((item, idx) => `
                                <tr>
                                    <td>${(i * itemsPerPage) + idx + 1}</td>
                                    <td class="product-cell">
                                        <div style="display: flex; align-items: center; gap: 10px;">
                                            ${item.image ? `<img src="${item.image}" style="width: 40px; height: 40px; border-radius: 6px; object-fit: cover; border: 1px solid #eee;">` : ''}
                                            <div style="text-align: right;">
                                                <div style="font-weight: 800; color: #1e293b;">${item.name}</div>
                                                <div style="font-size: 9px; color: #64748b; line-height: 1.2;">${item.desc || ''}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>${item.qty || 1}</td>
                                    <td class="font-bold">${parseFloat(item.price || 0).toFixed(2)} ر.س</td>
                                </tr>`).join('')}
                        </tbody>
                    </table>
                    ${i === invPagesCount - 1 ? renderFinancials(order) : ''}
                    ${UI.footer(i + 1, totalPages)}
                </div>`;
        }

        // إنشاء صفحات الشروط
        const termsPerPage = 10;
        for (let j = 0; j < termsArray.length; j += termsPerPage) {
            const pageTerms = termsArray.slice(j, j + termsPerPage);
            html += `
                <div class="page page-terms">
                    ${UI.header(seller)}
                    <h3 class="terms-title" style="margin-top: 20px; color: #2563eb; border-bottom: 2px solid #eff6ff; padding-bottom: 10px;">الشروط والأحكام العامة</h3>
                    <div class="terms-container-print">
                        ${pageTerms.map(text => `<div class="term-row-print"><p style="font-size: 11px; margin-bottom: 8px;">• ${text}</p></div>`).join('')}
                    </div>
                    ${UI.footer(invPagesCount + Math.floor(j/termsPerPage) + 1, totalPages)}
                </div>`;
        }

        printApp.innerHTML = html;
        if (loader) loader.style.display = 'none';
        if (printApp) printApp.classList.remove('hidden');

        // توليد الباركود (ZATCA و Website)
        if (typeof BarcodeManager !== 'undefined') {
            BarcodeManager.init(orderId, seller, order);
        }

    } catch (error) {
        console.error("Print Error:", error);
        if (loader) loader.innerHTML = `<div style="color:red; padding: 20px;">خطأ في النظام: ${error.message}</div>`;
    }
};

function renderFinancials(order) {
    const t = order.totals || {
        subtotal: order.subtotal || 0,
        tax: order.tax || 0,
        total: order.total || 0
    };

    return `
    <div class="financial-section">
        <div class="summary-box-final">
            <div class="s-line"><span>المجموع الفرعي:</span> <span>${parseFloat(t.subtotal).toLocaleString(undefined, {minimumFractionDigits: 2})} ر.س</span></div>
            <div class="s-line"><span>الضريبة (15%):</span> <span>${parseFloat(t.tax).toLocaleString(undefined, {minimumFractionDigits: 2})} ر.س</span></div>
            <div class="s-line grand-total-line"><span>الإجمالي النهائي:</span> <span style="font-size: 18px;">${parseFloat(t.total).toLocaleString(undefined, {minimumFractionDigits: 2})} ر.س</span></div>
        </div>
        <div class="barcode-group-print" style="display: flex; gap: 20px; align-items: center;">
            <div id="zatcaQR"></div>
            <div id="websiteQR"></div>
        </div>
    </div>`;
}

// أزرار التحكم - تحسين أداء الـ PDF
document.getElementById('downloadPDF').onclick = () => {
    const element = document.getElementById('print-app');
    const opt = {
        margin: 0,
        filename: `Tera_Invoice_${orderId}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false, letterRendering: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
};
