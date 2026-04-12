import { TERMS_DATA } from './terms.js';
import { generateAllInvoiceQRs } from './zatca.js';

window.onload = async () => {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get('id');
    if (!orderId) return;

    try {
        // جلب البيانات مع التأكد من أسماء الحقول في قاعدة البيانات
        const order = await window.getDocument("orders", orderId);
        const customer = await window.getDocument("customers", order.customerId);
        const seller = window.invoiceSettings;

        // حل مشكلة الصور: استخدام رابط بديل شفاف في حال فشل التحميل
        const fallbackImg = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

        // تجميع العنوان الكامل
        const fullAddress = [
            customer.city || '',
            customer.district || '',
            customer.street || '',
            customer.address || ''
        ].filter(p => p && p !== 'undefined').join(" - ") || "غير مسجل";

        // إعداد تقسيم الصفحات (8 منتجات لكل صفحة)
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
                            <p><b>العنوان:</b> ${fullAddress}</p>
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
                            <th style="width:10%">السعر</th>
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

                <div class="barcode-standalone-area">
                    <div class="instruction-text">
                        <p><b>تعليمات الفاتورة:</b></p>
                        <p>تخضع هذه الفاتورة لكامل الشروط والأحكام المرفقة بموقع منصة في خدمتك.</p>
                    </div>
                    <div class="qr-grid-layout">
                        <div class="qr-card"><div id="zatcaQR1"></div><p>باركود الفاتورة</p></div>
                        <div class="qr-card"><div id="zatcaQR2"></div><p>باركود التحقق</p></div>
                        <div class="qr-card"><div id="zatcaQR3"></div><p>باركود المنصة</p></div>
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
        
        // توليد الباركودات في العناصر الجديدة
        if (typeof generateAllInvoiceQRs === 'function') {
            generateAllInvoiceQRs(order, seller, ["zatcaQR1", "zatcaQR2", "zatcaQR3"]);
        }
        
        document.getElementById('loader').style.display = 'none';
    } catch (e) { 
        console.error("Error in print.js:", e);
        document.getElementById('print-app').innerHTML = `<div style="padding:20px; text-align:center;">حدث خطأ أثناء تحميل البيانات: ${e.message}</div>`;
    }
};
