/**
 * js/main.js
 * الملف الرئيسي لإدارة نظام "تيرا جيت واي"
 * مسؤول عن: التنقل بين الصفحات، تحميل الموديولات، والربط العالمي للدوال.
 */

// 1. تعريف موديولات النظام والروابط الخاصة بها
const routes = {
    'dashboard': { title: 'لوحة التحكم', file: 'dashboard.html' },
    'customers': { title: 'قاعدة بيانات العملاء', file: 'customers.html' },
    'orders':    { title: 'طلبات التقسيط', file: 'orders-dashboard.html' },
    'inventory': { title: 'المخزون', file: 'inventory.html' },
    'payments':  { title: 'المدفوعات', file: 'payments.html' },
    'settings':  { title: 'الإعدادات', file: 'settings.html' }
};

// 2. دالة إدارة التنقل (Routing)
window.handleRoute = async () => {
    const hash = window.location.hash.replace('#', '') || 'dashboard';
    const route = routes[hash];
    const container = document.getElementById('module-container');

    if (!route || !container) return;

    // تحديث عنوان الصفحة
    document.title = `تيرا جيت واي | ${route.title}`;

    try {
        // تحميل محتوى الـ HTML للموديول
        const response = await fetch(`admin/modules/${route.file}?v=${Date.now()}`);
        if (!response.ok) throw new Error("فشل تحميل ملف الموديول");
        
        const html = await response.text();
        container.innerHTML = html;

        // تهيئة الموديول برمجياً بناءً على النوع
        initModuleLogic(hash, container);

    } catch (error) {
        console.error("Navigation Error:", error);
        container.innerHTML = `<div style="text-align:center; padding:50px; color:#ef4444;">
            <i class="fas fa-exclamation-triangle fa-3x"></i>
            <p>حدث خطأ أثناء تحميل الصفحة، يرجى المحاولة مرة أخرى.</p>
        </div>`;
    }
};

// 3. تشغيل المنطق الخاص بكل موديول بعد التحميل
async function initModuleLogic(hash, container) {
    switch (hash) {
        case 'customers':
            // استيراد موديول العملاء وتشغيله
            const custModule = await import(`./modules/customers-ui.js?v=${Date.now()}`);
            if (custModule && custModule.initCustomersUI) {
                custModule.initCustomersUI(container);
                
                // ربط الدوال بالـ Global Scope لتعمل مع onclick في HTML
                window.openCustomerModal = custModule.openCustomerModal;
                window.handleCustomerSubmit = custModule.handleCustomerSubmit;
            }
            break;
        
        case 'dashboard':
            const dashModule = await import(`./modules/dashboard.js?v=${Date.now()}`);
            if (dashModule.initDashboard) dashModule.initDashboard();
            break;

        // يمكن إضافة باقي الموديولات هنا بنفس الطريقة
    }
}

// 4. دوال التحكم العامة في النوافذ المنبثقة (Modals)
window.closeCustomerModal = () => {
    const modal = document.getElementById('customer-modal');
    if (modal) {
        modal.style.display = 'none';
        const form = document.getElementById('customer-form');
        if (form) form.reset();
    }
};

// 5. تهيئة النظام عند تحميل الصفحة
window.addEventListener('DOMContentLoaded', () => {
    // تشغيل الراوتر عند تغيير الـ Hash في الرابط
    window.addEventListener('hashchange', window.handleRoute);
    
    // تشغيل المسار الحالي
    window.handleRoute();

    console.log("✅ تم تشغيل نظام تيرا جيت واي بنجاح");
});

/**
 * دالة مساعدة لجلب البيانات من Firestore (عالمية)
 * لضمان عدم تكرار كود الاتصال في كل ملف
 */
window.getCollectionData = async (collectionName) => {
    try {
        const snapshot = await window.db.collection(collectionName).get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error(`Error fetching ${collectionName}:`, error);
        return [];
    }
};
