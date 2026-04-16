// js/main.js
import { initOrdersDashboard } from './modules/orders.js';
import { initCustomers } from './modules/customers.js';

async function loadComponent(id, path) {
    try {
        // إضافة ./ في البداية لضمان المسار النسبي الصحيح
        const resp = await fetch(`./${path}?v=${Date.now()}`); 
        if (!resp.ok) {
            console.warn(`تنبيه: تعذر تحميل المكون من ${path} (خطأ 404). تأكد من وجود الملف في مجلد admin/components/`);
            return;
        }
        const container = document.getElementById(id);
        if (container) {
            container.innerHTML = await resp.text();
        }
    } catch (e) {
        console.error("خطأ في تحميل المكون:", e);
    }
}

async function switchModule(moduleName) {
    const main = document.getElementById('main-content');
    if (!main) return;
    
    main.innerHTML = '<div style="text-align:center; padding:50px;">جاري تحميل القسم...</div>';
    
    try {
        if (moduleName === 'orders-dashboard' || moduleName === 'orders') {
            await initOrdersDashboard(main);
        } else if (moduleName === 'customers') {
            await initCustomers(main);
        } else {
            main.innerHTML = '<h2 style="text-align:center; padding:50px;">القسم قيد التطوير</h2>';
        }
    } catch (err) {
        console.error("خطأ أثناء تبديل القسم:", err);
        main.innerHTML = `<div style="color:red; text-align:center; padding:50px;">فشل تحميل القسم. راجع الكونسول.</div>`;
    }
}

// تشغيل النظام
async function init() {
    // تحميل الهيدر والسايدبار - تأكد من مطابقة هذه المسارات لمجلداتك في GitHub
    await loadComponent('header-container', 'admin/components/header.html');
    await loadComponent('sidebar-container', 'admin/components/sidebar.html');
    
    // تحميل القسم الافتراضي
    await switchModule('orders-dashboard');

    // إعداد التنقل
    window.addEventListener('hashchange', () => {
        const module = window.location.hash.replace('#', '') || 'orders-dashboard';
        switchModule(module);
    });
}

init();
