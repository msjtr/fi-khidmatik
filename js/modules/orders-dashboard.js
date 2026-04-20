/**
 * js/modules/orders-dashboard.js
 * نسخة مبسطة للغاية - للاختبار فقط
 */

import { db } from '../core/firebase.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

console.log('🚀 orders-dashboard.js تم تحميله - النسخة المبسطة');

// دالة اختبار بسيطة
async function testFirebase() {
    try {
        const querySnapshot = await getDocs(collection(db, "orders"));
        console.log(`✅ عدد الطلبات في Firebase: ${querySnapshot.size}`);
        return querySnapshot.size;
    } catch (error) {
        console.error("❌ خطأ في الاتصال:", error);
        return 0;
    }
}

// الدالة الرئيسية - يجب أن تكون موجودة ومصدرة
export async function initOrdersDashboard(container) {
    console.log('✅✅✅ initOrdersDashboard تم استدعاؤها بنجاح ✅✅✅');
    
    if (!container) {
        console.error('❌ container غير موجود');
        return;
    }
    
    const ordersCount = await testFirebase();
    
    container.innerHTML = `
        <div style="padding: 25px; font-family: 'Tajawal', sans-serif;">
            <h2 style="color: #2c3e50;">
                <i class="fas fa-receipt" style="color: #e67e22;"></i> 
                نظام الطلبات والفواتير
            </h2>
            <div style="background: white; border-radius: 12px; padding: 20px; margin-top: 20px; text-align: center;">
                <i class="fas fa-check-circle fa-3x" style="color: #27ae60; margin-bottom: 10px;"></i>
                <h3 style="color: #27ae60;">✅ الموديول يعمل بنجاح!</h3>
                <p>عدد الطلبات في قاعدة البيانات: <strong>${ordersCount}</strong></p>
                <hr>
                <p style="color: #7f8c8d;">هذه نسخة تجريبية للتأكد من عمل الموديول.</p>
            </div>
        </div>
    `;
    
    console.log('✅ تم عرض واجهة الطلبات التجريبية');
}

// دالة إضافية للتوافق
export async function initOrders(container) {
    console.log('🔄 initOrders تم استدعاؤها');
    return initOrdersDashboard(container);
}

// تصدير افتراضي
export default { initOrdersDashboard, initOrders };
