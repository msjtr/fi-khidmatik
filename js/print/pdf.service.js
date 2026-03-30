function sanitizeFileName(text = '') {
    return text
        .toString()
        .trim()
        .replace(/[^\w\u0600-\u06FF]+/g, '_')
        .replace(/_+/g, '_');
}

export async function generatePDF(element, order) {

    // ⏳ انتظار ثبات التصميم
    await new Promise(resolve => setTimeout(resolve, 400));

    window.scrollTo(0, 0); // 🔥 مهم يمنع القص

    const canvas = await html2canvas(element, {
        scale: 2, // 🔥 أفضل توازن
        useCORS: true,
        backgroundColor: "#ffffff",
        scrollY: -window.scrollY
    });

    const imgData = canvas.toDataURL("image/jpeg", 0.95);

    const { jsPDF } = window.jspdf;

    const pdf = new jsPDF('p', 'mm', 'a4');

    const pageWidth = 210;
    const pageHeight = 297;

    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    // 🔥 تقسيم الصفحات
    while (heightLeft > 0) {
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        if (heightLeft > 0) {
            pdf.addPage();
            position -= pageHeight;
        }
    }

    // 🎯 اسم الملف
    const name = sanitizeFileName(order?.customer?.name || order?.customer || 'عميل');
    const number = sanitizeFileName(order?.orderNumber || '0000');
    const date = sanitizeFileName(order?.date || 'date');

    const fileName = `${name}_${number}_${date}.pdf`;

    pdf.save(fileName);
}
