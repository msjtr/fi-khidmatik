import * as logic from './orders-logic.js';

let quill;
let cartItems = [];

document.addEventListener('DOMContentLoaded', async () => {
    quill = new Quill('#editor', { theme: 'snow' });
    initApp();
});

async function initApp() {
    document.getElementById('orderNo').value = logic.generateOrderID();
    document.getElementById('orderDate').value = new Date().toISOString().split('T')[0];
    
    // جلب العملاء للقائمة
    const history = await logic.fetchFullData();
    renderOrdersTable(history);
}

// إضافة منتج للسلة البرمجية
window.addToCart = () => {
    const item = {
        name: document.getElementById('pName').value,
        price: parseFloat(document.getElementById('pPrice').value || 0),
        qty: parseInt(document.getElementById('pQty').value || 1),
        barcode: logic.generateBarcode(),
        desc: quill.root.innerHTML
    };
    
    if(!item.name || item.price <= 0) return alert("أدخل بيانات المنتج");
    
    cartItems.push(item);
    renderCart();
    calculateTotals();
};

function calculateTotals() {
    const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.qty), 0);
    const tax = subtotal * 0.15;
    const total = subtotal + tax;

    document.getElementById('subtotalLabel').innerText = subtotal.toFixed(2);
    document.getElementById('taxLabel').innerText = tax.toFixed(2);
    document.getElementById('totalLabel').innerText = total.toFixed(2);
}

window.submitOrder = async () => {
    const isNewCustomer = document.getElementById('newCustomerCheck').checked;
    const isNewProduct = document.getElementById('newProductCheck').checked;

    const orderData = {
        orderNumber: document.getElementById('orderNo').value,
        customerData: {
            name: document.getElementById('cName').value,
            phone: document.getElementById('cPhone').value,
            address: `${document.getElementById('cCity').value}, ${document.getElementById('cStreet').value}`
        },
        items: cartItems,
        paymentMethod: document.getElementById('payMethod').value,
        total: document.getElementById('totalLabel').innerText,
        status: "تم التنفيذ"
    };

    // حفظ العميل إذا كان جديداً
    if(isNewCustomer) await logic.saveData("customers", orderData.customerData);
    
    // حفظ المنتجات في المخزون إذا تم الاختيار
    if(isNewProduct) {
        for(let item of cartItems) {
            await logic.saveData("products", { ...item, stock: item.qty });
        }
    }

    const docRef = await logic.saveData("orders", orderData);
    alert("تم الحفظ! جاري فتح صفحة الطباعة...");
    window.location.href = `../../fi-khidmatik/js/order.js?id=${docRef.id}`;
};

function renderOrdersTable(data) {
    const tbody = document.getElementById('ordersTableBody');
    tbody.innerHTML = data.map(o => `
        <tr class="border-b hover:bg-gray-50 transition">
            <td class="p-4 font-bold text-blue-600">${o.orderNumber}</td>
            <td class="p-4 font-medium">${o.customerName}</td>
            <td class="p-4 text-gray-500">${o.date}</td>
            <td class="p-4 font-black">${o.total} ر.س</td>
            <td class="p-4">
                <button onclick="window.location.href='../../fi-khidmatik/js/order.js?id=${o.id}'" class="text-gray-400 hover:text-blue-600"><i class="fas fa-print"></i></button>
            </td>
        </tr>
    `).join('');
}
