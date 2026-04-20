/**
 * js/modules/products-ui.js
 * جلب المنتجات من Firebase - نسخة مبسطة
 */

import { db } from '../core/firebase.js';
import { collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

console.log('🚀 products-ui.js تم تحميله');

// ===================== جلب المنتجات =====================

async function loadProducts() {
    console.log('🔄 جلب المنتجات من Firebase...');
    try {
        const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        console.log(`✅ تم العثور على ${querySnapshot.size} منتج`);
        
        const products = [];
        querySnapshot.forEach(doc => {
            products.push({ id: doc.id, ...doc.data() });
        });
        console.log('📦 المنتجات:', products);
        return products;
    } catch (error) {
        console.error('❌ خطأ في جلب المنتجات:', error);
        return [];
    }
}

// ===================== عرض المنتجات =====================

function formatCurrency(amount) {
    var num = Number(amount) || 0;
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

async function displayProducts(container) {
    console.log('🔄 عرض المنتجات...');
    
    const products = await loadProducts();
    
    if (!products || products.length === 0) {
        container.innerHTML = `
            <div style="padding: 40px; text-align: center; color: #7f8c8d;">
                <i class="fas fa-box-open fa-3x" style="margin-bottom: 10px; display: block;"></i>
                <p>لا توجد منتجات مسجلة حالياً</p>
                <p style="font-size: 0.8rem;">مجموعة products في Firebase: 0 مستند</p>
            </div>
        `;
        return;
    }
    
    let html = '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px;">';
    
    products.forEach(product => {
        html += `
            <div style="background: white; border-radius: 12px; padding: 15px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); border-right: 4px solid #e67e22;">
                <h4 style="margin: 0 0 10px 0;">${escapeHtml(product.name)}</h4>
                <div style="color: #e67e22; font-size: 1.2rem; font-weight: bold;">${formatCurrency(product.price)}</div>
                <div style="color: #7f8c8d; font-size: 0.8rem;">المخزون: ${product.stock || 0}</div>
                ${product.code ? `<div style="color: #95a5a6; font-size: 0.7rem;">كود: ${escapeHtml(product.code)}</div>` : ''}
                <div style="margin-top: 10px; font-size: 0.8rem; color: #27ae60;">✅ منتج حقيقي من Firebase</div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
    console.log('✅ تم عرض المنتجات بنجاح');
}

// ===================== الدالة الرئيسية =====================

export async function initProducts(container) {
    console.log('✅ initProducts تم استدعاؤها');
    
    if (!container) {
        console.error('❌ container غير موجود');
        return;
    }

    container.innerHTML = `
        <div style="padding: 20px; font-family: 'Tajawal', sans-serif;">
            <h2 style="color: #2c3e50; margin-bottom: 20px;">
                <i class="fas fa-box" style="color: #e67e22;"></i> 
                إدارة المنتجات
            </h2>
            <div id="products-content" style="margin-top: 20px;">
                <div style="text-align: center; padding: 40px;">
                    <i class="fas fa-spinner fa-spin fa-2x"></i>
                    <p>جاري تحميل المنتجات...</p>
                </div>
            </div>
        </div>
    `;
    
    const productsContainer = document.getElementById('products-content');
    await displayProducts(productsContainer);
}

export default { initProducts };
