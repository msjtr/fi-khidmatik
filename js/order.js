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
    where,      // إضافة - مهم للبحث والتصفية
    Timestamp   // إضافة - للتعامل مع التواريخ
} from './firebase.js';

// ========== دوال مساعدة ==========
/**
 * تحويل بيانات الطلب إلى صيغة آمنة للتخزين
 */
function sanitizeOrderData(orderData) {
    return {
        customer: orderData.customer || '',
        customerId: orderData.customerId || null,
        phone: orderData.phone || '',
        cart: orderData.cart || orderData.items || [],
        items: orderData.items || orderData.cart || [],  // توافق مع النظام القديم
        total: orderData.total || 0,
        payment: orderData.payment || '',
        paymentMethod: orderData.paymentMethod || orderData.payment || '',
        shipping: orderData.shipping || '',
        shippingMethod: orderData.shippingMethod || orderData.shipping || 'pickup',
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
        const orderNumber = `ORD-${timestamp.toString().slice(-8)}`;
        
        const docRef = await addDoc(ordersRef, {
            ...safeData,
            orderNumber: orderNumber,
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
                // توافق مع كل من cart و items
                items: data.items || data.cart || [],
                cart: data.cart || data.items || []
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
export async function getAllOrdersFromFirebase(limitCount = 100) {
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
            orders.push({ 
                id: doc.id, 
                ...data,
                items: data.items || data.cart || []
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
        
        // إضافة فلتر التاريخ
        if (filters.startDate) {
            constraints.push(where('timestamp', '>=', new Date(filters.startDate).getTime()));
        }
        
        if (filters.endDate) {
            constraints.push(where('timestamp', '<=', new Date(filters.endDate).getTime()));
        }
        
        // إضافة حد للنتائج
        if (filters.limit) {
            constraints.push(limit(filters.limit));
        }
        
        const q = query(ordersRef, ...constraints);
        const querySnapshot = await getDocs(q);
        
        const orders = [];
        querySnapshot.forEach((doc) => {
            orders.push({ id: doc.id, ...doc.data() });
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
        const orders = await getAllOrdersFromFirebase(1000); // جلب آخر 1000 طلب
        
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
            // المجموع الكلي
            stats.totalRevenue += order.total || 0;
            
            // حسب الحالة
            const status = order.status || 'غير محدد';
            stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;
            
            // آخر 30 يوم
            if (order.timestamp && order.timestamp >= thirtyDaysAgo) {
                stats.last30Days++;
            }
            
            // اليوم
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

// ========== طباعة الفاتورة (مباشرة) ==========
export function printOrder(order) {
    try {
        const printWindow = window.open('', '_blank', 'width=800,height=600');
        
        const itemsHtml = (order.items || order.cart || []).map((item, index) => `
            <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">${index + 1}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${item.name}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${item.quantity || 1}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${(item.price || 0).toFixed(2)}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</td>
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
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: center; }
                    th { background: #f2f2f2; }
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
                    <p><strong>التاريخ:</strong> ${new Date(order.createdAt).toLocaleDateString('ar-SA')}</p>
                    <p><strong>العميل:</strong> ${order.customer}</p>
                    <p><strong>الجوال:</strong> ${order.phone}</p>
                </div>
                
                <table>
                    <thead>
                        <tr><th>#</th><th>المنتج</th><th>الكمية</th><th>السعر</th><th>الإجمالي</th></tr>
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
