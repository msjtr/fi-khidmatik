import { initOrdersDashboard } from './modules/orders.js';
import { initCustomers } from './modules/customers.js';
import { initProducts } from './modules/products.js';
import { initSettings } from './modules/settings.js';
import { initOrderForm } from './modules/order-form.js';

async function loadComponent(id, path) {
    try {
        const resp = await fetch(path);
        if (!resp.ok) throw new Error(`HTTP error! status: ${resp.status}`);
        document.getElementById(id).innerHTML = await resp.text();
    } catch (e) {
        console.error(`خطأ في تحميل المكون ${path}:`, e);
    }
}

async function init() {
    // تحميل المكونات الثابتة
    await loadComponent('header-container', 'admin/components/header.html');
    await loadComponent('sidebar-container', 'admin/components/sidebar.html');
    
    // تحميل المودال
    fetch('admin/components/modals.html')
        .then(r => r.text())
        .then(html => document.getElementById('modal-container').innerHTML = html)
        .catch(err => console.error("خطأ في تحميل المودال:", err));

    // تحديث الوقت
    setInterval(() => {
        const now = new Date().toLocaleString('ar-EG');
        const timeEl = document.getElementById('current-datetime');
        if(timeEl) timeEl.innerText = now;
    }, 1000);

    // تحميل الموديل الافتراضي
    await switchModule('orders-dashboard');

    // تفعيل التنقل بين الأقسام
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
        default: main.innerHTML = '<h2 style="padding:20px;">قيد التطوير</h2>';
    }
}

init();
