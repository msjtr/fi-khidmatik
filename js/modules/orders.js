// js/modules/orders.js
import { db } from '../core/firebase.js';
import { collection, getDocs, updateDoc, doc, query, orderBy } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";
import { formatCurrency, formatDate } from '../utils/formatter.js';

let currentOrders = [];

export async function initOrdersDashboard(container) {
    // تحميل الواجهة من المجلد الصحيح
    try {
        const resp = await fetch('admin/modules/orders-dashboard.html');
        if (!resp.ok) throw new Error("Interface not found");
        container.innerHTML = await resp.text();

        // ربط الأحداث بعد تأكد وجود العناصر في الـ DOM
        await loadOrders();
        
        document.getElementById('refresh-orders')?.addEventListener('click', loadOrders);
        document.getElementById('search-order')?.addEventListener('input', filterOrders);
        document.getElementById('status-filter')?.addEventListener('change', filterOrders);
    } catch (err) {
        console.error("Error initializing dashboard:", err);
        container.innerHTML = '<p class="error">خطأ في تحميل لوحة الطلبات.</p>';
    }
}

async function loadOrders() {
    const listContainer = document.getElementById('orders-list');
    if (listContainer) listContainer.innerHTML = '<p>جاري تحميل الطلبات...</p>';

    try {
        const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        currentOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderOrders(currentOrders);
    } catch (err) {
        console.error("Firestore Load Error:", err);
        if (listContainer) listContainer.innerHTML = '<p>عذراً، فشل الاتصال بقاعدة البيانات.</p>';
    }
}

function renderOrders(orders) {
    const container = document.getElementById('orders-list');
    if (!container) return;
    
    if (orders.length === 0) {
        container.innerHTML = '<p>لا توجد طلبات مسجلة.</p>';
        return;
    }

    container.innerHTML = orders.map(order => {
        // معالجة تاريخ فايربيس في حال كان من نوع Timestamp
        const dateVal = order.createdAt?.toDate ? order.createdAt.toDate() : order.createdAt;
        
        return `
            <div class="order-card">
                <div class="card-body">
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
                <div class="order-actions">
                    <button onclick="window.open('print.html?orderId=${order.id}', '_blank')" title="طباعة">
                        <i class="fas fa-print"></i>
                    </button>
                    <button onclick="updateOrderStatus('${order.id}', 'completed')" title="اعتماد">
                        <i class="fas fa-check-circle"></i>
                    </button>
                    <button onclick="updateOrderStatus('${order.id}', 'cancelled')" title="إلغاء">
                        <i class="fas fa-ban"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// دالة مساعدة لترجمة الحالة
function translateStatus(status) {
    const map = { 'pending': 'قيد الانتظار', 'completed': 'مكتمل', 'cancelled': 'ملغي' };
    return map[status] || 'غير معروف';
}

// جعل الدالة متاحة عالمياً لاستخدامها في أزرار الـ HTML المولد ديناميكياً
window.updateOrderStatus = async (orderId, status) => {
    if(confirm('هل تريد تغيير حالة الطلب؟')) {
        try {
            await updateDoc(doc(db, "orders", orderId), { status });
            await loadOrders(); // تحديث القائمة فوراً
        } catch (err) {
            alert("حدث خطأ أثناء تحديث الحالة.");
        }
    }
};

function filterOrders() {
    const search = document.getElementById('search-order')?.value.toLowerCase();
    const status = document.getElementById('status-filter')?.value;
    
    let filtered = currentOrders.filter(o => {
        const matchesSearch = (o.orderNumber || '').toString().toLowerCase().includes(search) || 
                              (o.customerName || '').toLowerCase().includes(search);
        const matchesStatus = (status === 'all' || o.status === status);
        return matchesSearch && matchesStatus;
    });
    
    renderOrders(filtered);
}
