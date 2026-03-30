export async function printInvoice(element) {

    const win = window.open('', '_blank');

    const base = window.location.origin;

    win.document.write(`
    <html dir="rtl">
    <head>
        <meta charset="UTF-8">

        <!-- ربط CSS بشكل صحيح -->
        <link rel="stylesheet" href="${base}/css/design.css">
        <link rel="stylesheet" href="${base}/css/print.css">

        <title>فاتورة</title>

        <style>
            body {
                margin: 0;
                padding: 20px;
                background: #fff;
            }
        </style>
    </head>

    <body>
        ${element.outerHTML}
    </body>
    </html>
    `);

    win.document.close();

    // ⏳ انتظار تحميل التصميم قبل الطباعة
    setTimeout(() => {
        win.focus();
        win.print();
        win.close();
    }, 700);
}
