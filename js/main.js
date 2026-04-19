/**
 * js/main.js - الملف الرئيسي لنظام Tera Gateway
 */

console.log('🚀 main.js تم تحميله بنجاح');

// استيراد الموديولات الموجودة - تم التعديل هنا
import { initProducts } from './modules/products-ui.js';

// استيرادات اختيارية
let initOrders, initCustomers, initSettings, initDashboard;

// تحميل الموديولات الديناميكية
try {
    const ordersModule = await import('./modules/orders.js');
    initOrders = ordersModule.initOrdersDashboard || ordersModule.initOrders;
    console.log('✅ موديول الطلبات تم تحميله');
} catch (e) {
    console.warn('⚠️ موديول الطلبات:', e.message);
}

try {
    const customersModule = await import('./modules/customers.js');
    initCustomers = customersModule.initCustomers;
    console.log('✅ موديول العملاء تم تحميله');
} catch (e) {
    console.warn('⚠️ موديول العملاء:', e.message);
}

try {
    const settingsModule = await import('./modules/settings.js');
    initSettings = settingsModule.initSettings;
    console.log('✅ موديول الإعدادات تم تحميله');
} catch (e) {
    console.warn('⚠️ موديول الإعدادات:', e.message);
}

try {
    const dashboardModule = await import('./modules/dashboard.js');
    initDashboard = dashboardModule.initDashboard;
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
                <div onclick="window.switchModule('products')" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 25px; border-radius: 15px; color: white; cursor: pointer;">
                    <i class="fas fa-box fa-2x"></i>
                    <h3>المنتجات</h3>
                </div>
                <div onclick="window.switchModule('orders')" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 25px; border-radius: 15px; color: white; cursor: pointer;">
                    <i class="fas fa-receipt fa-2x"></i>
                    <h3>الطلبات</h3>
                </div>
                <div onclick="window.switchModule('customers')" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 25px; border-radius: 15px; color: white; cursor: pointer;">
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
    console.log('🔄 switchModule تم استدعاؤها مع:', moduleName);
    
    const loader = document.getElementById('loader');
    const container = document.getElementById('module-container');
    
    if (!container) {
        console.error('❌ module-container غير موجود');
        return;
    }
    
    // إظهار loader
    if (loader) loader.style.display = 'block';
    container.innerHTML = '';
    
    // تحديث القائمة النشطة
    if (typeof window.setActiveNavItem === 'function') {
        window.setActiveNavItem(moduleName);
    }
    
    // تحديث الـ URL hash
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
                    container.innerHTML = '<div style="padding: 20px;">قسم المنتجات غير متاح</div>';
                }
                break;
                
            case 'orders':
                if (initOrders) {
                    await initOrders(container);
                } else {
                    showUnderConstruction(container, 'نظام الطلبات', 'fa-receipt');
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
                    showUnderConstruction(container, 'الإعدادات', 'fa-cog');
                }
                break;
                
            default:
                showDashboardPlaceholder(container);
        }
        
        console.log('✅ تم تحميل الموديول:', moduleName);
        
    } catch (err) {
        console.error('❌ خطأ:', err);
        container.innerHTML = `<div style="padding: 20px; color: red;">خطأ: ${err.message}</div>`;
    } finally {
        if (loader) loader.style.display = 'none';
    }
}

// جعل الدالة متاحة عالمياً
window.switchModule = switchModule;

