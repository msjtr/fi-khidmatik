// js/common.js
import { db, collection, addDoc, doc, getDoc, getDocs, updateDoc, deleteDoc, setDoc, query, orderBy, where } from './firebase.js';

// ===================== دوال عامة =====================
export async function getCollection(collectionName) {
    const snapshot = await getDocs(collection(db, collectionName));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function addDocument(collectionName, data) {
    return await addDoc(collection(db, collectionName), data);
}

export async function updateDocument(collectionName, id, data) {
    const docRef = doc(db, collectionName, id);
    await updateDoc(docRef, data);
}

export async function deleteDocument(collectionName, id) {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
}

export async function getDocument(collectionName, id) {
    const docRef = doc(db, collectionName, id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
}

export async function setDocument(collectionName, id, data) {
    const docRef = doc(db, collectionName, id);
    await setDoc(docRef, data, { merge: true });
}

// ===================== دوال المنتجات =====================
export async function loadProducts() {
    return await getCollection('products');
}

export async function addProduct(data) {
    if (!data.imageUrl || data.imageUrl.trim() === '') data.imageUrl = '/images/default-product.png';
    return await addDocument('products', data);
}

export async function updateProduct(id, data) {
    if (data.imageUrl && data.imageUrl.trim() === '') data.imageUrl = '/images/default-product.png';
    await updateDocument('products', id, data);
}

export async function deleteProduct(id) {
    await deleteDocument('products', id);
}

export async function updateProductQuantity(id, quantity) {
    await updateDocument('products', id, { quantity });
}

// ===================== دوال العملاء =====================
export async function loadCustomers() {
    return await getCollection('customers');
}

export async function addCustomer(data) {
    return await addDocument('customers', data);
}

export async function updateCustomer(id, data) {
    await updateDocument('customers', id, data);
}

export async function deleteCustomer(id) {
    await deleteDocument('customers', id);
}

// ===================== دوال الطلبات =====================
export async function loadOrders() {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function addOrder(data) {
    const newOrder = {
        orderNumber: data.orderNumber || `ORD-${Date.now()}`,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        customerEmail: data.customerEmail || '',
        nationalAddress: data.nationalAddress || '',
        shippingAddress: data.shippingAddress || '',
        paymentMethod: data.paymentMethod,
        paymentApproved: data.paymentApproved || false,
        status: data.status || 'غير مدفوع',
        date: data.date || new Date().toISOString().slice(0,10),
        createdAt: new Date(),
        items: data.items || [],
        totalAmount: data.totalAmount
    };
    return await addDocument('orders', newOrder);
}

export async function updateOrder(id, data) {
    await updateDocument('orders', id, data);
}

export async function deleteOrder(id) {
    await deleteDocument('orders', id);
}

// ===================== دوال الإعدادات =====================
export async function getSettings(docId) {
    const docRef = doc(db, 'settings', docId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() : null;
}

export async function setSettings(docId, data) {
    const docRef = doc(db, 'settings', docId);
    await setDoc(docRef, data, { merge: true });
}

// ===================== استيراد Excel =====================
export async function importProductsFromExcel(file, callback) {
    const XLSX = window.XLSX;
    const reader = new FileReader();
    reader.onload = async function(e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        if (!rows || rows.length < 2) {
            callback({ success: false, error: 'الملف فارغ أو لا يحتوي على بيانات' });
            return;
        }
        const headers = rows[0];
        const colIndex = {
            name: headers.findIndex(h => h.includes('اسم المنتج')),
            code: headers.findIndex(h => h.includes('كود المنتج')),
            barcode: headers.findIndex(h => h.includes('باركود')),
            description: headers.findIndex(h => h.includes('وصف')),
            quantity: headers.findIndex(h => h.includes('الكمية')),
            cost: headers.findIndex(h => h.includes('سعر التكلفة')),
            price: headers.findIndex(h => h.includes('سعر البيع')),
            discountPrice: headers.findIndex(h => h.includes('سعر التخفيض')),
            mainImage: headers.findIndex(h => h.includes('الصورة الرئيسية')),
            image2: headers.findIndex(h => h.includes('صورة 2')),
            image3: headers.findIndex(h => h.includes('صورة 3')),
            image4: headers.findIndex(h => h.includes('صورة 4')),
            image5: headers.findIndex(h => h.includes('صورة 5'))
        };
        let count = 0;
        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            if (!row || row.length === 0) continue;
            const name = colIndex.name !== -1 ? row[colIndex.name] : null;
            if (!name) continue;
            const product = {
                name: name.toString().trim(),
                code: colIndex.code !== -1 ? (row[colIndex.code] || '').toString().trim() : '',
                barcode: colIndex.barcode !== -1 ? (row[colIndex.barcode] || '').toString().trim() : '',
                description: colIndex.description !== -1 ? (row[colIndex.description] || '').toString().trim() : '',
                quantity: colIndex.quantity !== -1 ? parseFloat(row[colIndex.quantity]) || 0 : 0,
                costPrice: colIndex.cost !== -1 ? parseFloat(row[colIndex.cost]) || 0 : 0,
                price: colIndex.price !== -1 ? parseFloat(row[colIndex.price]) || 0 : 0,
                discountPrice: colIndex.discountPrice !== -1 ? parseFloat(row[colIndex.discountPrice]) || 0 : 0,
                images: []
            };
            if (colIndex.mainImage !== -1 && row[colIndex.mainImage]) product.images.push(row[colIndex.mainImage].toString().trim());
            if (colIndex.image2 !== -1 && row[colIndex.image2]) product.images.push(row[colIndex.image2].toString().trim());
            if (colIndex.image3 !== -1 && row[colIndex.image3]) product.images.push(row[colIndex.image3].toString().trim());
            if (colIndex.image4 !== -1 && row[colIndex.image4]) product.images.push(row[colIndex.image4].toString().trim());
            if (colIndex.image5 !== -1 && row[colIndex.image5]) product.images.push(row[colIndex.image5].toString().trim());
            product.imageUrl = product.images.length > 0 ? product.images[0] : '/images/default-product.png';
            await addProduct(product);
            count++;
        }
        callback({ success: true, count });
    };
    reader.readAsArrayBuffer(file);
}
