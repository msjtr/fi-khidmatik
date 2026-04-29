/**
 * js/main.js
 * المحرك الرئيسي لإدارة نظام "تيرا جيت واي" - الإصدار V12.12.2
 * المطور: محمد بن صالح الشمري
 * الوظيفة: الإدارة المركزية للمنطق، الربط بـ Firebase، والتنقل بدون قيود الدخول حالياً.
 */

import { db, auth } from './core/config.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js";
import { navigateTo } from './dashboard-core.js';

console.log("⚙️ Tera Engine Core: جاري تشغيل المحرك في وضع التطوير...");

/**
 * 1. الدوال العالمية المساعدة (Global Utilities)
 */

// جلب البيانات مع معالجة ذكية للتواريخ
window.getCollectionData = async (collectionName) => {
    if (!db) {
        console.error("❌ Tera Engine: قاعدة البيانات غير متصلة.");
        return [];
    }

    try {
        const querySnapshot = await getDocs(collection(db, collectionName));
        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            let formattedDate = '---';

            // معالجة التاريخ سواء كان Firebase Timestamp أو string
            if (data.createdAt) {
                const dateObj = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
                formattedDate = dateObj.toLocaleDateString('ar-SA');
            }

            return { 
                id: doc.id, 
                ...data,
                dateFormatted: formattedDate
            };
        });
    } catch (error) {
        console.error(`🔴 Error fetching ${collectionName}:`, error);
        return [];
    }
};

// إغلاق المودالات وتنظيف الذاكرة البصرية
window.closeAllModals = () => {
    const modals = document.querySelectorAll('.modal, .tera-modal, [role="dialog"]');
    modals.forEach(modal => {
        modal.style.display = 'none';
        modal.classList.remove('show', 'active');
    });
    
    document.querySelectorAll('form').forEach(form => form.reset());
    
    const backdrop = document.querySelector('.modal-backdrop');
    if (backdrop) backdrop.remove();
    
    document.body.classList.remove('modal-open');
    document.body.style = "";
};

/**
 * 2. نظام مراقبة التنقل (Navigation System)
 */
window.handleNavigation = (hash) => {
    const view = hash.replace('#', '') || 'dashboard';
    
    // تحديث الحالة البصرية للقائمة الجانبية
    document.querySelectorAll('.nav-item, .sidebar-link').forEach(item => {
        item.classList.remove('active');
        const href = item.getAttribute('href');
        const dataNav = item.getAttribute('data-nav');
        
        if (href === hash || dataNav === view || (hash === '' && (href === '#dashboard' || dataNav === 'dashboard'))) {
            item.classList.add('active');
        }
    });

    // استدعاء الموجه الرئيسي لتبديل المحتوى
    if (typeof navigateTo === 'function') {
        navigateTo(view);
    } else {
        console.warn("⚠️ Tera Router: دالة navigateTo غير معرفة في dashboard-core.js");
    }
};

window.handleNavClick = (view) => {
    window.location.hash = view;
};

/**
 * 3. تشغيل المحرك والخدمات الأساسية
 */
function initCoreEngine() {
    // أ- مراقبة حالة المستخدم (معطلة مؤقتاً للتطوير)
    onAuthStateChanged(auth, (user) => {
        if (!user) {
            console.info("ℹ️ Tera Auth: وضع التطوير نشط - الدخول متاح بدون تسجيل.");
        }
    });

    // ب- تحديث الفوتر تلقائياً
    const yearEl = document.getElementById('current-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // ج- مستمعات الأحداث
    window.addEventListener('hashchange', () => {
        window.handleNavigation(window.location.hash);
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') window.closeAllModals();
    });

    // د- التوجيه الأولي عند فتح الصفحة
    window.handleNavigation(window.location.hash);

    console.log("🚀 Tera Engine Core: النظام جاهز ومستقر (وضع التطوير).");
}

// البدء عند جاهزية المتصفح
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCoreEngine);
} else {
    initCoreEngine();
}

export { initCoreEngine };
