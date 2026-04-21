import { db } from '../core/firebase.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

console.log('✅ customers-ui.js loaded');

export async function initCustomers(container) {
    console.log('initCustomers called');
    if (!container) return;
    container.innerHTML = '<div style="padding:20px"><h2>العملاء</h2><div id="customersList">جار التحميل...</div></div>';
    try {
        const snap = await getDocs(collection(db, "customers"));
        const div = document.getElementById('customersList');
        if (snap.empty) {
            div.innerHTML = '<p>لا يوجد عملاء</p>';
            return;
        }
        let html = '<table border="1" style="border-collapse:collapse;width:100%"><tr><th>#</th><th>الاسم</th><th>الجوال</th><th>البريد</th></tr>';
        let i = 1;
        snap.forEach(doc => {
            const data = doc.data();
            html += `<tr><td>${i}</td><td>${data.name || '-'}</td><td>${data.phone || '-'}</td><td>${data.email || '-'}</td></tr>`;
            i++;
        });
        html += '</table>';
        div.innerHTML = html;
    } catch(e) {
        div.innerHTML = '<p style="color:red">خطأ: ' + e.message + '</p>';
    }
}
