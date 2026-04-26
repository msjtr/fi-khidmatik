/**
 * main.js - Tera Gateway 
 * تم تصحيح مسارات CSS لتعمل على GitHub Pages
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

        const response = await fetch(path);
        if (!response.ok) throw new Error(`404`);
        
        const html = await response.text();
        container.innerHTML = html;

        // --- السطر 51: معالجة التنسيق بالمسار الصحيح الذي حددته ---
        if (moduleName === 'customers') {
            const stylePath = 'css/customers.css'; // تم التغيير من js/modules إلى css/
            
            // التأكد من عدم تكرار الربط
            if (!document.querySelector(`link[href="${stylePath}"]`)) {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = stylePath; 
                document.head.appendChild(link);
            }

            // تحميل كود الجافا سكريبت للموديول
            const { initCustomersUI } = await import('./modules/customers-ui.js');
            setTimeout(() => {
                const contentDiv = document.getElementById('customers-module-content') || container;
                initCustomersUI(contentDiv);
            }, 50);
        }

    } catch (error) {
        console.error("Navigation Error:", error);
    }
}

function handleRoute() {
    const hash = window.location.hash.replace('#', '') || 'dashboard';
    switchModule(hash);
    updateActiveSidebarItem(hash);
}

function updateActiveSidebarItem(activeHash) {
    document.querySelectorAll('.nav-link, .nav-item').forEach(item => {
        const module = item.getAttribute('data-module') || (item.getAttribute('href') && item.getAttribute('href').replace('#', ''));
        if (module === activeHash) item.classList.add('active');
        else item.classList.remove('active');
    });
}

window.addEventListener('load', handleRoute);
window.addEventListener('hashchange', handleRoute);
window.switchModule = switchModule;
