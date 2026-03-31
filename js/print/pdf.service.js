// pdf.service.js
export async function generatePDF(element, order) {
  // تحسين الجودة ودعم العربية
  const opt = {
    margin: [0.5, 0.5, 0.5, 0.5],
    filename: `فاتورة_${order.customer?.name || 'عميل'}_${order.orderNumber || order.id}_${order.orderDate || ''}.pdf`
      .replace(/[^a-zA-Z0-9\u0600-\u06FF\-_\.]/g, '_'),
    image: { type: 'jpeg', quality: 1.0 },
    html2canvas: { scale: 3, letterRendering: true, useCORS: true, logging: false },
    jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
  };
  await html2pdf().set(opt).from(element).save();
}
