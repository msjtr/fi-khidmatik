import { 
    db, collection, addDoc, doc, getDoc, getDocs, updateDoc, deleteDoc,
    query, orderBy, where, limit
} from './firebase.js';

export async function getCollection(collectionName) {
    const querySnapshot = await getDocs(collection(db, collectionName));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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

export async function getOrders() {
    const q = query(collection(db, 'orders'), orderBy('orderDate', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function updateOrderStatus(id, status) {
    await updateDocument('orders', id, { status });
}

export async function deleteOrder(id) {
    await deleteDocument('orders', id);
}

export async function getCustomers() {
    return await getCollection('customers');
}

export async function addCustomer(customerData) {
    return await addDocument('customers', customerData);
}

export async function updateCustomer(id, data) {
    await updateDocument('customers', id, data);
}

export async function deleteCustomer(id) {
    await deleteDocument('customers', id);
}

export async function getProducts() {
    return await getCollection('products');
}

export async function addProduct(productData) {
    // التأكد من وجود صورة افتراضية إذا كانت فارغة
    if (!productData.imageUrl || productData.imageUrl.trim() === '') {
        productData.imageUrl = '/images/default-product.png';
    }
    return await addDocument('products', productData);
}

export async function updateProduct(id, data) {
    if (data.imageUrl && data.imageUrl.trim() === '') {
        data.imageUrl = '/images/default-product.png';
    }
    await updateDocument('products', id, data);
}

export async function deleteProduct(id) {
    await deleteDocument('products', id);
}

export async function updateProductQuantity(id, quantity) {
    await updateDocument('products', id, { quantity });
}

export function importProductsFromExcel(file, callback) {
    const reader = new FileReader();
    reader.onload = async function(e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet);
        let count = 0;
        for (const row of rows) {
            const name = row.name || row['اسم المنتج'];
            const price = parseFloat(row.price || row['السعر']);
            const quantity = parseInt(row.quantity || row['الكمية'] || 0);
            let imageUrl = row.imageUrl || row['الصورة'] || '';
            if (imageUrl.trim() === '') imageUrl = '/images/default-product.png';
            if (name && !isNaN(price)) {
                await addProduct({ name, price, quantity, imageUrl });
                count++;
            }
        }
        callback({ success: true, count });
    };
    reader.readAsArrayBuffer(file);
}
