export async function generateImage(element, order) {

    const target = element;

    window.scrollTo(0, 0);

    const canvas = await html2canvas(target, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        scrollY: -window.scrollY,
        windowWidth: target.scrollWidth,
        windowHeight: target.scrollHeight
    });

    const data = canvas.toDataURL('image/jpeg', 0.95);

    const link = document.createElement('a');
    link.href = data;
    link.download = `invoice_${order?.orderNumber || 'file'}.jpg`;
    link.click();
}
