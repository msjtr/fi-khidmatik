// js/order.js
import { 
    db, 
    collection, 
    addDoc, 
    doc, 
    getDoc, 
    getDocs, 
    updateDoc, 
    deleteDoc,
    query, 
    orderBy, 
    limit,
    where,
    Timestamp
} from './firebase.js';

// ========== دوال مساعدة ==========
/**
 * تحويل بيانات الطلب إلى صيغة آمنة للتخزين
 */
function sanitizeOrderData(orderData) {
    // معالجة المنتجات مع الحفاظ على الصور
    const items = (orderData.items || orderData.cart || []).map(item => ({
        productId: item.productId || null,
        name: item.name || '',
        price: parseFloat(item.price) || 0,
        quantity: parseInt(item.quantity) || 1,
        barcode: item.barcode || '',
        image: item.image || '',  // ✅ الحفاظ على الصورة
        description: item.description || '',
        // دعم للبيانات القديمة
        productDetails: item.productDetails || null
    }));
    
    return {
        customer: orderData.customer || '',
        customerId: orderData.customerId || null,
        phone: orderData.phone || '',
        cart: items,
        items: items,  // توافق مع النظام القديم
        total: orderData.total || 0,
        payment: orderData.payment || '',
        paymentMethod: orderData.paymentMethod || orderData.payment || '',
        paymentMethodName: orderData.paymentMethodName || '',
        shipping: orderData.shipping || '',
        shippingMethod: orderData.shippingMethod || orderData.shipping || 'pickup',
        shippingAddress: orderData.shippingAddress || null,
        extraEmail: orderData.extraEmail || null,
        approvalCode: orderData.approvalCode || null,
        otherPaymentText: orderData.otherPaymentText || null,
        subtotal: orderData.subtotal || 0,
        discount: orderData.discount || 0,
        discountType: orderData.discountType || 'fixed',
        tax: orderData.tax || 0,
        notes: orderData.notes || '',
        status: orderData.status || 'جديد'
    };
}

// ========== حفظ طلب جديد ==========
export async function saveOrderToFirebase(orderData) {
    try {
        const ordersRef = collection(db, 'orders');
        const safeData = sanitizeOrderData(orderData);
        
        // إنشاء رقم طلب فريد
        const timestamp = Date.now();
        const orderNumber = orderData.orderNumber || `KF-${timestamp.toString().slice(-8)}`;
        
        const docRef = await addDoc(ordersRef, {
            ...safeData,
            orderNumber: orderNumber,
            orderDate: orderData.orderDate || new Date().toISOString().split('T')[0],
            orderTime: orderData.orderTime || new Date().toLocaleTimeString('en-US', { hour12: false }),
            createdAt: new Date().toISOString(),
            timestamp: timestamp,
            updatedAt: new Date().toISOString(),
            status: safeData.status
        });

        console.log('✅ تم حفظ الطلب:', docRef.id, 'رقم الطلب:', orderNumber);
        return { id: docRef.id, orderNumber: orderNumber };

    } catch (error) {
        console.error('❌ خطأ في الحفظ:', error);
        throw new Error('فشل حفظ الطلب: ' + error.message);
    }
}

// ========== جلب طلب بواسطة ID ==========
export async function getOrderFromFirebase(orderId) {
    try {
        if (!orderId) {
            throw new Error('معرّف الطلب مطلوب');
        }
        
        const docRef = doc(db, 'orders', orderId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            return {
                id: docSnap.id,
                ...data,
                // توافق مع كل من cart و items مع الحفاظ على الصور
                items: (data.items || data.cart || []).map(item => ({
                    ...item,
                    image: item.image || ''  // ✅ التأكد من وجود حقل الصورة
                })),
                cart: (data.cart || data.items || []).map(item => ({
                    ...item,
                    image: item.image || ''
                }))
            };
        }

        console.warn('⚠️ الطلب غير موجود:', orderId);
        return null;

    } catch (error) {
        console.error('❌ خطأ في جلب الطلب:', error);
        throw error;
    }
}

// ========== جلب جميع الطلبات ==========
export async function getAllOrdersFromFirebase(limitCount = 500) {
    try {
        const ordersRef = collection(db, 'orders');
        
        const q = query(
            ordersRef,
            orderBy('timestamp', 'desc'),
            limit(limitCount)
        );

        const querySnapshot = await getDocs(q);
        
        const orders = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const items = (data.items || data.cart || []).map(item => ({
                ...item,
                image: item.image || ''  // ✅ التأكد من وجود حقل الصورة
            }));
            
            orders.push({ 
                id: doc.id, 
                ...data,
                items: items,
                cart: items
            });
        });

        console.log(`✅ تم جلب ${orders.length} طلب`);
        return orders;

    } catch (error) {
        console.error('❌ خطأ في جلب الطلبات:', error);
        throw error;
    }
}

