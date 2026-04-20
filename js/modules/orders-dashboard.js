/**
 * js/modules/orders-dashboard.js
 * موديول لوحة الطلبات والفواتير - نسخة معدلة
 */

import { db } from '../core/firebase.js';
import { collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

console.log('🚀 orders-dashboard.js تم تحميله');

// دالة مساعدة بسيطة
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// الدالة الرئيسية - تأكد من وجودها وتصديرها
export async function initOrdersDashboard(container) {
    console.log('✅ initOrdersDashboard تم استدعاؤها بنجاح');
    
    if (!container) {
        console.error('❌ container غير موجود');
        return;
    }
    
    // عرض واجهة بسيطة للتأكد من عمل الموديول
    container.innerHTML = `
        <div style="padding: 25px; font-family: 'Tajawal', sans-serif;">
            <h2 style="color: #2c3e50;">
                <i class="fas fa-receipt" style="color: #e67e22;"></i> 
                نظام الطلبات والفواتير
            </h2>
            <div style="background: white; border-radius: 12px; padding: 20px; margin-top: 20px;">
                <p style="color: green;">✅ موديول الطلبات يعمل بنجاح!</p>
                <hr>
                <div id="demo-orders">
                    <p>جاري تحميل البيانات...</p>
                </div>
            </div>
        </div>
    `;
    
    // محاولة جلب بعض البيانات من Firebase للتأكد
    try {
        const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        const demoDiv = document.getElementById('demo-orders');
        if (demoDiv) {
            if (snap.empty) {
                demoDiv.innerHTML = '<p>📭 لا توجد طلبات مسجلة بعد.</p>';
            } else {
                demoDiv.innerHTML = `<p>📊 عدد الطلبات المسجلة: ${snap.size}</p>`;
            }
        }
    } catch (error) {
        console.error("Error loading orders:", error);
        const demoDiv = document.getElementById('demo-orders');
        if (demoDiv) {
            demoDiv.innerHTML = '<p style="color: red;">خطأ في الاتصال بقاعدة البيانات</p>';
        }
    }
}

// دالة إضافية للتوافق مع main.js
export async function initOrders(container) {
    return initOrdersDashboard(container);
}

// تصدير افتراضي
export default { initOrdersDashboard, initOrders };
