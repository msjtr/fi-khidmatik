// print-manager.js
import { buildInvoiceHTML } from './template.js';
import { printInvoice } from './print.service.js';
import { generatePDF } from './pdf.service.js';
import { generateImage } from './image.service.js';

// دالة لبناء عنصر الفاتورة مؤقتاً
function createInvoiceElement(order, cartRows, totals) {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = buildInvoiceHTML(order, cartRows, totals);
  wrapper.style.position = 'fixed';
  wrapper.style.top = '-9999px';
  wrapper.style.left = '-9999px';
  wrapper.style.opacity = '0';
  wrapper.style.pointerEvents = 'none';
  document.body.appendChild(wrapper);
  return wrapper.firstElementChild;
}

// دالة لاستخراج صفوف المنتجات والإجماليات من الطلب
function prepareInvoiceData(order) {
  const cartRows = order.items.map(item => `
    <tr>
      <td>${escapeHtml(item.name || '-')}</td>
      <td>${escapeHtml(item.barcode || '-')}</td>
      <td>${escapeHtml(item.description || '-')}</td>
      <td>${item.quantity}</td>
      <td>${Number(item.price).toFixed(2)}</td>
      <td>0</td>
      <td>${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('');

  const subtotal = order.items.reduce((s, i) => s + (i.price * i.quantity), 0);
  const discount = order.discount || 0;
  const afterDiscount = subtotal - discount;
  const tax = afterDiscount * 0.15;
  const total = afterDiscount + tax;

  const totals = {
    subtotal: subtotal.toFixed(2) + ' ريال',
    discount: discount.toFixed(2) + ' ريال',
    tax: tax.toFixed(2) + ' ريال',
    total: total.toFixed(2) + ' ريال'
  };
  return { cartRows, totals };
}

// دالة مساعدة لتأمين النصوص
function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>]/g, function(m) {
    if (m === '&') return '&amp;';
    if (m === '<') return '&lt;';
    if (m === '>') return '&gt;';
    return m;
  });
}

// الدوال الرئيسية
export async function printInvoiceHandler(order) {
  const { cartRows, totals } = prepareInvoiceData(order);
  const el = createInvoiceElement(order, cartRows, totals);
  await printInvoice(el);
  el.parentElement.remove();
}

export async function exportAsPDF(order) {
  const { cartRows, totals } = prepareInvoiceData(order);
  const el = createInvoiceElement(order, cartRows, totals);
  await generatePDF(el, order);
  el.parentElement.remove();
}

export async function exportAsImage(order) {
  const { cartRows, totals } = prepareInvoiceData(order);
  const el = createInvoiceElement(order, cartRows, totals);
  await generateImage(el, order);
  el.parentElement.remove();
}
