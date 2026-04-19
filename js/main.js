/**
 * js/main.js - الملف الرئيسي للوحة التحكم
 * نظام إدارة Tera Gateway
 * @version 2.0.0
 */

// ===================== استيراد الموديولات الأساسية =====================

// استيراد الموديولات الموجودة
import { initProducts } from './modules/products.js';

// استيرادات اختيارية مع معالجة الأخطاء
let initOrders, initCustomers, initSettings, initDashboard;

// ذاكرة تخزين مؤقت للموديولات المحملة
const moduleCache = new Map();
let currentModule = null;

// ===================== تحميل الموديولات الديناميكي =====================

/**
 * تحميل موديول بشكل ديناميكي مع التخزين المؤقت
 */
async function loadModule(moduleName, modulePath) {
    // التحقق من وجود الموديول في الذاكرة المؤقتة
    if (moduleCache.has(moduleName)) {
        return moduleCache.get(moduleName);
    }
    
    try {
        const module = await import(modulePath);
        moduleCache.set(moduleName, module);
        return module;
    } catch (error) {
        console.warn(`⚠️ موديول ${moduleName} غير جاهز بعد:`, error.message);
        return null;
    }
}

// تحميل الموديولات بشكل غير متزامن
(async function loadModules() {
    try {
        const ordersModule = await loadModule('orders', './modules/orders-dashboard.js');
        if (ordersModule) initOrders = ordersModule.initOrdersDashboard;
        
        const customersModule = await loadModule('customers', './modules/customers.js');
        if (customersModule) initCustomers = customersModule.initCustomers;
        
        const settingsModule = await loadModule('settings', './modules/settings.js');
        if (settingsModule) initSettings = settingsModule.initSettings;
        
        const dashboardModule = await loadModule('dashboard', './modules/dashboard.js');
        if (dashboardModule) initDashboard = dashboardModule.initDashboard;
        
    } catch (e) {
        console.warn('⚠️ بعض الموديولات غير متوفرة:', e.message);
    }
})();

// ===================== دوال مساعدة =====================

/**
 * عرض رسالة خطأ للمستخدم
 */
function showErrorMessage(container, message, showReload = true) {
    container.innerHTML = `
        <div class="alert alert-danger" style="padding: 20px; margin: 20px; background: #f8d7da; border-radius: 8px; color: #721c24; text-align: center;">
            <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 10px; display: block;"></i>
            <h3>حدث خطأ</h3>
            <p>${escapeHtml(message)}</p>
            ${showReload ? '<button onclick="location.reload()" style="margin-top: 10px; padding: 8px 20px; background: #721c24; color: white; border: none; border-radius: 5px; cursor: pointer;">إعادة تحميل الصفحة</button>' : ''}
        </div>
    `;
}

/**
 * عرض شاشة "قيد التطوير"
 */
function showUnderConstruction(container, title, icon = 'fa-cog') {
    container.innerHTML = `
        <div class="under-construction" style="padding: 40px 20px; text-align: center;">
            <i class="fas ${icon} fa-4x" style="color: #3498db; margin-bottom: 20px; display: block;"></i>
            <h2 style="color: #2c3e50;">${escapeHtml(title)}</h2>
            <p style="color: #7f8c8d; margin-top: 10px;">هذا القسم قيد التطوير حاليًا، سيتم إطلاقه قريبًا.</p>
            <div style="width: 50px; height: 4px; background: #3498db; margin: 20px auto; border-radius: 2px;"></div>
        </div>
    `;
}

/**
 * عرض لوحة التحكم الرئيسية
 */
