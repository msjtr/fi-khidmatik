/**
 * main.js - Fi-Khidmatik Core
 * المحرك الرئيسي لإدارة التنقل وتحميل الأقسام برمجياً
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

/**
 * دالة تبديل الأقسام (Module Switcher)
 */
async function switchModule(moduleName) {
    const container = document.getElementById('module-container');
    if (!container) return;

    const path = routes[moduleName];
    if (!path) return;

    try {
        // 1. إظهار مؤشر التحميل
        container.innerHTML = `
            <div style="text-align:center; padding:100px;">
                <i class="fas fa-spinner fa-spin fa-2x" style="color:#2563eb;"></i>
            </div>`;

        // 2. تحديث الحالة في القائمة الجانبية
        updateSidebarUI(moduleName);

        // 3. جلب الـ HTML (استخدام مسار كامل بالنسبة للجذر لتجنب 404)
        const response = await fetch(`${path}?v=${Date.now()}`);
        if (!response.ok) throw new Error(`Could not load ${path}`);
        
        const html = await response.text();
        container.innerHTML = html;

        // 4. تحميل موديول العملاء إذا تم اختياره
        if (moduleName === 'customers') {
            await loadCustomersModule(container);
        }

    } catch (error) {
        console.error("Navigation Error:", error);
        container.innerHTML = `<div style="padding:20px; color:red; text-align:center;">تعذر تحميل القسم: ${moduleName}</div>`;
    }
}

/**
 * تحميل موديول العملاء (JS + CSS)
 */
async function loadCustomersModule(container) {
    // تحميل التنسيق
    const styleId = 'module-customers-style';
    if (!document.getElementById(styleId)) {
        const link = document.createElement('link');
        link.id = styleId;
        link.rel = 'stylesheet';
        link.href = `css/customers.css?v=${Date.now()}`; 
        document.head.appendChild(link);
    }

    try {
        // تصحيح المسار: استخدام ./js/modules/ بدلاً من ./modules/
        const modulePath = `./js/modules/customers-ui.js?v=${Date.now()}`;
        const module = await import(modulePath);
        
        if (module && module.initCustomersUI) {
            // انتظار بسيط للتأكد من حقن الـ HTML في الـ DOM
            setTimeout(async () => {
                // البحث عن الحاوية المخصصة داخل ملف customers.html أو استخدام الحاوية الرئيسية
                const target = document.getElementById('customers-module-container') || container;
                await module.initCustomersUI(target);
            }, 50);
        }
    } catch (err) {
        console.error("Failed to load customer module script:", err);
    }
}

/**
 * تحديث واجهة القائمة الجانبية
 */
function updateSidebarUI(activeModule) {
    document.querySelectorAll('.sidebar-nav a').forEach(link => {
        const href = link.getAttribute('href');
        if (href) {
            link.classList.toggle('active', href === `#${activeModule}`);
        }
    });
}

/**
 * معالج الروابط (Router)
 */
function handleRoute() {
    const hash = window.location.hash.replace('#', '') || 'dashboard';
    switchModule(hash);
}

// تشغيل النظام
window.addEventListener('load', handleRoute);
window.addEventListener('hashchange', handleRoute);

// إتاحة الدالة عالمياً
window.switchModule = switchModule;
