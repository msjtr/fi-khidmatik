export function printInvoice(element) {

    const win = window.open('', '_blank');

    const base = window.location.origin;

    win.document.write(`
    <html dir="rtl">
    <head>
        <meta charset="UTF-8">
        <title>فاتورة</title>

        <link rel="stylesheet" href="${base}/css/design.css">
        <link rel="stylesheet" href="${base}/css/print.css">
    </head>

    <body style="direction: rtl; margin:0;">
        ${element.outerHTML}
    </body>
    </html>
    `);

    win.document.close();

    win.onload = () => {
        setTimeout(() => {
            win.focus();
            win.print();
            win.close();
        }, 300);
    };
}
