/**
 * main.js - Fi-Khidmatik Core
 * تم إصلاح مسارات المجلدات بناءً على هيكل GitHub الفعلي
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
        // تنظيف الحاوية لمنع تداخل الصفحات (حل مشكلة اختفاء المحتوى)
        container.innerHTML = `
            <div style="text-align:center; padding:100px;">
                <i class="fas fa-spinner fa-spin fa-2x" style="color:#2563eb;"></i>
            </div>`;

        // جلب المحتوى مع منع التخزين المؤقت
        const response = await fetch(`${path}?v=${Date.now()}`);
        if (!response.ok) throw new Error(`404: ${path}`);
        
        const html = await response.text();
        container.innerHTML = html;

        // معالجة موديول العملاء بشكل خاص
        if (moduleName === 'customers') {
            handleCustomersLoading(container);
        }

        // تحديث حالة القائمة الجانبية
        updateSidebarUI(moduleName);

    } catch (error) {
        console.error("Navigation Error:", error);
        container.innerHTML = `<div style="padding:20px; color:red;">خطأ في تحميل الصفحة: ${moduleName}</div>`;
    }
}

async function handleCustomersLoading(container) {
    // إصلاح الخطأ الظاهر في الصورة: ملف التنسيق موجود في css/ وليس js/modules/
    const styleId = 'module-customers-style';
    if (!document.getElementById(styleId)) {
        const link = document.createElement('link');
        link.id = styleId;
        link.rel = 'stylesheet';
        link.href = `css/customers.css?v=${Date.now()}`; // المسار الصحيح بناءً على الهيكل الفعلي
        document.head.appendChild(link);
    }

    try {
        // تحميل موديول الـ JS من مجلد modules
        const modulePath = `./modules/customers-ui.js?v=${Date.now()}`;
        const module = await import(modulePath);
        if (module && module.initCustomersUI) {
            setTimeout(() => {
                const target = document.getElementById('customers-module-content') || container;
                module.initCustomersUI(target);
            }, 100);
        }
    } catch (err) {
        console.warn("Customer module JS loading skipped or failed.");
    }
}

function updateSidebarUI(activeHash) {
    document.querySelectorAll('.sidebar-nav a').forEach(link => {
        if (link.getAttribute('href') === `#${activeHash}`) {
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

window.addEventListener('load', handleRoute);
window.addEventListener('hashchange', handleRoute);
window.switchModule = switchModule;
/**
 * دالة ربط الأحداث العامة لجميع الأزرار في أي موديول يتم تحميله
 */
function bindGlobalEvents() {
    // 1. أزرار الإغلاق (للمودالات أو النوافذ المنبثقة)
    document.querySelectorAll('[data-bs-dismiss="modal"], .btn-close, .close-btn').forEach(btn => {
        btn.onclick = () => {
            const modal = btn.closest('.modal') || btn.closest('.glass-modal');
            if (modal) modal.style.display = 'none';
        };
    });

    // 2. أزرار الحفظ (التأكد من عدم تكرار الإرسال)
    document.querySelectorAll('.btn-save, #saveChanges').forEach(btn => {
        btn.onclick = (e) => {
            console.log("Saving data...");
            // هنا يتم استدعاء دالة الحفظ الخاصة بالموديول
            if (typeof saveData === 'function') saveData(e);
        };
    });

    // 3. أزرار التعديل
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.onclick = (e) => {
            const id = btn.dataset.id;
            console.log("Editing item:", id);
            if (typeof editItem === 'function') editItem(id);
        };
    });
}

// تعديل دالة switchModule لاستدعاء الربط بعد التحميل
// ابحث عن سطر container.innerHTML = html; وأضف بعده:
// bindGlobalEvents();
