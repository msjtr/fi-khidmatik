/**
 * js/core/firebase.js
 */

// 1. استيراد النسخة المتوافقة
import firebase from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js";
import "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js";
import "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth-compat.js";

const firebaseConfig = {
    apiKey: "AIzaSyBWYW6Qqlhh904pBeuJ29wY7Cyjm2uklBA",
    authDomain: "msjt301-974bb.firebaseapp.com",
    projectId: "msjt301-974bb",
    storageBucket: "msjt301-974bb.firebasestorage.app",
    messagingSenderId: "186209858482",
    appId: "1:186209858482:web:186ca610780799ef562aab"
};

// 2. تهيئة التطبيق
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// 3. تعريف الكائنات وتجهيزها للتصدير
const db = firebase.firestore();
const auth = firebase.auth();

db.settings({
    cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED,
    experimentalForceLongPolling: true,
    merge: true 
});

// 4. الحقن العالمي (لضمان عمل main.js والملفات القديمة)
window.db = db;
window.auth = auth;
window.firebase = firebase;

console.log("✅ Tera Engine: Firebase Ready & window.db is active.");

// 5. التصدير الصحيح (هنا تم حل المشكلة)
export { db, auth, firebase };
export default firebase;
