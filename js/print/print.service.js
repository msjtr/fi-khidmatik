// pdf.service.js - نسخة مستقلة بدون استيراد من print.service.js

export async function generatePDF(element, order) {
  if (!element) {
    console.error('❌ عنصر الفاتورة غير موجود');
    return;
  }

  // إظهار مؤشر التحميل
  showLoadingOverlay('جاري تحضير ملف PDF...');

  try {
    // انتظار استقرار المحتوى
    await new Promise(resolve => setTimeout(resolve, 300));

    // إنشاء نسخة من العنصر للعمل عليها
    const cloneElement = await prepareCloneElement(element, order);
    
    // إضافة العنصر إلى الصفحة مؤقتاً
    document.body.appendChild(cloneElement);
    
    // انتظار تحميل الصور والخطوط
    await waitForImages(cloneElement);
    await new Promise(resolve => setTimeout(resolve, 500));

    // حساب الأبعاد الحقيقية للعنصر
    const originalWidth = cloneElement.scrollWidth;
    const originalHeight = cloneElement.scrollHeight;
    
    // التأكد من وجود أبعاد صالحة
    if (originalWidth === 0 || originalHeight === 0) {
      throw new Error('لا يمكن حساب أبعاد الفاتورة');
    }
    
    // حساب المقياس المناسب للحصول على جودة عالية
    let scale = 3;
    if (originalWidth > 1200) scale = 2.5;
    if (originalWidth > 2000) scale = 2;
    
    // إنشاء canvas بجودة عالية
    const canvas = await html2canvas(cloneElement, {
      scale: scale,
      backgroundColor: '#ffffff',
      logging: false,
      useCORS: true,
      allowTaint: false,
      windowWidth: originalWidth,
      windowHeight: originalHeight,
      onclone: (clonedDoc, element) => {
        // التأكد من تطبيق جميع الأنماط
        const clonedInvoice = clonedDoc.querySelector('.invoice-wrapper, .invoice');
        if (clonedInvoice) {
          clonedInvoice.style.margin = '0';
          clonedInvoice.style.padding = '20px';
        }
      }
    });
    
    // إزالة العنصر المؤقت
    cloneElement.remove();
    
    // إنشاء PDF باستخدام jsPDF
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // حساب الأبعاد لتناسب صفحة A4
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    // حساب نسبة العرض والارتفاع
    const imgWidth = pageWidth - 20; // هامش 10mm من كل جهة
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    // تحويل canvas إلى صورة
    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    
    // إذا كان المحتوى أطول من صفحة واحدة
    if (imgHeight > pageHeight - 20) {
      // حساب عدد الصفحات المطلوبة
      let heightLeft = imgHeight;
      let position = 0;
      let pageNum = 1;
      
      // إضافة الصفحة الأولى
      pdf.addImage(imgData, 'JPEG', 10, position, imgWidth, imgHeight);
      heightLeft -= (pageHeight - 20);
      position -= (pageHeight - 20);
      
      // إضافة صفحات إضافية
      while (heightLeft > 0) {
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 10, position, imgWidth, imgHeight);
        heightLeft -= (pageHeight - 20);
        position -= (pageHeight - 20);
        pageNum++;
      }
    } else {
      // صفحة واحدة فقط
      const yPosition = (pageHeight - imgHeight) / 2;
      pdf.addImage(imgData, 'JPEG', 10, yPosition, imgWidth, imgHeight);
    }
    
    // حفظ الملف
    const fileName = generateFileName(order, 'pdf');
    pdf.save(fileName);
    
    // إخفاء مؤشر التحميل
    hideLoadingOverlay();
    
  } catch (error) {
    console.error('❌ خطأ في إنشاء PDF:', error);
    hideLoadingOverlay();
    alert('حدث خطأ أثناء إنشاء ملف PDF: ' + error.message);
    throw error;
  }
}

/**
 * تحضير نسخة من العنصر للطباعة
 */
