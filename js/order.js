// js/order.js - نظام إدارة الطلبات المتكامل (مع معالجة المسارات المطلقة للصور)

// استيراد دوال Firebase بشكل صحيح
import { 
    db,
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
    serverTimestamp
} from './firebase.js';

// ================= المتغيرات العامة =================
export let customersMap = new Map();
export let productsMap = new Map();
let cacheLastUpdated = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 دقائق

// ================= دالة تحويل المسار النسبي إلى مطلق =================
function toAbsoluteImageUrl(url) {
    if (!url) return '';
    if (url.startsWith('data:') || url.startsWith('http://') || url.startsWith('https://')) {
        return url;
    }
    if (url.startsWith('/')) {
        return window.location.origin + url;
    }
    return window.location.origin + '/fi-khidmatik/' + url;
}

// ================= دوال مساعدة =================
const nowISO = () => new Date().toISOString();

function getPaymentMethodName(method) {
    const methods = {
        'mada': 'مدى',
        'mastercard': 'ماستركارد',
        'visa': 'فيزا',
        'stcpay': 'STCPay',
        'tamara': 'تمارا',
        'tabby': 'تابي',
        'other': 'أخرى'
    };
    return methods[method] || method || 'مدى';
}

// ================= جلب المستندات =================
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

export async function getCollection(name, conditions = [], sortBy = null, limitCount = null) {
    try {
        let q = collection(db, name);

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
        console.error(`❌ خطأ في جلب مجموعة ${name}:`, error);
        return [];
    }
}

// ================= تحميل الكاش =================
export async function loadCustomersAndProducts(forceReload = false) {
    const now = Date.now();
    if (!forceReload && customersMap.size > 0 && productsMap.size > 0 && (now - cacheLastUpdated) < CACHE_DURATION) {
        console.log('✅ استخدام البيانات المخزنة مؤقتاً (صالحة)');
        return { customers: customersMap, products: productsMap };
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
        cacheLastUpdated = now;
        
        console.log(`✅ تم تحميل ${customersMap.size} عميل و ${productsMap.size} منتج`);
        return { customers: customersMap, products: productsMap };
    } catch (error) {
        console.error('❌ خطأ في تحميل الكاش:', error);
        throw error;
    }
}

