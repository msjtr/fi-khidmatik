/**
 * js/modules/orders-dashboard.js
 * موديول الطلبات - عرض البيانات المالية والعملاء (V3.2.0)
 */

import { db } from '../core/firebase.js';
import { 
    collection, getDocs, query, orderBy, doc, getDoc, limit 
} from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";

// ===================== أدوات التنسيق (Utilities) =====================

const formatPrice = (num) => Number(num || 0).toLocaleString('ar-SA', { style: 'currency', currency: 'SAR' });

const escapeHtml = (str) => {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
};

function getStatusBadge(status) {
    const statuses = {
        'مكتمل': { bg: '#dcfce7', color: '#166534' },
        'قيد التنفيذ': { bg: '#fef9c3', color: '#854d0e' },
        'ملغي': { bg: '#fee2e2', color: '#991b1b' },
        'default': { bg: '#f1f5f9', color: '#475569' }
    };
    const style = statuses[status] || statuses['default'];
    return `<span style="background:${style.bg}; color:${style.color}; padding:4px 12px; border-radius:12px; font-size:0.75rem; font-weight:bold;">${status || 'غير محدد'}</span>`;
}

// ===================== محرك جلب البيانات =====================

async function fetchOrdersWithDetails() {
    const ordersQuery = query(collection(db, "orders"), orderBy("createdAt", "desc"), limit(50));
    const snapshot = await getDocs(ordersQuery);
    
    // جلب بيانات جميع العملاء المرتبطين بالطلبات دفعة واحدة لتقليل طلبات الشبكة
    const orders = [];
    let totalSales = 0;

    for (const orderDoc of snapshot.docs) {
        const orderData = orderDoc.data();
        let customerInfo = null;

        if (orderData.customerId) {
            const cSnap = await getDoc(doc(db, "customers", orderData.customerId));
            if (cSnap.exists()) customerInfo = cSnap.data();
        }

        const total = Number(orderData.total || 0);
        totalSales += total;

        orders.push({
            id: orderDoc.id,
            ...orderData,
            customer: customerInfo,
            finalTotal: total
        });
    }
    return { orders, totalSales };
}

// ===================== بناء الواجهة الرسومية =====================

async function renderDashboard(container) {
    container.innerHTML = `
        <div style="display:flex; justify-content:center; padding:50px;">
            <div class="spinner-tera"></div> 
        </div>`;

    try {
        const { orders, totalSales } = await fetchOrdersWithDetails();

        if (orders.length === 0) {
            container.innerHTML = `<div style="text-align:center; padding:50px; color:#64748b;">لا توجد طلبات مسجلة حتى الآن.</div>`;
            return;
        }

        let html = `
            <!-- ملخص مالي -->
            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:20px; margin-bottom:30px;">
                <div style="background:white; padding:20px; border-radius:15px; box-shadow:0 4px 6px -1px rgba(0,0,0,0.1); border-right:5px solid #f97316;">
                    <p style="color:#64748b; margin:0; font-size:0.9rem;">إجمالي المبيعات</p>
                    <h3 style="margin:10px 0 0; color:#1e293b; font-size:1.5rem;">${formatPrice(totalSales)}</h3>
                </div>
                <div style="background:white; padding:20px; border-radius:15px; box-shadow:0 4px 6px -1px rgba(0,0,0,0.1); border-right:5px solid #0ea5e9;">
                    <p style="color:#64748b; margin:0; font-size:0.9rem;">عدد الفواتير</p>
                    <h3 style="margin:10px 0 0; color:#1e293b; font-size:1.5rem;">${orders.length} طلب</h3>
                </div>
            </div>

            <!-- قائمة الطلبات -->
            <div style="display:flex; flex-direction:column; gap:15px;">
        `;

        orders.forEach(order => {
            const date = order.createdAt?.toDate().toLocaleDateString('ar-SA', { day: 'numeric', month: 'long' }) || '---';
            const name = order.customerName || order.customer?.name || 'عميل نقدي';
            
            html += `
                <div style="background:white; border-radius:12px; padding:20px; display:flex; align-items:center; justify-content:space-between; transition:transform 0.2s; cursor:pointer; box-shadow:0 1px 3px rgba(0,0,0,0.1);" onmouseover="this.style.transform='scale(1.01)'" onmouseout="this.style.transform='scale(1)'">
                    <div style="display:flex; align-items:center; gap:20px;">
                        <div style="background:#f1f5f9; width:50px; height:50px; border-radius:10px; display:flex; align-items:center; justify-content:center; color:#f97316;">
                            <i class="fas fa-file-invoice-dollar fa-lg"></i>
                        </div>
                        <div>
                            <h4 style="margin:0 0 5px; color:#1e293b;">${escapeHtml(name)}</h4>
                            <div style="display:flex; gap:15px; font-size:0.8rem; color:#64748b;">
                                <span><i class="far fa-calendar-alt"></i> ${date}</span>
                                <span><i class="fas fa-hashtag"></i> ${order.orderNumber || order.id.slice(0, 6)}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div style="text-align:left; display:flex; flex-direction:column; align-items:flex-end; gap:8px;">
                        <div style="font-weight:bold; color:#10b981; font-size:1.1rem;">${formatPrice(order.finalTotal)}</div>
                        ${getStatusBadge(order.status)}
                    </div>
                </div>
            `;
        });

        html += `</div>`;
        container.innerHTML = html;

    } catch (error) {
        console.error("🔴 Dashboard Error:", error);
        container.innerHTML = `<div style="color:red; text-align:center; padding:20px;">عذراً، فشل تحميل البيانات. يرجى التأكد من اتصال الإنترنت.</div>`;
    }
}

// ===================== تهيئة الموديول =====================

export async function initOrdersDashboard(container) {
    if (!container) return;
    
    container.innerHTML = `
        <div style="font-family:'Cairo', sans-serif; max-width:1000px; margin:0 auto;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:30px;">
                <h2 style="margin:0; color:#1e293b;"><i class="fas fa-chart-line" style="color:#f97316;"></i> ملخص العمليات المالية</h2>
                <button onclick="location.reload()" style="background:#f97316; color:white; border:none; padding:10px 20px; border-radius:8px; cursor:pointer; font-weight:bold;">
                    <i class="fas fa-sync"></i> تحديث
                </button>
            </div>
            <div id="tera-orders-list"></div>
        </div>
    `;

    const listContainer = document.getElementById('tera-orders-list');
    await renderDashboard(listContainer);
}

// توافق مع الأسماء المختلفة للاستدعاء
export const initOrders = initOrdersDashboard;
export default { initOrdersDashboard, initOrders };
