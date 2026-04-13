import * as logic from './orders-logic.js';

let quill;
let currentItems = [];

document.addEventListener('DOMContentLoaded', async () => {
    // تهيئة محرر الوورد
    quill = new Quill('#editor', { theme: 'snow', placeholder: 'وصف المنتج التفصيلي...' });
    
    await initPage();
});

async function initPage() {
    // توليد البيانات التلقائية
    document.getElementById('orderNo').value = logic.generateOrderNumber();
    document.getElementById('orderDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('orderTime').value = new Date().toLocaleTimeString('en-GB', {hour:'2-digit', minute:'2-digit'});

    // تحميل العملاء والمنتجات للقوائم
    const customers = await logic.fetchHistory(); // تبسيط للجلب
    const productsSnap = await getDocs(collection(db, "products"));
    
    // تعبئة قائمة العملاء
    const cSelect = document.getElementById('customerSelect');
    customers.forEach(c => {
        if(c.customerId) cSelect.innerHTML += `<option value='${JSON.stringify(c)}'>${c.customerName}</option>`;
    });

    renderTable();
}

// حسابات الفاتورة تلقائياً
window.calculateInvoice = () => {
    const subtotal = currentItems.reduce((s, i) => s + (i.price * i.qty), 0);
    const discount = parseFloat(document.getElementById('discountInput').value || 0);
    const tax = (subtotal - discount) * 0.15;
    const total = (subtotal - discount) + tax;

    document.getElementById('subtotalLabel').innerText = subtotal.toFixed(2);
    document.getElementById('taxLabel').innerText = tax.toFixed(2);
    document.getElementById('totalLabel').innerText = total.toFixed(2);
};

// إضافة منتج للجدول
window.addItemToOrder = () => {
    const item = {
        name: document.getElementById('pName').value,
        price: parseFloat(document.getElementById('pPrice').value),
        qty: parseInt(document.getElementById('pQty').value),
        description: quill.root.innerHTML
    };
    currentItems.push(item);
    renderOrderItems();
    calculateInvoice();
};

// الطباعة والربط مع المسار المطلوب
window.printOrder = (orderId) => {
    window.location.href = `../../fi-khidmatik/js/order.js?id=${orderId}`;
};

// حفظ الطلب الكامل
window.saveFullOrder = async () => {
    const orderData = {
        orderNumber: document.getElementById('orderNo').value,
        customerId: document.getElementById('customerSelect').value ? JSON.parse(document.getElementById('customerSelect').value).id : null,
        customerData: {
            name: document.getElementById('cName').value,
            phone: document.getElementById('cPhone').value,
            address: document.getElementById('cAddress').value
        },
        items: currentItems,
        subtotal: document.getElementById('subtotalLabel').innerText,
        tax: document.getElementById('taxLabel').innerText,
        total: document.getElementById('totalLabel').innerText,
        status: "جديد"
    };

    await logic.saveDoc("orders", orderData);
    alert("تم حفظ الطلب بنجاح!");
    location.reload();
};
