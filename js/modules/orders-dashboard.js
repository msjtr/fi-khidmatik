/**
 * js/modules/orders-dashboard.js
 * موديول الطلبات - جلب بيانات العميل من customers باستخدام customerId
 * @version 3.1.0
 */

import { db } from '../core/firebase.js';
import { 
    collection, getDocs, query, orderBy, doc, getDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

console.log('🚀 orders-dashboard.js (جلب بيانات العملاء) تم تحميله');

// ===================== دوال مساعدة =====================

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount) + ' ر.س';
}

/**
 * تنسيق العنوان الكامل من بيانات العميل
 * يستخدم: city, district, street, buildingNo, additionalNo, poBox, country
 */
function formatFullAddress(customer) {
    if (!customer) return '';
    const parts = [];
    if (customer.buildingNo) parts.push(`مبنى ${customer.buildingNo}`);
    if (customer.street) parts.push(`شارع ${customer.street}`);
    if (customer.district) parts.push(`حي ${customer.district}`);
    if (customer.city) parts.push(customer.city);
    if (customer.additionalNo) parts.push(`رقم إضافي ${customer.additionalNo}`);
    if (customer.poBox) parts.push(`ص.ب ${customer.poBox}`);
    if (customer.country) parts.push(customer.country);
    return parts.length > 0 ? parts.join('، ') : 'لا يوجد عنوان مفصل';
}

/**
 * جلب بيانات العميل الكاملة من مجموعة customers باستخدام customerId
 */
async function fetchCustomerData(customerId) {
    if (!customerId) return null;
    try {
        const customerDoc = await getDoc(doc(db, "customers", customerId));
        if (customerDoc.exists()) {
            return customerDoc.data();
        }
    } catch (error) {
        console.error("Error fetching customer:", error);
    }
    return null;
}

/**
 * دمج بيانات الطلب مع بيانات العميل (تطبيق Fallback)
 * أولوية: بيانات الطلب ← ثم بيانات العميل
 */
function mergeOrderWithCustomer(order, customer) {
    if (!customer) {
        return {
            ...order,
            customerName: order.customerName || 'غير معروف',
            phone: order.phone || 'غير موجود',
            email: order.email || '',
            address: order.shippingAddress || 'لا يوجد عنوان',
            customerData: null
        };
    }
    
    // تطبيق Fallback: استخدم بيانات الطلب إذا موجودة، وإلا استخدم بيانات العميل
    return {
        ...order,
        customerName: order.customerName || customer.name || 'غير معروف',
        phone: order.phone || customer.phone || 'غير موجود',
        email: order.email || customer.email || '',
        address: order.shippingAddress || formatFullAddress(customer),
        // حفظ بيانات العميل الكاملة للاستخدام المستقبلي
        customerData: {
            name: customer.name,
            phone: customer.phone,
            email: customer.email,
            city: customer.city,
            district: customer.district,
            street: customer.street,
            buildingNo: customer.buildingNo,
            additionalNo: customer.additionalNo,
            poBox: customer.poBox,
            country: customer.country
        }
    };
}

// ===================== عرض الطلبات =====================

