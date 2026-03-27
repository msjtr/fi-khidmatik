// js/admin.js
import { db, collection, addDoc, doc, getDoc, getDocs, updateDoc, deleteDoc, query, orderBy, where } from './firebase.js';

// ==============================
// إشعارات
// ==============================
function showNotification(message, type = 'success') {
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    const notif = document.createElement('div');
    notif.className = `notification ${type}`;
    notif.textContent = message;
    document.body.appendChild(notif);
    setTimeout(() => notif.remove(), 3000);
}

// ==============================
// دوال مساعدة
// ==============================
function formatCurrency(amount) {
    return `${parseFloat(amount).toFixed(2)} ريال`;
}

function getStatusBadge(status) {
    const map = {
        paid: { text: 'مدفوع', class: 'status-paid' },
        unpaid: { text: 'غير مدفوع', class: 'status-unpaid' },
        refunded: { text: 'مسترجع', class: 'status-refunded' },
        cancelled: { text: 'ملغي', class: 'status-cancelled' }
    };
    const s = map[status] || { text: status, class: '' };
    return `<span class="status-badge ${s.class}">${s.text}</span>`;
}

// ==============================
// التنقل بين الأقسام
// ==============================
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
        document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
        item.classList.add('active');
        const section = item.dataset.section;
        document.querySelectorAll('.content-section').forEach(sec => sec.classList.remove('active'));
        document.getElementById(section).classList.add('active');
        const titles = {
            dashboard: 'الرئيسية',
            orders: 'الطلبات',
            customers: 'العملاء',
            products: 'المنتجات',
            inventory: 'المخزون',
            payments: 'طرق الدفع',
            'invoice-settings': 'إعدادات الفاتورة',
            'general-settings': 'الإعدادات العامة'
        };
        document.getElementById('pageTitle').textContent = titles[section];
        loadSectionData(section);
    });
});

function loadSectionData(section) {
    switch(section) {
        case 'dashboard': loadDashboard(); break;
        case 'orders': loadOrders(); break;
        case 'customers': loadCustomers(); break;
        case 'products': loadProducts(); break;
        case 'inventory': loadInventory(); break;
        case 'payments': loadPayments(); break;
        case 'invoice-settings': loadInvoiceSettings(); break;
        case 'general-settings': loadGeneralSettings(); break;
    }
}

// ==============================
// لوحة المعلومات
// ==============================
async function loadDashboard() {
    try {
        const ordersSnap = await getDocs(collection(db, 'orders'));
        const orders = ordersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        document.getElementById('totalOrders').textContent = orders.length;
        const uniqueCustomers = new Set(orders.map(o => o.phone));
        document.getElementById('totalCustomers').textContent = uniqueCustomers.size;
        let totalStock = 0;
        const productsSnap = await getDocs(collection(db, 'products'));
        productsSnap.docs.forEach(d => { totalStock += d.data().quantity || 0; });
        document.getElementById('totalStock').textContent = totalStock;
        const totalRevenue = orders.reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);
        document.getElementById('totalRevenue').textContent = formatCurrency(totalRevenue);
        const recent = orders.slice(0, 5);
        const tbody = document.getElementById('recentOrders');
        tbody.innerHTML = recent.map(o => `
            <tr><td>${o.orderNumber || o.id.slice(0,8)}</td><td>${o.customer || '-'}</td><td>${formatCurrency(o.total)}</td><td>${getStatusBadge(o.status)}</td><td>${new Date(o.createdAt).toLocaleDateString('ar-SA')}</td></tr>
        `).join('');
    } catch (err) { console.error(err); showNotification('خطأ في تحميل البيانات', 'error'); }
}

