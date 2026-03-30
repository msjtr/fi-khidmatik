export async function savePDF(element) {

const canvas = await html2canvas(element, {
    scale: 3,
    backgroundColor: "#fff"
});

const img = canvas.toDataURL("image/jpeg", 1);

const { jsPDF } = window.jspdf;
const pdf = new jsPDF();

pdf.addImage(img, 'JPEG', 0, 0, 210, 297);
pdf.save("invoice.pdf");

}
