/**
 * main.js - المحرك المركزي لنظام Tera Gateway
 * الإصدار: 2.2.0 - تحديث أبريل 2026
 * الوظيفة: إدارة التنقل (Routing)، الجسر البرمجي للأزرار، وحل مشاكل النطاق (Scope)
 */

// 1. خريطة المسارات المعتمدة
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
 * 2. دالة الجسر العالمي للتنقل (حل مشكلة ReferenceError)
 * تُستدعى من onclick في sidebar.html
 */
window.handleNavClick = function(element, moduleName) {
    // منع السلوك الافتراضي إذا لزم الأمر
    if (window.event) window.event.preventDefault();

    console.log(`🚀 جاري الانتقال إلى موديول: ${moduleName}`);
    
    // تحديث الـ Hash في المتصفح مما سيشغل تلقائياً حدث hashchange
    window.location.hash = moduleName;
};

/**
 * 3. المحرك الرئيسي لتبديل الأقسام
 */
async function switchModule(moduleName) {
    const container = document.getElementById('module-container');
    const path = routes[moduleName];
    
    if (!container) return;
    if (!path) {
        console.error(`❌ الموديول ${moduleName} غير معرف في المسارات.`);
        return;
    }

    try {
        // إظهار واجهة التحميل
        container.innerHTML = `
            <div class="loader-wrapper" style="display:flex; flex-direction:column; align-items:center; justify-content:center; padding:100px;">
                <i class="fas fa-circle-notch fa-spin fa-3x" style="color:#2563eb; margin-bottom:20px;"></i>
                <p style="font-weight:800; color:#1e293b;">جاري مزامنة بيانات ${moduleName}...</p>
            </div>`;

        const response = await fetch(`${path}?v=${Date.now()}`);
        if (!response.ok) throw new Error(`فشل التحميل: ${response.status}`);
        
        const html = await response.text();
        container.innerHTML = html;

        // تحديث حالة القائمة الجانبية (Active Class)
        updateSidebarUI(moduleName);

        // تشغيل المنطق البرمجي الخاص بالموديول
        await initializeModuleLogic(moduleName);

    } catch (error) {
        console.error("❌ Navigation Error:", error);
        container.innerHTML = `
            <div style="text-align:center; padding:80px; color:#ef4444;">
                <i class="fas fa-exclamation-circle fa-3x"></i>
                <p style="margin-top:15px; font-weight:bold;">حدث خطأ أثناء تحميل القسم.</p>
                <code>${path}</code>
            </div>`;
    }
}

/**
 * 4. الجسر البرمجي لربط موديول العملاء بالـ UI
 */
async function initializeModuleLogic(moduleName) {
    if (moduleName === 'customers') {
        try {
            const module = await import(`./modules/customers-ui.js?v=${Date.now()}`);
            
            if (module && module.initCustomersUI) {
                // تشغيل الواجهة
                module.initCustomersUI();

                // ربط أزرار الـ HTML بالدوال (Exported Functions)
                window.openAddCustomer = () => module.openCustomerModal('add');
                window.editCustomer = (id) => module.openCustomerModal('edit', id);
                window.saveCustomer = (e) => module.handleCustomerSubmit(e);
                window.deleteCust = (id) => module.deleteCust(id);
                
                window.closeCustomerModal = () => {
                    const modal = document.getElementById('customer-modal');
                    if (modal) {
                        modal.style.display = 'none';
                        if (window.quillEditor) window.quillEditor.setContents([]);
                    }
                };

                initQuillEditor();
                console.log("✅ تم تفعيل جسر عمليات العملاء");
            }
        } catch (err) {
            console.error("❌ فشل تحميل موديول العملاء:", err);
        }
    }
    // يمكن إضافة initialize لـ products أو orders هنا بنفس الطريقة
}

/**
 * 5. تهيئة محرر Quill
 */
function initQuillEditor() {
    const editorElem = document.getElementById('customer-notes-editor');
    if (editorElem) {
        // تصفير المحرر القديم إذا وجد
        if (window.quillEditor) window.quillEditor = null;
        
        window.quillEditor = new Quill('#customer-notes-editor', {
            theme: 'snow',
            placeholder: 'سجل الملاحظات والشروط هنا...',
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
 * 6. تحديث واجهة القائمة الجانبية بصرياً
 */
function updateSidebarUI(moduleName) {
    document.querySelectorAll('.nav-item').forEach(link => {
        const clickAttr = link.getAttribute('onclick') || '';
        // التحقق من اسم الموديول داخل دالة handleNavClick أو switchModule
        if (clickAttr.includes(`'${moduleName}'`)) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

/**
 * 7. إدارة التوجيه عبر الـ Hash
 */
function handleHashRoute() {
    const hash = window.location.hash.replace('#', '') || 'dashboard';
    switchModule(hash);
}

// الاستماع للأحداث
window.addEventListener('load', handleHashRoute);
window.addEventListener('hashchange', handleHashRoute);

// إتاحة الدوال عالمياً للأزرار (Global Access)
window.switchModule = switchModule;
