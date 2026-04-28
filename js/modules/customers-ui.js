/**
 * js/modules/customers-ui.js
 * موديول واجهة مستخدم العملاء - متوافق مع Firebase V12 (Modular SDK)
 */

// استيراد الدوال المطلوبة مباشرة من مكتبة Firestore v12
import { 
    collection, 
    getDocs, 
    query, 
    orderBy, 
    doc, 
    deleteDoc 
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

export async function initCustomersUI(container) {
    console.log("🚀 Tera Gateway: محرك العملاء V12 قيد التشغيل...");

    // وظيفة للانتظار حتى يتم حقن window.db من ملف firebase.js
    const getFirestoreInstance = () => {
        return new Promise((resolve) => {
            if (window.db) return resolve(window.db);
            const interval = setInterval(() => {
                if (window.db) {
                    clearInterval(interval);
                    resolve(window.db);
                }
            }, 100);
        });
    };

    try {
        const db = await getFirestoreInstance();
        // استخدام المعرف الصحيح لجدول البيانات المكون من 17 عموداً
        const tableBody = container.querySelector('#customers-data-rows');
        
        if (tableBody) {
            await renderCustomersTable(db, tableBody);
        } else {
            console.warn("⚠️ لم يتم العثور على #customers-data-rows في DOM");
        }
    } catch (error) {
        console.error("❌ فشل تشغيل موديول V12:", error);
    }
}

async function renderCustomersTable(db, tableBody) {
    tableBody.innerHTML = '<tr><td colspan="17" style="text-align:center; padding:30px;">جاري المزامنة مع Firestore V12...</td></tr>';

    try {
        // تنفيذ الاستعلام بنظام الموديولات الجديد
        const customersCol = collection(db, "customers");
        const q = query(customersCol, orderBy("name"));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            tableBody.innerHTML = '<tr><td colspan="17" style="text-align:center; padding:30px;">قاعدة البيانات فارغة حالياً.</td></tr>';
            return;
        }

        let html = '';
        let index = 1;

        querySnapshot.forEach((customerDoc) => {
            const data = customerDoc.data();
            const id = customerDoc.id;

            html += `
                <tr>
                    <td class="sticky-col">${index++}</td>
                    <td class="sticky-col-name"><strong>${data.name || '---'}</strong></td>
                    <td dir="ltr">${data.phone || '---'}</td>
                    <td>${data.country_key || '+966'}</td>
                    <td>${data.email || '---'}</td>
                    <td>${data.country || 'السعودية'}</td>
                    <td>${data.city || '---'}</td>
                    <td>${data.district || '---'}</td>
                    <td>${data.street || '---'}</td>
                    <td>${data.building_no || '---'}</td>
                    <td>${data.additional_no || '---'}</td>
                    <td>${data.zip_code || '---'}</td>
                    <td>${data.po_box || '---'}</td>
                    <td>${data.createdAt ? new Date(data.createdAt.seconds * 1000).toLocaleDateString('ar-SA') : '---'}</td>
                    <td><span class="status-badge ${data.status === 'active' ? 'active' : 'inactive'}">${data.status || 'نشط'}</span></td>
                    <td><span class="badge ${data.classification === 'VIP' ? 'vip' : 'reg'}">${data.classification || 'عادي'}</span></td>
                    <td class="sticky-actions">
                        <div class="table-actions">
                            <button onclick="window.editCustomer('${id}')" class="action-btn edit"><i class="fas fa-edit"></i></button>
                            <button onclick="window.deleteCustomer('${id}')" class="action-btn delete"><i class="fas fa-trash"></i></button>
                        </div>
                    </td>
                </tr>
            `;
        });

        tableBody.innerHTML = html;
        
        // تحديث إحصائيات الواجهة
        const totalStat = document.getElementById('stat-total');
        if (totalStat) totalStat.innerText = querySnapshot.size;

    } catch (error) {
        console.error("🔴 خطأ V12 أثناء جلب البيانات:", error);
        tableBody.innerHTML = `<tr><td colspan="17" style="color:red; text-align:center;">فشل الاتصال: ${error.message}</td></tr>`;
    }
}

// تعريف الدوال العالمية للتحكم من الأزرار مباشرة
window.editCustomer = (id) => {
    if (window.openCustomerModal) window.openCustomerModal('edit', id);
};

window.deleteCustomer = async (id) => {
    if (confirm("حذف العميل نهائياً من نظام تيرا؟")) {
        try {
            const customerRef = doc(window.db, "customers", id);
            await deleteDoc(customerRef);
            // إعادة تحميل الجدول تلقائياً
            const tb = document.querySelector('#customers-data-rows');
            if (tb) renderCustomersTable(window.db, tb);
        } catch (e) {
            alert("خطأ أثناء الحذف: " + e.message);
        }
    }
};
