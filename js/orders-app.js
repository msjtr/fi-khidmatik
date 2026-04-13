// --- 5. وظائف إدارة الطلبات (تعديل وحذف) ---

// دالة جلب العملاء للقائمة المنسدلة (إضافة إذا لم تكن موجودة)
async function loadCustomerDropdown() {
    const customerSelect = document.getElementById('customerSelect');
    if (!customerSelect) return;
    
    try {
        const snapshot = await getDocs(collection(db, "customers"));
        customerSelect.innerHTML = '<option value="">اختر عميل...</option>';
        snapshot.forEach(doc => {
            const data = doc.data();
            customerSelect.innerHTML += `<option value="${doc.id}">${data.name || 'بدون اسم'}</option>`;
        });
    } catch (error) {
        console.error("خطأ في جلب العملاء:", error);
    }
}

// تعديل طلب موجود
window.editOrder = async (id) => {
    const order = orders.find(o => o.id === id);
    if (!order) return;

    currentOrderId = id;
    document.getElementById('modalTitle').innerText = "تعديل الطلب #" + order.orderNumber;
    
    // تعبئة البيانات
    document.getElementById('orderNumber').value = order.orderNumber;
    document.getElementById('orderDate').value = order.date;
    document.getElementById('orderStatus').value = order.status;
    document.getElementById('customerSelect').value = order.customerId;
    
    // تعبئة المنتجات
    orderProducts = [...order.products];
    renderProductRows();
    
    openModal('orderModal');
};

// حذف طلب
window.deleteOrder = async (id) => {
    if (confirm('هل أنت متأكد من حذف هذا الطلب؟')) {
        try {
            await deleteDoc(doc(db, "orders", id));
            showToast("تم حذف الطلب");
            loadOrders();
        } catch (error) {
            showToast("خطأ في الحذف", "error");
        }
    }
};

// --- 6. أدوات مساعدة (Helpers) ---

window.updateProduct = (index, field, value) => {
    orderProducts[index][field] = field === 'name' ? value : parseFloat(value);
    updateTotals();
};

window.removeProductRow = (index) => {
    orderProducts.splice(index, 1);
    renderProductRows();
};

// استكمال باقي الدوال (generateOrderNumber, openModal, closeModal, etc.) كما هي في كودك الأصلي...
