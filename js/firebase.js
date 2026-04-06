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
    limit,
    writeBatch  // ✅ إضافة batch للعمليات المتعددة
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

        if (conditions.length > 0) {
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
        if (!docId) return null;
        const ref = doc(db, collectionName, docId);
        const snap = await getDoc(ref);
        return snap.exists() ? { id: snap.id, ...snap.data() } : null;
    } catch (error) {
        console.error(`❌ خطأ في المستند ${collectionName}/${docId}:`, error);
        return null;
    }
}

// ================= Load Cache =================
export async function loadCustomersAndProducts(forceReload = false) {
    if (!forceReload && customersMap.size > 0 && productsMap.size > 0) {
        console.log('✅ استخدام البيانات المخزنة مؤقتاً');
        return;
    }

    customersMap.clear();
    productsMap.clear();

    try {
        const [customersSnap, productsSnap] = await Promise.all([
            getDocs(collection(db, 'customers')),
            getDocs(collection(db, 'products'))
        ]);

        customersSnap.forEach(d => customersMap.set(d.id, d.data()));
        productsSnap.forEach(d => productsMap.set(d.id, d.data()));
        
        console.log(`✅ تم تحميل ${customersMap.size} عميل و ${productsMap.size} منتج`);
    } catch (error) {
        console.error('❌ خطأ في تحميل الكاش:', error);
    }
}

