import { TERMS_DATA } from './terms.js';
import { generateAllInvoiceQRs } from './zatca.js';

window.onload = async () => {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get('id');
    if (!orderId) return;

    try {
        const order = await window.getDocument("orders", orderId);
        const customer = await window.getDocument("customers", order.customerId);
        const seller = window.invoiceSettings;

        // بناء محتوى الفاتورة بناءً على القيم الثابتة في ملف 2222.pdf
        let html = `
        <div class="page invoice-page">
            <div class="header-main">
                <div class="header-right">رقم شهادة العمل الحر: 765735204-FL</div>
                <div class="header-center"><img src="images/logo.svg" alt="شعار المنصة"></div>
                <div class="header-left">الرقم الضريبي: 312495447600003</div>
            </div>

            <h2 class="doc-title-box">فاتورة إلكترونية</h2>

            <div class="meta-section">
                <span><b>رقم الفاتورة:</b> KF-2603290287</span>
                <span><b>التاريخ:</b> 29/03/2026 <b>الوقت:</b> 03:21 صباحاً</span>
                <span><b>حالة الطلب:</b> تم التنفيذ</span>
            </div>

            <div class="dual-grid">
                <div class="address-card">
                    <div class="card-head">مصدرة من [cite: 157]</div>
                    <div class="card-body">
                        <p><b>منصة في خدمتك</b> [cite: 159]</p>
                        <p>المملكة العربية السعودية [cite: 160]</p>
                        <p>حائل : حي النقرة : شارع : سعد المشاط [cite: 161]</p>
                        <p>رقم المبنى: 3085 | الإضافي : 7718 | الرمز البريدي 55431 [cite: 162]</p>
                    </div>
                </div>
                <div class="address-card">
                    <div class="card-head">مصدرة إلى [cite: 158]</div>
                    <div class="card-body">
                        <p><b>اسم العميل:</b> ${customer.name || 'محمد صالح جميعان الشمري'}</p>
                        <p>الدولة: المملكة العربية السعودية</p>
                        <p>المدينة: ${customer.city || 'حائل'}</p>
                        <p>العنوان: ${customer.address || ''}</p>
                        <p>الجوال: ${customer.phone || '966597771565'}</p>
                    </div>
                </div>
            </div>

            <div class="info-grid">
                <div class="info-item"><b>طريقة الدفع:</b> ${order.paymentMethod || 'mada'}</div>
                <div class="info-item"><b>رمز الموافقة:</b> ${order.approvalCode || '---'}</div>
                <div class="info-item"><b>طريقة الاستلام:</b> استلام إلكتروني</div>
            </div>

            <table class="main-table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>صورة المنتج</th>
                        <th>اسم المنتج ووصفه</th>
                        <th>الكمية</th>
                        <th>السعر</th>
                        <th>الوحدة</th>
                    </tr>
                </thead>
                <tbody>
                    ${(order.items || []).map((item, i) => `
                    <tr>
                        <td>${i + 1}</td>
                        <td><img src="${item.image}" class="table-img"></td>
                        <td class="text-right"><b>${item.name}</b><br><small>${item.description || ''}</small></td>
                        <td>${item.qty || 1}</td>
                        <td>${item.price} ريال</td>
                        <td>قطعة</td>
                    </tr>`).join('')}
                </tbody>
            </table>

            <div class="summary-wrapper">
                <div class="summary-box">
                    <div class="s-line"><span>المجموع الفرعي:</span> <span>19282.00 ريال</span></div>
                    <div class="s-line"><span>إجمالي الخصم:</span> <span>5784.60 - ريال</span></div>
                    <div class="s-line"><span>ضريبة القيمة المضافة (15%):</span> <span>2024.61 ريال</span></div>
                    <div class="s-line total"><span>الإجمالي النهائي شامل الضريبة:</span> <span>15522.01 ريال</span></div>
                </div>
            </div>

            <div class="qr-footer-section">
                <div id="zatcaQR" class="big-qr"></div>
                <p>باركود التحقق</p>
            </div>

            <div class="footer-bottom">
                <p><b>تعليمات الفاتورة:</b> تخضع هذه الفاتورة لكامل الشروط والأحكام المرفقة</p>
                <p>شكراً لتسوقكم معنا</p>
                <p>www.khidmatik.com | info@fi-khidmatik.com | +966545312021</p>
                <p class="legal-tag">هذه الفاتورة إلكترونية - نسخة معتمدة قانونياً</p>
            </div>
        </div>`;

        // توليد صفحات الشروط (3 صفحات إضافية) بنفس الهيدر والتذييل
        const chunks = [TERMS_DATA.slice(0, 20), TERMS_DATA.slice(20, 40), TERMS_DATA.slice(40, 57)];
        chunks.forEach((chunk, index) => {
            html += `
            <div class="page terms-page">
                <div class="header-main">
                    <div>رقم شهادة العمل الحر: 765735204-FL</div>
                    <div><img src="images/logo.svg"></div>
                    <div>الرقم الضريبي: 312495447600003</div>
                </div>
                <h2 class="doc-title-box">الشروط والأحكام</h2>
                <div class="terms-container">
                    ${chunk.map(term => `<div class="term-row"><b>${term.id}. ${term.t}:</b> ${term.c}</div>`).join('')}
                </div>
                <div class="footer-bottom">
                    <p>www.khidmatik.com | info@fi-khidmatik.com | صفحة ${index + 2} من 4</p>
                    <p class="legal-tag">هذه الفاتورة إلكترونية والشروط والأحكام - نسخة معتمدة قانونياً</p>
                </div>
            </div>`;
        });

        document.getElementById('print-app').innerHTML = html;
        generateAllInvoiceQRs(order, seller);
        document.getElementById('loader').style.display = 'none';
    } catch (e) { console.error(e); }
};
