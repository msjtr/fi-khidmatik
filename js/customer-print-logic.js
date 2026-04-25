import { fetchCustomerById } from './modules/customers-core.js';

export async function initPrint() {
    const id = new URLSearchParams(window.location.search).get('id');
    if (!id) return;

    const c = await fetchCustomerById(id);
    if (c) {
        document.getElementById('p-name').innerText = c.name;
        document.getElementById('p-email').innerText = c.Email || 'غير متوفر';
        document.getElementById('p-phone').innerText = c.Phone;
        document.getElementById('p-address').innerHTML = `
            ${c.country} - ${c.city} - ${c.district}<br>
            شارع: ${c.street} | مبنى: ${c.buildingNo} | إضافي: ${c.additionalNo}<br>
            رمز بريدي: ${c.postalCode} | ص.ب: ${c.poBox}
        `;
        document.getElementById('p-notes').innerText = c.notes || 'لا يوجد ملاحظات';
        document.getElementById('p-date').innerText = new Date(c.CreatedAt.toDate()).toLocaleDateString('ar-SA');
        
        setTimeout(() => window.print(), 800);
    }
}
