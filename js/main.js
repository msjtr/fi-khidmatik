/**
 * js/main.js
 * المحرك الرئيسي لإدارة نظام "تيرا جيت واي" - الإصدار المحدث V12.12.1
 * المطور: محمد بن صالح الشمري
 */

import { collection, getDocs } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";

// ملاحظة: لا نستورد db مباشرة هنا لتجنب مشاكل التوقيت، نعتمد على window.db
console.log("⚙️ Tera Engine Core: جاري تشغيل المحرك الرئيسي...");

/**
 * 1. الدوال العالمية المساعدة (Global Utilities)
 * توضع هنا لتكون متاحة لكل الموديولات
 */

// دالة مساعدة عالمية لجلب البيانات بنظام Modern Modular
window.getCollectionData = async (collectionName) => {
    if (!window.db) {
        console.error("❌ Tera Engine: قاعدة البيانات غير جاهزة بعد.");
        return [];
    }
    try {
        const querySnapshot = await getDocs(collection(window.db, collectionName));
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error(`🔴 Error fetching ${collectionName}:`, error);
        return [];
    }
};

// إغلاق المودال بشكل موحد
window.closeCustomerModal = () => {
    const modal = document.getElementById('customer-modal') || document.getElementById('customerModal');
    if (modal) {
        modal.classList.remove('active'); // نستخدم كلاس بدل Style لمرونة التنسيق
        modal.style.display = 'none';
        const form = modal.querySelector('form');
        if (form) form.reset();
    }
};

/**
 * 2. إدارة واجهة القائمة الجانبية (Sidebar)
 */
window.updateSidebarUI = (activeHash) => {
    const hash = activeHash.replace('#', '') || 'dashboard';
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        // التحقق من الرابط أو خاصية onclick
        const link = item.getAttribute('href') || item.getAttribute('onclick') || '';
        if (link.includes(hash)) {
            item.classList.add('active');
        }
    });
};

/**
 * 3. تهيئة النظام الأولية
 */
function initCoreEngine() {
    // تحديث التوقيت التلقائي في الفوتر أو الهيدر إذا وجد
    const yearEl = document.getElementById('current-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    console.log("🚀 Tera Engine Core: النظام جاهز للعمل.");
}

// التشغيل
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCoreEngine);
} else {
    initCoreEngine();
}

// تصدير أي دوال إضافية إذا احتجت لاستخدامها كـ Module
export { initCoreEngine };