async function displayOrders(container) {
    container.innerHTML = `
        <div style="padding: 40px; text-align: center;">
            <i class="fas fa-spinner fa-spin fa-2x" style="color: #e67e22;"></i>
            <p style="margin-top: 15px;">جاري تحميل الطلبات...</p>
        </div>
    `;

    try {
        const ordersQuery = query(collection(db, "orders"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(ordersQuery);
        
        if (querySnapshot.empty) {
            container.innerHTML = `
                <div style="padding: 40px; text-align: center; color: #7f8c8d;">
                    <i class="fas fa-inbox fa-3x" style="margin-bottom: 15px;"></i>
                    <p>لا توجد طلبات مسجلة حالياً.</p>
                </div>
            `;
            return;
        }

        let totalSales = 0;
        let ordersHtml = '<div style="padding: 20px;"><h3>📋 قائمة الطلبات</h3>';
        
        // معالجة كل طلب وجلب بيانات العميل المرتبطة به
        for (const docSnapshot of querySnapshot.docs) {
            const order = docSnapshot.data();
            const orderId = docSnapshot.id;
            let total = order.total || 0;
            totalSales += total;
            
            // جلب بيانات العميل باستخدام customerId
            let customer = null;
            if (order.customerId) {
                customer = await fetchCustomerData(order.customerId);
                console.log(`📦 جلب بيانات العميل ${order.customerId}:`, customer ? 'تم بنجاح' : 'غير موجود');
            }
            
            // دمج بيانات الطلب مع بيانات العميل (تطبيق Fallback)
            const mergedOrder = mergeOrderWithCustomer(order, customer);
            
            const date = order.createdAt?.toDate?.() 
                ? order.createdAt.toDate().toLocaleDateString('ar-SA') 
                : order.orderDate || 'تاريخ غير معروف';
            
            ordersHtml += `
                <div class="order-card" style="background: white; border-radius: 12px; padding: 15px; margin-bottom: 15px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); border-right: 4px solid #e67e22;">
                    
                    <!-- رأس البطاقة: رقم الطلب والتاريخ -->
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid #eee;">
                        <span style="background: #e67e22; color: white; padding: 4px 12px; border-radius: 20px; font-size: 0.8rem;">
                            🧾 ${escapeHtml(order.orderNumber || orderId.slice(0, 8))}
                        </span>
                        <span style="color: #7f8c8d; font-size: 0.8rem;">
                            <i class="far fa-calendar-alt"></i> ${date}
                        </span>
                    </div>
                    
                    <!-- معلومات العميل الكاملة (من الطلب أو من customer) -->
                    <div style="margin-bottom: 15px;">
                        <div style="display: flex; align-items: center; margin-bottom: 8px;">
                            <i class="fas fa-user" style="color: #e67e22; width: 25px;"></i>
                            <strong style="margin-left: 8px;">العميل:</strong>
                            <span>${escapeHtml(mergedOrder.customerName)}</span>
                        </div>
                        <div style="display: flex; align-items: center; margin-bottom: 8px;">
                            <i class="fas fa-phone" style="color: #e67e22; width: 25px;"></i>
                            <strong style="margin-left: 8px;">الجوال:</strong>
                            <span dir="ltr">${escapeHtml(mergedOrder.phone)}</span>
                        </div>
                        ${mergedOrder.email ? `
                        <div style="display: flex; align-items: center; margin-bottom: 8px;">
                            <i class="fas fa-envelope" style="color: #e67e22; width: 25px;"></i>
                            <strong style="margin-left: 8px;">البريد:</strong>
                            <span>${escapeHtml(mergedOrder.email)}</span>
                        </div>
                        ` : ''}
                        ${mergedOrder.address && mergedOrder.address !== 'لا يوجد عنوان' ? `
                        <div style="display: flex; align-items: flex-start; margin-bottom: 8px;">
                            <i class="fas fa-location-dot" style="color: #e67e22; width: 25px; margin-top: 3px;"></i>
                            <strong style="margin-left: 8px;">العنوان:</strong>
                            <span style="flex: 1;">${escapeHtml(mergedOrder.address)}</span>
                        </div>
                        ` : ''}
                    </div>
                    
                    <!-- معلومات الدفع والمنتجات -->
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; padding-top: 10px; border-top: 1px solid #eee;">
                        <div>
                            <span style="color: #7f8c8d; font-size: 0.8rem;">
                                <i class="fas fa-box"></i> المنتجات: ${order.items?.length || 0}
                            </span>
                            ${order.paymentMethodName ? `
                            <span style="color: #7f8c8d; font-size: 0.8rem; margin-right: 15px;">
                                <i class="fas fa-credit-card"></i> ${escapeHtml(order.paymentMethodName)}
                            </span>
                            ` : ''}
                        </div>
                        <div style="font-size: 1.2rem; font-weight: bold; color: #27ae60;">
                            ${formatCurrency(total)}
                        </div>
                    </div>
                    
                    <!-- حالة الطلب (إذا وجدت) -->
                    ${order.status ? `
                    <div style="margin-top: 10px; text-align: left;">
                        <span style="background: #e3f2fd; color: #1976d2; padding: 2px 8px; border-radius: 12px; font-size: 0.7rem;">
                            الحالة: ${escapeHtml(order.status)}
                        </span>
                    </div>
                    ` : ''}
                </div>
            `;
        }
        
        // إضافة إجمالي المبيعات في الأعلى
        ordersHtml = `
            <div style="margin-bottom: 20px; padding: 15px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; color: white; text-align: center;">
                <h3 style="margin: 0;">💰 إجمالي المبيعات</h3>
                <div style="font-size: 1.8rem; font-weight: bold;">${formatCurrency(totalSales)}</div>
                <div>عدد الطلبات: ${querySnapshot.size}</div>
            </div>
        ` + ordersHtml;
        
        ordersHtml += '</div>';
        container.innerHTML = ordersHtml;
        console.log('✅ تم عرض الطلبات بنجاح مع بيانات العملاء من customers');

    } catch (error) {
        console.error("خطأ في جلب الطلبات:", error);
        container.innerHTML = `
            <div style="padding: 40px; text-align: center; color: #e74c3c;">
                <i class="fas fa-exclamation-triangle fa-3x" style="margin-bottom: 15px;"></i>
                <p>حدث خطأ في تحميل الطلبات: ${error.message}</p>
                <button onclick="if(window.switchModule) window.switchModule('orders')" 
                        style="margin-top: 15px; padding: 8px 20px; background: #e67e22; color: white; border: none; border-radius: 8px; cursor: pointer;">
                    <i class="fas fa-sync-alt"></i> إعادة المحاولة
                </button>
            </div>
        `;
    }
}

// ===================== الدوال الرئيسية =====================

export async function initOrdersDashboard(container) {
    console.log('✅ [initOrdersDashboard] تم استدعاء الدالة بنجاح');
    
    if (!container) {
        console.error('❌ container غير موجود');
        return;
    }

    container.innerHTML = `
        <div style="padding: 20px; font-family: 'Tajawal', sans-serif;">
            <h2 style="color: #2c3e50; margin-bottom: 20px;">
                <i class="fas fa-receipt" style="color: #e67e22;"></i> 
                نظام الطلبات والفواتير
            </h2>
            <div id="orders-content" style="margin-top: 20px;">
                <div style="text-align: center; padding: 40px;">
                    <i class="fas fa-spinner fa-spin fa-2x" style="color: #e67e22;"></i>
                    <p style="margin-top: 15px;">جاري تحميل الطلبات...</p>
                </div>
            </div>
        </div>
    `;
    
    const ordersContainer = document.getElementById('orders-content');
    await displayOrders(ordersContainer);
}

// دالة إضافية للتوافق مع main.js
export async function initOrders(container) {
    console.log('🔄 تم استدعاء initOrders (المرادف)');
    return initOrdersDashboard(container);
}

export default { initOrdersDashboard, initOrders };
