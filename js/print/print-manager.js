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

/* إنشاء عنصر مؤقت */
function createTempElement(order, cartRows, totals) {
    const container = document.createElement('div');

    container.innerHTML = buildInvoiceHTML(order, cartRows, totals);

    container.style.position = 'fixed';
    container.style.top = '-9999px';
    container.style.left = '-9999px';
    container.style.opacity = '0';
    container.style.pointerEvents = 'none';
    container.style.width = '794px';

    document.body.appendChild(container);

    return {
        container,
        element: container.firstElementChild
    };
}

/* تنظيف */
function cleanup(container) {
    if (container && container.parentNode) {
        container.parentNode.removeChild(container);
    }
}

/* تجهيز البيانات */
function prepareData(order) {

    if (!order.items || !Array.isArray(order.items)) {
        order.items = [];
    }

    const cartRows = order.items.map(item => {
        const name = escapeHtml(item.name || '-');

        let image = '<span>-</span>';
        if (item.image) {
            image = `<img src="${escapeHtml(item.image)}" style="width:40px;height:40px;object-fit:cover;">`;
        }

        return `
            <tr>
                <td>${name}</td>
                <td>${image}</td>
                <td>${escapeHtml(item.barcode || '-')}</td>
                <td>${item.quantity || 0}</td>
                <td>${(item.price || 0).toFixed(2)} ريال</td>
            </tr>
        `;
    }).join('');

    const subtotal = order.items.reduce((s, i) => s + (i.price || 0) * (i.quantity || 0), 0);

    let discount = order.discount || 0;

    if (order.discountType === 'percent') {
        discount = (subtotal * discount) / 100;
    }

    const after = subtotal - discount;
    const tax = after * 0.15;
    const total = after + tax;

    return {
        cartRows,
        totals: {
            subtotal: subtotal.toFixed(2) + ' ريال',
            discount: discount.toFixed(2) + ' ريال',
            tax: tax.toFixed(2) + ' ريال',
            total: total.toFixed(2) + ' ريال'
        }
    };
}

/* رسائل */
function showErrorToast(msg) {
    alert(msg);
}

/* ================= 🖨️ طباعة محلية ================= */
export async function printInvoiceHandler(order) {
    let temp;

    try {
        const { cartRows, totals } = prepareData(order);
        temp = createTempElement(order, cartRows, totals);

        await printInvoice(temp.element, "print");

    } catch (e) {
        console.error(e);
        showErrorToast('خطأ في الطباعة');
    } finally {
        cleanup(temp?.container);
    }
}

/* ================= 📄 PDF محلي ================= */
export async function exportAsPDF(order) {
    let temp;

    try {
        const { cartRows, totals } = prepareData(order);
        temp = createTempElement(order, cartRows, totals);

        await printInvoice(temp.element, "pdf");

    } catch (e) {
        console.error(e);
        showErrorToast('خطأ في PDF');
    } finally {
        cleanup(temp?.container);
    }
}

/* ================= 🖼️ صورة محلية ================= */
export async function exportAsImage(order) {
    let temp;

    try {
        const { cartRows, totals } = prepareData(order);
        temp = createTempElement(order, cartRows, totals);

        await printInvoice(temp.element, "png");

    } catch (e) {
        console.error(e);
        showErrorToast('خطأ في الصورة');
    } finally {
        cleanup(temp?.container);
    }
}

/* ================= 🌐 طباعة مركزية ================= */
export function centralPrint(orderId, type = "print") {
    try {
        const url = `print.html?id=${orderId}&auto=${type}`;
        window.open(url, "_blank");
    } catch (e) {
        console.error(e);
        alert('خطأ في الطباعة المركزية');
    }
}
