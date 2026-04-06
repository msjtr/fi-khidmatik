// ===================== Firebase Core =====================
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
    query,
    where,
    orderBy,
    limit
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

// ================= Config =================
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

// ================= Cache =================
export let customersMap = new Map();
export let productsMap = new Map();

// ================= Helper =================
const nowISO = () => new Date().toISOString();

// ================= Advanced Collection =================
export async function getCollection(name, conditions = [], sortBy = null, limitCount = null) {
    try {
        let ref = collection(db, name);
        let q = ref;

        if (conditions.length) {
            conditions.forEach(cond => {
                q = query(q, where(cond.field, cond.operator, cond.value));
            });
        }

        if (sortBy) {
            q = query(q, orderBy(sortBy.field, sortBy.direction || 'asc'));
        }

        if (limitCount) {
            q = query(q, limit(limitCount));
        }

        const snap = await getDocs(q);
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));

    } catch (error) {
        console.error(`❌ خطأ في ${name}:`, error);
        return [];
    }
}

// ================= Single Document =================
export async function getDocument(collectionName, docId) {
    try {
        const ref = doc(db, collectionName, docId);
        const snap = await getDoc(ref);
        return snap.exists() ? { id: snap.id, ...snap.data() } : null;
    } catch (error) {
        console.error(`❌ خطأ في المستند ${collectionName}:`, error);
        return null;
    }
}

// ================= Load Cache =================
export async function loadCustomersAndProducts(forceReload = false) {
    if (!forceReload && customersMap.size && productsMap.size) {
        return;
    }

    customersMap.clear();
    productsMap.clear();

    const [customersSnap, productsSnap] = await Promise.all([
        getDocs(collection(db, 'customers')),
        getDocs(collection(db, 'products'))
    ]);

    customersSnap.forEach(d => customersMap.set(d.id, d.data()));
    productsSnap.forEach(d => productsMap.set(d.id, d.data()));
}

// ================= Order (مع دعم الصور) =================
export async function getOrderFull(orderId) {
    try {
        const order = await getDocument('orders', orderId);
        if (!order) return null;

        await loadCustomersAndProducts();

        const customer = customersMap.get(order.customerId) || {};

        const items = (order.items || []).map(item => {
            const product = productsMap.get(item.productId) || {};
            const finalImage = product.image || item.image || '';
            
            return {
                ...item,
                productName: product.name || item.name || 'غير معروف',
                description: product.description || item.description || '',
                image: finalImage,
                price: item.price || product.price || 0,
                stock: product.stock || 0,
                cost: product.cost || 0,
                code: product.code || item.barcode || ''
            };
        });

        return {
            ...order,
            customer,
            items
        };

    } catch (err) {
        console.error("❌ خطأ في جلب الطلب الكامل:", err);
        return null;
    }
}

// ================= جلب جميع الطلبات مع الصور =================
export async function getAllOrdersFull(limitCount = 100) {
    try {
        await loadCustomersAndProducts();
        
        const orders = await getCollection('orders', [], { field: 'createdAt', direction: 'desc' }, limitCount);
        
        const fullOrders = orders.map(order => {
            const customer = customersMap.get(order.customerId) || {};
            
            const items = (order.items || []).map(item => {
                const product = productsMap.get(item.productId) || {};
                const finalImage = product.image || item.image || '';
                
                return {
                    ...item,
                    productName: product.name || item.name || 'غير معروف',
                    description: product.description || item.description || '',
                    image: finalImage,
                    price: item.price || product.price || 0
                };
            });
            
            return {
                ...order,
                customer,
                items
            };
        });
        
        return fullOrders;
        
    } catch (error) {
        console.error("❌ خطأ في جلب جميع الطلبات:", error);
        return [];
    }
}

// ================= Totals Helper =================
export function calculateTotals(items = [], discount = 0, discountType = 'fixed') {
    let subtotal = 0;
    items.forEach(i => {
        subtotal += (i.price || 0) * (i.quantity || 1);
    });

    let discountAmount = discountType === 'percent' ? (subtotal * discount) / 100 : discount;
    const afterDiscount = subtotal - discountAmount;
    const vat = afterDiscount * 0.15;
    const total = afterDiscount + vat;

    return {
        subtotal,
        discount: discountAmount,
        vat,
        total
    };
}

// ================= Products =================
export const loadProducts = () => getCollection('products');
export const loadCustomers = () => getCollection('customers', [], { field: 'name', direction: 'asc' });
export const loadOrders = () => getCollection('orders', [], { field: 'createdAt', direction: 'desc' });

// ================= CRUD =================
export const addProduct = (data) =>
    addDoc(collection(db, 'products'), { 
        ...data, 
        image: data.image || '',
        createdAt: nowISO(), 
        updatedAt: nowISO() 
    });

export const updateProduct = (id, data) =>
    updateDoc(doc(db, 'products', id), { 
        ...data, 
        image: data.image || '',
        updatedAt: nowISO() 
    });

export const deleteProduct = (id) =>
    deleteDoc(doc(db, 'products', id));

export const addOrder = (data) => {
    const itemsWithImages = (data.items || []).map(item => ({
        ...item,
        image: item.image || ''
    }));
    
    return addDoc(collection(db, 'orders'), { 
        ...data, 
        items: itemsWithImages,
        createdAt: nowISO(), 
        updatedAt: nowISO() 
    });
};

export const updateOrder = (id, data) => {
    const itemsWithImages = (data.items || []).map(item => ({
        ...item,
        image: item.image || ''
    }));
    
    return updateDoc(doc(db, 'orders', id), { 
        ...data, 
        items: itemsWithImages,
        updatedAt: nowISO() 
    });
};

export const deleteOrder = (id) =>
    deleteDoc(doc(db, 'orders', id));

export const addCustomer = (data) =>
    addDoc(collection(db, 'customers'), { ...data, createdAt: nowISO(), updatedAt: nowISO() });

export const updateCustomer = (id, data) =>
    updateDoc(doc(db, 'customers', id), { ...data, updatedAt: nowISO() });

export const deleteCustomer = (id) =>
    deleteDoc(doc(db, 'customers', id));

// ================= دوال إضافية =================
export async function updateProductImage(productId, imageUrl) {
    try {
        const productRef = doc(db, 'products', productId);
        await updateDoc(productRef, {
            image: imageUrl,
            updatedAt: nowISO()
        });
        
        if (productsMap.has(productId)) {
            const product = productsMap.get(productId);
            productsMap.set(productId, { ...product, image: imageUrl });
        }
        
        console.log('✅ تم تحديث صورة المنتج:', productId);
        return true;
        
    } catch (error) {
        console.error('❌ خطأ في تحديث صورة المنتج:', error);
        return false;
    }
}

// ================= Export =================
export { db };