// ========== جلب الطلبات مع الفلترة ==========
export async function getFilteredOrders(filters = {}) {
    try {
        let ordersRef = collection(db, 'orders');
        let constraints = [orderBy('timestamp', 'desc')];
        
        // إضافة فلتر الحالة
        if (filters.status && filters.status !== '') {
            constraints.push(where('status', '==', filters.status));
        }
        
        // إضافة فلتر العميل
        if (filters.customerId) {
            constraints.push(where('customerId', '==', filters.customerId));
        }
        
        // إضافة فلتر طريقة الاستلام
        if (filters.shippingMethod && filters.shippingMethod !== '') {
            constraints.push(where('shippingMethod', '==', filters.shippingMethod));
        }
        
        // إضافة فلتر التاريخ
        if (filters.startDate) {
            constraints.push(where('orderDate', '>=', filters.startDate));
        }
        
        if (filters.endDate) {
            constraints.push(where('orderDate', '<=', filters.endDate));
        }
        
        // إضافة حد للنتائج
        if (filters.limit) {
            constraints.push(limit(filters.limit));
        }
        
        const q = query(ordersRef, ...constraints);
        const querySnapshot = await getDocs(q);
        
        const orders = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const items = (data.items || data.cart || []).map(item => ({
                ...item,
                image: item.image || ''
            }));
            orders.push({ 
                id: doc.id, 
                ...data,
                items: items
            });
        });
        
        return orders;
        
    } catch (error) {
        console.error('❌ خطأ في جلب الطلبات المفلترة:', error);
        throw error;
    }
}

// ========== تحديث حالة الطلب ==========
export async function updateOrderStatusInFirebase(orderId, newStatus) {
    try {
        if (!orderId || !newStatus) {
            throw new Error('معرّف الطلب والحالة الجديدة مطلوبان');
        }
        
        const validStatuses = ['جديد', 'تحت التنفيذ', 'تم التنفيذ', 'تحت المراجعة', 'مسترجع', 'ملغي'];
        if (!validStatuses.includes(newStatus)) {
            throw new Error('حالة غير صالحة: ' + newStatus);
        }
        
        const docRef = doc(db, 'orders', orderId);
        
        await updateDoc(docRef, { 
            status: newStatus,
            updatedAt: new Date().toISOString()
        });

        console.log('✅ تم تحديث حالة الطلب:', orderId, '->', newStatus);
        return true;

    } catch (error) {
        console.error('❌ خطأ في تحديث الحالة:', error);
        throw error;
    }
}

// ========== تحديث بيانات الطلب كاملة ==========
export async function updateOrderInFirebase(orderId, orderData) {
    try {
        const docRef = doc(db, 'orders', orderId);
        const safeData = sanitizeOrderData(orderData);
        
        await updateDoc(docRef, {
            ...safeData,
            orderDate: orderData.orderDate,
            orderTime: orderData.orderTime,
            updatedAt: new Date().toISOString()
        });
        
        console.log('✅ تم تحديث الطلب:', orderId);
        return true;
        
    } catch (error) {
        console.error('❌ خطأ في تحديث الطلب:', error);
        throw error;
    }
}

// ========== حذف طلب ==========
export async function deleteOrderFromFirebase(orderId) {
    try {
        if (!orderId) {
            throw new Error('معرّف الطلب مطلوب');
        }
        
        const docRef = doc(db, 'orders', orderId);
        await deleteDoc(docRef);
        
        console.log('✅ تم حذف الطلب:', orderId);
        return true;
        
    } catch (error) {
        console.error('❌ خطأ في حذف الطلب:', error);
        throw error;
    }
}

// ========== إحصائيات الطلبات ==========
export async function getOrdersStatistics() {
    try {
        const orders = await getAllOrdersFromFirebase(1000);
        
        const stats = {
            total: orders.length,
            totalRevenue: 0,
            byStatus: {},
            last30Days: 0,
            today: 0
        };
        
        const today = new Date().toISOString().split('T')[0];
        const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
        
        orders.forEach(order => {
            stats.totalRevenue += order.total || 0;
            
            const status = order.status || 'غير محدد';
            stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;
            
            if (order.timestamp && order.timestamp >= thirtyDaysAgo) {
                stats.last30Days++;
            }
            
            if (order.createdAt && order.createdAt.split('T')[0] === today) {
                stats.today++;
            }
        });
        
        return stats;
        
    } catch (error) {
        console.error('❌ خطأ في جلب الإحصائيات:', error);
        throw error;
    }
}

