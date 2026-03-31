// pdf.service.js - نسخة محسنة بالكامل مع معالجة اقتصاص المحتوى
import { getBaseUrl } from './print.service.js';

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
    
    // حساب أبعاد صفحة A4 بالبكسل (عند دقة 300 DPI)
    const A4_WIDTH_MM = 210;
    const A4_HEIGHT_MM = 297;
    const DPI = 300;
    const PX_PER_MM = DPI / 25.4;
    
    const pdfWidth = A4_WIDTH_MM * PX_PER_MM;
    const pdfHeight = A4_HEIGHT_MM * PX_PER_MM;
    
    // حساب مقياس التحويل
    const scale = Math.min(pdfWidth / originalWidth, pdfHeight / originalHeight) * 0.95;
    
    // إنشاء canvas بجودة عالية
    const canvas = await html2canvas(cloneElement, {
      scale: Math.max(3, scale * 2),
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
    
    // حساب الإحداثيات لتوسيط المحتوى
    const imgWidth = A4_WIDTH_MM;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    // تحويل canvas إلى صورة
    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    
    // إضافة الصورة إلى PDF
    let heightLeft = imgHeight;
    let position = 0;
    
    // إضافة الصفحة الأولى
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
    heightLeft -= (A4_HEIGHT_MM - 10);
    
    // إضافة صفحات إضافية إذا كان المحتوى أطول من صفحة واحدة
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= (A4_HEIGHT_MM - 10);
    }
    
    // حفظ الملف
    const fileName = generateFileName(order, 'pdf');
    pdf.save(fileName);
    
    // إخفاء مؤشر التحميل
    hideLoadingOverlay();
    
  } catch (error) {
    console.error('❌ خطأ في إنشاء PDF:', error);
    hideLoadingOverlay();
    alert('حدث خطأ أثناء إنشاء ملف PDF. يرجى المحاولة مرة أخرى.');
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
  
  // إضافة أنماط مضمونة للجدول
  const tables = clone.querySelectorAll('.invoice-table');
  tables.forEach(table => {
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
  });
  
  const cells = clone.querySelectorAll('.invoice-table td, .invoice-table th');
  cells.forEach(cell => {
    cell.style.border = '1px solid #ddd';
    cell.style.padding = '8px';
    cell.style.textAlign = 'center';
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
      <div style="background: white; padding: 30px; border-radius: 15px; text-align: center;">
        <div style="width: 50px; height: 50px; border: 4px solid #f3f3f3; border-top: 4px solid #2563eb; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 15px;"></div>
        <p id="loading-message" style="font-size: 16px; color: #333;">${message}</p>
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
 * توليد اسم الملف
 */
function generateFileName(order, ext) {
  const customerName = (order.customer?.name || 'عميل')
    .replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, '_')
    .substring(0, 30);
  const orderNum = (order.orderNumber || order.id || 'بدون_رقم')
    .replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, '_');
  const date = order.orderDate
    ? new Date(order.orderDate).toISOString().slice(0, 10)
    : new Date().toISOString().slice(0, 10);
  return `فاتورة_${customerName}_${orderNum}_${date}.${ext}`;
}
