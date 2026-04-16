// js/main.js
import { initOrdersDashboard } from './modules/orders.js';
import { initCustomers } from './modules/customers.js';

async function navigate() {
    const content = document.getElementById('main-content');
    if (!content) return;

    // قراءة القسم من الرابط أو التبديل يدوياً
    const hash = window.location.hash || '#orders';
    
    if (hash === '#customers') {
        await initCustomers(content);
    } else {
        await initOrdersDashboard(content);
    }
}

// الاستماع لتغيير القسم
window.addEventListener('hashchange', navigate);
window.addEventListener('load', navigate);
