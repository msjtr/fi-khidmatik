export function printInvoice(element) {

    const win = window.open('', '_blank');

    win.document.write(`
    <html dir="rtl">
    <head>
        <meta charset="UTF-8">
        <title>فاتورة</title>

        <link rel="stylesheet" href="/css/design.css">
        <link rel="stylesheet" href="/css/print.css">
    </head>

    <body>
        ${element.outerHTML}
    </body>
    </html>
    `);

    win.document.close();

    win.onload = () => {
        win.focus();
        win.print();
        win.close();
    };
}
