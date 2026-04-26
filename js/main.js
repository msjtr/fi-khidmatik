/**
 * main.js - Fi-Khidmatik Core System
 * تم إصلاح المسارات وجسر التواصل البرمجي
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

let activeModuleInstance = null;

async function switchModule(moduleName) {
    const container = document.getElementById('module-container');
    if (!container) return;

    const path = routes[moduleName];
    if (!path) return;

    try {
        // تنظيف الحاوية لمنع تداخل البيانات
        container.innerHTML = '<div style="text-align:center; padding:100px;"><i class="fas fa-spinner fa-spin fa-2x"></i></div>';

        const response = await fetch(`${path}?v=${Date.now()}`);
        if (!response.ok) throw new Error('404');
        
        const html = await response.text();
        container.innerHTML = html;

        // تحديث حالة الروابط في القائمة الجانبية
        updateSidebarUI(moduleName);

        // تحميل الملفات المساعدة بناءً على القسم
        if (moduleName === 'customers') {
            await loadCustomersModule(container);
        }

    } catch (error) {
        console.error("Navigation Error:", error);
    }
}

async function loadCustomersModule(container) {
    // 1. تصحيح مسار CSS (المسار الصحيح هو css/ وليس js/modules/)
    const styleId = 'module-customers-style';
    if (!document.getElementById(styleId)) {
        const link = document.createElement('link');
        link.id = styleId;
        link.rel = 'stylesheet';
        link.href = `css/customers.css?v=${Date.now()}`;
        document.head.appendChild(link);
    }

    // 2. تحميل الموديول البرمجي من js/modules/
    try {
        const modulePath = `./modules/customers-ui.js?v=${Date.now()}`;
        const module = await import(modulePath);
        
        if (module && module.initCustomersUI) {
            setTimeout(() => {
                const target = document.getElementById('customers-module-container') || container;
                activeModuleInstance = module.initCustomersUI(target);
                
                // ربط الأزرار الخارجية (مثل "إضافة عميل") بالموديول
                setupCustomerBridge(module);
            }, 100);
        }
    } catch (err) {
        console.error("Failed to load customer script:", err);
    }
}

/**
 * جسر التواصل لضمان عمل أزرار onclick في HTML
 */
function setupCustomerBridge(module) {
    window.saveCustomer = module.saveCustomer || null;
    window.closeCustomerModal = module.closeCustomerModal || null;
    window.openAddCustomer = module.openAddCustomer || null;
    window.deleteCustomer = module.deleteCustomer || null;
}

function updateSidebarUI(activeModule) {
    document.querySelectorAll('.sidebar-nav a').forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${activeModule}`);
    });
}

function handleRoute() {
    const hash = window.location.hash.replace('#', '') || 'dashboard';
    switchModule(hash);
}

window.addEventListener('load', handleRoute);
window.addEventListener('hashchange', handleRoute);
window.switchModule = switchModule;
