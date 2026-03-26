function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, m => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;'
    }[m]));
}

function loadInvoice() {

    let order = JSON.parse(localStorage.getItem('currentOrder'));

    if (!order) {
        document.getElementById('invoiceContent').innerHTML = '❌ لا يوجد طلب';
        return;
    }

    let cart = order.cart || order.items || [];

    if (!Array.isArray(cart) || cart.length === 0) {
        document.getElementById('invoiceContent').innerHTML = '❌ السلة فارغة';
        return;
    }

    let rows = '';
    let subtotal = 0;
    let discountTotal = 0;

    cart.forEach(item => {

        let price = parseFloat(item.price) || 0;
        let qty = parseInt(item.qty) || 1;
        let discount = parseFloat(item.discount) || 0;

        let total = (price * qty) - discount;

        subtotal += price * qty;
        discountTotal += discount;

        rows += `
        <tr>
            <td>${escapeHtml(item.code)}</td>
            <td>${escapeHtml(item.name)}</td>
            <td>${qty}</td>
            <td>${price}</td>
            <td>${discount}</td>
            <td>${total.toFixed(2)}</td>
        </tr>`;
    });

    let tax = (subtotal - discountTotal) * 0.15;
    let finalTotal = subtotal - discountTotal + tax;

    let html = `
    <div class="invoice" id="invoicePDF">

        <div class="logo-center">
            <img src="images/logo.svg" onerror="this.style.display='none'">
        </div>

        <div class="invoice-header">
            <div>
                <p><strong>رقم الفاتورة:</strong> ${order.orderNumber || 'FK-0000'}</p>
                <p><strong>التاريخ:</strong> ${order.date || '-'}</p>
            </div>
        </div>

        <div class="invoice-parties">
            <div>
                <h3>📌 من:</h3>
                <p>منصة في خدمتك<br>السعودية</p>
            </div>

            <div>
                <h3>📌 إلى:</h3>
                <p>
                ${escapeHtml(order.customer)}<br>
                ${order.city || ''}<br>
                ${order.phone || ''}
                </p>
            </div>
        </div>

        <h3>📦 تفاصيل الطلب</h3>

        <table class="products-table">
            <tr>
                <th>كود</th>
                <th>اسم</th>
                <th>كمية</th>
                <th>سعر</th>
                <th>خصم</th>
                <th>الإجمالي</th>
            </tr>
            ${rows}
        </table>

        <div class="totals">
            <p>المجموع: ${subtotal.toFixed(2)} ريال</p>
            <p>الخصم: ${discountTotal.toFixed(2)} ريال</p>
            <p>الضريبة: ${tax.toFixed(2)} ريال</p>
            <p class="total-final">الإجمالي النهائي: ${finalTotal.toFixed(2)} ريال</p>
        </div>

    </div>
    `;

    document.getElementById('invoiceContent').innerHTML = html;
}

function downloadPDF() {
    const element = document.getElementById('invoicePDF');
    html2pdf().from(element).save();
}

function newOrder() {
    window.location.href = "index.html";
}

window.onload = loadInvoice;
