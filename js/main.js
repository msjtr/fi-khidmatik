console.log('main.js ready');

let initProducts, initOrders, initCustomers, initSettings, initDashboard;

// تحميل المنتجات
try {
    const m = await import('./modules/products-ui.js');
    initProducts = m.initProducts;
    console.log('✅ Products module loaded');
} catch(e) { console.error('Products error:', e.message); }

// تحميل الطلبات
try {
    const m = await import('./modules/orders-dashboard.js');
    initOrders = m.initOrdersDashboard || m.initOrders;
    console.log('✅ Orders module loaded');
} catch(e) { console.error('Orders error:', e.message); }

// تحميل العملاء (ملف واحد متكامل، بدون تكرار)
try {
    const m = await import('./modules/customers-ui.js');
    initCustomers = m.initCustomers;
    console.log('✅ Customers module loaded');
} catch(e) { console.error('Customers error:', e.message); }

// تحميل الإعدادات
try {
    const m = await import('./modules/settings.js');
    initSettings = m.initSettings;
    console.log('✅ Settings module loaded');
} catch(e) { console.error('Settings error:', e.message); }

// تحميل الرئيسية
try {
    const m = await import('./modules/dashboard.js');
    initDashboard = m.initDashboard;
    console.log('✅ Dashboard module loaded');
} catch(e) { console.error('Dashboard error:', e.message); }

// دوال مساعدة
function showPlaceholder(c, t, i) {
    c.innerHTML = '<div style="padding:60px;text-align:center"><i class="fas ' + i + ' fa-4x"></i><h2>' + t + '</h2><p>جاري التطوير</p></div>';
}

// دالة تبديل الموديولات
async function switchModule(name) {
    const loader = document.getElementById('loader');
    const container = document.getElementById('module-container');
    if (!container) return;
    if (loader) loader.style.display = 'block';
    container.innerHTML = '';
    if (window.setActiveNavItem) window.setActiveNavItem(name);
    if (window.location.hash !== '#' + name) window.location.hash = name;
    try {
        if (name === 'dashboard') {
            if (initDashboard) await initDashboard(container);
            else showPlaceholder(container, 'الرئيسية', 'fa-chart-line');
        } else if (name === 'products') {
            if (initProducts) await initProducts(container);
            else showPlaceholder(container, 'المنتجات', 'fa-box');
        } else if (name === 'orders') {
            if (initOrders) await initOrders(container);
            else showPlaceholder(container, 'الطلبات', 'fa-receipt');
        } else if (name === 'customers') {
            if (initCustomers) await initCustomers(container);
            else showPlaceholder(container, 'العملاء', 'fa-users');
        } else if (name === 'settings') {
            if (initSettings) await initSettings(container);
            else showPlaceholder(container, 'الإعدادات', 'fa-cog');
        } else {
            showPlaceholder(container, 'الصفحة الرئيسية', 'fa-home');
        }
    } catch(err) {
        console.error('Switch error:', err);
        container.innerHTML = '<div style="padding:20px;color:red">خطأ: ' + err.message + '</div>';
    } finally {
        if (loader) loader.style.display = 'none';
    }
}

window.switchModule = switchModule;

// ربط أحداث القائمة الجانبية
document.addEventListener('DOMContentLoaded', function() {
    const items = document.querySelectorAll('#admin-menu .nav-item');
    items.forEach(function(item) {
        const newItem = item.cloneNode(true);
        item.parentNode.replaceChild(newItem, item);
        newItem.addEventListener('click', function(e) {
            e.preventDefault();
            const mod = this.getAttribute('data-module');
            if (mod) switchModule(mod);
        });
    });
    let def = window.location.hash.slice(1);
    if (!def || !['dashboard','products','orders','customers','settings'].includes(def)) def = 'dashboard';
    setTimeout(function() { switchModule(def); }, 100);
});

// تحديث العنصر النشط في القائمة
window.setActiveNavItem = function(module) {
    document.querySelectorAll('#admin-menu .nav-item').forEach(function(item) {
        if (item.getAttribute('data-module') === module) item.classList.add('active');
        else item.classList.remove('active');
    });
};

console.log('✅ main.js ready and fully loaded');
