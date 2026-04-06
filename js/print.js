// ========== دوال الطباعة والتصدير ==========

/**
 * طباعة الفاتورة مباشرة
 */
export function printInvoice() {
    window.print();
}

/**
 * تحميل الفاتورة كملف PDF
 */
export async function downloadPDF(elementId, filename = 'invoice') {
    const element = document.getElementById(elementId);
    if (!element) {
        console.error('❌ العنصر غير موجود:', elementId);
        return;
    }
    
    showLoading('جاري إنشاء ملف PDF...');
    
    try {
        const canvas = await html2canvas(element, {
            scale: 3,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
            allowTaint: false,
            useCORS: true
        });
        
        const imgData = canvas.toDataURL('image/png');
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
            unit: 'mm',
            format: 'a4',
            orientation: 'portrait'
        });
        
        const imgWidth = 210;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;
        
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= 297;
        
        // إضافة صفحات إضافية إذا كان المحتوى أطول من صفحة واحدة
        while (heightLeft > 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= 297;
        }
        
        pdf.save(`${filename}.pdf`);
        showSuccess('تم حفظ PDF بنجاح');
    } catch (error) {
        console.error('PDF Error:', error);
        showError('حدث خطأ في إنشاء PDF');
    } finally {
        hideLoading();
    }
}

/**
 * تحميل الفاتورة كصورة PNG
 */
