/**
 * main.js - Tera Gateway 
 * الموزع الرئيسي للنظام والمسؤول عن التنقل بين الموديولات
 */

import { APP_CONFIG } from './core/firebase.js';
import { initCustomersUI } from './modules/customers-ui.js';

/**
 * خريطة المسارات (Routes)
 * تأكد أن المجلدات موجودة فعلياً في مستودع GitHub بهذا الاسم
 */
const routes = {
    'dashboard': 'admin/modules/orders-dashboard.html',
    'customers': 'admin/modules/customers.html', // هذا الملف سيتم حقنه في المحتوى
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

        // محاولة جلب ملف الـ HTML الخاص بالموديول
        const response = await fetch(path);
        
        if (!response.ok) {
            throw new Error(`خطأ ${response.status}: الملف غير موجود في ${path}.`);
        }
        
        const html = await response.text();
        
        // تنظيف المحتوى وحقن الـ HTML الجديد
        container.innerHTML = html;

        // --- تصحيح مسارات CSS يدوياً لمنع خطأ 404 ---
        if (moduleName === 'customers') {
            ensureCustomerStyles(); // وظيفة للتأكد من وجود الـ CSS بالمسار الصحيح
            
            setTimeout(() => {
                const contentDiv = document.getElementById('customers-module-content');
                // إذا لم يجد حاوية خاصة داخل الـ HTML المحقون، يستخدم الحاوية الرئيسية
                initCustomersUI(contentDiv || container);
            }, 100);
        }

        console.log(`✅ تم تحميل موديول: ${moduleName}`);

    } catch (error) {
        console.error("❌ خطأ في نظام التنقل:", error);
        renderError(container, path);
    }
}

/**
 * وظيفة للتأكد من ربط ملف CSS العملاء بالمسار الصحيح (css/customers.css)
 */
function ensureCustomerStyles() {
    const stylePath = 'css/customers.css'; // المسار الذي اتفقنا عليه
    if (!document.querySelector(`link[href="${stylePath}"]`)) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = stylePath;
        document.head.appendChild(link);
    }
}

/**
 * دالة لعرض واجهة الخطأ بشكل احترافي
 */
function renderError(container, path) {
    container.innerHTML = `
        <div style="padding:40px; text-align:center; background:#fef2f2; border-radius:15px; border:1px solid #ef4444; margin:20px; font-family:'Tajawal';">
            <i class="fas fa-exclamation-triangle fa-2x" style="color:#dc2626;"></i>
            <h3 style="color:#991b1b; margin-top:15px;">تعذر الوصول للملف</h3>
            <p style="color:#b91c1c;">المسار المطلوب: <b>${path}</b></p>
            <p style="font-size:0.9rem; color:#475569;">تأكد من وجود المجلد والملفات في مستودع GitHub بنفس مسميات الأحرف.</p>
            <button onclick="location.reload()" style="margin-top:15px; padding:10px 25px; cursor:pointer; background:#dc2626; color:white; border:none; border-radius:8px;">إعادة محاولة</button>
        </div>
    `;
}

function handleRoute() {
    const hash = window.location.hash.replace('#', '') || 'dashboard';
    switchModule(hash);
    updateActiveSidebarItem(hash);
}

function updateActiveSidebarItem(activeHash) {
    document.querySelectorAll('.nav-link, .nav-item').forEach(item => {
        // فحص الـ data-module أو الـ href لتمييز العنصر النشط
        const module = item.getAttribute('data-module') || (item.getAttribute('href') && item.getAttribute('href').replace('#', ''));
        if (module === activeHash) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

// الأحداث الرئيسية
window.addEventListener('load', handleRoute);
window.addEventListener('hashchange', handleRoute);
window.switchModule = switchModule;
