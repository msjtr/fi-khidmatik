/**
 * main.js - Tera Gateway 
 * نسخة مصححة لمعالجة خطأ innerHTML
 */

import { initCustomers } from './modules/customers-core.js';

const routes = {
    'dashboard': 'admin/modules/orders-dashboard.html',
    'customers': 'admin/modules/customers.html',
    'orders': 'admin/modules/order-form.html',
    'inventory': 'admin/modules/inventory.html',
    'invoice': 'admin/modules/invoice.html',
    'payments': 'admin/modules/payments.html',
    'settings': 'admin/modules/settings.html',
    'general': 'admin/modules/general.html',
    'backup': 'admin/modules/backup.html'
};

async function switchModule(moduleName) {
    const mainContent = document.getElementById('main-content');
    
    // حل مشكلة الـ null: التحقق من وجود العنصر أولاً
    if (!mainContent) {
        console.error("❌ خطأ: لم يتم العثور على عنصر 'main-content' في صفحة index.html");
        return;
    }

    const path = routes[moduleName];
    if (!path) return;

    try {
        const response = await fetch(path);
        if (!response.ok) throw new Error(`404: ${path}`);

        const html = await response.text();
        
        // الآن التعديل آمن
        mainContent.innerHTML = html;

        initializeModuleLogic(moduleName);
        window.location.hash = moduleName;
        
    } catch (error) {
        console.error("❌ خطأ في تحميل القسم:", error);
        mainContent.innerHTML = `<div style="color:red; padding:20px;">تعذر تحميل القسم: ${moduleName}</div>`;
    }
}

function initializeModuleLogic(moduleName) {
    // نستخدم setTimeout لضمان أن العناصر التي تم حقنها بـ innerHTML أصبحت جاهزة في الـ DOM
    setTimeout(() => {
        if (moduleName === 'customers') {
            const container = document.getElementById('customers-container') || document.getElementById('main-content');
            if (container) initCustomers(container);
        }
    }, 50);
}

function handleRoute() {
    const moduleName = window.location.hash.replace('#', '') || 'dashboard';
    switchModule(moduleName);
}

// تأكد من تشغيل الكود بعد تحميل الـ DOM بالكامل
document.addEventListener('DOMContentLoaded', () => {
    handleRoute();
    window.addEventListener('hashchange', handleRoute);
});

window.switchModule = switchModule;
