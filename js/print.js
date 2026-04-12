import { TERMS_DATA } from './terms.js';
import { OrderManager } from './order.js';
import { BarcodeManager } from './barcodes.js';

window.onload = async () => {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get('id');
    if (!orderId) return;

    try {
        const data = await OrderManager.getOrderFullDetails(orderId);
        if (!data) return;

        const { order, customer } = data;
        const { date, time } = OrderManager.formatDateTime(order.createdAt);
        const seller = window.invoiceSettings; 

        const items = order.items || [];
        const itemsPerPage = 8;
        const invoicePagesCount = Math.ceil(items.length / itemsPerPage) || 1;
        
        // جلب بنود الشروط من الملف المستورد
        const termsList = TERMS_DATA || [];
        const termsPerPage = 12;
        const termsPagesCount = Math.ceil(termsList.length / termsPerPage);
        
        const totalPagesCount = invoicePagesCount + termsPagesCount;

        let html = '';

        // --- 1. توليد صفحات الفاتورة (الجدول الأصلي) ---
        for (let i = 0; i < items.length || (i === 0 && items.length === 0); i += itemsPerPage) {
            const pageIndex = Math.floor(i / itemsPerPage);
            const pageItems = items.slice(i, i + itemsPerPage);
            const isFirstPage = pageIndex === 0;
            const isLastInvoicePage = pageIndex === invoicePagesCount - 1;

            html += `
            <div class="page">
                <div class="header-main">
                    <div class="header-right-group">
                        <img src="images/logo.svg" class="main-logo">
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
                    <span><b>رقم الفاتورة:</b> ${order.orderNumber || order.id}</span>
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
                        <div class="s-line"><span>المجموع (بدون ضريبة):</span> <span>${(order.subtotal || 0).toLocaleString()} ر.س</span></div>
                        <div class="s-line"><span>الضريبة (15%):</span> <span>${((order.total || 0) - (order.subtotal || 0)).toLocaleString()} ر.س</span></div>
                        <div class="s-line grand-total-line"><span>الإجمالي شامل الضريبة:</span> <span>${(order.total || 0).toLocaleString()} ر.س</span></div>
                    </div>
                    <div class="barcode-container-main" style="display:flex; gap:15px; margin-top:15px;">
                        <div id="zatcaQR"></div>
                        <div id="websiteQR"></div>
                        <div id="downloadQR"></div>
                    </div>
                    <div style="margin-top:5px; font-size:11px;"><a id="invoiceLink" target="_blank" style="color:#000; text-decoration:none;">🔗 رابط الفاتورة الرقمية</a></div>
                </div>` : ''}

                <div class="final-footer">
                    <div class="contact-strip"><span>${seller.email}</span> | <span>${seller.website}</span></div>
                    <div class="page-number">صفحة ${pageIndex + 1} من ${totalPagesCount}</div>
                </div>
            </div>`;
        }

        // --- 2. توليد صفحات الشروط والأحكام ---
        for (let j = 0; j < termsList.length; j += termsPerPage) {
            const pageIndex = Math.floor(j / termsPerPage) + invoicePagesCount;
            const pageTerms = termsList.slice(j, j + termsPerPage);

            html += `
            <div class="page page-terms">
                <div class="terms-header">الشروط والأحكام العامة</div>
                <div class="terms-grid">
                    ${pageTerms.map((term, idx) => `
                        <div class="term-item">
                            <span class="term-num">${j + idx + 1}</span>
                            <p class="term-text">${term}</p>
                        </div>
                    `).join('')}
                </div>
                <div class="final-footer">
                    <div class="page-number">صفحة ${pageIndex + 1} من ${totalPagesCount}</div>
                </div>
            </div>`;
        }

        document.getElementById('print-app').innerHTML = html;

        // تشغيل الباركودات من المدير الموحد
        BarcodeManager.init(orderId, seller, order);
        
        document.getElementById('loader').style.display = 'none';

    } catch (e) {
        console.error("خطأ في الطباعة:", e);
    }
};
