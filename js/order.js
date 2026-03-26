// =============================
// 🔹 إنشاء الطلب (من index)
// =============================
function checkout() {

    if (!window.cart || window.cart.length === 0) {
        alert('❌ السلة فارغة');
        return;
    }

    let name = document.getElementById('name').value;
    let phone = document.getElementById('phone').value;

    if (!name || !phone) {
        alert('❌ يرجى إدخال اسم العميل ورقم الجوال');
        return;
    }

    let orderNumber = document.getElementById('order_number_manual')?.value;
    if (!orderNumber) orderNumber = 'FK-0000';

    // ⏱ تنسيق الوقت
    let timeVal = document.getElementById('order_time').value;
    let formattedTime = '-';

    if (timeVal) {
        let parts = timeVal.split(':');
        let h = parseInt(parts[0]);
        let m = parts[1];
        let period = h >= 12 ? 'م' : 'ص';
        h = h % 12 || 12;
        formattedTime = h + ':' + m + ' ' + period;
    }

    function getVal(id) {
        let el = document.getElementById(id);
        return el ? el.value : '';
    }

    let order = {
        orderNumber: orderNumber,
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

        cart: window.cart.map(item => ({
            ...item,
            qty: item.qty || 1,
            discount: item.discount || 0
        })),

        payment: getVal('payment'),
        tamaraAuth: getVal('payment') === 'تمارا' ? getVal('tamara_auth') : '',
        shipping: getVal('shipping')
    };

    localStorage.setItem('currentOrder', JSON.stringify(order));

    window.location.href = 'invoice.html';
}


// =============================
// 🔹 تحميل الفاتورة
// =============================
function loadInvoice() {

    let orderJSON = localStorage.getItem('currentOrder');

    if (!orderJSON) {
        document.getElementById('invoiceContent').innerHTML =
            '<div class="container"><div class="empty-cart">⚠️ لا توجد فاتورة</div></div>';
        return;
    }

    let order = JSON.parse(orderJSON);

    let cartRows = '';
    let subtotal = 0;
    let totalDiscount = 0;

    for (let i = 0; i < order.cart.length; i++) {

        let item = order.cart[i];

        let price = parseFloat(item.price) || 0;
        let qty = parseInt(item.qty) || 1;
        let discount = parseFloat(item.discount) || 0;

        let itemSubtotal = price * qty;
        let itemTotal = itemSubtotal - discount;

        subtotal += itemSubtotal;
        totalDiscount += discount;

        cartRows += `
        <tr>
            <td>
                <img src="${item.image || 'images/logo.svg'}"
                     width="50"
                     height="50"
                     style="object-fit:cover;"
                     onerror="this.src='images/logo.svg'">
            </td>
            <td>${item.code || '-'}</td>
            <td>${item.name}</td>
            <td>${item.desc || '-'}</td>
            <td>${qty}</td>
            <td>${price.toFixed(2)}</td>
            <td>${discount.toFixed(2)}</td>
            <td>${itemTotal.toFixed(2)}</td>
        </tr>`;
    }

    let tax = (subtotal - totalDiscount) * 0.15;
    let grandTotal = subtotal - totalDiscount + tax;

    // 📅 تنسيق التاريخ
    let displayDate = order.date;
    if (displayDate && displayDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
        let parts = displayDate.split('-');
        displayDate = parts[2] + '-' + parts[1] + '-' + parts[0];
    }

    // 💳 الدفع
    let paymentLine = `<span>طريقة الدفع: ${order.payment}</span>`;
    if (order.payment === 'تمارا' && order.tamaraAuth) {
        paymentLine += `<span> | رمز الموافقة: ${order.tamaraAuth}</span>`;
    }

    // =============================
    // 🔹 HTML الفاتورة
    // =============================
    let html = `
    <div class="invoice" id="invoiceToPrint">

        <div style="text-align:center;margin-bottom:15px;">
            <img src="images/logo.svg" width="90">
            <h2>فاتورة إلكترونية</h2>
            <p>منصة في خدمتك</p>
        </div>

        <hr>

        <p><b>رقم الفاتورة:</b> ${order.orderNumber}</p>
        <p><b>التاريخ:</b> ${displayDate} ${order.time !== '-' ? ' - ' + order.time : ''}</p>

        <div style="display:flex;gap:20px;margin-top:15px;">

            <div style="flex:1;">
                <h3>مصدرة من</h3>
                منصة في خدمتك<br>
                المملكة العربية السعودية<br>
                حائل - حي النقرة - شارع سعد المشاط<br>
                مبنى 3085 - الرمز البريدي 55431<br>
                312495447600003
            </div>

            <div style="flex:1;">
                <h3>مصدرة إلى</h3>
                ${order.customer}<br>
                المملكة العربية السعودية<br><br>

                ${order.city} - ${order.district} - ${order.street} - ${order.building} - ${order.extra} - ${order.postal}<br><br>

                ${order.phone}<br>
                ${order.email || '-'}
            </div>

        </div>

        <div style="margin-top:10px;">
            ${paymentLine} | خدمة الشحن: ${order.shipping}
        </div>

        <table border="1" width="100%" style="margin-top:15px;">
            <tr>
                <th>صورة</th>
                <th>كود</th>
                <th>المنتج</th>
                <th>الوصف</th>
                <th>الكمية</th>
                <th>السعر</th>
                <th>الخصم</th>
                <th>الإجمالي</th>
            </tr>
            ${cartRows}
        </table>

        <h3>المجموع: ${subtotal.toFixed(2)} ريال</h3>
        <h3>الخصم: ${totalDiscount.toFixed(2)} ريال</h3>
        <h3>الضريبة: ${tax.toFixed(2)} ريال</h3>
        <h2>الإجمالي النهائي: ${grandTotal.toFixed(2)} ريال</h2>

        <p style="text-align:center;margin-top:15px;">
            شكراً لتعاملكم معنا
        </p>

    </div>
    `;

    document.getElementById('invoiceContent').innerHTML = html;
}


// =============================
// 🔹 تحميل PDF
// =============================
function downloadPDF() {

    let element = document.getElementById('invoiceToPrint');

    if (!element) {
        alert('لا يوجد فاتورة');
        return;
    }

    html2pdf().from(element).set({
        margin: 10,
        filename: 'فاتورة.pdf',
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    }).save();
}


// =============================
// 🔹 طلب جديد
// =============================
function newOrder() {
    localStorage.removeItem('currentOrder');
    window.location.href = 'index.html';
}


// =============================
// 🔹 تشغيل تلقائي
// =============================
if (window.location.pathname.includes('invoice.html')) {
    document.addEventListener('DOMContentLoaded', loadInvoice);
}
