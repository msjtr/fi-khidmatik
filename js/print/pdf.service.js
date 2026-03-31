// fi-khidmatik/js/print/pdf.service.js

/**
 * إنشاء PDF من عنصر HTML
 * @param {string} elementId - id العنصر المراد تحويله
 * @param {string} filename - اسم الملف
 */
export async function generatePDF(elementId, filename = 'document.pdf') {
    try {
        // إظهار رسالة انتظار
        showLoadingMessage('جاري تجهيز PDF...');
        
        // // fi-khidmatik/js/print/pdf.service.js

// دالة لإنشاء PDF
async function generatePDF(elementId, filename) {
    if (!filename) {
        filename = 'document.pdf';
    }
    
    try {
        // إظهار رسالة انتظار
        showLoading();
        
        // الحصول على العنصر
        var element = document.getElementById(elementId);
        
        if (!element) {
            throw new Error('العنصر غير موجود');
        }
        
        // استخدام html2canvas لتحويل العنصر إلى صورة
        var canvas = await html2canvas(element, {
            scale: 2,
            backgroundColor: '#ffffff'
        });
        
        // تحويل الصورة إلى PDF
        var imgData = canvas.toDataURL('image/png');
        var pdf = new jspdf.jsPDF({
            orientation: 'p',
            unit: 'mm',
            format: 'a4'
        });
        
        var pdfWidth = pdf.internal.pageSize.getWidth();
        var pdfHeight = pdf.internal.pageSize.getHeight();
        var imgWidth = pdfWidth;
        var imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        var heightLeft = imgHeight;
        var position = 0;
        
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
        
        while (heightLeft > 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pdfHeight;
        }
        
        pdf.save(filename);
        hideLoading();
        
        return true;
        
    } catch (error) {
        console.error('خطأ:', error);
        hideLoading();
        alert('حدث خطأ: ' + error.message);
        return false;
    }
}

// دالة لإظهار رسالة التحميل
function showLoading() {
    var div = document.getElementById('pdf-loading');
    if (!div) {
        div = document.createElement('div');
        div.id = 'pdf-loading';
        div.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:black;color:white;padding:20px;border-radius:10px;z-index:9999;text-align:center';
        document.body.appendChild(div);
    }
    div.innerHTML = 'جاري إنشاء PDF...<br>⏳';
    div.style.display = 'block';
}

// دالة لإخفاء رسالة التحميل
function hideLoading() {
    var div = document.getElementById('pdf-loading');
    if (div) {
        div.style.display = 'none';
    }
}

// تصدير الدالة
export { generatePDF };الحصول على العنصر
        const element = document.getElementById(elementId);
        if (!element) {
            throw new Error('العنصر غير موجود: ' + elementId);
        }
        
        // نسخ محتوى العنصر للحفاظ على التنسيق
        const originalContent = element.cloneNode(true);
        
        // إضافة تنسيقات إضافية للطباعة
        originalContent.style.padding = '20px';
        originalContent.style.backgroundColor = '#ffffff';
        originalContent.style.width = '100%';
        
        // إنشاء حاوية مؤقتة
        const tempContainer = document.createElement('div');
        tempContainer.style.position = 'absolute';
        tempContainer.style.left = '-9999px';
        tempContainer.style.top = '0';
        tempContainer.appendChild(originalContent);
        document.body.appendChild(tempContainer);
        
        // انتظار تحميل الصور
        await waitForImages(tempContainer);
        
        // استخدام html2canvas
        const canvas = await html2canvas(tempContainer, {
            scale: 2,
            backgroundColor: '#ffffff',
            logging: false,
            useCORS: true
        });
        
        // إزالة الحاوية المؤقتة
        document.body.removeChild(tempContainer);
        
        // تحويل canvas إلى PDF
        const imgData = canvas.toDataURL('image/png');
        
        // إنشاء PDF
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });
        
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = pdfWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        // إضافة الصورة إلى PDF
        let heightLeft = imgHeight;
        let position = 0;
        let pageNum = 1;
        
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
        
        while (heightLeft > 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pdfHeight;
            pageNum++;
        }
        
        // حفظ الملف
        pdf.save(filename);
        
        // إخفاء رسالة الانتظار
        hideLoadingMessage();
        
        console.log('تم إنشاء PDF بنجاح، عدد الصفحات: ' + pageNum);
        return true;
        
    } catch (error) {
        console.error('خطأ في إنشاء PDF:', error);
        hideLoadingMessage();
        alert('حدث خطأ: ' + error.message);
        return false;
    }
}

/**
 * انتظار تحميل جميع الصور
 */
function waitForImages(container) {
    const images = container.querySelectorAll('img');
    const promises = Array.from(images).map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
        });
    });
    return Promise.all(promises);
}

/**
 * إظهار رسالة تحميل
 */
function showLoadingMessage(message) {
    let loadingDiv = document.getElementById('pdf-loading-message');
    if (!loadingDiv) {
        loadingDiv = document.createElement('div');
        loadingDiv.id = 'pdf-loading-message';
        loadingDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 20px 30px;
            border-radius: 12px;
            z-index: 10000;
            font-family: Arial, sans-serif;
            font-size: 16px;
            text-align: center;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            direction: rtl;
        `;
        document.body.appendChild(loadingDiv);
    }
    loadingDiv.innerHTML = `
        <div style="margin-bottom: 10px;">${message}</div>
        <div style="font-size: 24px;">⏳</div>
    `;
    loadingDiv.style.display = 'block';
}

/**
 * إخفاء رسالة التحميل
 */
function hideLoadingMessage() {
    const loadingDiv = document.getElementById('pdf-loading-message');
    if (loadingDiv) {
        loadingDiv.style.display = 'none';
    }
}

// تصدير افتراضي
export default { generatePDF };
