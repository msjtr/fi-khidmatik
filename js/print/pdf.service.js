export async function generatePDF(element, order) {

    const target = document.getElementById('invoiceToPrint');

    window.scrollTo(0, 0);

    const canvas = await html2canvas(target, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        scrollY: -window.scrollY,
        windowWidth: target.scrollWidth,
        windowHeight: target.scrollHeight
    });

    const imgData = canvas.toDataURL("image/jpeg", 0.95);

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('p', 'mm', 'a4');

    const imgWidth = 210;
    const imgHeight = canvas.height * imgWidth / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    while (heightLeft > 0) {
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= 297;

        if (heightLeft > 0) {
            pdf.addPage();
            position -= 297;
        }
    }

    pdf.save(`invoice_${order?.orderNumber || 'file'}.pdf`);
}
