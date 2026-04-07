// ========================================
// دوال هيئة الزكاة والضريبة
// ========================================

function generateZATCAQRData(order, sellerData) {
    var totals = calculateTotals(order);
    var timestamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
    var total = totals.total.toFixed(2);
    var tax = totals.tax.toFixed(2);
    
    var tlvData = '';
    tlvData += String.fromCharCode(1) + String.fromCharCode(1) + '1';
    tlvData += String.fromCharCode(2) + String.fromCharCode(15) + sellerData.taxNumber;
    tlvData += String.fromCharCode(3) + String.fromCharCode(timestamp.length) + timestamp;
    tlvData += String.fromCharCode(4) + String.fromCharCode(total.length) + total;
    tlvData += String.fromCharCode(5) + String.fromCharCode(tax.length) + tax;
    
    return btoa(tlvData);
}

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
