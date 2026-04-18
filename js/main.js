/**
 * المحرك الرئيسي لمنصة تيرا جيتواي - Tera Gateway
 * الإصدار: المحدث - الربط المباشر
 */

import { initOrdersDashboard } from './modules/orders.js';
import { initCustomers } from './modules/customers.js';
import { initProducts } from './modules/products.js';

// دالة التحميل للمكونات الثابتة (إذا كنت لا تزال تستخدمها)
async function loadComponent(id, path) {
    const container = document.getElementById(id);
    if (!container) return;
    try {
        const response = await fetch(`${path}?v=${Date.now()}`);
        if (!response.ok) throw new Error(`تعذر تحميل المكون: ${path}`);
        container.innerHTML = await response.text();
    } catch (err) {
        console.error(err);
        container.innerHTML = `<div style="padding:10px; color:red;">خطأ في تحميل ${path}</div>`;
    }
}

// الدالة الأساسية لتبديل الأقسام
async function switchModule(moduleName) {
    const main = document.getElementById('main-content');
    if (!main) {
        console.error("خطأ: لم يتم العثور على حاوية main-content");
        return;
    }

    // 1. تحديث الحالة البصرية في القائمة الجانبية (Sidebar)
    // نستخدم المحددات الجديدة nav-item التي وضعناها في admin.html
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-module') === moduleName) {
            item.classList.add('active');
        }
    });

    // 2. تصفير محتوى الصفحة وعرض مؤشر تحميل احترافي (Tera Style)
    main.innerHTML = `
        <div style="text-align:center; padding:100px;">
            <i class="fas fa-circle-notch fa-spin fa-3x" style="color:#e67e22; margin-bottom:15px;"></i>
            <p style="font-weight:700; color:#1a202c;">جاري تحميل ${moduleName}...</p>
        </div>
    `;

    // 3. توجيه المسارات (Router Logic)
    try {
        switch (moduleName) {
            case 'customers':
                await initCustomers(main);
                break;
            case 'products':
                await initProducts(main);
                break;
            case 'settings':
                main.innerHTML = `
                    <div style="padding:30px;">
                        <h2 style="color:#1a202c; border-bottom:2px solid #e67e22; display:inline-block; padding-bottom:10px;">إعدادات النظام</h2>
                        <p style="margin-top:20px; font-weight:600; color:#64748b;">هذا القسم قيد التطوير لمنصة تيرا...</p>
                    </div>`;
                break;
            case 'orders':
            case 'dashboard': // الرئيسية
            default:
                await initOrdersDashboard(main);
                break;
        }
    } catch (error) {
        console.error(`خطأ أثناء تشغيل الموديول ${moduleName}:`, error);
        main.innerHTML = `
            <div style="padding:40px; text-align:center; color:#e74c3c;">
                <i class="fas fa-exclamation-triangle fa-3x"></i>
                <h3 style="margin-top:15px;">حدث خطأ في النظام</h3>
                <p>${error.message}</p>
            </div>`;
    }
}

// --- السطر الأهم لحل مشكلة تعطل الأزرار ---
window.switchModule = switchModule; 

// تشغيل النظام عند تحميل الصفحة بالكامل
(async () => {
    console.log("نظام Tera Gateway جاهز...");

    // معالجة المسار الأولي (Hash Routing) أو الافتراضي
    const getHash = () => window.location.hash.replace('#', '') || 'dashboard';
    
    // تشغيل الموديول الأول عند الدخول
    await switchModule(getHash());

    // مراقبة التغيير في الروابط (Hash Change) لضمان عمل أزرار الرجوع في المتصفح
    window.addEventListener('hashchange', async () => {
        await switchModule(getHash());
    });
})();
