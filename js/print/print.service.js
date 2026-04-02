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
            
            // جمع جميع الأنماط من الصفحة الرئيسية
            const styles = document.querySelectorAll('style, link[rel="stylesheet"]');
            let stylesHTML = '';
            styles.forEach(style => {
                if (style.tagName === 'STYLE') {
                    stylesHTML += `<style>${style.innerHTML}</style>`;
                } else if (style.tagName === 'LINK' && style.href) {
                    let href = style.href;
                    if (!href.startsWith('http') && !href.startsWith('//')) {
                        href = window.location.origin + (href.startsWith('/') ? href : '/' + href);
                    }
                    stylesHTML += `<link rel="stylesheet" href="${href}">`;
                }
            });
            
            // أنماط إضافية محسنة للطباعة - ضمان عدم قص المحتوى
            const additionalStyles = `
                <style>
                    /* إعدادات الصفحة للطباعة */
                    @page {
                        size: A4;
                        margin: 1.5cm;
                    }
                    
                    /* تنسيق عام */
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    
                    body {
                        direction: rtl;
                        padding: 0;
                        margin: 0;
                        background: white;
                        font-family: 'Segoe UI', Tahoma, Arial, sans-serif;
                    }
                    
                    /* حاوية الفاتورة */
                    .invoice-container {
                        max-width: 1100px;
                        margin: 0 auto;
                        background: white;
                        padding: 20px;
                        page-break-inside: avoid;
                    }
                    
                    /* تنسيق الشعار */
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
                        display: block;
                    }
                    
                    /* بطاقات المعلومات */
                    .info-card {
                        background: #f8fafc;
                        border-radius: 12px;
                        padding: 18px;
                        page-break-inside: avoid;
                        break-inside: avoid;
                    }
                    
                    /* جدول المنتجات */
                    .products-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-bottom: 25px;
                        font-size: 13px;
                    }
                    .products-table th {
                        background: #1e3a8a;
                        color: white;
                        padding: 12px 10px;
                        border: 1px solid #2e4a9a;
                    }
                    .products-table td {
                        padding: 10px 8px;
                        border: 1px solid #e2e8f0;
                    }
                    .products-table tr {
                        page-break-inside: avoid;
                        break-inside: avoid;
                    }
                    
                    /* مربع الإجماليات */
                    .totals-box {
                        background: #f8fafc;
                        padding: 20px;
                        border-radius: 12px;
                        margin-bottom: 25px;
                        page-break-inside: avoid;
                        break-inside: avoid;
                    }
                    
                    /* ختم وتوقيع */
                    .stamp-box {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 25px;
                        padding: 20px;
                        background: linear-gradient(135deg, #fef9e3, #fff8e7);
                        border-radius: 12px;
                        border-right: 4px solid #f59e0b;
                        page-break-inside: avoid;
                        break-inside: avoid;
                    }
                    
                    /* شريط التواصل */
                    .contact-bar {
                        background: #f1f5f9;
                        padding: 15px 20px;
                        border-radius: 12px;
                        display: flex;
                        justify-content: center;
                        gap: 40px;
                        flex-wrap: wrap;
                        margin-bottom: 20px;
                        page-break-inside: avoid;
                        break-inside: avoid;
                    }
                    
                    /* الفوتر */
                    .footer-note {
                        text-align: center;
                        padding-top: 20px;
                        border-top: 2px solid #e2e8f0;
                        page-break-inside: avoid;
                        break-inside: avoid;
                    }
                    
                    /* إخفاء أزرار الطباعة */
                    .buttons, .no-print, button, .no-print * {
                        display: none !important;
                    }
                    
                    /* إعدادات الطباعة */
                    @media print {
                        body {
                            padding: 0;
                            margin: 0;
                            background: white;
                        }
                        .invoice-container {
                            margin: 0;
                            padding: 0;
                            box-shadow: none;
                        }
                        .logo-circle {
                            print-color-adjust: exact;
                            -webkit-print-color-adjust: exact;
                        }
                        .logo-circle img {
                            print-color-adjust: exact;
                            -webkit-print-color-adjust: exact;
                        }
                        .products-table th {
                            background: #1e3a8a !important;
                            -webkit-print-color-adjust: exact;
                            print-color-adjust: exact;
                        }
                        .stamp-box {
                            -webkit-print-color-adjust: exact;
                            print-color-adjust: exact;
                        }
                        .contact-bar {
                            -webkit-print-color-adjust: exact;
                            print-color-adjust: exact;
                        }
                        .info-card {
                            -webkit-print-color-adjust: exact;
                            print-color-adjust: exact;
                        }
                        /* منع انكسار الصفحات داخل العناصر المهمة */
                        .info-card, .stamp-box, .totals-box, .products-table tr {
                            page-break-inside: avoid;
                            break-inside: avoid;
                        }
                    }
                </style>
            `;
            
            // الحصول على HTML الفاتورة مع إصلاح المسارات
            let invoiceHTML = element.outerHTML;
            
            // إصلاح مسارات الصور النسبية لتصبح مطلقة
            invoiceHTML = invoiceHTML.replace(/src="\/([^"]+)"/g, (match, path) => {
                return `src="${window.location.origin}/${path}"`;
            });
            
            // إصلاح مسارات CSS النسبية
            invoiceHTML = invoiceHTML.replace(/url\(['"]?\/([^'"\)]+)['"]?\)/g, (match, path) => {
                return `url("${window.location.origin}/${path}")`;
            });
            
            printWindow.document.write(`
                <!DOCTYPE html>
                <html dir="rtl">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>فاتورة ${element.querySelector('.invoice-number span')?.innerText || 'طباعة'}</title>
                    <base href="${window.location.origin}/">
                    ${stylesHTML}
                    ${additionalStyles}
                    <style>
                        /* أنماط إضافية لضمان ظهور الشعار */
                        .logo-circle img {
                            width: 50px !important;
                            height: 50px !important;
                            object-fit: contain !important;
                        }
                        /* ضمان عرض الجدول بشكل كامل */
                        .products-table {
                            width: 100% !important;
                            min-width: 600px !important;
                        }
                        /* ضمان عدم اقتصاص المحتوى */
                        body, .invoice-container {
                            overflow: visible !important;
                        }
                    </style>
                </head>
                <body>
                    ${invoiceHTML}
                    <div class="no-print" style="text-align: center; margin-top: 20px; display: flex !important; justify-content: center; gap: 15px;">
                        <button onclick="window.print()" style="padding: 12px 30px; margin: 5px; cursor: pointer; background: #3b82f6; color: white; border: none; border-radius: 8px; font-size: 16px; display: inline-block;">🖨️ طباعة</button>
                        <button onclick="window.close()" style="padding: 12px 30px; margin: 5px; cursor: pointer; background: #ef4444; color: white; border: none; border-radius: 8px; font-size: 16px; display: inline-block;">❌ إغلاق</button>
                    </div>
                    <script>
                        // إخفاء أزرار الطباعة عند الطباعة الفعلية
                        window.onbeforeprint = function() {
                            const btns = document.querySelectorAll('.no-print');
                            btns.forEach(btn => btn.style.display = 'none');
                        };
                        window.onafterprint = function() {
                            const btns = document.querySelectorAll('.no-print');
                            btns.forEach(btn => btn.style.display = 'flex');
                        };
                    </script>
                </body>
                </html>
            `);
            
            printWindow.document.close();
            
            // انتظار تحميل جميع الموارد
            printWindow.onload = () => {
                setTimeout(() => {
                    printWindow.focus();
                    // إظهار معاينة الطباعة تلقائياً
                    printWindow.print();
                    resolve(true);
                }, 1000);
            };
            
            // معالجة الأخطاء
            printWindow.onerror = (error) => {
                console.error('خطأ في نافذة الطباعة:', error);
                reject(new Error('حدث خطأ أثناء تحميل نافذة الطباعة'));
            };
            
        } catch (error) {
            console.error('خطأ في الطباعة:', error);
            reject(error);
        }
    });
}
