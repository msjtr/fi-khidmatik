/**
 * نظام Tera V12 - محرك القائمة الجانبية (Sidebar Logic)
 */

export function initSidebarLogic() {
    
    // 1. منطق طي وتوسيع القائمة الجانبية
    document.addEventListener('click', function(e) {
        const toggleBtn = e.target.closest('#toggle-sidebar-btn');
        const layout = document.querySelector('.tera-layout');
        
        if (toggleBtn && layout) {
            layout.classList.toggle('sidebar-collapsed');
            
            // إذا تم طي القائمة، أغلق جميع القوائم المنسدلة الفرعية لترتيب الشكل
            if (layout.classList.contains('sidebar-collapsed')) {
                document.querySelectorAll('.submenu-container.open').forEach(sub => sub.classList.remove('open'));
                document.querySelectorAll('.nav-btn.has-submenu.open').forEach(btn => btn.classList.remove('open'));
            }
        }
    });

    // 2. منطق القوائم المنسدلة (Submenus)
    document.addEventListener('click', function(e) {
        const submenuBtn = e.target.closest('.has-submenu');
        
        if (submenuBtn) {
            const targetId = submenuBtn.getAttribute('data-target');
            const targetSubmenu = document.getElementById(targetId);
            const layout = document.querySelector('.tera-layout');

            // ذكاء النظام: إذا كانت القائمة مطوية، قم بتوسيعها أولاً!
            if (layout && layout.classList.contains('sidebar-collapsed')) {
                layout.classList.remove('sidebar-collapsed');
            }

            // فتح أو إغلاق القائمة المنسدلة
            if (targetSubmenu) {
                targetSubmenu.classList.toggle('open');
                submenuBtn.classList.toggle('open');
            }
        }
    });

    // 3. منطق تلوين الزر النشط تلقائياً (رئيسي أو فرعي)
    document.addEventListener('click', function(e) {
        // التحقق مما إذا كان الضغط على زر رئيسي مباشر، أو زر فرعي داخل قائمة
        const navBtn = e.target.closest('.nav-btn:not(.has-submenu)');
        const submenuItem = e.target.closest('.submenu-item');

        if (navBtn || submenuItem) {
            // إزالة التفعيل من جميع الأزرار في الواجهة
            document.querySelectorAll('.nav-btn, .submenu-item').forEach(btn => btn.classList.remove('active'));

            if (navBtn) {
                navBtn.classList.add('active'); // تفعيل الزر الرئيسي المباشر
            } 
            
            if (submenuItem) {
                submenuItem.classList.add('active'); // تفعيل الزر الفرعي
                
                // إضاءة الزر الأب (مثلاً إضاءة 'إعدادات النظام' عند الضغط على 'إضافة موظف')
                const parentContainer = submenuItem.closest('.submenu-container');
                if (parentContainer) {
                    const parentBtn = document.querySelector(`.has-submenu[data-target="${parentContainer.id}"]`);
                    if (parentBtn) parentBtn.classList.add('active');
                }
            }
        }
    });
}

// 4. دالة التنقل المنفصلة بمحرك القاموس (Routing Dictionary)
// ملاحظة: تم ربطها باسم teraNavigate أيضاً لتعمل فوراً دون الحاجة لتعديل أزرار الـ HTML
window.teraNavigate = window.handleSidebarClick = function(moduleName) {
    const frame = document.getElementById('tera-iframe'); 
    
    // قاموس (مجلد) مسارات الصفحات المنظم لكل أقسام النظام
    const pages = {
        // الأقسام الأساسية
        'dashboard': 'pages/customers-list.html', // يمكن تغييرها لصفحة لوحة تحكم حقيقية لاحقاً
        'products': 'pages/products.html',
        'orders': 'pages/orders.html',
        
        // قسم العملاء
        'customers-list': 'pages/customers-list.html',
        'add-customer': 'pages/add-customer.html',
        'customers-report': 'pages/customers-report.html',
        'export-import': 'pages/export-import.html',
        
        // قسم الإعدادات والنظام
        'add-employee': 'pages/add-employee.html',
        'employees-log': 'pages/employees-log.html',
        'change-credentials': 'pages/change-credentials.html',
        'employees-report': 'pages/employees-report.html',
        'backup': 'pages/backup.html',
        'store-info': 'pages/store-info.html',
        'clear-cache': 'pages/clear-cache.html',
        'shipping-settings': 'pages/shipping-settings.html',
        'payment-gateway': 'pages/payment-gateway.html',
        'ui-design': 'pages/ui-design.html'
    };

    if (frame) {
        // إضافة تأثير بهتان جميل أثناء التحميل
        frame.style.opacity = '0.2';
        
        // توجيه الإطار للمسار المطلوب، وإذا لم يجده يعود للرئيسية
        frame.src = pages[moduleName] || pages['dashboard'];
        
        // إعادة إضاءة الشاشة بعد اكتمال فتح الصفحة
        frame.onload = () => { frame.style.opacity = '1'; };
    }
};
