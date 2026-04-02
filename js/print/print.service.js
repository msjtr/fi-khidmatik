// js/print/print.service.js

export async function printInvoice(element) {
    if (!element) {
        throw new Error('عنصر الفاتورة غير موجود');
    }
    
    return new Promise((resolve, reject) => {
        try {
            const printWindow = window.open('', '_blank');
            if (!printWindow) {
                throw new Error('لا يمكن فتح نافذة الطباعة');
            }
            
            const styles = document.querySelectorAll('style, link[rel="stylesheet"]');
            let stylesHTML = '';
            styles.forEach(style => {
                if (style.tagName === 'STYLE') {
                    stylesHTML += `<style>${style.innerHTML}</style>`;
                } else if (style.tagName === 'LINK') {
                    stylesHTML += `<link rel="stylesheet" href="${style.href}">`;
                }
            });
            
            const additionalStyles = `
                <style>
                    .logo-circle {
                        width: 80px;
                        height: 80px;
                        background: linear-gradient(135deg, #1e3a8a, #3b82f6);
                        border-radius: 50%;
                        margin: 0 auto 12px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        box-shadow: 0 4px 15px rgba(0,0,0,0.15);
                        overflow: hidden;
                    }
                    .logo-circle img {
                        width: 50px;
                        height: 50px;
                        object-fit: contain;
                    }
                    @media print {
                        .logo-circle {
                            print-color-adjust: exact;
                            -webkit-print-color-adjust: exact;
                        }
                    }
                    .buttons, .no-print {
                        display: none !important;
                    }
                    body {
                        padding: 20px;
                        margin: 0;
                        font-family: 'Segoe UI', Tahoma, Arial, sans-serif;
                    }
                    @media print {
                        body {
                            padding: 0;
                        }
                    }
                </style>
            `;
            
            printWindow.document.write(`
                <!DOCTYPE html>
                <html dir="rtl">
                <head>
                    <meta charset="UTF-8">
                    <title>طباعة فاتورة</title>
                    ${stylesHTML}
                    ${additionalStyles}
                </head>
                <body>
                    ${element.outerHTML}
                    <div class="no-print" style="text-align: center; margin-top: 20px;">
                        <button onclick="window.print()" style="padding: 10px 20px; margin: 5px; cursor: pointer;">🖨️ طباعة</button>
                        <button onclick="window.close()" style="padding: 10px 20px; margin: 5px; cursor: pointer;">❌ إغلاق</button>
                    </div>
                </body>
                </html>
            `);
            
            printWindow.document.close();
            
            printWindow.onload = () => {
                setTimeout(() => {
                    printWindow.focus();
                    printWindow.print();
                    resolve(true);
                }, 500);
            };
            
        } catch (error) {
            console.error('خطأ في الطباعة:', error);
            reject(error);
        }
    });
}
