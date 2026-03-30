function sanitizeFileName(text = '') {
    return text
        .toString()
        .trim()
        .replace(/[^\w\u0600-\u06FF]+/g, '_')
        .replace(/_+/g, '_');
}

export async function generatePDF(element, order) {

    // ⏳ ننتظر ثبات التصميم
    await new Promise(resolve => setTimeout(resolve, 300));

    const canvas = await html2canvas(element, {
        scale: 3,
        useCORS: true,
        backgroundColor: "#ffffff"
    });

    const img = canvas.toDataURL("image/jpeg", 1);

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();

    pdf.addImage(img, 'JPEG', 0, 0, 210, 297);

    // 🎯 اسم الملف الاحترافي
    const name = sanitizeFileName(order?.customer?.name || order?.customer || 'عميل');
    const number = sanitizeFileName(order?.orderNumber || '0000');
    const date = sanitizeFileName(order?.date || 'date');

    const fileName = `${name}_${number}_${date}.pdf`;

    pdf.save(fileName);
}
