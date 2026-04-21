import { db } from '../core/firebase.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

console.log('✅ customers-ui.js loaded (simple)');

export async function initCustomers(container) {
    console.log('initCustomers called');
    if (!container) return;
    container.innerHTML = '<div style="padding:20px"><h2>العملاء</h2><div id="simpleList">جاري التحميل...</div></div>';
    try {
        const snapshot = await getDocs(collection(db, "customers"));
        const div = document.getElementById('simpleList');
        if (snapshot.empty) {
            div.innerHTML = '<p>⚠️ لا يوجد عملاء</p>';
            return;
        }
        let html = '<ul>';
        snapshot.forEach(doc => {
            const data = doc.data();
            html += `<li><strong>${data.name || 'بدون اسم'}</strong> - ${data.phone || 'لا يوجد جوال'}</li>`;
        });
        html += '</ul>';
        div.innerHTML = html;
    } catch (err) {
        div.innerHTML = `<p style="color:red">خطأ: ${err.message}</p>`;
    }
}
