// js/modules/customers.js
import { db } from '../core/firebase.js';
import { collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

export async function initCustomers(container) {
    container.innerHTML = `<h2><i class="fas fa-users"></i> العملاء</h2><div id="customers-list">جاري التحميل...</div>`;
    await loadCustomers();
}

async function loadCustomers() {
    const container = document.getElementById('customers-list');
    try {
        const q = query(collection(db, "customers"), orderBy("name", "asc"));
        const snapshot = await getDocs(q);
        const customers = snapshot.docs.map(doc => doc.data());
        container.innerHTML = customers.map(c => `
            <div class="customer-card" style="padding:10px; border-bottom:1px solid #eee;">
                <strong>${c.name}</strong> - ${c.phone}
            </div>
        `).join('');
    } catch (e) { container.innerHTML = "خطأ في الاتصال"; }
}
