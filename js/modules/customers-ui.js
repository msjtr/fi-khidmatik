/**
 * js/modules/customers-ui.js
 * نسخة مبسطة ومضمونة لجلب بيانات العملاء من Firebase
 */

import { db } from '../core/firebase.js';
import { collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

console.log('✅ customers-ui.js تم تحميله');

// الدالة الرئيسية
export async function initCustomers(container) {
    console.log('🚀 initCustomers تم استدعاؤها');
    
    if (!container) {
        console.error('❌ container غير موجود');
        return;
    }
    
    // عرض واجهة التحميل
    container.innerHTML = `
        <div style="padding: 25px; font-family: 'Tajawal', sans-serif;">
            <h2 style="color: #2c3e50;">
                <i class="fas fa-users" style="color: #e67e22;"></i> 
                إدارة العملاء
            </h2>
            <div id="customers-list" style="margin-top: 20px;">
                <div style="text-align: center; padding: 40px;">
                    <i class="fas fa-spinner fa-spin fa-2x"></i>
                    <p>جاري تحميل العملاء...</p>
                </div>
            </div>
        </div>
    `;
    
    try {
        // جلب العملاء من Firebase
        const q = query(collection(db, "customers"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        
        const customers = [];
        querySnapshot.forEach((doc) => {
            customers.push({ id: doc.id, ...doc.data() });
        });
        
        const listDiv = document.getElementById('customers-list');
        
        if (customers.length === 0) {
            listDiv.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #7f8c8d;">
                    <i class="fas fa-users fa-3x"></i>
                    <p>لا يوجد عملاء مسجلين</p>
                </div>
            `;
            return;
        }
        
        // عرض العملاء في جدول
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
                            <th style="padding: 12px; text-align: right;">الحي</th>
                            <th style="padding: 12px; text-align: right;">الشارع</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        customers.forEach((c, index) => {
            html += `
                <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 12px;">${index + 1}</td>
                    <td style="padding: 12px; font-weight: bold;">${escapeHtml(c.name)}</td>
                    <td style="padding: 12px; direction: ltr;">${escapeHtml(c.phone)}</td>
                    <td style="padding: 12px;">${escapeHtml(c.email) || '-'}</td>
                    <td style="padding: 12px;">${escapeHtml(c.city) || '-'}</td>
                    <td style="padding: 12px;">${escapeHtml(c.district) || '-'}</td>
                    <td style="padding: 12px;">${escapeHtml(c.street) || '-'}</td>
                </tr>
            `;
        });
        
        html += `
                    </tbody>
                </table>
            </div>
            <div style="margin-top: 15px; padding: 10px; background: #e3f2fd; border-radius: 8px;">
                ✅ تم جلب ${customers.length} عميل من Firebase
            </div>
        `;
        
        listDiv.innerHTML = html;
        console.log('✅ تم عرض العملاء بنجاح');
        
    } catch (error) {
        console.error('❌ خطأ في جلب العملاء:', error);
        const listDiv = document.getElementById('customers-list');
        if (listDiv) {
            listDiv.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #e74c3c;">
                    <i class="fas fa-exclamation-triangle fa-3x"></i>
                    <p>خطأ في تحميل العملاء: ${error.message}</p>
                </div>
            `;
        }
    }
}

// دالة مساعدة لمنع XSS
function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}