// ================= Order (مع دعم الصور) =================
export async function getOrderFull(orderId) {
    try {
        const order = await getDocument('orders', orderId);
        if (!order) return null;

        await loadCustomersAndProducts();

        const customer = customersMap.get(order.customerId) || { name: 'غير معروف' };

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

// ================= جلب جميع الطلبات مع الصور (محسّن) =================
export async function getAllOrdersFull(limitCount = 500) {
    try {
        console.log('🔄 جاري جلب جميع الطلبات مع الصور...');
        
        await loadCustomersAndProducts();
        
        const ordersRef = collection(db, 'orders');
        const q = query(ordersRef, orderBy('createdAt', 'desc'), limit(limitCount));
        const querySnapshot = await getDocs(q);
        
        const orders = [];
        querySnapshot.forEach((doc) => {
            const orderData = doc.data();
            orders.push({ id: doc.id, ...orderData });
        });
        
        console.log(`✅ تم جلب ${orders.length} طلب من قاعدة البيانات`);
        
        const fullOrders = orders.map(order => {
            const customer = customersMap.get(order.customerId) || { name: 'غير معروف' };
            
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

// ================= جلب الطلبات مع فلترة (محسّن) =================
export async function getFilteredOrdersFull(filters = {}) {
    try {
        console.log('🔄 جاري جلب الطلبات المفلترة...', filters);
        
        await loadCustomersAndProducts();
        
        let constraints = [];
        
        if (filters.status && filters.status !== '') {
            constraints.push(where('status', '==', filters.status));
        }
        if (filters.customerId) {
            constraints.push(where('customerId', '==', filters.customerId));
        }
        if (filters.shippingMethod && filters.shippingMethod !== '') {
            constraints.push(where('shippingMethod', '==', filters.shippingMethod));
        }
        if (filters.startDate) {
            constraints.push(where('orderDate', '>=', filters.startDate));
        }
        if (filters.endDate) {
            constraints.push(where('orderDate', '<=', filters.endDate));
        }
        
        // إضافة الترتيب
        constraints.push(orderBy('createdAt', 'desc'));
        
        // إضافة الحد
        if (filters.limit) {
            constraints.push(limit(filters.limit));
        }
        
        const ordersRef = collection(db, 'orders');
        const q = constraints.length > 0 ? query(ordersRef, ...constraints) : query(ordersRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        const orders = [];
        querySnapshot.forEach((doc) => {
            orders.push({ id: doc.id, ...doc.data() });
        });
        
        const fullOrders = orders.map(order => {
            const customer = customersMap.get(order.customerId) || { name: 'غير معروف' };
            
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
        
        console.log(`✅ تم جلب ${fullOrders.length} طلب مفلتر`);
        return fullOrders;
        
    } catch (error) {
        console.error("❌ خطأ في جلب الطلبات المفلترة:", error);
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

// ================= Products (محسّن) =================
export const loadProducts = async () => {
    try {
        const productsRef = collection(db, 'products');
        const q = query(productsRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const products = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log(`✅ تم تحميل ${products.length} منتج`);
        return products;
    } catch (error) {
        console.error('❌ خطأ في تحميل المنتجات:', error);
        return [];
    }
};

export const loadCustomers = async () => {
    try {
        const customersRef = collection(db, 'customers');
        const q = query(customersRef, orderBy('name', 'asc'));
        const querySnapshot = await getDocs(q);
        const customers = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log(`✅ تم تحميل ${customers.length} عميل`);
        return customers;
    } catch (error) {
        console.error('❌ خطأ في تحميل العملاء:', error);
        return [];
    }
};

export const loadOrders = async () => {
    try {
        console.log('🔄 جاري تحميل الطلبات...');
        const ordersRef = collection(db, 'orders');
        const q = query(ordersRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const orders = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log(`✅ تم تحميل ${orders.length} طلب`);
        return orders;
    } catch (error) {
        console.error('❌ خطأ في تحميل الطلبات:', error);
        return [];
    }
};

// ================= CRUD =================
export const addProduct = async (data) => {
    try {
        const docRef = await addDoc(collection(db, 'products'), { 
            ...data, 
            image: data.image || '',
            createdAt: nowISO(), 
            updatedAt: nowISO() 
        });
        console.log('✅ تم إضافة المنتج:', docRef.id);
        return docRef;
    } catch (error) {
        console.error('❌ خطأ في إضافة المنتج:', error);
        throw error;
    }
};

export const updateProduct = async (id, data) => {
    try {
        await updateDoc(doc(db, 'products', id), { 
            ...data, 
            image: data.image || '',
            updatedAt: nowISO() 
        });
        console.log('✅ تم تحديث المنتج:', id);
        return true;
    } catch (error) {
        console.error('❌ خطأ في تحديث المنتج:', error);
        throw error;
    }
};

export const deleteProduct = async (id) => {
    try {
        await deleteDoc(doc(db, 'products', id));
        console.log('✅ تم حذف المنتج:', id);
        return true;
    } catch (error) {
        console.error('❌ خطأ في حذف المنتج:', error);
        throw error;
    }
};

export const addOrder = async (data) => {
    try {
        const itemsWithImages = (data.items || []).map(item => ({
            ...item,
            image: item.image || ''
        }));
        
        const docRef = await addDoc(collection(db, 'orders'), { 
            ...data, 
            items: itemsWithImages,
            createdAt: nowISO(), 
            updatedAt: nowISO() 
        });
        console.log('✅ تم إضافة الطلب:', docRef.id);
        return docRef;
    } catch (error) {
        console.error('❌ خطأ في إضافة الطلب:', error);
        throw error;
    }
};

export const updateOrder = async (id, data) => {
    try {
        const itemsWithImages = (data.items || []).map(item => ({
            ...item,
            image: item.image || ''
        }));
        
        await updateDoc(doc(db, 'orders', id), { 
            ...data, 
            items: itemsWithImages,
            updatedAt: nowISO() 
        });
        console.log('✅ تم تحديث الطلب:', id);
        return true;
    } catch (error) {
        console.error('❌ خطأ في تحديث الطلب:', error);
        throw error;
    }
};

export const deleteOrder = async (id) => {
    try {
        await deleteDoc(doc(db, 'orders', id));
        console.log('✅ تم حذف الطلب:', id);
        return true;
    } catch (error) {
        console.error('❌ خطأ في حذف الطلب:', error);
        throw error;
    }
};

export const addCustomer = async (data) => {
    try {
        const docRef = await addDoc(collection(db, 'customers'), { 
            ...data, 
            createdAt: nowISO(), 
            updatedAt: nowISO() 
        });
        console.log('✅ تم إضافة العميل:', docRef.id);
        return docRef;
    } catch (error) {
        console.error('❌ خطأ في إضافة العميل:', error);
        throw error;
    }
};

export const updateCustomer = async (id, data) => {
    try {
        await updateDoc(doc(db, 'customers', id), { 
            ...data, 
            updatedAt: nowISO() 
        });
        console.log('✅ تم تحديث العميل:', id);
        return true;
    } catch (error) {
        console.error('❌ خطأ في تحديث العميل:', error);
        throw error;
    }
};

export const deleteCustomer = async (id) => {
    try {
        await deleteDoc(doc(db, 'customers', id));
        console.log('✅ تم حذف العميل:', id);
        return true;
    } catch (error) {
        console.error('❌ خطأ في حذف العميل:', error);
        throw error;
    }
};

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

export async function getProductWithImage(productId) {
    try {
        const product = await getDocument('products', productId);
        if (!product) return null;
        
        return {
            ...product,
            image: product.image || '',
            imageUrl: product.image || ''
        };
    } catch (error) {
        console.error('❌ خطأ في جلب المنتج:', error);
        return null;
    }
}

// ================= دالة اختبار الاتصال =================
export async function testConnection() {
    try {
        console.log('🔄 اختبار الاتصال بقاعدة البيانات...');
        const testRef = collection(db, 'orders');
        const snapshot = await getDocs(testRef);
        console.log(`✅ الاتصال ناجح! عدد الطلبات: ${snapshot.size}`);
        return { success: true, count: snapshot.size };
    } catch (error) {
        console.error('❌ فشل الاتصال:', error);
        return { success: false, error: error.message };
    }
}

// ================= دالة للعمليات المتعددة (Batch) =================
export async function batchOperations(operations) {
    const batch = writeBatch(db);
    
    for (const op of operations) {
        const ref = doc(db, op.collection, op.id);
        if (op.type === 'set') {
            batch.set(ref, op.data);
        } else if (op.type === 'update') {
            batch.update(ref, op.data);
        } else if (op.type === 'delete') {
            batch.delete(ref);
        }
    }
    
    await batch.commit();
    console.log(`✅ تم تنفيذ ${operations.length} عملية بنجاح`);
}

// ================= دالة لجلب إحصائيات سريعة =================
export async function getQuickStats() {
    try {
        const [productsSnap, ordersSnap, customersSnap] = await Promise.all([
            getDocs(collection(db, 'products')),
            getDocs(collection(db, 'orders')),
            getDocs(collection(db, 'customers'))
        ]);
        
        let totalRevenue = 0;
        ordersSnap.forEach(doc => {
            totalRevenue += doc.data().total || 0;
        });
        
        return {
            products: productsSnap.size,
            orders: ordersSnap.size,
            customers: customersSnap.size,
            revenue: totalRevenue
        };
    } catch (error) {
        console.error('❌ خطأ في جلب الإحصائيات:', error);
        return null;
    }
}

// ================= Export =================
export { db };
