// js/modules/customers.js

import { db } from '../core/firebase.js';
import { collection, getDocs, addDoc, query, orderBy } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

let allCustomers = [];

export async function initCustomers(container) {
    // تحميل واجهة القسم (يمكنك وضعها في ملف HTML منفصل أو كتابتها هنا)
    container.innerHTML = `
        <div class="module-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
            <h2><i class="fas fa-users"></i> إدارة العملاء</h2>
            <button id="btn-add-customer" class="btn-primary" style="padding:10px 20px; border-radius:8px;">
                <i class="fas fa-plus"></i> إضافة عميل جديد
            </button>
        </div>
        
        <div class="search-bar" style="margin-bottom:20px;">
            <input type="text" id="search-customer" placeholder="بحث باسم العميل أو رقم الجوال..." 
                   style="width:100%; padding:12px; border-radius:10px; border:1px solid #ddd;">
        </div>

        <div id="customers-list" class="grid-container">
            <p style="text-align:center; padding:40px;">جاري تحميل بيانات العملاء...</p>
        </div>
    `;

    // ربط الأحداث
    document.getElementById('search-customer')?.addEventListener('input', filterCustomers);
    document.getElementById('btn-add-customer')?.addEventListener('click', () => alert('قريباً: فتح نافذة إضافة عميل'));

    // تحميل البيانات من Firebase
    await loadCustomers();
}

async function loadCustomers() {
    const listContainer = document.getElementById('customers-list');
    
    try {
        const q = query(collection(db, "customers"), orderBy("name", "asc"));
        const snapshot = await getDocs(q);
        
        allCustomers = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        renderCustomers(allCustomers);
    } catch (error) {
        console.error("خطأ في جلب العملاء:", error);
        if (listContainer) {
            listContainer.innerHTML = `<p style="color:red; text-align:center;">فشل تحميل البيانات. تأكد من إعدادات Firestore.</p>`;
        }
    }
}

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
                <div class="customer-card" style="background:white; padding:20px; border-radius:15px; shadow:0 4px 10px rgba(0,0,0,0.05); border-right:4px solid #3498db;">
                    <h3 style="margin:0 0 10px 0; color:#2c3e50;">${customer.name || 'عميل غير معروف'}</h3>
                    <p style="margin:5px 0; color:#7f8c8d;"><i class="fas fa-phone"></i> ${customer.phone || 'بدون رقم'}</p>
                    <p style="margin:5px 0; color:#7f8c8d;"><i class="fas fa-map-marker-alt"></i> ${customer.address || 'حائل'}</p>
                    <div style="margin-top:15px; display:flex; gap:10px;">
                        <button class="btn-small" title="تعديل"><i class="fas fa-edit"></i></button>
                        <button class="btn-small" style="color:red;" title="حذف"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function filterCustomers(e) {
    const term = e.target.value.toLowerCase();
    const filtered = allCustomers.filter(c => 
        (c.name || '').toLowerCase().includes(term) || 
        (c.phone || '').includes(term)
    );
    renderCustomers(filtered);
}
