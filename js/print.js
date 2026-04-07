// js/print.js - دوال الطباعة والتصدير المركزية

import { 
    getOrderFull, 
    loadCustomersAndProducts 
} from './order.js';

import { termsContent, termsPage2Content } from './terms.js';

// بيانات البائع
export const sellerData = {
    name: "منصة في خدمتك",
    taxNumber: "312495447600003",
    licenseNumber: "FL-765735204",
    address: "حائل - حي النقرة - شارع سعد المشاط - مبنى 3085 - الرمز البريدي 55431",
    phone: "966534051317",
    whatsapp: "966545312021",
    email: "info@fi-khidmatik.com",
    website: "www.khidmatik.com"
};

// دوال مساعدة
export function formatTime12(t) { 
    if(!t) return ''; 
    let [h, m] = t.split(':'); 
    let hour = parseInt(h); 
    let ap = hour >= 12 ? 'مساءً' : 'صباحاً'; 
    hour = hour % 12 || 12; 
    return `${hour}:${m} ${ap}`; 
}

export function formatDateYMD(d) { 
    if(!d) return ''; 
    let p = d.split('-'); 
    return p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : d; 
}

export function escapeHtml(str) { 
    if(!str) return ''; 
    return String(str).replace(/[&<>]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[m])); 
}

export function getShippingMethodText(method) {
    if (method === 'delivery') return '🚚 شحن منزلي';
    if (method === 'pickup') return '🏪 استلام من المقر';
    if (method === 'noship') return '📥 لا يحتاج شحن (منتج رقمي)';
    return method || 'غير محدد';
}

export function getPaymentMethodName(method) {
    const methods = {
        'mada': 'مدى', 'mastercard': 'ماستركارد', 'visa': 'فيزا',
        'stcpay': 'STCPay', 'tamara': 'تمارا', 'tabby': 'تابي', 'other': 'أخرى'
    };
    return methods[method] || method || 'مدى';
}

// إنشاء باركود ZATCA
export function generateZATCAQRCode(order, sellerData) {
    const sellerName = sellerData.name;
    const vatNumber = sellerData.taxNumber;
    const timestamp = new Date().toISOString();
    const totalWithVAT = order.total || 0;
    const vatAmount = order.tax || ((order.subtotal || 0) * 0.15);
    
    function encodeTLV(tag, value) {
        const tagHex = String.fromCharCode(tag);
        const lengthHex = String.fromCharCode(value.length);
        return tagHex + lengthHex + value;
    }
    
    let tlvData = '';
    tlvData += encodeTLV(1, sellerName);
    tlvData += encodeTLV(2, vatNumber);
    tlvData += encodeTLV(3, timestamp);
    tlvData += encodeTLV(4, totalWithVAT.toFixed(2));
    tlvData += encodeTLV(5, vatAmount.toFixed(2));
    
    return btoa(tlvData);
}

// بناء رأس الصفحة
export function buildHeader(title = "فاتورة إلكترونية", sellerData) {
    return `
        <div class="header-top">
            <div class="logo-area">
                <div class="logo-img">
                    <img src="images/logo.svg" alt="شعار المنصة" onerror="this.src='https://placehold.co/65x65/1e3a5f/white?text=في+خدمتك'">
                </div>
                <div>
                    <div class="platform-name">${sellerData.name}</div>
                    <div class="platform-slogan">خدمات تقنية متكاملة</div>
                </div>
            </div>
            <div class="invoice-title">${title}</div>
            <div class="legal-numbers">
                <div>رقم شهادة العمل الحر: ${sellerData.licenseNumber}</div>
                <div>الرقم الضريبي: ${sellerData.taxNumber}</div>
            </div>
        </div>
    `;
}

// بناء تذييل الصفحة
export function buildFooter(pageNum, totalPages, sellerData) {
    return `
        <div class="footer-note">
            <div class="contact-info">
                <span>📞 ${sellerData.phone}</span>
                <span>💬 ${sellerData.whatsapp}</span>
                <span>✉️ ${sellerData.email}</span>
                <span>🌐 ${sellerData.website}</span>
            </div>
            <div>هذه الفاتورة إلكترونية - نسخة معتمدة قانونياً</div>
            <div class="page-number" style="text-align:left;direction:ltr;margin-top:10px;">صفحة ${pageNum} من ${totalPages}</div>
        </div>
    `;
}

