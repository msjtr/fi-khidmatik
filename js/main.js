// js/main.js

import { initOrdersDashboard } from './modules/orders.js';
import { initCustomers } from './modules/customers.js';
import { initProducts } from './modules/products.js';
import { initSettings } from './modules/settings.js';
import { initOrderForm } from './modules/order-form.js';

// دالة لتحميل المكونات مع تجاوز التخزين المؤقت (Cache)
async function loadComponent(id, path) {
    try {
        // إضافة v=Date.now لمنع مشاكل الـ 404 الناتجة عن الكاش في GitHub
        const resp = await fetch(`${path}?v=${Date.now()}`);
        if (!resp.ok) throw new Error(`HTTP error! status: ${resp.status}`);
        const html = await resp.text();
        const container = document.getElementById(id);
        if (container) container.innerHTML = html;
    } catch (e) {
        console.error(`خطأ في تحميل المكون ${path}:`, e);
    }
}

async function init() {
    console.log("جاري تشغيل النظام...");

    // 1. تحميل المكونات الثابتة (الهيدر والسايدبار)
    await loadComponent('header-container', 'admin/components/header.html');
    await loadComponent('sidebar-container', 'admin/components/sidebar.html');
    
    // 2. تحميل الحاويات المشتركة (المودالات)
    loadComponent('modal-container', 'admin/components/modals.html');

    // 3. تحديث الوقت في الهيدر
    setInterval(() => {
        const now = new Date().toLocaleString('ar-EG');
        const timeEl = document.getElementById('current-datetime');
        if (timeEl) timeEl.innerText = now;
    }, 1000);

    // 4. تحميل الموديل الافتراضي عند الفتح
    await switchModule('orders-dashboard');

    // 5. مراقب الأحداث للقائمة الجانبية (Navigation)
    document.addEventListener('click', async (e) => {
        const navItem = e.target.closest('.nav-item');
        if (navItem && navItem.dataset.module) {
            // تحديث الشكل النشط في القائمة
            document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
            navItem.classList.add('active');
            
            // تغيير المحتوى
            await switchModule(navItem.dataset.module);
        }
    });
}

async function switchModule(moduleName) {
    const main = document.getElementById('main-content');
    if (!main) return;

    // تنظيف المحتوى الحالي وإظهار رسالة تحميل بسيطة
    main.innerHTML = '<div style="padding:20px;">جاري التحميل...</div>';
    
    try {
        switch(moduleName) {
            case 'orders-dashboard': 
                await initOrdersDashboard(main); 
                break;
            case 'order-form': 
                await initOrderForm(main); 
                break;
            case 'customers': 
                await initCustomers(main); 
                break;
            case 'products': 
                await initProducts(main); 
                break;
            case 'settings': 
                await initSettings(main); 
                break;
            default: 
                main.innerHTML = '<h2 style="padding:20px;">الموديل غير موجود</h2>';
        }
    } catch (error) {
        console.error(`خطأ أثناء تحميل الموديل ${moduleName}:`, error);
        main.innerHTML = `<div style="color:red; padding:20px;">خطأ في تحميل القسم: ${error.message}</div>`;
    }
}

// تشغيل التطبيق
init();
