/**
 * js/core/config.js
 * إعدادات منصة تيرا جيت واي - الإصدار الحديث V12.12.1
 * المطور: محمد بن صالح الشمري
 */

// 1. استيراد الكائنات من ملف firebase.js 
// تأكد من استخدام المسار النسبي الصحيح (./firebase.js)
import { db, auth, app } from './firebase.js';

// 2. الثوابت الأساسية للمنصة
export const APP_CONFIG = {
    name: 'Tera Gateway',
    version: '2.0.2', 
    company: 'Tera Gateway',
    region: 'Saudi Arabia',
    debug: true
};

// 3. تكوين أسماء المجموعات (Collections) لضمان المركزية
export const FIREBASE_COLLECTIONS = {
    products: 'products',
    orders: 'orders',
    customers: 'customers',
    payments: 'payments',
    settings: 'settings'
};

// 4. الإعدادات المالية الخاصة بالسوق السعودي (تيرا)
export const FINANCIAL_CONFIG = {
    currency: 'SAR',
    taxRate: 0.15, // ضريبة القيمة المضافة 15%
    taxEnabled: true
};

/**
 * دالة جلب الإعدادات الكاملة بنظام الموديولات
 */
export function getAllConfig() {
    return { 
        app: APP_CONFIG, 
        collections: FIREBASE_COLLECTIONS,
        financial: FINANCIAL_CONFIG 
    };
}

// 5. إعادة تصدير الخدمات لضمان سهولة الاستيراد من ملف واحد
// ملاحظة: هذا يسمح للموديولات باستيراد db من config.js بدلاً من firebase.js مباشرة
export { db, auth, app };

// التصدير الافتراضي المجمع
export default {
    db, 
    auth, 
    app,
    APP_CONFIG,
    FIREBASE_COLLECTIONS,
    FINANCIAL_CONFIG,
    getAllConfig
};
