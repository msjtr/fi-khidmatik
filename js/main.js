/**
 * main.js - Tera Gateway 
 * نظام إدارة المسارات والتبديل بين الأقسام
 */

// استيراد الموديولات (تأكد من صحة المسارات)
import { initCustomers } from './modules/customers-core.js';
// import { initProducts } from './modules/products-ui.js'; // إذا كان جاهزاً

// 1. خريطة المسارات (مطابقة لأسماء الملفات الفعلية في GitHub)
const routes = {
    'dashboard': 'admin/modules/orders-dashboard.html',
    'customers': 'admin/modules/customers.html',
    'orders': 'admin/modules/order-form.html',
    'inventory': 'admin/modules/inventory.html',
    'invoice': 'admin/modules/invoice.html',
    'payments': 'admin/modules/payments.html',
    'settings': 'admin/modules/settings.html',
    'general': 'admin/modules/general.html',
    'backup': 'admin/modules/backup.html'
};

// 2. دالة تبديل الأقسام
async function switchModule(moduleName) {
    const mainContent = document.getElementById('main-content');
    const path = routes[moduleName];

    if (!path) {
        console.error(`الموديول ${moduleName} غير معرف في خريطة المسارات.`);
        return;
    }

    try {
        // تحميل محتوى HTML
        const response = await fetch(path);
        
        if (!response.ok) {
            throw new Error(`تعذر العثور على الملف: ${path} (Status: ${response.status})`);
        }

        const html = await response.text();
        mainContent.innerHTML = html;

        // 3. تشغيل الـ Logic الخاص بكل قسم بعد تحميل الـ HTML
        initializeModuleLogic(moduleName);

        // تحديث الرابط في المتصفح (اختياري)
        window.location.hash = moduleName;
        
        console.log(`✅ القسم ${moduleName} تم تحميله بنجاح من: ${path}`);

    } catch (error) {
        console.error("❌ خطأ في تحميل القسم:", error);
        mainContent.innerHTML = `
            <div style="padding: 20px; color: #ef4444; text-align: center;">
                <h3>حدث خطأ أثناء تحميل القسم</h3>
                <p>${error.message}</p>
                <button onclick="location.reload()" style="padding: 8px 16px; cursor: pointer;">إعادة تحميل الصفحة</button>
            </div>
        `;
    }
}

// 4. دالة تشغيل منطق الموديولات
function initializeModuleLogic(moduleName) {
    switch (moduleName) {
        case 'customers':
            const container = document.getElementById('customers-container') || document.getElementById('main-content');
            initCustomers(container);
            break;
        
        case 'dashboard':
            // هنا تضع دالة تشغيل لوحة التحكم إذا وجدت
            console.log("تشغيل لوحة تحكم الطلبات...");
            break;

        // أضف حالات (cases) لبقية الأقسام هنا
    }
}

// 5. التعامل مع التنقل (Routing)
function handleRoute() {
    const moduleName = window.location.hash.replace('#', '') || 'dashboard';
    switchModule(moduleName);
}

// تشغيل النظام عند تحميل الصفحة
window.addEventListener('load', handleRoute);
window.addEventListener('hashchange', handleRoute);

// جعل الدالة متاحة عالمياً إذا كنت تستخدمها في onclick داخل الـ Sidebar
window.switchModule = switchModule;
