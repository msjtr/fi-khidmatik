// ========== جلب بيانات المنتج من المخزون بشكل آمن ==========
function getFullProductFromInventory(productId) {
    // التحقق من صحة المعرف
    if (!productId || productId === 'null' || productId === 'undefined') {
        console.warn('⚠️ معرف المنتج غير صالح:', productId);
        return null;
    }
    
    const product = products.find(p => p.id === productId);
    if (product) {
        return {
            productId: product.id,
            name: product.name,
            price: product.price,
            barcode: product.code || product.barcode,
            image: product.image || product.mainImage || '',
            description: product.description || '',
            cost: product.cost || 0,
            stock: product.stock || 0
        };
    }
    
    console.warn(`⚠️ المنتج غير موجود في المخزون: ${productId}`);
    return null;
}

// ========== تحديث المنتج في الطلب ==========
async function updateOrderProduct(orderId, productIndex, newProductData) {
    try {
        const order = orders.find(o => o.id === orderId);
        if (!order) throw new Error('الطلب غير موجود');
        
        const updatedItems = [...(order.items || [])];
        if (productIndex >= updatedItems.length) throw new Error('المنتج غير موجود');
        
        // تحديث بيانات المنتج
        updatedItems[productIndex] = {
            ...updatedItems[productIndex],
            ...newProductData,
            updatedAt: new Date().toISOString()
        };
        
        await updateOrder(orderId, { items: updatedItems });
        return true;
    } catch (error) {
        console.error('❌ خطأ في تحديث المنتج:', error);
        throw error;
    }
}

