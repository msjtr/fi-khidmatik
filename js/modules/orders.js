import { db } from '../core/firebase.js';
import { collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export async function initOrdersDashboard(container) {
    container.innerHTML = `
        <div style="padding:20px; font-family: 'Tajawal', sans-serif;" dir="rtl">
            <div style="display:flex; justify-content:space-between; margin-bottom:20px;">
                <h2 style="color:#2c3e50;">📦 الطلبات الحالية</h2>
                <button onclick="location.reload()" style="background:#3498db; color:white; border:none; padding:8px 15px; border-radius:8px; cursor:pointer;">تحديث البيانات</button>
            </div>
            <div id="orders-list-grid" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap:20px;">
                <p>جاري تحميل طلبات تيرا...</p>
            </div>
        </div>
    `;
    await loadOrders();
}

async function loadOrders() {
    const grid = document.getElementById('orders-list-grid');
    try {
        const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        
        grid.innerHTML = snap.docs.map(doc => {
            const o = doc.data();
            // تجميع العنوان من البيانات المرسلة سابقاً
            const fullAddr = `${o.shippingAddress?.city || o.city || ''} - ${o.shippingAddress?.district || o.district || ''} - ${o.shippingAddress?.street || o.street || ''}`;
            
            // جلب صورة أول منتج في الطلب (من مصفوفة items)
            const firstItemImage = o.items && o.items[0] ? o.items[0].image : './img/no-product.png';

            return `
                <div style="background:white; border-radius:15px; overflow:hidden; box-shadow:0 5px 15px rgba(0,0,0,0.05); display:flex; flex-direction:column;">
                    <img src="${firstItemImage}" style="width:100%; height:150px; object-fit:cover;" onerror="this.src='https://via.placeholder.com/400x150?text=No+Image'">
                    <div style="padding:15px;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                            <span style="font-weight:bold; color:#3498db;"># ${o.orderNumber}</span>
                            <span style="font-size:0.8rem; background:#e8f4fd; color:#3498db; padding:2px 8px; border-radius:10px;">${o.status}</span>
                        </div>
                        <h4 style="margin:0 0 10px 0;">${o.customerName || 'عميل'}</h4>
                        <div style="font-size:0.85rem; color:#666; margin-bottom:10px;">
                            <i class="fas fa-map-marker-alt" style="color:#e74c3c;"></i> ${fullAddr}
                        </div>
                        <div style="display:flex; justify-content:space-between; align-items:center; padding-top:10px; border-top:1px solid #eee;">
                            <strong style="color:#27ae60; font-size:1.1rem;">${o.total} ريال</strong>
                            <button onclick="window.print()" style="background:#2c3e50; color:white; border:none; padding:5px 12px; border-radius:5px; cursor:pointer;">
                                <i class="fas fa-print"></i> طباعة
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    } catch (e) {
        grid.innerHTML = "حدث خطأ في جلب البيانات.";
    }
}
