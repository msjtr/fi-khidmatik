/**
 * المحرك الرئيسي - Tera Gateway 
 * المسار: js/main.js
 */

import { initProducts } from './modules/products.js';
import { initCustomers } from './modules/customers.js';

async function switchModule(moduleName) {
    const container = document.getElementById('module-container');
    const loader = document.getElementById('loader');

    if (!container) return;

    // 1. تحديث شكل القائمة الجانبية
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-module') === moduleName) {
            item.classList.add('active');
        }
    });

    // 2. إظهار مؤشر التحميل
    if (loader) loader.style.display = 'block';
    
    try {
        // تفريغ الحاوية قبل التحميل الجديد
        container.innerHTML = '';

        switch (moduleName) {
            case 'products':
                await initProducts(container);
                break;
            case 'customers':
                await initCustomers(container);
                break;
            case 'dashboard':
            case 'orders':
                container.innerHTML = `<div style="padding:40px;"><h2>قسم الطلبات</h2><p>جاري الربط مع قاعدة البيانات...</p></div>`;
                break;
            default:
                container.innerHTML = `<div style="padding:40px;"><h2>الرئيسية</h2><p>مرحباً بك في نظام تيرا</p></div>`;
        }
    } catch (error) {
        console.error("حدث خطأ في تحميل القسم:", error);
        container.innerHTML = `<div style="padding:40px; color:red;">خطأ تقني: ${error.message}</div>`;
    } finally {
        if (loader) setTimeout(() => { loader.style.display = 'none'; }, 300);
    }
}

// تصدير الدالة للنطاق العام لتعمل مع onclick في admin.html
window.switchModule = switchModule;

// التشغيل التلقائي بناءً على الرابط
window.addEventListener('DOMContentLoaded', () => {
    const currentHash = window.location.hash.replace('#', '') || 'dashboard';
    switchModule(currentHash);
});

window.addEventListener('hashchange', () => {
    const newHash = window.location.hash.replace('#', '') || 'dashboard';
    switchModule(newHash);
});
