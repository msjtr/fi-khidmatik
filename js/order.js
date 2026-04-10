// js/order.js - نظام إدارة الطلبات المتكامل (لـ Firebase v8)

// ================= المتغيرات العامة والإعدادات =================
let db = null;
let customersMap = new Map();
let productsMap = new Map();
let cacheLastUpdated = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 دقائق

// بيانات المصدر الثابتة (منصة في خدمتك) كما وردت في مستنداتك
export const SOURCE_INFO = {
    name: "منصة في خدمتك",
    country: "المملكة العربية السعودية",
    city: "حائل",
    district: "حي النقرة",
    street: "شارع سعد المشاط",
    building: "3085",
    postalCode: "55431",
    additionalNo: "7718",
    taxId: "312495447600003",
    license: "FL-765735204",
    linktree: "https://linktr.ee/fikhidmatik"
};

// تهيئة Firebase
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
        console.log('✅ Firebase v8 initialized');
    }
    return db;
}

// ================= وظائف الجلب والربط =================

// جلب بيانات العملاء والمنتجات لتسريع العمل (Caching)
async function loadCache(force = false) {
    const now = Date.now();
    if (!force && customersMap.size > 0 && (now - cacheLastUpdated) < CACHE_DURATION) return;

    const [cSnap, pSnap] = await Promise.all([
        db.collection('customers').get(),
        db.collection('products').get()
    ]);

    customersMap.clear();
    productsMap.clear();
    cSnap.forEach(d => customersMap.set(d.id, d.data()));
    pSnap.forEach(d => productsMap.set(d.id, d.data()));
    cacheLastUpdated = now;
}

/**
 * جلب الطلب كامل مع بيانات العميل والعنوان وبيانات المنتجات
 * @param {string} orderId - معرف الوثيقة في Firebase
 */
export async function getOrderFull(orderId) {
    if (!db) initFirebase();
    try {
        await loadCache();
        
        // 1. جلب بيانات الطلب الأساسية
        const orderSnap = await db.collection('orders').doc(orderId).get();
        if (!orderSnap.exists) return null;
        const order = orderSnap.data();

        // 2. ربط بيانات العميل (المستلم) والعنوان
        const customer = customersMap.get(order.customerId) || {
            name: "عميل غير مسجل",
            phone: "---",
            address: "---",
            city: "---",
            email: "---"
        };

        // 3. ربط بيانات المنتجات (الصور والأسماء الحقيقية)
        const items = (order.items || []).map(item => {
            const product = productsMap.get(item.productId) || {};
            return {
                ...item,
                productName: product.name || item.name || "منتج غير معروف",
                image: product.image || item.image || 'images/logo.svg', // مسار افتراضي في حال فقدان الصورة
                price: item.price || product.price || 0
            };
        });

        // 4. تجميع الكائن النهائي للفاتورة
        return {
            id: orderSnap.id,
            orderNumber: order.orderNumber || `KF-${orderSnap.id.substring(0,8).toUpperCase()}`,
            date: order.createdAt || new Date().toISOString(),
            status: order.status || "تم التنفيذ",
            paymentMethod: order.paymentMethod || "مدى",
            total: order.total || 0,
            
            // بيانات المصدر (من نحن)
            source: SOURCE_INFO,
            
            // بيانات العميل (إلى من)
            customer: {
                id: order.customerId,
                name: customer.name,
                phone: customer.phone,
                email: customer.email,
                address: customer.address,
                city: customer.city || "المملكة العربية السعودية",
                country: customer.country || "المملكة العربية السعودية"
            },
            
            // المنتجات
            items: items
        };

    } catch (error) {
        console.error("❌ Error fetching full order:", error);
        return null;
    }
}

// دالة مساعدة لحساب الضريبة والإجماليات برمجياً (إذا لم تكن مخزنة)
export function calculateInvoice(total) {
    const vatRate = 0.15;
    const subtotal = total / (1 + vatRate);
    const vatAmount = total - subtotal;
    return {
        subtotal: subtotal.toFixed(2),
        vat: vatAmount.toFixed(2),
        total: total.toFixed(2)
    };
}
