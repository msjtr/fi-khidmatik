import { db } from '../core/firebase.js';
import { collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export async function initCustomers(container) {
    container.innerHTML = `
        <div style="padding:20px; font-family: 'Tajawal', sans-serif;">
            <h2 style="color:#2c3e50; margin-bottom:20px;"><i class="fas fa-users"></i> قاعدة بيانات عملاء تيرا</h2>
            <div id="customers-grid" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap:15px;">
                <div style="text-align:center; padding:40px;">جاري تحميل العملاء...</div>
            </div>
        </div>
    `;

    await loadCustomers();
}

async function loadCustomers() {
    const target = document.getElementById('customers-grid');
    try {
        const snap = await getDocs(collection(db, "customers"));
        
        target.innerHTML = snap.docs.map(doc => {
            const c = doc.data();
            return `
                <div style="background:white; padding:20px; border-radius:15px; box-shadow:0 4px 10px rgba(0,0,0,0.03); border:1px solid #eee;">
                    <div style="display:flex; align-items:center; margin-bottom:15px;">
                        <div style="width:45px; height:45px; background:#3498db; color:white; border-radius:50%; display:flex; align-items:center; justify-content:center; margin-left:12px;">
                            <i class="fas fa-user-tie"></i>
                        </div>
                        <div>
                            <h4 style="margin:0; color:#2c3e50;">${c.name}</h4>
                            <small style="color:#95a5a6;">${c.email || ''}</small>
                        </div>
                    </div>
                    <div style="font-size:0.9rem; color:#34495e;">
                        <div style="margin-bottom:6px;"><i class="fas fa-phone" style="width:18px; color:#27ae60;"></i> ${c.phone}</div>
                        <div style="margin-bottom:6px;"><i class="fas fa-map-marker-alt" style="width:18px; color:#e74c3c;"></i> ${c.city} - ${c.district || ''}</div>
                        <div style="font-size:0.8rem; color:#7f8c8d;"><i class="fas fa-road" style="width:18px;"></i> ${c.street || ''}</div>
                    </div>
                </div>
            `;
        }).join('');
    } catch (err) {
        target.innerHTML = "فشل تحميل قائمة العملاء.";
    }
}
