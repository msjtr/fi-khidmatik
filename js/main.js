/**
 * main.js - Tera Gateway 
 * الموزع الرئيسي للنظام والمسؤول عن التنقل بين الموديولات
 * تم تحديث المسارات لتتوافق مع مجلد /admin/
 */

import { APP_CONFIG } from './core/firebase.js';
import { initCustomersUI } from './modules/customers-ui.js';

/**
 * خريطة المسارات (Routes)
 * تم تعديل المسار ليتناسب مع: fi-khidmatik/admin/modules/
 */
const routes = {
    'dashboard': 'admin/modules/orders-dashboard.html',
    'customers': 'admin/modules/customers.html',
    'orders':    'admin/modules/order-form.html',
    'products':  'admin/modules/products.html',
    'settings':  'admin/modules/settings.html',
    'reports':   'admin/modules/reports.html'
};

/**
 * دالة تبديل الموديولات ديناميكياً
 */
async function switchModule(moduleName) {
    const container = document.getElementById('module-container');
    
    if (!container) return;

    const path = routes[moduleName];
    if (!path) {
        console.error(`❌ الموديول "${moduleName}" غير معرف.`);
        return;
    }

    try {
        container.innerHTML = `
            <div style="text-align:center; padding:100px 50px; color:#2563eb;">
                <i class="fas fa-spinner fa-spin fa-3x"></i>
                <p style="margin-top:20px; font-family:'Tajawal', sans-serif;">جاري تحميل ${moduleName}...</p>
            </div>
        `;

        // محاولة جلب الملف من المسار الصحيح
        const response = await fetch(path);
        
        if (!response.ok) {
            throw new Error(`خطأ 404: الملف غير موجود في ${path}. تأكد من رفع المجلد admin كاملاً.`);
        }
        
        const html = await response.text();
        container.innerHTML = html;

        // تهيئة موديول العملاء بعد حقن الـ HTML
        if (moduleName === 'customers') {
            setTimeout(() => {
                const contentDiv = document.getElementById('customers-module-content');
                initCustomersUI(contentDiv || container);
            }, 100);
        }

        console.log(`✅ تم تحميل موديول: ${moduleName}`);

    } catch (error) {
        console.error("❌ خطأ في نظام التنقل:", error);
        container.innerHTML = `
            <div style="padding:40px; text-align:center; background:#fef2f2; border-radius:15px; border:1px solid #ef4444; margin:20px; font-family:'Tajawal';">
                <i class="fas fa-exclamation-triangle fa-2x" style="color:#dc2626;"></i>
                <h3 style="color:#991b1b; margin-top:15px;">تعذر الوصول للملف</h3>
                <p style="color:#b91c1c;">المسار المطلوب: <b>${path}</b></p>
                <p style="font-size:0.9rem; color:#475569;">تأكد من وجود مجلد admin وبداخله مجلد modules في مستودع GitHub.</p>
                <button onclick="location.reload()" style="margin-top:15px; padding:10px 25px; cursor:pointer; background:#dc2626; color:white; border:none; border-radius:8px;">إعادة محاولة</button>
            </div>
        `;
    }
}

function handleRoute() {
    const hash = window.location.hash.replace('#', '') || 'dashboard';
    switchModule(hash);
    updateActiveSidebarItem(hash);
}

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

window.addEventListener('load', handleRoute);
window.addEventListener('hashchange', handleRoute);
window.switchModule = switchModule;
