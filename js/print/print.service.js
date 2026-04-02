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
        originalElement.style.width = '800px';
        
        // تحويل الصورة إلى Base64 لضمان ظهورها
        const images = originalElement.querySelectorAll('img');
        for (const img of images) {
            if (img.src && img.src.includes('logo.svg')) {
                try {
                    // تحميل الصورة وتحويلها إلى Base64
                    const response = await fetch(img.src);
                    const blob = await response.blob();
                    const base64 = await new Promise((resolve) => {
                        const reader = new FileReader();
                        reader.onloadend = () => resolve(reader.result);
                        reader.readAsDataURL(blob);
                    });
                    img.src = base64;
                } catch (error) {
                    console.warn('فشل تحويل الصورة إلى Base64:', error);
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
                // تأكد من أن الصور في النسخة المستنسخة
                const clonedImages = clonedDoc.querySelectorAll('img');
                clonedImages.forEach(img => {
                    if (img.src) {
                        img.crossOrigin = 'anonymous';
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
    loadingDiv.innerHTML = `${message}<br><div style="margin-top:10px;">⏳</div>`;
    loadingDiv.style.display = 'block';
}

function hideLoadingMessage() {
    const loadingDiv = document.getElementById('pdf-loading-message');
    if (loadingDiv) {
        loadingDiv.style.display = 'none';
    }
}
