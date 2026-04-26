/**
 * main.js - Fi-Khidmatik Core
 * نظام التوجيه الموحد مع تفعيل تلقائي للأزرار
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
        // 1. تنظيف الحاوية وإظهار مؤشر التحميل
        container.innerHTML = `
            <div style="text-align:center; padding:100px;">
                <i class="fas fa-spinner fa-spin fa-2x" style="color:#2563eb;"></i>
            </div>`;

        // 2. جلب المحتوى
        const response = await fetch(`${path}?v=${Date.now()}`);
        if (!response.ok) throw new Error(`404: ${path}`);
        
        const html = await response.text();
        container.innerHTML = html;

        // --- الخطوة الأهم: ربط الأزرار فور حقن الـ HTML ---
        bindGlobalEvents();

        // 3. معالجة موديول العملاء بشكل خاص (تحميل الـ JS الخاص به)
        if (moduleName === 'customers') {
            handleCustomersLoading(container);
        }

        // 4. تحديث واجهة القائمة الجانبية
        updateSidebarUI(moduleName);

    } catch (error) {
        console.error("Navigation Error:", error);
        container.innerHTML = `<div style="padding:20px; color:red;">خطأ في تحميل الصفحة: ${moduleName}</div>`;
    }
}

/**
 * دالة ربط الأحداث لجميع الأزرار (إغلاق، حفظ، تعديل)
 */
function bindGlobalEvents() {
    // أزرار الإغلاق (للمودالات)
    document.querySelectorAll('[data-bs-dismiss="modal"], .btn-close, .close-btn').forEach(btn => {
        btn.onclick = (e) => {
            e.preventDefault();
            const modal = btn.closest('.modal') || btn.closest('.glass-modal') || document.querySelector('.modal');
            if (modal) modal.style.display = 'none';
        };
    });

    // أزرار الفتح (للمودالات) - تبحث عن زر يحمل data-target
    document.querySelectorAll('[data-action="open-modal"]').forEach(btn => {
        btn.onclick = () => {
            const modalId = btn.dataset.target;
            const modal = document.getElementById(modalId);
            if (modal) modal.style.display = 'flex';
        };
    });

    // أزرار الحفظ
    document.querySelectorAll('.btn-save, #saveChanges').forEach(btn => {
        btn.onclick = (e) => {
            e.preventDefault();
            console.log("Saving...");
            if (window.saveData) window.saveData(e);
        };
    });

    // أزرار التعديل
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.onclick = (e) => {
            e.preventDefault();
            const id = btn.dataset.id || btn.closest('tr')?.dataset.id;
            if (window.editItem) window.editItem(id);
        };
    });
}

async function handleCustomersLoading(container) {
    const styleId = 'module-customers-style';
    if (!document.getElementById(styleId)) {
        const link = document.createElement('link');
        link.id = styleId;
        link.rel = 'stylesheet';
        link.href = `css/customers.css?v=${Date.now()}`;
        document.head.appendChild(link);
    }

    try {
        const modulePath = `./modules/customers-ui.js?v=${Date.now()}`;
        const module = await import(modulePath);
        if (module && module.initCustomersUI) {
            setTimeout(() => {
                const target = document.getElementById('customers-module-content') || container;
                module.initCustomersUI(target);
                // إعادة الربط بعد تحميل موديول الـ UI لضمان عمل أزرار الجدول
                bindGlobalEvents(); 
            }, 100);
        }
    } catch (err) {
        console.warn("Customer JS module not loaded.");
    }
}

function updateSidebarUI(activeHash) {
    document.querySelectorAll('.sidebar-nav a').forEach(link => {
        const href = link.getAttribute('href');
        if (href === `#${activeHash}`) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

function handleRoute() {
    const hash = window.location.hash.replace('#', '') || 'dashboard';
    switchModule(hash);
}

// الأحداث الرئيسية
window.addEventListener('load', handleRoute);
window.addEventListener('hashchange', handleRoute);
window.switchModule = switchModule;
