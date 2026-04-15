// js/main.js

// التعديل: التأكد من وجود .js في نهاية كل مسار لضمان عملها على المتصفح مباشرة
import { initOrdersDashboard } from './modules/orders.js';
import { initCustomers } from './modules/customers.js';
import { initProducts } from './modules/products.js';
import { initSettings } from './modules/settings.js';
import { initOrderForm } from './modules/order-form.js';

async function loadComponent(id, path) {
    try {
        // كسر الكاش لضمان تحميل التعديلات الجديدة فوراً
        const resp = await fetch(`${path}?v=${Date.now()}`); 
        if (!resp.ok) throw new Error(`HTTP 404: ${path}`);
        const container = document.getElementById(id);
        if (container) {
            container.innerHTML = await resp.text();
        }
    } catch (e) {
        console.error("Component Load Error:", e);
    }
}

async function init() {
    // تحميل المكونات الهيكلية أولاً
    await loadComponent('header-container', 'admin/components/header.html');
    await loadComponent('sidebar-container', 'admin/components/sidebar.html');
    
    // تحميل الموديل الافتراضي (لوحة الطلبات)
    await switchModule('orders-dashboard');

    // إعداد التنقل بين الأقسام
    document.addEventListener('click', async (e) => {
        const navItem = e.target.closest('.nav-item');
        if (navItem) {
            e.preventDefault(); // منع أي سلوك افتراضي للرابط
            document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
            navItem.classList.add('active');
            await switchModule(navItem.dataset.module);
        }
    });
}

async function switchModule(moduleName) {
    const main = document.getElementById('main-content');
    if (!main) return;
    
    // إظهار مؤشر تحميل بسيط أثناء التبديل
    main.innerHTML = '<div style="text-align:center; padding:50px;">جاري تحميل القسم...</div>';
    
    switch(moduleName) {
        case 'orders-dashboard': await initOrdersDashboard(main); break;
        case 'order-form': await initOrderForm(main); break;
        case 'customers': await initCustomers(main); break;
        case 'products': await initProducts(main); break;
        case 'settings': await initSettings(main); break;
        default: main.innerHTML = '<h2 style="text-align:center; padding:50px;">القسم قيد التطوير</h2>';
    }
}

// تشغيل النظام
init();
