// order.js
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

    // جمع بيانات الطلب
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
        tamaraAuth: getVal('payment') === 'تمارا' ? getVal('tamara_auth') : '',
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
    let totalDiscount = 0;

    order.cart.forEach(item => {
        const itemSubtotal = item.price * item.qty;
        const itemDiscount = item.discount || 0;
        const itemTotal = itemSubtotal - itemDiscount;
        subtotal += itemSubtotal;
        totalDiscount += itemDiscount;

        cartRows += `
            <tr>
                <td><img src="${item.image}" width="50" height="50" style="object-fit:cover;"></td>
                <td>${escapeHtml(item.number)}</td>
                <td>${escapeHtml(item.code)}</td>
                <td>${escapeHtml(item.name)}${item.desc ? '<br><small>' + escapeHtml(item.desc) + '</small>' : ''}</td>
                <td>${item.qty}</td>
                <td>${item.price.toFixed(2)}</td>
                <td>${itemDiscount.toFixed(2)}</td>
                <td>${itemTotal.toFixed(2)}</td>
            </tr>
        `;
    });

    const tax = (subtotal - totalDiscount) * 0.15;
    const grandTotal = subtotal - totalDiscount + tax;

    // تنسيق التاريخ
    let displayDate = order.date;
    if (order.date && order.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = order.date.split('-');
        displayDate = `${day}-${month}-${year}`;
    }

    // تحديد عرض حقل تمارا
    const tamaraHtml = order.payment === 'تمارا' && order.tamaraAuth ?
        `<p><strong>رمز الموافقة على الطلب في تمارا:</strong> ${order.tamaraAuth}</p>` : '';

    const invoiceHTML = `
        <div class="invoice" id="invoiceToPrint">
            <!-- الرأس: رقم الفاتورة والتاريخ والوقت (يسار) -->
            <div class="invoice-header">
                <div class="invoice-left">
                    <p><strong>رقم الفاتورة:</strong> ${order.orderNumber}</p>
                    <p><strong>التاريخ:</strong> ${displayDate} ${order.time !== '-' ? ' - ' + order.time : ''}</p>
                </div>
            </div>

            <!-- قسم المصدر (يمين) والمستلم (يسار) مع خلفية -->
            <div class="invoice-parties">
                <div class="invoice-from">
                    <h3>📌 مصدرة من:</h3>
                    <p>
                        <strong>منصة في خدمتك</strong><br>
                        المملكة العربية السعودية<br>
                        المنطقة: حائل<br>
                        الحي: النقرة - الشارع: سعد المشاط - رقم المبنى: 3085<br>
                        الرقم الإضافي: 7718 - الرمز البريدي: 55431<br>
                        هاتف: +966597771565<br>
                        بريد: info@fi-khidmatik.com<br>
                        موقع: www.khidmatik.com<br>
                        رقم العمل الحر: FL-765735204<br>
                        الرقم الضريبي: 312495447600003
                    </p>
                </div>
                <div class="invoice-to">
                    <h3>📌 مصدرة إلى:</h3>
                    <p>
                        <strong>${escapeHtml(order.customer)}</strong><br>
                        المملكة العربية السعودية<br>
                        ${order.city} - حي ${order.district || ''} - شارع ${order.street || ''} - مبنى ${order.building || ''} - ${order.extra || ''} - ${order.postal || ''}<br>
                        هاتف: ${order.phone}<br>
                        بريد: ${order.email || 'غير مدخل'}
                    </p>
                </div>
            </div>

            <!-- طريقة الدفع والشحن في سطر واحد -->
            <div class="payment-shipping">
                <span><strong>💳 طريقة الدفع:</strong> ${order.payment}</span>
                <span><strong>🚚 خدمة الشحن:</strong> ${order.shipping}</span>
                ${order.payment === 'تمارا' && order.tamaraAuth ? `<span><strong>🔑 رمز الموافقة:</strong> ${order.tamaraAuth}</span>` : ''}
            </div>

            <!-- جدول المنتجات -->
            <h3>📦 تفاصيل الطلب</h3>
            <table class="products-table">
                <thead>
                    <tr>
                        <th>صورة</th>
                        <th>رقم المنتج</th>
                        <th>كود المنتج</th>
                        <th>المنتج</th>
                        <th>الكمية</th>
                        <th>السعر</th>
                        <th>الخصم</th>
                        <th>الإجمالي</th>
                    </tr>
                </thead>
                <tbody>${cartRows}</tbody>
            </table>

            <!-- نتائج المجموع والضريبة (يسار) والمعلومات (يمين) لكن هنا نضع النتائج يساراً -->
            <div class="totals-section">
                <div class="totals-left">
                    <p><strong>المجموع الفرعي:</strong> ${subtotal.toFixed(2)} ريال</p>
                    <p><strong>الخصم الكلي:</strong> ${totalDiscount.toFixed(2)} ريال</p>
                    <p><strong>الضريبة (15%):</strong> ${tax.toFixed(2)} ريال</p>
                    <h2>الإجمالي النهائي: ${grandTotal.toFixed(2)} ريال</h2>
                </div>
                <div class="totals-right">
                    <!-- هنا يمكن وضع معلومات إضافية إذا أردت، مثل الشكر -->
                </div>
            </div>

            ${tamaraHtml}
            <p class="thanks">شكراً لتسوقكم معنا</p>
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
