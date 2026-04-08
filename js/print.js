// ========================================
// print.js - دوال الطباعة المتقدمة (نسخة نهائية)
// ========================================

let printCurrentOrder = null;
let printDb = null;

// ========================================
// الدوال المساعدة الأساسية
// ========================================

window.formatDate = function(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
};

window.formatTime = function(time24) {
    if (!time24) return '';
    let [h, m] = time24.split(':');
    let hour = parseInt(h);
    let ampm = hour >= 12 ? 'مساءً' : 'صباحاً';
    hour = hour % 12 || 12;
    return `${hour.toString().padStart(2, '0')}:${m} ${ampm}`;
};

window.escapeHtml = function(str) {
    if (!str) return '';
    return String(str).replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
};

// ========================================
// دوال الشعار ورأس وتذييل الصفحة
// ========================================

function getLogoHTML() {
    return `
        <div class="logo-area">
            <img src="/fi-khidmatik/images/logo.svg" alt="شعار المنصة" class="logo-img" onerror="this.style.display='none'">
            <div class="logo-text">
                <div class="platform-name">متجرك الذكي</div>
                <div class="platform-slogan">منصة متكاملة</div>
            </div>
        </div>
    `;
}

window.buildHeader = function(title) {
    return `
        <div class="page-header">
            <div class="header-right">
                ${getLogoHTML()}
            </div>
            <div class="header-center">
                <div class="page-title">${title}</div>
            </div>
            <div class="header-left"></div>
        </div>
    `;
};

window.buildFooter = function(pageNum, totalPages) {
    return `
        <div class="page-footer">
            <div class="contact-info">
                <span><i class="fas fa-phone"></i> 0530000000</span>
                <span><i class="fas fa-envelope"></i> info@example.com</span>
            </div>
            <div class="page-number">صفحة ${pageNum} من ${totalPages}</div>
        </div>
    `;
};

// ========================================
// دوال التحكم في الطباعة
// ========================================

