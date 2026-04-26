/**
 * main.js - Tera Gateway 
 * تم إضافة Cache Buster لضمان تجاوز أخطاء الـ 404 القديمة
 */

import { APP_CONFIG } from './core/firebase.js';

const routes = {
    'dashboard': 'admin/modules/orders-dashboard.html',
    'customers': 'admin/modules/customers.html',
    'orders':    'admin/modules/order-form.html',
    'products':  'admin/modules/products.html',
    'settings':  'admin/modules/settings.html',
    'reports':   'admin/modules/reports.html'
};

async function switchModule(moduleName) {
    const container = document.getElementById('module-container');
    if (!container) return;

    const path = routes[moduleName];
    if (!path) return;

    try {
        container.innerHTML = `<div style="text-align:center; padding:100px; color:#2563eb;"><i class="fas fa-spinner fa-spin fa-2x"></i></div>`;

        // إضافة تايق زمني لمنع المتصفح من استخدام النسخة القديمة
        const response = await fetch(`${path}?v=${Date.now()}`);
        if (!response.ok) throw new Error(`404`);
        
        const html = await response.text();
        container.innerHTML = html;

        if (moduleName === 'customers') {
            // السطر 31: الربط المباشر بملف التنسيق في المجلد الصحيح css/
            const styleId = 'module-customers-style';
            if (!document.getElementById(styleId)) {
                const link = document.createElement('link');
                link.id = styleId;
                link.rel = 'stylesheet';
                link.href = `css/customers.css?v=${Date.now()}`; 
                document.head.appendChild(link);
            }

            // تحميل الموديول مع كاسر التخزين المؤقت
            const modulePath = `./modules/customers-ui.js?v=${Date.now()}`;
            const module = await import(modulePath);
            
            if (module && module.initCustomersUI) {
                setTimeout(() => {
                    const contentDiv = document.getElementById('customers-module-content') || container;
                    module.initCustomersUI(contentDiv);
                }, 50);
            }
        }

    } catch (error) {
        console.error("Navigation Error:", error);
    }
}

function handleRoute() {
    const hash = window.location.hash.replace('#', '') || 'dashboard';
    switchModule(hash);
}

window.addEventListener('load', handleRoute);
window.addEventListener('hashchange', handleRoute);
window.switchModule = switchModule;
