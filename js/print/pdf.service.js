// js/print/pdf.service.js

/**
 * تحويل عنصر HTML إلى PDF
 * @param {string|HTMLElement} element - العنصر المراد تحويله (id أو عنصر DOM)
 * @param {string} filename - اسم ملف PDF
 * @returns {Promise<void>}
 */
export async function generatePDF(element, filename = 'document.pdf') {
    try {
        // استيراد المكتبات ديناميكياً
        const [html2canvas, jsPDF] = await Promise.all([
            import('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'),
            import('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js')
        ]);
        
        const html2canvasModule = html2canvas.default || html2canvas;
        const jsPDFModule = jsPDF.default || jsPDF;
        
        // الحصول على العنصر
        const targetElement = typeof element === 'string' 
            ? document.getElementById(element) 
            : element;
        
        if (!targetElement) {
            throw new Error('العنصر المطلوب غير موجود');
        }
        
        // انتظار تحميل الصور
        await waitForImages(targetElement);
        
        // إضافة كلاس خاص للطباعة
        targetElement.classList.add('pdf-printing');
        
        // إنشاء صورة من العنصر
        const canvas = await html2canvasModule(targetElement, {
            scale: 2,
            useCORS: true,
            logging: false,
            windowWidth: targetElement.scrollWidth,
            windowHeight: targetElement.scrollHeight,
            backgroundColor: '#ffffff'
        });
        
        // إزالة كلاس الطباعة
        targetElement.classList.remove('pdf-printing');
        
        // إعدادات PDF
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDFModule({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });
        
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = pdfWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        let heightLeft = imgHeight;
        let position = 0;
        
        // إضافة الصفحة الأولى
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
        
        // إضافة صفحات إضافية
        while (heightLeft > 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pdfHeight;
        }
        
        // حفظ الملف
        pdf.save(filename);
        
        return true;
        
    } catch (error) {
        console.error('خطأ في إنشاء PDF:', error);
        throw error;
    }
}

/**
 * انتظار تحميل جميع الصور
 */
function waitForImages(element) {
    const images = Array.from(element.querySelectorAll('img'));
    const promises = images.map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
        });
    });
    return Promise.all(promises);
}

/**
 * طباعة عنصر مباشرة
 */
export async function printElement(element) {
    const targetElement = typeof element === 'string' 
        ? document.getElementById(element) 
        : element;
    
    if (!targetElement) {
        throw new Error('العنصر المطلوب غير موجود');
    }
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>طباعة</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { padding: 20px; font-family: Arial, sans-serif; }
                @media print {
                    body { padding: 0; }
                }
            </style>
        </head>
        <body>
            ${targetElement.outerHTML}
        </body>
        </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
}

// تصدير افتراضي للتوافق
export default {
    generatePDF,
    printElement
};
