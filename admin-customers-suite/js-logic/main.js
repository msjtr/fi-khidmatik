/**
 * منصة في خدمتك من الإتقان بلس | V12.12.12
 * المحرك المركزي (Main Engine)
 * الموقع: حائل، المملكة العربية السعودية
 */

import { auth, db } from './firebase.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

/**
 * وظيفة تهيئة النظام الأساسية
 * يتم استدعاؤها من ملف main-hub.html
 */
export function initApp() {
    console.log("%c منصة في خدمتك | نظام Tera المحرك V12.12.12 جاهز ", "color: #c5a059; background: #001f3f; padding: 5px; border-radius: 5px;");

    // 1. مراقبة حالة تسجيل الدخول
    checkUserAuth();

    // 2. تهيئة المستمعات العامة للأزرار
    setupGlobalListeners();
}

/**
 * التحقق من صلاحية المستخدم (الأمن)
 */
function checkUserAuth() {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // المستخدم مسجل دخوله
            console.log("تم التحقق من هوية المدير: ", user.email);
            updateUIForUser(user);
        } else {
            // تصحيح المسار: التوجيه لصفحة الدخول داخل مجلد mm لتجنب خطأ 404
            console.warn("تنبيه: لم يتم تسجيل الدخول، جاري التحويل للمسار الصحيح...");
            window.location.href = 'mm/login.html'; 
        }
    });
}

/**
 * تحديث عناصر الواجهة بناءً على بيانات المستخدم
 */
function updateUIForUser(user) {
    // تحديث الاسم في الهيدر (أبا صالح الشمري)
    const userNameElement = document.getElementById('user-display-name');
    if (userNameElement) {
        userNameElement.innerText = "أبا صالح الشمري"; 
    }
}

/**
 * إعداد وظائف التحكم العامة في المنصة
 */
function setupGlobalListeners() {
    window.addEventListener('offline', () => {
        alert("انقطع الاتصال بالإنترنت! قد لا يتم حفظ بيانات العملاء في حائل.");
    });
}

// تصدير إعدادات النظام للنسخة الحالية
export const systemConfig = {
    version: "12.12.12",
    region: "Hail",
    platform: "Tera Gateway"
};