// ==============================
// الطلبات
// ==============================
let currentOrderId = null;
async function loadOrders() {
    try {
        const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        const tbody = document.getElementById('ordersList');
        tbody.innerHTML = snap.docs.map(doc => {
            const o = doc.data();
            return `
                <tr>
                    <td>${o.orderNumber || doc.id.slice(0,8)}</td>
                    <td>${o.customer || '-'}</td>
                    <td>${o.phone || '-'}</td>
                    <td>${formatCurrency(o.total)}</td>
                    <td>${getStatusBadge(o.status)}</td>
                    <td>${o.payment || '-'}</td>
                    <td>${new Date(o.createdAt).toLocaleDateString('ar-SA')}</td>
                    <td class="action-buttons">
                        <button class="btn btn-primary btn-sm" onclick="editOrder('${doc.id}')">تعديل</button>
                        <button class="btn btn-danger btn-sm" onclick="deleteOrder('${doc.id}')">حذف</button>
                        ${o.status !== 'refunded' ? `<button class="btn btn-warning btn-sm" onclick="refundOrder('${doc.id}')">استرداد</button>` : ''}
                    </td>
                </tr>
            `;
        }).join('');
    } catch (err) { console.error(err); showNotification('خطأ في تحميل الطلبات', 'error'); }
}

window.editOrder = async (id) => {
    currentOrderId = id;
    const docRef = doc(db, 'orders', id);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
        const o = snap.data();
        document.getElementById('orderNumber').value = o.orderNumber || '';
        document.getElementById('orderCustomer').value = o.customer || '';
        document.getElementById('orderPhone').value = o.phone || '';
        document.getElementById('orderTotal').value = o.total || '';
        document.getElementById('orderStatus').value = o.status || 'unpaid';
        document.getElementById('orderPayment').value = o.payment || '';
        openModal('orderModal');
    }
};

window.saveOrder = async () => {
    const data = {
        orderNumber: document.getElementById('orderNumber').value,
        customer: document.getElementById('orderCustomer').value,
        phone: document.getElementById('orderPhone').value,
        total: parseFloat(document.getElementById('orderTotal').value) || 0,
        status: document.getElementById('orderStatus').value,
        payment: document.getElementById('orderPayment').value,
        updatedAt: new Date().toISOString()
    };
    if (currentOrderId) {
        await updateDoc(doc(db, 'orders', currentOrderId), data);
        showNotification('تم تحديث الطلب');
    } else {
        data.createdAt = new Date().toISOString();
        await addDoc(collection(db, 'orders'), data);
        showNotification('تم إضافة الطلب');
    }
    closeModal('orderModal');
    loadOrders();
    loadDashboard();
};

window.deleteOrder = async (id) => {
    if (confirm('هل أنت متأكد من حذف هذا الطلب؟')) {
        await deleteDoc(doc(db, 'orders', id));
        showNotification('تم حذف الطلب');
        loadOrders();
        loadDashboard();
    }
};

window.refundOrder = async (id) => {
    if (confirm('هل تريد استرداد هذا الطلب؟')) {
        await updateDoc(doc(db, 'orders', id), { status: 'refunded', updatedAt: new Date().toISOString() });
        showNotification('تم استرداد الطلب');
        loadOrders();
        loadDashboard();
    }
};

// ==============================
// العملاء
// ==============================
let currentCustomerId = null;
async function loadCustomers() {
    try {
        const ordersSnap = await getDocs(collection(db, 'orders'));
        const orders = ordersSnap.docs.map(d => d.data());
        const customerMap = new Map();
        orders.forEach(o => {
            const phone = o.phone;
            if (phone) {
                if (!customerMap.has(phone)) {
                    customerMap.set(phone, { name: o.customer, email: o.email, phone, totalSpent: 0, orderCount: 0 });
                }
                const cust = customerMap.get(phone);
                cust.totalSpent += parseFloat(o.total) || 0;
                cust.orderCount++;
            }
        });
        const customers = Array.from(customerMap.values());
        const tbody = document.getElementById('customersList');
        tbody.innerHTML = customers.map(c => `
            <tr>
                <td>${c.name || '-'}</td>
                <td>${c.email || '-'}</td>
                <td>${c.phone}</td>
                <td>${formatCurrency(c.totalSpent)}</td>
                <td>${c.orderCount}</td>
                <td class="action-buttons">
                    <button class="btn btn-primary btn-sm" onclick="editCustomer('${c.phone}')">تعديل</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteCustomer('${c.phone}')">حذف</button>
                </td>
            </tr>
        `).join('');
    } catch (err) { console.error(err); showNotification('خطأ في تحميل العملاء', 'error'); }
}