async function prepareCloneElement(element, order) {
  const clone = element.cloneNode(true);
  
  // إضافة أنماط إضافية لضمان عدم الاقتصاص
  clone.style.position = 'absolute';
  clone.style.top = '-9999px';
  clone.style.left = '-9999px';
  clone.style.width = 'auto';
  clone.style.minWidth = '800px';
  clone.style.maxWidth = '1100px';
  clone.style.margin = '0';
  clone.style.padding = '20px';
  clone.style.backgroundColor = '#ffffff';
  clone.style.direction = 'rtl';
  clone.style.fontFamily = "'Segoe UI', Tahoma, Arial, sans-serif";
  
  // إضافة أنماط مضمونة للجدول
  const tables = clone.querySelectorAll('.invoice-table');
  tables.forEach(table => {
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    table.style.marginBottom = '20px';
  });
  
  const headers = clone.querySelectorAll('.invoice-table th');
  headers.forEach(header => {
    header.style.border = '1px solid #ddd';
    header.style.padding = '10px 8px';
    header.style.textAlign = 'center';
    header.style.backgroundColor = '#f0f0f0';
    header.style.fontWeight = 'bold';
  });
  
  const cells = clone.querySelectorAll('.invoice-table td');
  cells.forEach(cell => {
    cell.style.border = '1px solid #ddd';
    cell.style.padding = '8px 4px';
    cell.style.textAlign = 'center';
  });
  
  // إضافة أنماط للإجماليات
  const totals = clone.querySelectorAll('.totals');
  totals.forEach(total => {
    total.style.backgroundColor = '#f8f8f8';
    total.style.padding = '10px 15px';
    total.style.borderRadius = '8px';
    total.style.width = '280px';
    total.style.marginRight = 'auto';
    total.style.marginLeft = '0';
  });
  
  return clone;
}

/**
 * انتظار تحميل جميع الصور داخل العنصر
 */
async function waitForImages(element) {
  const images = element.querySelectorAll('img');
  const promises = Array.from(images).map(img => {
    if (img.complete) return Promise.resolve();
    return new Promise(resolve => {
      img.onload = resolve;
      img.onerror = resolve;
    });
  });
  await Promise.all(promises);
}

/**
 * عرض مؤشر التحميل
 */
function showLoadingOverlay(message = 'جاري التحميل...') {
  let overlay = document.getElementById('pdf-loading-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'pdf-loading-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.7);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 99999;
      direction: rtl;
    `;
    overlay.innerHTML = `
      <div style="background: white; padding: 30px; border-radius: 15px; text-align: center; min-width: 250px;">
        <div style="width: 50px; height: 50px; border: 4px solid #f3f3f3; border-top: 4px solid #2563eb; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 15px;"></div>
        <p id="loading-message" style="font-size: 16px; color: #333; margin: 0;">${message}</p>
        <style>
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
      </div>
    `;
    document.body.appendChild(overlay);
  } else {
    const msgEl = overlay.querySelector('#loading-message');
    if (msgEl) msgEl.innerText = message;
    overlay.style.display = 'flex';
  }
}

/**
 * إخفاء مؤشر التحميل
 */
function hideLoadingOverlay() {
  const overlay = document.getElementById('pdf-loading-overlay');
  if (overlay) {
    overlay.style.display = 'none';
  }
}

/**
 * توليد اسم الملف مع دعم العربية
 */
function generateFileName(order, ext) {
  let customerName = 'عميل';
  if (order.customer) {
    if (typeof order.customer === 'object') {
      customerName = order.customer.name || order.customer.customerName || 'عميل';
    } else if (typeof order.customer === 'string') {
      customerName = order.customer;
    }
  }
  
  // تنظيف الاسم من الرموز غير المسموحة مع الحفاظ على العربية
  customerName = customerName.replace(/[^a-zA-Z0-9\u0600-\u06FF\-_]/g, '_').substring(0, 30);
  
  const orderNum = (order.orderNumber || order.id || 'بدون_رقم')
    .replace(/[^a-zA-Z0-9\u0600-\u06FF\-_]/g, '_');
  
  let date = '';
  try {
    if (order.orderDate) {
      const d = new Date(order.orderDate);
      if (!isNaN(d.getTime())) {
        date = d.toISOString().slice(0, 10);
      }
    }
    if (!date) {
      date = new Date().toISOString().slice(0, 10);
    }
  } catch (e) {
    date = new Date().toISOString().slice(0, 10);
  }
  
  return `فاتورة_${customerName}_${orderNum}_${date}.${ext}`;
}
