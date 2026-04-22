/**
 * js/core/config.js
 * إعدادات النظام العامة والتكوينات - نسخة الإصلاح
 */

// 1. استيراد كائنات Firebase أولاً
import { db, auth, app } from './firebase.js';

// 2. تعريف الإعدادات كـ constants
export const APP_CONFIG = {
    name: 'Tera Gateway',
    version: '2.0.0',
    company: 'Tera Gateway',
    debug: true
};

export const TAX_CONFIG = {
    rate: 15,
    enabled: true,
    taxName: 'ضريبة القيمة المضافة'
};

export const FIREBASE_CONFIG = {
    collections: {
        products: 'products',
        orders: 'orders',
        customers: 'customers'
    }
};

// --- يمكنك إضافة بقية الـ CONFIGS هنا (CURRENCY, DATE, إلخ) ---

// 3. تعريف الدوال **قبل** استدعائها
export function getAllConfig() {
    return {
        app: APP_CONFIG,
        tax: TAX_CONFIG,
        firebase: FIREBASE_CONFIG
        // أضف البقية هنا إذا احتجت
    };
}

export function saveConfigToLocalStorage() {
    const allConfig = getAllConfig();
    localStorage.setItem('tera_gateway_config', JSON.stringify(allConfig));
}

export function loadConfigFromLocalStorage() {
    const saved = localStorage.getItem('tera_gateway_config');
    if (saved) {
        try {
            const config = JSON.parse(saved);
            if (config.app) Object.assign(APP_CONFIG, config.app);
            console.log('✅ تم تحميل الإعدادات المحفوظة');
        } catch (e) {
            console.warn('⚠️ فشل تحميل الإعدادات:', e);
        }
    }
}

// 4. الآن استدعاء الدالة بعد تعريفها
loadConfigFromLocalStorage();

// 5. التصدير النهائي
export { db, auth, app };

export default {
    db, auth, app,
    APP_CONFIG,
    getAllConfig,
    loadConfigFromLocalStorage
};
