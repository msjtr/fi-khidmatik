// js/main.js
import { initOrdersDashboard } from './modules/orders.js';
import { initCustomers } from './modules/customers.js';

async function loadComponent(id, path) {
    const container = document.getElementById(id);
    if (!container) return;
    try {
        const response = await fetch(`${path}?v=${Date.now()}`);
        if (!response.ok) throw new Error("404");
        container.innerHTML = await response.text();
    } catch (err) {
        console.error(`خطأ في تحميل المكون: ${path}`);
    }
}

async function switchModule(moduleName) {
    const main = document.getElementById('main-content');
    if (!main) return;

    // تفعيل حالة "النشط" في القائمة الجانبية
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('href') === `#${moduleName}`) item.classList.add('active');
    });

    // تحميل الموديول المطلوب
    if (moduleName === 'customers') {
        await initCustomers(main);
    } else {
        await initOrdersDashboard(main); // الافتراضي هو الطلبات
    }
}

// البدء عند تحميل الصفحة
(async () => {
    // تحميل الهيدر والسايدبار من مجلد admin/components
    await loadComponent('header-container', 'admin/components/header.html');
    await loadComponent('sidebar-container', 'admin/components/sidebar.html');

    // تشغيل نظام التنقل (Hash Router)
    const startModule = window.location.hash.replace('#', '') || 'orders';
    await switchModule(startModule);

    window.addEventListener('hashchange', () => {
        const m = window.location.hash.replace('#', '') || 'orders';
        switchModule(m);
    });
})();
