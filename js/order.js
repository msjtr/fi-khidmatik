// ========== حفظ الطلب (محسّن مع معالجة الأخطاء) ==========
async function saveOrder(e) {
    e.preventDefault();
    
    try {
        const customerId = document.getElementById('customerSelect')?.value;
        if (!customerId) { showToast('اختر عميل', 'error'); return; }
        
        let orderNumber = document.getElementById('orderNumber')?.value.trim();
        if (!orderNumber) { showToast('أدخل رقم الطلب', 'error'); return; }
        if (!orderNumber.startsWith('KF-')) orderNumber = `KF-${orderNumber}`;
        
        const orderDate = document.getElementById('orderDate')?.value;
        const orderTime = get24HourTime();
        const status = document.getElementById('orderStatus')?.value;
        const shippingMethod = document.querySelector('input[name="shippingMethod"]:checked')?.value;
        
        let shippingAddress = null, extraEmail = null;
        if (shippingMethod === 'delivery') {
            shippingAddress = {
                city: document.getElementById('deliveryCity')?.value || '',
                street: document.getElementById('deliveryStreet')?.value || '',
                additionalNo: document.getElementById('deliveryAdditionalNo')?.value || '',
                poBox: document.getElementById('deliveryPoBox')?.value || '',
                phone: document.getElementById('deliveryPhone')?.value || ''
            };
        } else if (shippingMethod === 'noship') {
            extraEmail = document.getElementById('extraEmail')?.value.trim() || null;
        }
        
        let approvalCode = null, otherText = null;
        if (selectedPaymentMethod === 'tamara' || selectedPaymentMethod === 'tabby') {
            approvalCode = document.getElementById('approvalCode')?.value.trim();
            if (!approvalCode) { showToast('أدخل رمز الموافقة', 'error'); return; }
        }
        if (selectedPaymentMethod === 'other') {
            otherText = document.getElementById('otherPaymentText')?.value.trim();
            if (!otherText) { showToast('أدخل طريقة الدفع', 'error'); return; }
        }
        
        const items = [];
        const rows = document.querySelectorAll('.product-row');
        
        for (let r of rows) {
            const name = r.querySelector('.product-name')?.value.trim();
            const price = parseFloat(r.querySelector('.product-price')?.value);
            const qty = parseInt(r.querySelector('.product-quantity')?.value);
            
            if (!name) {
                showToast('اسم المنتج مطلوب', 'error');
                return;
            }
            if (isNaN(price) || price <= 0) {
                showToast(`سعر المنتج "${name}" غير صحيح`, 'error');
                return;
            }
            if (isNaN(qty) || qty <= 0) {
                showToast(`كمية المنتج "${name}" غير صحيحة`, 'error');
                return;
            }
            
            const productId = r.querySelector('.product-id')?.value;
            
            items.push({
                productId: (productId && productId !== 'null' && productId !== 'undefined') ? productId : null,
                name: name,
                price: price,
                quantity: qty,
                barcode: r.querySelector('.product-barcode')?.value || '',
                image: r.querySelector('.product-image')?.value || '',
                description: r.querySelector('.product-desc')?.value || r.querySelector('.product-desc-hidden')?.value || ''
            });
        }
        
        if (items.length === 0) { 
            showToast('أضف منتجاً واحداً على الأقل', 'error'); 
            return; 
        }
        
        const { subtotal, discount, tax, total } = calculateTotals();
        const discountValue = parseFloat(document.getElementById('discountValue')?.value) || 0;
        const discountType = document.getElementById('discountType')?.value;
        
        let paymentMethodName = '';
        switch(selectedPaymentMethod) {
            case 'mada': paymentMethodName = 'مدى'; break;
            case 'mastercard': paymentMethodName = 'ماستركارد'; break;
            case 'visa': paymentMethodName = 'فيزا'; break;
            case 'stcpay': paymentMethodName = 'STCPay'; break;
            case 'tamara': paymentMethodName = 'تمارا'; break;
            case 'tabby': paymentMethodName = 'تابي'; break;
            case 'other': paymentMethodName = otherText || 'أخرى'; break;
            default: paymentMethodName = 'مدى';
        }
        
        // ========== إصلاح المشكلة: التحقق من وجود currentOrderId ==========
        const now = new Date().toISOString();
        
        let orderData = {
            orderNumber,
            orderDate,
            orderTime,
            customerId,
            status,
            shippingMethod,
            shippingAddress,
            extraEmail,
            paymentMethod: selectedPaymentMethod,
            paymentMethodName,
            approvalCode,
            otherPaymentText: otherText,
            items,
            subtotal,
            discount: discountValue,
            discountType,
            tax,
            total,
            updatedAt: now
        };
        
        // ✅ فقط أضف createdAt إذا كان طلب جديد (ليس تعديل)
        if (!currentOrderId) {
            orderData.createdAt = now;
        }
        
        // حفظ الطلب
        if (currentOrderId) {
            // استرجاع الطلب القديم لتحديث المخزون
            const oldOrder = orders.find(o => o.id === currentOrderId);
            if (oldOrder?.items) {
                // إعادة الكمية للمنتجات القديمة
                for (let it of oldOrder.items) {
                    if (it.productId && !it.productId.startsWith('temp_') && it.productId !== 'null' && it.productId !== 'undefined') {
                        const p = products.find(pr => pr.id === it.productId);
                        if (p) {
                            await updateProductStock(it.productId, (p.stock || 0) + (it.quantity || 0));
                        }
                    }
                }
            }
            
            await updateOrder(currentOrderId, orderData);
            showToast('تم تعديل الطلب بنجاح', 'success');
        } else {
            await addOrder(orderData);
            showToast('تم إضافة الطلب بنجاح', 'success');
        }
        
        // خصم الكمية من المخزون للمنتجات الجديدة
        for (let it of items) {
            if (it.productId && !it.productId.startsWith('temp_') && it.productId !== 'null' && it.productId !== 'undefined') {
                const p = products.find(pr => pr.id === it.productId);
                if (p) {
                    const newStock = Math.max(0, (p.stock || 0) - (it.quantity || 0));
                    await updateProductStock(it.productId, newStock);
                }
            }
        }
        
        closeModal();
        await loadData();
        await renderOrders();
        
    } catch (err) {
        console.error('❌ خطأ في حفظ الطلب:', err);
        showToast('خطأ في الحفظ: ' + (err.message || 'حدث خطأ غير متوقع'), 'error');
    }
}
