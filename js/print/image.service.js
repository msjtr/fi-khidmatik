// js/print/image.service.js

export async function generateImage(element, order) {
    if (!element) {
        throw new Error('عنصر الفاتورة غير موجود');
    }
    
    showLoadingMessage('جاري إنشاء الصورة...');
    
    try {
        // إنشاء نسخة من العنصر
        const originalElement = element.cloneNode(true);
        originalElement.style.padding = '20px';
        originalElement.style.backgroundColor = '#ffffff';
        originalElement.style.margin = '0 auto';
        originalElement.style.boxSizing = 'border-box';
        originalElement.style.width = '100%';
        originalElement.style.maxWidth = '1100px';
        
        // تحويل جميع الصور إلى Base64 لضمان ظهورها في الصورة
        const images = originalElement.querySelectorAll('img');
        for (const img of images) {
            if (img.src) {
                try {
                    const base64 = await convertImageToBase64(img.src);
                    if (base64) {
                        img.src = base64;
                    }
                } catch (error) {
                    console.warn('فشل تحويل الصورة إلى Base64:', img.src, error);
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
        tempContainer.style.width = '1100px'; // عرض ثابت للحفاظ على التنسيق
        tempContainer.style.backgroundColor = '#ffffff';
        tempContainer.appendChild(originalElement);
        document.body.appendChild(tempContainer);
        
        // انتظار تحميل جميع الصور
        await waitForImages(tempContainer);
        
        // انتظار إضافي لضمان اكتمال التحميل
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // حساب الأبعاد المناسبة
        const containerWidth = tempContainer.offsetWidth;
        const containerHeight = tempContainer.offsetHeight;
        
        const canvas = await html2canvas(tempContainer, {
            scale: 3, // دقة عالية للصورة
            backgroundColor: '#ffffff',
            useCORS: true,
            allowTaint: false,
            logging: false,
            windowWidth: containerWidth,
            windowHeight: containerHeight,
            onclone: (clonedDoc, element) => {
                const clonedImages = element.querySelectorAll('img');
                clonedImages.forEach(img => {
                    if (img.src && img.src.includes('data:image/svg')) {
                        img.style.width = '50px';
                        img.style.height = '50px';
                        img.style.display = 'block';
                    }
                });
            }
        });
        
        document.body.removeChild(tempContainer);
        
        // حفظ الصورة بدقة عالية
        const fileName = `فاتورة_${order.orderNumber}_${new Date().toISOString().slice(0, 10)}.png`;
        const link = document.createElement('a');
        link.download = fileName;
        
        // استخدام PNG عالي الجودة
        const imageData = canvas.toDataURL('image/png');
        link.href = imageData;
        link.click();
        
        hideLoadingMessage();
        showSuccessMessage('تم حفظ الصورة بنجاح');
        
        return true;
        
    } catch (error) {
        console.error('خطأ في الصورة:', error);
        hideLoadingMessage();
        showErrorMessage('حدث خطأ أثناء إنشاء الصورة');
        throw error;
    }
}

/**
 * تحويل الصورة إلى Base64 مع تحسين للصور الكبيرة
 */
async function convertImageToBase64(url) {
    return new Promise((resolve, reject) => {
        if (url.startsWith('data:')) {
            resolve(url);
            return;
        }
        
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        
        const timeout = setTimeout(() => {
            reject(new Error('انتهى وقت تحميل الصورة'));
        }, 10000);
        
        img.onload = () => {
            clearTimeout(timeout);
            try {
                // الحفاظ على جودة الصورة الأصلية
                let width = img.width;
                let height = img.height;
                
                // تقليل الحجم فقط إذا كانت الصورة كبيرة جداً (أكثر من 1000px)
                const maxSize = 1000;
                if (width > maxSize || height > maxSize) {
                    const ratio = Math.min(maxSize / width, maxSize / height);
                    width = Math.round(width * ratio);
                    height = Math.round(height * ratio);
                }
                
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                const base64 = canvas.toDataURL('image/png');
                resolve(base64);
            } catch (error) {
                reject(error);
            }
        };
        
        img.onerror = () => {
            clearTimeout(timeout);
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
 * انتظار تحميل جميع الصور بشكل صحيح مع مهلة زمنية
 */
async function waitForImages(container) {
    const images = container.querySelectorAll('img');
    const promises = Array.from(images).map(img => {
        return new Promise((resolve) => {
            if (img.complete && img.naturalWidth !== 0) {
                resolve();
                return;
            }
            
            const timeout = setTimeout(() => {
                console.warn('انتهاء وقت تحميل الصورة:', img.src);
                resolve();
            }, 8000);
            
            img.onload = () => {
                clearTimeout(timeout);
                resolve();
            };
            
            img.onerror = () => {
                clearTimeout(timeout);
                console.warn('فشل تحميل الصورة:', img.src);
                resolve();
            };
        });
    });
    
    await Promise.all(promises);
}

/**
 * عرض رسالة التحميل مع مؤشر متحرك
 */
function showLoadingMessage(message) {
    let loadingDiv = document.getElementById('image-loading-message');
    if (!loadingDiv) {
        loadingDiv = document.createElement('div');
        loadingDiv.id = 'image-loading-message';
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
            min-width: 250px;
        `;
        document.body.appendChild(loadingDiv);
    }
    
    // إضافة مؤشر تحميل متحرك
    loadingDiv.innerHTML = `${message}<br><div style="margin-top:15px;"><div class="image-spinner"></div></div>`;
    
    // إضافة أنماط الـ spinner إذا لم تكن موجودة
    if (!document.querySelector('#image-spinner-style')) {
        const style = document.createElement('style');
        style.id = 'image-spinner-style';
        style.textContent = `
            .image-spinner {
                width: 40px;
                height: 40px;
                border: 3px solid #f3f3f3;
                border-top: 3px solid #10b981;
                border-radius: 50%;
                animation: image-spin 0.8s linear infinite;
                margin: 0 auto;
            }
            @keyframes image-spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }
    
    loadingDiv.style.display = 'block';
}

/**
 * إخفاء رسالة التحميل
 */
function hideLoadingMessage() {
    const loadingDiv = document.getElementById('image-loading-message');
    if (loadingDiv) {
        loadingDiv.style.display = 'none';
    }
}

/**
 * عرض رسالة نجاح مؤقتة مع تأثير حركي
 */
function showSuccessMessage(message) {
    const successDiv = document.createElement('div');
    successDiv.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 14px 24px;
        border-radius: 12px;
        z-index: 10001;
        font-family: Arial, sans-serif;
        font-size: 14px;
        text-align: center;
        direction: rtl;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        animation: slideInRight 0.3s ease-out, fadeOut 0.3s ease-in 2.7s forwards;
        display: flex;
        align-items: center;
        gap: 10px;
    `;
    successDiv.innerHTML = `<span style="font-size: 18px;">✅</span> ${message}`;
    document.body.appendChild(successDiv);
    
    // إضافة أنماط الحركة إذا لم تكن موجودة
    if (!document.querySelector('#animation-style')) {
        const style = document.createElement('style');
        style.id = 'animation-style';
        style.textContent = `
            @keyframes slideInRight {
                from { opacity: 0; transform: translateX(50px); }
                to { opacity: 1; transform: translateX(0); }
            }
            @keyframes fadeOut {
                to { opacity: 0; visibility: hidden; }
            }
        `;
        document.head.appendChild(style);
    }
    
    setTimeout(() => {
        if (successDiv && successDiv.parentNode) {
            successDiv.remove();
        }
    }, 3000);
}

/**
 * عرض رسالة خطأ مؤقتة
 */
function showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #ef4444;
        color: white;
        padding: 14px 24px;
        border-radius: 12px;
        z-index: 10001;
        font-family: Arial, sans-serif;
        font-size: 14px;
        text-align: center;
        direction: rtl;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        animation: slideInRight 0.3s ease-out, fadeOut 0.3s ease-in 2.7s forwards;
        display: flex;
        align-items: center;
        gap: 10px;
    `;
    errorDiv.innerHTML = `<span style="font-size: 18px;">❌</span> ${message}`;
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        if (errorDiv && errorDiv.parentNode) {
            errorDiv.remove();
        }
    }, 3000);
}
