export async function generatePDF(element, order) {

    const { jsPDF } = window.jspdf;

    const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
    });

    // 👇 نحسب المقاسات الصح
    const pageWidth = 210;
    const pageHeight = 297;

    const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        scrollY: -window.scrollY
    });

    const imgData = canvas.toDataURL('image/jpeg', 1.0);

    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    // 🔥 تقسيم احترافي بدون قص
    while (heightLeft > 0) {

        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);

        heightLeft -= pageHeight;

        if (heightLeft > 0) {
            pdf.addPage();
            position -= pageHeight;
        }
    }

    pdf.save(`invoice_${order?.orderNumber || 'file'}.pdf`);
}
