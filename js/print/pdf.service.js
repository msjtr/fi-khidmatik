export async function generatePDF(element, order) {

    const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true
    });

    const imgData = canvas.toDataURL('image/png');

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('p', 'mm', 'a4');

    const pageWidth = 210;
    const pageHeight = 297;

    const imgWidth = pageWidth;
    const imgHeight = canvas.height * imgWidth / canvas.width;

    let y = 0;

    while (y < imgHeight) {
        pdf.addImage(imgData, 'PNG', 0, -y, imgWidth, imgHeight);
        y += pageHeight;

        if (y < imgHeight) {
            pdf.addPage();
        }
    }

    pdf.save(`invoice_${order?.orderNumber || 'file'}.pdf`);
}
