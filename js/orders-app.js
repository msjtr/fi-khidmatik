import * as logic from './orders-logic.js';

let quill;

document.addEventListener('DOMContentLoaded', async () => {
    // تهيئة محرر الوصف
    if (document.getElementById('editor')) {
        quill = new Quill('#editor', {
            theme: 'snow',
            placeholder: 'اكتب وصف المنتج أو الخدمة هنا...',
            modules: { toolbar: [['bold', 'italic', 'underline'], ['image', 'link'], [{ list: 'ordered' }, { list: 'bullet' }]] }
        });
    }

    // تشغيل الصفحة
    await loadDashboardData();
});

// وظيفة جلب وعرض البيانات
async function loadDashboardData() {
    // 1. تعبئة بيانات الطلب الجديد تلقائياً
    const meta = logic.generateOrderMeta();
    document.getElementById('orderNo').value = meta.orderId;
    document.getElementById('orderDate').value = meta.date;
    document.getElementById('orderTime').value = meta.time;

    // 2. جلب وعرض الطلبات القديمة في الجدول
    const orders = await logic.fetchAllOrders();
    const tableBody = document.getElementById('ordersTableBody');
    if (tableBody) {
        tableBody.innerHTML = orders.map(order => `
            <tr class="border-b hover:bg-gray-50 transition">
                <td class="p-3 font-bold text-blue-600">${order.orderNo}</td>
                <td class="p-3">${order.customerName}</td>
                <td class="p-3 text-sm">${order.createdAt.toLocaleDateString('ar-SA')}</td>
                <td class="p-3 font-bold text-green-700">${order.total} ر.س</td>
                <td class="p-3"><span class="bg-blue-100 text-blue-700 px-2 py-1 rounded-md text-xs">${order.status}</span></td>
                <td class="p-3 text-center">
                    <button class="text-gray-400 hover:text-blue-600 ml-2"><i class="fas fa-eye"></i></button>
                    <button class="text-gray-400 hover:text-green-600"><i class="fas fa-print"></i></button>
                </td>
            </tr>
        `).join('');
    }

    // 3. تعبئة قائمة العملاء
    const customers = await logic.fetchCustomers();
    const select = document.getElementById('customerSelect');
    if (select) {
        select.innerHTML = '<option value="">-- اختر عميل من قاعدة البيانات --</option>';
        customers.forEach(c => {
            select.innerHTML += `<option value='${JSON.stringify(c)}'>${c.name}</option>`;
        });
    }
}

// تعبئة حقول العميل تلقائياً عند الاختيار
window.fillCustomer = (val) => {
    if (!val) return;
    const c = JSON.parse(val);
    document.getElementById('cName').value = c.name || '';
    document.getElementById('cPhone').value = c.phone || '';
    document.getElementById('cEmail').value = c.email || '';
    document.getElementById('cCity').value = c.city || '';
};

// حفظ الطلب
window.submitNewOrder = async () => {
    const data = {
        orderNo: document.getElementById('orderNo').value,
        customerName: document.getElementById('cName').value,
        total: document.getElementById('totalLabel').innerText,
        description: quill.root.innerHTML,
        status: 'جديد'
    };
    await logic.saveOrder(data);
    alert('تم حفظ الطلب بنجاح!');
    location.reload();
};
