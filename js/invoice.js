// ========================================
// invoice.js - دوال إنشاء الفاتورة الإلكترونية (نسخة نظيفة)
// ========================================

// بيانات البائع (ثابتة)
const sellerData = {
    name: "في خدمتك",
    taxNumber: "312495447600003",
    licenseNumber: "FL-765735204",
    address: "حائل - حي النقرة - شارع سعد المشاط - مبنى 3085 - الرمز البريدي 55431",
    phone: "+966 534051317",
    whatsapp: "+966 545312021",
    email: "info@fi-khidmatik.com",
    website: "www.khidmatik.com"
};

// دوال مساعدة بسيطة
function cleanText(text) {
    if (!text) return '';
    return String(text).replace(/[^\u0600-\u06FF\s0-9a-zA-Z\.\-\_\,]/g, ' ').trim();
}

function getStatusText(status) {
    const map = {
        'جديد': 'جديد',
        'تحت التنفيذ': 'قيد التنفيذ',
        'تم التنفيذ': 'مكتمل',
        'ملغي': 'ملغي',
        'مسترجع': 'مسترجع',
        'تحت المراجعة': 'تحت المراجعة'
    };
    return map[status] || status || 'مكتمل';
}

function getShippingText(method) {
    if (method === 'delivery') return 'شحن منزلي';
    if (method === 'noship') return 'لا يتطلب شحن';
    return 'استلام من المقر';
}

function getPaymentName(method) {
    const names = {
        'mada': 'مدى',
        'mastercard': 'ماستركارد',
        'visa': 'فيزا',
        'stcpay': 'STCPay',
        'tamara': 'تمارا',
        'tabby': 'تابي',
        'other': 'أخرى'
    };
    return names[method] || method || 'مدى';
}

// ========================================
// بناء رأس الصفحة (بدون تكرار)
// ========================================
function buildInvoiceHeader(title) {
    return `
        <div class="page-header">
            <div class="header-right">
                <div class="logo-area">
                    <img src="/fi-khidmatik/images/logo.svg" class="logo-img" alt="شعار في خدمتك" onerror="this.style.display='none'">
                    <div class="logo-text">
                        <div class="platform-name">${sellerData.name}</div>
                        <div class="platform-slogan">Fi Khidmatik</div>
                    </div>
                </div>
            </div>
            <div class="header-center">
                <div class="page-title">${title}</div>
            </div>
            <div class="header-left">
                <div class="legal-numbers">
                    <div>شهادة العمل الحر: ${sellerData.licenseNumber}</div>
                    <div>الرقم الضريبي: ${sellerData.taxNumber}</div>
                </div>
            </div>
        </div>
    `;
}

// ========================================
// بناء تذييل الصفحة
// ========================================
function buildInvoiceFooter(pageNum, totalPages) {
    return `
        <div class="page-footer">
            <div class="contact-info">
                <span>هاتف: ${sellerData.phone}</span>
                <span>واتساب: ${sellerData.whatsapp}</span>
                <span>بريد: ${sellerData.email}</span>
                <span>موقع: ${sellerData.website}</span>
            </div>
            <div>هذه الفاتورة إلكترونية - نسخة معتمدة قانونيا</div>
            <div class="page-number">صفحة ${pageNum} من ${totalPages}</div>
        </div>
    `;
}

