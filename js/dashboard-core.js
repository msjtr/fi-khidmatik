/**
 * fi-khidmatik/js/dashboard-core.js
 * المحرك الرئيسي للوحة التحكم - الإصدار 3.5.0
 * مسؤول عن التوجيه (Routing) وربط الموديولات
 */

import { auth } from './core/firebase.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// استيراد الموديولات المحدثة
import ordersDashboard from './modules/orders-dashboard.js';
import orderFormUI from './modules/order-form-ui.js';
// نفترض وجود موديول للعملاء
// import customersModule from './modules/customers-module.js';

// ===================== متغيرات الحالة العامة =====================
const state = {
    currentView: 'dashboard',
    user: null,
    mainContainer: document.getElementById('main-content')
};

// ===================== محرك التشغيل (Initialization) =====================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Dashboard Core Initialized');
    
    // مراقبة حالة تسجيل الدخول
    onAuthStateChanged(auth, (user) => {
        if (user) {
            state.user = user;
            setupEventListeners();
            navigateTo('dashboard'); // عرض الصفحة الرئيسية عند الدخول
        } else {
            window.location.href = 'login.html'; // إعادة التوجيه إذا لم يسجل دخول
        }
    });
});

// ===================== نظام التنقل (Routing System) =====================

/**
 * دالة التنقل بين الصفحات بدون إعادة تحميل المتصفح
 * @param {string} view - اسم الصفحة المطلوبة
 * @param {Object} params - بيانات إضافية (مثل معرف الطلب للتعديل)
 */
async function navigateTo(view, params = null) {
    state.currentView = view;
    const container = state.mainContainer;
    
    // إغلاق أي مودالات مفتوحة كإجراء احترازي
    if (typeof orderFormUI.closeOrderModal === 'function') orderFormUI.closeOrderModal();

    switch (view) {
        case 'dashboard':
            await ordersDashboard.initOrdersDashboard(container);
            break;
            
        case 'new-order':
            // فتح واجهة إضافة طلب جديد مباشرة
            orderFormUI.showOrderModal('add');
            break;

        case 'customers':
            container.innerHTML = `<div class="p-4"><h3>👤 إدارة العملاء</h3><p>جاري العمل على هذا القسم...</p></div>`;
            break;

        default:
            container.innerHTML = `<div class="text-center p-5"><h4>الصفحة غير موجودة</h4></div>`;
    }
    
    updateActiveSidebarLink(view);
}

// ===================== مراقبة الأحداث (Event Listeners) =====================

function setupEventListeners() {
    // مراقبة أزرار القائمة الجانبية (Sidebar)
    document.querySelectorAll('[data-nav]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetView = e.currentTarget.getAttribute('data-nav');
            navigateTo(targetView);
        });
    });

    // زر تسجيل الخروج
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            if (confirm('هل أنت متأكد من تسجيل الخروج؟')) {
                await signOut(auth);
            }
        });
    }

    // زر "إضافة طلب" السريع (غالباً يكون Floating Button أو في الهيدر)
    const quickAddBtn = document.getElementById('quick-add-order');
    if (quickAddBtn) {
        quickAddBtn.addEventListener('click', () => orderFormUI.showOrderModal('add'));
    }
}

// ===================== وظائف مساعدة للواجهة =====================

function updateActiveSidebarLink(view) {
    document.querySelectorAll('[data-nav]').forEach(link => {
        if (link.getAttribute('data-nav') === view) {
            link.classList.add('active-link');
        } else {
            link.classList.remove('active-link');
        }
    });
}

// ===================== التصدير للاستخدام في ملفات أخرى =====================
export { navigateTo, state };
window.navigateTo = navigateTo; // إتاحة الوصول لها من الـ HTML مباشرة
