/**
 * js/modules/customers-ui.js
 * نسخة مستقرة مع جميع الميزات
 */

import { db } from '../core/firebase.js';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

console.log('✅ customers-ui.js تم تحميله');

// ===================== دوال مساعدة بسيطة =====================
function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

function showNotification(msg, type) {
    var toast = document.createElement('div');
    toast.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:' + (type === 'success' ? '#2ecc71' : '#e74c3c') + ';color:white;padding:12px 24px;border-radius:8px;z-index:10001';
    toast.innerHTML = msg;
    document.body.appendChild(toast);
    setTimeout(function() { toast.remove(); }, 3000);
}

// تنسيق رقم الجوال
function formatPhone(phone) {
    if (!phone) return { code: '', number: '' };
    var raw = String(phone).replace(/\s/g, '');
    if (raw.startsWith('966')) {
        var num = raw.slice(3);
        if (num.startsWith('0')) num = num.slice(1);
        return { code: '+966', number: num };
    }
    if (raw.startsWith('0')) {
        return { code: '+966', number: raw.slice(1) };
    }
    return { code: '', number: raw };
}

// ===================== جلب العملاء =====================
async function getCustomers() {
    var q = query(collection(db, "customers"), orderBy("createdAt", "desc"));
    var snap = await getDocs(q);
    var customers = [];
    snap.forEach(function(doc) {
        customers.push({ id: doc.id, ...doc.data() });
    });
    return customers;
}

// ===================== عرض الإحصائيات =====================
async function renderStats(customers) {
    var total = customers.length;
    var completed = customers.filter(function(c) {
        return c.name && c.phone && c.email && c.city;
    }).length;
    var incomplete = total - completed;
    var percent = total ? ((completed / total) * 100).toFixed(1) : 0;
    
    var statsDiv = document.getElementById('customers-stats');
    if (statsDiv) {
        statsDiv.innerHTML = `
            <div style="display:flex;flex-wrap:wrap;gap:15px;margin-bottom:20px;">
                <div style="background:#667eea;padding:15px;border-radius:12px;color:white;text-align:center;flex:1;min-width:120px;">
                    <div style="font-size:1.8rem;">${total}</div>
                    <div>إجمالي العملاء</div>
                </div>
                <div style="background:#27ae60;padding:15px;border-radius:12px;color:white;text-align:center;flex:1;min-width:120px;">
                    <div style="font-size:1.8rem;">${completed}</div>
                    <div>مكتملي البيانات</div>
                </div>
                <div style="background:#e67e22;padding:15px;border-radius:12px;color:white;text-align:center;flex:1;min-width:120px;">
                    <div style="font-size:1.8rem;">${incomplete}</div>
                    <div>غير مكتملي البيانات</div>
                </div>
                <div style="background:#3498db;padding:15px;border-radius:12px;color:white;text-align:center;flex:1;min-width:120px;">
                    <div style="font-size:1.8rem;">${percent}%</div>
                    <div>نسبة الإكمال</div>
                </div>
            </div>
        `;
    }
}

// ===================== عرض الجدول =====================
async function renderTable() {
    var tbody = document.getElementById('customers-table-body');
    if (!tbody) return;
    
    tbody.innerHTML = '<td><td colspan="9">جاري التحميل...<\/td><\/tr>';
    var customers = await getCustomers();
    await renderStats(customers);
    
    if (customers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9">لا يوجد عملاء<\/td><\/tr>';
        return;
    }
    
    var html = '';
    for (var i = 0; i < customers.length; i++) {
        var c = customers[i];
        var phoneObj = formatPhone(c.phone);
        html += '<tr>';
        html += '<td style="padding:10px;">' + (i+1) + '<\/td>';
        html += '<td style="padding:10px;">' + escapeHtml(c.name) + '<\/td>';
        html += '<td style="padding:10px;direction:ltr;">' + phoneObj.code + ' ' + phoneObj.number + '<\/td>';
        html += '<td style="padding:10px;">' + (c.email || '-') + '<\/td>';
        html += '<td style="padding:10px;">' + (c.city || '-') + '<\/td>';
        html += '<td style="padding:10px;">' + (c.district || '-') + '<\/td>';
        html += '<td style="padding:10px;">' + (c.street || '-') + '<\/td>';
        html += '<td style="padding:10px;">' + (c.buildingNo || '-') + '<\/td>';
        html += '<td style="padding:10px;text-align:center;">';
        html += '<button class="edit-customer" data-id="' + c.id + '" style="color:#f39c12;background:none;border:none;cursor:pointer;margin-left:8px;"><i class="fas fa-edit"><\/i><\/button>';
        html += '<button class="delete-customer" data-id="' + c.id + '" style="color:#e74c3c;background:none;border:none;cursor:pointer;margin-left:8px;"><i class="fas fa-trash-alt"><\/i><\/button>';
        html += '<button class="print-customer" data-id="' + c.id + '" style="color:#3498db;background:none;border:none;cursor:pointer;"><i class="fas fa-print"><\/i><\/button>';
        html += '<\/td><\/tr>';
    }
    tbody.innerHTML = html;
    
    // ربط الأحداث
    document.querySelectorAll('.edit-customer').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var id = btn.getAttribute('data-id');
            var customer = customers.find(function(c) { return c.id === id; });
            if (customer) showModal('edit', customer);
        });
    });
    
    document.querySelectorAll('.delete-customer').forEach(function(btn) {
        btn.addEventListener('click', async function() {
            if (confirm('هل تريد حذف هذا العميل؟')) {
                await deleteDoc(doc(db, "customers", btn.getAttribute('data-id')));
                showNotification('تم الحذف');
                await renderTable();
            }
        });
    });
    
    document.querySelectorAll('.print-customer').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var id = btn.getAttribute('data-id');
            var customer = customers.find(function(c) { return c.id === id; });
            if (customer) printCard(customer);
        });
    });
}

