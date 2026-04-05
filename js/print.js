import { getOrder, loadCustomersAndProducts, customersMap, productsMap } from './firebase.js';
import { generateZATCA } from './zatca.js';

const params = new URLSearchParams(window.location.search);
const orderId = params.get('id');

async function init() {

    await loadCustomersAndProducts();
    const order = await getOrder(orderId);

    const customer = customersMap.get(order.customerId);

    document.getElementById('invoiceNumber').innerText = order.id;
    document.getElementById('date').innerText = order.orderDate;
    document.getElementById('status').innerText = order.status;

    document.getElementById('customerName').innerText = customer.name;
    document.getElementById('customerPhone').innerText = customer.phone;
    document.getElementById('customerEmail').innerText = customer.email;

    let subtotal = 0;

    const table = document.getElementById('itemsTable');

    order.items.forEach((item, i) => {

        const product = productsMap.get(item.productId);

        const row = `
        <tr>
            <td>${i + 1}</td>
            <td>${product.name}</td>
            <td>${product.description || ''}</td>
            <td><img src="${product.image}" width="60"/></td>
            <td>${item.quantity}</td>
            <td>${item.price}</td>
        </tr>
        `;

        subtotal += item.price * item.quantity;
        table.innerHTML += row;
    });

    const vat = subtotal * 0.15;
    const total = subtotal + vat;

    document.getElementById('subtotal').innerText = subtotal.toFixed(2);
    document.getElementById('vat').innerText = vat.toFixed(2);
    document.getElementById('total').innerText = total.toFixed(2);

    // QR
    generateZATCA({
        seller: "في خدمتك",
        vat: "312495447600003",
        total,
        vatAmount: vat
    });

}

init();
