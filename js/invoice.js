// ========================================
// بيانات البائع
// ========================================
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

let currentOrder = null;
let db = null;

// ========================================
// دوال مساعدة
// ========================================
function cleanText(text) {
    if (!text) return '';
    var cleaned = text.replace(/[^\u0600-\u06FF\s\u0621-\u064A\u0660-\u0669\.\,\-\+\#\@\&\*\(\)]/g, '');
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    return cleaned || text;
}

function formatDate(d) {
    if (!d) return '';
    var parts = d.split('-');
    if (parts.length === 3) {
        return parts[2] + '/' + parts[1] + '/' + parts[0];
    }
    return d;
}

function formatTime(time24) {
    if (!time24) return '';
    var parts = time24.split(':');
    var hour = parseInt(parts[0]);
    var minute = parts[1];
    var ap = hour >= 12 ? 'مساء' : 'صباح';
    hour = hour % 12 || 12;
    return hour + ':' + minute + ' ' + ap;
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

function getStatusText(status) {
    var map = {
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
    var names = {
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

function showLoading(msg) {
    var ov = document.getElementById('loadingOverlay');
    if (!ov) {
        ov = document.createElement('div');
        ov.id = 'loadingOverlay';
        ov.className = 'loading-overlay';
        ov.innerHTML = '<div class="loading-box"><div class="loading-spinner"></div><p id="loadingMsg"></p></div>';
        document.body.appendChild(ov);
    }
    document.getElementById('loadingMsg').textContent = msg;
    ov.style.display = 'flex';
}

function hideLoading() {
    var ov = document.getElementById('loadingOverlay');
    if (ov) ov.style.display = 'none';
}

function showToast(msg, isError) {
    var t = document.createElement('div');
    t.className = 'toast-message';
    t.style.background = isError ? '#ef4444' : '#10b981';
    t.innerHTML = (isError ? 'خطأ ' : 'تم ') + msg;
    document.body.appendChild(t);
    setTimeout(function() { t.remove(); }, 3000);
}

// ========================================
// جلب الطلب من Firebase
// ========================================
async function fetchOrder(orderId) {
    var orderDoc = await db.collection('orders').doc(orderId).get();
    if (!orderDoc.exists) throw new Error('الطلب غير موجود');
    var order = { id: orderDoc.id, ...orderDoc.data() };
    
    var customer = { name: 'غير معروف', phone: '', email: '', address: '' };
    if (order.customerId) {
        try {
            var customerDoc = await db.collection('customers').doc(order.customerId).get();
            if (customerDoc.exists) customer = customerDoc.data();
        } catch(e) {}
    }
    
    var items = [];
    for (var i = 0; i < (order.items || []).length; i++) {
        var item = order.items[i];
        var productImage = item.image || '';
        var productName = cleanText(item.name) || 'منتج';
        var productDesc = cleanText(item.description) || '';
        
        if (item.productId && item.productId !== 'null' && !item.productId.startsWith('temp_')) {
            try {
                var productDoc = await db.collection('products').doc(item.productId).get();
                if (productDoc.exists) {
                    var product = productDoc.data();
                    productImage = product.image || productImage;
                    productName = cleanText(product.name) || productName;
                    productDesc = cleanText(product.description) || productDesc;
                }
            } catch(e) {}
        }
        
        items.push({
            productName: productName,
            description: productDesc,
            image: productImage,
            quantity: item.quantity || 1,
            price: item.price || 0
        });
    }
    
    return {
        orderNumber: order.orderNumber,
        orderDate: order.orderDate,
        orderTime: order.orderTime,
        status: order.status,
        customerName: customer.name,
        customerPhone: customer.phone,
        customerEmail: customer.email,
        customerAddress: customer.address || '',
        shippingMethod: order.shippingMethod,
        paymentMethod: order.paymentMethod,
        paymentMethodName: getPaymentName(order.paymentMethod),
        approvalCode: order.approvalCode,
        items: items,
        subtotal: order.subtotal,
        discount: order.discount,
        tax: order.tax,
        total: order.total
    };
}

// ========================================
// حساب الإجماليات
// ========================================
function calculateTotals(order) {
    var subtotal = order.subtotal || 0;
    if (!subtotal && order.items) {
        subtotal = 0;
        for (var i = 0; i < order.items.length; i++) {
            subtotal += (order.items[i].price || 0) * (order.items[i].quantity || 1);
        }
    }
    var discount = order.discount || 0;
    var tax = order.tax || ((subtotal - discount) * 0.15);
    var total = order.total || (subtotal - discount + tax);
    return { subtotal: subtotal, discount: discount, tax: tax, total: total };
}

// ========================================
// بناء رأس الصفحة (نسخة نظيفة)
// ========================================
function buildHeader(title) {
    // القسم الأيمن
    var rightSection = '<div class="header-right">' +
        '<div class="logo-area">' +
            '<div class="logo-text">' +
                '<div class="platform-name">في خدمتك</div>' +
                '<div class="platform-slogan">Fi Khidmatik</div>' +
            '</div>' +
        '</div>' +
    '</div>';
    
    // القسم الأوسط
    var centerSection = '<div class="header-center">' +
        '<div class="page-title">' + title + '</div>' +
    '</div>';
    
    // القسم الأيسر
    var leftSection = '<div class="header-left">' +
        '<div class="legal-numbers">' +
            '<div>شهادة العمل الحر: ' + sellerData.licenseNumber + '</div>' +
            '<div>الرقم الضريبي: ' + sellerData.taxNumber + '</div>' +
        '</div>' +
    '</div>';
    
    return '<div class="page-header">' +
        rightSection +
        centerSection +
        leftSection +
    '</div>';
}

// ========================================
// بناء تذييل الصفحة
// ========================================
function buildFooter(pageNum, totalPages) {
    return '<div class="page-footer">' +
        '<div class="contact-info">' +
            '<span>هاتف: ' + sellerData.phone + '</span>' +
            '<span>واتساب: ' + sellerData.whatsapp + '</span>' +
            '<span>بريد: ' + sellerData.email + '</span>' +
            '<span>موقع: ' + sellerData.website + '</span>' +
        '</div>' +
        '<div>هذه الفاتورة إلكترونية - نسخة معتمدة قانونيا</div>' +
        '<div class="page-number">صفحة ' + pageNum + ' من ' + totalPages + '</div>' +
    '</div>';
}

// ========================================
// صفحة الفاتورة
// ========================================
function buildInvoicePage(order, pageNum, totalPages) {
    var totals = calculateTotals(order);
    
    var itemsHtml = '';
    for (var i = 0; i < order.items.length; i++) {
        var item = order.items[i];
        itemsHtml += '<tr>' +
            '<td style="text-align:center">' + (i+1) + '</td>' +
            '<td style="text-align:center">' +
                (item.image ? '<img src="' + item.image + '" class="product-img" onerror="this.style.display=\'none\'">' : '<div style="width:50px;height:50px;background:#e2e8f0;border-radius:8px;"></div>') +
            '</td>' +
            '<td style="text-align:right"><strong>' + escapeHtml(item.productName) + '</strong><br><small>' + escapeHtml(item.description) + '</small></td>' +
            '<td style="text-align:center">' + item.quantity + '</td>' +
            '<td style="text-align:center">' + item.price.toFixed(2) + ' ريال</td>' +
            '<td style="text-align:center">' + (item.price * item.quantity).toFixed(2) + ' ريال</td>' +
        '</tr>';
    }
    
    return '<div class="page">' +
        buildHeader("فاتورة إلكترونية") +
        '<div class="info-grid">' +
            '<div class="info-item"><div class="info-label">رقم الفاتورة</div><div class="info-value">' + order.orderNumber + '</div></div>' +
            '<div class="info-item"><div class="info-label">التاريخ</div><div class="info-value">' + formatDate(order.orderDate) + ' - ' + formatTime(order.orderTime) + '</div></div>' +
            '<div class="info-item"><div class="info-label">الحالة</div><div class="status-badge">' + getStatusText(order.status) + '</div></div>' +
        '</div>' +
        '<div class="addresses">' +
            '<div class="address-card">' +
                '<strong>مصدرة من</strong>' +
                sellerData.name + '<br>' +
                'المملكة العربية السعودية<br>' +
                sellerData.address + '<br>' +
                sellerData.phone +
            '</div>' +
            '<div class="address-card">' +
                '<strong>مصدرة إلى</strong>' +
                escapeHtml(order.customerName) + '<br>' +
                escapeHtml(order.customerAddress) + '<br>' +
                escapeHtml(order.customerPhone) + '<br>' +
                escapeHtml(order.customerEmail) +
            '</div>' +
        '</div>' +
        '<div class="payment-grid">' +
            '<div class="payment-card"><strong>طريقة الدفع</strong>' + order.paymentMethodName + '</div>' +
            '<div class="payment-card"><strong>طريقة الاستلام</strong>' + getShippingText(order.shippingMethod) + '</div>' +
            '<div class="payment-card"><strong>رمز الموافقة</strong>' + (order.approvalCode || 'غير مطلوب') + '</div>' +
        '</div>' +
        '<table class="products-table">' +
            '<thead>' +
                '<tr><th>#</th><th>الصورة</th><th>المنتج</th><th>الكمية</th><th>السعر</th><th>الإجمالي</th></tr>' +
            '</thead>' +
            '<tbody>' + itemsHtml + '</tbody>' +
        '</table>' +
        '<div class="totals-box">' +
            '<div class="totals-row"><span>المجموع الفرعي</span><span>' + totals.subtotal.toFixed(2) + ' ريال</span></div>' +
            (totals.discount > 0 ? '<div class="totals-row"><span>الخصم</span><span>- ' + totals.discount.toFixed(2) + ' ريال</span></div>' : '') +
            '<div class="totals-row"><span>ضريبة القيمة المضافة 15%</span><span>' + totals.tax.toFixed(2) + ' ريال</span></div>' +
            '<div class="totals-row grand-total"><span>الإجمالي النهائي</span><span>' + totals.total.toFixed(2) + ' ريال</span></div>' +
        '</div>' +
        '<div class="barcodes">' +
            '<div class="barcode-right">' +
                '<div class="barcode-item">' +
                    '<div id="zatcaQR" class="qr-code"></div>' +
                    '<p>باركود هيئة الزكاة</p>' +
                '</div>' +
            '</div>' +
            '<div class="barcode-center">' +
                '<div class="barcode-item">' +
                    '<div id="orderQR" class="qr-code"></div>' +
                    '<p>باركود الطلب</p>' +
                '</div>' +
            '</div>' +
            '<div class="barcode-left">' +
                '<div class="barcode-item">' +
                    '<div id="downloadQR" class="qr-code"></div>' +
                    '<p>باركود التحميل</p>' +
                '</div>' +
            '</div>' +
        '</div>' +
        buildFooter(pageNum, totalPages) +
    '</div>';
}

// ========================================
// تصدير PDF
// ========================================
async function generatePDF() {
    var pages = document.querySelectorAll('.page');
    if (!pages.length) {
        showToast('لا توجد فاتورة للتصدير', true);
        return;
    }
    
    showLoading('جاري إنشاء PDF...');
    
    var buttons = document.querySelector('.action-buttons');
    var originalDisplay = null;
    if (buttons) {
        originalDisplay = buttons.style.display;
        buttons.style.display = 'none';
    }
    
    try {
        var { jsPDF } = window.jspdf;
        var pdf = new jsPDF('p', 'mm', 'a4');
        
        for (var i = 0; i < pages.length; i++) {
            var canvas = await html2canvas(pages[i], { 
                scale: 2, 
                useCORS: false,
                backgroundColor: '#ffffff', 
                logging: false,
                allowTaint: true
            });
            
            if (i !== 0) pdf.addPage();
            var imgData = canvas.toDataURL('image/png');
            var imgWidth = 210;
            var imgHeight = (canvas.height * imgWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        }
        
        pdf.save('فاتورة_' + (currentOrder?.orderNumber || 'invoice') + '.pdf');
        showToast('تم حفظ PDF بنجاح', false);
        
    } catch(error) {
        console.error('PDF Error:', error);
        showToast('خطأ في إنشاء PDF', true);
    } finally {
        if (buttons) {
            buttons.style.display = originalDisplay || 'flex';
        }
        hideLoading();
    }
}

// ========================================
// تحميل وعرض الفاتورة
// ========================================
async function loadInvoice(firebaseDb) {
    db = firebaseDb;
    
    var params = new URLSearchParams(window.location.search);
    var orderId = params.get('id');
    
    if (!orderId || orderId === 'null') {
        document.getElementById('invoiceRoot').innerHTML = '<div class="page" style="text-align:center"><div><h2>خطأ</h2><p>لم يتم تحديد رقم الطلب</p></div></div>';
        return;
    }
    
    showLoading('جاري تحميل الفاتورة...');
    
    try {
        var order = await fetchOrder(orderId);
        currentOrder = order;
        
        var html = buildInvoicePage(order, 1, 4);
        
        if (typeof buildTermsPage1 === 'function') {
            html += buildTermsPage1(2, 4);
            html += buildTermsPage2(3, 4);
            html += buildTermsPage3(order, 4, 4);
        }
        
        document.getElementById('invoiceRoot').innerHTML = html;
        
        setTimeout(function() {
            if (typeof QRCode !== 'undefined') {
                var zatcaDiv = document.getElementById('zatcaQR');
                if (zatcaDiv) {
                    try {
                        var zatcaData = window.generateZATCAQRData(order);
                        new QRCode(zatcaDiv, { text: zatcaData, width: 90, height: 90 });
                    } catch(e) { console.log('ZATCA QR Error:', e); }
                }
                
                var orderDiv = document.getElementById('orderQR');
                if (orderDiv) {
                    try {
                        new QRCode(orderDiv, { text: window.location.href, width: 90, height: 90 });
                    } catch(e) { console.log('Order QR Error:', e); }
                }
                
                var downloadDiv = document.getElementById('downloadQR');
                if (downloadDiv) {
                    try {
                        var downloadUrl = window.location.origin + window.location.pathname + '?id=' + orderId;
                        new QRCode(downloadDiv, { text: downloadUrl, width: 90, height: 90 });
                    } catch(e) { console.log('Download QR Error:', e); }
                }
            }
        }, 200);
        
        showToast('تم تحميل الفاتورة بنجاح', false);
        
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('invoiceRoot').innerHTML = '<div class="page" style="text-align:center"><div><h2>خطأ</h2><p>' + error.message + '</p><button onclick="location.reload()">إعادة المحاولة</button></div></div>';
        showToast(error.message, true);
    } finally {
        hideLoading();
    }
}

// ========================================
// تصدير الدوال
// ========================================
window.loadInvoice = loadInvoice;
window.generatePDF = generatePDF;
window.calculateTotals = calculateTotals;
window.sellerData = sellerData;
window.buildHeader = buildHeader;
window.buildFooter = buildFooter;
window.formatDate = formatDate;
window.formatTime = formatTime;
window.escapeHtml = escapeHtml;
window.showToast = showToast;
window.showLoading = showLoading;
window.hideLoading = hideLoading;
