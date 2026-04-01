// js/print/image.service.js

export async function generateImage(element, order) {
    if (!element) {
        throw new Error('عنصر الفاتورة غير موجود');
    }
    
    showLoadingMessage('جاري إنشاء الصورة...');
    
    try {
        // إنشاء نسخة مؤقتة
        const originalElement = element.cloneNode(true);
        originalElement.style.padding = '20px';
        originalElement.style.backgroundColor = '#ffffff';
        
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
            logging: false
        });
        
        document.body.removeChild(tempContainer);
        
        // تحميل الصورة
        const fileName = `فاتورة_${order.orderNumber}_${new Date().toISOString().slice(0, 10)}.png`;
        const link = document.createElement('a');
        link.download = fileName;
        link.href = canvas.toDataURL('image/png');
        link.click();
        
        hideLoadingMessage();
        return true;
        
    } catch (error) {
        console.error('خطأ في إنشاء الصورة:', error);
        hideLoadingMessage();
        throw error;
    }
}

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
        `;
        document.body.appendChild(loadingDiv);
    }
    loadingDiv.innerHTML = `${message}<br><div style="margin-top:10px;">🖼️</div>`;
    loadingDiv.style.display = 'block';
}

function hideLoadingMessage() {
    const loadingDiv = document.getElementById('image-loading-message');
    if (loadingDiv) {
        loadingDiv.style.display = 'none';
    }
}
