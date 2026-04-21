// customers-ui.js - أبسط نسخة ممكنة

import { db } from '../core/firebase.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

console.log('customers-ui.js تم تحميله');

export async function initCustomers(container) {
    console.log('initCustomers بدأت');
    
    if (!container) {
        console.error('container غير موجود');
        return;
    }
    
    container.innerHTML = '<div style="padding:20px"><h2>العملاء</h2><div id="custList">جاري التحميل...</div></div>';
    
    try {
        const snapshot = await getDocs(collection(db, "customers"));
        const listDiv = document.getElementById('custList');
        
        if (snapshot.empty) {
            listDiv.innerHTML = '<p>لا يوجد عملاء</p>';
            return;
        }
        
        let html = '<ul>';
        snapshot.forEach(function(doc) {
            var data = doc.data();
            html += '<li><strong>' + data.name + '</strong> - ' + data.phone + ' - ' + (data.city || '') + '</li>';
        });
        html += '</ul>';
        listDiv.innerHTML = html;
        
    } catch (error) {
        console.error('خطأ:', error);
        document.getElementById('custList').innerHTML = '<p style="color:red">خطأ: ' + error.message + '</p>';
    }
}
