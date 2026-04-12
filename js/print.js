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

        // صورة شفافة بديلة في حال تعذر تحميل صورة المنتج
        const fallbackImg = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

        const items = order.items || [];
        const itemsPerPage = 8; 
        const pages = [];
        for (let i = 0; i < items.length; i += itemsPerPage) {
            pages.push(items.slice(i, i + itemsPerPage));
        }

        let html = '';
        pages.forEach((pageItems, index) => {
            const isFirstPage = index === 0;
            const isLastPage = index === pages.length - 1;

            html += `
            <div class="page">
                <div class="header-main">
                    <div class="header-right-group">
                        <img src="images/logo.svg" class="main-logo" onerror="this.src='${fallbackImg}'">
                        <div class="brand-info">
                            <div class="brand-name">في خدمتك</div>
                            <div class="brand-slogan">من الإتقان بلس</div>
                        </div>
                    </div>
                    <div class="header-center-title"><div class="doc-label">فاتورة إلكترونية</div></div>
                    <div class="header-left-group">
                        <div>رقم شهادة العمل الحر: FL-765735204</div>
                        <div>الرقم الضريبي: 312495447600003</div>
                    </div>
                </div>

                ${isFirstPage ? `
                <div class="order-meta-row">
                    <span><b>رقم الطلب:</b> ${order.orderNumber || order.id || orderId}</span>
                    <span><b>التاريخ:</b> ${new Date(order.createdAt).toLocaleDateString('ar-SA')}</span>
                    <span><b>حالة الطلب:</b> ${order.status || 'تم التنفيذ'}</span>
                </div>

                <div class="dual-columns">
                    <div class="address-card">
                        <div class="card-head">مصدرة من</div>
                        <div class="card-body">
                            <p><b>منصة في خدمتك</b></p>
                            <p>المملكة العربية السعودية - حائل</p>
                            <p>حي النقرة : شارع سعد المشاط</p>
                            <p>مبنى: 3085 | إضافي: 7718 | بريد: 55431</p>
                        </div>
                    </div>
                    <div class="address-card">
                        <div class="card-head">مصدرة إلى</div>
                        <div class="card-body">
                            <p><b>اسم العميل:</b> ${customer.name || '---'}</p>
                            <p><b>المدينة:</b> ${customer.city || '---'}</p>
                            <p><b>الجوال:</b> ${customer.phone || '---'}</p>
                        </div>
                    </div>
                </div>

                <div class="single-row-payment">
                    <div class="p-item"><b>طريقة الدفع:</b> ${window.getPaymentName(order.paymentMethod)}</div>
                    <div class="p-item"><b>رمز الموافقة:</b> ${order.approvalCode || '---'}</div>
                    <div class="p-item"><b>طريقة الاستلام:</b> ${order.deliveryMethod || 'استلام إلكتروني'}</div>
                </div>
                ` : ''}

                <div class="section-title-bar">تفاصيل المنتجات والخدمات</div>

                <table class="main-table">
                    <thead>
                        <tr>
                            <th style="width:5%">#</th>
                            <th style="width:25%">اسم المنتج</th>
                            <th style="width:35%">وصف المنتج / الخدمة</th>
                            <th style="width:15%">صورة المنتج</th>
                            <th style="width:10%">الكمية</th>
                            <th style="width:10%">سعر الأفرادي</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${pageItems.map((item, i) => `
                        <tr>
                            <td>${(index * itemsPerPage) + i + 1}</td>
                            <td><b>${item.name || '---'}</b></td>
                            <td class="text-small">${item.description || 'لا يوجد وصف متاح'}</td>
                            <td><img src="${item.image ? window.getFinalImageUrl(item.image) : fallbackImg}" class="table-img" onerror="this.src='${fallbackImg}'"></td>
                            <td>${item.qty || 1}</td>
                            <td>${item.price || 0} ريال</td>
                        </tr>`).join('')}
                    </tbody>
                </table>

                ${isLastPage ? `
                <div class="financial-section">
                    <div class="summary-box-final">
                        <div class="s-line"><span>المجموع الفرعي:</span> <span>${(order.subtotal || 0).toFixed(2)} ريال</span></div>
                        <div class="s-line"><span>إجمالي الخصم:</span> <span>${(order.discount || 0).toFixed(2)} - ريال</span></div>
                        <div class="s-line"><span>الضريبة (15%):</span> <span>${(order.tax || 0).toFixed(2)} ريال</span></div>
                        <div class="s-line grand-total-line"><span>الإجمالي النهائي شامل الضريبة:</span> <span>${(order.total || 0).toFixed(2)} ريال</span></div>
                    </div>
                </div>

                <div style="display:flex; gap:20px; justify-content:center; margin-top:30px; border-top:1px dashed #ccc; padding-top:20px;">
                    <div class="barcode-item">
                        <div id="zatcaQR" class="qr-code"></div>
                        <p>
                            🔍 التحقق من التسجيل الضريبي – هيئة الزكاة والضريبة والجمارك<br>
                            <a href="https://zatca.gov.sa/ar/eServices/Pages/TaxpayerLookup.aspx" target="_blank">zatca.gov.sa</a>
                        </p>
                    </div>

                    <div class="barcode-item">
                        <div id="websiteQR" class="qr-code"></div>
                        <p>
                            🌐 زيارة الموقع الرسمي لمنصة في خدمتك<br>
                            <a href="https://linktr.ee/fikhidmatik" target="_blank">linktr.ee/fikhidmatik</a>
                        </p>
                    </div>

                    <div class="barcode-item">
                        <div id="downloadQR" class="qr-code"></div>
                        <p>
                            📄 عرض وتحميل الفاتورة الإلكترونية<br>
                            <a id="invoiceLink" target="_blank">رابط الفاتورة</a>
                        </p>
                    </div>
                </div>
                ` : ''}

                <div class="final-footer">
                    ${isLastPage ? `<div class="thanks-msg">شكراً لتسوقكم معنا</div>` : ''}
                    <div class="contact-strip">
                        <span>الهاتف: 966534051317+</span>
                        <span>الواتس اب: 966545312021+</span>
                        <span>info@fi-khidmatik.com</span>
                        <span>www.khidmatik.com</span>
                    </div>
                    <div class="legal-stamp">هذه الفاتورة إلكترونية - نسخة معتمدة قانونياً</div>
                    <div class="page-number">صفحة ${index + 1} من ${pages.length}</div>
                </div>
            </div>`;
        });

        document.getElementById('print-app').innerHTML = html;
        
        // ربط رابط الفاتورة
        const invLink = document.getElementById('invoiceLink');
        if(invLink) invLink.href = window.location.href;

        // توليد الباركودات (تأكد من أن مكتبة الـ QR مدعومة في generateAllInvoiceQRs)
        generateAllInvoiceQRs(order, seller, ["zatcaQR", "websiteQR", "downloadQR"]);
        
        document.getElementById('loader').style.display = 'none';
    } catch (e) { console.error(e); }
};