// ===================== طباعة =====================
function printCard(customer) {
    var phoneObj = formatPhone(customer.phone);
    var win = window.open('', '_blank');
    win.document.write(`
        <html dir="rtl"><head><meta charset="UTF-8"><title>بيانات العميل</title>
        <style>
            body{font-family:Tajawal;padding:20px}
            .card{border:1px solid #ddd;border-radius:12px;padding:20px;max-width:500px;margin:auto}
            h3{color:#e67e22}
            .info{margin:10px 0}
            .label{font-weight:bold;width:120px;display:inline-block}
        </style>
        </head>
        <body>
        <div class="card">
            <h3>بيانات العميل</h3>
            <div class="info"><span class="label">الاسم:</span> ${escapeHtml(customer.name)}</div>
            <div class="info"><span class="label">الجوال:</span> ${phoneObj.code} ${phoneObj.number}</div>
            <div class="info"><span class="label">البريد:</span> ${customer.email || '-'}</div>
            <div class="info"><span class="label">المدينة:</span> ${customer.city || '-'}</div>
            <div class="info"><span class="label">الحي:</span> ${customer.district || '-'}</div>
            <div class="info"><span class="label">الشارع:</span> ${customer.street || '-'}</div>
            <div class="info"><span class="label">رقم المبنى:</span> ${customer.buildingNo || '-'}</div>
            <div class="info"><span class="label">الرمز البريدي:</span> ${customer.poBox || '-'}</div>
        </div>
        <script>window.print();<\/script>
        </body>
        </html>
    `);
    win.document.close();
}

// ===================== تصدير CSV =====================
async function exportCSV() {
    var customers = await getCustomers();
    if (!customers.length) return;
    var headers = ['الاسم', 'الجوال', 'البريد', 'المدينة', 'الحي', 'الشارع', 'رقم المبنى', 'الرمز البريدي'];
    var rows = [headers];
    for (var c of customers) {
        rows.push([c.name, c.phone, c.email, c.city, c.district, c.street, c.buildingNo, c.poBox]);
    }
    var csv = rows.map(row => row.map(cell => '"' + (cell || '') + '"').join(',')).join('\n');
    var blob = new Blob(["\uFEFF" + csv], { type: 'text/csv' });
    var link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'customers.csv';
    link.click();
    URL.revokeObjectURL(link.href);
    showNotification('تم التصدير');
}

// ===================== نموذج الإضافة والتعديل =====================
function showModal(mode, customer) {
    var modal = document.getElementById('customer-modal');
    var title = document.getElementById('modal-title');
    var form = document.getElementById('customer-form');
    if (mode === 'add') {
        title.innerText = 'إضافة عميل جديد';
        form.reset();
        document.getElementById('edit-id').value = '';
    } else {
        title.innerText = 'تعديل بيانات العميل';
        document.getElementById('edit-id').value = customer.id;
        document.getElementById('c-name').value = customer.name || '';
        document.getElementById('c-phone').value = customer.phone || '';
        document.getElementById('c-email').value = customer.email || '';
        document.getElementById('c-city').value = customer.city || '';
        document.getElementById('c-district').value = customer.district || '';
        document.getElementById('c-street').value = customer.street || '';
        document.getElementById('c-building').value = customer.buildingNo || '';
        document.getElementById('c-additional').value = customer.additionalNo || '';
        document.getElementById('c-pobox').value = customer.poBox || '';
        document.getElementById('c-country').value = customer.country || 'السعودية';
    }
    modal.style.display = 'flex';
}

function closeModal() {
    document.getElementById('customer-modal').style.display = 'none';
}

