/**
 * js/modules/customers-ui.js
 * موديول العملاء - نسخة نظيفة ومبسطة
 */

import { db } from '../core/firebase.js';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

console.log('✅ customers-ui.js تم تحميله');

// ===================== دوال مساعدة =====================
function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

function showNotification(message, type) {
    var toast = document.createElement('div');
    var bgColor = (type === 'success') ? '#2ecc71' : '#e74c3c';
    toast.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:' + bgColor + ';color:white;padding:12px 24px;border-radius:8px;z-index:10001;font-family:Tajawal;direction:rtl';
    toast.innerHTML = '<i class="fas ' + ((type === 'success') ? 'fa-check-circle' : 'fa-exclamation-triangle') + '"></i> ' + message;
    document.body.appendChild(toast);
    setTimeout(function() { toast.remove(); }, 3000);
}

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

function isCustomerComplete(customer) {
    return customer.name && customer.name.trim() !== '';
}

// ===================== جلب العملاء =====================
async function getCustomers() {
    try {
        var q = query(collection(db, "customers"), orderBy("createdAt", "desc"));
        var snap = await getDocs(q);
        var customers = [];
        snap.forEach(function(doc) {
            customers.push({ id: doc.id, ...doc.data() });
        });
        return customers;
    } catch(e) {
        console.error(e);
        return [];
    }
}

// ===================== عرض الإحصائيات =====================
async function renderStats(customers) {
    var total = customers.length;
    var completed = customers.filter(isCustomerComplete).length;
    var incomplete = total - completed;
    var percent = total ? ((completed / total) * 100).toFixed(1) : 0;
    
    var statsDiv = document.getElementById('customers-stats');
    if (!statsDiv) return;
    
    statsDiv.innerHTML = `
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:15px;margin-bottom:20px;">
            <div style="background:#667eea;padding:15px;border-radius:12px;color:white;text-align:center">
                <div style="font-size:2rem">${total}</div>
                <div>إجمالي العملاء</div>
            </div>
            <div style="background:#27ae60;padding:15px;border-radius:12px;color:white;text-align:center">
                <div style="font-size:2rem">${completed}</div>
                <div>مكتملي البيانات</div>
            </div>
            <div style="background:#e67e22;padding:15px;border-radius:12px;color:white;text-align:center">
                <div style="font-size:2rem">${incomplete}</div>
                <div>غير مكتملي البيانات</div>
            </div>
            <div style="background:#3498db;padding:15px;border-radius:12px;color:white;text-align:center">
                <div style="font-size:2rem">${percent}%</div>
                <div>نسبة الإكمال</div>
            </div>
        </div>
    `;
}

// ===================== عرض الجدول =====================
async function renderTable() {
    var tbody = document.getElementById('customers-table-body');
    if (!tbody) return;
    
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;">جاري التحميل...<\/td><\/tr>';
    var customers = await getCustomers();
    await renderStats(customers);
    
    if (customers.length === 0) {
        tbody.innerHTML = '<td><td colspan="8" style="text-align:center;">لا يوجد عملاء<\/td><\/tr>';
        return;
    }
    
    var html = '';
    for (var i = 0; i < customers.length; i++) {
        var c = customers[i];
        var phoneObj = formatPhone(c.phone);
        var isComp = isCustomerComplete(c);
        var rowBg = isComp ? '' : 'style="background:#fff9e6;"';
        
        html += '<tr style="border-bottom:1px solid #f1f5f9;" ' + rowBg + '>';
        html += '<td style="padding:12px;">' + (i+1) + '<\/td>';
        html += '<td style="padding:12px;font-weight:bold;">' + escapeHtml(c.name) + '<\/td>';
        html += '<td style="padding:12px;">' + phoneObj.code + ' ' + phoneObj.number + '<\/td>';
        html += '<td style="padding:12px;">' + (c.email || '-') + '<\/td>';
        html += '<td style="padding:12px;">' + (c.city || '-') + '<\/td>';
        html += '<td style="padding:12px;">' + (c.district || '-') + '<\/td>';
        html += '<td style="padding:12px;">' + (c.street || '-') + '<\/td>';
        html += '<td style="padding:12px;text-align:center;">';
        html += '<button class="edit-customer" data-id="' + c.id + '" style="color:#f39c12;background:none;border:none;cursor:pointer;margin-left:8px;"><i class="fas fa-edit"><\/i><\/button>';
        html += '<button class="delete-customer" data-id="' + c.id + '" style="color:#e74c3c;background:none;border:none;cursor:pointer;margin-left:8px;"><i class="fas fa-trash-alt"><\/i><\/button>';
        html += '<button class="print-customer" data-id="' + c.id + '" style="color:#3498db;background:none;border:none;cursor:pointer;"><i class="fas fa-print"><\/i><\/button>';
        html += '<\/td>';
        html += '<\/tr>';
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
            if (confirm('هل أنت متأكد من حذف هذا العميل؟')) {
                await deleteDoc(doc(db, "customers", btn.getAttribute('data-id')));
                showNotification('تم حذف العميل', 'success');
                await renderTable();
            }
        });
    });
    
    document.querySelectorAll('.print-customer').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var id = btn.getAttribute('data-id');
            var customer = customers.find(function(c) { return c.id === id; });
            if (customer) printCustomer(customer);
        });
    });
}

