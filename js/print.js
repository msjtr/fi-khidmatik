// ========================================
// print.js - دوال الطباعة المتقدمة (نسخة محسنة)
// ========================================

// ========================================
// الدوال المساعدة التي تحتاجها terms.js
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

window.buildHeader = function(title) {
    return `
        <div class="page-header">
            <div class="header-right"></div>
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
            <div class="page-number">الصفحة ${pageNum} من ${totalPages}</div>
        </div>
    `;
};

// ========================================
// بقية دوال الطباعة
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

// جميع أنماط CSS مضمّنة هنا
function getInlineStyles() {
    return `
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        @media print {
            @page {
                size: A4;
                margin: 15mm 12mm 15mm 12mm;
            }
            body {
                margin: 0;
                padding: 0;
                background: white;
                print-color-adjust: exact;
                -webkit-print-color-adjust: exact;
            }
            .page {
                margin: 0;
                padding: 0;
                width: 100%;
                page-break-after: always;
                page-break-inside: avoid;
                box-shadow: none;
                background: white;
                position: relative;
            }
            .page:last-child {
                page-break-after: auto;
            }
            .page-header, .info-grid, .addresses, .payment-grid,
            .products-table, .totals-box, .barcodes, .page-footer,
            .terms-section {
                page-break-inside: avoid;
                break-inside: avoid;
            }
            .action-buttons, .no-print, .btn, .loading-overlay {
                display: none !important;
            }
        }

        body {
            background: #e9ecef;
            font-family: 'Segoe UI', 'Cairo', 'Tahoma', sans-serif;
            padding: 20px;
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        .page {
            width: 100%;
            max-width: 210mm;
            background: white;
            position: relative;
        }

        @media screen {
            .page {
                padding: 10mm 12mm;
                min-height: 297mm;
                page-break-after: always;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
                margin-bottom: 20px;
            }
        }

        @media print {
            .page {
                padding: 0;
                min-height: 0;
                height: auto;
            }
        }

        .page-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #1e3a5f;
            padding-bottom: 8px;
            margin-bottom: 15px;
            flex-wrap: wrap;
            gap: 8px;
        }
        .header-right { flex: 1; text-align: right; min-width: 130px; }
        .header-center { flex: 2; text-align: center; }
        .header-left { flex: 1; text-align: left; min-width: 150px; }
        .logo-area { display: flex; align-items: center; gap: 6px; justify-content: flex-start; }
        .platform-name { font-size: 13px; font-weight: bold; color: #1e3a5f; }
        .platform-slogan { font-size: 8px; color: #6c757d; }
        .page-title { font-size: 16px; font-weight: bold; color: #1e3a5f; display: inline-block; }

        .page-footer {
            margin-top: 20px;
            font-size: 8px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
            padding-top: 8px;
        }
        .contact-info { display: flex; justify-content: center; gap: 12px; flex-wrap: wrap; margin-bottom: 5px; }
        .page-number { text-align: center; margin-top: 4px; font-size: 8px; color: #94a3b8; }

        .info-grid {
            display: flex;
            justify-content: space-between;
            background: #f8fafc;
            padding: 8px 12px;
            border-radius: 8px;
            margin: 12px 0;
            border: 1px solid #e2e8f0;
            flex-wrap: wrap;
            gap: 6px;
        }
        .info-item { text-align: center; }
        .info-label { font-size: 9px; color: #6c757d; margin-bottom: 2px; }
        .info-value { font-weight: bold; font-size: 11px; }

        .products-table {
            width: 100%;
            border-collapse: collapse;
            margin: 12px 0;
            font-size: 9px;
        }
        .products-table th {
            background: #1e3a5f;
            color: white;
            padding: 6px 4px;
            border: 1px solid #2d4a7a;
            text-align: center;
            font-weight: 600;
        }
        .products-table td {
            border: 1px solid #cbd5e1;
            padding: 6px 4px;
            vertical-align: middle;
        }

        .totals-box {
            width: 220px;
            margin-right: auto;
            margin-top: 12px;
            border-top: 1px solid #e2e8f0;
            padding-top: 8px;
        }
        .totals-row {
            display: flex;
            justify-content: space-between;
            padding: 3px 0;
            font-size: 10px;
        }
        .grand-total {
            font-weight: bold;
            font-size: 13px;
            color: #1e3a5f;
            border-top: 1px solid #1e3a5f;
            margin-top: 4px;
            padding-top: 6px;
        }

        .barcodes {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 10px;
            margin: 15px 0;
            padding: 10px;
            background: #f8fafc;
            border-radius: 8px;
            flex-wrap: wrap;
        }
        .qr-code { width: 60px; height: 60px; margin: 0 auto; }

        /* أنماط الشروط والأحكام */
        .terms-container { display: block; direction: rtl; font-family: 'Segoe UI', 'Cairo', sans-serif; }
        .terms-title {
            font-size: 18px;
            font-weight: bold;
            color: #1e3a5f;
            text-align: center;
            margin: 10px 0 15px;
            border-bottom: 2px solid #1e3a5f;
            padding-bottom: 8px;
        }
        .legal-notice {
            background-color: #fef3c7;
            border-right: 4px solid #f59e0b;
            padding: 15px;
            margin-bottom: 25px;
            border-radius: 8px;
        }
        .legal-notice strong { color: #92400e; font-size: 14px; }
        .legal-notice span { color: #78350f; font-size: 11px; line-height: 1.6; }
        .terms-section { margin-bottom: 25px; page-break-inside: avoid; break-inside: avoid; }
        .terms-section-header {
            color: white;
            padding: 10px 18px;
            border-radius: 10px;
            margin-bottom: 12px;
            display: flex;
            align-items: center;
            gap: 12px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        .terms-section-icon {
            font-size: 22px;
            background: rgba(255,255,255,0.2);
            padding: 5px 10px;
            border-radius: 8px;
        }
        .terms-section-header h4 { margin: 0; color: white; font-size: 16px; font-weight: 600; }
        .terms-section-content { padding-right: 8px; }
        .terms-section-content p { font-size: 10px; line-height: 1.6; color: #2d3a4a; margin-bottom: 8px; }
        .terms-section-content strong { color: #1e3a5f; }
        .declaration {
            background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%);
            border-right: 4px solid #0284c7;
            padding: 15px 20px;
            margin: 20px 0;
            border-radius: 12px;
            page-break-inside: avoid;
        }
        .declaration-header { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
        .declaration-icon { font-size: 24px; }
        .declaration-header p { font-size: 16px; font-weight: bold; margin: 0; color: #0369a1; }
        .declaration-text { margin: 0; color: #075985; font-size: 13px; }
        .signature-area {
            margin-top: 20px;
            padding: 18px 20px;
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            border-radius: 12px;
            border: 1px solid #e2e8f0;
            page-break-inside: avoid;
        }
        .signature-row { display: flex; align-items: center; gap: 12px; margin-bottom: 15px; flex-wrap: wrap; }
        .signature-icon { font-size: 20px; }
        .signature-label { font-size: 14px; font-weight: 600; color: #1e293b; min-width: 100px; }
        .signature-value { color: #1e293b; font-weight: 500; font-size: 14px; }
        .signature-line {
            margin-top: 20px;
            padding-top: 15px;
            border-top: 1px dashed #cbd5e1;
            display: flex;
            align-items: center;
            gap: 12px;
        }
        .signature-placeholder {
            border-bottom: 1px solid #94a3b8;
            min-width: 200px;
            display: inline-block;
            height: 25px;
        }

        /* ألوان الأقسام */
        .terms-section-1 .terms-section-header { background: linear-gradient(135deg, #1e3a5f 0%, #2c4c7a 100%); }
        .terms-section-2 .terms-section-header { background: linear-gradient(135deg, #14532d 0%, #166534 100%); }
        .terms-section-3 .terms-section-header { background: linear-gradient(135deg, #4c1d95 0%, #5b21b6 100%); }
        .terms-section-4 .terms-section-header { background: linear-gradient(135deg, #b45309 0%, #c2410c 100%); }
        .terms-section-5 .terms-section-header { background: linear-gradient(135deg, #065f46 0%, #047857 100%); }
        .terms-section-6 .terms-section-header { background: linear-gradient(135deg, #7c2d12 0%, #9a3412 100%); }
        .terms-section-7 .terms-section-header { background: linear-gradient(135deg, #1e40af 0%, #2563eb 100%); }
        .terms-section-8 .terms-section-header { background: linear-gradient(135deg, #831843 0%, #9d174d 100%); }
        .terms-section-9 .terms-section-header { background: linear-gradient(135deg, #374151 0%, #4b5563 100%); }
        .terms-section-10 .terms-section-header { background: linear-gradient(135deg, #0e7490 0%, #0891b2 100%); }
        .terms-section-11 .terms-section-header { background: linear-gradient(135deg, #854d0e 0%, #a16207 100%); }
        .terms-section-12 .terms-section-header { background: linear-gradient(135deg, #701a75 0%, #86198f 100%); }
        .terms-section-13 .terms-section-header { background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%); }

        @media (max-width: 768px) {
            body { padding: 10px; }
            .page { padding: 5mm 6mm; }
            .addresses, .payment-grid { flex-direction: column; }
            .info-grid { flex-direction: column; text-align: center; }
            .page-header { flex-direction: column; text-align: center; }
            .header-right, .header-center, .header-left { text-align: center; width: 100%; }
            .logo-area { justify-content: center; }
            .barcodes { flex-direction: column; }
            .signature-row { flex-direction: column; align-items: flex-start; gap: 5px; }
        }

        .preview-buttons {
            text-align: center;
            padding: 20px;
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: white;
            box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
            z-index: 1000;
        }
        .preview-buttons button {
            padding: 10px 20px;
            margin: 5px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
        }
        .btn-print { background: #1e3a5f; color: white; }
        .btn-close { background: #ef4444; color: white; }
    `;
}

