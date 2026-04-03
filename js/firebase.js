import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import {
    getFirestore,
    collection,
    addDoc,
    doc,
    getDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    setDoc,
    query,      // إضافة
    where,      // إضافة
    orderBy,    // إضافة
    limit       // إضافة
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBWYW6Qqlhh904pBeuJ29wY7Cyjm2uklBA",
    authDomain: "msjt301-974bb.firebaseapp.com",
    projectId: "msjt301-974bb",
    storageBucket: "msjt301-974bb.firebasestorage.app",
    messagingSenderId: "186209858482",
    appId: "1:186209858482:web:186ca610780799ef562aab"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ========== دوال مساعدة متقدمة ==========
export async function getCollection(name, conditions = [], sortBy = null, limitCount = null) {
    try {
        let q = collection(db, name);
        
        // إضافة شروط البحث
        if (conditions.length > 0) {
            conditions.forEach(cond => {
                q = query(q, where(cond.field, cond.operator, cond.value));
            });
        }
        
        // إضافة ترتيب
        if (sortBy) {
            q = query(q, orderBy(sortBy.field, sortBy.direction || 'asc'));
        }
        
        // إضافة حد
        if (limitCount) {
            q = query(q, limit(limitCount));
        }
        
        const snap = await getDocs(q);
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (error) {
        console.error(`خطأ في جلب مجموعة ${name}:`, error);
        throw error;
    }
}

// الحصول على عنصر واحد
export async function getDocument(collectionName, docId) {
    try {
        const docRef = doc(db, collectionName, docId);
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
    } catch (error) {
        console.error(`خطأ في جلب المستند ${collectionName}/${docId}:`, error);
        throw error;
    }
}

// ========== المنتجات ==========
export const loadProducts = () => getCollection('products');
export const loadProductsWithFilter = (filters = {}) => {
    const conditions = [];
    if (filters.category) conditions.push({ field: 'category', operator: '==', value: filters.category });
    if (filters.minPrice) conditions.push({ field: 'price', operator: '>=', value: filters.minPrice });
    if (filters.maxPrice) conditions.push({ field: 'price', operator: '<=', value: filters.maxPrice });
    return getCollection('products', conditions);
};

export const addProduct = (data) => {
    const productData = {
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    return addDoc(collection(db, 'products'), productData);
};

export const updateProduct = (id, data) => {
    const updateData = {
        ...data,
        updatedAt: new Date().toISOString()
    };
    return updateDoc(doc(db, 'products', id), updateData);
};

export const deleteProduct = (id) => deleteDoc(doc(db, 'products', id));
export const updateProductStock = (id, newStock) => updateDoc(doc(db, 'products', id), { 
    stock: newStock,
    updatedAt: new Date().toISOString()
});

// البحث عن منتج
export const searchProducts = async (searchTerm) => {
    const products = await loadProducts();
    return products.filter(p => 
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.barcode?.toLowerCase().includes(searchTerm.toLowerCase())
    );
};

// ========== الطلبات ==========
export const loadOrders = () => getCollection('orders', [], { field: 'orderDate', direction: 'desc' });
export const loadOrdersByDate = (startDate, endDate) => {
    return getCollection('orders', [
        { field: 'orderDate', operator: '>=', value: startDate },
        { field: 'orderDate', operator: '<=', value: endDate }
    ]);
};

export const addOrder = (data) => {
    const orderData = {
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    return addDoc(collection(db, 'orders'), orderData);
};

export const updateOrder = (id, data) => {
    const updateData = {
        ...data,
        updatedAt: new Date().toISOString()
    };
    return updateDoc(doc(db, 'orders', id), updateData);
};

export const deleteOrder = (id) => deleteDoc(doc(db, 'orders', id));

export const getOrdersWithDetails = async () => {
    try {
        const [orders, customers, products] = await Promise.all([
            loadOrders(),
            loadCustomers(),
            loadProducts()
        ]);
        
        const customersMap = Object.fromEntries(customers.map(c => [c.id, c]));
        const productsMap = Object.fromEntries(products.map(p => [p.id, p]));
        
        return orders.map(order => ({
            ...order,
            customer: customersMap[order.customerId] || { name: 'غير معروف', id: 'unknown' },
            items: order.items?.map(item => ({ 
                ...item, 
                productDetails: productsMap[item.productId] || null 
            })) || []
        }));
    } catch (error) {
        console.error('خطأ في جلب تفاصيل الطلبات:', error);
        throw error;
    }
};

// إحصائيات الطلبات
export const getOrdersStats = async () => {
    const orders = await loadOrders();
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    const ordersByStatus = orders.reduce((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
    }, {});
    
    return { totalOrders, totalRevenue, ordersByStatus };
};

// ========== العملاء ==========
export const loadCustomers = () => getCollection('customers', [], { field: 'name', direction: 'asc' });
export const addCustomer = (data) => {
    const customerData = {
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    return addDoc(collection(db, 'customers'), customerData);
};

export const updateCustomer = (id, data) => {
    const updateData = {
        ...data,
        updatedAt: new Date().toISOString()
    };
    return updateDoc(doc(db, 'customers', id), updateData);
};

export const deleteCustomer = (id) => deleteDoc(doc(db, 'customers', id));

// البحث عن عميل
export const searchCustomers = async (searchTerm) => {
    const customers = await loadCustomers();
    return customers.filter(c => 
        c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone?.includes(searchTerm) ||
        c.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
};

// الحصول على طلبات العميل
export const getCustomerOrders = async (customerId) => {
    const orders = await loadOrders();
    return orders.filter(order => order.customerId === customerId);
};

// ========== الإعدادات ==========
export async function getSettings(id) {
    try {
        const docRef = doc(db, 'settings', id);
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? docSnap.data() : null;
    } catch (error) {
        console.error(`خطأ في جلب الإعدادات ${id}:`, error);
        return null;
    }
}

export const setSettings = (id, data) => setDoc(doc(db, 'settings', id), data, { merge: true });

// الحصول على جميع الإعدادات
export const getAllSettings = async () => {
    const settingsSnap = await getDocs(collection(db, 'settings'));
    return settingsSnap.docs.reduce((acc, doc) => {
        acc[doc.id] = doc.data();
        return acc;
    }, {});
};

// ========== دوال عامة ==========
// حذف مجموعة كاملة (استخدم بحذر!)
export const deleteCollection = async (collectionName, batchSize = 10) => {
    const querySnapshot = await getDocs(collection(db, collectionName));
    const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
};

// نسخ احتياطي
export const backupCollection = async (collectionName) => {
    const data = await getCollection(collectionName);
    const backup = {
        collection: collectionName,
        data: data,
        backupDate: new Date().toISOString()
    };
    // حفظ النسخة في localStorage أو إرسالها للتحميل
    localStorage.setItem(`backup_${collectionName}`, JSON.stringify(backup));
    return backup;
};

// استعادة نسخة احتياطية
export const restoreBackup = async (collectionName, backupData) => {
    const currentData = await getCollection(collectionName);
    // حذف البيانات الحالية
    await deleteCollection(collectionName);
    // إضافة البيانات المحفوظة
    const addPromises = backupData.data.map(item => {
        const { id, ...data } = item;
        return setDoc(doc(db, collectionName, id), data);
    });
    await Promise.all(addPromises);
};

export { db };
