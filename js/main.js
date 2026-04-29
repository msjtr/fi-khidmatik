/**
 * js/main.js
 * المحرك الرئيسي لإدارة نظام "تيرا جيت واي" - الإصدار V12.12.4
 * المطور: محمد بن صالح الشمري
 * الوظيفة: الإدارة المركزية للبيانات والواجهة مع دعم GitHub Pages.
 */

import { db, auth } from './core/config.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js";

// تحديد مسار المشروع لـ GitHub Pages لضمان عمل الروابط بشكل صحيح
const IS_GITHUB = window.location.hostname.includes('github.io');
const REPO_NAME = '/fi-khidmatik/';
const BASE_PATH = IS_GITHUB ? REPO_NAME : '/';

console.log(`⚙️ Tera Engine Core: جاري التشغيل على ${IS_GITHUB ? 'GitHub Pages' : 'Localhost'}`);

/**
 * 1. الدوال العالمية المساعدة (Global Utilities)
 * دوال يمكن استدعاؤها من أي موديول آخر داخل النظام
 */

// جلب البيانات من Firebase Firestore
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

            // معالجة التاريخ إذا وجد
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

// إغلاق جميع النوافذ المنبثقة (Modals)
window.closeAllModals = () => {
    const modals = document.querySelectorAll('.modal, .tera-modal, [role="dialog"]');
    modals.forEach(modal => {
        modal.style.display = 'none';
        modal.classList.remove('show', 'active');
    });
    
    // إعادة تعيين النماذج داخل المودال
    document.querySelectorAll('form').forEach(form => form.reset());
    
    // إزالة خلفية المودال إذا كانت موجودة
    const backdrop = document.querySelector('.modal-backdrop');
    if (backdrop) backdrop.remove();
    
    document.body.classList.remove('modal-open');
    document.body.style = "";
};

/**
 * 2. مزامنة القائمة الجانبية (UI Sidebar Sync)
 * وظيفة هذه الدالة هي تلوين الرابط النشط فقط ليتناسب مع الصفحة الحالية
 */
window.syncNavigationUI = (hash) => {
    const view = hash.replace('#', '') || 'dashboard';
    
    document.querySelectorAll('.nav-item, .sidebar-link').forEach(item => {
        item.classList.remove('active');
        const href = item.getAttribute('href');
        
        // التحقق من الرابط النشط
        if (href === hash || (hash === '' && href === '#dashboard')) {
            item.classList.add('active');
        }
    });
};

/**
 * 3. تشغيل المحرك والخدمات الأساسية
 */
function initCoreEngine() {
    // مراقبة حالة المستخدم بدون تحويل إجباري (Development Mode)
    // تم حذف سطر window.location لضمان عدم ظهور خطأ 404
    onAuthStateChanged(auth, (user) => {
        if (!user) {
            console.info("ℹ️ Tera Auth: وضع الوصول العام نشط. (التوجيه لـ login معطل)");
        } else {
            console.log("✅ Tera Auth: تم التحقق من هوية المسؤول.");
        }
    });

    // تحديث السنة في التذييل (Footer) تلقائياً
    const yearEl = document.getElementById('current-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // مستمع لتغيير الهاش (Hash Change) لتحديث شكل القائمة
    window.addEventListener('hashchange', () => {
        window.syncNavigationUI(window.location.hash);
    });

    // إغلاق المودال عند الضغط على زر Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') window.closeAllModals();
    });

    // المزامنة الأولية عند تحميل الصفحة
    window.syncNavigationUI(window.location.hash);

    console.log("🚀 Tera Engine Core V12.12.4: جاهز بنسبة 100%.");
}

// بدء التشغيل عند جاهزية المتصفح
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCoreEngine);
} else {
    initCoreEngine();
}

// تصدير المسار الأساسي لاستخدامه في موديولات أخرى
export { BASE_PATH };
