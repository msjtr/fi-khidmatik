/**
 * main.js - Tera Gateway 
 * نظام توجيه محمي ضد أخطاء الـ DOM والمسارات المفقودة
 */

import { initCustomers } from './modules/customers-core.js';

// 1. خريطة المسارات المحدثة (أضفت لك المنتجات بناءً على رسالة الخطأ)
const routes = {
    'dashboard': 'admin/modules/orders-dashboard.html',
    'customers': 'admin/modules/customers.html',
    'orders': 'admin/modules/order-form.html',
    'products': 'admin/modules/products.html', // أضفنا المنتجات هنا
    'inventory': 'admin/modules/inventory.html',
    'invoice': 'admin/modules/invoice.html',
    'payments': 'admin/modules/payments.html',
    'settings': 'admin/modules/settings.html',
    'general': 'admin/modules/general.html',
    'backup': 'admin/modules/backup.html'
};

// 2. دالة التبديل مع معالجة الأخطاء
async function switchModule(moduleName) {
    // التأكد من أن العنصر موجود قبل البدء بأي عملية
    const mainContent = document.getElementById('main-content');
    
    if (!mainContent) {
        console.warn(`⏳ جاري انتظار تحميل واجهة النظام الرئيسية...`);
        return; 
    }

    const path = routes[moduleName];
    if (!path) {
        console.error(`⚠️ الموديول ${moduleName} غير معرف في خريطة المسارات.`);
        mainContent.innerHTML = `<div style="padding:20px; color:#64748b;">هذا القسم (${moduleName}) قيد التطوير حالياً.</div>`;
        return;
    }

    try {
        const response = await fetch(path);
        if (!response.ok) throw new Error(`Status: ${response.status}`);

        const html = await response.text();
        
        // تغيير المحتوى فقط إذا كان العنصر لا يزال موجوداً
        if (mainContent) {
            mainContent.innerHTML = html;
            initializeModuleLogic(moduleName);
            window.location.hash = moduleName;
        }

    } catch (error) {
        console.error(`❌ فشل تحميل ${moduleName}:`, error);
        if (mainContent) {
            mainContent.innerHTML = `
                <div style="padding:40px; text-align:center; color:#ef4444;">
                    <i class="fas fa-exclamation-triangle" style="font-size:2rem;"></i>
                    <p>تعذر تحميل صفحة ${moduleName}</p>
                    <small>${error.message}</small>
                </div>`;
        }
    }
}

// 3. تشغيل المنطق البرمجي لكل صفحة
function initializeModuleLogic(moduleName) {
    // ننتظر أجزاء من الثانية لضمان استقرار العناصر في الصفحة
    setTimeout(() => {
        if (moduleName === 'customers') {
            const container = document.getElementById('customers-container') || document.getElementById('main-content');
            if (container) initCustomers(container);
        }
    }, 100);
}

// 4. دالة معالجة التوجيه
function handleRoute() {
    const moduleName = window.location.hash.replace('#', '') || 'dashboard';
    switchModule(moduleName);
}

// 5. التشغيل الآمن (الانتظار حتى يصبح الـ DOM جاهزاً)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', handleRoute);
} else {
    handleRoute();
}

window.addEventListener('hashchange', handleRoute);
window.switchModule = switchModule;
