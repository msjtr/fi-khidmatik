/**
 * js/core/config.js
 * إعدادات منصة تيرا جيت واي - الإصدار الحديث V12
 */

// 1. استيراد الكائنات الحديثة (استبدال firebase بـ app)
import { db, auth, app } from './firebase.js';

// 2. الثوابت الأساسية للمنصة
export const APP_CONFIG = {
    name: 'Tera Gateway',
    version: '2.0.2', // نسخة المحرك المحدثة
    company: 'Tera Gateway',
    region: 'Saudi Arabia',
    debug: true
};

// 3. تكوين أسماء المجموعات في Firestore
export const FIREBASE_CONFIG = {
    collections: {
        products: 'products',
        orders: 'orders',
        customers: 'customers',
        payments: 'payments'
    }
};

// 4. إعدادات الضريبة والعملة (اختياري لكن مفيد للفواتير)
export const FINANCIAL_CONFIG = {
    currency: 'SAR',
    taxRate: 0.15, // 15% ضريبة القيمة المضافة
    taxEnabled: true
};

/**
 * دالة جلب كافة الإعدادات
 */
export function getAllConfig() {
    return { 
        app: APP_CONFIG, 
        firebase: FIREBASE_CONFIG,
        financial: FINANCIAL_CONFIG 
    };
}

// 5. التصدير النهائي للكائنات لضمان وصول الموديولات الأخرى إليها
export { db, auth, app };

export default {
    db, 
    auth, 
    app,
    APP_CONFIG,
    FIREBASE_CONFIG
};
