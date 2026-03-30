import { savePDF } from './pdf.service.js';
import { saveImage } from './image.service.js';
import { printHTML } from './print.service.js';

export function handlePrint(type) {

const el = document.getElementById('invoiceToPrint');

if (!el) return alert('لا توجد فاتورة');

switch(type) {

case 'pdf':
    return savePDF(el);

case 'image':
    return saveImage(el);

case 'print':
    return printHTML(el);

}

}
