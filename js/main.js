/**
 * Tera Gateway - Core Routing System (main.js)
 * نظام التوجيه الذكي وإدارة الموديولات
 */

// 1. خريطة المسارات الموحدة
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
 * التنقل بين الأقسام
 */
async function switchModule(moduleName) {
    const container = document.getElementById('module-container');
    if (!container) return;

    const path = routes[moduleName];
    if (!path) {
        console.error(`Tera Error: المسار [${moduleName}] غير معرف.`);
        return;
    }

    try {
        // حالة التحميل (Loading State)
        showModuleLoader(container, moduleName);

        // تحديث واجهة السايدبار (Active Class)
        updateSidebarUI(moduleName);

        // جلب محتوى الـ HTML
        const response = await fetch(`${path}?v=${Date.now()}`);
        if (!response.ok) throw new Error(`HTTP Status: ${response.status}`);
        
        const html = await response.text();
        
        // حقن المحتوى مع تأثير تلاشي بسيط (Fade-in effect)
        container.style.opacity = '0';
        container.innerHTML = html;
        
        setTimeout(() => {
            container.style.transition = 'opacity 0.3s ease';
            container.style.opacity = '1';
        }, 50);

        // تشغيل التهيئة البرمجية للموديول
        await initializeModuleLogic(moduleName, container);

    } catch (error) {
        renderErrorMessage(container, path);
    }
}

/**
 * تهيئة المنطق البرمجي (JS/CSS) لكل موديول بشكل ديناميكي
 */
async function initializeModuleLogic(moduleName, container) {
    // 1. تحميل ملف CSS الخاص بالموديول إذا وجد
    loadModuleStyle(moduleName);

    // 2. تشغيل الدوال البرمجية بناءً على اسم الموديول
    switch (moduleName) {
        case 'customers':
            await initSpecificModule(moduleName, 'initCustomersUI');
            break;
        case 'products':
            await initSpecificModule(moduleName, 'initProductsUI');
            break;
        case 'orders':
            await initSpecificModule(moduleName, 'initOrdersUI');
            break;
        // يمكنك إضافة حالات أخرى هنا لاحقاً
    }
}

/**
 * دالة مساعدة لتحميل ملفات JS الخاصة بالموديولات (Dynamic Import)
 */
async function initSpecificModule(moduleName, initFunctionName) {
    try {
        const modulePath = `./modules/${moduleName}-ui.js?v=${Date.now()}`;
        const module = await import(modulePath);
        if (module && module[initFunctionName]) {
            module[initFunctionName]();
            console.log(`✨ Module Initialized: ${moduleName}`);
        }
    } catch (err) {
        console.warn(`Tera Notice: لا يوجد ملف JS خاص للموديول [${moduleName}]، سيتم الاكتفاء بـ HTML.`);
    }
}

/**
 * تحميل التنسيقات (CSS) ديناميكياً لتجنب ثقل الصفحة الرئيسية
 */
function loadModuleStyle(moduleName) {
    const styleId = `style-mod-${moduleName}`;
    if (!document.getElementById(styleId)) {
        const link = document.createElement('link');
        link.id = styleId;
        link.rel = 'stylesheet';
        link.href = `css/modules/${moduleName}.css?v=${Date.now()}`;
        // لا نعطل التحميل إذا فشل ملف الـ CSS
        link.onerror = () => link.remove(); 
        document.head.appendChild(link);
    }
}

/**
 * تحديث حالة القائمة الجانبية (Sidebar)
 */
function updateSidebarUI(activeModule) {
    // نبحث عن العناصر التي تحمل سمة data-module
    document.querySelectorAll('.nav-item').forEach(item => {
        if (item.getAttribute('data-module') === activeModule) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

/**
 * عرض رسالة خطأ احترافية
 */
function renderErrorMessage(container, path) {
    container.innerHTML = `
        <div class="error-card" style="padding:50px; text-align:center; background:#fff; border-radius:20px; border:1px solid #fee2e2; margin:20px;">
            <div style="color:#ef4444; font-size: 3rem; margin-bottom: 20px;"><i class="fas fa-circle-exclamation"></i></div>
            <h3 style="color:#1e293b; font-weight:800;">عذراً، فشل تحميل القسم</h3>
            <p style="color:#64748b;">لم نتمكن من الوصول إلى ملف البرمجة في: <code style="background:#f1f5f9; padding:2px 5px;">${path}</code></p>
            <button onclick="location.reload()" style="margin-top:20px; background:#2563eb; color:white; border:none; padding:12px 25px; border-radius:12px; font-weight:700; cursor:pointer;">تحديث الصفحة</button>
        </div>`;
}

/**
 * عرض واجهة التحميل داخل الحاوية
 */
function showModuleLoader(container, name) {
    container.innerHTML = `
        <div class="module-loader" style="display:flex; justify-content:center; align-items:center; height:100%; min-height:400px; flex-direction:column; gap:20px;">
            <i class="fas fa-circle-notch fa-spin fa-3x" style="color:#2563eb;"></i>
            <span style="color:#64748b; font-weight:700;">جاري فتح ${name}...</span>
        </div>`;
}

/**
 * نظام التوجيه (Routing) عبر الـ Hash
 */
function handleRoute() {
    const hash = window.location.hash.replace('#', '') || 'dashboard';
    switchModule(hash);
}

// البدء عند جاهزية الصفحة
window.addEventListener('load', handleRoute);
window.addEventListener('hashchange', handleRoute);

// جعل الدالة متاحة للأزرار التقليدية
window.switchModule = switchModule;
window.updateActiveNav = handleRoute; // للتوافق مع استدعاء admin.html
