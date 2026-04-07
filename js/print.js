// ========================================
// print.js - دوال الطباعة والتصدير للفاتورة
// ========================================

// متغيرات عامة
let printCurrentOrder = null;
let printDb = null;

// ========================================
// دوال مساعدة للطباعة
// ========================================

/**
 * عرض رسالة تحميل
 */
function printShowLoading(msg) {
    let ov = document.getElementById('loadingOverlay');
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

/**
 * إخفاء رسالة التحميل
 */
function printHideLoading() {
    let ov = document.getElementById('loadingOverlay');
    if (ov) ov.style.display = 'none';
}

/**
 * عرض رسالة منبثقة
 */
function printShowToast(msg, isError) {
    let t = document.createElement('div');
    t.className = 'toast-message';
    t.style.background = isError ? '#ef4444' : '#10b981';
    t.innerHTML = (isError ? '❌ ' : '✅ ') + msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3000);
}

// ========================================
// دوال الطباعة المباشرة
// ========================================

/**
 * طباعة الفاتورة مباشرة
 */
function printInvoice() {
    try {
        window.print();
        printShowToast('تم إرسال الفاتورة إلى الطابعة', false);
    } catch (error) {
        console.error('Print Error:', error);
        printShowToast('حدث خطأ أثناء محاولة الطباعة', true);
    }
}

/**
 * معاينة الفاتورة قبل الطباعة
 */
function previewPrint() {
    try {
        // إنشاء نافذة معاينة جديدة
        const printWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes');
        if (!printWindow) {
            printShowToast('الرجاء السماح بالنوافذ المنبثقة للمعاينة', true);
            return;
        }
        
        const pages = document.querySelectorAll('.page');
        let printContent = `
            <!DOCTYPE html>
            <html dir="rtl" lang="ar">
            <head>
                <meta charset="UTF-8">
                <title>معاينة الفاتورة - في خدمتك</title>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { 
                        background: white; 
                        font-family: 'Segoe UI', 'Cairo', 'Tahoma', sans-serif;
                        padding: 20px;
                    }
                    .page {
                        width: 210mm;
                        min-height: 297mm;
                        background: white;
                        padding: 15mm 12mm;
                        margin: 0 auto 20px auto;
                        box-shadow: 0 0 10px rgba(0,0,0,0.1);
                        position: relative;
                        page-break-after: always;
                    }
                    .page:last-child {
                        page-break-after: auto;
                    }
                    @media print {
                        body { padding: 0; }
                        .page { box-shadow: none; margin: 0; }
                        .no-print-preview { display: none; }
                    }
                    .preview-header {
                        text-align: center;
                        padding: 10px;
                        background: #1e3a5f;
                        color: white;
                        margin-bottom: 20px;
                        border-radius: 8px;
                    }
                    .preview-header button {
                        background: white;
                        color: #1e3a5f;
                        border: none;
                        padding: 8px 20px;
                        margin: 0 5px;
                        border-radius: 5px;
                        cursor: pointer;
                        font-weight: bold;
                    }
                    .preview-header button:hover {
                        background: #e0e0e0;
                    }
                </style>
                <link rel="stylesheet" href="css/invoice.css">
            </head>
            <body>
                <div class="preview-header no-print-preview">
                    <h3>معاينة الفاتورة</h3>
                    <button onclick="window.print()">🖨️ طباعة</button>
                    <button onclick="window.close()">✖️ إغلاق</button>
                </div>
        `;
        
        pages.forEach(page => {
            printContent += page.outerHTML;
        });
        
        printContent += `
            </body>
            </html>
        `;
        
        printWindow.document.write(printContent);
        printWindow.document.close();
        
    } catch (error) {
        console.error('Preview Error:', error);
        printShowToast('حدث خطأ في معاينة الفاتورة', true);
    }
}

/**
 * طباعة صفحة محددة فقط
 */
