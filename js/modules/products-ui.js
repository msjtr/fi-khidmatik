/**
 * js/modules/products-ui.js
 */

import { db } from '../core/firebase.js';
import { collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

console.log('products-ui.js تم تحميله');

async function loadProducts() {
    try {
        const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        var products = [];
        snapshot.forEach(function(doc) {
            products.push({ id: doc.id, data: doc.data() });
        });
        return products;
    } catch(e) {
        console.error(e);
        return [];
    }
}

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

async function showProducts(container) {
    var products = await loadProducts();
    if (!products.length) {
        container.innerHTML = '<div style="padding: 40px; text-align: center;">لا توجد منتجات</div>';
        return;
    }
    var html = '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px;">';
    for (var i = 0; i < products.length; i++) {
        var p = products[i].data;
        html += '<div style="background: white; border-radius: 12px; padding: 15px;">';
        html += '<h4>' + escapeHtml(p.name) + '</h4>';
        html += '<div style="color: #e67e22;">' + formatCurrency(p.price) + '</div>';
        html += '<div>المخزون: ' + (p.stock || 0) + '</div>';
        html += '</div>';
    }
    html += '</div>';
    container.innerHTML = html;
}

export async function initProducts(container) {
    console.log('initProducts called');
    if (!container) return;
    container.innerHTML = '<div style="padding: 20px;"><h2>المنتجات</h2><div id="products-list" style="margin-top: 20px;"><div style="text-align: center;">جاري التحميل...</div></div></div>';
    var listDiv = document.getElementById('products-list');
    if (listDiv) await showProducts(listDiv);
}

export default { initProducts };
