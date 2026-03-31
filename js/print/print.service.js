// طباعة الفاتورة مباشرة
function printInvoice(order) {
  const printWindow = window.open('', '_blank');
  const invoiceHTML = buildInvoiceHTML(order);
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>طباعة الفاتورة - ${order.id}</title>
        <link rel="stylesheet" href="../css/design.css">
        <link rel="stylesheet" href="../css/print.css" media="print">
      </head>
      <body>
        ${invoiceHTML}
        <script>
          window.onload = () => {
            window.print();
            window.onafterprint = () => window.close();
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}
