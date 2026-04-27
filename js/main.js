/**
 * main.js - Core Router & Global Controllers
 * نظام التوجيه وإدارة الدوال العامة - مشروع "في خدمتك"
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

// متغير عالمي لمحرر النصوص لضمان الوصول إليه من أي مكان
window.quillEditor = null;

/**
 * دالة تبديل الأقسام (Modules)
 */
async function switchModule(moduleName) {
    const container = document.getElementById('module-container');
    if (!container) return;

    const path = routes[moduleName];
    if (!path) return;

    try {
        // 1. إظهار مؤشر تحميل زجاجي متناسق مع التصميم
        container.innerHTML = `
            <div class="loader-wrapper" style="text-align:center; padding:100px; color:#2563eb;">
                <i class="fas fa-circle-notch fa-spin fa-3x"></i>
                <p style="margin-top:15px; font-weight:bold;">جاري جلب بيانات ${moduleName}...</p>
            </div>`;

        // 2. جلب ملف الـ HTML
        const response = await fetch(`${path}?v=${Date.now()}`);
        if (!response.ok) throw new Error(`404: ${path}`);
        
        const html = await response.text();
        container.innerHTML = html;

        // 3. تحديث روابط القائمة الجانبية
        updateSidebarUI(moduleName);

        // 4. تهيئة موديول العملاء بشكل خاص
        if (moduleName === 'customers') {
            await initializeCustomersModule(container);
        }

    } catch (error) {
        console.error("Navigation Error:", error);
        container.innerHTML = `<div class="error-msg" style="padding:40px; text-align:center; color:#ef4444;">
            <i class="fas fa-exclamation-circle fa-2x"></i>
            <p>حدث خطأ أثناء تحميل القسم، يرجى إعادة المحاولة.</p>
        </div>`;
    }
}

/**
 * تهيئة موديول العملاء: تحميل التنسيق، الموديول، ومحرر النصوص
 */
async function initializeCustomersModule(container) {
    // تحميل CSS الموديول إذا لم يكن موجوداً
    if (!document.getElementById('module-customers-style')) {
        const link = document.createElement('link');
        link.id = 'module-customers-style';
        link.rel = 'stylesheet';
        link.href = `css/customers.css?v=${Date.now()}`;
        document.head.appendChild(link);
    }

    try {
        // استيراد ملف الـ UI
        const modulePath = `./modules/customers-ui.js?v=${Date.now()}`;
        const module = await import(modulePath);
        
        if (module && module.initCustomersUI) {
            // انتظار بسيط لضمان حقن الـ HTML في الـ DOM
            setTimeout(() => {
                module.initCustomersUI(container);
                // تهيئة محرر النصوص Quill بعد تحميل الواجهة
                initQuillEditor();
            }, 100);
        }
    } catch (err) {
        console.error("فشل في تشغيل موديول العملاء:", err);
    }
}

/**
 * تهيئة محرر النصوص (Quill Editor) للملاحظات
 */
function initQuillEditor() {
    const editorElem = document.getElementById('customer-notes-editor');
    if (editorElem && !window.quillEditor) {
        window.quillEditor = new Quill('#customer-notes-editor', {
            theme: 'snow',
            placeholder: 'اكتب ملاحظات العميل هنا...',
            modules: {
                toolbar: [
                    ['bold', 'italic', 'underline'],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                    [{ 'align': [] }],
                    ['clean']
                ]
            }
        });
    }
}

/**
 * إدارة النوافذ المنبثقة (Global Modals)
 * تضمن العمل الفعلي لأزرار الإضافة والتعديل والإغلاق
 */

window.openCustomerModal = function(mode = 'add', customerId = null) {
    const modal = document.getElementById('customer-modal');
    if (!modal) return;

    modal.style.display = 'flex';
    
    // ضبط عنوان النافذة
    const title = document.getElementById('modal-title');
    if(title) title.innerText = mode === 'edit' ? 'تعديل بيانات العميل' : 'إضافة عميل جديد';

    // إذا كان تعديل، نقوم بتصفير المحرر وتهيئته بالبيانات (تتم عبر customers-ui.js)
    if (mode === 'add') {
        const form = document.getElementById('customer-form');
        if(form) form.reset();
        if(window.quillEditor) window.quillEditor.setContents([]);
    }
};

window.closeCustomerModal = function() {
    const modal = document.getElementById('customer-modal');
    if (modal) modal.style.display = 'none';
};

/**
 * تحديث واجهة القائمة الجانبية
 */
function updateSidebarUI(moduleName) {
    document.querySelectorAll('.sidebar-nav a').forEach(link => {
        const href = link.getAttribute('href');
        if (href === `#${moduleName}`) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

/**
 * نظام التوجيه (Routing)
 */
function handleRoute() {
    const hash = window.location.hash.replace('#', '') || 'dashboard';
    switchModule(hash);
}

// الاستماع للأحداث
window.addEventListener('load', handleRoute);
window.addEventListener('hashchange', handleRoute);

// إتاحة الدوال عالمياً للأزرار
window.switchModule = switchModule;
