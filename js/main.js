/**
 * js/modules/orders-dashboard.js
 * موديول لوحة الطلبات والفواتير - نسخة مبسطة
 */

import { db } from '../core/firebase.js';
import { collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

console.log('🚀 orders-dashboard.js تم تحميله');

// الدالة الرئيسية - تأكد من وجودها وتصديرها
export async function initOrdersDashboard(container) {
    console.log('✅ initOrdersDashboard تم استدعاؤها');
    
    if (!container) {
        console.error('❌ container غير موجود');
        return;
    }
    
    // عرض واجهة بسيطة
    container.innerHTML = `
        <div style="padding: 25px; font-family: 'Tajawal', sans-serif;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
                <h2 style="color: #2c3e50;">
                    <i class="fas fa-receipt" style="color: #e67e22;"></i> 
                    نظام الطلبات والفواتير
                </h2>
                <button id="test-order-btn" style="background: #27ae60; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer;">
                    <i class="fas fa-plus"></i> طلب جديد
                </button>
            </div>
            <div style="background: white; border-radius: 12px; padding: 20px;">
                <p style="color: green; text-align: center;">✅ موديول الطلبات يعمل بنجاح!</p>
                <hr>
                <div id="orders-info" style="text-align: center;">
                    <p>جاري تحميل البيانات...</p>
                </div>
            </div>
        </div>
    `;
    
    // محاولة جلب الطلبات من Firebase
    try {
        const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        const infoDiv = document.getElementById('orders-info');
        
        if (infoDiv) {
            if (snap.empty) {
                infoDiv.innerHTML = '<p>📭 لا توجد طلبات مسجلة حالياً</p>';
            } else {
                let html = '<ul style="text-align: right;">';
                snap.forEach(doc => {
                    const order = doc.data();
                    html += `<li><strong>${order.orderNumber || '---'}</strong> - ${order.customerName} - ${order.total || 0} ر.س</li>`;
                });
                html += '</ul>';
                infoDiv.innerHTML = html;
            }
        }
    } catch (error) {
        console.error("Error loading orders:", error);
        const infoDiv = document.getElementById('orders-info');
        if (infoDiv) {
            infoDiv.innerHTML = '<p style="color: red;">خطأ في الاتصال بقاعدة البيانات</p>';
        }
    }
    
    // ربط زر الطلب الجديد
    const testBtn = document.getElementById('test-order-btn');
    if (testBtn) {
        testBtn.addEventListener('click', () => {
            alert('فتح نموذج طلب جديد');
        });
    }
}

// دالة إضافية للتوافق مع main.js
export async function initOrders(container) {
    return initOrdersDashboard(container);
}

// تصدير افتراضي
export default { initOrdersDashboard, initOrders };

console.log('✅ orders-dashboard.js تم تجهيزه وجاهز للتصدير');
