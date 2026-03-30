export function buildInvoiceHTML(order, cartRows, totals) {

return `
<div class="invoice" id="invoiceToPrint">

<div class="invoice-content">

<div class="top-margin">
    <div>رقم شهادة العمل الحر: FL-765735204</div>
    <div>الرقم الضريبي: 312495447600003</div>
</div>

<div class="logo-center">
    <img src="/images/logo.svg"
    onerror="this.onerror=null; this.parentElement.innerHTML='<div class=\\'logo-placeholder\\'>منصة في خدمتك</div>';">

</div>

<div class="invoice-header">
    <div class="invoice-number">
        رقم الفاتورة: <span>${order?.orderNumber || '-'}</span>
    </div>
    <div class="invoice-date">
        ${(order?.date || '-')} ${(order?.time || '')}
    </div>
</div>

<div class="invoice-parties">

<div class="invoice-from">
<h3>📌 مصدرة من</h3>
<p>
منصة في خدمتك<br>
السعودية
</p>
</div>

<div class="invoice-to">
<h3>📌 مصدرة إلى</h3>
<p>
${order?.customer?.name || order?.customer || '-'}
</p>
</div>

</div>

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

</div>
</div>
`;
}
