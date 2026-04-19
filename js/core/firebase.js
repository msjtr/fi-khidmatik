/**
 * js/core/firebase.js
 * تهيئة اتصال Firebase
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getFirestore, 
    enableIndexedDbPersistence 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { 
    getAuth, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// تكوين Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBWYW6Qqlhh904pBeuJ29wY7Cyjm2uklBA",
    authDomain: "msjt301-974bb.firebaseapp.com",
    projectId: "msjt301-974bb",
    storageBucket: "msjt301-974bb.firebasestorage.app",
    messagingSenderId: "186209858482",
    appId: "1:186209858482:web:186ca610780799ef562aab"
};

// تهيئة Firebase
let app = null;
let db = null;
let auth = null;
let isInitialized = false;

async function initializeFirebase() {
    try {
        app = initializeApp(firebaseConfig);
        db = getFirestore(app);
        auth = getAuth(app);
        
        // تمكين التخزين المؤقت للعمل دون اتصال
        try {
            await enableIndexedDbPersistence(db);
            console.log('✅ Offline persistence enabled');
        } catch (err) {
            if (err.code === 'failed-precondition') {
                console.warn('⚠️ Multiple tabs open, persistence limited');
            }
        }
        
        isInitialized = true;
        console.log('✅ Firebase initialized successfully');
        
        // مراقبة حالة المصادقة
        onAuthStateChanged(auth, (user) => {
            if (user) {
                console.log('👤 User signed in:', user.email);
            } else {
                console.log('👤 No user signed in');
            }
        });
        
    } catch (error) {
        console.error('❌ Firebase initialization failed:', error);
        isInitialized = false;
    }
}

// بدء التهيئة
await initializeFirebase();

export { db, auth, app, isInitialized };
