/**
 * main.js - Tera Gateway 
 * الموزع الرئيسي للنظام والمسؤول عن التنقل بين الموديولات
 */

// 1. استيراد الإعدادات المركزية (تضمن تفعيل Firebase أولاً من الملف المعتمد)
import { APP_CONFIG } from './core/firebase.js';

// 2. استيراد دوال تهيئة الواجهات من الموديولات
import { initCustomersUI } from './modules/customers-ui.js';

/**
 * خريطة المسارات (Routes)
 * ملاحظة: تأكد من صحة مسارات ملفات الـ HTML بناءً على مكان فتح index.html
 */
const routes = {
    'dashboard': 'modules/orders-dashboard.html',
    'customers': 'modules/customers.html', // تم تعديل المسار ليتناسب مع هيكلية المجلدات
    'orders':    'modules/order-form.html',
    'products':  'modules/products.html',
    'settings':  'modules/settings.html',
    'reports':   'modules/reports.html'
};

/**
 * دالة تبديل الموديولات ديناميكياً
 * @param {string} moduleName - اسم الموديول المطلوب تحميله
 */
async function switchModule(moduleName) {
    const container = document.getElementById('module-container');
    
    if (!container) {
        console.warn("⚠️ لم يتم العثور على حاوية 'module-container'.");
        return;
    }

    const path = routes[moduleName];
    if (!path) {
        console.error(`❌ الموديول "${moduleName}" غير معرف في نظام تيرا.`);
        return;
    }

    try {
        // إظهار مؤشر التحميل بتصميم "تيرا"
        container.innerHTML = `
            <div style="text-align:center; padding:100px 50px; color:#2563eb;">
                <i class="fas fa-spinner fa-spin fa-3x"></i>
                <p style="margin-top:20px; font-family:'Tajawal', sans-serif; font-weight:600;">جاري تحميل ${moduleName}...</p>
            </div>
        `;

        // جلب ملف الـ HTML الخاص بالموديول
        const response = await fetch(path);
        if (!response.ok) throw new Error(`لم يتم العثور على ملف الموديول في المسار: ${path}`);
        
        const html = await response.text();
        container.innerHTML = html;

        // --- تشغيل المنطق البرمجي الخاص بكل موديول ---
        
        if (moduleName === 'customers') {
            // ننتظر حقن الـ HTML ثم نربط المحرك البرمجي بالحاوية
            setTimeout(() => {
                const contentDiv = document.getElementById('customers-module-content');
                if (contentDiv) {
                    initCustomersUI(contentDiv);
                } else {
                    // إذا لم يوجد الـ ID المخصص، نستخدم الحاوية الرئيسية
                    initCustomersUI(container);
                }
            }, 50);
        }
        
        // هنا يتم إضافة تهيئة الموديولات الأخرى مستقبلاً
        // if (moduleName === 'dashboard') { initDashboardUI(container); }

        console.log(`✅ تم تحميل موديول: ${moduleName} بنجاح.`);

    } catch (error) {
        console.error("❌ خطأ في نظام التنقل:", error);
        container.innerHTML = `
            <div style="padding:40px; text-align:center; background:#fef2f2; border-radius:15px; border:1px solid #ef4444; margin:20px;">
                <i class="fas fa-exclamation-triangle fa-2x" style="color:#dc2626;"></i>
                <h3 style="color:#991b1b; margin-top:15px;">خطأ في تحميل القسم</h3>
                <p style="color:#b91c1c;">${error.message}</p>
                <button onclick="location.reload()" style="margin-top:15px; padding:8px 20px; cursor:pointer;">إعادة تحميل الصفحة</button>
            </div>
        `;
    }
}

/**
 * معالجة الـ Hash في الرابط (Routing)
 */
function handleRoute() {
    const hash = window.location.hash.replace('#', '') || 'dashboard';
    switchModule(hash);
    updateActiveSidebarItem(hash);
}

/**
 * تحديث شكل الزر النشط في القائمة الجانبية
 */
function updateActiveSidebarItem(activeHash) {
    document.querySelectorAll('.nav-link, .nav-item').forEach(item => {
        const href = item.getAttribute('href');
        if (href && href.includes(activeHash)) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

// تشغيل النظام
window.addEventListener('load', () => {
    console.log(`🚀 محرك ${APP_CONFIG.name} (الإصدار ${APP_CONFIG.version}) قيد العمل.`);
    handleRoute();
});

window.addEventListener('hashchange', handleRoute);

// إتاحة الدالة عالمياً
window.switchModule = switchModule;
