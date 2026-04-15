import { initOrdersDashboard } from './modules/orders.js';
import { initCustomers } from './modules/customers.js';
import { initProducts } from './modules/products.js';
import { initSettings } from './modules/settings.js';
import { initOrderForm } from './modules/order-form.js';

async function loadComponent(id, path) {
    const resp = await fetch(path);
    document.getElementById(id).innerHTML = await resp.text();
}

async function init() {
    await loadComponent('header-container', 'admin/components/header.html');
    await loadComponent('sidebar-container', 'admin/components/sidebar.html');
    await fetch('admin/components/modals.html').then(r=>r.text()).then(html=>document.getElementById('modal-container').innerHTML = html);
    
    setInterval(() => {
        const now = new Date().toLocaleString('ar-EG');
        if(document.getElementById('current-datetime')) document.getElementById('current-datetime').innerText = now;
    }, 1000);
    
    await switchModule('orders-dashboard');
    
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', async (e) => {
            document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            await switchModule(item.dataset.module);
        });
    });
}

async function switchModule(moduleName) {
    const main = document.getElementById('main-content');
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
