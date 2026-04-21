/**
 * js/main.js - الملف الرئيسي لنظام Tera Gateway
 */

console.log('🚀 main.js تم تحميله بنجاح');

// استيراد الموديولات
let initProducts, initOrders, initCustomers, initSettings, initDashboard;

// ===================== تحميل الموديولات =====================

// تحميل موديول المنتجات
try {
    const productsModule = await import('./modules/products-ui.js');
    initProducts = productsModule.initProducts || productsModule.default;
    console.log('✅ موديول المنتجات تم تحميله');
} catch (e) {
    console.warn('⚠️ موديول المنتجات:', e.message);
}

// تحميل موديول الطلبات
try {
    const ordersModule = await import('./modules/orders-dashboard.js');
    initOrders = ordersModule.initOrdersDashboard || ordersModule.initOrders || ordersModule.default;
    console.log('✅ موديول الطلبات تم تحميله');
} catch (e) {
    console.warn('⚠️ موديول الطلبات:', e.message);
}

// تحميل موديول العملاء
try {
    const customersModule = await import('./modules/customers-ui.js');
    initCustomers = customersModule.initCustomers || customersModule.default;
    console.log('✅ موديول العملاء تم تحميله');
} catch (e) {
    console.warn('⚠️ موديول العملاء:', e.message);
}

// تحميل موديول الإعدادات
try {
    const settingsModule = await import('./modules/settings.js');
    initSettings = settingsModule.initSettings || settingsModule.default;
    console.log('✅ موديول الإعدادات تم تحميله');
} catch (e) {
    console.warn('⚠️ موديول الإعدادات:', e.message);
}

// تحميل موديول الرئيسية
try {
    const dashboardModule = await import('./modules/dashboard.js');
    initDashboard = dashboardModule.initDashboard || dashboardModule.default;
    console.log('✅ موديول الرئيسية تم تحميله');
} catch (e) {
    console.warn('⚠️ موديول الرئيسية:', e.message);
}

// ===================== دوال مساعدة =====================

function showDashboardPlaceholder(container) {
    container.innerHTML = `
        <div style="padding: 25px;">
            <h1 style="color: #2c3e50;"><i class="fas fa-chart-line" style="color: #e67e22;"></i> لوحة التحكم الرئيسية</h1>
            <p>مرحباً بك في نظام Tera Gateway</p>
            <hr>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-top: 30px;">
                <div onclick="window.switchModule('products')" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 25px; border-radius: 15px; color: white; cursor: pointer; text-align: center;">
                    <i class="fas fa-box fa-2x"></i>
                    <h3>المنتجات</h3>
                </div>
                <div onclick="window.switchModule('orders')" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 25px; border-radius: 15px; color: white; cursor: pointer; text-align: center;">
                    <i class="fas fa-receipt fa-2x"></i>
                    <h3>الطلبات</h3>
                </div>
                <div onclick="window.switchModule('customers')" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 25px; border-radius: 15px; color: white; cursor: pointer; text-align: center;">
                    <i class="fas fa-users fa-2x"></i>
                    <h3>العملاء</h3>
                </div>
            </div>
        </div>
    `;
}

function showUnderConstruction(container, title, icon) {
    container.innerHTML = `
        <div style="padding: 60px 20px; text-align: center;">
            <i class="fas ${icon} fa-4x" style="color: #e67e22; margin-bottom: 20px;"></i>
            <h2>${title}</h2>
            <p>هذا القسم قيد التطوير حاليًا</p>
        </div>
    `;
}

// ===================== دالة تبديل الموديولات =====================

async function switchModule(moduleName) {
    console.log('🔄 switchModule:', moduleName);
    
    const loader = document.getElementById('loader');
    const container = document.getElementById('module-container');
    
    if (!container) {
        console.error('❌ module-container غير موجود');
        return;
    }
    
    if (loader) loader.style.display = 'block';
    container.innerHTML = '';
    
    if (typeof window.setActiveNavItem === 'function') {
        window.setActiveNavItem(moduleName);
    }
    
    if (window.location.hash !== `#${moduleName}`) {
        window.location.hash = moduleName;
    }
    
    try {
        switch (moduleName) {
            case 'dashboard':
                if (initDashboard) {
                    await initDashboard(container);
                } else {
                    showDashboardPlaceholder(container);
                }
                break;
                
            case 'products':
                if (typeof initProducts === 'function') {
                    await initProducts(container);
                } else {
                    showUnderConstruction(container, 'إدارة المنتجات', 'fa-box');
                }
                break;
                
            case 'orders':
                if (typeof initOrders === 'function') {
                    await initOrders(container);
                } else {
                    showUnderConstruction(container, 'نظام الطلبات', 'fa-receipt');
                }
                break;
                
            case 'customers':
                if (typeof initCustomers === 'function') {
                    await initCustomers(container);
                } else {
                    showUnderConstruction(container, 'إدارة العملاء', 'fa-users');
                }
                break;
                
            case 'settings':
                if (typeof initSettings === 'function') {
                    await initSettings(container);
                } else {
                    showUnderConstruction(container, 'الإعدادات', 'fa-cog');
                }
                break;
                
            default:
                showDashboardPlaceholder(container);
        }
        
        console.log('✅ تم تحميل الموديول:', moduleName);
        
    } catch (err) {
        console.error('❌ خطأ:', err);
        container.innerHTML = `<div style="padding: 20px; color: red; text-align: center;">خطأ: ${err.message}</div>`;
    } finally {
        if (loader) loader.style.display = 'none';
    }
}

window.switchModule = switchModule;

// ===================== ربط أحداث القائمة =====================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOM جاهز، جاري تهيئة القائمة...');
    
    const menuItems = document.querySelectorAll('#admin-menu .nav-item');
    console.log('📋 عدد عناصر القائمة:', menuItems.length);
    
    menuItems.forEach((item) => {
        // إزالة أي مستمعات سابقة
        const newItem = item.cloneNode(true);
        item.parentNode.replaceChild(newItem, item);
        
        newItem.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const module = newItem.getAttribute('data-module');
            console.log('🖱️ تم النقر على:', module);
            if (module) {
                switchModule(module);
            }
        });
    });
    
    // تحديد الموديول الافتراضي
    let defaultModule = window.location.hash.replace('#', '');
    const validModules = ['dashboard', 'products', 'orders', 'customers', 'settings'];
    
    if (!defaultModule || !validModules.includes(defaultModule)) {
        defaultModule = 'dashboard';
    }
    
    console.log('🎯 الموديول الافتراضي:', defaultModule);
    
    // تحميل الموديول الافتراضي
    setTimeout(() => {
        switchModule(defaultModule);
    }, 100);
});

// الاستماع لتغيرات الـ hash (أزرار الرجوع والتقدم)
window.addEventListener('hashchange', () => {
    const moduleName = window.location.hash.replace('#', '');
    if (moduleName) {
        switchModule(moduleName);
    }
});

// دالة تحديث القائمة النشطة
window.setActiveNavItem = function(moduleName) {
    const items = document.querySelectorAll('#admin-menu .nav-item');
    items.forEach(item => {
        if (item.getAttribute('data-module') === moduleName) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
};

console.log('✅ main.js تم تنفيذه بالكامل');
