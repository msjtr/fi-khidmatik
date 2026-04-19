/**
 * js/main.js
 */
import { initProducts } from './modules/products.js';
// تأكد أن هذه الملفات موجودة فعلياً بهذا الاسم في المجلد
// import { initOrdersDashboard } from './modules/orders-dashboard.js';
// import { initCustomers } from './modules/customers.js';

async function switchModule(moduleName) {
    console.log("المحرك بدأ تنفيذ الموديول:", moduleName);
    const container = document.getElementById('module-container');
    if (!container) return;

    // تنظيف الحاوية وإظهار اللودر
    container.innerHTML = '';
    
    try {
        if (moduleName === 'products') {
            await initProducts(container);
        } else if (moduleName === 'dashboard' || moduleName === 'orders') {
            // مؤقتاً حتى ترفع ملف Orders
            container.innerHTML = '<h2 style="padding:20px;">قسم الطلبات قيد الرفع...</h2>';
        } else if (moduleName === 'customers') {
            container.innerHTML = '<h2 style="padding:20px;">قسم العملاء قيد الرفع...</h2>';
        } else {
            container.innerHTML = '<h2 style="padding:20px;">قسم الإعدادات</h2>';
        }
    } catch (err) {
        console.error("خطأ أثناء تحميل الموديول:", err);
        container.innerHTML = '<p style="color:red; padding:20px;">فشل تحميل القسم، راجع الـ Console</p>';
    }
}

// السطر الأهم لحل مشكلتك:
window.switchModule = switchModule;

// تشغيل موديول افتراضي عند فتح الصفحة
window.addEventListener('DOMContentLoaded', () => {
    const defaultModule = window.location.hash.replace('#', '') || 'dashboard';
    switchModule(defaultModule);
});