export async function downloadPNG(elementId, filename = 'invoice') {
    const element = document.getElementById(elementId);
    if (!element) {
        console.error('❌ العنصر غير موجود:', elementId);
        return;
    }
    
    showLoading('جاري إنشاء صورة PNG...');
    
    try {
        const canvas = await html2canvas(element, {
            scale: 3,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
            allowTaint: false
        });
        
        const link = document.createElement('a');
        link.download = `${filename}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        showSuccess('تم حفظ PNG بنجاح');
    } catch (error) {
        console.error('PNG Error:', error);
        showError('حدث خطأ في إنشاء PNG');
    } finally {
        hideLoading();
    }
}

/**
 * تحميل الفاتورة كملف ZIP مضغوط (PDF + PNG)
 */
export async function downloadZIP(elementId, filename = 'invoice') {
    const element = document.getElementById(elementId);
    if (!element) {
        console.error('❌ العنصر غير موجود:', elementId);
        return;
    }
    
    showLoading('جاري إنشاء الملف المضغوط...');
    
    try {
        const canvas = await html2canvas(element, {
            scale: 3,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
            allowTaint: false
        });
        
        const zip = new JSZip();
        
        // إضافة PDF
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
        const imgWidth = 210;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, imgWidth, imgHeight);
        zip.file(`${filename}.pdf`, pdf.output('blob'));
        
        // إضافة PNG
        zip.file(`${filename}.png`, canvas.toDataURL('image/png').split(',')[1], { base64: true });
        
        // إنشاء ZIP
        const content = await zip.generateAsync({ type: 'blob' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = `${filename}.zip`;
        link.click();
        URL.revokeObjectURL(link.href);
        
        showSuccess('تم حفظ الملف المضغوط بنجاح');
    } catch (error) {
        console.error('ZIP Error:', error);
        showError('حدث خطأ في إنشاء الملف المضغوط');
    } finally {
        hideLoading();
    }
}

/**
 * إنشاء باركود هيئة الزكاة والضريبة (ZATCA) - نسخة متوافقة مع المعايير السعودية
 */
export function generateZATCAQRCode(containerId, orderData) {
    const sellerName = 'منصة في خدمتك';
    const vatNumber = '312495447600003';
    const timestamp = new Date().toISOString();
    const totalWithVAT = orderData.total || 0;
    const vatAmount = orderData.tax || 0;
    
    // تشفير TLV وفق معيار هيئة الزكاة (Base64)
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
    
    // تحويل إلى Base64
    const base64Data = btoa(tlvData);
    
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = '';
        new QRCode(container, {
            text: base64Data,
            width: 100,
            height: 100,
            colorDark: '#000000',
            colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel.H
        });
    }
}

/**
 * إنشاء باركود هيئة الزكاة (نسخة بديلة باستخدام TLV مباشر)
 */
export function generateZATCAQRCodeV2(containerId, orderData) {
    const sellerName = 'منصة في خدمتك';
    const vatNumber = '312495447600003';
    const timestamp = new Date().toISOString();
    const totalWithVAT = orderData.total || 0;
    const vatAmount = orderData.tax || 0;
    
    // إنشاء كائن TLV
    const tlvTags = [
        { tag: 1, value: sellerName },
        { tag: 2, value: vatNumber },
        { tag: 3, value: timestamp },
        { tag: 4, value: totalWithVAT.toFixed(2) },
        { tag: 5, value: vatAmount.toFixed(2) }
    ];
    
    let tlvString = '';
    for (const item of tlvTags) {
        tlvString += String.fromCharCode(item.tag);
        tlvString += String.fromCharCode(item.value.length);
        tlvString += item.value;
    }
    
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = '';
        new QRCode(container, {
            text: tlvString,
            width: 100,
            height: 100,
            colorDark: '#000000',
            colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel.H
        });
    }
}

// ========== دوال مساعدة للتحميل ==========
let loadingOverlay = null;

export function showLoading(message) {
    if (!loadingOverlay) {
        loadingOverlay = document.createElement('div');
        loadingOverlay.id = 'loadingOverlay';
        loadingOverlay.style.cssText = `
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.7); display: flex; align-items: center;
            justify-content: center; z-index: 9999; flex-direction: column;
        `;
        loadingOverlay.innerHTML = `
            <div style="background: white; padding: 20px; border-radius: 12px; text-align: center;">
                <div class="loading-spinner" style="border: 3px solid #f3f3f3; border-top: 3px solid #1e40af; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto 10px;"></div>
                <p id="loadingMessage">جاري التحميل...</p>
            </div>
        `;
        document.body.appendChild(loadingOverlay);
        
        const style = document.createElement('style');
        style.textContent = `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes slideUp {
            from { transform: translateX(-50%) translateY(100px); opacity: 0; }
            to { transform: translateX(-50%) translateY(0); opacity: 1; }
        }`;
        document.head.appendChild(style);
    }
    const messageEl = document.getElementById('loadingMessage');
    if (messageEl) messageEl.textContent = message;
    loadingOverlay.style.display = 'flex';
}

export function hideLoading() {
    if (loadingOverlay) loadingOverlay.style.display = 'none';
}

export function showSuccess(message) {
    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.textContent = '✅ ' + message;
    toast.style.cssText = `
        position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
        background: #10b981; color: white; padding: 10px 20px;
        border-radius: 8px; z-index: 10000; font-size: 14px;
        animation: slideUp 0.3s ease;
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

export function showError(message) {
    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.textContent = '❌ ' + message;
    toast.style.cssText = `
        position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
        background: #ef4444; color: white; padding: 10px 20px;
        border-radius: 8px; z-index: 10000; font-size: 14px;
        animation: slideUp 0.3s ease;
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

/**
 * إزالة رسائل التوست الموجودة
 */
export function clearToasts() {
    const toasts = document.querySelectorAll('.toast-message');
    toasts.forEach(toast => toast.remove());
}

/**
 * إخفاء التحميل وإزالة العنصر بالكامل
 */
export function removeLoadingOverlay() {
    if (loadingOverlay) {
        loadingOverlay.remove();
        loadingOverlay = null;
    }
}

/**
 * تصدير الفاتورة كملف HTML
 */
export async function downloadHTML(elementId, filename = 'invoice') {
    const element = document.getElementById(elementId);
    if (!element) {
        console.error('❌ العنصر غير موجود:', elementId);
        return;
    }
    
    showLoading('جاري إنشاء ملف HTML...');
    
    try {
        const styles = document.querySelector('style').innerHTML;
        const htmlContent = `
<!DOCTYPE html>
<html dir="rtl">
<head>
    <meta charset="UTF-8">
    <title>فاتورة ${filename}</title>
    <style>${styles}</style>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
</head>
<body>
    ${element.outerHTML}
    <div style="text-align:center; padding:20px; margin-top:20px;">
        <button onclick="window.print()" style="padding:10px 20px;">🖨️ طباعة</button>
    </div>
</body>
</html>`;
        
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${filename}.html`;
        link.click();
        URL.revokeObjectURL(link.href);
        showSuccess('تم حفظ HTML بنجاح');
    } catch (error) {
        console.error('HTML Error:', error);
        showError('حدث خطأ في إنشاء HTML');
    } finally {
        hideLoading();
    }
}
