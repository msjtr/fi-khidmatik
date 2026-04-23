import { db } from '../core/firebase.js';
import { collection, getDocs, query, orderBy, deleteDoc, doc, addDoc, updateDoc, serverTimestamp, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export async function initCustomers(container) {
    if (!container) return;

    container.innerHTML = `
        <div style="padding: 25px; font-family: 'Tajawal', sans-serif; direction: rtl;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2 style="margin:0;"><i class="fas fa-users" style="color: #e67e22;"></i> إدارة العملاء</h2>
                <button id="add-customer-btn" style="background: #e67e22; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: bold;">
                    <i class="fas fa-user-plus"></i> عميل جديد
                </button>
            </div>

            <div id="stats-container" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px;">
                <div style="background: #fff; padding: 15px; border-radius: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); border-right: 5px solid #3498db;">
                    <div style="color: #7f8c8d; font-size: 0.9rem;">إجمالي العملاء</div>
                    <div id="total-count" style="font-size: 1.5rem; font-weight: bold; color: #2c3e50;">0</div>
                </div>
                <div style="background: #fff; padding: 15px; border-radius: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); border-right: 5px solid #27ae60;">
                    <div style="color: #7f8c8d; font-size: 0.9rem;">بيانات مكتملة</div>
                    <div id="complete-count" style="font-size: 1.5rem; font-weight: bold; color: #27ae60;">0</div>
                </div>
                <div style="background: #fff; padding: 15px; border-radius: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); border-right: 5px solid #e74c3c;">
                    <div style="color: #7f8c8d; font-size: 0.9rem;">بيانات ناقصة</div>
                    <div id="incomplete-count" style="font-size: 1.5rem; font-weight: bold; color: #e74c3c;">0</div>
                </div>
            </div>

            <div style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                <table style="width: 100%; border-collapse: collapse; text-align: right;">
                    <thead style="background: #f8fafc;">
                        <tr>
                            <th style="padding: 15px;">العميل</th>
                            <th style="padding: 15px; text-align: center;">العنوان الوطني</th>
                            <th style="padding: 15px; text-align: center;">الجوال</th>
                            <th style="padding: 15px; text-align: center;">الحالة</th>
                            <th style="padding: 15px; text-align: center;">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody id="customers-table-body">
                        <tr><td colspan="5" style="text-align: center; padding: 30px;">جاري تحميل البيانات...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div id="customer-modal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); z-index:1000; justify-content:center; align-items:center;">
             </div>
    `;

    loadCustomers();
}

async function loadCustomers() {
    const tbody = document.getElementById('customers-table-body');
    try {
        const q = query(collection(db, "customers"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        tbody.innerHTML = "";

        let total = 0, complete = 0, incomplete = 0;

        snapshot.forEach(docSnap => {
            const data = docSnap.data();
            total++;

            // التحقق من اكتمال البيانات (الاسم، الجوال، رقم المبنى، الرمز البريدي)
            const isComplete = data.name && data.phone && data.buildingNo && data.postalCode && data.additionalNo;
            if (isComplete) complete++; else incomplete++;

            const row = document.createElement('tr');
            row.style.borderBottom = "1px solid #edf2f7";
            row.innerHTML = `
                <td style="padding:15px;">
                    <div style="font-weight:bold;">${data.name}</div>
                    <div style="font-size:0.8rem; color:#666;">${data.city} - ${data.district}</div>
                </td>
                <td style="padding:15px; text-align:center; font-size:0.85rem;">
                    <div>مبنى: ${data.buildingNo || '-'}</div>
                    <div style="color:#e67e22;">إضافي: ${data.additionalNo || '-'}</div>
                </td>
                <td style="padding:15px; text-align:center; direction:ltr;">${data.phone}</td>
                <td style="padding:15px; text-align:center;">
                    <span style="padding:4px 8px; border-radius:12px; font-size:0.75rem; background:${isComplete ? '#eafaf1' : '#fef2f2'}; color:${isComplete ? '#27ae60' : '#e74c3c'};">
                        ${isComplete ? 'مكتمل' : 'ناقص'}
                    </span>
                </td>
                <td style="padding:15px; text-align:center;">
                    <div style="display:flex; gap:8px; justify-content:center;">
                        <button onclick="window.location.hash='#add-order?id=${docSnap.id}'" title="إضافة طلب" style="background:#e67e22; color:white; border:none; padding:5px 10px; border-radius:6px; cursor:pointer;"><i class="fas fa-cart-plus"></i></button>
                        <button onclick="editCust('${docSnap.id}')" style="color:#3498db; background:none; border:none; cursor:pointer;"><i class="fas fa-edit"></i></button>
                        <button onclick="deleteCust('${docSnap.id}')" style="color:#e74c3c; background:none; border:none; cursor:pointer;"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });

        // تحديث أرقام الإحصائيات
        document.getElementById('total-count').innerText = total;
        document.getElementById('complete-count').innerText = complete;
        document.getElementById('incomplete-count').innerText = incomplete;

    } catch (e) { console.error(e); }
}

// ... بقية الدوال (editCust, deleteCust, handleFormSubmit) تبقى كما في الملف السابق