// ===================== ربط أحداث القائمة =====================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOM جاهز، جاري تهيئة القائمة...');
    
    // ربط الأحداث بعناصر القائمة
    const menuItems = document.querySelectorAll('#admin-menu .nav-item');
    console.log('📋 عدد عناصر القائمة:', menuItems.length);
    
    menuItems.forEach((item, index) => {
        const moduleName = item.getAttribute('data-module');
        console.log(`عنصر ${index}: ${moduleName}`);
        
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

// الاستماع لتغيرات الـ hash
window.addEventListener('hashchange', () => {
    const moduleName = window.location.hash.replace('#', '');
    console.log('🔁 تغير الـ hash:', moduleName);
    if (moduleName) {
        switchModule(moduleName);
    }
});

// دالة تحديث القائمة النشطة
window.setActiveNavItem = function(moduleName) {
    console.log('🎨 تحديد العنصر النشط:', moduleName);
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

// ===================== دوال احتياطية للتأكد من عمل الموديولات =====================

// دالة احتياطية للمنتجات إذا لم تكن معرفة
if (typeof initProducts !== 'function') {
    window.initProducts = async function(container) {
        console.log('🔄 استخدام الدالة الاحتياطية للمنتجات');
        container.innerHTML = `
            <div style="padding: 25px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h2><i class="fas fa-box" style="color: #e67e22;"></i> إدارة المنتجات</h2>
                    <button onclick="alert('إضافة منتج جديد')" style="background: #e67e22; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer;">
                        <i class="fas fa-plus"></i> منتج جديد
                    </button>
                </div>
                <div style="background: white; border-radius: 12px; padding: 20px;">
                    <p style="text-align: center; color: #7f8c8d;">قائمة المنتجات ستظهر هنا</p>
                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 15px; margin-top: 20px;">
                        <div style="background: #f8f9fa; padding: 15px; border-radius: 10px; border-right: 3px solid #e67e22;">
                            <h4>منتج تجريبي 1</h4>
                            <p>السعر: 100 ر.س</p>
                            <p>المخزون: 10</p>
                        </div>
                        <div style="background: #f8f9fa; padding: 15px; border-radius: 10px; border-right: 3px solid #e67e22;">
                            <h4>منتج تجريبي 2</h4>
                            <p>السعر: 200 ر.س</p>
                            <p>المخزون: 5</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    };
    initProducts = window.initProducts;
}

// دالة احتياطية للعملاء
if (typeof initCustomers !== 'function') {
    window.initCustomers = async function(container) {
        console.log('🔄 استخدام الدالة الاحتياطية للعملاء');
        container.innerHTML = `
            <div style="padding: 25px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h2><i class="fas fa-users" style="color: #e67e22;"></i> إدارة العملاء</h2>
                    <button onclick="alert('إضافة عميل جديد')" style="background: #e67e22; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer;">
                        <i class="fas fa-user-plus"></i> عميل جديد
                    </button>
                </div>
                <div style="background: white; border-radius: 12px; overflow-x: auto;">
                    <table style="width: 100%; border-collapse: collapse; min-width: 500px;">
                        <thead style="background: #f8f9fa;">
                            <tr>
                                <th style="padding: 12px;">الاسم</th>
                                <th style="padding: 12px;">الجوال</th>
                                <th style="padding: 12px;">المدينة</th>
                                <th style="padding: 12px;">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style="padding: 10px;">محمد عبدالله</td>
                                <td style="padding: 10px;">0501234567</td>
                                <td style="padding: 10px;">الرياض</td>
                                <td style="padding: 10px;">
                                    <button style="color:#f39c12; background:none; border:none; cursor:pointer;">تعديل</button>
                                    <button style="color:#e74c3c; background:none; border:none; cursor:pointer;">حذف</button>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 10px;">نورة أحمد</td>
                                <td style="padding: 10px;">0551234567</td>
                                <td style="padding: 10px;">جدة</td>
                                <td style="padding: 10px;">
                                    <button style="color:#f39c12; background:none; border:none; cursor:pointer;">تعديل</button>
                                    <button style="color:#e74c3c; background:none; border:none; cursor:pointer;">حذف</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    };
    initCustomers = window.initCustomers;
}

// دالة احتياطية للطلبات
if (typeof initOrders !== 'function') {
    window.initOrders = async function(container) {
        console.log('🔄 استخدام الدالة الاحتياطية للطلبات');
        container.innerHTML = `
            <div style="padding: 25px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h2><i class="fas fa-receipt" style="color: #e67e22;"></i> طلبات التقسيط</h2>
                    <button onclick="alert('طلب جديد')" style="background: #27ae60; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer;">
                        <i class="fas fa-plus"></i> طلب جديد
                    </button>
                </div>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 20px;">
                    <div style="background: white; border-radius: 12px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                        <div><span style="background:#e3f2fd; padding:4px 10px; border-radius:6px;">INV-001</span> <span style="color:#27ae60;">مدفوع</span></div>
                        <h4>أحمد محمد</h4>
                        <p>0501234567</p>
                        <div><strong>المبلغ: 1500 ر.س</strong></div>
                    </div>
                    <div style="background: white; border-radius: 12px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                        <div><span style="background:#fff3cd; padding:4px 10px; border-radius:6px;">INV-002</span> <span style="color:#e67e22;">قيد الانتظار</span></div>
                        <h4>سارة علي</h4>
                        <p>0551234567</p>
                        <div><strong>المبلغ: 2500 ر.س</strong></div>
                    </div>
                </div>
            </div>
        `;
    };
    initOrders = window.initOrders;
}

// دالة احتياطية للإعدادات
if (typeof initSettings !== 'function') {
    window.initSettings = async function(container) {
        console.log('🔄 استخدام الدالة الاحتياطية للإعدادات');
        container.innerHTML = `
            <div style="padding: 25px;">
                <h2><i class="fas fa-cog" style="color: #e67e22;"></i> إعدادات النظام</h2>
                <div style="background: white; border-radius: 12px; padding: 25px; max-width: 500px;">
                    <form onsubmit="alert('تم حفظ الإعدادات'); return false;">
                        <div style="margin-bottom: 15px;">
                            <label>اسم الشركة</label>
                            <input type="text" value="تيرا جيتواي" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:8px;">
                        </div>
                        <div style="margin-bottom: 15px;">
                            <label>نسبة الضريبة (%)</label>
                            <input type="number" value="15" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:8px;">
                        </div>
                        <button type="submit" style="background:#e67e22; color:white; padding:10px 20px; border:none; border-radius:8px; cursor:pointer;">حفظ</button>
                    </form>
                </div>
            </div>
        `;
    };
    initSettings = window.initSettings;
}

// دالة احتياطية للوحة الرئيسية
if (typeof initDashboard !== 'function') {
    window.initDashboard = async function(container) {
        console.log('🔄 استخدام الدالة الاحتياطية للوحة الرئيسية');
        showDashboardPlaceholder(container);
    };
    initDashboard = window.initDashboard;
}

// تحديث المتغيرات العالمية
initProducts = window.initProducts;
initCustomers = window.initCustomers;
initOrders = window.initOrders;
initSettings = window.initSettings;
initDashboard = window.initDashboard;

console.log('✅ جميع الدوال الاحتياطية تم تجهيزها');
