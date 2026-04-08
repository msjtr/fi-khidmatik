// ========================================
// print.js - دوال الطباعة المتقدمة
// ========================================

let printCurrentOrder = null;
let printDb = null;

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

function previewPrint() {
    try {
        var printWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes');
        if (!printWindow) {
            printShowToast('الرجاء السماح بالنوافذ المنبثقة', true);
            return;
        }
        
        var pages = document.querySelectorAll('.page');
        var printContent = '<!DOCTYPE html>' +
            '<html dir="rtl" lang="ar">' +
            '<head>' +
                '<meta charset="UTF-8">' +
                '<title>معاينة الفاتورة</title>' +
                '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">' +
                '<link rel="stylesheet" href="css/invoice.css">' +
                '<style>' +
                    'body { background: white; padding: 20px; margin: 0; }' +
                    '@media print { body { padding: 0; } .no-print { display: none !important; } }' +
                    '.preview-buttons { text-align: center; padding: 20px; position: fixed; bottom: 0; left: 0; right: 0; background: white; box-shadow: 0 -2px 10px rgba(0,0,0,0.1); z-index: 1000; }' +
                    '.preview-buttons button { padding: 10px 20px; margin: 5px; border: none; border-radius: 5px; cursor: pointer; font-size: 14px; }' +
                    '.btn-print { background: #1e3a5f; color: white; }' +
                    '.btn-close { background: #ef4444; color: white; }' +
                '</style>' +
            '</head>' +
            '<body>';
        
        pages.forEach(function(page) {
            printContent += page.outerHTML;
        });
        
        printContent += '<div class="preview-buttons no-print">' +
            '<button class="btn-print" onclick="window.print()">🖨️ طباعة</button>' +
            '<button class="btn-close" onclick="window.close()">✖️ إغلاق</button>' +
            '</div>' +
            '</body>' +
            '</html>';
        
        printWindow.document.write(printContent);
        printWindow.document.close();
    } catch (error) {
        console.error('Preview Error:', error);
        printShowToast('حدث خطأ في المعاينة', true);
    }
}

async function exportToPDF() {
    var pages = document.querySelectorAll('.page');
    if (!pages.length) {
        printShowToast('لا توجد فاتورة للتصدير', true);
        return;
    }
    
    // التحقق من وجود المكتبات المطلوبة
    if (typeof html2canvas === 'undefined') {
        printShowToast('جاري تحميل المكتبات... الرجاء المحاولة مرة أخرى', true);
        return;
    }
    
    if (typeof window.jspdf === 'undefined' || typeof window.jspdf.jsPDF === 'undefined') {
        printShowToast('جاري تحميل مكتبة PDF... الرجاء المحاولة مرة أخرى', true);
        return;
    }
    
    printShowLoading('جاري إنشاء PDF...');
    
    var buttons = document.querySelector('.action-buttons');
    if (buttons) {
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
                allowTaint: true,
                windowWidth: pages[i].scrollWidth,
                windowHeight: pages[i].scrollHeight
            });
            
            if (i !== 0) pdf.addPage();
            var imgData = canvas.toDataURL('image/png');
            var imgWidth = 210; // عرض A4 بالملليمتر
            var imgHeight = (canvas.height * imgWidth) / canvas.width;
            
            // التحقق من أن الارتفاع لا يتجاوز الصفحة
            if (imgHeight > 297) {
                var ratio = 297 / imgHeight;
                imgHeight = 297;
                imgWidth = imgWidth * ratio;
            }
            
            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        }
        
        var fileName = 'فاتورة_' + (printCurrentOrder?.orderNumber || 'invoice') + '.pdf';
        pdf.save(fileName);
        printShowToast('تم حفظ PDF بنجاح', false);
        
    } catch(error) {
        console.error('PDF Export Error:', error);
        printShowToast('خطأ في إنشاء PDF: ' + error.message, true);
    } finally {
        if (buttons) {
            buttons.style.display = 'flex';
        }
        printHideLoading();
    }
}

function initPrintModule(order, db) {
    printCurrentOrder = order;
    printDb = db;
    
    // إضافة مستمع لحدث الطباعة
    window.addEventListener('beforeprint', function() {
        console.log('استعداد للطباعة...');
    });
    
    window.addEventListener('afterprint', function() {
        console.log('تم الانتهاء من الطباعة');
    });
    
    console.log('تم تهيئة وحدة الطباعة بنجاح');
}

// تصدير الدوال للاستخدام العام
window.printInvoice = printInvoice;
window.previewPrint = previewPrint;
window.exportToPDF = exportToPDF;
window.initPrintModule = initPrintModule;
