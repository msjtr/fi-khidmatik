// pdf.service.js - خدمة تحويل الفاتورة إلى PDF
import { jsPDF } from 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.es.min.js';

export async function generatePDF(element, order) {
  if (!element) {
    console.error('❌ عنصر الفاتورة غير موجود');
    return;
  }

  try {
    // إظهار مؤشر التحميل
    showLoading('جاري تحضير ملف PDF...');

    // انتظار استقرار المحتوى
    await new Promise(resolve => setTimeout(resolve, 300));

    // إنشاء نسخة من العنصر
    const clone = element.cloneNode(true);
    clone.style.position = 'absolute';
    clone.style.top = '-9999px';
    clone.style.left = '-9999px';
    clone.style.width = '800px';
    clone.style.padding = '20px';
    clone.style.backgroundColor = '#ffffff';
    document.body.appendChild(clone);

    // انتظار تحميل الصور
    await waitForImages(clone);
    await new Promise(resolve => setTimeout(resolve, 200));

    // إنشاء canvas
    const canvas = await html2canvas(clone, {
      scale: 2.5,
      backgroundColor: '#ffffff',
      logging: false,
      useCORS: true
    });

    // إزالة العنصر المؤقت
    clone.remove();

    // إنشاء PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const imgWidth = 190; // عرض الصورة بالـ mm (A4 عرض 210 - 20 هامش)
    const pageHeight = 277; // ارتفاع الصفحة بالـ mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    // إضافة الصفحة الأولى
    pdf.addImage(imgData, 'JPEG', 10, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // إضافة صفحات إضافية إذا لزم الأمر
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // حفظ الملف
    const fileName = `فاتورة_${order.orderNumber || order.id}_${new Date().toISOString().slice(0, 10)}.pdf`;
    pdf.save(fileName);

    hideLoading();

  } catch (error) {
    console.error('خطأ في PDF:', error);
    hideLoading();
    alert('حدث خطأ في إنشاء PDF');
  }
}

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

function showLoading(message) {
  let overlay = document.getElementById('pdf-loading');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'pdf-loading';
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
    `;
    overlay.innerHTML = `
      <div style="background: white; padding: 20px 40px; border-radius: 10px; text-align: center;">
        <div style="width: 40px; height: 40px; border: 3px solid #f3f3f3; border-top: 3px solid #2563eb; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 10px;"></div>
        <p>${message}</p>
        <style>@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}</style>
      </div>
    `;
    document.body.appendChild(overlay);
  } else {
    overlay.querySelector('p').innerText = message;
    overlay.style.display = 'flex';
  }
}

function hideLoading() {
  const overlay = document.getElementById('pdf-loading');
  if (overlay) overlay.style.display = 'none';
}
