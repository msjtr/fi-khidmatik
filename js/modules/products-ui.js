/**
 * js/modules/products-ui.js
 * موديول المنتجات - النسخة النهائية
 */

import { db } from '../core/firebase.js';
import { collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

console.log('✅ products-ui.js تم تحميله');

export async function initProducts(container) {
    console.log('🚀 initProducts تم استدعاؤها');
    
    if (!container) {
        console.error('❌ container غير موجود');
        return;
    }
    
    // عرض مؤشر تحميل
    container.innerHTML = `
        <div style="padding: 25px; font-family: 'Tajawal', sans-serif;">
            <h2 style="color: #2c3e50;">
                <i class="fas fa-box" style="color: #e67e22;"></i> 
                إدارة المنتجات
            </h2>
            <div id="products-list" style="margin-top: 20px; text-align: center;">
                <i class="fas fa-spinner fa-spin fa-2x" style="color: #e67e22;"></i>
                <p style="margin-top: 10px;">جاري تحميل المنتجات...</p>
            </div>
        </div>
    `;
    
    try {
        const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        const products = [];
        snapshot.forEach(doc => {
            products.push({ id: doc.id, ...doc.data() });
        });
        
        const listDiv = document.getElementById('products-list');
        if (!products.length) {
            listDiv.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #7f8c8d;">
                    <i class="fas fa-box-open fa-3x" style="margin-bottom: 15px; display: block;"></i>
                    <p>لا توجد منتجات مسجلة حالياً</p>
                    <p style="font-size: 12px;">✅ تم الاتصال بـ Firebase بنجاح</p>
                </div>
            `;
            return;
        }
        
        let html = `
            <div style="margin-bottom: 15px;">
                <p style="color: #27ae60; background: #d4edda; padding: 10px; border-radius: 8px;">
                    ✅ تم جلب ${products.length} منتج من Firebase
                </p>
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px;">
        `;
        
        products.forEach(product => {
            html += `
                <div style="background: white; border-radius: 12px; padding: 15px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); border-right: 4px solid #e67e22;">
                    <h3 style="margin: 0 0 10px 0; color: #2c3e50;">${escapeHtml(product.name)}</h3>
                    <div style="font-size: 1.3rem; font-weight: bold; color: #e67e22; margin-bottom: 10px;">
                        ${formatCurrency(product.price)}
                    </div>
                    <div style="color: #7f8c8d; margin-bottom: 5px;">
                        <i class="fas fa-warehouse"></i> المخزون: ${product.stock || 0}
                    </div>
                    ${product.code ? `
                    <div style="color: #95a5a6; font-size: 0.8rem;">
                        <i class="fas fa-barcode"></i> الكود: ${escapeHtml(product.code)}
                    </div>
                    ` : ''}
                </div>
            `;
        });
        
        html += `</div>`;
        listDiv.innerHTML = html;
        
    } catch (error) {
        console.error('❌ خطأ في جلب المنتجات:', error);
        document.getElementById('products-list').innerHTML = `
            <div style="text-align: center; padding: 40px; color: #e74c3c;">
                <i class="fas fa-exclamation-triangle fa-3x"></i>
                <p>حدث خطأ في تحميل المنتجات</p>
                <p style="font-size: 12px;">${error.message}</p>
            </div>
        `;
    }
}

function formatCurrency(amount) {
    const num = Number(amount) || 0;
    return num.toFixed(2) + ' ر.س';
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}
