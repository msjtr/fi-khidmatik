/**
 * js/core/firebase.js
 * تهيئة Firebase لمنصة تيرا - نسخة التوافق v10
 */

const firebaseConfig = {
    apiKey: "AIzaSyBWYW6Qqlhh904pBeuJ29wY7Cyjm2uklBA",
    authDomain: "msjt301-974bb.firebaseapp.com",
    projectId: "msjt301-974bb",
    storageBucket: "msjt301-974bb.firebasestorage.app",
    messagingSenderId: "186209858482",
    appId: "1:186209858482:web:186ca610780799ef562aab"
};

// تهيئة التطبيق
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();
const auth = firebase.auth();

// إعدادات Firestore: إضافة merge: true يحل تحذير overriding host في الكونسول
db.settings({
    cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED,
    experimentalForceLongPolling: true,
    merge: true 
});

// جعلها متاحة عالمياً للملفات القديمة
window.db = db;
window.auth = auth;

console.log("✅ Tera Engine: Firebase Ready & window.db is active.");

// التصدير للموديولات الحديثة (مثل config.js)
export { db, auth, firebase };
export default firebase;
