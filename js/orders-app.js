// --- 5. وظائف إدارة الطلبات (تعديل وحذف) ---

// دالة جلب العملاء للقائمة المنسدلة
async function loadCustomerDropdown() {
    const customerSelect = document.getElementById('customerSelect');
    if (!customerSelect) return;
    
    try {
        // تأكد أن المسار المرتد ../../js/ صحيح بالنسبة لمكان تواجد هذا الملف
        const { fetchCustomersList } = await import('../../js/orders-firebase-db.js');
        const customers = await fetchCustomersList();
        
        customerSelect.innerHTML = '<option value="">-- اختر العميل --</option>';
        if (customers.length === 0) {
            customerSelect.innerHTML = '<option value="">لا يوجد عملاء مسجلين</option>';
            return;
        }

        customers.forEach(customer => {
            customerSelect.innerHTML += `<option value="${customer.id}">${customer.name || 'عميل غير مسمى'}</option>`;
        });
    } catch (error) {
        console.error("خطأ في جلب العملاء:", error);
        customerSelect.innerHTML = '<option value="">فشل تحميل العملاء</option>';
    }
}

// تعديل طلب موجود
window.editOrder = async (id) => {
    // ملاحظة: تأكد أن مصفوفة allOrders معرفة في النطاق العام لملف app.js
    const order = allOrders.find(o => o.id === id); 
    if (!order) return;

    currentOrderId = id;
    document.getElementById('modalTitle').innerText = "تعديل سجل الطلب #" + order.orderNumber;
    
    // تعبئة البيانات
    document.getElementById('orderNumber').value = order.orderNumber;
    document.getElementById('orderDate').value = order.date;
    if(document.getElementById('orderStatus')) document.getElementById('orderStatus').value = order.status;
    document.getElementById('customerSelect').value = order.customerId;
    document.getElementById('discountValue').value = order.discount || 0;
    
    // تحديث وسيلة الدفع
    selectedPaymentMethod = order.paymentMethod || 'mada';
    document.getElementById('paymentMethod').value = selectedPaymentMethod;
    document.querySelectorAll('.payment-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.payment === selectedPaymentMethod);
    });

    // استدعاء منطق الحسابات
    const logic = await import('../../js/orders-logic.js');
    logic.setCurrentItems([...order.products]);
    logic.renderProductList('productsContainer');
    
    // تحديث الأرقام النهائية في المودال
    if (window.updateTotalDisplay) window.updateTotalDisplay();
    
    openModal('orderModal');
};

// حذف طلب
window.deleteOrder = async (id) => {
    if (confirm('تنبيه: هل تريد حقاً حذف هذا السجل نهائياً؟')) {
        try {
            const { removeOrder } = await import('../../js/orders-firebase-db.js');
            await removeOrder(id);
            
            // إظهار التنبيه (Toast)
            if (typeof showToast === 'function') {
                showToast("تم مسح السجل بنجاح", "success");
            } else {
                alert("تم الحذف بنجاح");
            }
            
            await loadOrders(); // إعادة تحميل القائمة (تأكد من وجود هذه الدالة في app.js)
        } catch (error) {
            console.error(error);
            alert("فشل الحذف، تحقق من الاتصال");
        }
    }
};

// --- 6. أدوات مساعدة للجدول الفوري ---

window.updateProduct = async (index, field, value) => {
    const logic = await import('../../js/orders-logic.js');
    const items = logic.getCurrentItems();
    if (items[index]) {
        items[index][field] = field === 'name' ? value : parseFloat(value);
        logic.renderProductList('productsContainer');
    }
};

window.removeProductRow = async (index) => {
    const logic = await import('../../js/orders-logic.js');
    const items = logic.getCurrentItems();
    items.splice(index, 1);
    logic.renderProductList('productsContainer');
};
