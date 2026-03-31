// js/print/print.service.js

export async function printInvoice(element) {
  if (!element) {
    console.error('❌ عنصر الفاتورة غير موجود');
    return;
  }

  // الحصول على HTML العنصر
  const invoiceHTML = element.outerHTML;

  // جمع جميع أنماط CSS المستخدمة في الصفحة (لضمان تطابق التنسيق)
  let stylesHTML = '';
  const styleNodes = document.querySelectorAll('link[rel="stylesheet"], style');
  styleNodes.forEach(style => {
    if (style.tagName === 'LINK' && style.href) {
      stylesHTML += `<link rel="stylesheet" href="${style.href}" media="print">\n`;
    } else if (style.tagName === 'STYLE') {
      stylesHTML += `<style>${style.innerHTML}</style>\n`;
    }
  });

  // أنماط إضافية للطباعة (لضمان عدم اقتصاص المحتوى)
  const extraStyles = `
    <style>
      @media print {
        @page { size: A4; margin: 0.5cm; }
        body {
          margin: 0;
          padding: 0.2in;
          background: white;
          direction: rtl;
        }
        .invoice-wrapper, .invoice-container, .invoice {
          margin: 0 auto;
          padding: 0;
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

  // فتح نافذة جديدة للطباعة
  const printWindow = window.open('', '_blank', 'width=900,height=700,toolbar=yes,scrollbars=yes,resizable=yes');
  if (!printWindow) {
    alert('⚠️ يرجى السماح بفتح النوافذ المنبثقة لتتمكن من الطباعة');
    return;
  }

  // كتابة المحتوى في النافذة
  printWindow.document.write(`
    <!DOCTYPE html>
    <html dir="rtl">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>طباعة الفاتورة</title>
      ${stylesHTML}
      ${extraStyles}
    </head>
    <body>
      <div style="max-width: 1100px; margin: 0 auto; background: white;">
        ${invoiceHTML}
      </div>
      <script>
        window.onload = () => {
          setTimeout(() => {
            window.focus();
            window.print();
            window.onafterprint = () => window.close();
          }, 500);
        };
      <\/script>
    </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();
}
