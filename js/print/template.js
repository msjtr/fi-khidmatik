export function buildInvoiceHTML(order, cartRowsHTML, totals) {
  const freelancerCert = "FL-765735204";
  const taxNumber = "312495447600003";
  const companyName = "منصة في خدمتك";
  const companyAddress = "المملكة العربية السعودية، حائل - حي النقرة - شارع سعد المشاط - مبنى 3085";
  const companyExtra = "الرقم الإضافي: 7718 - الرمز البريدي: 55431";
  const companyContact = "🌐 www.khidmatik.com<br>✉️ info@fi-khidmatik.com<br>📞 +966597771565";

  const customer = order.customer || {};
  const customerName = customer.name || "غير محدد";
  const customerPhone = customer.phone || "";
  const customerEmail = customer.email || "";
  const customerAddress = customer.address || "المملكة العربية السعودية";

  const orderDate = order.orderDate ? new Date(order.orderDate).toLocaleDateString('ar-SA') : "-";
  const orderTime = order.orderTime || "-";

  let paymentText = order.paymentMethodName || order.paymentMethod || "-";
  let approvalHtml = "";
  if (order.approvalCode) {
    approvalHtml = `<span> (رمز الموافقة: ${order.approvalCode})</span>`;
  }
  const shippingText = order.shippingService || "-";

  return `
    <div class="invoice-wrapper" dir="rtl">
      <div class="invoice-header">
        <div class="cert-numbers">
          رقم شهادة العمل الحر: ${freelancerCert}<br>
          الرقم الضريبي: ${taxNumber}
        </div>
        <div class="invoice-number">
          رقم الفاتورة: ${order.orderNumber || order.id}
        </div>
      </div>

      <div class="parties">
        <div class="from">
          <strong>مصدرة من</strong><br>
          ${companyName}<br>
          ${companyAddress}<br>
          ${companyExtra}
        </div>
        <div class="to">
          <strong>مصدرة إلى</strong><br>
          ${customerName}<br>
          ${customerAddress}<br>
          هاتف: ${customerPhone}<br>
          البريد: ${customerEmail}
        </div>
      </div>

      <div class="payment-shipping">
        <div><strong>طريقة الدفع:</strong> ${paymentText} ${approvalHtml}</div>
        <div><strong>خدمة الشحن:</strong> ${shippingText}</div>
      </div>

      <div class="date-time-box">
        <span><strong>📅 تاريخ الطلب:</strong> ${orderDate}</span>
        <span><strong>⏰ وقت الطلب:</strong> ${orderTime}</span>
      </div>

      <table class="invoice-table">
        <thead>
          <tr><th>اسم المنتج</th><th>الكود</th><th>الوصف</th><th>الكمية</th><th>السعر</th><th>الخصم</th><th>الإجمالي</th></tr>
        </thead>
        <tbody>
          ${cartRowsHTML}
        </tbody>
      </table>

      <div class="totals">
        <div><span>المجموع:</span> <span>${totals.subtotal}</span></div>
        <div><span>الخصم:</span> <span>${totals.discount}</span></div>
        <div><span>الضريبة (15%):</span> <span>${totals.tax}</span></div>
        <div class="grand"><span>الإجمالي النهائي:</span> <span>${totals.total}</span></div>
      </div>

      <div class="contact">
        ${companyContact}
      </div>

      <div class="thanks">
        شكرًا لتسوقكم معنا.
      </div>
    </div>
  `;
}