function printSpecificPage(pageNumber) {
    try {
        const pages = document.querySelectorAll('.page');
        if (!pages[pageNumber - 1]) {
            printShowToast('الصفحة المطلوبة غير موجودة', true);
            return;
        }
        
        const printWindow = window.open('', '_blank', 'width=800,height=600');
        if (!printWindow) {
            printShowToast('الرجاء السماح بالنوافذ المنبثقة', true);
            return;
        }
        
        let printContent = `
            <!DOCTYPE html>
            <html dir="rtl" lang="ar">
            <head>
                <meta charset="UTF-8">
                <title>طباعة صفحة ${pageNumber} - في خدمتك</title>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
                <link rel="stylesheet" href="css/invoice.css">
                <style>
                    body { margin: 0; padding: 0; background: white; }
                </style>
            </head>
            <body>
                ${pages[pageNumber - 1].outerHTML}
                <script>
                    window.onload = () => window.print();
                </script>
            </body>
            </html>
        `;
        
        printWindow.document.write(printContent);
        printWindow.document.close();
        
    } catch (error) {
        console.error('Print Page Error:', error);
        printShowToast('حدث خطأ في طباعة الصفحة', true);
    }
}

// ========================================
// دوال تصدير PDF متقدمة
// ========================================

/**
 * تصدير الفاتورة كملف PDF
 */
async function exportToPDF() {
    const pages = document.querySelectorAll('.page');
    if (!pages.length) {
        printShowToast('لا توجد فاتورة للتصدير', true);
        return;
    }
    
    printShowLoading('جاري إنشاء ملف PDF...');
    
    try {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        for (let i = 0; i < pages.length; i++) {
            const canvas = await html2canvas(pages[i], { 
                scale: 2, 
                useCORS: false, 
                backgroundColor: '#ffffff', 
                logging: false, 
                allowTaint: true 
            });
            
            if (i !== 0) pdf.addPage();
            
            const imgData = canvas.toDataURL('image/png');
            const imgWidth = 210;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        }
        
        const fileName = `فاتورة_${printCurrentOrder?.orderNumber || 'invoice'}_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.pdf`;
        pdf.save(fileName);
        printShowToast('تم حفظ ملف PDF بنجاح', false);
        
    } catch (error) {
        console.error('PDF Export Error:', error);
        printShowToast('حدث خطأ أثناء إنشاء ملف PDF', true);
    } finally {
        printHideLoading();
    }
}

/**
 * تصدير صفحة محددة كملف PDF
 */
async function exportPageToPDF(pageNumber) {
    const pages = document.querySelectorAll('.page');
    if (!pages[pageNumber - 1]) {
        printShowToast('الصفحة المطلوبة غير موجودة', true);
        return;
    }
    
    printShowLoading(`جاري تصدير الصفحة ${pageNumber}...`);
    
    try {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        const canvas = await html2canvas(pages[pageNumber - 1], { 
            scale: 2, 
            backgroundColor: '#ffffff', 
            logging: false 
        });
        
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 210;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        
        pdf.save(`فاتورة_الصفحة_${pageNumber}_${printCurrentOrder?.orderNumber || 'invoice'}.pdf`);
        printShowToast(`تم تصدير الصفحة ${pageNumber} بنجاح`, false);
        
    } catch (error) {
        console.error('Page Export Error:', error);
        printShowToast('حدث خطأ في تصدير الصفحة', true);
    } finally {
        printHideLoading();
    }
}

// ========================================
// دوال الطباعة المتعددة (طباعة عدة نسخ)
// ========================================

/**
 * طباعة عدة نسخ من الفاتورة
 */
