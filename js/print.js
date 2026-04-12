import { TERMS_DATA } from './terms.js';
import { generateAllInvoiceQRs } from './zatca.js';

window.onload = async () => {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get('id');

    if (!orderId) return;

    try {
        const order = await window.getDocument("orders", orderId);
        const customer = await window.getDocument("customers", order.customerId);
        const seller = window.invoiceSettings; // البيانات من invoice.js

        // الصفحة الأولى: الفاتورة الإلكترونية 
        let html = `
        <div class="page">
            <div class="header">
                <div class="header-meta">رقم شهادة العمل الحر: 765735204-FL</div>
                <div class="logo"><img src="images/logo.svg"></div>
                <div class="header-meta">الرقم الضريبي: 312495447600003</div>
            </div>

            <div class="doc-title">فاتورة إلكترونية</div>

            <div class="order-meta" style="display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 12px; border-bottom: 1px dashed #ccc; padding-bottom: 10px;">
                <div><b>رقم الفاتورة:</b> KF-2603290287</div>
                <div><b>التاريخ:</b> 29/03/2026 <b>الوقت:</b> 03:21 صباحاً</div>
                <div><b>حالة الطلب:</b> <span style="color: green; font-weight: bold;">تم التنفيذ</span></div>
            </div>

            <div class="addresses-grid">
                <div class="card">
                    <div class="card-h">مصدرة من [cite: 16, 18]</div>
                    <div class="card-b">
                        <p><b>منصة في خدمتك</b> [cite: 18]</p>
                        <p>المملكة العربية السعودية [cite: 19]</p>
                        <p>حائل: حي النقرة: شارع سعد المشاط [cite: 20]</p>
                        <p>مبنى: 3085 | إضافي: 7718 | بريد: 55431 [cite: 21]</p>
                    </div>
                </div>
                <div class="card">
                    <div class="card-h">مصدرة إلى [cite: 17, 22]</div>
                    <div class="card-b">
                        <p><b>اسم العميل:</b> ${customer.name || ''}</p>
                        <p>الدولة: المملكة العربية السعودية [cite: 23]</p>
                        <p>المدينة: ${customer.city || ''} | العنوان: ${customer.address || ''}</p>
                        <p>الجوال: ${customer.phone || ''} | البريد: ${customer.email || ''}</p>
                    </div>
                </div>
            </div>

            <div class="payment-grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 20px;">
                <div class="card"><div class="card-h">طريقة الدفع</div><div class="card-b">${order.paymentMethod || 'مدى'}</div></div>
                <div class="card"><div class="card-h">رمز الموافقة</div><div class="card-b">${order.approvalCode || '---'}</div></div>
                <div class="card"><div class="card-h">طريقة الاستلام</div><div class="card-b">استلام إلكتروني</div></div>
            </div>

            <table>
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
                    ${(order.items || []).map((item, index) => `
                    <tr>
                        <td>${index + 1}</td>
                        <td><img src="${item.image || ''}" class="product-img"></td>
                        <td style="text-align: right;"><b>${item.name}</b><br><small>${item.description || ''}</small></td>
                        <td>${item.qty}</td>
                        <td>${item.price} ريال</td>
                        <td>قطعة</td>
                    </tr>`).join('')}
                </tbody>
            </table>

            <div class="totals-area">
                <div class="total-row"><span>المجموع الفرعي</span> <span>19282.00 ريال</span></div>
                <div class="total-row"><span>إجمالي الخصم</span> <span>5784.60 - ريال</span></div>
                <div class="total-row"><span>ضريبة القيمة المضافة (15%)</span> <span>2024.61 ريال</span></div>
                <div class="total-row grand-total"><span>الإجمالي النهائي شامل الضريبة</span> <span>15522.01 ريال</span></div>
            </div>

            <div class="barcodes">
                <div class="barcode-item"><div id="zatcaQR"></div><small>باركود التحقق</small></div>
            </div>

            <div class="footer">
                <p>تخضع هذه الفاتورة لكامل الشروط والأحكام المرفقة [cite: 46]</p>
                <p>شكراً لتسوقكم معنا [cite: 47]</p>
                <p><b>${seller.website} | ${seller.email} | الهاتف: ${seller.phone} | الواتساب: ${seller.whatsapp}</b> [cite: 49]</p>
                <p>فاتورة إلكترونية - نسخة معتمدة قانونياً [cite: 50]</p>
            </div>
        </div>`;

        // صفحات الشروط والأحكام (ثلاث صفحات تالية) [cite: 6, 9]
        const chunks = [TERMS_DATA.slice(0, 20), TERMS_DATA.slice(20, 40), TERMS_DATA.slice(40, 57)];
        chunks.forEach((chunk, i) => {
            html += `
            <div class="page">
                <div class="header">
                    <div class="header-meta">رقم شهادة العمل الحر: 765735204-FL [cite: 7]</div>
                    <div class="logo"><img src="images/logo.svg"></div>
                    <div class="header-meta">الرقم الضريبي: 312495447600003 [cite: 10]</div>
                </div>
                <div class="doc-title">الشروط والأحكام [cite: 9]</div>
                <div class="terms-section">
                    ${chunk.map(c => `<div class="clause"><span class="c-num">${c.id}.</span><b>${c.t}:</b> ${c.c}</div>`).join('')}
                </div>
                <div class="footer">
                    <p>www.khidmatik.com | info@fi-khidmatik.com | صفحة ${i + 2} من 4 [cite: 49]</p>
                    <p>الشروط والأحكام - نسخة معتمدة قانونياً [cite: 50]</p>
                </div>
            </div>`;
        });

        document.getElementById('print-app').innerHTML = html;
        generateAllInvoiceQRs(order, seller);
        document.getElementById('loader').style.display = 'none';

    } catch (e) {
        console.error(e);
    }
};
