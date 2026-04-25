/**
 * main.js - Tera Gateway 
 * الموزع الرئيسي للنظام
 */

// استيراد الموديول المحدث بالاسم الصحيح
import { initCustomersUI } from './modules/customers-ui.js';

const routes = {
    'dashboard': 'admin/modules/orders-dashboard.html',
    'customers': 'admin/modules/customers.html',
    'orders': 'admin/modules/order-form.html',
    'products': 'admin/modules/products.html',
    'settings': 'admin/modules/settings.html',
    'reports': 'admin/modules/reports.html'
};

async function switchModule(moduleName) {
    const container = document.getElementById('module-container');
    
    if (!container) {
        setTimeout(() => switchModule(moduleName), 100);
        return;
    }

    const path = routes[moduleName];
    if (!path) return;

    try {
        const response = await fetch(path);
        if (!response.ok) throw new Error(`404: ${path}`);
        const html = await response.text();
        
        container.innerHTML = html;

        // تشغيل المنطق البرمجي بناءً على اسم الموديول
        if (moduleName === 'customers') {
            // ننتظر قليلاً لضمان حقن الـ HTML في المتصفح
            setTimeout(() => {
                const uiRoot = document.getElementById('customers-ui-root') || container;
                initCustomersUI(uiRoot);
            }, 50);
        }

    } catch (error) {
        console.error("❌ خطأ في التنقل:", error);
    }
}

function handleRoute() {
    const moduleName = window.location.hash.replace('#', '') || 'dashboard';
    switchModule(moduleName);
}

window.addEventListener('load', handleRoute);
window.addEventListener('hashchange', handleRoute);

window.switchModule = switchModule;
