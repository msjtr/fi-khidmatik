// js/main.js

import { initOrdersDashboard } from './modules/orders.js';
import { initCustomers } from './modules/customers.js';
import { initProducts } from './modules/products.js'; // الموديول الجديد
// import { initSettings } from './modules/settings.js'; // فعله عند اكتمال ملف الإعدادات

/**
 * المحرك الرئيسي لمنصة تيرا جيتواي - Tera Gateway
 */

async function loadComponent(id, path) {
    const container = document.getElementById(id);
    if (!container) return;
    try {
        // إضافة Query String لمنع التخزين المؤقت (Cache) أثناء التطوير
        const response = await fetch(`${path}?v=${Date.now()}`);
        if (!response.ok) throw new Error(`تعذر تحميل المكون: ${path}`);
        container.innerHTML = await response.text();
    } catch (err) {
        console.error(err);
        container.innerHTML = `<div style="padding:10px; color:red;">خطأ في تحميل ${path}</div>`;
    }
}

async function switchModule(moduleName) {
    const main = document.getElementById('main-content');
    if (!main) return;

    // 1. تحديث الحالة البصرية في القائمة الجانبية (Sidebar)
    document.querySelectorAll('.sidebar-nav a').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${moduleName}`) {
            link.classList.add('active');
        }
    });

    // 2. تصفير محتوى الصفحة وعرض مؤشر تحميل بسيط
    main.innerHTML = '<div style="text-align:center; padding:50px;"><i class="fas fa-circle-notch fa-spin fa-2x" style="color:#3498db;"></i></div>';

    // 3. توجيه المسارات (Router Logic)
    try {
        switch (moduleName) {
            case 'customers':
                await initCustomers(main);
                break;
            case 'products':
                await initProducts(main);
                break;
            case 'settings':
                // await initSettings(main); // تأكد من استيرادها بالأعلى عند الجاهزية
                main.innerHTML = '<h2 style="padding:20px;">إعدادات النظام (قيد التطوير)</h2>';
                break;
            case 'orders':
            default:
                await initOrdersDashboard(main);
                break;
        }
    } catch (error) {
        console.error(`خطأ أثناء تشغيل الموديول ${moduleName}:`, error);
        main.innerHTML = `<div style="padding:20px; color:red;">حدث خطأ أثناء تحميل القسم، يرجى مراجعة الـ Console.</div>`;
    }
}

// تشغيل النظام عند تحميل الصفحة بالكامل
(async () => {
    // تحميل الأجزاء الثابتة (Header & Sidebar)
    // تأكد من صحة المسارات في GitHub Pages
    await Promise.all([
        loadComponent('header-container', './admin/components/header.html'),
        loadComponent('sidebar-container', './admin/components/sidebar.html')
    ]);

    // معالجة المسار الأولي (Hash Routing)
    const getHash = () => window.location.hash.replace('#', '') || 'orders';
    
    // تشغيل الموديول الأول
    await switchModule(getHash());

    // مراقبة التغيير في الروابط (Hash Change)
    window.addEventListener('hashchange', async () => {
        await switchModule(getHash());
    });
})();
