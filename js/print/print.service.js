// print-manager.js - مدير الطباعة الموحد
import { buildInvoiceHTML } from './template.js';
import { printInvoice, exportAsPDF, exportAsImage } from './print.service.js';
import { generatePDF } from './pdf.service.js';
import { generateImage } from './image.service.js';

/**
 * إنشاء عنصر مؤقت للفاتورة
 */
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

/**
 * تجهيز بيانات الفاتورة
 */
function prepareData(order) {
  const cartRows = order.items.map(item => `
    <tr>
      <td>${escapeHtml(item.name || '-')}</td>
      <td>${escapeHtml(item.barcode || '-')}</td>
      <td>${escapeHtml(item.description || '-')}</td>
      <td>${item.quantity || 0}</td>
      <td>${(item.price || 0).toFixed(2)}</td>
      <td>0</td>
      <td>${((item.price || 0) * (item.quantity || 0)).toFixed(2)}</td>
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

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * طباعة الفاتورة
 */
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

/**
 * تصدير الفاتورة كـ PDF
 */
export async function exportAsPDFHandler(order) {
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

/**
 * تصدير الفاتورة كصورة
 */
export async function exportAsImageHandler(order) {
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

// تصدير الدوال الرئيسية
export { printInvoiceHandler as printInvoice };
export { exportAsPDFHandler as exportAsPDF };
export { exportAsImageHandler as exportAsImage };
