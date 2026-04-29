/**
 * js/main.js - V12.12.6
 * المحرك المركزي لنظام تيرا جيت واي (Tera Gateway)
 * متوافق مع إصدار Firebase 10.7.1
 */

import { db, auth, ensureDbReady } from './core/config.js';
import { initCustomersUI } from './modules/customers-ui.js';

/**
 * دالة إدارة التنقل (Sidebar Router)
 * تم ربطها بـ window لضمان عملها مع onclick في HTML
 */
window.handleSidebarClick = async function(element, moduleName) {
    console.log(`🔄 Tera Router: جاري التحميل... [${moduleName}]`);
    
    // 1. تحديث الحالة البصرية للقائمة الجانبية (Active State)
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    if (element) {
        element.classList.add('active');
    } else {
        const target = document.querySelector(`.nav-item[data-module="${moduleName}"]`);
        if (target) target.classList.add('active');
    }

    // 2. تحديث رابط الصفحة (Hash)
    if (window.location.hash !== `#${moduleName}`) {
        window.location.hash = `#${moduleName}`;
    }

    // 3. تحديد منطقة عرض المحتوى (Main Render Area)
    const mainContent = document.getElementById('main-render-area');
    if (mainContent) {
        await renderModule(moduleName, mainContent);
    }

    // 4. إغلاق القائمة في وضع الجوال (Mobile UX)
    const sidebar = document.querySelector('.sidebar-container');
    if (sidebar) sidebar.classList.remove('mobile-open');
};

/**
 * الموزع المنطقي للموديولات (Module Switcher)
 */
async function renderModule(moduleName, container) {
    // التأكد من جاهزية قاعدة البيانات قبل محاولة جلب البيانات
    const isReady = await ensureDbReady();
    if (!isReady) {
        container.innerHTML = '<div class="alert error">❌ فشل الاتصال بقاعدة بيانات تيرا.</div>';
        return;
    }

    // تنظيف الحاوية قبل الرسم الجديد
    container.innerHTML = '<div class="loading-area"><div class="spinner"></div></div>';

    switch(moduleName) {
        case 'customers':
            // استدعاء موديول الواجهة الذي أصلحناه مسبقاً (10.7.1)
            await initCustomersUI(container);
            break;
            
        case 'dashboard':
            container.innerHTML = `
                <div class="p-4 animated fadeIn">
                    <h3>لوحة التحكم</h3>
                    <p>أهلاً بك في نظام إدارة التقسيط "في خدمتكم" - منطقة حائل.</p>
                </div>`;
            break;

        default:
            container.innerHTML = `
                <div class="p-4 text-center">
                    <i class="fas fa-tools fa-3x mb-3 text-muted"></i>
                    <h3>${moduleName}</h3>
                    <p>هذا القسم قيد التطوير في إصدارات تيرا القادمة.</p>
                </div>`;
    }
}

/**
 * مراقب تغيير الرابط (Hash Change Listener)
 * يسمح باستخدام أزرار الخلف والأمام في المتصفح
 */
window.addEventListener('hashchange', () => {
    const currentHash = window.location.hash.replace('#', '') || 'dashboard';
    window.handleSidebarClick(null, currentHash);
});

/**
 * نقطة الانطلاق (System Entry Point)
 */
document.addEventListener('DOMContentLoaded', async () => {
    console.log("🚀 Tera Engine V12.12.6 [Firebase 10.7.1] Initialized.");
    
    // تشغيل المزامنة الأولى بناءً على الرابط الحالي
    const initialHash = window.location.hash.replace('#', '') || 'dashboard';
    window.handleSidebarClick(null, initialHash);
});
