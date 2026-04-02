// js/print/print-manager.js

import { buildInvoiceHTML } from './template.js';
import { printInvoice } from './print.service.js';
import { generatePDF } from './pdf.service.js';
import { generateImage } from './image.service.js';

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function createTempElement(order, cartRows, totals) {
    const div = document.createElement('div');
    div.innerHTML = buildInvoiceHTML(order, cartRows, totals);
    div.style.position = 'fixed';
    div.style.top = '-9999px';
    div.style.left = '-9999px';
    div.style.opacity = '0';
    div.style.pointerEvents = 'none';
    document.body.appendChild(div);
    return div.firstElementChild;
}

function prepareData(order) {
    const cartRows = order.items.map(item => `
        <tr>
            <td style="padding: 12px 10px; border: 1px solid #e2e8f0; text-align: right;">${escapeHtml(item.name || '-')}</td>
            <td style="padding: 12px 10px; border: 1px solid #e2e8f0; text-align: center;">
                ${item.image ? `<img src="${item.image}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 8px;" onerror="this.style.display='none'">` : '<span style="color:#999;">-</span>'}
            </td>
            <td style="padding: 12px 10px; border: 1px solid #e2e8f0; text-align: center;">${escapeHtml(item.barcode || '-')}</td>
            <td style="padding: 12px 10px; border: 1px solid #e2e8f0; text-align: center;">${item.quantity || 0}</td>
            <td style="padding: 12px 10px; border: 1px solid #e2e8f0; text-align: left;">${(item.price || 0).toFixed(2)} ريال</td>
        </tr>
    `).join('');
    
    const subtotal = order.items.reduce((s, i) => s + (i.price || 0) * (i.quantity || 0), 0);
    const discount = order.discount || 0;
    let discountValue = discount;
    if (order.discountType === 'percent' && discount > 0) {
        discountValue = (subtotal * discount) / 100;
    }
    const afterDiscount = subtotal - discountValue;
    const tax = afterDiscount * 0.15;
    const total = afterDiscount + tax;
    
    const totals = {
        subtotal: subtotal.toFixed(2) + ' ريال',
        discount: discountValue.toFixed(2) + ' ريال',
        tax: tax.toFixed(2) + ' ريال',
        total: total.toFixed(2) + ' ريال'
    };
    
    return { cartRows, totals };
}

export async function printInvoiceHandler(order) {
    if (!order) {
        console.error('الطلب غير موجود');
        return;
    }
    try {
        const { cartRows, totals } = prepareData(order);
        const el = createTempElement(order, cartRows, totals);
        await printInvoice(el);
        el.parentElement?.remove();
    } catch (error) {
        console.error('خطأ في الطباعة:', error);
        alert('حدث خطأ أثناء الطباعة');
    }
}

export async function exportAsPDF(order) {
    if (!order) {
        console.error('الطلب غير موجود');
        return;
    }
    try {
        const { cartRows, totals } = prepareData(order);
        const el = createTempElement(order, cartRows, totals);
        await generatePDF(el, order);
        el.parentElement?.remove();
    } catch (error) {
        console.error('خطأ في تصدير PDF:', error);
        alert('حدث خطأ أثناء تصدير PDF');
    }
}

export async function exportAsImage(order) {
    if (!order) {
        console.error('الطلب غير موجود');
        return;
    }
    try {
        const { cartRows, totals } = prepareData(order);
        const el = createTempElement(order, cartRows, totals);
        await generateImage(el, order);
        el.parentElement?.remove();
    } catch (error) {
        console.error('خطأ في تصدير الصورة:', error);
        alert('حدث خطأ أثناء تصدير الصورة');
    }
}

export { escapeHtml };
