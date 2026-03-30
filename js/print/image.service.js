export async function generateImage(element, order) {

    const canvas = await html2canvas(element, { scale: 2 });

    let quality = 0.9;
    let data;

    do {
        data = canvas.toDataURL('image/jpeg', quality);
        quality -= 0.05;
    } while (data.length > 200000 && quality > 0.1);

    const fileName = `invoice_${order?.orderNumber || 'file'}.jpg`;

    const link = document.createElement('a');
    link.download = fileName;
    link.href = data;
    link.click();
}