function previewPrint() {
    try {
        // الحصول على جميع الصفحات
        var pages = document.querySelectorAll('.page');
        
        console.log('عدد الصفحات الموجودة:', pages.length);
        
        if (pages.length === 0) {
            printShowToast('لا توجد صفحات للطباعة! يرجى إنشاء الفاتورة أولاً', true);
            return;
        }
        
        var printWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes,toolbar=yes');
        if (!printWindow) {
            printShowToast('الرجاء السماح بالنوافذ المنبثقة', true);
            return;
        }
        
        var inlineStyles = getInlineStyles();
        
        // تجميع محتوى الصفحات
        var pagesContent = '';
        pages.forEach(function(page, index) {
            pagesContent += page.outerHTML;
            console.log('تم إضافة صفحة رقم:', index + 1);
        });
        
        var printContent = '<!DOCTYPE html>' +
            '<html dir="rtl" lang="ar">' +
            '<head>' +
                '<meta charset="UTF-8">' +
                '<title>معاينة الفاتورة</title>' +
                '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">' +
                '<style>' + inlineStyles + '</style>' +
            '</head>' +
            '<body>' +
            pagesContent +
            '<div class="preview-buttons no-print">' +
                '<button class="btn-print" onclick="window.print()">🖨️ طباعة</button>' +
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
    
    printShowLoading('جاري إنشاء PDF...');
    
    var buttons = document.querySelector('.action-buttons');
    if (buttons) {
        buttons.style.display = 'none';
    }
    
    try {
        var { jsPDF } = window.jspdf;
        var pdf = new jsPDF('p', 'mm', 'a4');
        
        for (var i = 0; i < pages.length; i++) {
            console.log('جاري معالجة الصفحة:', i + 1);
            
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
            var imgWidth = 210;
            var imgHeight = (canvas.height * imgWidth) / canvas.width;
            
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
    
    window.addEventListener('beforeprint', function() {
        console.log('استعداد للطباعة...');
    });
    
    window.addEventListener('afterprint', function() {
        console.log('تم الانتهاء من الطباعة');
    });
    
    console.log('تم تهيئة وحدة الطباعة بنجاح');
    console.log('الطلب الحالي:', printCurrentOrder);
}

// تصدير الدوال
window.printInvoice = printInvoice;
window.previewPrint = previewPrint;
window.exportToPDF = exportToPDF;
window.initPrintModule = initPrintModule;
