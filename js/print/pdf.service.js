// pdf.service.js
export async function generatePDF(element, order) {
  if (!element) {
    console.error('عنصر الفاتورة غير موجود');
    return;
  }

  // انتظار قصير لاستقرار المحتوى
  await new Promise(resolve => setTimeout(resolve, 200));

  // إعدادات متقدمة لضمان ظهور الفاتورة كاملة
  const opt = {
    margin: [0.3, 0.3, 0.3, 0.3],          // هوامش متساوية (بوصة)
    filename: generateFileName(order),       // اسم الملف مع دعم العربية
    image: { type: 'jpeg', quality: 0.98 }, // جودة عالية
    html2canvas: {
      scale: 3,                             // دقة عالية
      letterRendering: true,                // تحسين عرض الحروف
      useCORS: true,                        // للصور الخارجية
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: element.scrollWidth,     // عرض العنصر الأصلي
      windowHeight: element.scrollHeight    // ارتفاع العنصر الأصلي
    },
    jsPDF: {
      unit: 'in',                           // الوحدة: بوصة
      format: 'a4',                         // حجم الورق A4
      orientation: 'portrait'               // وضعية عمودية
    },
    pagebreak: {
      mode: ['css', 'legacy'],              // منع كسر الصفحات داخل الفاتورة
      before: '.page-break-before',
      after: '.page-break-after',
      avoid: 'tr, .invoice-wrapper, .invoice' // لا تقطع داخل هذه العناصر
    }
  };

  try {
    await html2pdf().set(opt).from(element).save();
  } catch (error) {
    console.error('خطأ في إنشاء PDF:', error);
    throw new Error('فشل في إنشاء ملف PDF');
  }
}

// دالة مساعدة لتوليد اسم الملف مع دعم العربية
function generateFileName(order) {
  const customerName = (order.customer?.name || 'عميل')
    .replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, '_')
    .substring(0, 30);
  const orderNum = (order.orderNumber || order.id || 'بدون_رقم')
    .replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, '_');
  const date = order.orderDate
    ? new Date(order.orderDate).toISOString().slice(0, 10)
    : new Date().toISOString().slice(0, 10);
  return `فاتورة_${customerName}_${orderNum}_${date}.pdf`;
}
