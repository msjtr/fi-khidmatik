import * as logic from './orders-logic.js';

let quill;

document.addEventListener('DOMContentLoaded', async () => {
    // تهيئة محرر الوصف
    if (document.getElementById('editor')) {
        quill = new Quill('#editor', {
            theme: 'snow',
            modules: { toolbar: [['bold', 'italic'], ['image'], [{ list: 'ordered' }, { list: 'bullet' }]] }
        });
    }
    await renderDashboard();
});

async function renderDashboard() {
    // تجهيز بيانات الطلب الجديد
    const meta = logic.generateOrderMeta();
    document.getElementById('orderNo').value = meta.orderNumber;
    document.getElementById('orderDate').value = meta.date;

    // عرض الطلبات السابقة في الجدول
    const orders = await logic.fetchAllOrders();
    const table = document.getElementById('ordersTableBody');
    if (table) {
        table.innerHTML = orders.map(o => `
            <tr class="border-b hover:bg-gray-50 text-sm">
                <td class="p-4 font-bold text-blue-600">${o.orderNo}</td>
                <td class="p-4">${o.customerName}</td>
                <td class="p-4 text-gray-500">${o.date}</td>
                <td class="p-4 font-bold text-green-700">${parseFloat(o.total).toFixed(2)} ر.س</td>
                <td class="p-4"><span class="bg-blue-50 text-blue-600 px-2 py-1 rounded text-[10px]">${o.status}</span></td>
                <td class="p-4 text-center">
                    <button class="text-gray-400 hover:text-blue-600 ml-2"><i class="fas fa-eye"></i></button>
                    <button class="text-gray-400 hover:text-green-600"><i class="fas fa-print"></i></button>
                </td>
            </tr>
        `).join('');
    }
}

// دالة حفظ الطلب الجديد
window.submitOrder = async () => {
    const orderData = {
        orderNumber: document.getElementById('orderNo').value,
        customerName: document.getElementById('cName').value,
        phone: document.getElementById('cPhone').value,
        orderDate: document.getElementById('orderDate').value,
        paymentMethodName: document.getElementById('payMethod').value,
        description: quill ? quill.root.innerHTML : '',
        total: parseFloat(document.getElementById('finalTotal').value || 0),
        status: "جديد"
    };

    // إذا تم اختيار "حفظ في المخزون"
    if (document.getElementById('saveToStock').checked) {
        await logic.saveData("products", {
            name: document.getElementById('pName').value,
            price: orderData.total,
            description: orderData.description
        });
    }

    await logic.saveData("orders", orderData);
    alert("تم حفظ الطلب بنجاح!");
    location.reload();
};