// ========== إضافة منتج في الطلب (محسّن) ==========
function addProductRow(pd = null) {
    const container = document.getElementById('productsContainer');
    const row = document.createElement('div');
    row.className = 'product-row';
    
    let productData = pd || {};
    
    // معالجة المنتج من المخزون
    if (pd?.productId && pd?.productId !== 'null' && pd?.productId !== 'undefined') {
        const fullProduct = getFullProductFromInventory(pd.productId);
        if (fullProduct) {
            productData = { 
                ...fullProduct, 
                quantity: pd.quantity || 1,
                productId: fullProduct.productId
            };
        } else if (pd.name) {
            // منتج مخصص غير موجود في المخزون
            productData = { ...pd };
        }
    }
    
    const productImage = productData.image || '';
    const imageHtml = productImage ? 
        `<img src="${productImage}" class="product-image-preview" onclick="window.openImage('${productImage}')" onerror="this.style.display='none'">` : 
        '<div class="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400"><i class="fas fa-image text-2xl"></i></div>';
    
    const description = productData.description || '';
    const productIdValue = productData.productId || '';
    
    row.innerHTML = `
        <div class="flex gap-3 flex-wrap md:flex-nowrap">
            <div class="product-image-container w-20 h-20 flex-shrink-0">
                ${imageHtml}
                <input type="hidden" class="product-image" value="${escapeHtml(productImage)}">
            </div>
            <div class="flex-1 grid grid-cols-1 md:grid-cols-6 gap-2">
                <input type="text" class="product-name border rounded-lg p-2 text-sm md:col-span-2" value="${escapeHtml(productData.name || '')}" placeholder="اسم المنتج">
                <input type="text" class="product-barcode border rounded-lg p-2 text-sm bg-gray-50" readonly value="${escapeHtml(productData.barcode || generateRandomCode())}">
                <input type="number" class="product-price border rounded-lg p-2 text-sm" step="0.01" value="${productData.price || 0}">
                <input type="number" class="product-quantity border rounded-lg p-2 text-sm" value="${productData.quantity || 1}" min="1">
                <button type="button" class="upload-image-btn bg-gray-100 rounded-lg p-2 hover:bg-gray-200"><i class="fas fa-camera"></i></button>
                <button type="button" class="remove-product-btn text-red-600 rounded-lg p-2 hover:bg-red-50"><i class="fas fa-trash"></i></button>
            </div>
        </div>
        <div class="mt-2">
            <textarea class="product-desc w-full border rounded-lg p-2 text-sm" rows="3" placeholder="وصف المنتج...">${escapeHtml(description)}</textarea>
            <input type="hidden" class="product-desc-hidden" value="${escapeHtml(description)}">
        </div>
        <input type="hidden" class="product-id" value="${escapeHtml(productIdValue)}">
    `;
    
    container.appendChild(row);
    
    const descTextarea = row.querySelector('.product-desc');
    const descHidden = row.querySelector('.product-desc-hidden');
    descTextarea.addEventListener('input', () => {
        descHidden.value = descTextarea.value;
        updateTotals();
    });
    
    row.querySelector('.product-price').addEventListener('input', updateTotals);
    row.querySelector('.product-quantity').addEventListener('input', updateTotals);
    row.querySelector('.remove-product-btn').onclick = () => { row.remove(); updateTotals(); };
    
    row.querySelector('.upload-image-btn').onclick = () => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (ev) => {
                    const imgUrl = ev.target.result;
                    row.querySelector('.product-image').value = imgUrl;
                    row.querySelector('.product-image-container').innerHTML = `<img src="${imgUrl}" class="product-image-preview" onclick="window.openImage('${imgUrl}')"><input type="hidden" class="product-image" value="${imgUrl}">`;
                    updateTotals();
                    showToast('تم إضافة الصورة', 'success');
                };
                reader.readAsDataURL(file);
            }
        };
        fileInput.click();
    };
    
    updateTotals();
    return row;
}

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
        
        const orderData = {
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
            updatedAt: new Date().toISOString()
        };
        
        if (!currentOrderId) {
            orderData.createdAt = new Date().toISOString();
        }
        
        // حفظ الطلب
        if (currentOrderId) {
            // استرجاع الطلب القديم لتحديث المخزون
            const oldOrder = orders.find(o => o.id === currentOrderId);
            if (oldOrder?.items) {
                // إعادة الكمية للمنتجات القديمة
                for (let it of oldOrder.items) {
                    if (it.productId && !it.productId.startsWith('temp_') && it.productId !== 'null') {
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
            if (it.productId && !it.productId.startsWith('temp_') && it.productId !== 'null') {
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

// ========== تحديث مخزون المنتج بشكل آمن ==========
async function updateProductStock(productId, newStock) {
    if (!productId || productId.startsWith('temp_') || productId === 'null' || productId === 'undefined') {
        console.log('⏭️ تخطي تحديث المخزون للمنتج المؤقت:', productId);
        return;
    }
    
    try {
        const productRef = doc(db, "products", productId);
        await updateDoc(productRef, { 
            stock: Math.max(0, newStock),
            updatedAt: new Date().toISOString()
        });
        console.log(`✅ تم تحديث مخزون المنتج ${productId} إلى ${newStock}`);
        
        // تحديث الكاش المحلي
        const productIndex = products.findIndex(p => p.id === productId);
        if (productIndex !== -1) {
            products[productIndex].stock = Math.max(0, newStock);
        }
    } catch (error) {
        console.error("❌ خطأ في تحديث المخزون:", error);
        // لا نرمي الخطأ لأن هذا لا يجب أن يمنع حفظ الطلب
    }
}

// ========== تحميل قائمة المنتجات ==========
async function loadProductsList() {
    try {
        const snapshot = await getDocs(collection(db, "products"));
        products = snapshot.docs.map(doc => ({ 
            id: doc.id, 
            ...doc.data(),
            image: doc.data().image || doc.data().mainImage || ''
        }));
        console.log(`✅ تم تحميل ${products.length} منتج بنجاح`);
        return products;
    } catch (err) {
        console.error('❌ خطأ في تحميل المنتجات:', err);
        products = [];
        showToast('خطأ في تحميل المنتجات', 'error');
        return [];
    }
}
