const firebaseConfig = {
    apiKey: "AIzaSyBWYW6Qqlhh904pBeuJ29wY7Cyjm2uklBA",
    authDomain: "msjt301-974bb.firebaseapp.com",
    projectId: "msjt301-974bb",
    storageBucket: "msjt301-974bb.firebasestorage.app",
    messagingSenderId: "186209858482",
    appId: "1:186209858482:web:186ca610780799ef562aab"
};
if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

window.db = db;
window.getDocument = async (col, id) => {
    try {
        const snap = await db.collection(col).doc(id).get();
        return snap.exists ? { id: snap.id, ...snap.data(), success: true } : { success: false };
    } catch (e) { return { success: false, error: e.message }; }
};