function printMultipleCopies(numCopies) {
    if (!numCopies || numCopies < 1 || numCopies > 10) {
        printShowToast('الرجاء إدخال عدد نسخ بين 1 و 10', true);
        return;
    }
    
    printShowLoading(`جاري تحضير ${numCopies} نسخة للطباعة...`);
    
    try {
        const pages = document.querySelectorAll('.page');
        let allPagesHtml = '';
        
        for (let copy = 0; copy < numCopies; copy++) {
            pages.forEach(page => {
                // إضافة علامة مائية للنسخة
                let pageClone = page.cloneNode(true);
                const copyWatermark = document.createElement('div');
                copyWatermark.style.cssText = `
                    position: absolute;
                    bottom: 5mm;
                    left: 0;
                    right: 0;
                    text-align: center;
                    font-size: 8px;
                    color: #999;
                    direction: ltr;
                `;
                copyWatermark.innerHTML = `نسخة رقم ${copy + 1} - تاريخ الطباعة: ${new Date().toLocaleDateString('ar-SA')}`;
                pageClone.appendChild(copyWatermark);
                allPagesHtml += pageClone.outerHTML;
            });
        }
        
        const printWindow = window.open('', '_blank', 'width=800,height=600');
        if (!printWindow) {
            printShowToast('الرجاء السماح بالنوافذ المنبثقة', true);
            return;
        }
        
        const printHtml = `
            <!DOCTYPE html>
            <html dir="rtl" lang="ar">
            <head>
                <meta charset="UTF-8">
                <title>طباعة ${numCopies} نسخة - في خدمتك</title>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
                <link rel="stylesheet" href="css/invoice.css">
                <style>
                    @media print {
                        @page { margin: 0; }
                        body { margin: 0; padding: 0; }
                    }
                </style>
            </head>
            <body>
                ${allPagesHtml}
                <script>
                    window.onload = () => {
                        setTimeout(() => {
                            window.print();
                            setTimeout(() => window.close(), 1000);
                        }, 500);
                    };
                </script>
            </body>
            </html>
        `;
        
        printWindow.document.write(printHtml);
        printWindow.document.close();
        printShowToast(`تم إرسال ${numCopies} نسخة للطباعة`, false);
        
    } catch (error) {
        console.error('Multiple Copies Error:', error);
        printShowToast('حدث خطأ في طباعة النسخ المتعددة', true);
    } finally {
        printHideLoading();
    }
}

// ========================================
// دوال حفظ الفاتورة كصور
// ========================================

/**
 * حفظ الفاتورة كصور PNG
 */
