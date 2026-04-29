/**
 * js/main.js - V12.12.6
 */
import { db, auth } from './core/config.js';

// تعريف الدالة وربطها بالنافذة بشكل صريح لتعمل مع onclick
window.handleSidebarClick = function(element, moduleName) {
    console.log("🔄 الانتقال إلى موديول:", moduleName);
    
    // 1. تحديث الحالة البصرية
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    if (element) {
        element.classList.add('active');
    } else {
        // إذا استدعيت الدالة بدون عنصر (مثلاً من الـ Router)
        const target = document.querySelector(`.nav-item[data-module="${moduleName}"]`);
        if (target) target.classList.add('active');
    }

    // 2. تغيير الهش (Hash) لتشغيل مفسر الروابط (Router)
    window.location.hash = `#${moduleName}`;

    // 3. إغلاق القائمة في الجوال
    const container = document.querySelector('.sidebar-container');
    if (container) container.classList.remove('mobile-open');
};

// مزامنة القائمة عند تحميل الصفحة أو ضغط زر "الخلف"
window.addEventListener('hashchange', () => {
    const currentHash = window.location.hash.replace('#', '') || 'dashboard';
    window.handleSidebarClick(null, currentHash);
});

// تشغيل النظام
document.addEventListener('DOMContentLoaded', () => {
    console.log("🚀 Tera Engine Started.");
    // المزامنة الأولى عند التشغيل
    const initialHash = window.location.hash.replace('#', '') || 'dashboard';
    window.handleSidebarClick(null, initialHash);
});
