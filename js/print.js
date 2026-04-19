/**
 * js/print.js
 * دوال الطباعة
 */

export function printElement(elementId, title = 'طباعة') {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
        alert('الرجاء السماح بالنوافذ المنبثقة');
        return;
    }
    
    printWindow.document.write(`
        <!DOCTYPE html>
        <html dir="rtl">
        <head>
            <meta charset="UTF-8">
            <title>${title}</title>
            <style>
                body {
                    font-family: 'Tajawal', Arial, sans-serif;
                    padding: 20px;
                }
                @media print {
                    body { margin: 0; padding: 0; }
                }
            </style>
        </head>
        <body>
            ${element.innerHTML}
            <script>window.onload = () => window.print();</script>
        </body>
        </html>
    `);
    
    printWindow.document.close();
}

export function printInvoice(orderData) {
    const invoiceHtml = `
        <div class="invoice-container">
            <div style="text-align: center; border-bottom: 2px solid #e67e22; padding-bottom: 15px;">
                <h2>تيرا جيتواي</h2>
                <p>فاتورة رقم: ${orderData.orderNumber}</p>
            </div>
            <div style="margin: 20px 0;">
                <p><strong>العميل:</strong> ${orderData.customerName}</p>
                <p><strong>الجوال:</strong> ${orderData.phone}</p>
                <p><strong>التاريخ:</strong> ${new Date().toLocaleDateString('ar-SA')}</p>
            </div>
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: #f8f9fa;">
                        <th style="padding: 10px; text-align: right;">المنتج</th>
                        <th style="padding: 10px; text-align: center;">الكمية</th>
                        <th style="padding: 10px; text-align: center;">السعر</th>
                        <th style="padding: 10px; text-align: center;">الإجمالي</th>
                    </tr>
                </thead>
                <tbody>
                    ${orderData.items.map(item => `
                        <tr>
                            <td style="padding: 8px;">${item.name}</td>
                            <td style="padding: 8px; text-align: center;">${item.quantity}</td>
                            <td style="padding: 8px; text-align: center;">${item.price}</td>
                            <td style="padding: 8px; text-align: center;">${item.quantity * item.price}</td>
                        </tr>
                    `).join('')}
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="3" style="text-align: left;"><strong>المجموع:</strong></td>
                        <td style="text-align: center;">${orderData.total} ر.س</td>
                    </tr>
                </tfoot>
            </table>
            <div style="text-align: center; margin-top: 30px; font-size: 12px; color: #95a5a6;">
                شكراً لتعاملكم مع تيرا جيتواي
            </div>
        </div>
    `;
    
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html dir="rtl">
        <head>
            <meta charset="UTF-8">
            <title>فاتورة ${orderData.orderNumber}</title>
            <style>
                body { font-family: 'Tajawal', Arial, sans-serif; padding: 20px; }
                table { width: 100%; border-collapse: collapse; }
                th, td { border-bottom: 1px solid #ddd; }
            </style>
        </head>
        <body>${invoiceHtml}<script>window.onload = () => window.print();</script></body>
        </html>
    `);
    printWindow.document.close();
}
