/**
 * نظام Tera V12 - محرك القائمة الجانبية (Sidebar Logic) - النسخة المحسنة
 */

export function initSidebarLogic() {
    
    // مراقب أحداث مركزي (Centralized Event Listener) لسرعة استجابة أعلى
    document.addEventListener('click', function(e) {
        
        const layout = document.querySelector('.tera-layout');
        if (!layout) return;

        // 1. منطق طي وتوسيع القائمة الجانبية بالكامل
        const toggleBtn = e.target.closest('#toggle-sidebar-btn');
        if (toggleBtn) {
            layout.classList.toggle('sidebar-collapsed');
            
            // إغلاق جميع القوائم الفرعية عند الطي للترتيب
            if (layout.classList.contains('sidebar-collapsed')) {
                document.querySelectorAll('.submenu-container.open').forEach(sub => sub.classList.remove('open'));
                document.querySelectorAll('.nav-btn.has-submenu.open').forEach(btn => btn.classList.remove('open'));
            }
            return; // توقف هنا لتجنب تنفيذ باقي الأوامر
        }

        // 2. منطق القوائم المنسدلة (Submenus) - مع خاصية الإغلاق التلقائي للأخريات
        const submenuBtn = e.target.closest('.has-submenu');
        if (submenuBtn) {
            const targetId = submenuBtn.getAttribute('data-target');
            const targetSubmenu = document.getElementById(targetId);

            // ذكاء النظام: توسيع القائمة إذا كانت مطوية
            if (layout.classList.contains('sidebar-collapsed')) {
                layout.classList.remove('sidebar-collapsed');
            }

            // إغلاق القوائم المنسدلة الأخرى (Accordion Auto-Close)
            document.querySelectorAll('.has-submenu').forEach(btn => {
                if (btn !== submenuBtn) btn.classList.remove('open');
            });
            document.querySelectorAll('.submenu-container').forEach(sub => {
                if (sub.id !== targetId) sub.classList.remove('open');
            });

            // فتح/إغلاق القائمة المطلوبة
            if (targetSubmenu) {
                targetSubmenu.classList.toggle('open');
                submenuBtn.classList.toggle('open');
            }
            return;
        }

        // 3. منطق تلوين الزر النشط تلقائياً وإضاءة الزر الأب
        const navBtn = e.target.closest('.nav-btn:not(.has-submenu)');
        const submenuItem = e.target.closest('.submenu-item');

        if (navBtn || submenuItem) {
            // إزالة التفعيل من جميع الأزرار
            document.querySelectorAll('.nav-btn, .submenu-item').forEach(btn => btn.classList.remove('active'));

            if (navBtn) {
                navBtn.classList.add('active'); // تفعيل مباشر للزر الفردي
            } 
            
            if (submenuItem) {
                submenuItem.classList.add('active'); // تفعيل الزر الفرعي
                
                // إضاءة الزر الأب (مثل إضاءة 'إعدادات النظام' إذا كنا داخله)
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
window.teraNavigate = window.handleSidebarClick = function(moduleName) {
    const frame = document.getElementById('tera-iframe'); 
    
    // قاموس مسارات الصفحات المنظم
    const pages = {
        'dashboard': 'pages/customers-list.html', 
        'products': 'pages/products.html',
        'orders': 'pages/orders.html',
        
        'customers-list': 'pages/customers-list.html',
        'add-customer': 'pages/add-customer.html',
        'customers-report': 'pages/customers-report.html',
        'export-import': 'pages/export-import.html',
        
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
        // تأثير بهتان أثناء التحميل
        frame.style.opacity = '0.2';
        frame.src = pages[moduleName] || pages['dashboard'];
        frame.onload = () => { frame.style.opacity = '1'; };
    }
};
