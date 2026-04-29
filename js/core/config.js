/**
 * js/core/config.js
 * إعدادات منصة تيرا جيت واي - الإصدار الحديث V12.12.6
 * المطور: محمد بن صالح الشمري
 */

// 1. استيراد الخدمات المهيأة من ملف المحرك الأساسي
// تأكد أن ملف firebase.js يستخدم إصدار 10.7.1 في روابطه
import { db, auth, app, storage } from './firebase.js';

// 2. الثوابت الأساسية للمنصة
export const APP_CONFIG = {
    name: 'Tera Gateway',
    version: '12.12.6', // تحديث لرقم الإصدار الحالي للنظام
    company: 'في خدمتكم | Fi Khidmatik',
    region: 'Hail, Saudi Arabia', // تحديد المنطقة بدقة
    debug: true
};

// 3. تكوين أسماء المجموعات (Collections) لضمان المركزية
export const FIREBASE_COLLECTIONS = {
    products: 'products',
    orders: 'orders',
    customers: 'customers', // المجموعة التي فشل جلبها سابقاً
    payments: 'payments',
    settings: 'settings',
    logs: 'system_logs'
};

// 4. الإعدادات المالية الخاصة بالسوق السعودي
export const FINANCIAL_CONFIG = {
    currency: 'SAR',
    currencySymbol: 'ر.س',
    taxRate: 0.15, // ضريبة القيمة المضافة 15%
    taxEnabled: true
};

/**
 * دالة جلب الإعدادات الكاملة
 */
export function getAllConfig() {
    return { 
        app: APP_CONFIG, 
        collections: FIREBASE_COLLECTIONS,
        financial: FINANCIAL_CONFIG 
    };
}

/**
 * دالة التحقق من جاهزية قاعدة البيانات
 * تم تحسينها لتعمل كـ Promise لضمان انتظار الاتصال
 */
export async function ensureDbReady() {
    if (!db) {
        console.error("❌ Tera Config: محرك Firestore غير متصل! تأكد من روابط الإصدار 10.7.1");
        return false;
    }
    return true;
}

// 5. إعادة تصدير الخدمات لضمان سهولة الاستيراد من ملف واحد
export { db, auth, app, storage };

// التصدير الافتراضي المجمع
export default {
    db, 
    auth, 
    app,
    storage,
    APP_CONFIG,
    FIREBASE_COLLECTIONS,
    FINANCIAL_CONFIG,
    getAllConfig,
    ensureDbReady
};
