import { db } from '../core/firebase.js';
import { collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

console.log('✅ customers-ui.js تم تحميل النسخة المحدثة');

export async function initCustomers(container) {
    if (!container) return;
    
    // واجهة التحميل الأولية
    container.innerHTML = `
        <div style="padding: 20px; font-family: 'Tajawal', sans-serif;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2 style="color: #2c3e50; margin: 0;">
                    <i class="fas fa-address-card" style="color: #e67e22;"></i> سجل العملاء التفصيلي
                </h2>
                <div id="stats-badge"></div>
            </div>
            <div id="customers-container">
                <div style="text-align: center; padding: 40px;">
                    <i class="fas fa-sync fa-spin fa-2x" style="color: #e67e22;"></i>
                    <p>جاري جلب البيانات من Firebase...</p>
                </div>
            </div>
        </div>
    `;
    
    try {
        const q = query(collection(db, "customers"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        const containerDiv = document.getElementById('customers-container');
        
        if (snapshot.empty) {
            containerDiv.innerHTML = `<div style="text-align:center; padding:50px; color:#95a5a6;"><i class="fas fa-folder-open fa-3x"></i><p>لا يوجد عملاء حالياً</p></div>`;
            return;
        }

        // بناء الجدول مع كافة الحقول (بما فيها الرقم الإضافي والرمز البريدي)
        let html = `
            <div style="overflow-x: auto; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border-radius: 12px;">
                <table style="width: 100%; border-collapse: collapse; background: white; min-width: 1200px;">
                    <thead style="background: #2c3e50; color: white;">
                        <tr>
                            <th style="padding: 15px; text-align: center;">الاسم</th>
                            <th style="padding: 15px; text-align: center;">الجوال</th>
                            <th style="padding: 15px; text-align: center;">المدينة/الحي</th>
                            <th style="padding: 15px; text-align: center;">الشارع</th>
                            <th style="padding: 15px; text-align: center;">رقم المبنى</th>
                            <th style="padding: 15px; text-align: center;">الإضافي</th>
                            <th style="padding: 15px; text-align: center;">الرمز البريدي</th>
                            <th style="padding: 15px; text-align: center;">ص.ب</th>
                            <th style="padding: 15px; text-align: center;">العمليات</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        snapshot.forEach((doc) => {
            const data = doc.data();
            html += `
                <tr style="border-bottom: 1px solid #edf2f7; hover: background: #f8fafc;">
                    <td style="padding: 12px; font-weight: bold; color: #2d3748;">${escapeHtml(data.name)}</td>
                    <td style="padding: 12px; direction: ltr; text-align: center;">${escapeHtml(data.phone)}</td>
                    <td style="padding: 12px; text-align: center;">${escapeHtml(data.city)} / ${escapeHtml(data.district)}</td>
                    <td style="padding: 12px; text-align: center;">${escapeHtml(data.street)}</td>
                    <td style="padding: 12px; text-align: center;"><span style="background:#edf2f7; padding:4px 8px; border-radius:4px;">${escapeHtml(data.buildingNo)}</span></td>
                    <td style="padding: 12px; text-align: center; color: #e67e22;">${escapeHtml(data.additionalNo) || '-'}</td>
                    <td style="padding: 12px; text-align: center;">${escapeHtml(data.postalCode) || '-'}</td>
                    <td style="padding: 12px; text-align: center;">${escapeHtml(data.poBox) || '-'}</td>
                    <td style="padding: 12px; text-align: center;">
                        <button onclick="window.location.hash='#orders?customer=${doc.id}'" style="border:none; background:#e67e22; color:white; padding:6px 12px; border-radius:6px; cursor:pointer;">
                            <i class="fas fa-plus"></i> طلب
                        </button>
                    </td>
                </tr>
            `;
        });
        
        html += `</tbody></table></div>`;
        containerDiv.innerHTML = html;
        
        // تحديث شارة الإحصائيات
        document.getElementById('stats-badge').innerHTML = `
            <span style="background: #e1f5fe; color: #01579b; padding: 5px 15px; border-radius: 20px; font-size: 0.9rem; font-weight: bold;">
                إجمالي العملاء: ${snapshot.size}
            </span>
        `;
        
    } catch (error) {
        console.error('❌ Error:', error);
        document.getElementById('customers-container').innerHTML = `
            <div style="background:#fff5f5; color:#c53030; padding:20px; border-radius:8px; text-align:center;">
                <i class="fas fa-exclamation-circle fa-2x"></i>
                <p>تعذر تحميل البيانات. تأكد من إعدادات Firestore Rules.</p>
            </div>
        `;
    }
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>]/g, (m) => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[m]));
}
