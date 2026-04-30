/**
 * js/modules/customers-ui.js
 * موديول واجهة إدارة العملاء - Tera Engine
 * معالجة مشكلة "عالق في المزامنة"
 */

import { db } from '../core/firebase.js';
import { COLLECTIONS } from '../core/config.js';
import { collection, getDocs, orderBy, query } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export async function initCustomers(container) {
    if (!container) return;

    // 1. رسم الهيكل الأساسي للجدول
    container.innerHTML = `
        <div style="padding: 20px; font-family: 'Tajawal', sans-serif;">
            <div id="customers-table-container">
                <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                    <thead style="background: #f8f9fa; border-bottom: 2px solid #edf2f7;">
                        <tr>
                            <th style="padding: 15px; text-align: right;">العميل</th>
                            <th style="padding: 15px; text-align: right;">رقم الجوال</th>
                            <th style="padding: 15px; text-align: right;">الموقع (المدينة/الحي)</th>
                            <th style="padding: 15px; text-align: right;">تاريخ الإضافة</th>
                            <th style="padding: 15px; text-align: right;">التصنيف</th>
                            <th style="padding: 15px; text-align: right;">الحالة</th>
                            <th style="padding: 15px; text-align: center;">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody id="customers-tbody">
                        <tr>
                            <td colspan="7" style="text-align: center; padding: 40px;">
                                <i class="fas fa-spinner fa-spin" style="color: #e67e22;"></i> جاري مزامنة بيانات عملاء حائل...
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;

    // 2. محاولة جلب البيانات الحقيقية
    try {
        const tbody = document.getElementById('customers-tbody');
        const customerRef = collection(db, COLLECTIONS.customers || "customers");
        const q = query(customerRef, orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 20px; color: #95a5a6;">لا يوجد عملاء مسجلين حالياً</td></tr>`;
            return;
        }

        // 3. بناء الصفوف
        let rowsHtml = "";
        querySnapshot.forEach((doc) => {
            const customer = doc.data();
            const date = customer.createdAt?.toDate ? customer.createdAt.toDate().toLocaleDateString('ar-SA') : '---';
            
            rowsHtml += `
                <tr style="border-bottom: 1px solid #f1f5f9; transition: 0.3s;" onmouseover="this.style.background='#fffcf9'" onmouseout="this.style.background='white'">
                    <td style="padding: 15px;"><strong>${customer.name || '---'}</strong></td>
                    <td style="padding: 15px; direction: ltr; text-align: right;">${customer.phone || '---'}</td>
                    <td style="padding: 15px;">${customer.city || 'حائل'} - ${customer.district || ''}</td>
                    <td style="padding: 15px;">${date}</td>
                    <td style="padding: 15px;"><span style="background: #eef2ff; color: #4338ca; padding: 4px 8px; border-radius: 6px; font-size: 0.85rem;">${customer.tag || 'عميل'}</span></td>
                    <td style="padding: 15px;"><span style="color: #059669;">● نشط</span></td>
                    <td style="padding: 15px; text-align: center;">
                        <button style="border: none; background: none; color: #e67e22; cursor: pointer;"><i class="fas fa-edit"></i></button>
                    </td>
                </tr>
            `;
        });

        tbody.innerHTML = rowsHtml;

    } catch (error) {
        console.error("🔴 Error Fetching Customers:", error);
        document.getElementById('customers-tbody').innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 20px; color: #e74c3c;">
                    حدث خطأ أثناء جلب البيانات. تأكد من إعدادات Firebase Cloud Firestore.
                </td>
            </tr>
        `;
    }
}
