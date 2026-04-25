/**
 * main.js - Tera Gateway 
 * النظام الموحد لإدارة المسارات وتشغيل الموديولات
 * التحديث: حل مشكلة تأخر تحميل DOM وتوافق مسارات GitHub
 */

import { initCustomers } from './modules/customers-core.js';

// 1. خريطة المسارات المعتمدة بناءً على ملفات GitHub الفعلية
const routes = {
    'dashboard': 'admin/modules/orders-dashboard.html',
    'customers': 'admin/modules/customers.html',
    'orders': 'admin/modules/order-form.html',
    'products': 'admin/modules/products.html',
    'inventory': 'admin/modules/inventory.html',
    'invoice': 'admin/modules/invoice.html',
    'payments': 'admin/modules/payments.html',
    'settings': 'admin/modules/settings.html',
    'general': 'admin/modules/general.html',
    'backup': 'admin/modules/backup.html'
};

/**
 * دالة تبديل الأقسام مع معالجة ذكية للأخطاء
 */
async function switchModule(moduleName) {
    const mainContent = document.getElementById('main-content');
    
    // حل مشكلة (Cannot set properties of null): المحاولة مرة أخرى إذا لم يجد العنصر
    if (!mainContent) {
        console.warn(`⏳ جاري انتظار تحميل واجهة النظام الرئيسية لفتح: ${moduleName}`);
        setTimeout(() => switchModule(moduleName), 200); 
        return;
    }

    const path = routes[moduleName];
    if (!path) {
        console.error(`⚠️ الموديول ${moduleName} غير معرف في النظام.`);
        mainContent.innerHTML = `<div style="padding:20px; color:#64748b;">هذا القسم (${moduleName}) قيد التطوير حالياً.</div>`;
        return;
    }

    try {
        // طلب ملف الـ HTML من المسار المحدد
        const response = await fetch(path);
        
        if (!response.ok) {
            throw new Error(`فشل تحميل الملف: ${path} (Status: ${response.status})`);
        }

        const html = await response.text();
        
        // حقن المحتوى داخل الحاوية الرئيسية
        mainContent.innerHTML = html;

        // تشغيل المنطق البرمجي الخاص بالموديول
        initializeModuleLogic(moduleName);

        // تحديث عنوان الـ Hash في المتصفح
        if (window.location.hash !== `#${moduleName}`) {
            window.location.hash = moduleName;
        }
        
        console.log(`✅ تم تحميل ${moduleName} بنجاح.`);

    } catch (error) {
        console.error(`❌ خطأ في تحميل القسم:`, error);
        mainContent.innerHTML = `
            <div style="padding:40px; text-align:center; color:#ef4444;">
                <i class="fas fa-exclamation-circle" style="font-size:2rem; margin-bottom:15px; display:block;"></i>
                <strong>خطأ في تحميل الصفحة</strong>
                <p style="font-size:0.9rem; margin-top:10px;">${error.message}</p>
            </div>
        `;
    }
}

/**
 * دالة تشغيل الدوال الفرعية لكل قسم بعد تحميل الـ HTML
 */
function initializeModuleLogic(moduleName) {
    // ننتظر قليلاً لضمان أن المتصفح قام بتركيب الـ HTML الجديد
    setTimeout(() => {
        switch (moduleName) {
            case 'customers':
                // ابحث عن الحاوية المخصصة للعملاء أو استخدم الحاوية الرئيسية
                const container = document.getElementById('customers-container') || document.getElementById('main-content');
                if (container) initCustomers(container);
                break;
            
            case 'dashboard':
                console.log("لوحة التحكم جاهزة.");
                break;

            // أضف أي دوال Init أخرى هنا لبقية الأقسام
        }
    }, 100);
}

/**
 * دالة معالجة الرابط الحالي عند تحميل الصفحة أو تغيير الـ Hash
 */
function handleRoute() {
    const moduleName = window.location.hash.replace('#', '') || 'dashboard';
    switchModule(moduleName);
}

// البدء عند اكتمال تحميل الصفحة بالكامل لضمان وجود عنصر main-content
window.addEventListener('load', handleRoute);

// مراقبة تغيير الروابط (التنقل بين الصفحات)
window.addEventListener('hashchange', handleRoute);

// جعل الدالة متاحة عالمياً ليتم طلبها من القائمة الجانبية (onclick)
window.switchModule = switchModule;
