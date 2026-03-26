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

    let html = `
<div class="invoice" id="invoiceToPrint" style="direction: rtl; font-family: 'Segoe UI', Tahoma, Arial;">

    <div>
        <div>رقم شهادة العمل الحر: FL-765735204</div>
        <div>الرقم الضريبي: 312495447600003</div>
    </div>

    <div style="text-align:center;margin:10px 0;">
        <img src="images/logo.svg" onerror="this.style.display='none'" style="width:120px;">
    </div>

    <div style="display:flex;justify-content:space-between;">
        <p><strong>رقم الفاتورة:</strong> ${order.orderNumber || 'FK-0000'}</p>
        <p><strong>التاريخ:</strong> ${displayDate}</p>
    </div>

    <div style="display:flex;justify-content:space-between;margin-top:15px;">
        <div>
            <h3>📌 مصدرة من:</h3>
            <p>
            <strong>منصة في خدمتك</strong><br>
            المملكة العربية السعودية<br>
            حائل - حي النقرة
            </p>
        </div>

        <div>
            <h3>📌 مصدرة إلى:</h3>
            <p>
            <strong>${escapeHtml(order.customer)}</strong><br>
            ${order.phone}<br>
            ${order.city || ''}
            </p>
        </div>
    </div>

    <div style="margin-top:10px;">
        💳 ${order.payment || '-'} | 🚚 ${order.shipping || '-'}
    </div>

    <h3>📦 تفاصيل الطلب</h3>

    <table class="products-table">
        <thead>
            <tr>
                <th>كود</th>
                <th>اسم</th>
                <th>وصف</th>
                <th>كمية</th>
                <th>سعر</th>
                <th>خصم</th>
                <th>إجمالي</th>
            </tr>
        </thead>
        <tbody>${cartRows}</tbody>
    </table>

    <div style="margin-top:15px;">
        <p>المجموع: ${subtotal.toFixed(2)} ريال</p>
        <p>الخصم: ${totalDiscount.toFixed(2)} ريال</p>
        <p>الضريبة: ${tax.toFixed(2)} ريال</p>

        <h2 style="color:#1a73e8;">
        الإجمالي النهائي: ${grandTotal.toFixed(2)} ريال
        </h2>
    </div>

    <div style="margin-top:20px;display:flex;justify-content:space-between;">
        <span>📞 +966597771565</span>
        <span>✉️ info@fi-khidmatik.com</span>
        <span>🌐 www.khidmatik.com</span>
    </div>

    <p style="text-align:center;margin-top:15px;">شكراً لتسوقكم معنا</p>

</div>
`;

    document.getElementById('invoiceContent').innerHTML = html;
}

// 🔥 تحميل PDF (حل المشكلة)
function downloadPDF() {
    let element = document.getElementById('invoiceToPrint');

    if (!element) {
        alert('❌ الفاتورة غير موجودة');
        return;
    }

    html2pdf().from(element).save('فاتورة.pdf');
}

// 🔄 طلب جديد
function newOrder() {
    localStorage.removeItem('currentOrder');
    window.location.href = 'index.html';
}

window.onload = loadInvoice;
