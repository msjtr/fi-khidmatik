export async function generatePDF(element, order) {

    const { jsPDF } = window.jspdf;

    const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
    });

    const pageWidth = 210;
    const pageHeight = 297;

    const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff"
    });

    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    const imgData = canvas.toDataURL('image/jpeg', 1.0);

    let y = 0;

    // 🔥 تقسيم فعلي
    while (y < imgHeight) {

        pdf.addImage(
            imgData,
            'JPEG',
            0,
            -y,
            imgWidth,
            imgHeight
        );

        y += pageHeight;

        if (y < imgHeight) {
            pdf.addPage();
        }
    }

    pdf.save(`invoice_${order?.orderNumber || 'file'}.pdf`);
}
