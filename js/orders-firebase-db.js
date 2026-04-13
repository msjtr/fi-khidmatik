import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import { getFirestore, doc, getDoc, collection } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBWYW6Qqlhh904pBeuJ29wY7Cyjm2uklBA",
    authDomain: "msjt301-974bb.firebaseapp.com",
    projectId: "msjt301-974bb",
    storageBucket: "msjt301-974bb.firebasestorage.app",
    messagingSenderId: "186209858482",
    appId: "1:186209858482:web:186ca610780799ef562aab"
};

// تهيئة التطبيق بطريقة الوحدات الحديثة
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(app);

// دعم الدوال التي تحتاجها كـ Global (اختياري)
window.db = db;
window.getDocument = async (colName, id) => {
    try {
        const docRef = doc(db, colName, id);
        const snap = await getDoc(docRef);
        return snap.exists() ? { id: snap.id, ...snap.data(), success: true } : { success: false };
    } catch (e) { 
        return { success: false, error: e.message }; 
    }
};
