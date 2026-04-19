/**
 * js/core/config.js
 * تكوين Firebase - آمن للإنتاج
 */

// تحقق من بيئة التشغيل
const isProduction = window.location.hostname !== 'localhost' && 
                     window.location.hostname !== '127.0.0.1';

// في الإنتاج، لا تستخدم config مباشرة أبداً
if (isProduction) {
    console.warn('⚠️ تحذير: تأكد من إعداد قواعد أمان Firebase بشكل صارم');
}

// التكوين - يجب حمايته بقواعد أمان Firebase
export const firebaseConfig = {
    apiKey: "AIzaSyBWYW6Qqlhh904pBeuJ29wY7Cyjm2uklBA",
    authDomain: "msjt301-974bb.firebaseapp.com",
    projectId: "msjt301-974bb",
    storageBucket: "msjt301-974bb.firebasestorage.app",
    messagingSenderId: "186209858482",
    appId: "1:186209858482:web:186ca610780799ef562aab",
    // measurementId ليس ضرورياً، يمكن حذفه
};

// إضافة تحقق إضافي
if (!firebaseConfig.apiKey || firebaseConfig.apiKey === 'YOUR_API_KEY') {
    throw new Error('Firebase configuration is missing or invalid');
}

// إضافة timestamp للتحقق من تاريخ آخر تحديث (اختياري)
export const configLastUpdated = '2026-04-19';
