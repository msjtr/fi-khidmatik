/**
 * js/main.js - الملف الرئيسي للوحة التحكم
 */

// استيراد الموديولات الموجودة
import { initProducts } from './modules/products.js';

// استيرادات اختيارية مع معالجة الأخطاء
let initOrders, initCustomers, initDashboard, initSettings;

// محاولة استيراد الموديولات الأخرى بشكل ديناميكي
try {
    const ordersModule = await import('./modules/orders-dashboard.js');
    initOrders = ordersModule.initOrdersDashboard;
} catch (e) {
    console.warn('⚠️ موديول الطلبات غير جاهز بعد:', e.message);
}

try {
    const customersModule = await import('./modules/customers.js');
    initCustomers = customersModule.initCustomers;
} catch (e) {
    console.warn('⚠️ موديول العملاء غير جاهز بعد:', e.message);
}

try {
    const settingsModule = await import('./modules/settings.js');
    initSettings = settingsModule.initSettings;
} catch (e) {
    console.warn('⚠️ موديول الإعدادات غير جاهز بعد:', e.message);
}

// دالة تبديل الموديولات الرئيسية
async function switchModule(moduleName) {
    console.log('🔄 تحميل الموديول:', moduleName);
    
    const loader = document.getElementById('loader');
    const container = document.getElementById('module-container');
    
    if (!container) {
        console.error('❌ عنصر module-container غير موجود');
        return;
    }
    
    // إظهار loader وإخفاء المحتوى القديم
    if (loader) loader.style.display = 'block';
    container.innerHTML = '';
    
    // تحديث العنصر النشط في القائمة الجانبية
    if (typeof window.setActiveNavItem === 'function') {
        window.setActiveNavItem(moduleName);
    }
    
    // تحديث الـ URL hash
    if (window.location.hash !== `#${moduleName}`) {
        window.location.hash = moduleName;
    }
    
    try {
        switch (moduleName) {
            case 'products':
                if (typeof initProducts === 'function') {
                    await initProducts(container);
                } else {
                    throw new Error('دالة initProducts غير معرفة');
                }
                break;
                
            case 'orders':
                if (initOrders) {
                    await initOrders(container);
                } else {
                    container.innerHTML = `
                        <div class="alert alert-info" style="padding: 20px; margin: 20px;">
                            <i class="fas fa-spinner fa-spin"></i>
                            <h3>قيد التطوير</h3>
                            <p>قسم الطلبات قيد الإعداد حاليًا، سيتم إطلاقه قريبًا.</p>
                        </div>
                    `;
                }
                break;
                
            case 'customers':
                if (initCustomers) {
                    await initCustomers(container);
                } else {
                    container.innerHTML = `
                        <div class="alert alert-info" style="padding: 20px; margin: 20px;">
                            <i class="fas fa-users"></i>
                            <h3>قيد التطوير</h3>
                            <p>قسم العملاء قيد الإعداد حاليًا، سيتم إطلاقه قريبًا.</p>
                        </div>
                    `;
                }
                break;
                
            case 'settings':
                if (initSettings) {
                    await initSettings(container);
                } else {
                    container.innerHTML = `
                        <div class="alert alert-info" style="padding: 20px; margin: 20px;">
                            <i class="fas fa-cog"></i>
                            <h3>الإعدادات</h3>
                            <p>لوحة الإعدادات قيد التطوير حاليًا.</p>
                        </div>
                    `;
                }
                break;
                
            case 'dashboard':
            default:
                container.innerHTML = `
                    <div class="dashboard-welcome" style="padding: 20px;">
                        <h1><i class="fas fa-chart-line"></i> لوحة التحكم الرئيسية</h1>
                        <p>مرحبًا بك في نظام Tera Gateway لإدارة المبيعات والتقسيط</p>
                        <hr>
                        <div class="stats-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-top: 30px;">
                            <div class="stat-card" style="background: #f8f9fa; padding: 20px; border-radius: 12px; text-align: center;">
                                <i class="fas fa-box fa-2x" style="color: #e67e22;"></i>
                                <h3>المنتجات</h3>
                                <p>إدارة المخزون والمنتجات</p>
                            </div>
                            <div class="stat-card" style="background: #f8f9fa; padding: 20px; border-radius: 12px; text-align: center;">
                                <i class="fas fa-receipt fa-2x" style="color: #27ae60;"></i>
                                <h3>الطلبات</h3>
                                <p>متابعة طلبات التقسيط</p>
                            </div>
                            <div class="stat-card" style="background: #f8f9fa; padding: 20px; border-radius: 12px; text-align: center;">
                                <i class="fas fa-users fa-2x" style="color: #2980b9;"></i>
                                <h3>العملاء</h3>
                                <p>إدارة بيانات العملاء</p>
                            </div>
                        </div>
                    </div>
                `;
                break;
        }
        
        console.log('✅ تم تحميل الموديول بنجاح:', moduleName);
        
    } catch (err) {
        console.error('❌ خطأ أثناء تحميل الموديول:', err);
        container.innerHTML = `
            <div class="alert alert-danger" style="padding: 20px; margin: 20px; background: #f8d7da; border-radius: 8px; color: #721c24;">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>حدث خطأ</h3>
                <p>فشل تحميل القسم المطلوب: ${err.message}</p>
                <button onclick="location.reload()" class="btn btn-primary">إعادة تحميل الصفحة</button>
            </div>
        `;
    } finally {
        // إخفاء loader بعد الانتهاء
        if (loader) loader.style.display = 'none';
    }
}

// جعل الدالة متاحة عالمياً
window.switchModule = switchModule;

// تهيئة القائمة الجانبية والاستماع للأحداث
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 نظام Tera Gateway جاهز');
    
    // ربط أحداث النقر على عناصر القائمة
    const menuItems = document.querySelectorAll('#admin-menu .nav-item');
    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const moduleName = item.getAttribute('data-module');
            if (moduleName) {
                switchModule(moduleName);
            }
        });
    });
    
    // تحديد الموديول الافتراضي من الـ URL hash
    let defaultModule = window.location.hash.replace('#', '');
    if (!defaultModule || !['dashboard', 'products', 'orders', 'customers', 'settings'].includes(defaultModule)) {
        defaultModule = 'dashboard';
    }
    
    // تحميل الموديول الافتراضي
    switchModule(defaultModule);
});

// الاستماع لتغيرات الـ hash (أزرار الرجوع والتقدم)
window.addEventListener('hashchange', () => {
    const moduleName = window.location.hash.replace('#', '');
    if (moduleName && ['dashboard', 'products', 'orders', 'customers', 'settings'].includes(moduleName)) {
        switchModule(moduleName);
    }
});
