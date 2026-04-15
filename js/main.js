// js/main.js

import { initOrdersDashboard } from './modules/orders.js';
import { initCustomers } from './modules/customers.js';
import { initProducts } from './modules/products.js';
import { initSettings } from './modules/settings.js';
import { initOrderForm } from './modules/order-form.js';

async function loadComponent(id, path) {
    try {
        const resp = await fetch(`${path}?v=${Date.now()}`); // كسر الكاش لضمان التحديث
        if (!resp.ok) throw new Error(`HTTP 404: ${path}`);
        document.getElementById(id).innerHTML = await resp.text();
    } catch (e) {
        console.error("Component Load Error:", e);
    }
}

async function init() {
    await loadComponent('header-container', 'admin/components/header.html');
    await loadComponent('sidebar-container', 'admin/components/sidebar.html');
    
    // تحميل الموديل الافتراضي
    await switchModule('orders-dashboard');

    document.addEventListener('click', async (e) => {
        const navItem = e.target.closest('.nav-item');
        if (navItem) {
            document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
            navItem.classList.add('active');
            await switchModule(navItem.dataset.module);
        }
    });
}

async function switchModule(moduleName) {
    const main = document.getElementById('main-content');
    if (!main) return;
    
    switch(moduleName) {
        case 'orders-dashboard': await initOrdersDashboard(main); break;
        case 'order-form': await initOrderForm(main); break;
        case 'customers': await initCustomers(main); break;
        case 'products': await initProducts(main); break;
        case 'settings': await initSettings(main); break;
        default: main.innerHTML = '<h2>قيد التطوير</h2>';
    }
}

init();
