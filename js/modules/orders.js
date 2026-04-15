// js/modules/orders.js

// التعديل: استدعاء ملف firebase.js من نفس المجلد الحالي (بدون ../core/)
import { db } from './firebase.js'; 

// التعديل: الرابط الكامل للمكتبة (CDN) يبقى كما هو لأنه خارجي
import { 
    collection, 
    getDocs, 
    updateDoc, 
    doc, 
    query, 
    orderBy 
} from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

// التعديل: استدعاء ملف formatter.js من نفس المجلد الحالي (بدون ../utils/)
import { formatCurrency, formatDate } from './formatter.js';

let currentOrders = [];

/**
 * تهيئة لوحة الطلبات
 */
export async function initOrdersDashboard(container) {
    try {
        // التعديل: بما أن الملفات بجانب بعضها، قد يكون المسار هو نفس مستوى admin.html
        // جرب استخدام المسار المباشر للملف
        const resp = await fetch('orders-dashboard.html'); 
        if (!resp.ok) throw new Error("Interface file not found");
        container.innerHTML = await resp.text();

        await loadOrders();
        
        document.getElementById('refresh-orders')?.addEventListener('click', loadOrders);
        document.getElementById('search-order')?.addEventListener('input', filterOrders);
        document.getElementById('status-filter')?.addEventListener('change', filterOrders);
        
    } catch (err) {
        console.error("Dashboard Init Error:", err);
        container.innerHTML = `<p style="padding:20px; color:red; text-align:center;">عذراً، تعذر تحميل واجهة الطلبات.</p>`;
    }
}

/**
 * جلب الطلبات من Firestore
 */
async function loadOrders() {
    const listContainer = document.getElementById('orders-list');
    if (listContainer) listContainer.innerHTML = '<p style="text-align:center; padding:20px;">جاري تحديث البيانات...</p>';

    try {
        const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        currentOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderOrders(currentOrders);
    } catch (err) {
        console.error("Firestore Load Error:", err);
        if (listContainer) listContainer.innerHTML = '<p style="color:red; text-align:center;">خطأ في الاتصال بقاعدة البيانات.</p>';
    }
}

/**
 * عرض الطلبات في الواجهة
 */
function renderOrders(orders) {
    const container = document.getElementById('orders-list');
    if (!container) return;
    
    if (orders.length === 0) {
        container.innerHTML = '<p style="text-align:center; padding:20px;">لا توجد طلبات حالية.</p>';
        return;
    }

    container.innerHTML = orders.map(order => {
        const dateVal = order.createdAt?.toDate ? order.createdAt.toDate() : order.createdAt;
        
        return `
            <div class="order-card">
                <div class="card-info">
                    <div><strong>رقم الطلب:</strong> ${order.orderNumber || 'N/A'}</div>
                    <div><strong>العميل:</strong> ${order.customerName || 'غير محدد'}</div>
                    <div><strong>التاريخ:</strong> ${formatDate(dateVal)}</div>
                    <div><strong>الإجمالي:</strong> ${formatCurrency(order.total || 0)}</div>
                    <div>
                        <span class="order-status status-${order.status || 'pending'}">
                            ${translateStatus(order.status)}
                        </span>
                    </div>
                </div>
                <div class="order-actions" style="margin-top:15px; display:flex; gap:10px;">
                    <button class="btn-icon" onclick="window.open('print.html?orderId=${order.id}', '_blank')">
                        <i class="fas fa-print"></i>
                    </button>
                    <button class="btn-icon success" onclick="updateOrderStatus('${order.id}', 'completed')">
                        <i class="fas fa-check-circle"></i>
                    </button>
                    <button class="btn-icon danger" onclick="updateOrderStatus('${order.id}', 'cancelled')">
                        <i class="fas fa-ban"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function translateStatus(s) {
    const statuses = { 'pending': 'قيد الانتظار', 'completed': 'مكتمل', 'cancelled': 'ملغي' };
    return statuses[s] || 'غير معروف';
}

window.updateOrderStatus = async (orderId, status) => {
    if(confirm('هل أنت متأكد؟')) {
        try {
            await updateDoc(doc(db, "orders", orderId), { status });
            await loadOrders();
        } catch (err) {
            console.error("Update Status Error:", err);
        }
    }
};

function filterOrders() {
    const search = document.getElementById('search-order')?.value.toLowerCase();
    const status = document.getElementById('status-filter')?.value;
    
    let filtered = currentOrders.filter(o => {
        const mSearch = (o.orderNumber || '').toString().toLowerCase().includes(search) || 
                        (o.customerName || '').toLowerCase().includes(search);
        const mStatus = (status === 'all' || o.status === status);
        return mSearch && mStatus;
    });
    
    renderOrders(filtered);
}
