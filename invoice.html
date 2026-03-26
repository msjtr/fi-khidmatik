function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>]/g, m => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;'
    }[m]));
}

function loadInvoice() {

    let orderJSON = localStorage.getItem('currentOrder');

    if (!orderJSON) {
        document.getElementById('invoiceContent').innerHTML = '❌ لا يوجد طلب';
        return;
    }

    let order = JSON.parse(orderJSON);

    let subtotal = 0;
    let totalDiscount = 0;
    let cartRows = '';

    (order.cart || []).forEach(item => {

        let price = item.price || 0;
        let qty = item.qty || 1;
        let discount = item.discount || 0;

        let itemSubtotal = price * qty;
        let itemTotal = itemSubtotal - discount;

        subtotal += itemSubtotal;
        totalDiscount += discount;

        cartRows += `
        <tr>
            <td>${escapeHtml(item.code)}</td>
            <td>${escapeHtml(item.name)}</td>
            <td>${escapeHtml(item.desc)}</td>
            <td>${qty}</td>
            <td>${price.toFixed(2)}</td>
            <td>${discount.toFixed(2)}</td>
            <td>${itemTotal.toFixed(2)}</td>
        </tr>
        `;
    });

    let taxableAmount = subtotal - totalDiscount;
    let tax = taxableAmount * 0.15;
    let grandTotal = taxableAmount + tax;

    let displayDate = order.date || new Date().toLocaleDateString();

    // 🔥 التصميم نفسه اللي طلبته
    let html = `
<div class="invoice" id="invoiceToPrint" style="direction: rtl; font-family: 'Segoe UI', Tahoma, Arial, sans-serif;">

    <div class="top-margin">
        <div>رقم شهادة العمل الحر: FL-765735204</div>
        <div>الرقم الضريبي: 312495447600003</div>
    </div>

    <div class="logo-center" style="text-align:center;margin:10px 0;">
        <img src="images/logo.svg" onerror="this.style.display='none'" style="width:120px;">
    </div>

    <div class="invoice-header" style="display:flex;justify-content:space-between;">
        <p><strong>رقم الفاتورة:</strong> ${order.orderNumber || 'FK-0000'}</p>
        <p><strong>التاريخ:</strong> ${displayDate}</p>
    </div>

    <div class="invoice-parties" style="display:flex;justify-content:space-between;margin-top:15px;">
        <div class="invoice-from">
            <h3>📌 مصدرة من:</h3>
            <p>
            <strong>منصة في خدمتك</strong><br>
            المملكة العربية السعودية<br>
            حائل - حي النقرة - شارع سعد المشاط - مبنى 3085<br>
            الرقم الإضافي: 7718 - الرمز البريدي: 55431
            </p>
        </div>

        <div class="invoice-to">
            <h3>📌 مصدرة إلى:</h3>
            <p>
            <strong>${escapeHtml(order.customer) || '-'}</strong><br>
            المملكة العربية السعودية<br>
            ${order.city || ''} 
            ${order.district ? '- ' + order.district : ''} 
            ${order.street ? '- ' + order.street : ''} 
            ${order.building ? '- ' + order.building : ''} 
            ${order.extra ? '- ' + order.extra : ''} 
            ${order.postal ? '- ' + order.postal : ''}<br>
            هاتف: ${order.phone || '-'}<br>
            بريد: ${order.email || 'غير مدخل'}
            </p>
        </div>
    </div>

    <div class="payment-shipping" style="margin-top:10px;">
        <span>💳 طريقة الدفع: ${order.payment || '-'}</span>
        ${order.payment === 'تمارا' && order.tamaraAuth ? `<span> | 🔑 ${order.tamaraAuth}</span>` : ''}
        <span> | 🚚 ${order.shipping || '-'}</span>
    </div>

    <h3 style="margin-top:15px;">📦 تفاصيل الطلب</h3>

    <table class="products-table" style="width:100%;border-collapse:collapse;">
        <thead>
            <tr style="background:#eee;">
                <th>كود المنتج</th>
                <th>اسم المنتج</th>
                <th>الوصف</th>
                <th>الكمية</th>
                <th>السعر</th>
                <th>الخصم</th>
                <th>الإجمالي</th>
            </tr>
        </thead>
        <tbody>
            ${cartRows}
        </tbody>
    </table>

    <div class="totals-wrapper" style="margin-top:15px;">
        <div style="display:flex;justify-content:space-between;">
            <div>
                <p>المجموع الفرعي</p>
                <p>الخصم الكلي</p>
                <p>الضريبة (15%)</p>
            </div>
            <div>
                <p>${subtotal.toFixed(2)} ريال</p>
                <p>${totalDiscount.toFixed(2)} ريال</p>
                <p>${tax.toFixed(2)} ريال</p>
            </div>
        </div>

        <div class="grand-total" style="margin-top:10px;font-size:18px;font-weight:bold;color:#1a73e8;">
            الإجمالي النهائي: ${grandTotal.toFixed(2)} ريال
        </div>
    </div>

    <div class="contact-bar" style="margin-top:20px;display:flex;justify-content:space-between;font-size:14px;">
        <span>📞 +966597771565</span>
        <span>✉️ info@fi-khidmatik.com</span>
        <span>🌐 www.khidmatik.com</span>
    </div>

    <p class="thanks" style="text-align:center;margin-top:15px;">شكراً لتسوقكم معنا</p>

</div>
`;

    document.getElementById('invoiceContent').innerHTML = html;
}

window.onload = loadInvoice;
