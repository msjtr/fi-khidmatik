// --- 5. وظائف إدارة الطلبات (تعديل وحذف) ---

// دالة جلب العملاء للقائمة المنسدلة
async function loadCustomerDropdown() {
    const customerSelect = document.getElementById('customerSelect');
    if (!customerSelect) return;
    
    try {
        // استخدام الدالة المصدرة من ملف Firebase DB بدلاً من استدعاء مباشر لزيادة التنظيم
        const { fetchCustomersList } = await import('../../js/orders-firebase-db.js');
        const customers = await fetchCustomersList();
        
        customerSelect.innerHTML = '<option value="">-- اختر العميل --</option>';
        customers.forEach(customer => {
            customerSelect.innerHTML += `<option value="${customer.id}">${customer.name || 'عميل غير مسمى'}</option>`;
        });
    } catch (error) {
        console.error("خطأ في جلب العملاء:", error);
    }
}

// تعديل طلب موجود
window.editOrder = async (id) => {
    // التأكد من وجود مصفوفة الطلبات محلياً
    const order = orders.find(o => o.id === id);
    if (!order) return;

    currentOrderId = id;
    document.getElementById('modalTitle').innerText = "تعديل سجل الطلب #" + order.orderNumber;
    
    // تعبئة البيانات الأساسية في النموذج
    document.getElementById('orderNumber').value = order.orderNumber;
    document.getElementById('orderDate').value = order.date;
    document.getElementById('orderStatus').value = order.status;
    document.getElementById('customerSelect').value = order.customerId;
    document.getElementById('discountValue').value = order.discount || 0;
    
    // تحديث الحالة البصرية لأزرار الدفع
    selectedPaymentMethod = order.paymentMethod || 'mada';
    document.querySelectorAll('.payment-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.payment === selectedPaymentMethod);
    });

    // تصحيح المسار: الانتقال لمجلد JS الرئيسي للوصول للمنطق
    import('../../js/orders-logic.js').then(logic => {
        logic.setCurrentItems([...order.products]);
        logic.renderProductList('productsContainer');
        // تحديث الإجماليات بعد التحميل
        if (window.updateTotalDisplay) window.updateTotalDisplay();
    });
    
    openModal('orderModal');
};

// حذف طلب من القاعدة
window.deleteOrder = async (id) => {
    if (confirm('تنبيه: هل تريد حقاً حذف هذا السجل نهائياً؟')) {
        try {
            // استدعاء دالة الحذف من ملف الـ DB المخصص
            const { removeOrder } = await import('../../js/orders-firebase-db.js');
            await removeOrder(id);
            
            showToast("تم مسح السجل بنجاح", "success");
            await loadOrders(); // إعادة تنشيط القائمة في الواجهة
        } catch (error) {
            console.error(error);
            showToast("فشل الحذف، تحقق من الاتصال", "error");
        }
    }
};

// --- 6. أدوات مساعدة (Helpers) لعمليات الجدول الفورية ---

window.updateProduct = (index, field, value) => {
    import('../../js/orders-logic.js').then(logic => {
        const items = logic.getCurrentItems();
        if (items[index]) {
            // تحديث الحقل المطلوب (الاسم نص، والسعر/الكمية أرقام)
            items[index][field] = field === 'name' ? value : parseFloat(value);
            logic.renderProductList('productsContainer');
        }
    });
};

window.removeProductRow = (index) => {
    import('../../js/orders-logic.js').then(logic => {
        const items = logic.getCurrentItems();
        items.splice(index, 1); // إزالة العنصر من المصفوفة
        logic.renderProductList('productsContainer');
    });
};
