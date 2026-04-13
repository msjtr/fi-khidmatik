import { db } from './firebase.js';
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    if (!id) {
        console.error("رقم الفاتورة مفقود في الرابط");
        return;
    }

    try {
        const docRef = doc(db, "orders", id);
        const snap = await getDoc(docRef);
        
        if (snap.exists()) {
            renderInvoice(snap.data());
            // إظهار محتوى الفاتورة بعد اكتمال التحميل
            document.getElementById('print-app')?.classList.remove('hidden');
        } else {
            document.body.innerHTML = `
                <div style="text-align:center; padding:50px; font-family:sans-serif;">
                    <h2>الفاتورة غير موجودة</h2>
                    <p>نرجو التأكد من رقم الطلب أو مراجعة الأرشيف</p>
                </div>`;
        }
    } catch (error) {
        console.error("خطأ أثناء جلب الفاتورة:", error);
    }
});

function renderInvoice(data) {
    // 1. معالجة بيانات العميل (دعم Snapshot للجديد والحقول المباشرة للقديم)
    const cust = data.customerSnapshot || {};
    const addr = cust.address || {};

    // استخدام Fallback (بدائل) لضمان عرض البيانات مهما كان نوع الطلب
    setText('inv-cust-name', cust.name || data.customerName || data.clientName || "عميل عام");
    setText('inv-cust-phone', cust.phone || data.customerPhone || "---");
    
    // بناء العنوان ذكياً
    const fullAddr = addr.city ? `${addr.city} - ${addr.street || ''}` : (data.customerAddress || "---");
    setText('inv-cust-address', fullAddr);
    
    // 2. الوقت والتاريخ ورقم الطلب
    setText('inv-date', data.orderDate);
    setText('inv-time', data.orderTime);
    setText('inv-no', data.orderNumber || "---");

    // 3. عرض المنتجات
    const itemsContainer = document.getElementById('inv-items');
    if (itemsContainer && data.items) {
        itemsContainer.innerHTML = data.items.map(item => {
            const qty = item.qty || 1;
            const price = item.price || 0;
            const total = item.total || (qty * price);
            
            return `
                <div class="flex justify-between border-b py-3 text-sm">
                    <span>${item.name || 'منتج'} (x${qty})</span>
                    <span class="font-bold">${total} ر.س</span>
                </div>
            `;
        }).join('');
    }

    // 4. الإجماليات
    const totalAmount = data.totals?.total || data.total || "0.00";
    setText('inv-total', totalAmount);

    // 5. توليد QR الزكاة والدخل (Tera)
    const qrContainer = document.getElementById("qrcode");
    if (qrContainer && typeof QRCode !== 'undefined') {
        qrContainer.innerHTML = ""; // تنظيف قبل التوليد
        const qrContent = `Seller: Tera | Date: ${data.orderDate} | Total: ${totalAmount}`;
        new QRCode(qrContainer, {
            text: qrContent,
            width: 120,
            height: 120,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
    }
}

// دالة مساعدة لتجنب أخطاء innerText إذا كان العنصر غير موجود في الـ HTML
function setText(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.innerText = value || "---";
    }
}