window.editCustomer = (phone) => {
    // نستخدم phone كمفتاح مؤقت، لكن لا يوجد تعديل مباشر للعملاء في Firebase
    // يمكن إضافة collection customers لاحقاً. حالياً سنعرض رسالة
    showNotification('يمكن تعديل العميل من خلال تعديل الطلبات', 'info');
};

window.deleteCustomer = (phone) => {
    if (confirm(`حذف جميع طلبات العميل ${phone}؟`)) {
        // حذف الطلبات المرتبطة بهذا الهاتف
        // تنفيذ لاحقاً
        showNotification('حذف العميل يتطلب حذف طلباته أولاً', 'info');
    }
};

window.openCustomerModal = () => {
    document.getElementById('customerName').value = '';
    document.getElementById('customerEmail').value = '';
    document.getElementById('customerPhone').value = '';
    currentCustomerId = null;
    openModal('customerModal');
};

window.saveCustomer = async () => {
    const name = document.getElementById('customerName').value;
    const email = document.getElementById('customerEmail').value;
    const phone = document.getElementById('customerPhone').value;
    if (!name || !phone) { showNotification('الاسم والهاتف مطلوبان', 'error'); return; }
    // نضيف عميلاً جديداً عن طريق إضافة طلب فارغ؟ الأفضل إنشاء collection منفصل
    showNotification('سيتم إضافة العميل عند إنشاء طلب جديد', 'info');
    closeModal('customerModal');
};

// ==============================
// المنتجات
// ==============================
let currentProductId = null;
async function loadProducts() {
    try {
        const snap = await getDocs(collection(db, 'products'));
        const tbody = document.getElementById('productsList');
        tbody.innerHTML = snap.docs.map(doc => {
            const p = doc.data();
            return `
                <tr>
                    <td><img src="${p.image || ''}" class="product-image" onerror="this.src='https://via.placeholder.com/50'"></td>
                    <td>${p.code || '-'}</td>
                    <td>${p.name}</td>
                    <td>${formatCurrency(p.price)}</td>
                    <td>${p.quantity || 0}</td>
                    <td class="action-buttons">
                        <button class="btn btn-primary btn-sm" onclick="editProduct('${doc.id}')">تعديل</button>
                        <button class="btn btn-danger btn-sm" onclick="deleteProduct('${doc.id}')">حذف</button>
                    </td>
                </tr>
            `;
        }).join('');
    } catch (err) { console.error(err); showNotification('خطأ في تحميل المنتجات', 'error'); }
}

window.editProduct = async (id) => {
    currentProductId = id;
    const snap = await getDoc(doc(db, 'products', id));
    if (snap.exists()) {
        const p = snap.data();
        document.getElementById('productCode').value = p.code || '';
        document.getElementById('productName').value = p.name || '';
        document.getElementById('productPrice').value = p.price || '';
        document.getElementById('productQuantity').value = p.quantity || '';
        document.getElementById('productImage').value = p.image || '';
        openModal('productModal');
    }
};

window.saveProduct = async () => {
    const data = {
        code: document.getElementById('productCode').value,
        name: document.getElementById('productName').value,
        price: parseFloat(document.getElementById('productPrice').value) || 0,
        quantity: parseInt(document.getElementById('productQuantity').value) || 0,
        image: document.getElementById('productImage').value
    };
    if (currentProductId) {
        await updateDoc(doc(db, 'products', currentProductId), data);
        showNotification('تم تحديث المنتج');
    } else {
        await addDoc(collection(db, 'products'), data);
        showNotification('تم إضافة المنتج');
    }
    closeModal('productModal');
    loadProducts();
    loadDashboard();
};

