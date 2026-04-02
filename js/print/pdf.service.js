// js/print/pdf.service.js

export async function generatePDF(element, order) {
    if (!element) {
        throw new Error('عنصر الفاتورة غير موجود');
    }
    
    showLoadingMessage('جاري إنشاء ملف PDF...');
    
    try {
        // إنشاء نسخة من العنصر
        const originalElement = element.cloneNode(true);
        originalElement.style.padding = '20px';
        originalElement.style.backgroundColor = '#ffffff';
        // إزالة العرض الثابت للحفاظ على التنسيق الأصلي
        // originalElement.style.width = '800px'; // تم التعليق
        
        // تحويل جميع الصور إلى Base64 لضمان ظهورها في PDF
        const images = originalElement.querySelectorAll('img');
        for (const img of images) {
            if (img.src) {
                try {
                    // محاولة تحويل الصورة إلى Base64
                    const base64 = await convertImageToBase64(img.src);
                    if (base64) {
                        img.src = base64;
                    }
                } catch (error) {
                    console.warn('فشل تحويل الصورة إلى Base64:', img.src, error);
                    // في حالة فشل تحميل الشعار، استخدم الصورة الاحتياطية
                    if (img.src.includes('logo.svg') || img.src.includes('/images/')) {
                        const fallbackLogo = getFallbackLogo();
                        img.src = fallbackLogo;
                        img.style.width = '50px';
                        img.style.height = '50px';
                    }
                }
            }
        }
        
        const tempContainer = document.createElement('div');
        tempContainer.style.position = 'absolute';
        tempContainer.style.left = '-9999px';
        tempContainer.style.top = '0';
        tempContainer.appendChild(originalElement);
        document.body.appendChild(tempContainer);
        
        await waitForImages(tempContainer);
        
        const canvas = await html2canvas(tempContainer, {
            scale: 3,
            backgroundColor: '#ffffff',
            useCORS: true,
            allowTaint: false,
            logging: false,
            onclone: (clonedDoc, element) => {
                // إصلاح أي مشاكل في SVG في النسخة المستنسخة
                const clonedImages = element.querySelectorAll('img');
                clonedImages.forEach(img => {
                    if (img.src && img.src.includes('data:image/svg')) {
                        img.style.width = '50px';
                        img.style.height = '50px';
                    }
                });
            }
        });
        
        document.body.removeChild(tempContainer);
        
        const imgData = canvas.toDataURL('image/jpeg', 1.0);
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = pdfWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        let heightLeft = imgHeight;
        let position = 0;
        
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
        
        while (heightLeft > 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
            heightLeft -= pdfHeight;
        }
        
        const fileName = `فاتورة_${order.orderNumber}_${new Date().toISOString().slice(0, 10)}.pdf`;
        pdf.save(fileName);
        
        hideLoadingMessage();
        return true;
        
    } catch (error) {
        console.error('خطأ في PDF:', error);
        hideLoadingMessage();
        throw error;
    }
}

/**
 * تحويل الصورة إلى Base64
 */
async function convertImageToBase64(url) {
    return new Promise((resolve, reject) => {
        // إذا كانت الصورة بالفعل Base64
        if (url.startsWith('data:')) {
            resolve(url);
            return;
        }
        
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        
        img.onload = () => {
            try {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                const base64 = canvas.toDataURL('image/png');
                resolve(base64);
            } catch (error) {
                reject(error);
            }
        };
        
        img.onerror = () => {
            reject(new Error(`فشل تحميل الصورة: ${url}`));
        };
        
        img.src = url;
    });
}

/**
 * الحصول على صورة احتياطية (fallback) على شكل SVG
 */
function getFallbackLogo() {
    return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='45' fill='%233b82f6'/%3E%3Ctext x='50' y='70' text-anchor='middle' fill='white' font-size='40' font-weight='bold'%3Eف%3C/text%3E%3C/svg%3E";
}

/**
 * انتظار تحميل جميع الصور
 */
function waitForImages(container) {
    const images = container.querySelectorAll('img');
    const promises = Array.from(images).map(img => {
        if (img.complete && img.naturalWidth !== 0) return Promise.resolve();
        return new Promise((resolve) => {
            img.onload = () => resolve();
            img.onerror = () => resolve();
            if (img.complete) resolve();
        });
    });
    return Promise.all(promises);
}

/**
 * عرض رسالة التحميل
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
            background: rgba(0,0,0,0.9);
            color: white;
            padding: 20px 30px;
            border-radius: 12px;
            z-index: 10000;
            font-family: Arial, sans-serif;
            font-size: 16px;
            text-align: center;
            direction: rtl;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        `;
        document.body.appendChild(loadingDiv);
    }
    loadingDiv.innerHTML = `${message}<br><div style="margin-top:10px;">⏳ جاري المعالجة...</div>`;
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
