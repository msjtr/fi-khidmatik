/**
 * main.js - المحرك المركزي لنظام Tera Gateway
 * الإصدار: 2.3.0 - تحديث أبريل 2026
 * الوظيفة: إدارة التنقل (Routing) والجسر البرمجي للعمليات
 */

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

window.quillEditor = null;

/**
 * 1. الجسر العالمي للتنقل من القائمة الجانبية
 */
window.handleNavClick = function(element, moduleName) {
    if (window.event) window.event.preventDefault();
    window.location.hash = moduleName;
};

/**
 * 2. المحرك الرئيسي لتبديل الأقسام
 */
async function switchModule(moduleName) {
    const container = document.getElementById('module-container');
    const path = routes[moduleName];
    
    if (!container || !path) return;

    try {
        container.innerHTML = `
            <div class="loader-wrapper" style="display:flex; flex-direction:column; align-items:center; justify-content:center; padding:100px;">
                <i class="fas fa-circle-notch fa-spin fa-3x" style="color:#2563eb; margin-bottom:20px;"></i>
                <p style="font-weight:800; color:#1e293b;">جاري مزامنة بيانات ${moduleName}...</p>
            </div>`;

        const response = await fetch(`${path}?v=${Date.now()}`);
        if (!response.ok) throw new Error(`فشل التحميل: ${response.status}`);
        
        const html = await response.text();
        container.innerHTML = html;

        updateSidebarUI(moduleName);

        // تشغيل المنطق البرمجي بناءً على القسم
        if (moduleName === 'customers') {
            await loadCustomersModule(container);
        } else {
            // منطق الموديولات الأخرى يمكن إضافته هنا
        }

    } catch (error) {
        console.error("❌ Navigation Error:", error);
        container.innerHTML = `<div style="text-align:center; padding:80px; color:#ef4444;"><p>تعذر تحميل الموديول.</p></div>`;
    }
}

/**
 * 3. موديول العملاء - التحميل والجسر البرمجي لإصلاح الأزرار
 */
async function loadCustomersModule(container) {
    try {
        const module = await import(`./modules/customers-ui.js?v=${Date.now()}`);
        if (module && module.initCustomersUI) {
            // تشغيل الواجهة
            module.initCustomersUI(container);
            
            // --- الجسر البرمجي لإصلاح الأزرار (The Bridge) ---
            window.openAddCustomer = () => module.openCustomerModal('add');
            window.editCustomer = (id) => module.openCustomerModal('edit', id);
            window.saveCustomer = (e) => module.handleCustomerSubmit(e);
            
            window.closeCustomerModal = () => {
                const modal = document.getElementById('customer-modal');
                if (modal) {
                    modal.style.display = 'none';
                    if (window.quillEditor) window.quillEditor.setContents([]);
                }
            };

            // تهيئة المحرر
            initQuillEditor();
            console.log("✅ تم تفعيل جسر عمليات العملاء بنجاح");
        }
    } catch (err) {
        console.error("❌ تعذر ربط أزرار العمليات:", err);
    }
}

/**
 * 4. تهيئة محرر Quill
 */
function initQuillEditor() {
    const editorElem = document.getElementById('customer-notes-editor');
    if (editorElem) {
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
 * 5. تحديث حالة القائمة الجانبية
 */
function updateSidebarUI(moduleName) {
    document.querySelectorAll('.nav-item').forEach(link => {
        const clickAttr = link.getAttribute('onclick') || '';
        if (clickAttr.includes(`'${moduleName}'`)) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

/**
 * 6. معالج المسارات (Hash Routing)
 */
function handleHashRoute() {
    const hash = window.location.hash.replace('#', '') || 'dashboard';
    switchModule(hash);
}

// تشغيل النظام
window.addEventListener('load', handleHashRoute);
window.addEventListener('hashchange', handleHashRoute);

window.switchModule = switchModule;