// ================= جلب الطلب كامل مع البيانات =================
export async function getOrderFull(orderId) {
    try {
        if (!orderId) {
            console.error('❌ orderId مطلوب');
            return null;
        }
        
        await loadCustomersAndProducts();
        
        const order = await getDocument('orders', orderId);
        if (!order) return null;

        const customer = customersMap.get(order.customerId) || { 
            name: 'غير معروف', 
            phone: '', 
            email: '',
            address: '' 
        };

        const items = (order.items || []).map(item => {
            const product = productsMap.get(item.productId) || {};
            const finalImage = toAbsoluteImageUrl(product.image || item.image || '');
            
            return {
                ...item,
                productId: item.productId || null,
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
            customer: {
                id: order.customerId,
                name: customer.name,
                phone: customer.phone,
                email: customer.email,
                address: customer.address || ''
            },
            customerName: customer.name,
            customerPhone: customer.phone,
            customerEmail: customer.email,
            customerAddress: customer.address || '',
            items,
            paymentMethodName: getPaymentMethodName(order.paymentMethod)
        };

    } catch (err) {
        console.error("❌ خطأ في جلب الطلب الكامل:", err);
        return null;
    }
}

// ================= جلب جميع الطلبات كاملة =================
export async function getAllOrdersFull(limitCount = 500) {
    try {
        console.log('🔄 جاري جلب جميع الطلبات مع الصور...');
        
        await loadCustomersAndProducts();
        
        const ordersRef = collection(db, 'orders');
        const q = query(ordersRef, orderBy('createdAt', 'desc'), limit(limitCount));
        const querySnapshot = await getDocs(q);
        
        const orders = [];
        querySnapshot.forEach((doc) => {
            orders.push({ id: doc.id, ...doc.data() });
        });
        
        console.log(`✅ تم جلب ${orders.length} طلب من قاعدة البيانات`);
        
        const fullOrders = orders.map(order => {
            const customer = customersMap.get(order.customerId) || { name: 'غير معروف', phone: '', email: '' };
            
            const items = (order.items || []).map(item => {
                const product = productsMap.get(item.productId) || {};
                const finalImage = toAbsoluteImageUrl(product.image || item.image || '');
                
                return {
                    ...item,
                    productId: item.productId || null,
                    productName: product.name || item.name || 'غير معروف',
                    description: product.description || item.description || '',
                    image: finalImage,
                    price: item.price || product.price || 0
                };
            });
            
            return {
                ...order,
                customer,
                customerName: customer.name,
                customerPhone: customer.phone,
                customerEmail: customer.email,
                items,
                paymentMethodName: getPaymentMethodName(order.paymentMethod)
            };
        });
        
        return fullOrders;
        
    } catch (error) {
        console.error("❌ خطأ في جلب جميع الطلبات:", error);
        return [];
    }
}

// ================= جلب الطلبات المفلترة =================
export async function getFilteredOrdersFull(filters = {}) {
    try {
        console.log('🔄 جاري جلب الطلبات المفلترة...', filters);
        
        await loadCustomersAndProducts();
        
        const constraints = [orderBy('createdAt', 'desc')];
        
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
        if (filters.limit) {
            constraints.push(limit(filters.limit));
        }
        
        const ordersRef = collection(db, 'orders');
        const q = query(ordersRef, ...constraints);
        const querySnapshot = await getDocs(q);
        
        const orders = [];
        querySnapshot.forEach((doc) => {
            orders.push({ id: doc.id, ...doc.data() });
        });
        
        const fullOrders = orders.map(order => {
            const customer = customersMap.get(order.customerId) || { name: 'غير معروف', phone: '', email: '' };
            
            const items = (order.items || []).map(item => {
                const product = productsMap.get(item.productId) || {};
                const finalImage = toAbsoluteImageUrl(product.image || item.image || '');
                
                return {
                    ...item,
                    productId: item.productId || null,
                    productName: product.name || item.name || 'غير معروف',
                    description: product.description || item.description || '',
                    image: finalImage,
                    price: item.price || product.price || 0
                };
            });
            
            return {
                ...order,
                customer,
                customerName: customer.name,
                customerPhone: customer.phone,
                customerEmail: customer.email,
                items,
                paymentMethodName: getPaymentMethodName(order.paymentMethod)
            };
        });
        
        console.log(`✅ تم جلب ${fullOrders.length} طلب مفلتر`);
        return fullOrders;
        
    } catch (error) {
        console.error("❌ خطأ في جلب الطلبات المفلترة:", error);
        return [];
    }
}

// ================= حساب الإجماليات =================
export function calculateTotals(items = [], discount = 0, discountType = 'fixed') {
    let subtotal = 0;
    items.forEach(i => {
        subtotal += (i.price || 0) * (i.quantity || 1);
    });

    let discountAmount = discountType === 'percent' ? (subtotal * discount) / 100 : discount;
    const afterDiscount = Math.max(0, subtotal - discountAmount);
    const vat = afterDiscount * 0.15;
    const total = afterDiscount + vat;

    return {
        subtotal: parseFloat(subtotal.toFixed(2)),
        discount: parseFloat(discountAmount.toFixed(2)),
        vat: parseFloat(vat.toFixed(2)),
        total: parseFloat(total.toFixed(2))
    };
}

// ================= عمليات المنتجات =================
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

export const addProduct = async (data) => {
    try {
        if (!data.name || data.price === undefined) {
            throw new Error('اسم المنتج والسعر مطلوبان');
        }
        
        const productData = { 
            ...data, 
            image: toAbsoluteImageUrl(data.image || ''),
            code: data.code || `PRD-${Date.now()}`,
            stock: data.stock || 0,
            createdAt: nowISO(), 
            updatedAt: nowISO() 
        };
        
        const docRef = await addDoc(collection(db, 'products'), productData);
        console.log('✅ تم إضافة المنتج:', docRef.id);
        
        productsMap.set(docRef.id, productData);
        
        return { id: docRef.id, ...productData };
    } catch (error) {
        console.error('❌ خطأ في إضافة المنتج:', error);
        throw error;
    }
};

export const updateProduct = async (id, data) => {
    try {
        if (!id) throw new Error('معرف المنتج مطلوب');
        
        const updateData = { 
            ...data, 
            image: toAbsoluteImageUrl(data.image || ''),
            updatedAt: nowISO() 
        };
        
        await updateDoc(doc(db, 'products', id), updateData);
        console.log('✅ تم تحديث المنتج:', id);
        
        if (productsMap.has(id)) {
            const existing = productsMap.get(id);
            productsMap.set(id, { ...existing, ...updateData });
        }
        
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
        productsMap.delete(id);
        return true;
    } catch (error) {
        console.error('❌ خطأ في حذف المنتج:', error);
        throw error;
    }
};

export async function updateProductStock(productId, newStock) {
    try {
        if (!productId) throw new Error('معرف المنتج مطلوب');
        await updateDoc(doc(db, 'products', productId), { 
            stock: Math.max(0, newStock),
            updatedAt: nowISO()
        });
        
        if (productsMap.has(productId)) {
            const product = productsMap.get(productId);
            productsMap.set(productId, { ...product, stock: Math.max(0, newStock) });
        }
        
        return true;
    } catch (error) {
        console.error('❌ خطأ في تحديث مخزون المنتج:', error);
        return false;
    }
}

// ================= عمليات العملاء =================
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

export const addCustomer = async (data) => {
    try {
        if (!data.name || !data.phone) {
            throw new Error('الاسم والجوال مطلوبان');
        }
        
        const customerData = { 
            ...data, 
            createdAt: nowISO(), 
            updatedAt: nowISO() 
        };
        
        const docRef = await addDoc(collection(db, 'customers'), customerData);
        console.log('✅ تم إضافة العميل:', docRef.id);
        
        customersMap.set(docRef.id, customerData);
        
        return { id: docRef.id, ...customerData };
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
        
        if (customersMap.has(id)) {
            const existing = customersMap.get(id);
            customersMap.set(id, { ...existing, ...data });
        }
        
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
        customersMap.delete(id);
        return true;
    } catch (error) {
        console.error('❌ خطأ في حذف العميل:', error);
        throw error;
    }
};

// ================= عمليات الطلبات =================
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

export const addOrder = async (data) => {
    try {
        const itemsWithImages = (data.items || []).map(item => ({
            ...item,
            image: toAbsoluteImageUrl(item.image || ''),
            productId: item.productId || null
        }));
        
        const orderData = { 
            ...data, 
            items: itemsWithImages,
            createdAt: nowISO(), 
            updatedAt: nowISO(),
            orderNumber: data.orderNumber || `ORD-${Date.now()}`
        };
        
        const docRef = await addDoc(collection(db, 'orders'), orderData);
        console.log('✅ تم إضافة الطلب:', docRef.id);
        
        return { id: docRef.id, ...orderData };
    } catch (error) {
        console.error('❌ خطأ في إضافة الطلب:', error);
        throw error;
    }
};

export const updateOrder = async (id, data) => {
    try {
        const { createdAt, ...cleanData } = data;
        
        const itemsWithImages = (cleanData.items || []).map(item => ({
            ...item,
            image: toAbsoluteImageUrl(item.image || ''),
            productId: item.productId || null
        }));
        
        await updateDoc(doc(db, 'orders', id), { 
            ...cleanData, 
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

// ================= دوال إضافية =================
export async function updateProductImage(productId, imageUrl) {
    try {
        if (!productId) throw new Error('معرف المنتج مطلوب');
        
        const absoluteUrl = toAbsoluteImageUrl(imageUrl);
        const productRef = doc(db, 'products', productId);
        await updateDoc(productRef, {
            image: absoluteUrl,
            updatedAt: nowISO()
        });
        
        if (productsMap.has(productId)) {
            const product = productsMap.get(productId);
            productsMap.set(productId, { ...product, image: absoluteUrl });
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
            image: toAbsoluteImageUrl(product.image || ''),
            imageUrl: toAbsoluteImageUrl(product.image || '')
        };
    } catch (error) {
        console.error('❌ خطأ في جلب المنتج:', error);
        return null;
    }
}

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

export async function batchOperations(operations) {
    if (!operations || operations.length === 0) {
        console.warn('⚠️ لا توجد عمليات لتنفيذها');
        return;
    }
    
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

export async function getQuickStats() {
    try {
        const [productsSnap, ordersSnap, customersSnap] = await Promise.all([
            getDocs(collection(db, 'products')),
            getDocs(collection(db, 'orders')),
            getDocs(collection(db, 'customers'))
        ]);
        
        let totalRevenue = 0;
        let totalOrders = 0;
        ordersSnap.forEach(doc => {
            const data = doc.data();
            totalRevenue += data.total || 0;
            totalOrders++;
        });
        
        return {
            products: productsSnap.size,
            orders: totalOrders,
            customers: customersSnap.size,
            revenue: totalRevenue,
            averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0
        };
    } catch (error) {
        console.error('❌ خطأ في جلب الإحصائيات:', error);
        return null;
    }
}

export async function refreshCache() {
    console.log('🔄 تحديث الكاش...');
    await loadCustomersAndProducts(true);
    console.log('✅ تم تحديث الكاش بنجاح');
}

export async function searchProducts(searchTerm) {
    try {
        const products = await loadProducts();
        const term = searchTerm.toLowerCase();
        return products.filter(p => 
            p.name?.toLowerCase().includes(term) ||
            p.code?.toLowerCase().includes(term) ||
            p.barcode?.toLowerCase().includes(term)
        );
    } catch (error) {
        console.error('❌ خطأ في البحث عن المنتجات:', error);
        return [];
    }
}

export async function searchCustomers(searchTerm) {
    try {
        const customers = await loadCustomers();
        const term = searchTerm.toLowerCase();
        return customers.filter(c => 
            c.name?.toLowerCase().includes(term) ||
            c.phone?.includes(term) ||
            c.email?.toLowerCase().includes(term)
        );
    } catch (error) {
        console.error('❌ خطأ في البحث عن العملاء:', error);
        return [];
    }
}

// ================= تصدير كل شيء =================
export { db };
