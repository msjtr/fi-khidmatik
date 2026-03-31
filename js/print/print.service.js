// print.service.js - خدمة طباعة موثوقة مع دعم كامل للأنماط والمحتوى
export async function printInvoice(element) {
  if (!element) {
    console.error('❌ عنصر الفاتورة غير موجود');
    return;
  }

  // الحصول على كود HTML الكامل للعنصر مع الحفاظ على هيكله
  const invoiceHTML = element.outerHTML;
  
  // جمع جميع الأنماط المضمنة والخارجية من الصفحة
  let stylesHTML = '';
  const styleNodes = document.querySelectorAll('link[rel="stylesheet"], style');
  styleNodes.forEach(style => {
    if (style.tagName === 'LINK') {
      // تأكد من وجود href صالح
      if (style.href) {
        stylesHTML += `<link rel="stylesheet" href="${style.href}" media="print">\n`;
      }
    } else if (style.tagName === 'STYLE') {
      stylesHTML += `<style>${style.innerHTML}</style>\n`;
    }
  });

  // إضافة أنماط إضافية لضمان عدم القص وتحسين الطباعة
  const extraStyles = `
    <style>
      @media print {
        @page {
          size: A4;
          margin: 0.5cm;
        }
        body {
          margin: 0;
          padding: 0;
          background: white;
          direction: rtl;
        }
        .invoice-wrapper, .invoice-container, .invoice {
          margin: 0 auto;
          padding: 0.2in;
          max-width: 100%;
        }
        .invoice-table {
          width: 100%;
          border-collapse: collapse;
        }
        .invoice-table th, .invoice-table td {
          border: 1px solid #ccc;
          padding: 6px;
        }
        .buttons, .no-print {
          display: none !important;
        }
        * {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
      }
    </style>
  `;

  // إنشاء نافذة طباعة جديدة
  const printWindow = window.open('', '_blank', 'width=900,height=700,toolbar=yes,scrollbars=yes,resizable=yes');
  if (!printWindow) {
    alert('يرجى السماح بفتح النوافذ المنبثقة لتتمكن من الطباعة');
    return;
  }

  // كتابة المحتوى في النافذة الجديدة
  printWindow.document.write(`
    <!DOCTYPE html>
    <html dir="rtl">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>فاتورة</title>
      ${stylesHTML}
      ${extraStyles}
    </head>
    <body style="margin:0; padding:20px; background:white;">
      <div style="max-width:1100px; margin:0 auto;">
        ${invoiceHTML}
      </div>
      <script>
        // انتظار تحميل الصور والخطوط ثم الطباعة
        window.onload = function() {
          setTimeout(function() {
            window.print();
            window.onafterprint = function() {
              window.close();
            };
          }, 500);
        };
      <\/script>
    </body>
    </html>
  `);
  
  printWindow.document.close();
  printWindow.focus();
}
