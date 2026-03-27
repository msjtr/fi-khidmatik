// دوال مساعدة للتفاعل مع Firestore
async function getCollection(collectionName) {
    const snapshot = await db.collection(collectionName).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function addDocument(collectionName, data) {
    return await db.collection(collectionName).add(data);
}

async function updateDocument(collectionName, id, data) {
    await db.collection(collectionName).doc(id).update(data);
}

async function deleteDocument(collectionName, id) {
    await db.collection(collectionName).doc(id).delete();
}

// دوال خاصة بالمنتجات (رفع Excel)
function importProductsFromExcel(file, callback) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet);
        // افتراض أن الأعمدة: name, price, quantity
        rows.forEach(row => {
            const product = {
                name: row.name,
                price: parseFloat(row.price),
                quantity: parseInt(row.quantity) || 0,
                imageUrl: row.imageUrl || ''
            };
            addDocument('products', product);
        });
        callback(true);
    };
    reader.readAsArrayBuffer(file);
}
