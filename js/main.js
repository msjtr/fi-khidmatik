/**
 * main.js - Tera Gateway Core Router
 * المحرك المركزي لإدارة التنقل وتحميل الموديولات
 * المسار: js/main.js
 */

// 1. خريطة المسارات المعتمدة حسب شجرة الملفات
const routes = {
    'dashboard': 'admin/modules/orders-dashboard.html',
    'customers': 'admin/modules/customers.html',
    'order-form': 'admin/modules/order-form.html',
    'products':  'admin/modules/products.html',
    'inventory': 'admin/modules/inventory.html',
    'payments':  'admin/modules/payments.html',
    'invoice':   'admin/modules/invoice.html',
    'settings':  'admin/modules/settings.html',
    'backup':    'admin/modules/backup.html',
    'general':   'admin/modules/general.html'
};

// متغيرات عالمية
window.quillEditor = null;

/**
 * 2. دالة تبديل الأقسام (Core Switcher)
 */
async function switchModule(moduleName) {
    const container = document.getElementById('module-container');
    const path = routes[moduleName];
    if (!container || !path) return;

    try {
        // إظهار مؤشر التحميل بتصميم تيرا
        container.innerHTML = `
            <div class="loader-box" style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:300px;">
                <i class="fas fa-circle-notch fa-spin fa-3x" style="color:#2563eb;"></i>
                <p style="margin-top:20px; font-weight:800; color:#1e293b;">جاري تحميل ${moduleName}...</p>
            </div>`;

        const response = await fetch(`${path}?v=${Date.now()}`);
        if (!response.ok) throw new Error(`Status: ${response.status}`);
        
        const html = await response.text();
        container.innerHTML = html;

        // تحديث القائمة الجانبية
        updateSidebarUI(moduleName);

        // تشغيل المنطق الخاص بكل صفحة (Initialization Logic)
        initModuleLogic(moduleName);

    } catch (error) {
        console.error("Navigation Error:", error);
        container.innerHTML = `
            <div style="text-align:center; padding:100px;">
                <i class="fas fa-exclamation-triangle fa-3x" style="color:#ef4444;"></i>
                <p style="margin-top:20px; font-weight:bold;">عذراً، فشل تحميل القسم. تأكد من وجود الملف في: <br><code>${path}</code></p>
            </div>`;
    }
}

/**
 * 3. توزيع المنطق البرمجي بناءً على الصفحة المحملة
 */
async function initModuleLogic(moduleName) {
    switch (moduleName) {
        case 'customers':
            await loadModuleScript('js/modules/customers-ui.js', 'initCustomersUI');
            initQuillEditor();
            break;
        
        case 'products':
            await loadModuleScript('js/modules/products-ui.js', 'initProductsUI');
            break;

        case 'orders-dashboard':
        case 'dashboard':
            await loadModuleScript('js/modules/orders-dashboard.js', 'initOrdersDashboard');
            break;

        case 'inventory':
            await loadModuleScript('js/modules/inventory.js', 'initInventory');
            break;

        case 'payments':
            await loadModuleScript('js/modules/payments.js', 'initPayments');
            break;
            
        case 'settings':
            await loadModuleScript('js/modules/settings.js', 'initSettings');
            break;
    }
}

/**
 * 4. محرك استيراد الملفات البرمجية ديناميكياً
 */
async function loadModuleScript(scriptPath, initFunctionName) {
    try {
        const module = await import(`../${scriptPath}?v=${Date.now()}`);
        if (module && module[initFunctionName]) {
            module[initFunctionName]();
        }
    } catch (err) {
        console.warn(`⚠️ تنبيه: لم يتم العثور على وظيفة التشغيل في ${scriptPath}`);
    }
}

/**
 * 5. تهيئة محرر Quill (خاص بالعملاء والمنتجات)
 */
function initQuillEditor() {
    const editorElem = document.getElementById('customer-notes-editor');
    if (editorElem) {
        window.quillEditor = new Quill('#customer-notes-editor', {
            theme: 'snow',
            placeholder: 'سجل الملاحظات أو الشروط هنا...',
            modules: {
                toolbar: [
                    ['bold', 'italic', 'underline'],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                    ['clean']
                ]
            }
        });
    }
}

/**
 * 6. التحكم في القائمة الجانبية (Sidebar)
 */
function updateSidebarUI(moduleName) {
    document.querySelectorAll('.nav-item').forEach(link => {
        // نتحقق من الـ onclick أو الـ hash
        const isCurrent = link.getAttribute('onclick')?.includes(`'${moduleName}'`);
        if (isCurrent) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

/**
 * 7. نظام التوجيه عبر الـ Hash (#)
 */
function handleHashRoute() {
    const hash = window.location.hash.replace('#', '') || 'dashboard';
    switchModule(hash);
}

// الاستماع للأحداث العالمية
window.addEventListener('load', handleHashRoute);
window.addEventListener('hashchange', handleHashRoute);

// إتاحة الدوال عالمياً
window.switchModule = switchModule;