async function saveCustomer(e) {
    e.preventDefault();
    var id = document.getElementById('edit-id').value;
    var data = {
        name: document.getElementById('c-name').value,
        phone: document.getElementById('c-phone').value,
        email: document.getElementById('c-email').value,
        city: document.getElementById('c-city').value,
        district: document.getElementById('c-district').value,
        street: document.getElementById('c-street').value,
        buildingNo: document.getElementById('c-building').value,
        additionalNo: document.getElementById('c-additional').value,
        poBox: document.getElementById('c-pobox').value,
        country: document.getElementById('c-country').value,
        updatedAt: serverTimestamp()
    };
    try {
        if (id) {
            await updateDoc(doc(db, "customers", id), data);
            showNotification('تم التحديث');
        } else {
            data.createdAt = serverTimestamp();
            await addDoc(collection(db, "customers"), data);
            showNotification('تمت الإضافة');
        }
        closeModal();
        await renderTable();
    } catch(err) {
        showNotification('خطأ', 'error');
    }
}

// ===================== الدالة الرئيسية =====================
export async function initCustomers(container) {
    if (!container) return;
    
    container.innerHTML = `
        <div style="padding:20px">
            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;margin-bottom:15px">
                <h2><i class="fas fa-users"></i> إدارة العملاء</h2>
                <div>
                    <button id="export-csv" style="background:#27ae60;color:white;border:none;padding:8px 16px;border-radius:8px;margin-left:10px;cursor:pointer"><i class="fas fa-file-excel"></i> تصدير CSV</button>
                    <button id="add-customer" style="background:#e67e22;color:white;border:none;padding:8px 16px;border-radius:8px;cursor:pointer"><i class="fas fa-plus"></i> إضافة عميل</button>
                </div>
            </div>
            <div id="customers-stats"></div>
            <input type="text" id="search-input" placeholder="بحث..." style="width:100%;max-width:300px;padding:8px;margin-bottom:15px;border:1px solid #ddd;border-radius:8px">
            <div style="overflow-x:auto">
                <table style="width:100%;border-collapse:collapse;background:white">
                    <thead style="background:#f8f9fa">
                        <tr><th>#</th><th>الاسم</th><th>الجوال</th><th>البريد</th><th>المدينة</th><th>الحي</th><th>الشارع</th><th>رقم المبنى</th><th>الإجراءات</th></tr>
                    </thead>
                    <tbody id="customers-table-body"><tr><td colspan="9">جاري التحميل...<\/td><\/tr><\/tbody>
                </table>
            </div>
        </div>
        <div id="customer-modal" style="display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);justify-content:center;align-items:center;z-index:1000">
            <div style="background:white;width:90%;max-width:600px;padding:20px;border-radius:12px">
                <h3 id="modal-title">إضافة عميل</h3>
                <form id="customer-form">
                    <input type="hidden" id="edit-id">
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
                        <div><label>الاسم *</label><input type="text" id="c-name" required style="width:100%"></div>
                        <div><label>الجوال *</label><input type="text" id="c-phone" required style="width:100%"></div>
                        <div><label>البريد</label><input type="email" id="c-email" style="width:100%"></div>
                        <div><label>المدينة</label><input type="text" id="c-city" style="width:100%"></div>
                        <div><label>الحي</label><input type="text" id="c-district" style="width:100%"></div>
                        <div><label>الشارع</label><input type="text" id="c-street" style="width:100%"></div>
                        <div><label>رقم المبنى</label><input type="text" id="c-building" style="width:100%"></div>
                        <div><label>الرقم الإضافي</label><input type="text" id="c-additional" style="width:100%"></div>
                        <div><label>الرمز البريدي</label><input type="text" id="c-pobox" style="width:100%"></div>
                        <div><label>الدولة</label><input type="text" id="c-country" value="السعودية" style="width:100%"></div>
                    </div>
                    <div style="margin-top:20px;display:flex;gap:10px">
                        <button type="submit" style="background:#27ae60;color:white;padding:8px;border:none;border-radius:8px;cursor:pointer">حفظ</button>
                        <button type="button" id="close-modal" style="background:#95a5a6;color:white;padding:8px;border:none;border-radius:8px;cursor:pointer">إلغاء</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.getElementById('add-customer').onclick = () => showModal('add');
    document.getElementById('close-modal').onclick = closeModal;
    document.getElementById('customer-form').onsubmit = saveCustomer;
    document.getElementById('export-csv').onclick = exportCSV;
    
    await renderTable();
    
    document.getElementById('search-input').addEventListener('input', function(e) {
        var term = e.target.value.toLowerCase();
        var rows = document.querySelectorAll('#customers-table-body tr');
        rows.forEach(function(row) {
            var text = row.innerText.toLowerCase();
            row.style.display = text.includes(term) ? '' : 'none';
        });
    });
}

export default { initCustomers };
