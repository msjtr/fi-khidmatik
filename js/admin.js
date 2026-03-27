// js/admin.js
import { 
    db, collection, addDoc, doc, getDoc, getDocs, updateDoc, deleteDoc, 
    query, orderBy, where, limit 
} from './firebase.js';

// ============================================
// المتغيرات العامة
// ============================================
let currentEditingId = null;
let currentEditingType = null;

// ============================================
// دوال مساعدة
// ============================================
function showNotification(message, type = 'success') {
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.remove(), 3000);
}

function formatCurrency(amount) {
    return `${parseFloat(amount).toFixed(2)} ريال`;
}

function getStatusBadge(status) {
    const statusMap = {
        paid: { text: 'مدفوع', class: 'status-paid' },
        unpaid: { text: 'غير مدفوع', class: 'status-unpaid' },
        refunded: { text: 'مسترجع', class: 'status-refunded' },
        cancelled: { text: 'ملغي', class: 'status-cancelled' }
    };
    const s = statusMap[status] || { text: status, class: '' };
    return `<span class="status-badge ${s.class}">${s.text}</span>`;
}

// ============================================
// التنقل بين الأقسام
// ============================================
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
        document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
        item.classList.add('active');
        
        const section = item.dataset.section;
        document.querySelectorAll('.content-section').forEach(sec => sec.classList.remove('active'));
        document.getElementById(section).classList.add('active');
        
        const titles = {
            dashboard: 'الرئيسية',
            orders: 'إدارة الطلبات',
            customers: 'العملاء',
            products: 'المنتجات',
            inventory: 'إدارة المخزون',
            payments: 'طرق الدفع',
            'invoice-settings': 'إعدادات الفاتورة',
            'general-settings': 'الإعدادات العامة'
        };
        document.getElementById('pageTitle').textContent = titles[section] || section;
        
        // تحميل البيانات حسب القسم
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

// ============================================
// لوحة المعلومات (Dashboard)
// ============================================
async function loadDashboard() {
    try {
        const ordersRef = collection(db, 'orders');
        const ordersSnap = await getDocs(ordersRef);
        const orders = ordersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // إحصائيات
        document.getElementById('totalOrders').textContent = orders.length;
        document.getElementById('totalCustomers').textContent = [...new Set(orders.map(o => o.phone))].length;
        
        let totalStock = 0;
        const productsRef = collection(db, 'products');
        const productsSnap = await getDocs(productsRef);
        productsSnap.docs.forEach(doc => {
            totalStock += doc.data().quantity || 0;
        });
        document.getElementById('totalStock').textContent = totalStock;
        
        const totalRevenue = orders.reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);
        document.getElementById('totalRevenue').textContent = formatCurrency(totalRevenue);
        
        // أحدث الطلبات
        const recentOrders = orders.slice(0, 5);
        const tbody = document.getElementById('recentOrders');
        tbody.innerHTML = recentOrders.map(order => `
            <tr>
                <td>${order.orderNumber || order.id}</td>
                <td>${order.customer || '-'}</td>
                <td>${formatCurrency(order.total)}</td>
                <td>${getStatusBadge(order.status)}</td>
                <td>${new Date(order.createdAt).toLocaleDateString('ar-SA')}</td>
            </tr>
        `).join('');
        
    } catch (error) {
        console.error('خطأ في تحميل لوحة المعلومات:', error);
        showNotification('حدث خطأ في تحميل البيانات', 'error');
    }
}

// ============================================
// إدارة الطلبات
// ============================================
async function loadOrders() {
    try {
        const ordersRef = collection(db, 'orders');
        const q = query(ordersRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        const tbody = document.getElementById('ordersList');
        tbody.innerHTML = querySnapshot.docs.map(doc => {
            const order = doc.data();
            return `
                <tr>
                    <td>${order.orderNumber || doc.id.slice(0,8)}</td>
                    <td>${order.customer || '-'}</td>
                    <td>${order.phone || '-'}</td>
                    <td>${formatCurrency(order.total)}</td>
                    <td>${getStatusBadge(order.status)}</td>
                    <td>${order.payment || '-'}</td>
                    <td>${new Date(order.createdAt).toLocaleDateString('ar-SA')}</td>
                    <td class="action-buttons">
                        <button class="btn btn-primary btn-sm" onclick="editOrder('${doc.id}')">تعديل</button>
                        <button class="btn btn-danger btn-sm" onclick="deleteOrder('${doc.id}')">حذف</button>
                        ${order.status !== 'refunded' ? `<button class="btn btn-warning btn-sm" onclick="refundOrder('${doc.id}')">استرداد</button>` : ''}
                    </td>
                </tr>
            `;
        }).join('');
        
    } catch (error) {
        console.error('خطأ في تحميل الطلبات:', error);
        showNotification('حدث خطأ في تحميل الطلبات', 'error');
    }
}

window.editOrder = async function(orderId) {
    try {
        const docRef = doc(db, 'orders', orderId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            const order = docSnap.data();
            currentEditingId = orderId;
            currentEditingType = 'order';
            
            document.getElementById('orderNumber').value = order.orderNumber || '';
            document.getElementById('orderCustomer').value = order.customer || '';
            document.getElementById('orderPhone').value = order.phone || '';
            document.getElementById('orderTotal').value = order.total || '';
            document.getElementById('orderStatus').value = order.status || 'unpaid';
            document.getElementById('orderPayment').value = order.payment || '';
            
            openModal('orderModal');
        }
    } catch (error) {
        console.error('خطأ:', error);
        showNotification('حدث خطأ', 'error');
    }
};

window.saveOrder = async function() {
    try {
        const orderData = {
            orderNumber: document.getElementById('orderNumber').value,
            customer: document.getElementById('orderCustomer').value,
            phone: document.getElementById('orderPhone').value,
            total: parseFloat(document.getElementById('orderTotal').value) || 0,
            status: document.getElementById('orderStatus').value,
            payment: document.getElementById('orderPayment').value,
            updatedAt: new Date().toISOString()
        };
        
        if (currentEditingId && currentEditingType === 'order') {
            const docRef = doc(db, 'orders', currentEditingId);
            await updateDoc(docRef, orderData);
            showNotification('تم تحديث الطلب بنجاح');
        } else {
            orderData.createdAt = new Date().toISOString();
            orderData.orderNumber = orderData.orderNumber || `ORD-${Date
