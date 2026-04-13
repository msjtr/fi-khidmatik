import { db } from './firebase.js';
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('id');

    if (!orderId) {
        alert("عذراً، لم يتم العثور على رقم الطلب.");
        return;
    }

    try {
        const docRef = doc(db, "orders", orderId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            
            // 1. حقن البيانات في الواجهة
            renderOrderData(data);

            // 2. إخفاء الـ Loader وإظهار الفاتورة
            const loader = document.getElementById('loader');
            const printApp = document.getElementById('print-app');
            if (loader) loader.style.display = 'none';
            if (printApp) printApp.classList.remove('hidden');

        } else {
            document.body.innerHTML = "<div class='text-center py-20'><h1 class='text-2xl font-bold'>عذراً، الطلب غير موجود في قاعدة البيانات</h1><a href='index.html' class='text-blue-500 underline'>العودة للرئيسية</a></div>";
        }
    } catch (error) {
        console.error("Error fetching order:", error);
        alert("حدث خطأ أثناء جلب بيانات الفاتورة.");
    }
});

function renderOrderData(data) {
    // 1. بيانات الفاتورة الأساسية
    setText('inv-number', data.orderNumber);
    setText('inv-date', data.orderDate);
    setText('inv-time', data.orderTime || "---");

    // 2. بيانات العميل من الـ Snapshot (تضمن ثبات البيانات حتى لو تغيرت في ملف العميل لاحقاً)
    const cust = data.customerSnapshot || {};
    setText('cust-name', cust.name);
    setText('cust-phone', cust.phone);
    setText('cust-email', cust.email || '---');
    
    // العنوان التفصيلي
    const addr = cust.address || {};
    const fullAddress = [addr.city, addr.district, addr.street].filter(Boolean).join(' - ') || '---';
    const buildingInfo = addr.building ? `(مبنى: ${addr.building})` : '';
    
    setText('cust-address', `${fullAddress} ${buildingInfo}`);
    setText('cust-postal', addr.postal || '---');

    // 3. عرض المنتجات (دعم الصور والوصف المنسق)
    const itemsContainer = document.getElementById('items-container');
    if (itemsContainer && data.items) {
        itemsContainer.innerHTML = data.items.map(item => `
            <div class="flex items-center gap-4 border-b border-slate-100 py-4">
                ${item.image ? 
                    `<img src="${item.image}" class="w-16 h-16 rounded-xl object-cover shadow-sm border border-slate-100">` : 
                    `<div class="w-16 h-16 bg-slate-50 rounded-xl flex items-center justify-center text-[10px] text-slate-300 border border-slate-50">لا توجد صورة</div>`
                }
                <div class="flex-1">
                    <h4 class="font-bold text-slate-800">${item.name}</h4>
                    <div class="text-[11px] text-slate-500 mt-1 leading-relaxed">${item.desc || 'لا يوجد وصف إضافي'}</div>
                    <div class="text-[10px] text-blue-500 font-mono mt-1 font-semibold uppercase tracking-wider">SKU: ${item.sku || '---'}</div>
                </div>
                <div class="text-left min-w-[80px]">
                    <div class="font-bold text-slate-900">${parseFloat(item.price).toFixed(2)} ر.س</div>
                    <div class="text-[11px] text-slate-400 font-medium">الكمية: ${item.qty}</div>
                </div>
            </div>
        `).join('');
    }

    // 4. الإجماليات (استخدام أرقام منسقة)
    const totals = data.totals || {};
    setText('inv-subtotal', totals.subtotal);
    setText('inv-tax', totals.tax);
    setText('inv-total', totals.total);

    // 5. طريقة الدفع والشحن
    setText('inv-pay-method', data.payment?.method || '---');
    setText('inv-shipping', data.shipping?.type || 'استلام من المقر');

    // 6. توليد QR Code
    generateZakatQR(data);
}

function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.innerText = value || "---";
}

function generateZakatQR(data) {
    const qrContainer = document.getElementById('qrcode');
    if (!qrContainer || typeof QRCode === 'undefined') return;
    
    // محتوى الـ QR 
    const qrContent = `Seller: Tera platform\nVAT: 300000000000003\nDate: ${data.orderDate} ${data.orderTime}\nTotal: ${data.totals?.total}\nTax: ${data.totals?.tax}`;
    
    // تنظيف الحاوية قبل التوليد لتجنب التكرار
    qrContainer.innerHTML = "";
    
    new QRCode(qrContainer, {
        text: qrContent,
        width: 100,
        height: 100,
        colorDark: "#1e293b",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });
}
