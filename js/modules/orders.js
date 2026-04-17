import { db } from '../core/firebase.js';
import { collection, getDocs, query, orderBy, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export async function initOrdersDashboard(container) {
    container.innerHTML = `
        <div style="padding:20px; font-family: 'Tajawal', sans-serif;" dir="rtl">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:25px; flex-wrap:wrap; gap:15px;">
                <h2 style="color:#2c3e50; margin:0;"><i class="fas fa-file-invoice"></i> إدارة طلبات تيرا</h2>
                <div style="display:flex; gap:12px;">
                    <button id="btn-new-order" style="background:#2ecc71; color:white; border:none; padding:12px 22px; border-radius:10px; cursor:pointer; font-weight:bold; box-shadow: 0 4px 10px rgba(46, 204, 113, 0.2);">
                        <i class="fas fa-plus-circle"></i> إنشاء طلب جديد
                    </button>
                    <button id="btn-refresh-list" style="background:#fff; color:#3498db; border:1px solid #3498db; padding:12px; border-radius:10px; cursor:pointer;">
                        <i class="fas fa-sync-alt"></i>
                    </button>
                </div>
            </div>

            <div id="orders-display-grid" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap:20px;">
                <div style="text-align:center; grid-column:1/-1; padding:50px; color:#95a5a6;">
                    <i class="fas fa-spinner fa-spin fa-2x"></i>
                    <p>جاري جلب البيانات من تيرا...</p>
                </div>
            </div>
        </div>
    `;

    // ربط الأزرار بالوظائف
    document.getElementById('btn-refresh-list').onclick = loadOrders;
    document.getElementById('btn-new-order').onclick = createNewOrder;

    await loadOrders();
}

async function loadOrders() {
    const grid = document.getElementById('orders-display-grid');
    try {
        const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        
        if (snap.empty) {
            grid.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:50px;">لا توجد طلبات مسجلة حالياً.</div>`;
            return;
        }

        grid.innerHTML = snap.docs.map(doc => {
            const o = doc.data();
            
            // حل مشكلة العنوان: دمج كافة الحقول لضمان الظهور الكامل
            const addressParts = [
                o.shippingAddress?.city || o.city,
                o.shippingAddress?.district || o.district,
                o.shippingAddress?.street || o.street,
                o.shippingAddress?.buildingNo || o.buildingNo
            ].filter(part => part).join(' - ');

            return `
                <div class="order-card" style="background:white; padding:20px; border-radius:18px; box-shadow:0 10px 25px rgba(0,0,0,0.05); border-right:8px solid #3498db; transition: transform 0.3s ease;">
                    <div style="display:flex; justify-content:space-between; margin-bottom:15px;">
                        <span style="color:#3498db; font-weight:700;"># ${o.orderNumber || 'بدون رقم'}</span>
                        <span style="background:#e8f4fd; color:#3498db; padding:4px 12px; border-radius:20px; font-size:0.8rem; font-weight:bold;">${o.status || 'جديد'}</span>
                    </div>

                    <h3 style="margin:0 0 10px 0; color:#2c3e50; font-size:1.2rem;">${o.customerName || 'عميل تيرا'}</h3>
                    
                    <div style="background:#f8fbfd; padding:12px; border-radius:12px; margin-bottom:15px;">
                        <div style="font-size:0.9rem; color:#576574; margin-bottom:8px;">
                            <i class="fas fa-map-marked-alt" style="color:#e74c3c; width:20px;"></i> 
                            <strong>العنوان:</strong> ${addressParts || 'غير محدد'}
                        </div>
                        <div style="font-size:0.9rem; color:#576574;">
                            <i class="fas fa-phone-alt" style="color:#27ae60; width:20px;"></i> 
                            ${o.phone || o.shippingAddress?.phone || 'لا يوجد هاتف'}
                        </div>
                    </div>

                    <div style="display:flex; justify-content:space-between; align-items:center; padding-top:15px; border-top:1px dashed #dcdde1;">
                        <div style="font-size:1.3rem; font-weight:800; color:#2d3436;">${o.total?.toLocaleString() || 0} <small style="font-size:0.7rem;">ريال</small></div>
                        <button onclick="window.printOrderSheet('${doc.id}')" style="background:#2c3e50; color:white; border:none; padding:8px 18px; border-radius:8px; cursor:pointer; font-size:0.85rem;">
                            <i class="fas fa-print"></i> طباعة الفاتورة
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    } catch (err) {
        grid.innerHTML = `<div style="grid-column:1/-1; color:red; text-align:center;">فشل التحميل: ${err.message}</div>`;
    }
}

// وظيفة الطباعة (تصديرها للنافذة العالمية)
window.printOrderSheet = (id) => {
    // يمكنك هنا فتح صفحة الطباعة الحقيقية
    window.print(); 
};

// وظيفة إنشاء طلب جديد
async function createNewOrder() {
    const customerName = prompt("أدخل اسم العميل:");
    const totalAmount = prompt("أدخل إجمالي المبلغ:");
    
    if (customerName && totalAmount) {
        try {
            await addDoc(collection(db, "orders"), {
                customerName: customerName,
                total: parseFloat(totalAmount),
                orderNumber: "TR-" + Math.floor(1000 + Math.random() * 9000),
                status: "جديد",
                createdAt: serverTimestamp(),
                city: "حائل" // افتراضي كونه المقر الرئيسي
            });
            alert("✅ تم إنشاء الطلب في تيرا بنجاح!");
            loadOrders();
        } catch (e) {
            alert("❌ خطأ أثناء الإنشاء: " + e.message);
        }
    }
}