function printShowLoading(msg) {
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

function printHideLoading() {
    var ov = document.getElementById('loadingOverlay');
    if (ov) ov.style.display = 'none';
}

function printShowToast(msg, isError) {
    var t = document.createElement('div');
    t.className = 'toast-message';
    t.style.background = isError ? '#ef4444' : '#10b981';
    t.innerHTML = (isError ? '❌ ' : '✅ ') + msg;
    document.body.appendChild(t);
    setTimeout(function() { t.remove(); }, 3000);
}

function printInvoice() {
    try {
        window.print();
        printShowToast('تم إرسال الفاتورة إلى الطابعة', false);
    } catch (error) {
        console.error('Print Error:', error);
        printShowToast('حدث خطأ أثناء الطباعة', true);
    }
}

// ========================================
// معاينة الطباعة
// ========================================

function previewPrint() {
    try {
        var pages = document.querySelectorAll('.page');
        if (pages.length === 0) {
            printShowToast('لا توجد صفحات للطباعة! يرجى إنشاء الفاتورة أولاً', true);
            return;
        }
        
        var printWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes,toolbar=yes');
        if (!printWindow) {
            printShowToast('الرجاء السماح بالنوافذ المنبثقة', true);
            return;
        }
        
        var pagesContent = '';
        pages.forEach(function(page) {
            pagesContent += page.outerHTML;
        });
        
        var printContent = '<!DOCTYPE html>' +
            '<html dir="rtl" lang="ar">' +
            '<head>' +
                '<meta charset="UTF-8">' +
                '<title>معاينة الفاتورة</title>' +
                '<link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap" rel="stylesheet">' +
                '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">' +
                '<link rel="stylesheet" href="/fi-khidmatik/css/invoice.css">' +
                '<style>' +
                    'body { background: #e9ecef; padding: 20px; }' +
                    '.page { margin: 0 auto 20px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }' +
                    '@media print { body { background: white; padding: 0; } .page { margin: 0; box-shadow: none; } .no-print { display: none !important; } }' +
                    '.preview-buttons { text-align: center; padding: 20px; position: fixed; bottom: 0; left: 0; right: 0; background: white; box-shadow: 0 -2px 10px rgba(0,0,0,0.1); z-index: 1000; }' +
                    '.preview-buttons button { padding: 10px 20px; margin: 5px; border: none; border-radius: 5px; cursor: pointer; }' +
                    '.btn-print { background: #1e3a5f; color: white; }' +
                    '.btn-pdf { background: #dc2626; color: white; }' +
                    '.btn-close { background: #ef4444; color: white; }' +
                '</style>' +
            '</head>' +
            '<body>' +
            pagesContent +
            '<div class="preview-buttons no-print">' +
                '<button class="btn-print" onclick="window.print()">🖨️ طباعة</button>' +
                '<button class="btn-pdf" onclick="window.exportToPDF()">📄 PDF</button>' +
                '<button class="btn-close" onclick="window.close()">✖️ إغلاق</button>' +
            '</div>' +
            '</body>' +
            '</html>';
        
        printWindow.document.write(printContent);
        printWindow.document.close();
        printShowToast('تم فتح معاينة الطباعة', false);
    } catch (error) {
        console.error('Preview Error:', error);
        printShowToast('حدث خطأ في المعاينة: ' + error.message, true);
    }
}

// ========================================
// تصدير إلى PDF بدقة عالية واسم ملف مخصص
// ========================================

async function exportToPDF() {
    var pages = document.querySelectorAll('.page');
    if (!pages.length) {
        printShowToast('لا توجد فاتورة للتصدير', true);
        return;
    }
    
    if (typeof html2canvas === 'undefined') {
        printShowToast('جاري تحميل المكتبات... الرجاء المحاولة مرة أخرى', true);
        return;
    }
    
    if (typeof window.jspdf === 'undefined' || typeof window.jspdf.jsPDF === 'undefined') {
        printShowToast('جاري تحميل مكتبة PDF... الرجاء المحاولة مرة أخرى', true);
        return;
    }
    
    printShowLoading('جاري إنشاء PDF بدقة عالية...');
    var buttons = document.querySelector('.action-buttons');
    if (buttons) buttons.style.display = 'none';
    
    try {
        var { jsPDF } = window.jspdf;
        var pdf = new jsPDF('p', 'mm', 'a4');
        
        for (var i = 0; i < pages.length; i++) {
            var canvas = await html2canvas(pages[i], { 
                scale: 3, 
                useCORS: true,
                backgroundColor: '#ffffff', 
                logging: false,
                allowTaint: false,
                windowWidth: pages[i].scrollWidth,
                windowHeight: pages[i].scrollHeight
            });
            
            if (i !== 0) pdf.addPage();
            var imgData = canvas.toDataURL('image/png');
            var imgWidth = 210;
            var imgHeight = (canvas.height * imgWidth) / canvas.width;
            if (imgHeight > 297) {
                var ratio = 297 / imgHeight;
                imgHeight = 297;
                imgWidth = imgWidth * ratio;
            }
            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        }
        
        // استخراج اسم العميل ورقم الطلب والتاريخ
        let customerName = 'عميل';
        let orderNumber = 'فاتورة';
        let orderDate = '';
        
        const customerNameElem = document.querySelector('.customer-info');
        if (customerNameElem) {
            let match = customerNameElem.innerText.match(/الاسم:\s*(.+)/);
            if (match) customerName = match[1].trim();
        }
        const orderNumberElem = document.querySelector('.invoice-title');
        if (orderNumberElem) {
            let match = orderNumberElem.innerText.match(/رقم:\s*(.+)/);
            if (match) orderNumber = match[1].trim();
        }
        const dateElem = document.querySelector('.order-info');
        if (dateElem) {
            let match = dateElem.innerText.match(/التاريخ:\s*(.+)/);
            if (match) orderDate = match[1].trim();
        }
        
        customerName = customerName.replace(/[\\/*?:"<>|]/g, '');
        orderNumber = orderNumber.replace(/[\\/*?:"<>|]/g, '');
        orderDate = orderDate.replace(/[\\/*?:"<>|]/g, '');
        
        let fileName = `${customerName} - ${orderNumber}`;
        if (orderDate) fileName += ` - ${orderDate}`;
        fileName += '.pdf';
        
        pdf.save(fileName);
        printShowToast('تم حفظ PDF بنجاح', false);
    } catch(error) {
        console.error('PDF Export Error:', error);
        printShowToast('خطأ في إنشاء PDF: ' + error.message, true);
    } finally {
        if (buttons) buttons.style.display = 'flex';
        printHideLoading();
    }
}

// ========================================
// تهيئة وحدة الطباعة
// ========================================

function initPrintModule(order, db, customers = []) {
    printCurrentOrder = order;
    printDb = db;
    window.customersList = customers;
    window.addEventListener('beforeprint', () => console.log('استعداد للطباعة...'));
    window.addEventListener('afterprint', () => console.log('تم الانتهاء من الطباعة'));
    console.log('تم تهيئة وحدة الطباعة بنجاح');
}

// تصدير الدوال
window.printInvoice = printInvoice;
window.previewPrint = previewPrint;
window.exportToPDF = exportToPDF;
window.initPrintModule = initPrintModule;
