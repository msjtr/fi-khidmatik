// image.service.js
export async function generateImage(element, order, config = {}) {
  if (!element) {
    throw new Error('عنصر الفاتورة غير موجود');
  }
  
  // التحقق من وجود المكتبة
  if (typeof html2canvas === 'undefined') {
    throw new Error('مكتبة html2canvas غير محملة');
  }
  
  const defaultConfig = {
    scale: 3,
    backgroundColor: '#ffffff',
    logging: false,
    useCORS: true
  };
  
  const finalConfig = { ...defaultConfig, ...config };
  
  const canvas = await html2canvas(element, finalConfig);
  
  const link = document.createElement('a');
  link.download = `فاتورة_${order.orderNumber || order.id || 'invoice'}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}
