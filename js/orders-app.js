import * as logic from './orders-logic.js';

let cartItems = [];
let quill; // محرر النصوص

document.addEventListener('DOMContentLoaded', async () => {
    // 1. تهيئة محرر Quill للوصف
    if (document.getElementById('editor')) {
        quill = new Quill('#editor', {
            theme: 'snow',
            placeholder: 'وصف المنتج أو الخدمة...',
            modules: { 
                toolbar: [['bold', 'italic'], [{ 'list': 'ordered'}, { 'list': 'bullet' }]] 
            }
        });
    }

    // 2. ربط ميزة البحث في سجل العمليات
    const searchInput = document.getElementById('orderSearch');
    if (searchInput) {
        searchInput.addEventListener('input', async (e) => {
            const term = e.target.value.toLowerCase();
            const history = await logic.fetchFullData();
            const filtered = history.filter(o => 
                o.orderNumber.toLowerCase().includes(term) || 
                (o.customerSnapshot?.name || "").toLowerCase().includes(term)
            );
            renderOrdersTable(filtered);
        });
    }
    
    // 3. تشغيل التطبيق وجلب البيانات
    initApp();
});

async function initApp() {
    try {
        // توليد رقم الطلب والتاريخ الحالي
        refreshOrderID();
        
        const now = new Date();
        const dateField = document.getElementById('orderDate');
        if (dateField) dateField.value = now.toISOString().split('T')[0];
        
        // حفظ الوقت بصيغة 24 ساعة لضمان الدقة
        window.currentOrderTime = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
        
        // جلب السجل من قاعدة البيانات
        const history = await logic.fetchFullData();
        renderOrdersTable(history);
    } catch (error) {
        console.error("خطأ في تهيئة التطبيق:", error);
    }
}

// دالة تحديث رقم الطلب (متاحة عالمياً لاستدعائها عند فتح النموذج)
window.refreshOrderID = () => {
    const orderNoField = document.getElementById('orderNo');
    if (orderNoField && logic.generateOrderID) {
        orderNoField.value = logic.generateOrderID();
    }
};

// إضافة منتج للسلة
window.addToCart = () => {
    const name = document.getElementById('pName').value;
    const price = parseFloat(document.getElementById('pPrice').value || 0);
    const qty = parseInt(document.getElementById('pQty').value || 1);
    const imgUrl = document.getElementById('pImgUrl')?.value || "";

    if(!name || price <= 0) return alert("يرجى إكمال بيانات المنتج الأساسية");

    cartItems.push({
        name: name,
        price: price,
        qty: qty,
        desc: quill ? quill.root.innerHTML : "", // لقطة الوصف
        image: imgUrl, // لقطة الصورة
        sku: logic.generateSKU ? logic.generateSKU() : "SKU-GEN",
        total: (price * qty)
    });
    
    // تفريغ الحقول بعد الإضافة
    document.getElementById('pName').value = "";
    document.getElementById('pPrice').value = "";
    document.getElementById('pImgUrl').value = "";
    if (quill) quill.setContents([]);
    
    renderCart();
    calculateTotals();
};

