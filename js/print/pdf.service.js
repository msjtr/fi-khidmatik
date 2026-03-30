export async function generatePDF(element) {

    const win = window.open('', '_blank');
    const base = window.location.origin;

    win.document.open();

    win.document.write(`
    <html dir="rtl">
    <head>
        <meta charset="UTF-8">
        <title>فاتورة</title>

        <!-- CSS -->
        <link rel="stylesheet" href="${base}/css/design.css">
        <link rel="stylesheet" href="${base}/css/print.css">

        <style>
            body {
                margin: 0;
                padding: 20px;
                background: #fff;
                direction: rtl;
            }
        </style>
    </head>

    <body>
        ${element.outerHTML}
    </body>
    </html>
    `);

    win.document.close();

    // ⏳ ننتظر تحميل الصفحة + CSS فعلياً
    win.onload = () => {
        setTimeout(() => {
            win.focus();
            win.print();
            win.close();
        }, 300);
    };
}
