// js/orders-app.js
import * as logic from './orders-logic.js';

// جعل الدوال متاحة للـ HTML
window.switchSystem = switchSystem;
window.submitOrder = submitOrder;
window.addToCart = addToCart;

let currentCart = [];

// 1. وظيفة التبديل بين الأنظمة
async function switchSystem(type) {
    window.currentView = type;
    
    // تحديث الأزرار بصرياً
    document.getElementById('btn-new').classList.toggle('active-system', type === 'new');
    document.getElementById('btn-old').classList.toggle('active-system', type === 'old');

    // إذا تم فتح نموذج الإضافة، قم بتوليد البيانات
    if(type === 'new') {
        document.getElementById('orderNo').value = logic.generateOrderID();
        document.getElementById('orderDate').value = new Date().toISOString().split('T')[0];
    }

    await loadDashboardData();
}

// 2. وظيفة إضافة منتج للسلة (Cart)
function addToCart() {
    const pName = document.getElementById('pName').value;
    const pPrice = parseFloat(document.getElementById('pPrice').value) || 0;
    const pQty = parseInt(document.getElementById('pQty').value) || 1;

    if (!pName) return alert("يرجى إدخال اسم المنتج");

    const item = {
        name: pName,
        price: pPrice,
        qty: pQty,
        total: pPrice * pQty
    };

    currentCart.push(item);
    updateTotals();
    
    // تنظيف الحقول
    document.getElementById('pName').value = '';
    document.getElementById('pPrice').value = '';
}

// 3. تحديث الإجماليات في الواجهة
function updateTotals() {
    const total = currentCart.reduce((sum, item) => sum + item.total, 0);
    document.getElementById('subtotalLabel').innerText = total.toFixed(2);
    document.getElementById('totalLabel').innerText = total.toFixed(2);
}

// 4. حفظ الفاتورة النهائية في Firebase
async function submitOrder(event) {
    const btn = event.target;
    btn.disabled = true;
    btn.innerText = "جاري الحفظ...";

    const orderData = {
        orderNumber: document.getElementById('orderNo').value,
        orderDate: document.getElementById('orderDate').value,
        orderTime: new Date().toLocaleTimeString('ar-SA'),
        customerSnapshot: {
            name: document.getElementById('cName').value,
            phone: document.getElementById('cPhone').value,
            email: document.getElementById('cEmail').value,
            address: {
                city: document.getElementById('cCity').value,
                district: document.getElementById('cDistrict').value
            }
        },
        items: currentCart,
        totals: {
            total: document.getElementById('totalLabel').innerText
        }
    };

    try {
        await logic.saveData("orders", orderData);
        alert("تم حفظ الفاتورة بنجاح!");
        location.reload(); // تحديث الصفحة لرؤية الطلب الجديد
    } catch (error) {
        alert("خطأ أثناء الحفظ: " + error.message);
        btn.disabled = false;
        btn.innerText = "اعتماد وحفظ الفاتورة";
    }
}
