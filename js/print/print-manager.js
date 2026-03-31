import { generatePDF } from './pdf.service.js';
import { generateImage } from './image.service.js';
import { printInvoice } from './print.service.js';

export function handlePrint(type, order) {

    const el = document.querySelector('.invoice');

    if (!el) {
        alert('لا توجد فاتورة');
        return;
    }

    switch(type) {

        case 'pdf':
            return generatePDF(el, order);

        case 'image':
            return generateImage(el, order);

        case 'print':
            return printInvoice(el);

        default:
            console.warn('نوع غير معروف:', type);
    }
}
