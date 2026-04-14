export const BarcodeManager = {
    init(orderId, seller, orderData) {
        const qrConfig = { width: 100, height: 100, colorDark: "#000000", colorLight: "#ffffff", correctLevel: QRCode.CorrectLevel.M };
        const invoiceURL = `${window.location.origin}${window.location.pathname}?id=${orderId}`;

        // 1. باركود الزكاة (ZATCA)
        if (document.getElementById("zatcaQR")) {
            const zatcaString = this.generateZatcaString(
                seller.name, seller.taxNumber, orderData.createdAt, 
                orderData.total, (orderData.total - orderData.subtotal)
            );
            new QRCode(document.getElementById("zatcaQR"), { ...qrConfig, text: zatcaString });
        }

        // 2. باركود الموقع
        if (document.getElementById("websiteQR")) {
            new QRCode(document.getElementById("websiteQR"), { ...qrConfig, text: seller.website || "https://linktr.ee/fikhidmatik" });
        }

        // 3. رابط تحميل الفاتورة
        if (document.getElementById("invoiceLink")) {
            document.getElementById("invoiceLink").href = invoiceURL;
            new QRCode(document.getElementById("downloadQR"), { ...qrConfig, text: invoiceURL });
        }
    },

    generateZatcaString(name, taxNo, date, total, tax) {
        const encode = (tag, val) => {
            const buf = new TextEncoder().encode(String(val));
            return String.fromCharCode(tag) + String.fromCharCode(buf.length) + String.fromCodePoint(...buf);
        };
        return btoa(encode(1, name) + encode(2, taxNo) + encode(3, date) + encode(4, total) + encode(5, tax));
    }
};
window.BarcodeManager = BarcodeManager;
