import { TERMS_DATA } from './terms.js';
import { OrderManager } from './order.js';
import { BarcodeManager } from './barcodes.js';

// إعدادات Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBWYW6Qqlhh904pBeuJ29wY7Cyjm2uklBA",
    authDomain: "msjt301-974bb.firebaseapp.com",
    projectId: "msjt301-974bb",
    storageBucket: "msjt301-974bb.firebasestorage.app",
    messagingSenderId: "186209858482",
    appId: "1:186209858482:web:186ca610780799ef562aab"
};

// التأكد من التهيئة قبل أي شيء
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
window.db = firebase.firestore();

// ... باقي كود الـ UI (header, orderMeta, footer) كما أرسلته لك سابقاً ...

window.onload = async () => {
    // ننتظر قليلاً للتأكد من استقرار المتصفح
    const orderId = new URLSearchParams(window.location.search).get('id');
    if (!orderId) return;

    try {
        const data = await OrderManager.getOrderFullDetails(orderId);
        if (!data) {
            console.error("لم يتم العثور على بيانات المعرف:", orderId);
            return;
        }
        
        // استكمال عملية الطباعة...
        // (بقية الكود الخاص بـ html += والـ loops)
    } catch (e) {
        console.error("Error on Load:", e);
    }
};