// ========================================
// صفحة الفاتورة الرئيسية (مرتبة)
// ========================================
function buildInvoicePage(order, pageNum, totalPages) {
    const formatDate = window.formatDate || ((d) => d);
    const formatTime = window.formatTime || ((t) => t);
    const escape = window.escapeHtml || ((s) => s);
    
    const items = order.items || [];
    const subtotal = order.subtotal || items.reduce((s, i) => s + (i.price || 0) * (i.quantity || 1), 0);
    const discount = order.discount || 0;
    const tax = order.tax || ((subtotal - discount) * 0.15);
    const total = order.total || (subtotal - discount + tax);
    
    let itemsHtml = '';
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        itemsHtml += `
            <tr>
                <td style="text-align:center">${i+1}</td>
                <td style="text-align:center">
                    ${item.image ? `<img src="${item.image}" class="product-img" style="width:50px;height:50px;object-fit:cover;" onerror="this.style.display='none'">` : '<div style="width:50px;height:50px;background:#e2e8f0;border-radius:8px;"></div>'}
                </td>
                <td style="text-align:right"><strong>${escape(cleanText(item.name))}</strong><br><small>${escape(cleanText(item.description))}</small></td>
                <td style="text-align:center">${item.quantity}</td>
                <td style="text-align:center">${(item.price || 0).toFixed(2)} ريال</td>
                <td style="text-align:center">${((item.price || 0) * (item.quantity || 1)).toFixed(2)} ريال</td>
            </tr>
        `;
    }
    
    return `
        <div class="page invoice-page">
            ${buildInvoiceHeader('فاتورة إلكترونية')}
            
            <div class="info-grid">
                <div class="info-item"><div class="info-label">رقم الفاتورة</div><div class="info-value">${escape(order.orderNumber)}</div></div>
                <div class="info-item"><div class="info-label">التاريخ</div><div class="info-value">${formatDate(order.orderDate)} - ${formatTime(order.orderTime)}</div></div>
                <div class="info-item"><div class="info-label">الحالة</div><div class="status-badge">${getStatusText(order.status)}</div></div>
            </div>
            
            <div class="addresses">
                <div class="address-card">
                    <strong>مصدرة من</strong>
                    ${sellerData.name}<br>
                    المملكة العربية السعودية<br>
                    ${sellerData.address}<br>
                    ${sellerData.phone}
                </div>
                <div class="address-card">
                    <strong>مصدرة إلى</strong>
                    ${escape(order.customerName)}<br>
                    ${escape(order.customerAddress)}<br>
                    ${escape(order.customerPhone)}<br>
                    ${escape(order.customerEmail)}
                </div>
            </div>
            
            <div class="payment-grid">
                <div class="payment-card"><strong>طريقة الدفع</strong><br>${getPaymentName(order.paymentMethod)}</div>
                <div class="payment-card"><strong>طريقة الاستلام</strong><br>${getShippingText(order.shippingMethod)}</div>
                <div class="payment-card"><strong>رمز الموافقة</strong><br>${order.approvalCode || 'غير مطلوب'}</div>
            </div>
            
            <table class="products-table">
                <thead>
                    <tr><th>#</th><th>الصورة</th><th>المنتج</th><th>الكمية</th><th>السعر</th><th>الإجمالي</th></tr>
                </thead>
                <tbody>${itemsHtml}</tbody>
            </table>
            
            <div class="totals-box">
                <div class="totals-row"><span>المجموع الفرعي</span><span>${subtotal.toFixed(2)} ريال</span></div>
                ${discount > 0 ? `<div class="totals-row"><span>الخصم</span><span>- ${discount.toFixed(2)} ريال</span></div>` : ''}
                <div class="totals-row"><span>ضريبة القيمة المضافة 15%</span><span>${tax.toFixed(2)} ريال</span></div>
                <div class="totals-row grand-total"><span>الإجمالي النهائي</span><span>${total.toFixed(2)} ريال</span></div>
            </div>
            
            <div class="barcodes">
                <div class="barcode-item"><div id="zatcaQR" class="qr-code"></div><p>باركود هيئة الزكاة</p></div>
                <div class="barcode-item"><div id="orderQR" class="qr-code"></div><p>باركود الطلب</p></div>
                <div class="barcode-item"><div id="downloadQR" class="qr-code"></div><p>باركود التحميل</p></div>
            </div>
            
            ${buildInvoiceFooter(pageNum, totalPages)}
        </div>
    `;
}

// تصدير الدوال
window.buildInvoicePage = buildInvoicePage;
window.sellerData = sellerData;
