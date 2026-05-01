/**
 * منصة في خدمتك من الإتقان بلس | V12.12.12
 * وضع التطوير: تم تعطيل صفحة الدخول مؤقتاً لضمان سرعة الإدارة
 */

// استيراد قاعدة البيانات والصلاحيات من ملف firebase.js الأساسي
import { auth, db } from './firebase.js';

/**
 * دالة تشغيل النظام الرئيسية
 */
export function initApp() {
    console.log("%c 🛠️ وضع التطوير: تم تعطيل نظام الحماية والدخول مؤقتاً ", "color: #fff; background: #ff0000; padding: 5px;");

    // السماح بالدخول المباشر لواجهة أبا صالح الشمري
    updateUIForUser();
    setupGlobalListeners();
}

/**
 * تحديث الواجهة مباشرة بصلاحيات مدير النظام
 */
function updateUIForUser() {
    console.log("الدخول المباشر بصلاحيات مدير النظام...");
    
    // نستخدم Event Listener للتأكد من وجود العنصر بعد حقن الهيدر
    document.addEventListener('TeraLayoutReady', () => {
        const userNameElement = document.getElementById('user-display-name');
        if (userNameElement) {
            userNameElement.innerText = "أبا صالح الشمري (وضع الإدارة)"; 
        }
    });
}

/**
 * مراقبة حالة الاتصال بالإنترنت في مكتب حائل
 */
function setupGlobalListeners() {
    window.addEventListener('offline', () => {
        alert("تنبيه يا أبا صالح: انقطع الاتصال بالإنترنت، تأكد من الشبكة في مكتب حائل!");
    });
    
    window.addEventListener('online', () => {
        console.log("تم استعادة الاتصال بنجاح.");
    });
}

// تشغيل النظام تلقائياً عند تحميل الملف
initApp();

export const systemConfig = {
    version: "12.12.12",
    region: "Hail",
    platform: "Tera Gateway - Dev Mode"
};
