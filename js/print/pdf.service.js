// pdf.service.js
// خدمة تحويل الفاتورة إلى PDF بجودة عالية ودعم اللغة العربية

export async function generatePDF(element, order) {
    // التحقق من وجود العنصر
    if (!element) {
        console.error('❌ عنصر الفاتورة غير موجود');
        return;
    }

    // تحضير اسم الملف بالعربية والإنجليزية معاً
    const customerName = order.customer?.name || 'عميل';
    const orderNumber = order.orderNumber || order.id || 'فاتورة';
    const orderDate = order.orderDate ? new Date(order.orderDate).toLocaleDateString('ar-SA').replace(/\//g, '-') : '';
    
    // اسم الملف: فاتورة_اسم العميل_رقم الطلب_التاريخ.pdf
    const fileName = `فاتورة_${customerName}_${orderNumber}_${orderDate}.pdf`
        .replace(/[\\/:*?"<>|]/g, '_')  // إزالة الأحرف غير المسموحة
        .replace(/\s+/g, '_');           // استبدال المسافات بشرطة سفلية

    // خيارات PDF المحسنة
    const opt = {
        margin: [0.5, 0.5, 0.5, 0.5],     // هوامش مناسبة (أعلى، يمين، أسفل، يسار)
        filename: fileName,
        image: { 
            type: 'jpeg', 
            quality: 1.0                  // جودة عالية جداً
        },
        html2canvas: { 
            scale: 3,                     // دقة عالية ×3
            letterRendering: true,        // تحسين عرض الحروف
            useCORS: true,                // دعم الصور من مصادر خارجية
            backgroundColor: '#ffffff',   // خلفية بيضاء
            logging: false,               // تعطيل سجلات التصحيح
            windowWidth: element.scrollWidth,   // عرض كامل
            windowHeight: element.scrollHeight  // ارتفاع كامل
        },
        jsPDF: { 
            unit: 'in',                   // وحدة القياس (بوصة)
            format: 'a4',                 // حجم الصفحة A4
            orientation: 'portrait'       // اتجاه عمودي
        },
        pagebreak: { 
            mode: ['css', 'legacy'],      // منع كسر الصفحات داخل العناصر المهمة
            before: '.page-break-before',
            after: '.page-break-after',
            avoid: ['.invoice-table', '.totals', '.contact']
        }
    };

    try {
        // إظهار مؤشر تحميل (اختياري)
        showLoading(true);
        
        // إنشاء PDF وحفظه
        await html2pdf().set(opt).from(element).save();
        
        console.log('✅ تم إنشاء PDF بنجاح:', fileName);
        
    } catch (error) {
        console.error('❌ خطأ في إنشاء PDF:', error);
        alert('حدث خطأ في إنشاء ملف PDF، يرجى المحاولة مرة أخرى');
        
    } finally {
        // إخفاء مؤشر التحميل
        showLoading(false);
    }
}

// دالة مساعدة لإظهار/إخفاء مؤشر التحميل
function showLoading(show) {
    let loadingOverlay = document.getElementById('pdfLoadingOverlay');
    
    if (show) {
        if (!loadingOverlay) {
            loadingOverlay = document.createElement('div');
            loadingOverlay.id = 'pdfLoadingOverlay';
            loadingOverlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
                direction: rtl;
            `;
            loadingOverlay.innerHTML = `
                <div style="background: white; padding: 2rem; border-radius: 1rem; text-align: center;">
                    <div style="width: 50px; height: 50px; border: 4px solid #f3f3f3; border-top: 4px solid #2563eb; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 1rem;"></div>
                    <p style="font-size: 1rem; color: #333;">جاري إنشاء ملف PDF...</p>
                    <p style="font-size: 0.85rem; color: #666; margin-top: 0.5rem;">يرجى الانتظار</p>
                </div>
                <style>
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                </style>
            `;
            document.body.appendChild(loadingOverlay);
        } else {
            loadingOverlay.style.display = 'flex';
        }
    } else {
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
        }
    }
}
