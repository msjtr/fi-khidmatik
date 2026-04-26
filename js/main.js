/**
 * main.js - Fi-Khidmatik Core
 * تم تحديث المسار الصحيح للتنسيقات: css/customers.css
 */

const routes = {
    'dashboard': 'admin/modules/orders-dashboard.html',
    'customers': 'admin/modules/customers.html',
    'orders':    'admin/modules/order-form.html',
    'products':  'admin/modules/products.html',
    'inventory': 'admin/modules/inventory.html',
    'payments':  'admin/modules/payments.html',
    'invoice':   'admin/modules/invoice.html',
    'settings':  'admin/modules/settings.html',
    'backup':    'admin/modules/backup.html',
    'general':   'admin/modules/general.html'
};

async function switchModule(moduleName) {
    const container = document.getElementById('module-container');
    if (!container) return;

    const path = routes[moduleName];
    if (!path) return;

    try {
        // 1. تنظيف الحاوية تماماً لمنع تداخل الصفحات (حل مشكلة ظهور العملاء في الرئيسية)
        container.innerHTML = `<div style="text-align:center; padding:100px;"><i class="fas fa-spinner fa-spin fa-2x" style="color:#2563eb;"></i></div>`;

        // 2. تحديث روابط القائمة الجانبية
        document.querySelectorAll('.sidebar-nav a').forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${moduleName}`);
        });

        // 3. تحميل محتوى الـ HTML
        const response = await fetch(`${path}?v=${Date.now()}`);
        if (!response.ok) throw new Error(`404: ${path}`);
        
        const html = await response.text();
        container.innerHTML = html;

        // 4. معالجة موديول العملاء لضمان ظهور كافة العناصر
        if (moduleName === 'customers') {
            await initializeCustomers(container);
        }

    } catch (error) {
        console.error("Navigation Error:", error);
    }
}

async function initializeCustomers(container) {
    // المسار المؤكد: css/customers.css
    const styleId = 'module-customers-style';
    if (!document.getElementById(styleId)) {
        const link = document.createElement('link');
        link.id = styleId;
        link.rel = 'stylesheet';
        link.href = `css/customers.css?v=${Date.now()}`;
        document.head.appendChild(link);
    }

    try {
        // تحميل السكربت المسؤول عن البيانات من مجلد modules
        const modulePath = `./modules/customers-ui.js?v=${Date.now()}`;
        const module = await import(modulePath);
        
        if (module && module.initCustomersUI) {
            // ننتظر لحظة لضمان استقرار العناصر في الصفحة
            setTimeout(() => {
                const target = document.getElementById('customers-module-container') || container;
                module.initCustomersUI(target);
            }, 100);
        }
    } catch (err) {
        console.warn("تعذر تحميل موديول البيانات الخاص بالعملاء.");
    }
}

// تشغيل النظام ومراقبة الروابط
function handleRoute() {
    const hash = window.location.hash.replace('#', '') || 'dashboard';
    switchModule(hash);
}

window.addEventListener('load', handleRoute);
window.addEventListener('hashchange', handleRoute);
window.switchModule = switchModule;
