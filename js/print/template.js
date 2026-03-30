function escapeHtml(text = '') {
    return text.toString().replace(/[&<>"']/g, m => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    }[m]));
}

export function buildInvoiceHTML(order, cartRows, totals) {

return `
<div class="invoice" id="invoiceToPrint">

<div class="invoice-content">

<!-- بيانات المنشأة -->
<div class="top-margin">
    <div>رقم شهادة العمل الحر: FL-765735204</div>
    <div>الرقم الضريبي: 312495447600003</div>
</div>

<!-- الشعار -->
<div class="logo-center">
    <img src="/images/logo.svg"
    onerror="this.onerror=null; this.parentElement.innerHTML='<div class=\\'logo-placeholder\\'>منصة في خدمتك</div>';"
    alt="شعار المنصة">
</div>

<!-- الهيدر -->
<div class="invoice-header">
    <div class="invoice-number">
        رقم الفاتورة: <span>${escapeHtml(order?.orderNumber || 'FK-0000')}</span>
    </div>
    <div class="invoice-date">
        ${(escapeHtml(order?.date || '-'))} ${(escapeHtml(order?.time || ''))}
    </div>
</div>

<!-- الأطراف -->
<div class="invoice-parties">

    <div class="invoice-from">
        <h3>📌 مصدرة من</h3>
        <p>
            <strong>منصة في خدمتك</strong><br>
            المملكة العربية السعودية<br>
            حائل - حي النقرة - شارع سعد المشاط - مبنى 3085<br>
            الرقم الإضافي: 7718 - الرمز البريدي: 55431
        </p>
    </div>

    <div class="invoice-to">
        <h3>📌 مصدرة إلى</h3>
        <p>
            <strong>${escapeHtml(order?.customer?.name || order?.customer || '-')}</strong><br>
            المملكة العربية السعودية<br>

            ${escapeHtml(order?.city || '')}
            ${order?.district ? ' - ' + escapeHtml(order.district) : ''}
            ${order?.street ? ' - ' + escapeHtml(order.street) : ''}
            ${order?.building ? ' - ' + escapeHtml(order.building) : ''}<br>

            ${order?.extra ? 'الرقم الإضافي: ' + escapeHtml(order.extra) + ' - ' : ''}
            ${order?.postal ? 'الرمز البريدي: ' + escapeHtml(order.postal) : ''}<br>

            هاتف: ${escapeHtml(order?.phone || '-')}<br>
            بريد: ${escapeHtml(order?.email || 'غير مدخل')}
        </p>
    </div>

</div>

<!-- الدفع والشحن -->
<div class="payment-shipping">
    <span>💳 طريقة الدفع: ${escapeHtml(order?.payment || '-')}</span>

    ${order?.payment === 'تمارا' && order?.tamaraAuth 
        ? `<span>🔑 رمز الموافقة: ${escapeHtml(order.tamaraAuth)}</span>` 
        : ''}

    <span>🚚 خدمة الشحن: ${escapeHtml(order?.shipping || '-')}</span>
</div>

<!-- المنتجات -->
<table class="products-table">
<thead>
<tr>
<th>اسم المنتج</th>
<th>الكود</th>
<th>الوصف</th>
<th>الكمية</th>
<th>السعر</th>
<th>الخصم</th>
<th>الإجمالي</th>
</tr>
</thead>

<tbody>${cartRows || ''}</tbody>
</table>

<!-- الإجماليات -->
<div class="totals-wrapper">
<div class="totals-labels">
<p>المجموع</p>
<p>الخصم</p>
<p>الضريبة</p>
</div>

<div class="totals-values">
<p>${totals?.subtotal || '0'}</p>
<p>${totals?.discount || '0'}</p>
<p>${totals?.tax || '0'}</p>
</div>

<div class="grand-total">
<h2>${totals?.total || '0'}</h2>
</div>
</div>

<!-- الفوتر -->
<div class="contact-bar">
    <span>📞 +966597771565</span>
    <span>✉️ info@fi-khidmatik.com</span>
    <span>🌐 www.khidmatik.com</span>
</div>

<div class="thanks">
    شكراً لتسوقكم معنا
</div>

</div>
</div>
`;
}
