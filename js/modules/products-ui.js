/**
 * js/modules/products-ui.js
 * موديول المنتجات - نسخة مبسطة ونظيفة
 */

import { db } from '../core/firebase.js';
import { collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

console.log('✅ products-ui.js تم تحميله بنجاح');

// ===================== جلب المنتجات من Firebase =====================

async function getProductsFromFirebase() {
    console.log('📦 جلب المنتجات من Firebase...');
    try {
        const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        console.log(`📊 عدد المنتجات: ${querySnapshot.size}`);
        
        const products = [];
        querySnapshot.forEach((doc) => {
            products.push({
                id: doc.id,
                ...doc.data()
            });
        });
        return products;
    } catch (error) {
        console.error('❌ خطأ في جلب المنتجات:', error);
        return [];
    }
}

// ===================== عرض المنتجات =====================

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

async function renderProducts(container) {
    console.log('🎨 عرض المنتجات...');
    
    const products = await getProductsFromFirebase();
    
    if (!products || products.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 60px; color: #7f8c8d;">
                <i class="fas fa-box-open fa-3x" style="margin-bottom: 15px; display: block;"></i>
                <p>لا توجد منتجات مسجلة حالياً</p>
                <p style="font-size: 12px;">✅ تم الاتصال بـ Firebase بنجاح ولكن مجموعة products فارغة</p>
            </div>
        `;
        return;
    }
    
    let html = `
        <div style="margin-bottom: 20px;">
            <p style="color: #27ae60; background: #d4edda; padding: 10px; border-radius: 8px;">
                ✅ تم جلب ${products.length} منتج من Firebase
            </p>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px;">
    `;
    
    for (const product of products) {
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
                <div style="margin-top: 10px; font-size: 0.7rem; color: #27ae60;">
                    🆔 ID: ${product.id.slice(0, 8)}...
                </div>
            </div>
        `;
    }
    
    html += `</div>`;
    container.innerHTML = html;
    console.log('✅ تم عرض المنتجات بنجاح');
}

// ===================== الدالة الرئيسية =====================

export async function initProducts(container) {
    console.log('🚀 initProducts تم استدعاؤها');
    
    if (!container) {
        console.error('❌ container غير موجود');
        return;
    }
    
    // عرض واجهة التحميل
    container.innerHTML = `
        <div style="padding: 25px; font-family: 'Tajawal', sans-serif;">
            <h2 style="color: #2c3e50; margin-bottom: 20px;">
                <i class="fas fa-box" style="color: #e67e22;"></i> 
                إدارة المنتجات
            </h2>
            <div id="products-container" style="margin-top: 20px;">
                <div style="text-align: center; padding: 40px;">
                    <i class="fas fa-spinner fa-spin fa-2x" style="color: #e67e22;"></i>
                    <p style="margin-top: 10px;">جاري تحميل المنتجات...</p>
                </div>
            </div>
        </div>
    `;
    
    const productsContainer = document.getElementById('products-container');
    if (productsContainer) {
        await renderProducts(productsContainer);
    }
}

// تصدير افتراضي
export default { initProducts };
