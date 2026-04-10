// js/order.js - نظام إدارة الطلبات المتكامل (لـ Firebase v8)
// يعتمد على تحميل firebase-app.js و firebase-firestore.js مسبقاً عبر script tags

// ================= المتغيرات العامة =================
let db = null;
let customersMap = new Map();
let productsMap = new Map();
let cacheLastUpdated = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 دقائق

// تهيئة قاعدة البيانات (يجب استدعاؤها بعد تحميل Firebase)
export function initFirebase() {
    if (typeof firebase !== 'undefined' && !firebase.apps.length) {
        const firebaseConfig = {
            apiKey: "AIzaSyBWYW6Qqlhh904pBeuJ29wY7Cyjm2uklBA",
            authDomain: "msjt301-974bb.firebaseapp.com",
            projectId: "msjt301-974bb",
            storageBucket: "msjt301-974bb.firebasestorage.app",
            messagingSenderId: "186209858482",
            appId: "1:186209858482:web:186ca610780799ef562aab"
        };
        firebase.initializeApp(firebaseConfig);
    }
    if (typeof firebase !== 'undefined') {
        db = firebase.firestore();
        console.log('✅ Firebase v8 initialized in order.js');
    } else {
        console.error('❌ Firebase SDK not loaded');
    }
    return db;
}

// دالة تحويل المسار النسبي إلى مطلق (آمنة)
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

// دوال مساعدة
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

// ================= جلب المستندات (لـ v8) =================
export async function getDocument(collectionName, docId) {
    if (!db) initFirebase();
    try {
        if (!docId) return null;
        const snap = await db.collection(collectionName).doc(docId).get();
        return snap.exists ? { id: snap.id, ...snap.data() } : null;
    } catch (error) {
        console.error(`❌ خطأ في المستند ${collectionName}/${docId}:`, error);
        return null;
    }
}

export async function getCollection(name, conditions = [], sortBy = null, limitCount = null) {
    if (!db) initFirebase();
    try {
        let query = db.collection(name);
        if (conditions.length > 0) {
            conditions.forEach(cond => {
                query = query.where(cond.field, cond.operator, cond.value);
            });
        }
        if (sortBy) {
            query = query.orderBy(sortBy.field, sortBy.direction || 'asc');
        }
        if (limitCount) {
            query = query.limit(limitCount);
        }
        const snap = await query.get();
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (error) {
        console.error(`❌ خطأ في جلب مجموعة ${name}:`, error);
        return [];
    }
}

// ================= تحميل الكاش =================
export async function loadCustomersAndProducts(forceReload = false) {
    if (!db) initFirebase();
    const now = Date.now();
    if (!forceReload && customersMap.size > 0 && productsMap.size > 0 && (now - cacheLastUpdated) < CACHE_DURATION) {
        console.log('✅ استخدام البيانات المخزنة مؤقتاً (صالحة)');
        return { customers: customersMap, products: productsMap };
    }

    customersMap.clear();
    productsMap.clear();

    try {
        const [customersSnap, productsSnap] = await Promise.all([
            db.collection('customers').get(),
            db.collection('products').get()
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
    if (!db) initFirebase();
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
    if (!db) initFirebase();
    try {
        console.log('🔄 جاري جلب جميع الطلبات مع الصور...');
        
        await loadCustomersAndProducts();
        
        const querySnapshot = await db.collection('orders')
            .orderBy('createdAt', 'desc')
            .limit(limitCount)
            .get();
        
        const orders = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
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

// ================= دوال إضافية مختصرة (يمكنك إكمال الباقي بنفس النمط) =================
export async function loadProducts() {
    if (!db) initFirebase();
    try {
        const snap = await db.collection('products').orderBy('createdAt', 'desc').get();
        return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error('❌ خطأ في تحميل المنتجات:', error);
        return [];
    }
}

export async function addOrder(data) {
    if (!db) initFirebase();
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
        
        const docRef = await db.collection('orders').add(orderData);
        console.log('✅ تم إضافة الطلب:', docRef.id);
        return { id: docRef.id, ...orderData };
    } catch (error) {
        console.error('❌ خطأ في إضافة الطلب:', error);
        throw error;
    }
}

// ... باقي الدوال (updateOrder, deleteOrder, إلخ) يمكن تحويلها بنفس الأسلوب

// تصدير الدوال التي يحتاجها باقي التطبيق
export { db, toAbsoluteImageUrl };
