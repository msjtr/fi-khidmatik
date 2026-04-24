/**
 * js/modules/customers-core.js
 * موديول إدارة العملاء - Tera Gateway
 */

import { db } from '../core/config.js';
import { 
    collection, 
    getDocs, 
    doc, 
    getDoc, 
    query, 
    orderBy 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// استيراد واجهة المستخدم
import { UI } from './customers-ui.js';

/**
 * تهيئة موديول العملاء
 * @param {HTMLElement} container - الحاوية التي سيتم عرض الواجهة بداخلها
 */
export async function initCustomers(container) {
    if (!container) return;

    // بناء الهيكل الأساسي من ملف الـ UI
    container.innerHTML = UI.renderMainLayout();

    // ربط أحداث البحث
    const searchInput = document.getElementById('customer-search');
    if (searchInput) {
        searchInput.oninput = (e) => filterTable(e.target.value);
    }

    // ربط زر الإضافة (يفترض وجود دالة window.openCustomerModal في المشروع)
    const addBtn = document.getElementById('add-customer-btn');
    if (addBtn) {
        addBtn.onclick = () => {
            if (typeof window.openCustomerModal === 'function') {
                window.openCustomerModal();
            } else {
                console.warn("دالة إضافة عميل غير معرفة في النطاق العام");
            }
        };
    }

    // تحميل البيانات
    await loadCustomers();
}

/**
 * جلب العملاء من Firestore وعرضهم
 */
async function loadCustomers() {
    const listBody = document.getElementById('customers-list');
    if (!listBody) return;

    try {
        const q = query(collection(db, "customers"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        
        let stats = { total: 0, complete: 0, incomplete: 0 };
        let rowsHtml = '';

        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const id = docSnap.id;
            stats.total++;
            
            // معيار اكتمال البيانات: وجود الجوال والمدينة
            const isComplete = data.phone && data.city;
            if (isComplete) stats.complete++; else stats.incomplete++;

            // توليد سطر الجدول باستخدام الـ UI Template
            rowsHtml += UI.renderCustomerRow(id, data);
        });

        listBody.innerHTML = rowsHtml;

        // تحديث أرقام الإحصائيات في الواجهة
        updateStatsUI(stats);

    } catch (error) {
        console.error("خطأ أثناء تحميل بيانات العملاء:", error);
        listBody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:20px; color:red;">حدث خطأ أثناء تحميل البيانات</td></tr>';
    }
}

/**
 * تحديث لوحة الإحصائيات
 */
function updateStatsUI(stats) {
    const totalEl = document.getElementById('stat-total');
    const completeEl = document.getElementById('stat-complete');
    const incompleteEl = document.getElementById('stat-incomplete');

    if (totalEl) totalEl.innerText = stats.total;
    if (completeEl) completeEl.innerText = stats.complete;
    if (incompleteEl) incompleteEl.innerText = stats.incomplete;
}

/**
 * دالة جلب بيانات عميل واحد (تستخدمها صفحة الطباعة)
 */
export async function getCustomerById(id) {
    try {
        const docSnap = await getDoc(doc(db, "customers", id));
        return docSnap.exists() ? docSnap.data() : null;
    } catch (e) {
        console.error("Error fetching customer record:", e);
        return null;
    }
}

/**
 * فتح نافذة الطباعة والترجمة
 */
window.previewPrint = (id) => {
    // فتح الرابط في نافذة جديدة بمسار صفحة الطباعة المستقلة
    window.open(`print-card.html?id=${id}`, '_blank', 'width=1100,height=900,scrollbars=yes');
};

/**
 * نظام البحث السريع في الجدول
 */
function filterTable(value) {
    const rows = document.querySelectorAll('.customer-row');
    const searchVal = value.toLowerCase();
    
    rows.forEach(row => {
        const text = row.innerText.toLowerCase();
        row.style.display = text.includes(searchVal) ? '' : 'none';
    });
}
