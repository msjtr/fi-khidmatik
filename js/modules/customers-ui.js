/**
 * js/modules/customers-ui.js
 * إصدار الحل النهائي V12.12.10
 */

import { db } from '../core/firebase.js';
import { collection, getDocs, query, limit } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export async function initCustomers(container) {
    if (!container) return;

    // 1. رسم الواجهة فوراً
    container.innerHTML = `
        <div style="padding: 20px; font-family: 'Tajawal', sans-serif; direction: rtl;">
            <div style="background: white; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden;">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead style="background: #f8f9fa;">
                        <tr>
                            <th style="padding: 15px; text-align: right;">العميل</th>
                            <th style="padding: 15px; text-align: right;">رقم الجوال</th>
                            <th style="padding: 15px; text-align: right;">المنطقة</th>
                            <th style="padding: 15px; text-align: center;">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody id="customers-tbody">
                        <tr>
                            <td colspan="4" style="text-align: center; padding: 50px;">
                                <div id="loader-status">
                                    <i class="fas fa-spinner fa-spin fa-2x" style="color: #e67e22;"></i>
                                    <p>جاري الاتصال بقاعدة بيانات تيرا...</p>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;

    const tbody = document.getElementById('customers-tbody');

    // 2. وضع مؤقت زمني لكسر الدوران اللانهائي
    const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Timeout")), 7000)
    );

    try {
        // محاولة جلب أول 50 عميل فقط للتأكد من السرعة
        const fetchPromise = getDocs(query(collection(db, "customers"), limit(50)));
        
        // تنفيذ الجلب مع سباق ضد الوقت
        const querySnapshot = await Promise.race([fetchPromise, timeoutPromise]);

        if (querySnapshot.empty) {
            tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; padding: 20px;">لا توجد بيانات (المجموعة فارغة)</td></tr>`;
            return;
        }

        let html = "";
        querySnapshot.forEach((doc) => {
            const c = doc.data();
            html += `
                <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 15px;"><strong>${c.name || 'بدون اسم'}</strong></td>
                    <td style="padding: 15px;">${c.phone || '---'}</td>
                    <td style="padding: 15px;">${c.city || 'حائل'}</td>
                    <td style="padding: 15px; text-align: center;">
                        <button style="color: #e67e22; border:none; background:none; cursor:pointer;"><i class="fas fa-eye"></i></button>
                    </td>
                </tr>
            `;
        });
        tbody.innerHTML = html;

    } catch (error) {
        console.error("Firebase Error:", error);
        
        // رسالة توضح السبب للمستخدم
        let errorMsg = "حدث خطأ غير متوقع";
        if (error.message === "Timeout") {
            errorMsg = "فشل الاتصال: خادم Firebase لا يستجيب (تأكد من الإنترنت)";
        } else if (error.code === "permission-denied") {
            errorMsg = "خطأ في الصلاحيات: يرجى تحديث قواعد Firebase Rules إلى allow read: if true;";
        }

        tbody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; padding: 30px; color: #e74c3c;">
                    <i class="fas fa-exclamation-triangle fa-2x"></i>
                    <p>${errorMsg}</p>
                    <button onclick="location.reload()" style="background:#e67e22; color:white; border:none; padding:8px 15px; border-radius:5px; cursor:pointer;">تحديث الصفحة</button>
                </td>
            </tr>
        `;
    }
}
