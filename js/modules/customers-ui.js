import { db } from '../core/firebase.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

console.log('✅ customers-ui.js تم تحميله');

export async function initCustomers(container) {
    console.log('🚀 initCustomers تم استدعاؤها');
    
    if (!container) {
        console.error('❌ container غير موجود');
        return;
    }
    
    // عرض واجهة التحميل
    container.innerHTML = `
        <div style="padding: 20px;">
            <h2 style="color: #2c3e50;">👥 إدارة العملاء</h2>
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
        const snapshot = await getDocs(collection(db, "customers"));
        const listDiv = document.getElementById('customers-list');
        
        if (snapshot.empty) {
            listDiv.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #7f8c8d;">
                    <i class="fas fa-users fa-3x"></i>
                    <p>لا يوجد عملاء مسجلين حالياً</p>
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
                            <th style="padding: 12px; text-align: right;">رقم الجوال</th>
                            <th style="padding: 12px; text-align: right;">البريد الإلكتروني</th>
                            <th style="padding: 12px; text-align: right;">المدينة</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        let index = 1;
        snapshot.forEach((doc) => {
            const data = doc.data();
            html += `
                <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 12px;">${index}</td>
                    <td style="padding: 12px; font-weight: bold;">${escapeHtml(data.name) || '-'}</td>
                    <td style="padding: 12px; direction: ltr;">${escapeHtml(data.phone) || '-'}</td>
                    <td style="padding: 12px;">${escapeHtml(data.email) || '-'}</td>
                    <td style="padding: 12px;">${escapeHtml(data.city) || '-'}</td>
                </tr>
            `;
            index++;
        });
        
        html += `
                    </tbody>
                </table>
            </div>
            <div style="margin-top: 15px; padding: 10px; background: #e3f2fd; border-radius: 8px; text-align: center;">
                ✅ تم جلب ${snapshot.size} عميل من Firebase
            </div>
        `;
        
        listDiv.innerHTML = html;
        
    } catch (error) {
        console.error('❌ خطأ في جلب العملاء:', error);
        document.getElementById('customers-list').innerHTML = `
            <div style="color: red; text-align: center; padding: 40px;">
                <i class="fas fa-exclamation-triangle fa-3x"></i>
                <p>خطأ في تحميل العملاء: ${error.message}</p>
            </div>
        `;
    }
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

export default { initCustomers };
