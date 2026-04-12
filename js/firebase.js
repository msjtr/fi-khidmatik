const firebaseConfig = {
    apiKey: "AIzaSyBWYW6Qqlhh904pBeuJ29wY7Cyjm2uklBA",
    authDomain: "msjt301-974bb.firebaseapp.com",
    projectId: "msjt301-974bb",
    storageBucket: "msjt301-974bb.firebasestorage.app",
    messagingSenderId: "186209858482",
    appId: "1:186209858482:web:186ca610780799ef562aab"
};

if (typeof firebase !== "undefined") {
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
} else {
    console.error("❌ Firebase SDK غير محمل");
}

let db = null;
try {
    db = firebase.firestore();
} catch (e) {
    console.error("❌ Firestore غير مفعل", e);
}

// الدوال
async function addDocument(collectionName, data) {
    try { const docRef = await db.collection(collectionName).add(data); return { id: docRef.id, success: true }; } 
    catch (error) { return { success: false, error: error.message }; }
}

async function getDocument(collectionName, docId) {
    try { const snap = await db.collection(collectionName).doc(docId).get();
        return snap.exists ? { id: snap.id, ...snap.data(), success: true } : { success: false, error: "Not found" }; } 
    catch (error) { return { success: false, error: error.message }; }
}

// تصدير للنافذة العامة
window.db = db;
window.getDocument = getDocument;
console.log("🔥 Firebase جاهز ويعمل");
