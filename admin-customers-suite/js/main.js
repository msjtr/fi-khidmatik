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
    
    // دالة مجمعة لتحديث بيانات الهيدر
    const applyUserData = () => {
        // 1. تحديث اسم المستخدم (تم تصحيح الـ ID ليتطابق مع الهيدر الجديد)
        const userNameElement = document.getElementById('display-user-name');
        if (userNameElement) {
            userNameElement.innerText = "أبا صالح الشمري (وضع الإدارة)"; 
        }

        // 2. تحديث الصورة الرمزية لتكون حرف "أ"
        const avatarElement = document.getElementById('user-avatar-icon');
        if (avatarElement) {
            avatarElement.innerText = "أ"; 
        }
    };

    // نستخدم Event Listener للتأكد من وجود العنصر بعد حقن الهيدر
    document.addEventListener('TeraLayoutReady', applyUserData);

    // صمام أمان (Fallback): محاولة التحديث بعد نصف ثانية لضمان أن الهيدر قد تم رسمه في الشاشة
    setTimeout(applyUserData, 500);
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