// بناء صفحة الفاتورة
export function buildInvoicePage(order, sellerData) {
    const itemsHtml = (order.items || []).map((item, idx) => `
        <tr>
            <td style="text-align:center">${idx + 1}</td>
            <td style="text-align:center">
                ${item.image ? `<img src="${item.image}" class="product-img" onerror="this.style.display='none'" crossorigin="anonymous">` : '<div style="width:50px;height:50px;background:#e2e8f0;border-radius:8px;"></div>'}
            </td>
            <td style="text-align:right">
                <strong>${escapeHtml(item.productName || item.name)}</strong><br>
                <small style="color:#666;">${escapeHtml(item.description || '')}</small>
            </td>
            <td style="text-align:center">${item.quantity}</td>
            <td style="text-align:center">${(item.price || 0).toFixed(2)} ريال</td>
            <td style="text-align:center">${((item.price || 0) * item.quantity).toFixed(2)} ريال</td>
        </tr>
    `).join('');
    
    const subtotal = order.subtotal || order.items?.reduce((s, i) => s + ((i.price || 0) * i.quantity), 0) || 0;
    const discount = order.discount || 0;
    const tax = order.tax || ((subtotal - discount) * 0.15);
    const total = order.total || (subtotal - discount + tax);
    const shipText = getShippingMethodText(order.shippingMethod);
    
    return `
        <div class="invoice-page">
            ${buildHeader("فاتورة إلكترونية", sellerData)}
            
            <div class="info-row">
                <div><strong>رقم الفاتورة:</strong> ${order.orderNumber}</div>
                <div><strong>التاريخ:</strong> ${formatDateYMD(order.orderDate)} - ${formatTime12(order.orderTime)}</div>
                <div><span class="status-badge">${order.status || 'مكتمل'}</span></div>
            </div>
            
            <div class="addresses">
                <div class="address-box">
                    <strong>🏢 مصدرة من</strong>
                    ${sellerData.name}<br>
                    المملكة العربية السعودية<br>
                    ${sellerData.address}<br>
                    📞 ${sellerData.phone}<br>
                    ✉️ ${sellerData.email}
                </div>
                <div class="address-box">
                    <strong>👤 مصدرة إلى</strong>
                    ${escapeHtml(order.customerName)}<br>
                    ${escapeHtml(order.customerAddress)}<br>
                    📞 ${escapeHtml(order.customerPhone)}<br>
                    ✉️ ${escapeHtml(order.customerEmail)}
                </div>
            </div>
            
            <div class="payment-approval">
                <div class="payment-box"><strong>💰 طريقة الدفع:</strong> ${getPaymentMethodName(order.paymentMethod)}</div>
                <div class="payment-box"><strong>🚚 طريقة الاستلام:</strong> ${shipText}</div>
                <div class="approval-box"><strong>✅ رمز الموافقة:</strong> ${order.approvalCode || 'غير مطلوب'}</div>
            </div>
            
            <table class="invoice-table">
                <thead>
                    <tr><th>#</th><th>الصورة</th><th>المنتج / الوصف</th><th>الكمية</th><th>سعر الوحدة</th><th>الإجمالي</th></tr>
                </thead>
                <tbody>${itemsHtml}</tbody>
            </table>
            
            <div class="totals">
                <div><span>المجموع الفرعي:</span><span>${subtotal.toFixed(2)} ريال</span></div>
                ${discount > 0 ? `<div><span>الخصم:</span><span>- ${discount.toFixed(2)} ريال</span></div>` : ''}
                <div><span>ضريبة القيمة المضافة 15%:</span><span>${tax.toFixed(2)} ريال</span></div>
                <div class="grand-total"><span>الإجمالي النهائي:</span><span>${total.toFixed(2)} ريال</span></div>
            </div>
            
            <div class="barcodes-container">
                <div class="barcode-item">
                    <div id="zatcaQR" class="qr-placeholder"></div>
                    <p>باركود هيئة الزكاة والضريبة</p>
                </div>
                <div class="barcode-item">
                    <div id="orderQR" class="qr-placeholder"></div>
                    <p>باركود الطلب</p>
                </div>
            </div>
            
            ${buildFooter(1, 3, sellerData)}
        </div>
    `;
}

