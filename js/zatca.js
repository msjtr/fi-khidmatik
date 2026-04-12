export function generateAllQRs(total, seller, vat, site) {
    new QRCode(document.getElementById("zatca-qr"), { text: `Seller:${seller}|VAT:${vat}|Total:${total}`, width: 100, height: 100 });
    new QRCode(document.getElementById("web-qr"), { text: site, width: 80, height: 80 });
}
