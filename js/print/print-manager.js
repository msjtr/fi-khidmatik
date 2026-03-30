import { generatePDF } from './pdf.service.js';
import { generateImage } from './image.service.js';
import { printInvoice } from './print.service.js';

export function handlePrint(type) {

    const el = document.getElementById('invoiceToPrint');

    if (!el) {
        alert('لا توجد فاتورة');
        return;
    }

    switch(type) {

        case 'pdf':
            return generatePDF(el);

        case 'image':
            return generateImage(el);

        case 'print':
            return printInvoice(el);

        default:
            console.warn('نوع غير معروف:', type);
    }
}