// ========== البحث في الطلبات ==========
export async function searchOrders(searchTerm) {
    try {
        const orders = await getAllOrdersFromFirebase();
        
        const term = searchTerm.toLowerCase();
        const filtered = orders.filter(order => {
            return (
                order.orderNumber?.toLowerCase().includes(term) ||
                order.customer?.toLowerCase().includes(term) ||
                order.phone?.includes(term) ||
                order.items?.some(item => item.name?.toLowerCase().includes(term))
            );
        });
        
        return filtered;
        
    } catch (error) {
        console.error('❌ خطأ في البحث:', error);
        throw error;
    }
}

// ========== طباعة الفاتورة مع الصور ==========
export function printOrder(order) {
    try {
        const printWindow = window.open('', '_blank', 'width=800,height=600');
        
        // دالة لعرض الصورة في الطباعة
        const getProductImageHtml = (imageUrl, productName) => {
            if (imageUrl && imageUrl.trim() !== '') {
                return `<img src="${imageUrl}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 8px;" onerror="this.style.display='none'">`;
            }
            return `<div style="width: 40px; height: 40px; background: #f3f4f6; border-radius: 8px; display: flex; align-items: center; justify-content: center;">📦</div>`;
        };
        
        const itemsHtml = (order.items || order.cart || []).map((item, index) => `
            <tr>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${index + 1}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${getProductImageHtml(item.image, item.name)}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${item.name}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${item.quantity || 1}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${(item.price || 0).toFixed(2)}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</td>
            </tr>
        `).join('');
        
        const total = order.total || 0;
        
        printWindow.document.write(`
            <!DOCTYPE html>
            <html dir="rtl">
            <head>
                <meta charset="UTF-8">
                <title>فاتورة ${order.orderNumber}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    .header { text-align: center; margin-bottom: 30px; }
                    .info { margin-bottom: 20px; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                    th, td { border: 1px solid #ddd; padding: 8px; }
                    th { background: #f2f2f2; text-align: center; }
                    .total { text-align: left; font-size: 18px; font-weight: bold; margin-top: 20px; }
                    @media print {
                        button { display: none; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h2>فاتورة إلكترونية</h2>
                    <p>منصة في خدمتك - المملكة العربية السعودية</p>
                </div>
                
                <div class="info">
                    <p><strong>رقم الفاتورة:</strong> ${order.orderNumber}</p>
                    <p><strong>التاريخ:</strong> ${order.orderDate || new Date(order.createdAt).toLocaleDateString('ar-SA')}</p>
                    <p><strong>الوقت:</strong> ${order.orderTime || ''}</p>
                    <p><strong>العميل:</strong> ${order.customer}</p>
                    <p><strong>الجوال:</strong> ${order.phone}</p>
                    <p><strong>حالة الطلب:</strong> ${order.status || 'جديد'}</p>
                </div>
                
                <table>
                    <thead>
                        <tr><th>#</th><th>الصورة</th><th>المنتج</th><th>الكمية</th><th>السعر</th><th>الإجمالي</th></tr>
                    </thead>
                    <tbody>
                        ${itemsHtml}
                    </tbody>
                </table>
                
                <div class="total">
                    الإجمالي: ${total.toFixed(2)} ريال
                </div>
                
                <div style="text-align: center; margin-top: 50px;">
                    <p>شكراً لتسوقكم معنا</p>
                </div>
                
                <div style="text-align: center; margin-top: 20px;">
                    <button onclick="window.print()" style="padding: 10px 20px;">🖨️ طباعة</button>
                    <button onclick="window.close()" style="padding: 10px 20px;">✖️ إغلاق</button>
                </div>
            </body>
            </html>
        `);
        
        printWindow.document.close();
        
    } catch (error) {
        console.error('❌ خطأ في الطباعة:', error);
        throw error;
    }
}

// ========== تصدير المنتجات مع الصور ==========
export async function exportOrdersToCSV(orders) {
    try {
        const headers = ['رقم الطلب', 'التاريخ', 'العميل', 'الجوال', 'المنتجات', 'الإجمالي', 'الحالة', 'طريقة الدفع'];
        
        const rows = orders.map(order => {
            const productsList = (order.items || []).map(item => 
                `${item.name} (${item.quantity} × ${item.price})`
            ).join(' | ');
            
            return [
                order.orderNumber,
                order.orderDate,
                order.customer,
                order.phone,
                productsList,
                order.total,
                order.status,
                order.paymentMethodName || order.paymentMethod
            ];
        });
        
        const csvContent = [headers, ...rows]
            .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
            .join('\n');
        
        const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.setAttribute('download', `orders_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        return true;
        
    } catch (error) {
        console.error('❌ خطأ في التصدير:', error);
        throw error;
    }
}