window.deleteProduct = async (id) => {
    if (confirm('حذف المنتج سيؤثر على الطلبات القديمة. هل أنت متأكد؟')) {
        await deleteDoc(doc(db, 'products', id));
        showNotification('تم حذف المنتج');
        loadProducts();
        loadDashboard();
    }
};

// ==============================
// المخزون
// ==============================
async function loadInventory() {
    try {
        const snap = await getDocs(collection(db, 'products'));
        const tbody = document.getElementById('inventoryList');
        tbody.innerHTML = snap.docs.map(doc => {
            const p = doc.data();
            const lowStock = (p.quantity || 0) < 10;
            return `
                <tr class="${lowStock ? 'low-stock' : ''}">
                    <td><img src="${p.image || ''}" class="product-image" onerror="this.src='https://via.placeholder.com/50'"></td>
                    <td>${p.name}</td>
                    <td>${formatCurrency(p.price)}</td>
                    <td>${p.quantity || 0}</td>
                    <td>10</td>
                    <td>${lowStock ? '<span class="status-badge status-refunded">منخفض</span>' : '<span class="status-badge status-paid">كافٍ</span>'}</td>
                    <td><button class="btn btn-primary btn-sm" onclick="openInventoryModal('${doc.id}', '${p.name}')">تحديث</button></td>
                </tr>
            `;
        }).join('');
    } catch (err) { console.error(err); showNotification('خطأ في تحميل المخزون', 'error'); }
}

window.openInventoryModal = (id, name) => {
    currentProductId = id;
    document.getElementById('inventoryProductName').value = name;
    document.getElementById('inventoryNewQuantity').value = '';
    openModal('inventoryModal');
};

window.updateInventoryQuantity = async () => {
    const newQty = parseInt(document.getElementById('inventoryNewQuantity').value);
    if (isNaN(newQty)) { showNotification('أدخل كمية صحيحة', 'error'); return; }
    await updateDoc(doc(db, 'products', currentProductId), { quantity: newQty });
    showNotification('تم تحديث الكمية');
    closeModal('inventoryModal');
    loadInventory();
    loadProducts();
    loadDashboard();
};

// ==============================
// طرق الدفع (تخزين محلي)
// ==============================
let paymentMethods = JSON.parse(localStorage.getItem('paymentMethods')) || ['مدى', 'فيزا', 'ماستركارد', 'تمارا', 'تابي', 'نقدي'];

function savePaymentMethods() {
    localStorage.setItem('paymentMethods', JSON.stringify(paymentMethods));
    loadPayments();
}

async function loadPayments() {
    const tbody = document.getElementById('paymentsList');
    tbody.innerHTML = paymentMethods.map(m => `
        <tr>
            <td>${m}</td>
            <td><span class="status-badge status-paid">نشط</span></td>
            <td><button class="btn btn-danger btn-sm" onclick="removePaymentMethod('${m}')">حذف</button></td>
        </tr>
    `).join('');
}

window.openPaymentModal = () => {
    document.getElementById('paymentMethodName').value = '';
    openModal('paymentModal');
};

window.addPaymentMethod = () => {
    const name = document.getElementById('paymentMethodName').value.trim();
    if (!name) { showNotification('أدخل اسم طريقة الدفع', 'error'); return; }
    if (!paymentMethods.includes(name)) {
        paymentMethods.push(name);
        savePaymentMethods();
        showNotification('تمت الإضافة');
    } else {
        showNotification('الطريقة موجودة مسبقاً', 'error');
    }
    closeModal('paymentModal');
};

window.removePaymentMethod = (method) => {
    if (confirm(`حذف طريقة الدفع "${method}"؟`)) {
        paymentMethods = paymentMethods.filter(m => m !== method);
        savePaymentMethods();
        showNotification('تم الحذف');
    }
};

