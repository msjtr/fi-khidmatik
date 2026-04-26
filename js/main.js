/**
 * main.js - Tera Gateway 
 * إصلاح تداخل الصفحات وتعطل الروابط
 */

const routes = {
    'dashboard': 'admin/modules/orders-dashboard.html',
    'customers': 'admin/modules/customers.html',
    'orders':    'admin/modules/order-form.html',
    'products':  'admin/modules/products.html',
    'settings':  'admin/modules/settings.html',
    'reports':   'admin/modules/reports.html'
};

async function switchModule(moduleName) {
    const container = document.getElementById('module-container');
    if (!container) return;

    const path = routes[moduleName];
    if (!path) return;

    try {
        // 1. إفراغ الحاوية تماماً قبل تحميل أي محتوى جديد لمنع التداخل
        container.innerHTML = `<div style="text-align:center; padding:100px; color:#2563eb;"><i class="fas fa-spinner fa-spin fa-2x"></i></div>`;

        // 2. تحديث كلاس "Active" في القائمة الجانبية ليعرف المستخدم أين هو
        document.querySelectorAll('.sidebar-nav a').forEach(link => {
            link.classList.remove('active');
            if(link.getAttribute('href') === `#${moduleName}`) {
                link.classList.add('active');
            }
        });

        // 3. تحميل الملف الجديد مع كاسر التخزين المؤقت
        const response = await fetch(`${path}?v=${Date.now()}`);
        if (!response.ok) throw new Error(`Failed to load ${moduleName}`);
        
        const html = await response.text();
        container.innerHTML = html;

        // 4. تشغيل ملفات الـ JS الخاصة بكل موديول عند تحميله
        if (moduleName === 'customers') {
            loadCustomerModule(container);
        }

    } catch (error) {
        console.error("Navigation Error:", error);
        container.innerHTML = `<div style="padding:20px; color:red;">خطأ في تحميل الصفحة.. يرجى المحاولة مرة أخرى.</div>`;
    }
}

async function loadCustomerModule(container) {
    // تحميل التنسيق برمجياً إذا لم يكن موجوداً
    if (!document.getElementById('module-customers-style')) {
        const link = document.createElement('link');
        link.id = 'module-customers-style';
        link.rel = 'stylesheet';
        link.href = `css/customers.css?v=${Date.now()}`;
        document.head.appendChild(link);
    }

    // استيراد الموديول وتشغيله
    try {
        const module = await import(`./modules/customers-ui.js?v=${Date.now()}`);
        if (module && module.initCustomersUI) {
            // ننتظر قليلاً لضمان أن DOM الـ HTML الجديد أصبح جاهزاً
            setTimeout(() => {
                const target = document.getElementById('customers-module-container') || container;
                module.initCustomersUI(target);
            }, 100);
        }
    } catch (err) {
        console.error("Module Loading Error:", err);
    }
}

// معالجة الروابط
function handleRoute() {
    const hash = window.location.hash.replace('#', '') || 'dashboard';
    switchModule(hash);
}

// استماع للأحداث لضمان عمل الأزرار عند الضغط
window.addEventListener('load', handleRoute);
window.addEventListener('hashchange', handleRoute);

// جعل الدالة متاحة للأزرار التي تستخدم onclick
window.switchModule = switchModule;
