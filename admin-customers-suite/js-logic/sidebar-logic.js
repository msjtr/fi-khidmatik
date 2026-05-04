/**
 * نظام Tera V12 - محرك القائمة الجانبية (Sidebar Logic) - النسخة المحسنة
 * المؤسسة: الإتقان بلس - حائل
 */

export function initSidebarLogic() {
    // مراقب أحداث مركزي لسرعة استجابة أعلى
    document.addEventListener('click', function(e) {
        
        const layout = document.querySelector('.tera-layout');
        if (!layout) return;

        // 1. منطق طي وتوسيع القائمة الجانبية بالكامل
        const toggleBtn = e.target.closest('#toggle-sidebar-btn');
        if (toggleBtn) {
            layout.classList.toggle('sidebar-collapsed');
            
            // إغلاق جميع القوائم الفرعية عند الطي للترتيب
            if (layout.classList.contains('sidebar-collapsed')) {
                document.querySelectorAll('.submenu-container').forEach(sub => {
                    sub.style.maxHeight = null;
                    sub.classList.remove('open');
                });
                document.querySelectorAll('.has-submenu .dropdown-arrow-icon').forEach(arrow => {
                    arrow.style.transform = 'rotate(0deg)';
                });
                document.querySelectorAll('.nav-btn.has-submenu').forEach(btn => btn.classList.remove('active'));
            }
            return; 
        }

        // 2. منطق القوائم المنسدلة (Submenus) - مع خاصية الإغلاق التلقائي (Accordion)
        const submenuBtn = e.target.closest('.has-submenu');
        if (submenuBtn) {
            const targetId = submenuBtn.getAttribute('data-target');
            const targetSubmenu = document.getElementById(targetId);
            const arrow = submenuBtn.querySelector('.dropdown-arrow-icon');

            // توسيع القائمة الجانبية تلقائياً إذا كانت مطوية عند محاولة فتح قائمة فرعية
            if (layout.classList.contains('sidebar-collapsed')) {
                layout.classList.remove('sidebar-collapsed');
            }

            // إغلاق القوائم المنسدلة الأخرى (Auto-Close)
            document.querySelectorAll('.has-submenu').forEach(btn => {
                if (btn !== submenuBtn) {
                    btn.classList.remove('active');
                    const icon = btn.querySelector('.dropdown-arrow-icon');
                    if (icon) icon.style.transform = 'rotate(0deg)';
                }
            });
            document.querySelectorAll('.submenu-container').forEach(sub => {
                if (sub.id !== targetId) {
                    sub.style.maxHeight = null;
                    sub.classList.remove('open');
                }
            });

            // فتح/إغلاق القائمة المطلوبة بحركة انسيابية
            if (targetSubmenu) {
                const isOpen = targetSubmenu.classList.contains('open');
                if (isOpen) {
                    targetSubmenu.style.maxHeight = null;
                    targetSubmenu.classList.remove('open');
                    submenuBtn.classList.remove('active');
                    if (arrow) arrow.style.transform = 'rotate(0deg)';
                } else {
                    targetSubmenu.style.maxHeight = targetSubmenu.scrollHeight + "px";
                    targetSubmenu.classList.add('open');
                    submenuBtn.classList.add('active');
                    if (arrow) arrow.style.transform = 'rotate(180deg)';
                }
            }
            return;
        }

        // 3. منطق تلوين الزر النشط وإضاءة الزر الأب
        const navBtn = e.target.closest('.nav-btn:not(.has-submenu)');
        const submenuItem = e.target.closest('.submenu-item');

        if (navBtn || submenuItem) {
            // إزالة التفعيل من جميع الأزرار
            document.querySelectorAll('.nav-btn, .submenu-item').forEach(btn => btn.classList.remove('active'));

            if (navBtn) {
                navBtn.classList.add('active'); 
            } 
            
            if (submenuItem) {
                submenuItem.classList.add('active'); 
                
                // إضاءة الزر الأب للحفاظ على سياق القائمة المفتوحة
                const parentContainer = submenuItem.closest('.submenu-container');
                if (parentContainer) {
                    const parentBtn = document.querySelector(`.has-submenu[data-target="${parentContainer.id}"]`);
                    if (parentBtn) parentBtn.classList.add('active');
                }
            }
        }
    });
}

/**
 * 4. محرك التنقل المركزي (Routing Engine)
 * يستخدم قاموساً لتحديد المسارات بدقة وسرعة
 */
window.teraNavigate = function(moduleName) {
    const frame = document.getElementById('tera-iframe'); 
    
    const pages = {
        'dashboard': 'customers-list.html', 
        'products': 'products.html',
        'orders': 'orders.html',
        'customers-list': 'customers-list.html',
        'add-customer': 'add-customer.html',
        'customers-report': 'customers-report.html',
        'export-import': 'export-import.html',
        'add-employee': 'add-employee.html',
        'employees-log': 'employees-log.html',
        'change-credentials': 'change-credentials.html',
        'employees-report': 'employees-report.html',
        'backup': 'backup.html',
        'store-info': 'store-info.html',
        'clear-cache': 'clear-cache.html',
        'shipping-settings': 'shipping-settings.html',
        'payment-gateway': 'payment-gateway.html',
        'ui-design': 'ui-design.html'
    };

    if (frame) {
        // تأثير بهتان (Fade Effect) أثناء تحميل الصفحة الجديدة للجمالية
        frame.style.transition = 'opacity 0.3s ease';
        frame.style.opacity = '0.2';
        
        frame.src = pages[moduleName] || pages['dashboard'];
        
        frame.onload = () => { 
            frame.style.opacity = '1'; 
        };
    }
};
