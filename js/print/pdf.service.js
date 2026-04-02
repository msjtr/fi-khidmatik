```javascript
// js/print/pdf.service.js

export async function generatePDF(element, order) {
    if (!element) {
        throw new Error('عنصر الفاتورة غير موجود');
    }

    showLoadingMessage('جاري إنشاء ملف PDF...');

    try {
        // نسخ العنصر
        const originalElement = element.cloneNode(true);
        originalElement.style.padding = '20px';
        originalElement.style.backgroundColor = '#ffffff';
        originalElement.style.margin = '0 auto';
        originalElement.style.boxSizing = 'border-box';

        // عرض مناسب لـ A4
        originalElement.style.width = '794px';

        // تحويل الصور إلى Base64
        const images = originalElement.querySelectorAll('img');
        for (const img of images) {
            if (img.src) {
                try {
                    const base64 = await convertImageToBase64(img.src);
                    if (base64) img.src = base64;
                } catch (error) {
                    console.warn('فشل تحويل الصورة:', img.src);
                    img.src = getFallbackLogo();
                }
            }
        }

        // إنشاء container مؤقت
        const tempContainer = document.createElement('div');
        tempContainer.style.position = 'absolute';
        tempContainer.style.left = '-9999px';
        tempContainer.style.top = '0';
        tempContainer.style.width = '794px';
        tempContainer.style.backgroundColor = '#ffffff';
        tempContainer.appendChild(originalElement);
        document.body.appendChild(tempContainer);

        // انتظار تحميل الصور
        await waitForImages(tempContainer);

        // تحويل إلى canvas
        const canvas = await html2canvas(tempContainer, {
            scale: 2,
            backgroundColor: '#ffffff',
            useCORS: true,
            allowTaint: false,
            letterRendering: true
        });

        document.body.removeChild(tempContainer);

        const imgData = canvas.toDataURL('image/png');
        const { jsPDF } = window.jspdf;

        const pdf = new jsPDF({
            unit: 'mm',
            format: 'a4',
            orientation: 'portrait'
        });

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        const margin = 10;
        const imgWidth = pageWidth - (margin * 2);

        // 🔥 تقسيم الصفحات بشكل صحيح
        const pageHeightPx = (canvas.width * pageHeight) / pageWidth;
        let y = 0;
        let pageNumber = 1;

        while (y < canvas.height) {
            const pageCanvas = document.createElement('canvas');
            const ctx = pageCanvas.getContext('2d');

            pageCanvas.width = canvas.width;
            pageCanvas.height = Math.min(pageHeightPx, canvas.height - y);

            ctx.drawImage(
                canvas,
                0, y,
                canvas.width, pageCanvas.height,
                0, 0,
                canvas.width, pageCanvas.height
            );

            const pageData = pageCanvas.toDataURL('image/png');

            if (pageNumber > 1) pdf.addPage();

            const imgHeightMM = (pageCanvas.height * imgWidth) / canvas.width;

            pdf.addImage(pageData, 'PNG', margin, margin, imgWidth, imgHeightMM);

            y += pageHeightPx;
            pageNumber++;
        }

        // ترقيم الصفحات
        const totalPages = pdf.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            pdf.setPage(i);
            pdf.setFontSize(10);
            pdf.setTextColor(120);
            pdf.text(`صفحة ${i} من ${totalPages}`, pageWidth / 2, pageHeight - 5, { align: 'center' });
        }

        const fileName = `فاتورة_${order.orderNumber}_${new Date().toISOString().slice(0, 10)}.pdf`;
        pdf.save(fileName);

        hideLoadingMessage();
        showSuccessMessage('تم حفظ PDF بنجاح');

    } catch (error) {
        console.error(error);
        hideLoadingMessage();
        showErrorMessage('خطأ أثناء إنشاء PDF');
    }
}


// ================= أدوات مساعدة =================

async function convertImageToBase64(url) {
    return new Promise((resolve, reject) => {
        if (url.startsWith('data:')) return resolve(url);

        const img = new Image();
        img.crossOrigin = 'Anonymous';

        img.onload = () => {
            const canvas = document.createElement('canvas');
            const maxSize = 800;

            let width = img.width;
            let height = img.height;

            if (width > maxSize || height > maxSize) {
                const ratio = Math.min(maxSize / width, maxSize / height);
                width *= ratio;
                height *= ratio;
            }

            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            resolve(canvas.toDataURL('image/png'));
        };

        img.onerror = reject;
        img.src = url;
    });
}

function getFallbackLogo() {
    return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='45' fill='%233b82f6'/%3E%3Ctext x='50' y='70' text-anchor='middle' fill='white' font-size='40'%3Eف%3C/text%3E%3C/svg%3E";
}

async function waitForImages(container) {
    const images = container.querySelectorAll('img');

    await Promise.all(Array.from(images).map(img => {
        return new Promise(resolve => {
            if (img.complete) return resolve();
            img.onload = resolve;
            img.onerror = resolve;
        });
    }));
}

function showLoadingMessage(msg) {
    console.log(msg);
}

function hideLoadingMessage() {}

function showSuccessMessage(msg) {
    console.log(msg);
}

function showErrorMessage(msg) {
    console.error(msg);
}
```