function showDashboard(container) {
    const today = new Date();
    const dateStr = today.toLocaleDateString('ar-SA', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    container.innerHTML = `
        <div class="dashboard-welcome" style="padding: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px; margin-bottom: 30px;">
                <div>
                    <h1 style="color: #2c3e50; margin: 0;">
                        <i class="fas fa-chart-line" style="color: #e67e22;"></i> 
                        لوحة التحكم الرئيسية
                    </h1>
                    <p style="color: #7f8c8d; margin-top: 5px;">مرحبًا بك في نظام Tera Gateway لإدارة المبيعات والتقسيط</p>
                </div>
                <div style="background: #f8f9fa; padding: 10px 20px; border-radius: 10px;">
                    <i class="fas fa-calendar-alt" style="color: #3498db;"></i>
                    <span style="margin-right: 8px;">${dateStr}</span>
                </div>
            </div>
            
            <hr style="margin: 20px 0; border-color: #eee;">
            
            <div class="stats-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 25px; margin-top: 30px;">
                <div class="stat-card" data-module="products" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 25px; border-radius: 15px; text-align: center; color: white; cursor: pointer; transition: transform 0.3s ease;">
                    <i class="fas fa-box fa-3x" style="margin-bottom: 15px;"></i>
                    <h3 style="margin: 10px 0;">المنتجات</h3>
                    <p style="opacity: 0.9;">إدارة المخزون والمنتجات</p>
                    <div style="margin-top: 15px;">
                        <small><i class="fas fa-arrow-left"></i> انقر للدخول</small>
                    </div>
                </div>
                
                <div class="stat-card" data-module="orders" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 25px; border-radius: 15px; text-align: center; color: white; cursor: pointer; transition: transform 0.3s ease;">
                    <i class="fas fa-receipt fa-3x" style="margin-bottom: 15px;"></i>
                    <h3 style="margin: 10px 0;">الطلبات</h3>
                    <p style="opacity: 0.9;">متابعة طلبات التقسيط والفواتير</p>
                    <div style="margin-top: 15px;">
                        <small><i class="fas fa-arrow-left"></i> انقر للدخول</small>
                    </div>
                </div>
                
                <div class="stat-card" data-module="customers" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 25px; border-radius: 15px; text-align: center; color: white; cursor: pointer; transition: transform 0.3s ease;">
                    <i class="fas fa-users fa-3x" style="margin-bottom: 15px;"></i>
                    <h3 style="margin: 10px 0;">العملاء</h3>
                    <p style="opacity: 0.9;">إدارة بيانات العملاء والعناوين</p>
                    <div style="margin-top: 15px;">
                        <small><i class="fas fa-arrow-left"></i> انقر للدخول</small>
                    </div>
                </div>
                
                <div class="stat-card" data-module="settings" style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); padding: 25px; border-radius: 15px; text-align: center; color: white; cursor: pointer; transition: transform 0.3s ease;">
                    <i class="fas fa-cog fa-3x" style="margin-bottom: 15px;"></i>
                    <h3 style="margin: 10px 0;">الإعدادات</h3>
                    <p style="opacity: 0.9;">تكوين النظام والإعدادات العامة</p>
                    <div style="margin-top: 15px;">
                        <small><i class="fas fa-arrow-left"></i> انقر للدخول</small>
                    </div>
                </div>
            </div>
            
            <div style="margin-top: 40px; padding: 20px; background: #f8f9fa; border-radius: 15px; text-align: center;">
                <i class="fas fa-chart-simple" style="color: #e67e22; font-size: 2rem;"></i>
                <p style="margin-top: 10px; color: #6c757d;">
                    إحصائيات وأرقام اليوم ستظهر هنا قريباً
                </p>
            </div>
        </div>
        
        <style>
            .stat-card:hover {
                transform: translateY(-5px);
                box-shadow: 0 10px 25px rgba(0,0,0,0.2);
            }
        </style>
    `;
    
    // إضافة مستمعات للأحداث على البطاقات
    const cards = container.querySelectorAll('.stat-card');
    cards.forEach(card => {
        card.addEventListener('click', () => {
            const moduleName = card.getAttribute('data-module');
            if (moduleName) {
                switchModule(moduleName);
            }
        });
    });
}

/**
 * منع هجمات XSS
 */
function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

/**
 * إظهار أو إخفاء مؤشر التحميل
 */
function setLoader(show) {
    const loader = document.getElementById('loader');
    if (loader) {
        loader.style.display = show ? 'flex' : 'none';
    }
}

/**
 * تحديث عنوان الصفحة بناءً على الموديول النشط
 */
function updatePageTitle(moduleName) {
    const titles = {
        'dashboard': 'الرئيسية',
        'products': 'المنتجات',
        'orders': 'الطلبات',
        'customers': 'العملاء',
        'settings': 'الإعدادات'
    };
    const pageTitle = titles[moduleName] || 'لوحة التحكم';
    document.title = `Tera Gateway | ${pageTitle}`;
}

// ===================== دالة تبديل الموديولات الرئيسية =====================

/**
 * تبديل الموديول النشط
 */
async function switchModule(moduleName) {
    // منع إعادة تحميل نفس الموديول
    if (currentModule === moduleName) {
        console.log('ℹ️ الموديول نشط بالفعل:', moduleName);
        return;
    }
    
    console.log('🔄 تحميل الموديول:', moduleName);
    
    const container = document.getElementById('module-container');
    if (!container) {
        console.error('❌ عنصر module-container غير موجود');
        return;
    }
    
    // إظهار loader وإخفاء المحتوى القديم
    setLoader(true);
    container.innerHTML = '';
    
    // تحديث العنصر النشط في القائمة الجانبية
    if (typeof window.setActiveNavItem === 'function') {
        window.setActiveNavItem(moduleName);
    }
    
    // تحديث عنوان الصفحة
    updatePageTitle(moduleName);
    
    // تحديث الـ URL hash (تجنب الحلقات اللانهائية)
    const currentHash = window.location.hash.replace('#', '');
    if (currentHash !== moduleName) {
        window.location.hash = moduleName;
    }
    
    try {
        switch (moduleName) {
            case 'dashboard':
                if (initDashboard) {
                    await initDashboard(container);
                } else {
                    showDashboard(container);
                }
                break;
                
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
                    showUnderConstruction(container, 'نظام الطلبات والفواتير', 'fa-receipt');
                }
                break;
                
            case 'customers':
                if (initCustomers) {
                    await initCustomers(container);
                } else {
                    showUnderConstruction(container, 'إدارة العملاء', 'fa-users');
                }
                break;
                
            case 'settings':
                if (initSettings) {
                    await initSettings(container);
                } else {
                    showUnderConstruction(container, 'الإعدادات والتكوين', 'fa-cog');
                }
                break;
                
            default:
                showDashboard(container);
                moduleName = 'dashboard';
                break;
        }
        
        currentModule = moduleName;
        console.log('✅ تم تحميل الموديول بنجاح:', moduleName);
        
    } catch (err) {
        console.error('❌ خطأ أثناء تحميل الموديول:', err);
        showErrorMessage(container, err.message);
    } finally {
        setLoader(false);
    }
}

