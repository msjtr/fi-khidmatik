import * as logic from './orders-logic.js';

let cartItems = [];
let quill; // محرر النصوص

document.addEventListener('DOMContentLoaded', async () => {
    // تهيئة محرر Quill للوصف
    if (document.getElementById('editor')) {
        quill = new Quill('#editor', {
            theme: 'snow',
            placeholder: 'وصف المنتج أو الخدمة...',
            modules: { toolbar: [['bold', 'italic'], [{ 'list': 'ordered'}, { 'list': 'bullet' }]] }
        });
    }
    
    initApp();
});

async function initApp() {
    // توليد البيانات الأساسية
    const orderNoField = document.getElementById('orderNo');
    if (orderNoField) orderNoField.value = logic.generateOrderID();
    
    const now = new Date();
    const dateField = document.getElementById('orderDate');
    if (dateField) dateField.value = now.toISOString().split('T')[0];
    
    // حفظ الوقت بصيغة 24 ساعة لضمان الدقة في الفاتورة
    window.currentOrderTime = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    
    const history = await logic.fetchFullData();
    renderOrdersTable(history);
}

// إضافة منتج للسلة مع (اللقطة: الاسم، السعر، الوصف، الصورة)
window.addToCart = () => {
    const name = document.getElementById('pName').value;
    const price = parseFloat(document.getElementById('pPrice').value || 0);
    const qty = parseInt(document.getElementById('pQty').value || 1);
    const imgUrl = document.getElementById('pImgUrl')?.value || ""; // حقل رابط الصورة

    if(!name || price <= 0) return alert("يرجى إكمال بيانات المنتج الأساسية");

    cartItems.push({
        name: name,
        price: price,
        qty: qty,
        desc: quill ? quill.root.innerHTML : "", // لقطة الوصف
        image: imgUrl, // لقطة الصورة
        sku: logic.generateSKU(),
        total: (price * qty)
    });
    
    // تفريغ الحقول بعد الإضافة
    document.getElementById('pName').value = "";
    document.getElementById('pPrice').value = "";
    if (quill) quill.setContents([]);
    
    renderCart();
    calculateTotals();
};

function renderCart() {
    const container = document.getElementById('currentCartItems');
    if (!container) return;
    container.innerHTML = cartItems.map((item, index) => `
        <div class="flex justify-between items-center bg-white p-3 rounded-xl mb-2 shadow-sm border-r-4 border-blue-500">
            <div class="flex items-center gap-3">
                ${item.image ? `<img src="${item.image}" class="w-10 h-10 rounded shadow-sm">` : ''}
                <div>
                    <div class="font-bold text-sm">${item.name}</div>
                    <div class="text-xs text-gray-400">${item.qty} وحدة × ${item.price} ر.س</div>
                </div>
            </div>
            <button onclick="removeFromCart(${index})" class="text-red-400 hover:text-red-600"><i class="fas fa-trash-alt"></i></button>
        </div>
    `).join('');
}

window.removeFromCart = (index) => {
    cartItems.splice(index, 1);
    renderCart();
    calculateTotals();
};

function calculateTotals() {
    const subtotal = cartItems.reduce((acc, i) => acc + i.total, 0);
    const discount = parseFloat(document.getElementById('discountInput')?.value || 0);
    const tax = (subtotal - discount) * 0.15;
    const total = (subtotal - discount) + tax;

    document.getElementById('subtotalLabel').innerText = subtotal.toFixed(2);
    document.getElementById('taxLabel').innerText = tax.toFixed(2);
    document.getElementById('totalLabel').innerText = total.toFixed(2);
}

// حفظ الطلب النهائي مع تجميد البيانات (Snapshot)
window.submitOrder = async (e) => {
    if (cartItems.length === 0) return alert("السلة فارغة");
    
    const btn = e.currentTarget || e.target;
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الحفظ...';

    const orderData = {
        orderNumber: document.getElementById('orderNo').value,
        orderDate: document.getElementById('orderDate').value,
        orderTime: window.currentOrderTime,
        // لقطة بيانات العميل الشاملة
        customerSnapshot: {
            name: document.getElementById('cName').value,
            phone: document.getElementById('cPhone').value,
            email: document.getElementById('cEmail')?.value || "---",
            address: {
                city: document.getElementById('cCity')?.value || "",
                district: document.getElementById('cDistrict')?.value || "",
                street: document.getElementById('cStreet')?.value || "",
                building: document.getElementById('cBuild')?.value || "",
                postal: document.getElementById('cPost')?.value || ""
            }
        },
        items: cartItems, // لقطة المنتجات
        payment: {
            method: document.getElementById('payMethod').value,
            approvalNo: document.getElementById('approvalNo')?.value || "---"
        },
        shipping: {
            type: document.getElementById('shipType')?.value || "بدون شحن"
        },
        totals: {
            subtotal: document.getElementById('subtotalLabel').innerText,
            tax: document.getElementById('taxLabel').innerText,
            total: document.getElementById('totalLabel').innerText
        }
    };

    try {
        const docRef = await logic.saveData("orders", orderData);
        
        // فتح الطباعة في تبويب مستقل (Tab)
        const printUrl = `../../print.html?id=${docRef.id}`;
        window.open(printUrl, '_blank');
        
        alert("تم حفظ الطلب بنجاح");
        location.reload(); 
    } catch (error) {
        console.error(error);
        alert("خطأ في الحفظ");
        btn.disabled = false;
        btn.innerText = "اعتماد وحفظ";
    }
};

function renderOrdersTable(data) {
    const tbody = document.getElementById('ordersTableBody');
    if (!tbody) return;
    tbody.innerHTML = data.map(o => `
        <tr class="border-b hover:bg-slate-50 transition">
            <td class="p-4 font-bold text-blue-600">${o.orderNumber}</td>
            <td class="p-4 font-medium">${o.customerSnapshot?.name || '---'}</td>
            <td class="p-4 text-gray-500 text-sm">${o.orderDate} <span class="text-xs opacity-50">${o.orderTime || ''}</span></td>
            <td class="p-4 font-black">${o.totals?.total} ر.س</td>
            <td class="p-4 text-center">
                <button onclick="window.open('../../print.html?id=${o.id}', '_blank')" 
                        class="bg-blue-50 text-blue-600 p-2 px-3 rounded-lg hover:bg-blue-600 hover:text-white transition shadow-sm">
                    <i class="fas fa-print"></i>
                </button>
            </td>
        </tr>
    `).join('');
}