// ===================== طباعة =====================
function printCustomer(customer) {
    var phoneObj = formatPhone(customer.phone);
    var win = window.open('', '_blank', 'width=600,height=500');
    win.document.write(`
        <!DOCTYPE html>
        <html dir="rtl">
        <head><meta charset="UTF-8"><title>بيانات العميل</title>
        <style>
            body{font-family:Tajawal,Arial;padding:20px}
            .card{border:1px solid #ddd;border-radius:12px;padding:20px;max-width:500px;margin:auto}
            h3{color:#e67e22;border-bottom:2px solid #e67e22;padding-bottom:5px}
            .info{margin:10px 0}
            .label{font-weight:bold;display:inline-block;width:120px}
        </style>
        </head>
        <body>
        <div class="card">
            <h3>بطاقة بيانات العميل</h3>
            <div class="info"><span class="label">الاسم:</span> ${escapeHtml(customer.name)}</div>
            <div class="info"><span class="label">الجوال:</span> ${phoneObj.code} ${phoneObj.number}</div>
            <div class="info"><span class="label">البريد:</span> ${customer.email || '-'}</div>
            <div class="info"><span class="label">الدولة:</span> ${customer.country || '-'}</div>
            <div class="info"><span class="label">المدينة:</span> ${customer.city || '-'}</div>
            <div class="info"><span class="label">الحي:</span> ${customer.district || '-'}</div>
            <div class="info"><span class="label">الشارع:</span> ${customer.street || '-'}</div>
            <div class="info"><span class="label">رقم المبنى:</span> ${customer.buildingNo || '-'}</div>
            <div class="info"><span class="label">الرقم الإضافي:</span> ${customer.additionalNo || '-'}</div>
            <div class="info"><span class="label">الرمز البريدي:</span> ${customer.poBox || '-'}</div>
        </div>
        <script>window.onload=function(){window.print();};<\/script>
        </body>
        </html>
    `);
    win.document.close();
}

// ===================== تصدير CSV =====================
async function exportCSV() {
    var customers = await getCustomers();
    if (customers.length === 0) {
        showNotification('لا يوجد عملاء للتصدير', 'error');
        return;
    }
    var headers = ['الاسم', 'الجوال', 'البريد', 'الدولة', 'المدينة', 'الحي', 'الشارع', 'رقم المبنى', 'الرقم الإضافي', 'الرمز البريدي'];
    var rows = [headers];
    for (var i = 0; i < customers.length; i++) {
        var c = customers[i];
        rows.push([c.name, c.phone, c.email, c.country, c.city, c.district, c.street, c.buildingNo, c.additionalNo, c.poBox]);
    }
    var csv = rows.map(function(row) {
        return row.map(function(cell) { return '"' + (cell || '') + '"'; }).join(',');
    }).join('\n');
    var blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
    var link = document.createElement('a');
    var url = URL.createObjectURL(blob);
    link.href = url;
    link.download = 'customers.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showNotification('تم تصدير العملاء', 'success');
}

// ===================== نموذج الإضافة والتعديل =====================
function showModal(mode, customerData) {
    var modal = document.getElementById('customer-modal');
    if (!modal) return;
    var title = document.getElementById('modal-title');
    
    if (mode === 'add') {
        title.innerText = 'إضافة عميل جديد';
        document.getElementById('customer-form').reset();
        document.getElementById('edit-id').value = '';
    } else if (mode === 'edit' && customerData) {
        title.innerText = 'تعديل بيانات العميل';
        document.getElementById('edit-id').value = customerData.id;
        document.getElementById('c-name').value = customerData.name || '';
        document.getElementById('c-phone').value = customerData.phone || '';
        document.getElementById('c-email').value = customerData.email || '';
        document.getElementById('c-country').value = customerData.country || 'السعودية';
        document.getElementById('c-city').value = customerData.city || '';
        document.getElementById('c-district').value = customerData.district || '';
        document.getElementById('c-street').value = customerData.street || '';
        document.getElementById('c-building').value = customerData.buildingNo || '';
        document.getElementById('c-additional').value = customerData.additionalNo || '';
        document.getElementById('c-pobox').value = customerData.poBox || '';
    }
    modal.style.display = 'flex';
}

function closeModal() {
    var modal = document.getElementById('customer-modal');
    if (modal) modal.style.display = 'none';
}

