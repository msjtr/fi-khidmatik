// js/orders-firebase-db.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBWYW6Qqlhh904pBeuJ29wY7Cyjm2uklBA",
    authDomain: "msjt301-974bb.firebaseapp.com",
    projectId: "msjt301-974bb",
    storageBucket: "msjt301-974bb.firebasestorage.app",
    messagingSenderId: "186209858482",
    appId: "1:186209858482:web:186ca610780799ef562aab"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// جعل قاعدة البيانات متاحة عالمياً (اختياري)
window.db = db;

// تحديث وظيفة getDocument للعمل مع النظام الجديد
window.getDocument = async (col, id) => {
    try {
        const docRef = doc(db, col, id);
        const snap = await getDoc(docRef);
        
        if (snap.exists()) {
            return { id: snap.id, ...snap.data(), success: true };
        } else {
            return { success: false, error: "Document not found" };
        }
    } catch (e) {
        console.error("Error fetching document:", e);
        return { success: false, error: e.message };
    }
};