async function exportToPNG() {
    const pages = document.querySelectorAll('.page');
    if (!pages.length) {
        printShowToast('لا توجد فاتورة للتصدير', true);
        return;
    }
    
    printShowLoading('جاري تحويل الفاتورة إلى صور...');
    
    try {
        for (let i = 0; i < pages.length; i++) {
            const canvas = await html2canvas(pages[i], { 
                scale: 2, 
                backgroundColor: '#ffffff',
                logging: false 
            });
            
            const link = document.createElement('a');
            link.download = `فاتورة_${printCurrentOrder?.orderNumber || 'invoice'}_صفحة_${i + 1}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            
            // تأخير بسيط بين حفظ الصفحات
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        printShowToast('تم حفظ جميع الصفحات كصور', false);
        
    } catch (error) {
        console.error('PNG Export Error:', error);
        printShowToast('حدث خطأ في تحويل الفاتورة إلى صور', true);
    } finally {
        printHideLoading();
    }
}

/**
 * حفظ صفحة محددة كصورة PNG
 */
async function exportPageToPNG(pageNumber) {
    const pages = document.querySelectorAll('.page');
    if (!pages[pageNumber - 1]) {
        printShowToast('الصفحة المطلوبة غير موجودة', true);
        return;
    }
    
    printShowLoading(`جاري تحويل الصفحة ${pageNumber} إلى صورة...`);
    
    try {
        const canvas = await html2canvas(pages[pageNumber - 1], { 
            scale: 2, 
            backgroundColor: '#ffffff',
            logging: false 
        });
        
        const link = document.createElement('a');
        link.download = `فاتورة_${printCurrentOrder?.orderNumber || 'invoice'}_صفحة_${pageNumber}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        
        printShowToast(`تم حفظ الصفحة ${pageNumber} كصورة`, false);
        
    } catch (error) {
        console.error('Page PNG Export Error:', error);
        printShowToast('حدث خطأ في تحويل الصفحة إلى صورة', true);
    } finally {
        printHideLoading();
    }
}

// ========================================
// دوال إضافية للطباعة
// ========================================

/**
 * إعداد خيارات الطباعة المتقدمة
 */
function setupPrintOptions() {
    // إضافة خيارات الطباعة في console (للمطورين)
    console.log('خيارات الطباعة المتاحة:');
    console.log('- printInvoice(): طباعة مباشرة');
    console.log('- previewPrint(): معاينة قبل الطباعة');
    console.log('- printSpecificPage(page): طباعة صفحة محددة');
    console.log('- exportToPDF(): تصدير PDF كامل');
    console.log('- exportPageToPDF(page): تصدير صفحة PDF');
    console.log('- printMultipleCopies(num): طباعة عدة نسخ');
    console.log('- exportToPNG(): تصدير كصور PNG');
    console.log('- exportPageToPNG(page): تصدير صفحة كصورة');
}

/**
 * إنشاء شريط أدوات الطباعة المخصص
 */
function createPrintToolbar() {
    const toolbar = document.createElement('div');
    toolbar.className = 'print-toolbar no-print';
    toolbar.style.cssText = `
        position: fixed;
        bottom: 80px;
        right: 20px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        padding: 10px;
        z-index: 1000;
        display: flex;
        flex-direction: column;
        gap: 8px;
    `;
    
    toolbar.innerHTML = `
        <button class="btn btn-primary" onclick="window.print()" style="font-size: 12px; padding: 6px 12px;">
            <i class="fas fa-print"></i> طباعة
        </button>
        <button class="btn btn-secondary" onclick="previewPrint()" style="font-size: 12px; padding: 6px 12px;">
            <i class="fas fa-eye"></i> معاينة
        </button>
        <button class="btn btn-purple" onclick="exportToPDF()" style="font-size: 12px; padding: 6px 12px;">
            <i class="fas fa-file-pdf"></i> PDF
        </button>
        <button class="btn" onclick="exportToPNG()" style="font-size: 12px; padding: 6px 12px; background: #059669; color: white;">
            <i class="fas fa-image"></i> PNG
        </button>
    `;
    
    document.body.appendChild(toolbar);
}

// ========================================
// تهيئة دوال الطباعة
// ========================================

/**
 * تهيئة وحدة الطباعة
 */
function initPrintModule(order, db) {
    printCurrentOrder = order;
    printDb = db;
    
    // ربط الأزرار بوظائف الطباعة
    const printBtn = document.getElementById('printBtn');
    const pdfBtn = document.getElementById('pdfBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    
    if (printBtn) {
        printBtn.onclick = () => printInvoice();
    }
    
    if (pdfBtn) {
        pdfBtn.onclick = () => exportToPDF();
    }
    
    if (downloadBtn) {
        downloadBtn.onclick = () => exportToPDF();
    }
    
    // إضافة خيارات الطباعة المتقدمة في console
    setupPrintOptions();
    
    // إنشاء شريط أدوات إضافي (اختياري)
    // createPrintToolbar();
    
    console.log('تم تهيئة وحدة الطباعة بنجاح');
}

// تصدير الدوال للاستخدام الخارجي
window.printInvoice = printInvoice;
window.previewPrint = previewPrint;
window.printSpecificPage = printSpecificPage;
window.exportToPDF = exportToPDF;
window.exportPageToPDF = exportPageToPDF;
window.printMultipleCopies = printMultipleCopies;
window.exportToPNG = exportToPNG;
window.exportPageToPNG = exportPageToPNG;
window.initPrintModule = initPrintModule;