// ==============================
// إعدادات الفاتورة (تخزين محلي)
// ==============================
function loadInvoiceSettings() {
    document.getElementById('invoiceInstruction').value = localStorage.getItem('invoiceInstruction') || '';
    document.getElementById('platformStamp').value = localStorage.getItem('platformStamp') || '';
}

window.saveInvoiceSettings = () => {
    localStorage.setItem('invoiceInstruction', document.getElementById('invoiceInstruction').value);
    localStorage.setItem('platformStamp', document.getElementById('platformStamp').value);
    showNotification('تم حفظ إعدادات الفاتورة');
};

// ==============================
// الإعدادات العامة (تخزين محلي)
// ==============================
function loadGeneralSettings() {
    document.getElementById('storeName').value = localStorage.getItem('storeName') || '';
    document.getElementById('supportEmail').value = localStorage.getItem('supportEmail') || '';
    document.getElementById('supportPhone').value = localStorage.getItem('supportPhone') || '';
    document.getElementById('storeAddress').value = localStorage.getItem('storeAddress') || '';
    document.getElementById('taxNumber').value = localStorage.getItem('taxNumber') || '';
}

window.saveGeneralSettings = () => {
    localStorage.setItem('storeName', document.getElementById('storeName').value);
    localStorage.setItem('supportEmail', document.getElementById('supportEmail').value);
    localStorage.setItem('supportPhone', document.getElementById('supportPhone').value);
    localStorage.setItem('storeAddress', document.getElementById('storeAddress').value);
    localStorage.setItem('taxNumber', document.getElementById('taxNumber').value);
    showNotification('تم حفظ الإعدادات العامة');
};

// ==============================
// رفع Excel
// ==============================
window.openExcelModal = () => {
    document.getElementById('excelFile').value = '';
    openModal('excelModal');
};

window.uploadExcel = () => {
    const file = document.getElementById('excelFile').files[0];
    if (!file) { showNotification('اختر ملف Excel أولاً', 'error'); return; }
    const reader = new FileReader();
    reader.onload = function(e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet);
        let added = 0;
        rows.forEach(async row => {
            const code = row['الكود'] || row['code'] || '';
            const name = row['اسم المنتج'] || row['name'] || '';
            const price = parseFloat(row['السعر'] || row['price'] || 0);
            const quantity = parseInt(row['الكمية'] || row['quantity'] || 0);
            const image = row['رابط الصورة'] || row['image'] || '';
            if (name && price) {
                await addDoc(collection(db, 'products'), { code, name, price, quantity, image });
                added++;
            }
        });
        showNotification(`تم إضافة ${added} منتج`);
        closeModal('excelModal');
        loadProducts();
        loadInventory();
        loadDashboard();
    };
    reader.readAsArrayBuffer(file);
};

// ==============================
// دوال النوافذ المنبثقة
// ==============================
function openModal(id) {
    document.getElementById(id).classList.add('active');
}
window.closeModal = (id) => {
    document.getElementById(id).classList.remove('active');
    currentOrderId = null;
    currentProductId = null;
    currentCustomerId = null;
};

// تحميل البيانات الابتدائية
window.onload = () => {
    loadDashboard();
    loadOrders();
    loadCustomers();
    loadProducts();
    loadInventory();
    loadPayments();
    loadInvoiceSettings();
    loadGeneralSettings();
};

// ربط الدوال للنطاق العام
window.openOrderModal = () => {
    document.getElementById('orderNumber').value = '';
    document.getElementById('orderCustomer').value = '';
    document.getElementById('orderPhone').value = '';
    document.getElementById('orderTotal').value = '';
    document.getElementById('orderStatus').value = 'unpaid';
    document.getElementById('orderPayment').value = '';
    currentOrderId = null;
    openModal('orderModal');
};
window.openProductModal = () => {
    document.getElementById('productCode').value = '';
    document.getElementById('productName').value = '';
    document.getElementById('productPrice').value = '';
    document.getElementById('productQuantity').value = '';
    document.getElementById('productImage').value = '';
    currentProductId = null;
    openModal('productModal');
};
