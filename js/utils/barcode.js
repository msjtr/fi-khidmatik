// إعدادات Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBWYW6Qqlhh904pBeuJ29wY7Cyjm2uklBA",
    authDomain: "msjt301-974bb.firebaseapp.com",
    projectId: "msjt301-974bb",
    storageBucket: "msjt301-974bb.firebasestorage.app",
    messagingSenderId: "186209858482",
    appId: "1:186209858482:web:186ca610780799ef562aab"
};

// منع تكرار تهيئة التطبيق
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();

// تصدير النطاق العام ليكون مرئياً لملف print.js
window.db = db;
window.getDocument = async (col, id) => {
    try {
        if (!id) return { success: false, error: "المعرف غير موجود" };
        const snap = await db.collection(col).doc(id).get();
        if (snap.exists) {
            return { id: snap.id, ...snap.data(), success: true };
        } else {
            console.warn(`المستند ${id} غير موجود في ${col}`);
            return { success: false };
        }
    } catch (e) {
        console.error("خطأ في جلب المستند:", e);
        return { success: false, error: e.message };
    }
};
