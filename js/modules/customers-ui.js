/**
 * js/modules/customers-ui.js
 */

import { db } from '../core/firebase.js';
import { collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

console.log('customers-ui.js تم تحميله');

async function loadCustomers() {
    try {
        const q = query(collection(db, "customers"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        var customers = [];
        snapshot.forEach(function(doc) {
            customers.push({ id: doc.id, data: doc.data() });
        });
        return customers;
    } catch(e) {
        console.error(e);
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

async function showCustomers(container) {
    var customers = await loadCustomers();
    if (!customers.length) {
        container.innerHTML = '<div style="padding: 40px; text-align: center;">لا يوجد عملاء</div>';
        return;
    }
    var html = '<table style="width: 100%; border-collapse: collapse; background: white;">';
    html += '<thead style="background: #f8f9fa;"><tr><th style="padding: 12px;">#</th><th style="padding: 12px;">الاسم</th><th style="padding: 12px;">الجوال</th><th style="padding: 12px;">المدينة</th></tr></thead><tbody>';
    for (var i = 0; i < customers.length; i++) {
        var c = customers[i].data;
        html += '<tr><td style="padding: 12px;">' + (i+1) + '</td>';
        html += '<td style="padding: 12px;">' + escapeHtml(c.name) + '</td>';
        html += '<td style="padding: 12px;">' + escapeHtml(c.phone) + '</td>';
        html += '<td style="padding: 12px;">' + (c.city || '-') + '</td></tr>';
    }
    html += '</tbody></table>';
    container.innerHTML = html;
}

export async function initCustomers(container) {
    console.log('initCustomers called');
    if (!container) return;
    container.innerHTML = '<div style="padding: 20px;"><h2>العملاء</h2><div id="customers-list" style="margin-top: 20px;"><div style="text-align: center;">جاري التحميل...</div></div></div>';
    var listDiv = document.getElementById('customers-list');
    if (listDiv) await showCustomers(listDiv);
}

export default { initCustomers };
