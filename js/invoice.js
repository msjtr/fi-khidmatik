// ========================================
// invoice.js - دوال إنشاء الفاتورة الإلكترونية (نسخة نهائية)
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
    website: "https://fi-khidmatik.com.sa"
};

// دوال مساعدة لتنظيف النصوص من الرموز الغريبة
function cleanText(text) {
    if (!text) return '';
    // إزالة أي شيء ليس حرفًا عربيًا أو إنجليزيًا أو رقمًا أو مسافة أو علامات ترقيم أساسية
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
// بناء رأس الصفحة (الشعار أولاً ثم الجملة)
// ========================================
function buildInvoiceHeader(title) {
    return `
        <div class="page-header">
            <div class="header-right">
                <div class="logo-area">
                    <img src="/fi-khidmatik/images/logo.svg" class="logo-img" alt="شعار في خدمتك" onerror="this.style.display='none'">
                    <div class="logo-text">
                        <div class="platform-name">في خدمتك</div>
                        <div class="platform-slogan">من الإتقان بلس</div>
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
// بناء تذييل الصفحة (إصلاح الأرقام المعكوسة)
// ========================================
function buildInvoiceFooter(pageNum, totalPages) {
    return `
        <div class="page-footer">
            <div class="contact-info">
                <span><i class="fas fa-phone-alt"></i> ${sellerData.phone}</span>
                <span><i class="fab fa-whatsapp"></i> ${sellerData.whatsapp}</span>
                <span><i class="fas fa-envelope"></i> ${sellerData.email}</span>
                <span><i class="fas fa-globe"></i> ${sellerData.website}</span>
            </div>
            <div class="legal-footer">فاتورة إلكترونية - نسخة معتمدة قانونياً</div>
            <div class="page-number">صفحة ${pageNum} من ${totalPages}</div>
        </div>
    `;
}

// ========================================
// صفحة الفاتورة الرئيسية (مع جلب كامل بيانات العميل)
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
        // تنظيف النص من الرموز الغريبة
        const cleanName = cleanText(item.name);
        const cleanDesc = cleanText(item.description);
        itemsHtml += `
            <tr>
                <td style="text-align:center">${i+1}</td>
                <td style="text-align:center">
                    ${item.image ? `<img src="${item.image}" class="product-img" onerror="this.style.display='none'">` : '<div style="width:45px;height:45px;background:#e2e8f0;border-radius:8px;"></div>'}
                </td>
                <td style="text-align:right"><strong>${escape(cleanName)}</strong><br><small>${escape(cleanDesc)}</small></td>
                <td style="text-align:center">${item.quantity}</td>
                <td style="text-align:center">${(item.price || 0).toFixed(2)} ريال}‹
                <td style="text-align:center">${((item.price || 0) * (item.quantity || 1)).toFixed(2)} ريال}‹
            </tr>
        `;
    }
    
    // تجميع عنوان العميل الكامل
    const fullAddress = [order.customerCity, order.customerAddress].filter(Boolean).join(' - ');
    
    const customerAddressHtml = `
        <p><i class="fas fa-user"></i> ${escape(order.customerName)}</p>
        <p><i class="fas fa-map-marker-alt"></i> ${escape(fullAddress || 'غير محدد')}</p>
        <p><i class="fas fa-phone-alt"></i> ${escape(order.customerPhone)}</p>
        <p><i class="fas fa-envelope"></i> ${escape(order.customerEmail)}</p>
    `;
    
    const sellerAddressHtml = `
        <p><i class="fas fa-store"></i> ${sellerData.name}</p>
        <p><i class="fas fa-location-dot"></i> المملكة العربية السعودية</p>
        <p><i class="fas fa-location-dot"></i> ${sellerData.address}</p>
        <p><i class="fas fa-phone-alt"></i> ${sellerData.phone}</p>
    `;
    
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
                    <strong><i class="fas fa-building"></i> مصدرة من</strong>
                    ${sellerAddressHtml}
                </div>
                <div class="address-card">
                    <strong><i class="fas fa-user-check"></i> مصدرة إلى</strong>
                    ${customerAddressHtml}
                </div>
            </div>
            
            <div class="payment-grid">
                <div class="payment-card"><i class="fas fa-credit-card"></i> <strong>طريقة الدفع</strong><br>${getPaymentName(order.paymentMethod)}</div>
                <div class="payment-card"><i class="fas fa-check-circle"></i> <strong>رمز الموافقة على الطلب</strong><br>${order.approvalCode || 'غير مطلوب'}</div>
                <div class="payment-card"><i class="fas fa-truck"></i> <strong>طريقة استلام المنتج</strong><br>${getShippingText(order.shippingMethod)}</div>
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
                <div class="barcode-item"><div id="zatcaQR" class="qr-code"></div><p>باركود هيئة الزكاة والضريبة</p></div>
                <div class="barcode-item"><div id="websiteQR" class="qr-code"></div><p>للوصول السريع إلى موقعنا الإلكتروني، يرجى مسح الباركود</p></div>
                <div class="barcode-item"><div id="downloadQR" class="qr-code"></div><p>باركود تحميل الفاتورة</p></div>
            </div>
            
            ${buildInvoiceFooter(pageNum, totalPages)}
        </div>
    `;
}

// تصدير الدوال
window.buildInvoicePage = buildInvoicePage;
window.sellerData = sellerData;
