/**
 * main.js - Fi-Khidmatik Unified Core
 * تم إصلاح تعطل الأزرار (إضافة، تعديل، حذف) ومسارات الـ CSS
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

// حاوية لتخزين الموديولات النشطة لتسهيل الوصول للأزرار
let activeModuleInstance = null;

async function switchModule(moduleName) {
    const container = document.getElementById('module-container');
    if (!container) return;

    const path = routes[moduleName];
    if (!path) return;

    try {
        // تنظيف الحاوية لمنع التداخل بين الأقسام
        container.innerHTML = `<div style="text-align:center; padding:100px;"><i class="fas fa-spinner fa-spin fa-2x" style="color:#2563eb;"></i></div>`;

        const response = await fetch(`${path}?v=${Date.now()}`);
        if (!response.ok) throw new Error(`404: ${path}`);
        
        const html = await response.text();
        container.innerHTML = html;

        // إعادة ضبط الموديول النشط
        activeModuleInstance = null;

        // تحميل ملفات التنسيق والسكربتات الخاصة بكل قسم
        if (moduleName === 'customers') {
            loadCustomersModule(container);
        }

    } catch (error) {
        console.error("Navigation Error:", error);
    }
}

async function loadCustomersModule(container) {
    // إصلاح مسار CSS ليعمل من مجلد css/ الرئيسي
    const styleId = 'module-customers-style';
    if (!document.getElementById(styleId)) {
        const link = document.createElement('link');
        link.id = styleId;
        link.rel = 'stylesheet';
        link.href = `css/customers.css?v=${Date.now()}`;
        document.head.appendChild(link);
    }

    try {
        // تحميل موديول الـ UI من المسار الصحيح js/modules/
        const module = await import(`./modules/customers-ui.js?v=${Date.now()}`);
        if (module && module.initCustomersUI) {
            setTimeout(() => {
                const target = document.getElementById('customers-module-container') || container;
                activeModuleInstance = module.initCustomersUI(target);
                
                // ربط الأزرار العالمية (إذا كانت خارج الحاوية)
                setupCustomerBridge(module);
            }, 100);
        }
    } catch (err) {
        console.error("Failed to load customer script:", err);
    }
}

/**
 * جسر تواصل لضمان عمل أزرار الإضافة والتعديل والحفظ
 */
function setupCustomerBridge(module) {
    // جعل دوال الموديول متاحة لـ window لتعمل أزرار onclick
    window.saveCustomer = module.saveCustomer || null;
    window.closeCustomerModal = module.closeCustomerModal || null;
    window.openAddCustomer = module.openAddCustomer || null;
    window.deleteCustomer = module.deleteCustomer || null;
}

function handleRoute() {
    const hash = window.location.hash.replace('#', '') || 'dashboard';
    switchModule(hash);
}

window.addEventListener('load', handleRoute);
window.addEventListener('hashchange', handleRoute);
window.switchModule = switchModule;
