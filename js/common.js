// استيراد من firebase.js فقط (كل الدوال موجودة هناك)
import {
    db,
    collection,
    addDoc,
    doc,
    getDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    setDoc,
    getCollection,
    loadProducts,
    addProduct,
    deleteProduct,
    loadOrders,
    addOrder,
    deleteOrder,
    updateOrderStatus,
    getSettings,
    setSettings
} from './firebase.js';

// فقط إعادة تصدير (لا تعيد تعريف الدوال)
export {
    db,
    collection,
    addDoc,
    doc,
    getDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    setDoc,
    getCollection,
    loadProducts,
    addProduct,
    deleteProduct,
    loadOrders,
    addOrder,
    deleteOrder,
    updateOrderStatus,
    getSettings,
    setSettings
};
