// ========================================
// دوال هيئة الزكاة والضريبة (ZATCA)
// ========================================

function generateZATCAQRData(order) {
    // الحصول على sellerData من window (المصدر من invoice.js)
    const seller = window.sellerData;
    
    if (!seller || !seller.taxNumber) {
        console.error('sellerData not found or missing taxNumber');
        // إرجاع بيانات افتراضية للاختبار
        return btoa('test');
    }
    
    // حساب الإجماليات
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
    
    var timestamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
    var totalStr = total.toFixed(2);
    var taxStr = tax.toFixed(2);
    
    // بناء بيانات TLV
    var tlvData = '';
    
    // Tag 1: Invoice type (1 = invoice, 2 = credit note, 3 = debit note)
    tlvData += String.fromCharCode(1) + String.fromCharCode(1) + '1';
    
    // Tag 2: Seller tax number
    var taxNumber = seller.taxNumber;
    tlvData += String.fromCharCode(2) + String.fromCharCode(taxNumber.length) + taxNumber;
    
    // Tag 3: Invoice date/time (ISO format without separators)
    tlvData += String.fromCharCode(3) + String.fromCharCode(timestamp.length) + timestamp;
    
    // Tag 4: Invoice total (including VAT)
    tlvData += String.fromCharCode(4) + String.fromCharCode(totalStr.length) + totalStr;
    
    // Tag 5: VAT amount
    tlvData += String.fromCharCode(5) + String.fromCharCode(taxStr.length) + taxStr;
    
    // إرجاع Base64 encoded TLV data
    try {
        return btoa(tlvData);
    } catch(e) {
        console.error('btoa error:', e);
        return '';
    }
}

// دالة مساعدة لإنشاء QR Code بشكل مباشر
async function generateAndDisplayQR(elementId, data) {
    var element = document.getElementById(elementId);
    if (element && typeof QRCode !== 'undefined') {
        try {
            // مسح المحتوى السابق
            element.innerHTML = '';
            new QRCode(element, { text: data, width: 90, height: 90 });
        } catch(e) {
            console.error('QR Code generation error:', e);
        }
    }
}

// تصدير الدوال
window.generateZATCAQRData = generateZATCAQRData;
window.generateAndDisplayQR = generateAndDisplayQR;
