/**
 * js/modules/products-ui.js
 * نسخة بسيطة ونظيفة - خالية من الأخطاء
 */

import { db } from '../core/firebase.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

console.log('products-ui.js تم تحميله');

export async function initProducts(container) {
    console.log('initProducts بدأت');
    
    if (!container) {
        console.error('container غير موجود');
        return;
    }
    
    container.innerHTML = '<div style="padding:20px"><h2>المنتجات</h2><div id="productsData">جاري التحميل...</div></div>';
    
    try {
        const snapshot = await getDocs(collection(db, "products"));
        const products = [];
        snapshot.forEach(function(doc) {
            products.push(doc.data());
        });
        
        var div = document.getElementById('productsData');
        
        if (products.length === 0) {
            div.innerHTML = '<p>لا توجد منتجات</p>';
            return;
        }
        
        var html = '<div style="display:grid;gap:15px;">';
        
        for (var i = 0; i < products.length; i++) {
            var p = products[i];
            html += '<div style="border:1px solid #ccc;padding:10px;border-radius:8px">';
            html += '<strong>' + (p.name || '') + '</strong><br>';
            html += 'السعر: ' + (p.price || 0) + ' ر.س<br>';
            html += 'المخزون: ' + (p.stock || 0);
            html += '</div>';
        }
        
        html += '</div>';
        div.innerHTML = html;
        
    } catch (error) {
        console.error('خطأ:', error);
        document.getElementById('productsData').innerHTML = '<p style="color:red">خطأ في التحميل</p>';
    }
}
