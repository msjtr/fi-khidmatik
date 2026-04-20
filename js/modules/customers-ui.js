/**
 * js/modules/customers-ui.js
 * جلب العملاء من Firebase
 */

import { db } from '../core/firebase.js';
import { collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

console.log('customers-ui.js تم تحميله');

async function loadCustomers() {
    console.log('جلب العملاء...');
    try {
        const q = query(collection(db, "customers"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        console.log('عدد العملاء:', querySnapshot.size);
        
        var customers = [];
        querySnapshot.forEach(function(doc) {
            customers.push({ id: doc.id, data: doc.data() });
        });
        return customers;
    } catch (error) {
        console.error('خطأ:', error);
        return [];
    }
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

async function displayCustomers(container) {
    var customers = await loadCustomers();
    
    if (!customers || customers.length === 0) {
        container.innerHTML = '<div style="padding: 40px; text-align: center;">لا يوجد عملاء</div>';
        return;
    }
    
    var html = '<div style="overflow-x: auto;"><table style="width: 100%; border-collapse: collapse; background: white; border-radius: 12px;">';
    html += '<thead style="background: #f8f9fa;"><tr>';
    html += '<th style="padding: 12px;">#</th>';
    html += '<th style="padding: 12px;">الاسم</th>';
    html += '<th style="padding: 12px;">الجوال</th>';
    html += '<th style="padding: 12px;">البريد</th>';
    html += '<th style="padding: 12px;">المدينة</th>';
    html += '</tr></thead><tbody>';
    
    for (var i = 0; i < customers.length; i++) {
        var c = customers[i].data;
        html += '<tr style="border-bottom: 1px solid #f1f5f9;">';
        html += '<td style="padding: 12px;">' + (i + 1) + '</td>';
        html += '<td style="padding: 12px;">' + escapeHtml(c.name) + '</td>';
        html += '<td style="padding: 12px;">' + escapeHtml(c.phone) + '</td>';
        html += '<td style="padding: 12px;">' + (c.email || '-') + '</td>';
        html += '<td style="padding: 12px;">' + (c.city || '-') + '</td>';
        html += '</tr>';
    }
    
    html += '</tbody></table></div>';
    container.innerHTML = html;
}

export async function initCustomers(container) {
    console.log('initCustomers تم استدعاؤها');
    if (!container) return;
    
    container.innerHTML = '<div style="padding: 20px;"><h2>العملاء</h2><div id="customers-list" style="margin-top: 20px;"><div style="text-align: center;">جاري التحميل...</div></div></div>';
    
    var listContainer = document.getElementById('customers-list');
    if (listContainer) {
        await displayCustomers(listContainer);
    }
}

export default { initCustomers };
