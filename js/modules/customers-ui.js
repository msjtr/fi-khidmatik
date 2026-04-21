/**
 * js/modules/customers-ui.js
 */

import { db } from '../core/firebase.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

console.log('customers-ui.js تم تحميله');

export async function initCustomers(container) {
    console.log('initCustomers بدأت');
    
    if (!container) {
        console.error('container غير موجود');
        return;
    }
    
    container.innerHTML = '<div style="padding:20px"><h2>العملاء</h2><div id="customersList">جاري التحميل...</div></div>';
    
    try {
        const snapshot = await getDocs(collection(db, "customers"));
        const div = document.getElementById('customersList');
        
        if (snapshot.empty) {
            div.innerHTML = '<p>لا يوجد عملاء</p>';
            return;
        }
        
        let html = '<table border="1" style="border-collapse:collapse;width:100%">';
        html += '<tr><th>#</th><th>الاسم</th><th>الجوال</th><th>البريد</th></tr>';
        
        let index = 1;
        snapshot.forEach((doc) => {
            const data = doc.data();
            html += '<tr>';
            html += '<td>' + index + '</td>';
            html += '<td>' + (data.name || '-') + '</td>';
            html += '<td>' + (data.phone || '-') + '</td>';
            html += '<td>' + (data.email || '-') + '</td>';
            html += '</tr>';
            index++;
        });
        
        html += '</table>';
        div.innerHTML = html;
        
    } catch (error) {
        console.error('خطأ:', error);
        document.getElementById('customersList').innerHTML = '<p style="color:red">خطأ: ' + error.message + '</p>';
    }
}

export default { initCustomers };
