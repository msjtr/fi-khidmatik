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
            backgroundColor: '#ffffff'
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
        
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
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
            backgroundColor: '#ffffff'
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
            backgroundColor: '#ffffff'
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
 * إنشاء باركود هيئة الزكاة والضريبة (ZATCA)
 */
export function generateZATCAQRCode(containerId, orderData) {
    const sellerName = 'منصة في خدمتك';
    const vatNumber = '312495447600003';
    const timestamp = new Date().toISOString();
    const totalWithVAT = orderData.total || 0;
    const vatAmount = orderData.tax || 0;
    
    // بيانات الفاتورة المتوافقة مع ZATCA (TLV format)
    const tlvData = encodeTLV([
        { tag: '1', value: sellerName },
        { tag: '2', value: vatNumber },
        { tag: '3', value: timestamp },
        { tag: '4', value: totalWithVAT.toFixed(2) },
        { tag: '5', value: vatAmount.toFixed(2) }
    ]);
    
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = '';
        new QRCode(container, {
            text: tlvData,
            width: 100,
            height: 100,
            colorDark: '#000000',
            colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel.H
        });
    }
}

/**
 * تشفير البيانات بصيغة TLV لهيئة الزكاة
 */
function encodeTLV(tags) {
    let result = '';
    for (const tag of tags) {
        const value = tag.value;
        const length = value.length;
        result += tag.tag;
        result += String.fromCharCode(length);
        result += value;
    }
    return result;
}

// ========== دوال مساعدة للتحميل ==========
let loadingOverlay = null;

function showLoading(message) {
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
                <div class="loading-spinner" style="border: 3px solid #f3f3f3; border-top: 3px solid #3b82f6; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto 10px;"></div>
                <p id="loadingMessage">جاري التحميل...</p>
            </div>
        `;
        document.body.appendChild(loadingOverlay);
        
        const style = document.createElement('style');
        style.textContent = `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`;
        document.head.appendChild(style);
    }
    document.getElementById('loadingMessage').textContent = message;
    loadingOverlay.style.display = 'flex';
}

function hideLoading() {
    if (loadingOverlay) loadingOverlay.style.display = 'none';
}

function showSuccess(message) {
    alert('✅ ' + message);
}

function showError(message) {
    alert('❌ ' + message);
}
