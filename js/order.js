// order.js - معالجة الطلب والفاتورة

function checkout() {
    if (!Array.isArray(window.cart) || window.cart.length === 0) {
        alert('❌ السلة فارغة! أضف منتجات أولاً.');
        return;
    }

    const name = document.getElementById('name').value.trim();
    const phone = document.getElementById('phone').value.trim();
    if (!name || !phone) {
        alert('❌ يرجى إدخال اسم العميل ورقم الجوال');
        return;
    }

    let lastNum = localStorage.getItem('lastOrderNumber');
    let orderNumber = 1001;
    if (lastNum) orderNumber = parseInt(lastNum) + 1;
    localStorage.setItem('lastOrderNumber', orderNumber);

    let timeVal = document.getElementById('order_time').value;
    let formattedTime = '-';
    if (timeVal) {
        let [h, m] = timeVal.split(':');
        let period = h >= 12 ? 'م' : 'ص';
        h = h % 12 || 12;
        formattedTime = `${h}:${m} ${period}`;
    }

    function getVal(id) {
        const el = document.getElementById(id);
        return el ? el.value.trim() : '';
    }

    const order = {
        orderNumber: `INV-${orderNumber.toString().padStart(6, '0')}`,
        date: getVal('order_date') || new Date().toISOString().split('T')[0],
        time: formattedTime,
        customer: name,
        phone: phone,
        email: getVal('email'),
        city: getVal('city'),
        district: getVal('district'),
        street: getVal('street'),
        building: getVal('building'),
        extra: getVal('extra'),
        postal: getVal('postal'),
        cart: window.cart.map(item => ({ ...item })),
        payment: getVal('payment'),
        tamaraAuth: getVal('tamara_auth'),
        tamaraOrder: getVal('tamara_order'),
        shipping: getVal('shipping'),
        createdAt: new Date().toISOString()
    };

    localStorage.setItem('currentOrder', JSON.stringify(order));
    window.location.href = 'invoice.html';
}

function loadInvoice() {
    const orderJSON = localStorage.getItem('currentOrder');
    if (!orderJSON) {
        document.getElementById('invoiceContent').innerHTML = '<div class="container"><div class="empty-cart">⚠️ لا توجد فاتورة لعرضها. يرجى إنشاء طلب أولاً.</div></div>';
        return;
    }

    const order = JSON.parse(orderJSON);
    let cartRows = '';
    let subtotal = 0;

    order.cart.forEach(item => {
        const total = item.price * item.qty;
        subtotal += total;
        cartRows += `
            <tr>
                <td>${escapeHtml(item.name)}${item.desc ? '<br><small>' + escapeHtml(item.desc) + '</small>' : ''}</td>
                <td>${item.qty}</td>
                <td>${item.price.toFixed(2)}</td>
                <td>${total.toFixed(2)}</td>
            </tr>
        `;
    });

    const tax = subtotal * 0.15;
    const grandTotal = subtotal + tax;

    // تنسيق التاريخ
    let displayDate = order.date;
    if (order.date && order.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = order.date.split('-');
        displayDate = `${day}-${month}-${year}`;
    }

    const invoiceHTML = `
        <div class="invoice" id="invoiceToPrint">
            <div style="text-align: center; margin-bottom: 20px;">
                <img src="images/logo.svg" alt="شعار المنصة" style="max-width: 100px;" onerror="this.style.display='none'">
                <h1>فاتورة إلكترونية</h1>
                <p><strong>رقم الفاتورة:</strong> ${order.orderNumber}</p>
                <p><strong>التاريخ:</strong> ${displayDate} ${order.time !== '-' ? ' - ' + order.time : ''}</p>
            </div>

            <hr>

            <div style="margin-bottom: 20px;">
                <h3>📌 مصدرة من:</h3>
                <p>
                    <strong>منصة في خدمتك</strong><br>
                    المملكة العربية السعودية<br>
                    المنطقة: حائل<br>
                    الحي: النقرة - الشارع: سعد المشاط - رقم المبنى: 3085<br>
                    الرقم الإضافي: 7718 - الرمز البريدي: 55431<br>
                    رقم الهاتف: +966597771565<br>
                    البريد الإلكتروني: info@fi-khidmatik.com<br>
                    الموقع الإلكتروني: www.khidmatik.com<br>
                    رقم شهادة العمل الحر: FL-765735204<br>
                    الرقم الضريبي: 312495447600003
                </p>
            </div>

            <hr>

            <div style="margin-bottom: 20px;">
                <h3>📌 مصدرة إلى:</h3>
                <p>
                    <strong>${escapeHtml(order.customer)}</strong><br>
                    المملكة العربية السعودية<br>
                    ${order.city} - حي ${order.district || ''} - شارع ${order.street || ''} - مبنى ${order.building || ''} - ${order.extra || ''} - ${order.postal || ''}<br>
                    هاتف: ${order.phone}<br>
                    بريد: ${order.email || 'غير مدخل'}
                </p>
            </div>

            <hr>

            <!-- طريقة الدفع والشحن في سطر واحد -->
            <div style="display: flex; justify-content: space-between; margin: 20px 0; background: #f9fafb; padding: 12px; border-radius: 8px;">
                <span><strong>💳 طريقة الدفع:</strong> ${order.payment}</span>
                <span><strong>🚚 خدمة الشحن:</strong> ${order.shipping}</span>
            </div>

            <h3>📦 تفاصيل الطلب</h3>
            <table border="1" width="100%" cellpadding="8" cellspacing="0">
                <thead>
                    <tr><th>المنتج</th><th>الكمية</th><th>السعر</th><th>الإجمالي</th></tr>
                </thead>
                <tbody>${cartRows}</tbody>
            </table>

            <div style="text-align: left; margin-top: 20px;">
                <p><strong>المجموع الفرعي:</strong> ${subtotal.toFixed(2)} ريال</p>
                <p><strong>الضريبة (15%):</strong> ${tax.toFixed(2)} ريال</p>
                <h2 style="color: #1e3a8a;">الإجمالي النهائي: ${grandTotal.toFixed(2)} ريال</h2>
            </div>

            ${order.tamaraAuth ? `<p><strong>رمز موافقة تمارا:</strong> ${order.tamaraAuth}</p>` : ''}
            ${order.tamaraOrder ? `<p><strong>رقم طلب تمارا:</strong> ${order.tamaraOrder}</p>` : ''}

            <p style="text-align: center; margin-top: 30px;">شكراً لتسوقكم معنا</p>
        </div>
    `;

    document.getElementById('invoiceContent').innerHTML = invoiceHTML;
}

function downloadPDF() {
    const element = document.getElementById('invoiceToPrint');
    if (!element) {
        alert('لا يوجد فاتورة للتحميل');
        return;
    }
    html2pdf()
        .from(element)
        .set({
            margin: [10, 10, 10, 10],
            filename: `فاتورة_${new Date().toLocaleDateString('ar-SA')}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, letterRendering: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        })
        .save();
}

function newOrder() {
    localStorage.removeItem('currentOrder');
    window.location.href = 'index.html';
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

if (window.location.pathname.includes('invoice.html')) {
    document.addEventListener('DOMContentLoaded', loadInvoice);
}
