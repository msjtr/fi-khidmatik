/**
 * js/modules/dashboard.js
 * موديول لوحة التحكم الرئيسية
 */

import { db } from '../core/firebase.js';
import { collection, getDocs, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export async function initDashboard(container) {
    if (!container) return;
    
    // تحميل الإحصائيات
    const stats = await loadStats();
    
    container.innerHTML = `
        <div style="padding: 25px; font-family: 'Tajawal', sans-serif;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;">
                <h1 style="color: #2c3e50; margin: 0;">
                    <i class="fas fa-chart-line" style="color: #e67e22;"></i> 
                    لوحة التحكم الرئيسية
                </h1>
                <div style="background: white; padding: 10px 20px; border-radius: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                    <i class="fas fa-calendar-alt" style="color: #e67e22;"></i> 
                    ${new Date().toLocaleDateString('ar-SA')}
                </div>
            </div>
            
            <!-- بطاقات الإحصائيات -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; margin-bottom: 30px;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 15px; color: white;">
                    <i class="fas fa-box fa-2x"></i>
                    <h3 style="margin: 10px 0 5px;">${stats.products}</h3>
                    <p style="margin: 0; opacity: 0.9;">المنتجات</p>
                </div>
                <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 20px; border-radius: 15px; color: white;">
                    <i class="fas fa-receipt fa-2x"></i>
                    <h3 style="margin: 10px 0 5px;">${stats.orders}</h3>
                    <p style="margin: 0; opacity: 0.9;">الطلبات</p>
                </div>
                <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 20px; border-radius: 15px; color: white;">
                    <i class="fas fa-users fa-2x"></i>
                    <h3 style="margin: 10px 0 5px;">${stats.customers}</h3>
                    <p style="margin: 0; opacity: 0.9;">العملاء</p>
                </div>
                <div style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); padding: 20px; border-radius: 15px; color: white;">
                    <i class="fas fa-chart-line fa-2x"></i>
                    <h3 style="margin: 10px 0 5px;">${stats.totalSales}</h3>
                    <p style="margin: 0; opacity: 0.9;">إجمالي المبيعات</p>
                </div>
            </div>
            
            <!-- اختصارات سريعة -->
            <div style="background: white; border-radius: 15px; padding: 20px; margin-bottom: 20px;">
                <h3 style="margin: 0 0 15px 0;"><i class="fas fa-bolt" style="color: #e67e22;"></i> اختصارات سريعة</h3>
                <div style="display: flex; gap: 15px; flex-wrap: wrap;">
                    <button onclick="window.switchModule('products')" style="background: #e67e22; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer;">
                        <i class="fas fa-box"></i> إدارة المنتجات
                    </button>
                    <button onclick="window.switchModule('orders')" style="background: #27ae60; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer;">
                        <i class="fas fa-receipt"></i> إنشاء فاتورة
                    </button>
                    <button onclick="window.switchModule('customers')" style="background: #3498db; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer;">
                        <i class="fas fa-user-plus"></i> إضافة عميل
                    </button>
                </div>
            </div>
            
            <!-- آخر الطلبات -->
            <div style="background: white; border-radius: 15px; padding: 20px;">
                <h3 style="margin: 0 0 15px 0;"><i class="fas fa-clock" style="color: #e67e22;"></i> آخر الطلبات</h3>
                <div id="recent-orders-list" style="max-height: 300px; overflow-y: auto;">
                    <div style="text-align: center; padding: 20px; color: #95a5a6;">
                        <i class="fas fa-spinner fa-spin"></i> جاري التحميل...
                    </div>
                </div>
            </div>
        </div>
    `;
    
    await loadRecentOrders();
}

async function loadStats() {
    try {
        const productsSnap = await getDocs(collection(db, "products"));
        const ordersSnap = await getDocs(collection(db, "orders"));
        const customersSnap = await getDocs(collection(db, "customers"));
        
        let totalSales = 0;
        ordersSnap.forEach(doc => {
            totalSales += doc.data().total || 0;
        });
        
        return {
            products: productsSnap.size,
            orders: ordersSnap.size,
            customers: customersSnap.size,
            totalSales: totalSales.toFixed(2) + ' ر.س'
        };
    } catch (error) {
        console.error("Error loading stats:", error);
        return { products: 0, orders: 0, customers: 0, totalSales: '0 ر.س' };
    }
}

async function loadRecentOrders() {
    const container = document.getElementById('recent-orders-list');
    if (!container) return;
    
    try {
        const q = query(collection(db, "orders"), orderBy("createdAt", "desc"), limit(5));
        const snap = await getDocs(q);
        
        if (snap.empty) {
            container.innerHTML = '<div style="text-align: center; padding: 20px; color: #95a5a6;">لا توجد طلبات مسجلة</div>';
            return;
        }
        
        container.innerHTML = snap.docs.map(doc => {
            const order = doc.data();
            return `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; border-bottom: 1px solid #f1f5f9;">
                    <div>
                        <strong>${order.customerName}</strong>
                        <div style="font-size: 0.75rem; color: #95a5a6;">${order.orderNumber || '---'}</div>
                    </div>
                    <div style="color: #27ae60; font-weight: bold;">${order.total?.toFixed(2) || 0} ر.س</div>
                </div>
            `;
        }).join('');
        
    } catch (error) {
        console.error("Error loading recent orders:", error);
        container.innerHTML = '<div style="text-align: center; padding: 20px; color: #e74c3c;">حدث خطأ في التحميل</div>';
    }
}
