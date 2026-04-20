/**
 * js/modules/customers-ui.js
 * جلب العملاء من Firebase - نسخة مبسطة
 */

import { db } from '../core/firebase.js';
import { collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

console.log('🚀 customers-ui.js تم تحميله');

// ===================== جلب العملاء =====================

async function loadCustomers() {
    console.log('🔄 جلب العملاء من Firebase...');
    try {
        const q = query(collection(db, "customers"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        console.log(`✅ تم العثور على ${querySnapshot.size} عميل`);
        
        const customers = [];
        querySnapshot.forEach(doc => {
            customers.push({ id: doc.id, ...doc.data() });
        });
        console.log('👥 العملاء:', customers);
        return customers;
    } catch (error) {
        console.error('❌ خطأ في جلب العملاء:', error);
        return [];
    }
}

// ===================== عرض العملاء =====================

function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

async function displayCustomers(container) {
    console.log('🔄 عرض العملاء...');
    
    const customers = await loadCustomers();
    
    if (!customers || customers.length === 0) {
        container.innerHTML = `
            <div style="padding: 40px; text-align: center; color: #7f8c8d;">
                <i class="fas fa-users fa-3x" style="margin-bottom: 10px; display: block;"></i>
                <p>لا يوجد عملاء مسجلين حالياً</p>
                <p style="font-size: 0.8rem;">مجموعة customers في Firebase: 0 مستند</p>
            </div>
        `;
        return;
    }
    
    let html = `
        <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 12px; overflow: hidden;">
                <thead style="background: #f8f9fa;">
                    <tr>
                        <th style="padding: 12px; text-align: right;">#</th>
                        <th style="padding: 12px; text-align: right;">الاسم</th>
                        <th style="padding: 12px; text-align: right;">الجوال</th>
                        <th style="padding: 12px; text-align: right;">البريد</th>
                        <th style="padding: 12px; text-align: right;">المدينة</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    customers.forEach((customer, index) => {
        html += `
            <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 12px;">${index + 1}</td>
                <td style="padding: 12px; font-weight: bold;">${escapeHtml(customer.name)}</td>
                <td style="padding: 12px; direction: ltr;">${escapeHtml(customer.phone)}</td>
                <td style="padding: 12px;">${escapeHtml(customer.email) || '-'}</td>
                <td style="padding: 12px;">${escapeHtml(customer.city) || '-'}</td>
            </tr>
        `;
    });
    
    html += `
                </tbody>
            </table>
        </div>
        <div style="margin-top: 15px; padding: 10px; background: #e3f2fd; border-radius: 8px; text-align: center;">
            ✅ تم جلب ${customers.length} عميل حقيقي من Firebase
        </div>
    `;
    
    container.innerHTML = html;
    console.log('✅ تم عرض العملاء بنجاح');
}

// ===================== الدالة الرئيسية =====================

export async function initCustomers(container) {
    console.log('✅ initCustomers تم استدعاؤها');
    
    if (!container) {
        console.error('❌ container غير موجود');
        return;
    }

    container.innerHTML = `
        <div style="padding: 20px; font-family: 'Tajawal', sans-serif;">
            <h2 style="color: #2c3e50; margin-bottom: 20px;">
                <i class="fas fa-users" style="color: #e67e22;"></i> 
                إدارة العملاء
            </h2>
            <div id="customers-content" style="margin-top: 20px;">
                <div style="text-align: center; padding: 40px;">
                    <i class="fas fa-spinner fa-spin fa-2x"></i>
                    <p>جاري تحميل العملاء...</p>
                </div>
            </div>
        </div>
    `;
    
    const customersContainer = document.getElementById('customers-content');
    await displayCustomers(customersContainer);
}

export default { initCustomers };