async function saveCustomer(e) {
    e.preventDefault();
    var id = document.getElementById('edit-id').value;
    var data = {
        name: document.getElementById('c-name').value,
        phone: document.getElementById('c-phone').value,
        email: document.getElementById('c-email').value,
        country: document.getElementById('c-country').value,
        city: document.getElementById('c-city').value,
        district: document.getElementById('c-district').value,
        street: document.getElementById('c-street').value,
        buildingNo: document.getElementById('c-building').value,
        additionalNo: document.getElementById('c-additional').value,
        poBox: document.getElementById('c-pobox').value,
        updatedAt: serverTimestamp()
    };
    try {
        if (id) {
            await updateDoc(doc(db, "customers", id), data);
            showNotification('تم تحديث العميل', 'success');
        } else {
            data.createdAt = serverTimestamp();
            await addDoc(collection(db, "customers"), data);
            showNotification('تم إضافة العميل', 'success');
        }
        closeModal();
        await renderTable();
    } catch(err) {
        console.error(err);
        showNotification('حدث خطأ', 'error');
    }
}

// ===================== الدالة الرئيسية =====================
export async function initCustomers(container) {
    if (!container) return;
    
    container.innerHTML = `
        <div style="padding:25px;font-family:Tajawal,sans-serif;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
                <h2 style="color:#2c3e50;"><i class="fas fa-users" style="color:#e67e22;"></i> إدارة العملاء</h2>
                <div>
                    <button id="export-csv-btn" style="background:#27ae60;color:white;border:none;padding:8px 16px;border-radius:8px;cursor:pointer;margin-left:10px;"><i class="fas fa-file-excel"></i> تصدير CSV</button>
                    <button id="add-customer-btn" style="background:#e67e22;color:white;border:none;padding:8px 16px;border-radius:8px;cursor:pointer;"><i class="fas fa-user-plus"></i> إضافة عميل</button>
                </div>
            </div>
            <div id="customers-stats"></div>
            <div style="margin-bottom:15px;"><input type="text" id="search-customers" placeholder="بحث..." style="width:100%;max-width:300px;padding:8px;border:1px solid #ddd;border-radius:8px;"></div>
            <div style="overflow-x:auto;">
                <table style="width:100%;border-collapse:collapse;background:white;border-radius:12px;">
                    <thead style="background:#f8f9fa;"><tr><th>#</th><th>الاسم</th><th>الجوال</th><th>البريد</th><th>المدينة</th><th>الحي</th><th>الشارع</th><th>الإجراءات</th></tr></thead>
                    <tbody id="customers-table-body"><tr><td colspan="8">جاري التحميل...<\/td><\/tr><\/tbody>
                </table>
            </div>
        </div>
        <div id="customer-modal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:1000;justify-content:center;align-items:center;">
            <div style="background:white;width:90%;max-width:700px;padding:25px;border-radius:16px;">
                <h3 id="modal-title" style="margin-bottom:20px;">إضافة عميل جديد</h3>
                <form id="customer-form">
                    <input type="hidden" id="edit-id">
                    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:15px;">
                        <div><label>الاسم الكامل *</label><input type="text" id="c-name" required style="width:100%;padding:8px;"></div>
                        <div><label>رقم الجوال *</label><input type="tel" id="c-phone" required style="width:100%;padding:8px;"></div>
                        <div><label>البريد الإلكتروني</label><input type="email" id="c-email" style="width:100%;padding:8px;"></div>
                        <div><label>الدولة</label><input type="text" id="c-country" value="السعودية" style="width:100%;padding:8px;"></div>
                        <div><label>المدينة</label><input type="text" id="c-city" style="width:100%;padding:8px;"></div>
                        <div><label>الحي</label><input type="text" id="c-district" style="width:100%;padding:8px;"></div>
                        <div><label>الشارع</label><input type="text" id="c-street" style="width:100%;padding:8px;"></div>
                        <div><label>رقم المبنى</label><input type="text" id="c-building" style="width:100%;padding:8px;"></div>
                        <div><label>الرقم الإضافي</label><input type="text" id="c-additional" style="width:100%;padding:8px;"></div>
                        <div><label>الرمز البريدي</label><input type="text" id="c-pobox" style="width:100%;padding:8px;"></div>
                    </div>
                    <div style="display:flex;gap:15px;margin-top:25px;">
                        <button type="submit" style="flex:2;background:#27ae60;color:white;padding:10px;border:none;border-radius:8px;">حفظ</button>
                        <button type="button" id="close-modal-btn" style="flex:1;background:#95a5a6;color:white;padding:10px;border:none;border-radius:8px;">إلغاء</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.getElementById('add-customer-btn').onclick = function() { showModal('add'); };
    document.getElementById('close-modal-btn').onclick = closeModal;
    document.getElementById('customer-form').onsubmit = saveCustomer;
    document.getElementById('export-csv-btn').onclick = exportCSV;
    
    await renderTable();
    
    document.getElementById('search-customers').addEventListener('input', function(e) {
        var term = e.target.value.toLowerCase();
        var rows = document.querySelectorAll('#customers-table-body tr');
        for (var i = 0; i < rows.length; i++) {
            var row = rows[i];
            if (row.cells.length < 2) continue;
            var name = (row.cells[1]?.innerText || '').toLowerCase();
            var phone = (row.cells[2]?.innerText || '').toLowerCase();
            row.style.display = (name.includes(term) || phone.includes(term)) ? '' : 'none';
        }
    });
}

export default { initCustomers };