// بناء صفحة الشروط والأحكام - الصفحة الأولى
export function buildTermsPage1(order, sellerData, termsContent) {
    return `
        <div class="terms-section-page">
            ${buildHeader("الشروط والأحكام", sellerData)}
            ${termsContent}
            ${buildFooter(2, 3, sellerData)}
        </div>
    `;
}

// بناء صفحة الشروط والأحكام - الصفحة الثانية
export function buildTermsPage2(order, sellerData, termsPage2Content) {
    return `
        <div class="terms-section-page">
            ${buildHeader("الشروط والأحكام (تابع)", sellerData)}
            ${termsPage2Content}
            <div style="margin-top: 20px; font-size: 11px; text-align: center;">
                <p>آخر تحديث: ${new Date().toLocaleDateString('ar-SA')}</p>
            </div>
            ${buildFooter(3, 3, sellerData)}
        </div>
    `;
}

// عرض رسائل
export function showLoading(message) {
    let overlay = document.getElementById('printLoadingOverlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'printLoadingOverlay';
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.7); display: flex; align-items: center;
            justify-content: center; z-index: 9999; flex-direction: column;
        `;
        overlay.innerHTML = `
            <div style="background: white; padding: 25px 35px; border-radius: 16px; text-align: center;">
                <div style="border: 4px solid #f3f3f3; border-top: 4px solid #1e3a5f; border-radius: 50%; width: 45px; height: 45px; animation: spin 1s linear infinite; margin: 0 auto 15px;"></div>
                <p id="printLoadingMessage" style="margin: 0; color: #333;">${message}</p>
            </div>
        `;
        document.body.appendChild(overlay);
    }
    const msgEl = document.getElementById('printLoadingMessage');
    if (msgEl) msgEl.textContent = message;
    overlay.style.display = 'flex';
}

export function hideLoading() {
    const overlay = document.getElementById('printLoadingOverlay');
    if (overlay) overlay.style.display = 'none';
}

export function showToast(message, isError = false) {
    const toast = document.createElement('div');
    toast.textContent = (isError ? '❌ ' : '✅ ') + message;
    toast.style.cssText = `
        position: fixed; bottom: 80px; left: 50%; transform: translateX(-50%);
        background: ${isError ? '#ef4444' : '#10b981'}; color: white;
        padding: 10px 20px; border-radius: 8px; z-index: 10000;
        font-size: 14px; animation: fadeInUp 0.3s ease;
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// تحميل وعرض الفاتورة
export async function loadAndDisplayInvoice(orderId, containerId) {
    showLoading('جاري تحميل الفاتورة...');
    
    try {
        await loadCustomersAndProducts();
        const order = await getOrderFull(orderId);
        
        if (!order) {
            throw new Error('الطلب غير موجود');
        }
        
        // بناء الفاتورة مع 3 صفحات: الفاتورة + الشروط صفحة1 + الشروط صفحة2
        const invoiceHTML = buildInvoicePage(order, sellerData) + 
                           buildTermsPage1(order, sellerData, termsContent) +
                           buildTermsPage2(order, sellerData, termsPage2Content);
        
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = invoiceHTML;
        }
        
        // تحديث اسم العميل والتاريخ في الشروط
        setTimeout(() => {
            const nameSpans = document.querySelectorAll('.customer-name-display');
            const dateSpans = document.querySelectorAll('.customer-date-display');
            
            nameSpans.forEach(span => {
                span.textContent = order.customerName || '_________________';
            });
            
            dateSpans.forEach(span => {
                span.textContent = `${formatDateYMD(order.orderDate)} - ${formatTime12(order.orderTime)}`;
            });
            
            // إنشاء QR Codes
            const zatcaDiv = document.getElementById('zatcaQR');
            if (zatcaDiv && typeof QRCode !== 'undefined') {
                const qrData = generateZATCAQRCode(order, sellerData);
                new QRCode(zatcaDiv, { text: qrData, width: 100, height: 100 });
            }
            
            const orderDiv = document.getElementById('orderQR');
            if (orderDiv && typeof QRCode !== 'undefined') {
                new QRCode(orderDiv, { 
                    text: `${window.location.origin}/print.html?id=${order.id}`,
                    width: 100, height: 100 
                });
            }
        }, 100);
        
        showToast('تم تحميل الفاتورة بنجاح');
        return order;
        
    } catch (error) {
        console.error('خطأ:', error);
        showToast(error.message, true);
        throw error;
    } finally {
        hideLoading();
    }
}
