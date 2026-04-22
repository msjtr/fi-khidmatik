/**
 * js/main.js
 * المحرك الرئيسي - نظام تيرا جيتواي
 */

// استيراد الموديولات بالأسماء الصحيحة (تأكد من وجودها في GitHub)
import { initProducts } from './modules/products-ui.js';
import { initCustomers } from './modules/customers-core.js';
// استيراد أداة الانتظار للتأكد من اتصال قاعدة البيانات قبل التحميل
import { waitForFirebase } from './core/firebase.js';

async function switchModule(moduleName) {
    console.log("🚀 محاولة فتح قسم:", moduleName);
    const container = document.getElementById('module-container');
    const loader = document.getElementById('loader'); // إذا كان لديك عنصر تحميل

    if (!container) return;

    // إظهار رسالة انتظار
    container.innerHTML = `
        <div style="padding:40px; text-align:center;">
            <div class="spinner"></div>
            <p>جاري تحميل البيانات...</p>
        </div>`;

    try {
        // الانتظار حتى يتم تهيئة Firebase تماماً لتجنب خطأ "db is null"
        await waitForFirebase();

        switch (moduleName) {
            case 'products':
                await initProducts(container);
                break;
            case 'customers':
                await initCustomers(container);
                break;
            case 'dashboard':
            case 'orders':
                container.innerHTML = `
                    <div style="padding:40px;">
                        <h2>📦 قسم الطلبات</h2>
                        <p>هذا القسم قيد التحديث ليتوافق مع نظام الفواتير الجديد.</p>
                    </div>`;
                break;
            default:
                container.innerHTML = `
                    <div style="padding:40px;">
                        <h2>🏠 لوحة التحكم</h2>
                        <p>مرحباً بك في نظام إدارة "في خدمتك" - منطقة حائل.</p>
                    </div>`;
        }
    } catch (err) {
        console.error("❌ خطأ في تحميل الموديول:", err);
        container.innerHTML = `
            <div style="color:red; padding:40px; border:1px dashed red; margin:20px; border-radius:8px;">
                <h3>⚠️ خطأ تقني</h3>
                <p>${err.message}</p>
                <small>تأكد من رفع ملفات الموديولات بأسماء صحيحة على GitHub.</small>
            </div>`;
    }
}

// تصدير الدالة للنافذة العامة (Global Scope) لتعمل مع onclick في HTML
window.switchModule = switchModule;

// التعامل مع تحميل الصفحة وتغيير الروابط (Hash)
const handleRoute = () => {
    const hash = window.location.hash.replace('#', '') || 'dashboard';
    switchModule(hash);
};

window.addEventListener('DOMContentLoaded', handleRoute);
window.addEventListener('hashchange', handleRoute);
