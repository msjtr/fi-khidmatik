/**
 * نظام Tera V12 - الإعدادات المركزية والموصل الأساسي
 * مؤسسة الإتقان بلس | Fi Khidmatik
 */

// 1. استيراد الخدمات المهيأة من ملف المحرك الأساسي (Firebase 10.7.1)
import { db, auth, app, storage } from './firebase.js';

// 2. الثوابت الأساسية للمنصة (تم تحديث البيانات لتناسب مؤسسة الإتقان)
export const APP_CONFIG = {
    name: 'Tera Gateway',
    version: '12.12.12',
    engine: 'Tera Engine v12',
    company: 'في خدمتكم | Fi Khidmatik',
    location: 'Hail, KSA',
    region: 'منطقة حائل',
    owner: 'Mohammed bin Saleh Al-Shammari', // تم التحديث بناءً على سجلات الإتقان بلس
    // تحسين كشف البيئة لضمان عمل المسارات على GitHub Pages
    isGithub: window.location.hostname.includes('github.io'),
    baseUrl: window.location.hostname.includes('github.io') ? '/fi-khidmatik' : ''
};

// 3. تكوين أسماء المجموعات (Collections) لضمان المركزية في Firestore
export const COLLECTIONS = {
    products: 'products',
    orders: 'orders',
    customers: 'customers', 
    payments: 'payments',
    inventory: 'inventory_cards', // مخزون كروت سوا/stc
    branches: 'branches',        // فروع المؤسسة (مثل فرع حائل)
    settings: 'system_settings',
    logs: 'audit_logs'           // تتبع العمليات (Logs)
};

// 4. الإعدادات المالية (سوق التقسيط السعودي - كروت Sawa)
export const FINANCIAL_CONFIG = {
    currency: 'SAR',
    currencySymbol: 'ر.س',
    taxRate: 0.15,        // ضريبة القيمة المضافة 15%
    minInstallment: 500,  // الحد الأدنى للتقسيط
    maxInstallment: 2500, // الحد الأقصى للتقسيط
    lateFees: 0,          // رسوم التأخير (حسب سياسة المؤسسة)
    installmentTerms: [3, 6, 12] // شهور التقسيط المتاحة في Tera
};

/**
 * دالة التحقق من جاهزية الاتصال وقاعدة البيانات
 */
export async function ensureDbReady() {
    try {
        if (!navigator.onLine) {
            console.warn("⚠️ Tera Gateway: الجهاز غير متصل بالإنترنت في مكتب حائل.");
            return false;
        }
        // التحقق من استجابة Firestore
        return !!db; 
    } catch (err) {
        console.error("❌ Tera Config Error:", err.message);
        return false;
    }
}

/**
 * دالة جلب الإعدادات الكاملة لسهولة الاستخدام
 */
export function getAllConfig() {
    return { 
        app: APP_CONFIG, 
        collections: COLLECTIONS,
        financial: FINANCIAL_CONFIG 
    };
}

// 5. إعادة تصدير الخدمات ليكون هذا الملف هو المصدر الوحيد للبيانات
export { db, auth, app, storage };

// التصدير الافتراضي المجمع
export default {
    db, 
    auth, 
    app,
    storage,
    APP_CONFIG,
    COLLECTIONS,
    FINANCIAL_CONFIG,
    getAllConfig,
    ensureDbReady
};
