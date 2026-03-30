function sanitizeFileName(text = '') {
    return text
        .toString()
        .trim()
        .replace(/[^\w\u0600-\u06FF]+/g, '_')
        .replace(/_+/g, '_');
}

export async function generateImage(element, order) {

    // ⏳ انتظار استقرار التصميم
    await new Promise(resolve => setTimeout(resolve, 400));

    const canvas = await html2canvas(element, {
        scale: 2, // 🔥 أفضل توازن (جودة + أداء)
        useCORS: true,
        backgroundColor: "#ffffff",
        scrollY: -window.scrollY // 🔥 يمنع القص
    });

    // 🎯 بدون ضغط مفرط
    const data = canvas.toDataURL('image/jpeg', 0.95);

    // 🎯 اسم الملف
    const name = sanitizeFileName(order?.customer?.name || order?.customer || 'عميل');
    const number = sanitizeFileName(order?.orderNumber || '0000');
    const date = sanitizeFileName(order?.date || 'date');

    const fileName = `${name}_${number}_${date}.jpg`;

    const link = document.createElement('a');
    link.href = data;
    link.download = fileName;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
