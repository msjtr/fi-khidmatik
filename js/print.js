import { TERMS_DATA } from './terms.js';
import { generateAllQRs } from './zatca.js';

window.onload = async () => {
    const id = new URLSearchParams(window.location.search).get('id');
    if (!id) return;

    const order = await window.getDocument("orders", id);
    const customer = await window.getDocument("customers", order.customerId);
    
    const settings = window.invoiceSettings;
    const items = window.orderTools.processItems(order.items);
    
    let html = `
    <div class="page">
        <div class="header">
            <div class="logo"><img src="images/logo.svg"></div>
            <div class="doc-label">فاتورة ضريبية</div>
        </div>
        <div class="grid-2">
            <div class="card"><div class="card-h">من: ${settings.sellerName}</div><div class="card-b">${settings.address}</div></div>
            <div class="card"><div class="card-h">إلى: ${customer.name || 'عميل'}</div><div class="card-b">جوال: ${customer.phone || '---'}</div></div>
        </div>
        <table>
            <thead><tr><th>المنتج</th><th>الكمية</th><th>الإجمالي</th></tr></thead>
            <tbody>${items.map(i => `<tr><td>${i.name}</td><td>${i.qty}</td><td>${i.rowTotal} ر.س</td></tr>`).join('')}</tbody>
        </table>
        <div class="total-box">الإجمالي: ${order.total} ر.س</div>
        <div style="display:flex; justify-content:space-around; margin-top:auto;"><div id="zatca-qr"></div><div id="web-qr"></div></div>
    </div>`;

    const chunks = [TERMS_DATA.slice(0, 20), TERMS_DATA.slice(20, 40), TERMS_DATA.slice(40, 57)];
    chunks.forEach((chunk, i) => {
        html += `
        <div class="page">
            <div class="header"><h3>الشروط والأحكام (${i+1}/3)</h3></div>
            <div class="terms-section">${chunk.map(c => `<div class="clause"><span class="c-num">${c.id}.</span><b>${c.t}:</b> ${c.c}</div>`).join('')}</div>
            <div class="footer"><span>${settings.website}</span><span>صفحة ${i+2} من 4</span></div>
        </div>`;
    });

    document.getElementById('print-app').innerHTML = html;
    generateAllQRs(order.total, settings.sellerName, settings.taxNumber, settings.website);
    document.getElementById('loader').style.display = 'none';
};
