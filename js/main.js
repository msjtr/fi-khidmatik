// js/main.js
import { initOrdersDashboard } from './modules/orders.js';
import { initCustomers } from './modules/customers.js';

/**
 * دالة تحميل المكونات (Header & Sidebar)
 * تم تعديل المسار ليتجه مباشرة لمجلد admin/components
 */
async function loadComponent(id, path) {
    const container = document.getElementById(id);
    if (!container) return;

    try {
        // نستخدم المسار الكامل بناءً على أخطاء الـ 404 السابقة
        const response = await fetch(`./${path}?v=${Date.now()}`);
        
        if (!response.ok) {
            throw new Error(`خطأ ${response.status}: لم يتم العثور على الملف في ${path}`);
        }
        
        const html = await response.text();
        container.innerHTML = html;
        console.log(`✅ تم تحميل المكون بنجاح: ${id}`);
        
    } catch (err) {
        console.error(`❌ فشل تحميل المكون [${id}]:`, err.message);
        
        // واجهة احتياطية في حال استمرار خطأ 404 لكي لا يظهر النظام مكسوراً
        if (id === 'header-container') {
            container.innerHTML = `
                <div style="background:#2c3e50; color:white; padding:15px; text-align:center; font-family:Tajawal;">
                    <strong>Tera Gateway</strong> (Header Fallback)
                </div>`;
        } else if (id === 'sidebar-container') {
            container.innerHTML = `
                <nav style="background:#f8f9fa; padding:20px; border-left:1px solid #ddd; min-height:100vh; font-family:Tajawal;">
                    <ul style="list-style:none; padding:0;">
                        <li style="margin-bottom:15px;"><a href="#orders" style="text-decoration:none; color:#333;"><i class="fas fa-box"></i> الطلبات</a></li>
                        <li style="margin-bottom:15px;"><a href="#customers" style="text-decoration:none; color:#333;"><i class="fas fa-users"></i> العملاء</a></li>
                    </ul>
                </nav>`;
        }
    }
}

/**
 * تبديل الأقسام (Orders / Customers)
 */
async function switchModule(moduleName) {
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;

    // مسح عبارة "جاري تحميل النظام" وإظهار لودر جديد
    mainContent.innerHTML = `
        <div style="text-align:center; padding:50px; font-family:Tajawal;">
            <i class="fas fa-circle-notch fa-spin fa-2x" style="color:#3498db;"></i>
            <p style="margin-top:15px;">جاري جلب بيانات تيرا...</p>
        </div>`;

    try {
        if (moduleName === 'customers') {
            await initCustomers(mainContent);
        } else {
            // الافتراضي هو لوحة الطلبات
            await initOrdersDashboard(mainContent);
        }
    } catch (err) {
        console.error("❌ خطأ في تشغيل الموديول:", err);
        mainContent.innerHTML = `
            <div style="color:red; text-align:center; padding:50px; font-family:Tajawal;">
                <h3>عذراً، حدث خطأ فني</h3>
                <p>${err.message}</p>
                <button onclick="location.reload()" style="padding:10px 20px; cursor:pointer;">إعادة تحميل الصفحة</button>
            </div>`;
    }
}

/**
 * بدء تشغيل النظام عند التحميل
 */
(async () => {
    // 💡 التعديل الجوهري: تأكد من أن أسماء المجلدات في GitHub مطابقة تماماً (admin/components)
    await loadComponent('header-container', 'admin/components/header.html');
    await loadComponent('sidebar-container', 'admin/components/sidebar.html');

    // تحديد القسم الحالي من الرابط (URL Hash)
    const initialModule = window.location.hash.replace('#', '') || 'orders';
    await switchModule(initialModule);

    // الاستماع لتغيير القسم عند الضغط على الروابط في السايدبار
    window.addEventListener('hashchange', () => {
        const newModule = window.location.hash.replace('#', '') || 'orders';
        switchModule(newModule);
    });
})();
