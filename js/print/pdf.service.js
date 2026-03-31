// pdf.service.js - خدمة تحويل الفاتورة إلى PDF بجودة عالية ودعم كامل للعربية

export async function generatePDF(element, order) {
  // تأكد من وجود العنصر
  if (!element) {
    console.error('العنصر المطلوب غير موجود');
    return;
  }

  // انتظار تحميل الصور والخطوط
  await new Promise(resolve => setTimeout(resolve, 200));

  // خيارات متقدمة لتحسين الجودة ودعم العربية
  const opt = {
    margin: [0.3, 0.3, 0.3, 0.3],  // هوامش مناسبة لمنع القص
    filename: generateFileName(order),
    image: { 
      type: 'jpeg', 
      quality: 0.98  // جودة عالية
    },
    html2canvas: { 
      scale: 3,                    // دقة عالية
      letterRendering: true,       // تحسين عرض الحروف العربية
      useCORS: true,               // دعم الصور الخارجية
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight
    },
    jsPDF: { 
      unit: 'in', 
      format: 'a4', 
      orientation: 'portrait'
    },
    pagebreak: { 
      mode: ['css', 'legacy'],     // منع كسر الصفحات داخل الفاتورة
      before: '.page-break-before',
      after: '.page-break-after',
      avoid: 'tr, .invoice-wrapper'
    }
  };

  try {
    // استخدام html2pdf مع الخيارات المحسنة
    const pdf = await html2pdf().set(opt).from(element).save();
    return pdf;
  } catch (error) {
    console.error('خطأ في إنشاء PDF:', error);
    throw new Error('فشل في إنشاء ملف PDF');
  }
}

// دالة مساعدة لتوليد اسم الملف مع دعم العربية
function generateFileName(order) {
  // الحصول على اسم العميل مع تنظيفه
  let customerName = 'عميل';
  if (order.customer) {
    if (typeof order.customer === 'object') {
      customerName = order.customer.name || order.customer.customerName || 'عميل';
    } else if (typeof order.customer === 'string') {
      customerName = order.customer;
    }
  }
  
  // تنظيف الاسم من الرموز غير المسموحة
  customerName = cleanFileName(customerName);
  
  // رقم الطلب
  const orderNumber = order.orderNumber || order.id || 'بدون_رقم';
  const cleanOrderNumber = cleanFileName(orderNumber);
  
  // التاريخ
  const orderDate = order.orderDate ? formatDateForFileName(order.orderDate) : getCurrentDateForFileName();
  
  // توليد اسم الملف
  const fileName = `فاتورة_${customerName}_${cleanOrderNumber}_${orderDate}.pdf`;
  
  return fileName;
}

// تنظيف اسم الملف من الرموز غير المسموحة
function cleanFileName(str) {
  if (!str) return '';
  // السماح فقط بالحروف العربية والإنجليزية والأرقام والشرطات والشرطات السفلية
  return str.replace(/[^a-zA-Z0-9\u0600-\u06FF\-_]/g, '_').substring(0, 50);
}

// تنسيق التاريخ لاسم الملف
function formatDateForFileName(dateString) {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return getCurrentDateForFileName();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch (e) {
    return getCurrentDateForFileName();
  }
}

// الحصول على التاريخ الحالي لاسم الملف
function getCurrentDateForFileName() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// دالة إضافية لتصدير PDF مع معاينة قبل الحفظ
export async function generatePDFWithPreview(element, order) {
  const opt = {
    margin: [0.3, 0.3, 0.3, 0.3],
    filename: generateFileName(order),
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 3, letterRendering: true, useCORS: true },
    jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
  };
  
  // فتح نافذة معاينة قبل الحفظ (اختياري)
  const worker = html2pdf().set(opt).from(element);
  await worker.save();
  return worker;
}
