// js/print/print.service.js

export async function printInvoice(element) {
  if (!element) {
    console.error('❌ عنصر الفاتورة غير موجود');
    return;
  }

  const invoiceHTML = element.outerHTML;

  let stylesHTML = '';// js/print/print.service.js
import { generatePDF, printElement } from './pdf.service.js';

class PrintService {
    constructor() {
        this.printContainer = null;
        this.init();
    }
    
    init() {
        // إنشاء حاوية الطباعة إذا لم تكن موجودة
        if (!document.getElementById('print-container')) {
            this.printContainer = document.createElement('div');
            this.printContainer.id = 'print-container';
            this.printContainer.style.position = 'absolute';
            this.printContainer.style.left = '-9999px';
            this.printContainer.style.top = '-9999px';
            document.body.appendChild(this.printContainer);
        } else {
            this.printContainer = document.getElementById('print-container');
        }
    }
    
    /**
     * طباعة فاتورة
     */
    async printInvoice(invoiceHTML, filename = 'invoice.pdf') {
        try {
            // تنظيف الحاوية
            this.printContainer.innerHTML = '';
            
            // إضافة المحتوى
            this.printContainer.innerHTML = invoiceHTML;
            
            // انتظار قليلاً للتأكد من تحميل المحتوى
            await this.delay(100);
            
            // إنشاء PDF
            await generatePDF(this.printContainer, filename);
            
            // تنظيف
            this.printContainer.innerHTML = '';
            
            return true;
        } catch (error) {
            console.error('خطأ في طباعة الفاتورة:', error);
            throw error;
        }
    }
    
    /**
     * طباعة مباشرة
     */
    async directPrint(element) {
        return await printElement(element);
    }
    
    /**
     * تأخير بسيط
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// إنشاء نسخة واحدة من الخدمة
const printService = new PrintService();

// تصدير الخدمة والدوال
export default printService;
export { generatePDF, printElement };
  const styleNodes = document.querySelectorAll('link[rel="stylesheet"], style');
  styleNodes.forEach(style => {
    if (style.tagName === 'LINK' && style.href) {
      stylesHTML += `<link rel="stylesheet" href="${style.href}" media="print">\n`;
    } else if (style.tagName === 'STYLE') {
      stylesHTML += `<style>${style.innerHTML}</style>\n`;
    }
  });

  const extraStyles = `
    <style>
      @media print {
        @page { size: A4; margin: 0.5cm; }
        body { margin:0; padding:20px; background:white; direction:rtl; }
        .invoice-wrapper, .invoice-container, .invoice { margin:0 auto; padding:0; max-width:100%; }
        .invoice-table { width:100%; border-collapse:collapse; }
        .invoice-table th, .invoice-table td { border:1px solid #ccc; padding:6px; }
        .buttons, .no-print { display:none !important; }
        * { -webkit-print-color-adjust:exact; print-color-adjust:exact; }
      }
    </style>
  `;

  const printWindow = window.open('', '_blank', 'width=900,height=700,toolbar=yes,scrollbars=yes,resizable=yes');
  if (!printWindow) {
    alert('يرجى السماح بفتح النوافذ المنبثقة');
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html dir="rtl">
    <head><meta charset="UTF-8"><title>فاتورة</title>${stylesHTML}${extraStyles}</head>
    <body style="margin:0; padding:20px; background:white;">
      <div style="max-width:1100px; margin:0 auto;">${invoiceHTML}</div>
      <script>
        window.onload = () => { setTimeout(() => { window.print(); window.onafterprint = () => window.close(); }, 500); };
      <\/script>
    </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
}

// لا تحتاج لهذا السطر المكرر:
// export { printInvoice };
