// ========================================
// print.js - دوال الطباعة المتقدمة (نسخة كاملة)
// ========================================

let printCurrentOrder = null;
let printDb = null;

// دوال مساعدة
window.formatDate = function(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth()+1).toString().padStart(2, '0')}/${d.getFullYear()}`;
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

const sellerLegal = {
    licenseNumber: "FL-765735204",
    taxNumber: "312495447600003"
};

window.buildHeader = function(title) {
    return `
        <div class="page-header">
            <div class="header-right">
                <div class="logo-area">
                    <img src="/fi-khidmatik/images/logo.svg" class="logo-img" onerror="this.style.display='none'">
                    <div class="logo-text">
                        <div class="platform-name">في خدمتك</div>
                        <div class="platform-slogan">من الإتقان بلس</div>
                    </div>
                </div>
            </div>
            <div class="header-center"><div class="page-title">${title}</div></div>
            <div class="header-left">
                <div class="legal-numbers">
                    <div><span>شهادة العمل الحر:</span> <span>${sellerLegal.licenseNumber}</span></div>
                    <div><span>الرقم الضريبي:</span> <span>${sellerLegal.taxNumber}</span></div>
                </div>
            </div>
        </div>
    `;
};

window.buildFooter = function(pageNum, totalPages) {
    return `
        <div class="page-footer">
            <div class="contact-info">
                <span><i class="fas fa-phone-alt"></i> +966 534051317</span>
                <span><i class="fab fa-whatsapp"></i> +966 545312021</span>
                <span><i class="fas fa-envelope"></i> info@fi-khidmatik.com</span>
                <span><i class="fas fa-globe"></i> https://fi-khidmatik.com.sa</span>
            </div>
            <div class="legal-footer">فاتورة إلكترونية - نسخة معتمدة قانونياً</div>
            <div class="page-number">صفحة ${pageNum} من ${totalPages}</div>
        </div>
    `;
};

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

function printHideLoading() {
    let ov = document.getElementById('loadingOverlay');
    if (ov) ov.style.display = 'none';
}

function printShowToast(msg, isError) {
    let t = document.createElement('div');
    t.className = 'toast-message';
    t.style.background = isError ? '#ef4444' : '#10b981';
    t.innerHTML = (isError ? '❌ ' : '✅ ') + msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3000);
}

function printInvoice() {
    try {
        window.print();
        printShowToast('تم إرسال الفاتورة إلى الطابعة', false);
    } catch (error) {
        console.error(error);
        printShowToast('حدث خطأ أثناء الطباعة', true);
    }
}

async function waitForImages(element, timeout = 5000) {
    const imgs = Array.from(element.querySelectorAll('img'));
    if (imgs.length === 0) return;
    await Promise.all(imgs.map(img => {
        if (img.complete) return Promise.resolve();
        return Promise.race([
            new Promise(resolve => { img.onload = resolve; img.onerror = resolve; }),
            new Promise(resolve => setTimeout(resolve, timeout))
        ]);
    }));
}

function previewPrint() {
    try {
        let pages = document.querySelectorAll('.page');
        if (pages.length === 0) {
            printShowToast('لا توجد صفحات للطباعة!', true);
            return;
        }
        pages.forEach(page => {
            let imgs = page.querySelectorAll('img');
            imgs.forEach(img => {
                let src = img.getAttribute('src');
                if (src && !src.startsWith('http') && !src.startsWith('data:')) {
                    if (src.startsWith('/')) img.src = window.location.origin + src;
                    else img.src = window.location.origin + '/fi-khidmatik/' + src;
                }
            });
        });
        let printWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes,toolbar=yes');
        if (!printWindow) {
            printShowToast('الرجاء السماح بالنوافذ المنبثقة', true);
            return;
        }
        let pagesContent = '';
        pages.forEach(page => { pagesContent += page.outerHTML; });
        let printContent = `<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="UTF-8"><title>معاينة الفاتورة</title>
            <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap" rel="stylesheet">
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
            <link rel="stylesheet" href="/fi-khidmatik/css/invoice.css">
            <style>
                body { background: #e9ecef; padding: 20px; margin: 0; }
                .page { margin: 0 auto 20px; box-shadow: 0 0 10px rgba(0,0,0,0.1); background: white; }
                @media print { body { background: white; padding: 0; } .page { margin: 0; box-shadow: none; } }
                .preview-buttons { position: fixed; bottom: 0; left: 0; right: 0; background: white; text-align: center; padding: 12px; box-shadow: 0 -2px 10px rgba(0,0,0,0.1); z-index: 1000; }
                .preview-buttons button { padding: 8px 16px; margin: 0 5px; border: none; border-radius: 6px; cursor: pointer; }
                .btn-print { background: #1e3a5f; color: white; }
                .btn-pdf { background: #dc2626; color: white; }
                .btn-png { background: #16a34a; color: white; }
                .btn-close { background: #6c757d; color: white; }
            </style>
        </head><body>${pagesContent}
        <div class="preview-buttons no-print">
            <button class="btn-print" onclick="window.print()">🖨️ طباعة</button>
            <button class="btn-pdf" onclick="window.exportToPDF()">📄 PDF</button>
            <button class="btn-png" onclick="window.exportToPNG()">🖼️ PNG</button>
            <button class="btn-close" onclick="window.close()">✖️ إغلاق</button>
        </div></body></html>`;
        printWindow.document.write(printContent);
        printWindow.document.close();
        printShowToast('تم فتح معاينة الطباعة', false);
    } catch (error) {
        console.error(error);
        printShowToast('حدث خطأ في المعاينة', true);
    }
}

async function exportToPDF() {
    let pages = document.querySelectorAll('.page');
    if (!pages.length) { printShowToast('لا توجد فاتورة للتصدير', true); return; }
    if (typeof html2canvas === 'undefined' || typeof window.jspdf === 'undefined') {
        printShowToast('المكتبات غير محملة، حاول مرة أخرى', true);
        return;
    }
    printShowLoading('جاري تجهيز الصور والفاتورة...');
    let buttons = document.querySelector('.action-buttons');
    if (buttons) buttons.style.display = 'none';
    let corsErrors = false;
    try {
        let { jsPDF } = window.jspdf;
        let pdf = new jsPDF('p', 'mm', 'a4');
        for (let i = 0; i < pages.length; i++) {
            try {
                await waitForImages(pages[i], 6000);
                let canvas = await html2canvas(pages[i], { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
                if (i !== 0) pdf.addPage();
                let imgData = canvas.toDataURL('image/png');
                let imgWidth = 210;
                let imgHeight = (canvas.height * imgWidth) / canvas.width;
                pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            } catch(e) { corsErrors = true; if(i!==0) pdf.addPage(); }
        }
        let customerName = 'عميل', orderNumber = 'فاتورة', orderDate = '';
        let nameElem = document.querySelector('.address-card:last-child p:first-child');
        if (nameElem) { let match = nameElem.innerText.match(/:(.+)/); if (match) customerName = match[1].trim(); }
        let numElem = document.querySelector('.info-value');
        if (numElem) orderNumber = numElem.innerText.trim();
        let dateElem = document.querySelector('.info-item:nth-child(2) .info-value');
        if (dateElem) orderDate = dateElem.innerText.split(' - ')[0].trim();
        customerName = customerName.replace(/[\\/*?:"<>|]/g, '');
        orderNumber = orderNumber.replace(/[\\/*?:"<>|]/g, '');
        orderDate = orderDate.replace(/[\\/*?:"<>|]/g, '');
        let fileName = `${customerName} - ${orderNumber}`;
        if (orderDate) fileName += ` - ${orderDate}`;
        fileName += '.pdf';
        pdf.save(fileName);
        printShowToast(corsErrors ? 'تم حفظ PDF مع تحذير: بعض الصور لم تظهر' : 'تم حفظ PDF بنجاح', false);
    } catch(error) {
        console.error(error);
        printShowToast('خطأ في إنشاء PDF: ' + error.message, true);
    } finally {
        if (buttons) buttons.style.display = 'flex';
        printHideLoading();
    }
}

async function exportToPNG() {
    let pages = document.querySelectorAll('.page');
    if (!pages.length) { printShowToast('لا توجد فاتورة للتصدير', true); return; }
    if (typeof html2canvas === 'undefined') { printShowToast('جاري تحميل المكتبات...', true); return; }
    printShowLoading('جاري تجهيز الصور...');
    let corsErrors = false;
    try {
        for (let i = 0; i < pages.length; i++) {
            try {
                await waitForImages(pages[i], 6000);
                let canvas = await html2canvas(pages[i], { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
                let link = document.createElement('a');
                link.download = `invoice_page_${i+1}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
            } catch(e) { corsErrors = true; }
        }
        printShowToast(corsErrors ? 'تم حفظ PNG مع تحذير: بعض الصور لم تظهر' : 'تم حفظ PNG بنجاح', false);
    } catch(error) {
        console.error(error);
        printShowToast('خطأ في إنشاء PNG: ' + error.message, true);
    } finally { printHideLoading(); }
}

function initPrintModule(order, db, customers = []) {
    printCurrentOrder = order;
    printDb = db;
    window.customersList = customers;
    console.log('تم تهيئة وحدة الطباعة بنجاح');
}

window.printInvoice = printInvoice;
window.previewPrint = previewPrint;
window.exportToPDF = exportToPDF;
window.exportToPNG = exportToPNG;
window.initPrintModule = initPrintModule;
