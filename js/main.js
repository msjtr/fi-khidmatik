/**
 * js/main.js
 * الملف الرئيسي لإدارة نظام "تيرا جيت واي"
 * المطور: محمد بن صالح الشمري
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

    // تحديث عنوان الصفحة وواجهة المستخدم
    document.title = `تيرا جيت واي | ${route.title}`;
    
    // إظهار مؤشر تحميل بسيط
    container.innerHTML = `<div style="text-align:center; padding:50px;"><i class="fas fa-spinner fa-spin fa-2x"></i></div>`;

    try {
        // تحميل محتوى الـ HTML للموديول
        const response = await fetch(`admin/modules/${route.file}?v=${Date.now()}`);
        if (!response.ok) throw new Error("فشل تحميل ملف الموديول");
        
        const html = await response.text();
        container.innerHTML = html;

        // تهيئة الموديول برمجياً (انتظار بسيط للتأكد من حقن الـ DOM)
        setTimeout(() => {
            initModuleLogic(hash, container);
        }, 50);

    } catch (error) {
        console.error("Navigation Error:", error);
        container.innerHTML = `
            <div style="text-align:center; padding:50px; color:#ef4444;">
                <i class="fas fa-exclamation-triangle fa-3x"></i>
                <p>حدث خطأ أثناء تحميل صفحة ${route.title}.</p>
                <button onclick="window.handleRoute()" class="btn-primary-custom">إعادة المحاولة</button>
            </div>`;
    }
};

// 3. تشغيل المنطق الخاص بكل موديول بعد التحميل
async function initModuleLogic(hash, container) {
    try {
        switch (hash) {
            case 'customers':
                // استيراد موديول العملاء
                const custModule = await import(`./modules/customers-ui.js?v=${Date.now()}`);
                
                // تشغيل الدالة الأساسية لبناء الجدول
                if (custModule.initCustomersUI) {
                    await custModule.initCustomersUI(container);
                }

                // ربط كافة الدوال التي يحتاجها الـ HTML بـ window
                window.openCustomerModal = custModule.openCustomerModal;
                window.handleCustomerSubmit = custModule.handleCustomerSubmit;
                window.exportCustomersToExcel = custModule.exportCustomersToExcel;
                window.handleImport = custModule.handleImport;
                window.filterCustomersTable = custModule.filterCustomersTable;
                break;
            
            case 'dashboard':
                const dashModule = await import(`./modules/dashboard.js?v=${Date.now()}`);
                if (dashModule.initDashboard) dashModule.initDashboard();
                break;

            case 'orders':
                // مثال لموديول الطلبات
                const orderModule = await import(`./modules/orders-ui.js?v=${Date.now()}`);
                if (orderModule.initOrders) orderModule.initOrders(container);
                break;
        }
    } catch (err) {
        console.error(`Error initializing module [${hash}]:`, err);
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
    // تشغيل الراوتر عند تغيير الـ Hash
    window.addEventListener('hashchange', window.handleRoute);
    
    // تشغيل المسار الحالي (عند الدخول أول مرة)
    window.handleRoute();

    // التأكد من وجود Firebase في النطاق العالمي
    if (!window.db) {
        console.warn("⚠️ تنبيه: لم يتم اكتشاف اتصال window.db بعد. تأكد من ملف firebase-config.");
    }
});

/**
 * دالة مساعدة عالمية لجلب البيانات
 */
window.getCollectionData = async (collectionName) => {
    if (!window.db) {
        console.error("Database not initialized");
        return [];
    }
    try {
        const snapshot = await window.db.collection(collectionName).get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error(`Error fetching ${collectionName}:`, error);
        return [];
    }
};