function renderCart() {
    const container = document.getElementById('currentCartItems');
    if (!container) return;
    container.innerHTML = cartItems.map((item, index) => `
        <div class="flex justify-between items-center bg-white p-3 rounded-xl mb-2 shadow-sm border-r-4 border-blue-500 animate-fade-in">
            <div class="flex items-center gap-3 text-right">
                ${item.image ? `<img src="${item.image}" class="w-10 h-10 rounded shadow-sm object-cover">` : '<div class="w-10 h-10 bg-gray-100 rounded flex items-center justify-center"><i class="fas fa-image text-gray-300"></i></div>'}
                <div>
                    <div class="font-bold text-sm text-slate-800">${item.name}</div>
                    <div class="text-xs text-gray-400">${item.qty} وحدة × ${item.price} ر.س</div>
                </div>
            </div>
            <button onclick="removeFromCart(${index})" class="text-red-400 hover:text-red-600 p-2"><i class="fas fa-trash-alt"></i></button>
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
    const tax = subtotal * 0.15;
    const total = subtotal + tax;

    if (document.getElementById('subtotalLabel')) document.getElementById('subtotalLabel').innerText = subtotal.toFixed(2);
    if (document.getElementById('taxLabel')) document.getElementById('taxLabel').innerText = tax.toFixed(2);
    if (document.getElementById('totalLabel')) document.getElementById('totalLabel').innerText = total.toFixed(2);
}

// حفظ الطلب النهائي مع Snapshot
window.submitOrder = async (e) => {
    if (cartItems.length === 0) return alert("السلة فارغة، يرجى إضافة منتجات أولاً.");
    
    const btn = e.currentTarget || e.target;
    btn.disabled = true;
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الحفظ...';

    const orderData = {
        orderNumber: document.getElementById('orderNo').value,
        orderDate: document.getElementById('orderDate').value,
        orderTime: window.currentOrderTime,
        customerSnapshot: {
            name: document.getElementById('cName').value || "عميل عام",
            phone: document.getElementById('cPhone').value || "---",
            email: document.getElementById('cEmail')?.value || "---",
            address: {
                city: document.getElementById('cCity')?.value || "",
                district: document.getElementById('cDistrict')?.value || "",
                street: document.getElementById('cStreet')?.value || "",
                building: document.getElementById('cBuild')?.value || "",
                postal: document.getElementById('cPost')?.value || ""
            }
        },
        items: cartItems,
        payment: {
            method: document.getElementById('payMethod').value,
            approvalNo: document.getElementById('approvalNo')?.value || "---"
        },
        shipping: {
            type: document.getElementById('shipType')?.value || "استلام من المقر"
        },
        totals: {
            subtotal: document.getElementById('subtotalLabel').innerText,
            tax: document.getElementById('taxLabel').innerText,
            total: document.getElementById('totalLabel').innerText
        },
        createdAt: new Date()
    };

    try {
        const docRef = await logic.saveData("orders", orderData);
        
        // فتح الطباعة تلقائياً
        window.open(`../../print.html?id=${docRef.id}`, '_blank');
        
        alert("تم حفظ الطلب بنجاح بنظام اللقطة.");
        location.reload(); 
    } catch (error) {
        console.error("خطأ أثناء الحفظ:", error);
        alert("فشل في حفظ الطلب. تأكد من اتصال الإنترنت.");
        btn.disabled = false;
        btn.innerHTML = originalText;
    }
};

function renderOrdersTable(data) {
    const tbody = document.getElementById('ordersTableBody');
    if (!tbody) return;
    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="p-10 text-center text-gray-400">لا توجد عمليات مسجلة حالياً</td></tr>';
        return;
    }
    tbody.innerHTML = data.map(o => `
        <tr class="border-b hover:bg-slate-50 transition">
            <td class="p-4 font-bold text-blue-600">${o.orderNumber}</td>
            <td class="p-4 font-medium text-slate-700">${o.customerSnapshot?.name || '---'}</td>
            <td class="p-4 text-slate-500 text-sm">
                ${o.orderDate} 
                <span class="block text-[10px] opacity-40">${o.orderTime || ''}</span>
            </td>
            <td class="p-4 font-black text-slate-800">${o.totals?.total} ر.س</td>
            <td class="p-4 text-center">
                <button onclick="window.open('../../print.html?id=${o.id}', '_blank')" 
                        class="bg-blue-50 text-blue-600 p-2 px-4 rounded-xl hover:bg-blue-600 hover:text-white transition shadow-sm border border-blue-100">
                    <i class="fas fa-print"></i> عرض الفاتورة
                </button>
            </td>
        </tr>
    `).join('');
}
