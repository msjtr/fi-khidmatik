// js/print/template.js

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

export function buildInvoiceHTML(order, cartRows, totals) {
    // تنسيق التاريخ
    let displayDate = order.orderDate || '-';
    if (displayDate && displayDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
        let parts = displayDate.split('-');
        displayDate = parts[2] + '/' + parts[1] + '/' + parts[0];
    }
    
    // تنسيق الوقت
    let displayTime = order.orderTime || '-';
    if (displayTime && displayTime.includes(':')) {
        let [h, m] = displayTime.split(':');
        let hour = parseInt(h);
        let ampm = hour >= 12 ? 'مساءً' : 'صباحاً';
        hour = hour % 12 || 12;
        displayTime = `${hour.toString().padStart(2, '0')}:${m} ${ampm}`;
    }
    
    // التأكد من وجود totals
    const safeTotals = {
        subtotal: totals?.subtotal || '0 ريال',
        discount: totals?.discount || '0 ريال',
        tax: totals?.tax || '0 ريال',
        total: totals?.total || '0 ريال'
    };
    
    // رابط الشعار المباشر
    const logoPath = 'https://fi-khidmatik-olive.vercel.app/images/logo.svg';
    
    return `
        <div class="invoice-header">
            <div class="logo">
                <div class="logo-circle">
                    <img 
                        src="${logoPath}" 
                        alt="شعار منصة في خدمتك" 
                        style="width: 50px; height: 50px; object-fit: contain;"
                        crossorigin="anonymous"
                        referrerpolicy="no-referrer"
                        onerror="this.onerror=null; this.parentElement.innerHTML='<span style=\\'color: white; font-size: 32px; font-weight: bold;\\'>ف</span>';"
                    />
                </div>
                <h1 class="company-name">منصة في خدمتك</h1>
                <p class="company-sub">FI-KHIDMATIK</p>
                <div class="divider"></div>
            </div>
        </div>
        
        <div class="tax-badge">
            <div>رقم شهادة العمل الحر: FL-765735204</div>
            <div>الرقم الضريبي: 312495447600003</div>
        </div>
        
        <div class="invoice-info">
            <div class="invoice-number">
                رقم الفاتورة: <span>${escapeHtml(order.orderNumber)}</span>
            </div>
            <div class="invoice-date">
                التاريخ: ${displayDate} | ${displayTime}
            </div>
        </div>
        
        <div class="parties">
            <div class="from-box">
                <h3>📌 مصدرة من</h3>
                <p>
                    <strong>منصة في خدمتك</strong><br>
                    المملكة العربية السعودية<br>
                    حائل - حي النقرة - شارع سعد المشاط - مبنى 3085<br>
                    الرقم الإضافي: 7718 - الرمز البريدي: 55431
                </p>
            </div>
            <div class="to-box">
                <h3>📌 مصدرة إلى</h3>
                <p>
                    <strong>${escapeHtml(order.customer?.name || '-')}</strong><br>
                    المملكة العربية السعودية<br>
                    هاتف: ${escapeHtml(order.customer?.phone) || '-'}<br>
                    بريد: ${escapeHtml(order.customer?.email) || 'غير مدخل'}<br>
                    ${escapeHtml(order.customer?.address || '')}
                </p>
            </div>
        </div>
        
        <div class="payment-info">
            <span class="payment-badge">💳 طريقة الدفع: ${escapeHtml(order.paymentMethodName || order.paymentMethod || '-')}</span>
            ${order.approvalCode ? `<span class="payment-badge">🔑 رمز الموافقة: ${escapeHtml(order.approvalCode)}</span>` : ''}
            ${order.shippingService ? `<span class="payment-badge">🚚 خدمة الشحن: ${escapeHtml(order.shippingService)}</span>` : ''}
        </div>
        
        <h3 class="products-title">📦 تفاصيل الطلب</h3>
        <table class="products-table">
            <thead>
                <tr>
                    <th>اسم المنتج</th>
                    <th>الكود</th>
                    <th>الوصف</th>
                    <th>الكمية</th>
                    <th>السعر (ريال)</th>
                    <th>الخصم (ريال)</th>
                    <th>الإجمالي (ريال)</th>
                </tr>
            </thead>
            <tbody>
                ${cartRows || ''}
            </tbody>
        </table>
        
        <div class="totals">
            <div class="totals-left">
                <p><strong>المجموع الفرعي:</strong> ${safeTotals.subtotal}</p>
                <p><strong>الخصم الكلي:</strong> ${safeTotals.discount}</p>
                <p><strong>الضريبة (15%):</strong> ${safeTotals.tax}</p>
            </div>
            <div class="totals-center">
                <h2>الإجمالي النهائي: ${safeTotals.total}</h2>
            </div>
        </div>
        
        <div class="contact-bar">
            <span>📞 +966597771565</span>
            <span>✉️ info@fi-khidmatik.com</span>
            <span>🌐 www.khidmatik.com</span>
        </div>
        
        <div class="thanks">
            شكراً لتسوقكم معنا
        </div>
    `;
}

export { escapeHtml };
