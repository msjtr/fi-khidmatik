export function generateInvoiceQR(data) {
    // تعميد البيانات المطلوبة للباركود (ZATCA Standard)
    const qrText = `المورد: منصة في خدمتك | الضريبة: 312495447600003 | الإجمالي: ${data.total}`;
    
    new QRCode(document.getElementById("qrcode"), {
        text: qrText,
        width: 128,
        height: 128,
        colorDark : "#000000",
        colorLight : "#ffffff"
    });
}
