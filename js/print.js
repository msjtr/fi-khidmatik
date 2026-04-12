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

        let html = `
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
                    <div>الرقم الضريبي: ${seller.taxNumber}</div>
                </div>
            </div>

            <div class="order-meta-row">
                <span><b>رقم الفاتورة:</b> ${order.orderNumber || order.id.substring(0,8)}</span>
                <span><b>التاريخ:</b> ${date}</span>
            </div>

            <table class="main-table">
                <thead><tr><th>الوصف</th><th>الكمية</th><th>السعر</th><th>الإجمالي</th></tr></thead>
                <tbody>
                    ${(order.items || []).map(item => `
                        <tr>
                            <td>${item.name}</td>
                            <td>${item.qty}</td>
                            <td>${item.price} ر.س</td>
                            <td>${item.price * item.qty} ر.س</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>

            <div class="financial-section">
                <div class="summary-box-final">
                    <div class="s-line grand-total-line"><span>الإجمالي:</span> <span>${order.total} ر.س</span></div>
                </div>
                <div style="display:flex; gap:20px; margin-top:20px;">
                    <div id="zatcaQR"></div>
                    <div id="websiteQR"></div>
                    <div id="downloadQR"></div>
                </div>
                <div style="margin-top:10px; font-size:10px;"><a id="invoiceLink" target="_blank">رابط الفاتورة الرقمية</a></div>
            </div>
        </div>`;

        document.getElementById('print-app').innerHTML = html;
        BarcodeManager.init(orderId, seller, order);
        document.getElementById('loader').style.display = 'none';

    } catch (e) { console.error("Error:", e); }
};
