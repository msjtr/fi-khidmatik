import * as logic from './orders-logic.js';

let quill;
let cartItems = [];

document.addEventListener('DOMContentLoaded', async () => {
    // 1. تهيئة المحرر مع دعم اتجاه النص العربي
    quill = new Quill('#editor', { 
        theme: 'snow',
        placeholder: 'اكتب وصف المنتج هنا...',
        modules: { toolbar: [['bold', 'italic', 'underline'], [{ 'list': 'ordered'}, { 'list': 'bullet' }], ['clean']] }
    });
    
    initApp();
});

async function initApp() {
    // 2. تعبئة البيانات التلقائية
    document.getElementById('orderNo').value = logic.generateOrderID();
    document.getElementById('orderDate').value = new Date().toISOString().split('T')[0];
    
    // جلب البيانات وتحديث الجدول
    await refreshOrdersList();
}

async function refreshOrdersList() {
    const history = await logic.fetchFullData();
    renderOrdersTable(history);
}

// 3. إضافة منتج للسلة (تعديل: إضافة عرض السلة مرئياً)
window.addToCart = () => {
    const name = document.getElementById('pName').value;
    const price = parseFloat(document.getElementById('pPrice').value || 0);
    const qty = parseInt(document.getElementById('pQty').value || 1);

    if(!name || price <= 0) {
        alert("يرجى إدخال اسم المنتج وسعره بشكل صحيح");
        return;
    }

    const item = {
        name: name,
        price: price,
        qty: qty,
        barcode: logic.generateBarcode(),
        desc: quill.root.innerHTML // جلب محتوى المحرر
    };
    
    cartItems.push(item);
    renderCart(); // تأكد من وجود دالة تعرض المنتجات المضافة حالياً
    calculateTotals();
    
    // مسح الحقول بعد الإضافة لتسهيل إضافة منتج آخر
    document.getElementById('pName').value = '';
    document.getElementById('pPrice').value = '';
    document.getElementById('pQty').value = '1';
    quill.setContents([]);
};

// 4. عرض المنتجات المضافة في القائمة الصغيرة (قبل الحفظ)
function renderCart() {
    const cartContainer = document.getElementById('currentCartItems'); // تأكد من وجود هذا الـ ID في الـ HTML
    if (!cartContainer) return;

    cartContainer.innerHTML = cartItems.map((item, index) => `
        <div class="flex justify-between items-center bg-gray-50 p-3 rounded-xl mb-2 border border-gray-100">
            <div>
                <span class="font-bold text-gray-800">${item.name}</span>
                <span class="text-xs text-gray-400 mr-2">(${item.qty} × ${item.price})</span>
            </div>
            <button onclick="removeFromCart(${index})" class="text-red-400 hover:text-red-600">
                <i class="fas fa-times-circle"></i>
            </button>
        </div>
    `).join('');
}

window.removeFromCart = (index) => {
    cartItems.splice(index, 1);
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

// 5. حفظ الطلب (تعديل: إصلاح المسار وحالة التحميل)
window.submitOrder = async () => {
    if (cartItems.length === 0) return alert("السلة فارغة! أضف منتجاً واحداً على الأقل.");

    const btn = event.target;
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الحفظ...';

    const isNewCustomer = document.getElementById('newCustomerCheck').checked;
    const isNewProduct = document.getElementById('newProductCheck').checked;

    const orderData = {
        orderNumber: document.getElementById('orderNo').value,
        customerData: {
            name: document.getElementById('cName').value,
            phone: document.getElementById('cPhone').value,
            address: `${document.getElementById('cCity').value} - ${document.getElementById('cStreet').value}`
        },
        items: cartItems,
        paymentMethod: document.getElementById('payMethod').value,
        total: document.getElementById('totalLabel').innerText,
        status: "تم التنفيذ",
        createdAt: new Date().toISOString()
    };

    try {
        if(isNewCustomer) await logic.saveData("customers", orderData.customerData);
        
        if(isNewProduct) {
            for(let item of cartItems) {
                await logic.saveData("products", { ...item, stock: item.qty });
            }
        }

        const docRef = await logic.saveData("orders", orderData);
        
        // إصلاح المسار ليكون متوافقاً مع GitHub Pages
        // المسار المستهدف هو صفحة HTML وليس ملف JS مباشرة
        const printPath = `../order.html?id=${docRef.id}`; 
        
        alert("تم حفظ الطلب بنجاح!");
        window.location.href = printPath;

    } catch (error) {
        console.error("Save Error:", error);
        alert("حدث خطأ أثناء الحفظ");
        btn.disabled = false;
        btn.innerText = "اعتماد وحفظ";
    }
};

function renderOrdersTable(data) {
    const tbody = document.getElementById('ordersTableBody');
    if (!tbody) return;

    tbody.innerHTML = data.map(o => `
        <tr class="border-b hover:bg-gray-50 transition">
            <td class="p-4 font-bold text-blue-600">${o.orderNumber || '---'}</td>
            <td class="p-4 font-medium text-gray-700">${o.customerName}</td>
            <td class="p-4 text-gray-500">${o.date}</td>
            <td class="p-4 font-black text-slate-900">${o.total} ر.س</td>
            <td class="p-4">
                <button onclick="window.location.href='../order.html?id=${o.id}'" 
                        class="bg-blue-50 text-blue-600 p-2 rounded-lg hover:bg-blue-600 hover:text-white transition">
                    <i class="fas fa-print"></i>
                </button>
            </td>
        </tr>
    `).join('');
}