// جعل الدالة متاحة عالمياً
window.switchModule = switchModule;

// ===================== التحميل المسبق للموديولات (Preload) =====================

/**
 * تحميل موديول مسبقاً عند تمرير الماوس
 */
function preloadOnHover() {
    const menuItems = document.querySelectorAll('#admin-menu .nav-item');
    const modulePaths = {
        'orders': './modules/orders-dashboard.js',
        'customers': './modules/customers.js',
        'settings': './modules/settings.js'
    };
    
    menuItems.forEach(item => {
        const moduleName = item.getAttribute('data-module');
        const modulePath = modulePaths[moduleName];
        
        if (modulePath && !moduleCache.has(moduleName)) {
            item.addEventListener('mouseenter', () => {
                console.log(`📦 تحميل مسبق للموديول: ${moduleName}`);
                import(modulePath).catch(e => console.warn(`فشل التحميل المسبق لـ ${moduleName}:`, e.message));
            }, { once: true });
        }
    });
}

// ===================== التهيئة والإعدادات =====================

/**
 * تهيئة التطبيق
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 نظام Tera Gateway جاهز');
    console.log(`📅 التاريخ: ${new Date().toLocaleDateString('ar-SA')}`);
    
    // ربط أحداث النقر على عناصر القائمة
    const menuItems = document.querySelectorAll('#admin-menu .nav-item');
    menuItems.forEach(item => {
        // إزالة أي مستمعات سابقة (للتأكد)
        const newItem = item.cloneNode(true);
        item.parentNode.replaceChild(newItem, item);
        
        newItem.addEventListener('click', (e) => {
            e.preventDefault();
            const moduleName = newItem.getAttribute('data-module');
            if (moduleName) {
                switchModule(moduleName);
            }
        });
    });
    
    // تحديد الموديول الافتراضي من الـ URL hash
    let defaultModule = window.location.hash.replace('#', '');
    const validModules = ['dashboard', 'products', 'orders', 'customers', 'settings'];
    
    if (!defaultModule || !validModules.includes(defaultModule)) {
        defaultModule = 'dashboard';
    }
    
    // تفعيل التحميل المسبق
    preloadOnHover();
    
    // تحميل الموديول الافتراضي
    setTimeout(() => {
        switchModule(defaultModule);
    }, 50);
});

// الاستماع لتغيرات الـ hash (أزرار الرجوع والتقدم)
window.addEventListener('hashchange', () => {
    const moduleName = window.location.hash.replace('#', '');
    const validModules = ['dashboard', 'products', 'orders', 'customers', 'settings'];
    
    if (moduleName && validModules.includes(moduleName)) {
        // منع التكرار إذا كان نفس الموديول
        if (currentModule !== moduleName) {
            switchModule(moduleName);
        }
    }
});

// ===================== التعامل مع الأخطاء العامة =====================

// التقاط الأخطاء غير المعالجة
window.addEventListener('error', (event) => {
    console.error('❌ خطأ عام:', event.error);
    
    // عرض إشعار للمستخدم في حالة الأخطاء الحرجة
    if (event.error?.message?.includes('Firebase')) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #e74c3c;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 10000;
            font-family: 'Tajawal', sans-serif;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        notification.innerHTML = `
            <i class="fas fa-plug"></i> 
            مشكلة في الاتصال بقاعدة البيانات، يرجى التحقق من الاتصال بالإنترنت
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => notification.remove(), 5000);
    }
});

// ===================== تصدير الدوال للاستخدام الخارجي =====================
export { switchModule, setLoader, currentModule };
