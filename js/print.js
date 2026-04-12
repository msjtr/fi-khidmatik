import { TERMS_DATA } from './terms.js';
import { OrderManager } from './order.js';
import { BarcodeManager } from './barcodes.js'; // الاستدعاء الجديد الموحد

window.onload = async () => {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get('id');
    if (!orderId) return;

    try {
        const data = await OrderManager.getOrderFullDetails(orderId);
        if (!data) return;

        const { order, customer } = data;
        const { date, time } = OrderManager.formatDateTime(order.createdAt);
        
        // استخدام بيانات البائع من invoice.js
        const seller = window.invoiceSettings; 

        // لوجو بديل
        const fallbackImg = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

        const items = order.items || [];
        const itemsPerPage = 7; // تقليل العدد قليلاً لضمان وسع الباركودات
        const invoicePagesCount = Math.ceil(items.length / itemsPerPage) || 1;
        const totalPagesCount = invoicePagesCount + 3;

        let html = '';

        // --- 1. توليد صفحات الفاتورة ---
        for (let i = 0; i < items.length || (i === 0 && items.length === 0); i += itemsPerPage) {
            const pageIndex = Math.floor(i / itemsPerPage);
            const pageItems = items.slice(i, i + itemsPerPage);
            const isFirstPage = pageIndex === 0;
            const isLastInvoicePage = pageIndex === invoicePagesCount - 1;

            html += `
            <div class="page">
                <div class="header-main">
                    <div class="header-right-group">
                        <img src="images/logo.svg" class="main-logo" onerror="this.src='${fallbackImg}'">
                        <div class="brand-info">
                            <div class="brand-name">${seller.name}</div>
                            <div class="brand-slogan">${seller.slogan}</div>
                        </div>
                    </div>
                    <div class="header-center-title"><div class="doc-label">فاتورة ضريبية</div></div>
                    <div class="header-left-group">
                        <div>الرخصة: ${seller.licenseNumber}</div>
                        <div>الرقم الضريبي: ${seller.taxNumber}</div>
                    </div>
                </div>

                ${isFirstPage ? `
                <div class="order-meta-row">
                    <span><b>رقم الفاتورة:</b> ${order.orderNumber || order.id.substring(0,8)}</span>
                    <span><b>التاريخ:</b> ${date}</span>
                    <span><b>الوقت:</b> ${time}</span>
                </div>

                <div class="dual-columns">
                    <div class="address-card">
                        <div class="card-head">المورد (البائع)</div>
                        <div class="card-body">
                            <p><b>${seller.name}</b></p>
                            <p>${seller.address}</p>
                            <p>${seller.phone}</p>
                        </div>
                    </div>
                    <div class="address-card">
                        <div class="card-head">العميل (المشتري)</div>
                        <div class="card-body">
                            <p><b>الاسم:</b> ${customer.name || '---'}</p>
                            <p><b>الجوال:</b> ${customer.phone || '---'}</p>
                        </div>
                    </div>
                </div>` : ''}

                <table class="main-table">
                    <thead>
                        <tr><th>#</th><th>الوصف</th><th>الكمية</th><th>السعر</th><th>الإجمالي</th></tr>
                    </thead>
                    <tbody>
                        ${pageItems.map((item, idx) => `
                        <tr>
                            <td>${i + idx + 1}</td>
                            <td><b>${item.name || '---'}</b></td>
                            <td>${item.qty || 1}</td>
                            <td>${(item.price || 0).toLocaleString()} ر.س</td>
                            <td>${((item.price || 0) * (item.qty || 1)).toLocaleString()} ر.س</td>
                        </tr>`).join('')}
                    </tbody>
                </table>

                ${isLastInvoicePage ? `
                <div class="financial-section">
                    <div class="summary-box-final">
                        <div class="s-line"><span>المجموع (غير شامل الضريبة):</span> <span>${(order.subtotal || 0).toLocaleString()} ر.س</span></div>
                        <div class="s-line"><span>ضريبة القيمة المضافة (15%):</span> <span>${((order.total || 0) - (order.subtotal || 0)).toLocaleString()} ر.س</span></div>
                        <div class="s-line grand-total-line"><span>الإجمالي شامل الضريبة:</span> <span>${(order.total || 0).toLocaleString()} ر.س</span></div>
                    </div>
                </div>

                <div class="barcode-section" style="display:flex; gap:20px; justify-content:center; margin-top:30px; border-top:1px dashed #eee; padding-top:20px;">
                    <div class="barcode-item" style="text-align:center;">
                        <div id="zatcaQR"></div>
                        <p style="font-size:8px; margin-top:5px;">هيئة الزكاة والجمارك</p>
                    </div>
                    <div class="barcode-item" style="text-align:center;">
                        <div id="websiteQR"></div>
                        <p style="font-size:8px; margin-top:5px;">الموقع الرسمي</p>
                    </div>
                    <div class="barcode-item" style="text-align:center;">
                        <div id="downloadQR"></div>
                        <p style="font-size:8px; margin-top:5px;"><a id="invoiceLink" style="color:inherit; text-decoration:none;">تحميل الفاتورة</a></p>
                    </div>
                </div>` : ''}

                <div class="final-footer">
                    <div class="contact-strip">
                        <span>${seller.email}</span>
                        <span>${seller.website}</span>
                    </div>
                    <div class="page-number">صفحة ${pageIndex + 1} من ${totalPagesCount}</div>
                </div>
            </div>`;
        }

        document.getElementById('print-app').innerHTML = html;

        // --- 2. توليد الباركودات باستخدام المدير الموحد ---
        if (typeof QRCode !== 'undefined') {
            BarcodeManager.init(orderId, seller, order);
        }

        document.getElementById('loader').style.display = 'none';

    } catch (e) {
        console.error("خطأ في محرك الطباعة:", e);
    }
};
