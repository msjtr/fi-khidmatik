// js/modules/customers.js

// التعديل الضروري: العودة للخلف خطوة ثم الدخول لمجلد core
// لأن هذا الملف موجود في js/modules/ وقاعدة البيانات في js/core/
import { db } from '../core/firebase.js';

// الاستيراد من مكتبة جوجل (رابط كامل)
import { 
    collection, 
    getDocs, 
    addDoc, 
    query, 
    orderBy 
} from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

let allCustomers = [];

/**
 * تهيئة واجهة العملاء
 */
export async function initCustomers(container) {
    container.innerHTML = `
        <div class="module-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
            <h2><i class="fas fa-users"></i> إدارة العملاء</h2>
            <button id="btn-add-customer" class="btn-primary" style="padding:10px 20px; border-radius:8px; cursor:pointer;">
                <i class="fas fa-plus"></i> إضافة عميل جديد
            </button>
        </div>
        
        <div class="search-bar" style="margin-bottom:20px;">
            <input type="text" id="search-customer" placeholder="بحث باسم العميل أو رقم الجوال..." 
                   style="width:100%; padding:12px; border-radius:10px; border:1px solid #ddd; outline:none;">
        </div>

        <div id="customers-list" class="grid-container">
            <p style="text-align:center; padding:40px;">جاري تحميل بيانات العملاء...</p>
        </div>
    `;

    document.getElementById('search-customer')?.addEventListener('input', filterCustomers);
    document.getElementById('btn-add-customer')?.addEventListener('click', () => alert('سيتم تفعيل إضافة العميل قريباً'));

    await loadCustomers();
}

/**
 * جلب العملاء من Firestore
 */
async function loadCustomers() {
    const listContainer = document.getElementById('customers-list');
    try {
        const q = query(collection(db, "customers"), orderBy("name", "asc"));
        const snapshot = await getDocs(q);
        allCustomers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderCustomers(allCustomers);
    } catch (error) {
        console.error("Firestore Error:", error);
        if (listContainer) listContainer.innerHTML = `<p style="color:red; text-align:center;">فشل الاتصال بقاعدة البيانات.</p>`;
    }
}

/**
 * رندرة بطاقات العملاء
 */
function renderCustomers(customers) {
    const container = document.getElementById('customers-list');
    if (!container) return;

    if (customers.length === 0) {
        container.innerHTML = '<p style="text-align:center; padding:20px;">لا يوجد عملاء مسجلين حالياً.</p>';
        return;
    }

    container.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px;">
            ${customers.map(customer => `
                <div class="customer-card" style="background:white; padding:20px; border-radius:15px; box-shadow:0 4px 10px rgba(0,0,0,0.05); border-right:4px solid #3498db;">
                    <h3 style="margin:0 0 10px 0; color:#2c3e50;">${customer.name || 'عميل جديد'}</h3>
                    <p style="margin:5px 0; color:#7f8c8d; font-size:0.9rem;"><i class="fas fa-phone"></i> ${customer.phone || 'لا يوجد رقم'}</p>
                    <p style="margin:5px 0; color:#7f8c8d; font-size:0.9rem;"><i class="fas fa-map-marker-alt"></i> ${customer.address || 'حائل'}</p>
                </div>
            `).join('')}
        </div>
    `;
}

/**
 * فلترة البحث المحلي
 */
function filterCustomers(e) {
    const term = e.target.value.toLowerCase();
    const filtered = allCustomers.filter(c => 
        (c.name || '').toLowerCase().includes(term) || 
        (c.phone || '').includes(term)
    );
    renderCustomers(filtered);
}
