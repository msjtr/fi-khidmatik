// ========================================
// js/firebase.js - تهيئة Firebase للمشروع (نسخة متكاملة)
// ========================================

// استيراد الدوال اللازمة من Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    doc, 
    addDoc, 
    getDoc, 
    getDocs, 
    updateDoc, 
    deleteDoc, 
    query, 
    where, 
    orderBy, 
    limit, 
    writeBatch, 
    serverTimestamp,
    setDoc
} from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";
import { 
    getStorage, 
    ref, 
    uploadBytes, 
    getDownloadURL, 
    deleteObject 
} from "https://www.gstatic.com/firebasejs/12.12.0/firebase-storage.js";

// تكوين Firebase (من حسابك)
const firebaseConfig = {
    apiKey: "AIzaSyBWYW6Qqlhh904pBeuJ29wY7Cyjm2uklBA",
    authDomain: "msjt301-974bb.firebaseapp.com",
    projectId: "msjt301-974bb",
    storageBucket: "msjt301-974bb.firebasestorage.app",
    messagingSenderId: "186209858482",
    appId: "1:186209858482:web:186ca610780799ef562aab",
    measurementId: "G-NDVGC9GPQZ"  // اختياري، يمكنك إزالته إذا لم تستخدم Analytics
};

// تهيئة Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// ================= دوال مساعدة للعمليات على قاعدة البيانات =================
async function addDocument(collectionName, data) {
    try {
        const docRef = await addDoc(collection(db, collectionName), data);
        return { id: docRef.id, success: true };
    } catch (error) {
        console.error('❌ Error adding document:', error);
        return { success: false, error: error.message };
    }
}

async function getDocument(collectionName, docId) {
    try {
        const docSnap = await getDoc(doc(db, collectionName, docId));
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data(), success: true };
        }
        return { success: false, error: 'Document not found' };
    } catch (error) {
        console.error('❌ Error getting document:', error);
        return { success: false, error: error.message };
    }
}

async function getAllDocuments(collectionName) {
    try {
        const querySnapshot = await getDocs(collection(db, collectionName));
        const documents = [];
        querySnapshot.forEach(doc => {
            documents.push({ id: doc.id, ...doc.data() });
        });
        return { data: documents, success: true };
    } catch (error) {
        console.error('❌ Error getting documents:', error);
        return { success: false, error: error.message };
    }
}

async function updateDocument(collectionName, docId, data) {
    try {
        await updateDoc(doc(db, collectionName, docId), data);
        return { success: true };
    } catch (error) {
        console.error('❌ Error updating document:', error);
        return { success: false, error: error.message };
    }
}

async function deleteDocument(collectionName, docId) {
    try {
        await deleteDoc(doc(db, collectionName, docId));
        return { success: true };
    } catch (error) {
        console.error('❌ Error deleting document:', error);
        return { success: false, error: error.message };
    }
}

async function setDocument(collectionName, docId, data) {
    try {
        await setDoc(doc(db, collectionName, docId), data, { merge: true });
        return { success: true };
    } catch (error) {
        console.error('❌ Error setting document:', error);
        return { success: false, error: error.message };
    }
}

async function queryDocuments(collectionName, field, operator, value) {
    try {
        const q = query(collection(db, collectionName), where(field, operator, value));
        const querySnapshot = await getDocs(q);
        const documents = [];
        querySnapshot.forEach(doc => {
            documents.push({ id: doc.id, ...doc.data() });
        });
        return { data: documents, success: true };
    } catch (error) {
        console.error('❌ Error querying documents:', error);
        return { success: false, error: error.message };
    }
}

// ================= دوال رفع الملفات إلى Storage =================
async function uploadImage(file, path) {
    try {
        const storageRef = ref(storage, path);
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        return { url: downloadURL, success: true };
    } catch (error) {
        console.error('❌ Error uploading image:', error);
        return { success: false, error: error.message };
    }
}

async function deleteImage(path) {
    try {
        const storageRef = ref(storage, path);
        await deleteObject(storageRef);
        return { success: true };
    } catch (error) {
        console.error('❌ Error deleting image:', error);
        return { success: false, error: error.message };
    }
}

// ================= تصدير الكائنات والدوال للاستخدام في وحدات أخرى =================
export { 
    db,
    storage,
    collection,
    doc,
    addDoc,
    getDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    writeBatch,
    serverTimestamp,
    setDoc,
    addDocument,
    getDocument,
    getAllDocuments,
    updateDocument,
    deleteDocument,
    setDocument as setDocumentWithMerge,
    queryDocuments,
    uploadImage,
    deleteImage
};

// ================= للتوافق مع الكود القديم (غير النمطي) =================
window.db = db;
window.storage = storage;
window.addDocument = addDocument;
window.getDocument = getDocument;
window.getAllDocuments = getAllDocuments;
window.updateDocument = updateDocument;
window.deleteDocument = deleteDocument;
window.setDocument = setDocument;
window.queryDocuments = queryDocuments;
window.uploadImage = uploadImage;
window.deleteImage = deleteImage;
window.firebaseConfig = firebaseConfig;

console.log('✅ Firebase initialized successfully (Modular SDK v9+)');
