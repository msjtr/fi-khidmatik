/**
 * customers-ui.js - Tera Gateway 
 * يغطي المتطلبات 1 إلى 11 بالكامل
 */

import * as Core from './customers-core.js';

let editingId = null;
let quillEditor = null;
let systemLogs = []; // مصفوفة مؤقتة لسجل العمليات (لحين ربطها بقاعدة البيانات لاحقاً)

export async function initCustomersUI(container) {
    if (!container) return;

    container.innerHTML = `
        <div style="padding: 20px;">
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px; margin-bottom: 25px;">
                <div style="background:#fff; padding:15px; border-radius:12px; border-right:4px solid #2563eb; box-shadow:0 2px 5px rgba(0,0,0,0.02);">
                    <small style="color:#64748b;">إجمالي العملاء</small><h2 id="stat-total" style="margin:5px 0 0 0;">0</h2>
                </div>
                <div style="background:#fff; padding:15px; border-radius:12px; border-right:4px solid #10b981;">
                    <small style="color:#64748b;">مكتملة البيانات</small><h2 id="stat-comp" style="margin:5px 0 0 0; color:#10b981;">0</h2>
                </div>
                <div style="background:#fff; padding:15px; border-radius:12px; border-right:4px solid #f59e0b;">
                    <small style="color:#64748b;">نواقص البيانات</small><h2 id="stat-inc" style="margin:5px 0 0 0; color:#f59e0b;">0</h2>
                </div>
                <div style="background:#fff; padding:15px; border-radius:12px; border-right:4px solid #8b5cf6;">
                    <small style="color:#64748b;">عملاء نشطين</small><h2 id="stat-active" style="margin:5px 0 0 0; color:#8b5cf6;">0</h2>
                </div>
            </div>

            <div style="background:#fff; padding:15px; border-radius:12px; margin-bottom:20px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:15px;">
                <div style="display:flex; gap:10px;">
                    <button onclick="showAddCustomerModal()" class="btn btn-primary" data-title="إضافة عميل جديد"><i class="fas fa-plus"></i> إضافة</button>
                    <button onclick="exportSelected()" class="btn btn-success" data-title="تصدير المحدد فقط"><i class="fas fa-file-excel"></i> تصدير إكسل</button>
                    <label class="btn btn-secondary" style="margin:0; cursor:pointer;" data-title="استيراد بيانات من ملف">
                        <i class="fas fa-file-import"></i> استيراد <input type="file" hidden onchange="importExcel(this)">
                    </label>
                    <button onclick="downloadTemplate()" class="btn btn-secondary" data-title="تحميل النموذج المتوافق"><i class="fas fa-download"></i> نموذج</button>
                    <button onclick="showLogs()" class="btn" style="background:#334155; color:white;" data-title="مراجعة سجل النظام"><i class="fas fa-history"></i> السجل</button>
                </div>
                
                <div style="display:flex; gap:10px;">
                    <select id="filter-status" onchange="filterTable()" style="padding:10px; border-radius:8px; border:1px solid #e2e8f0;">
                        <option value="all">الكل</option>
                        <option value="نشط">نشط</option>
                        <option value="غير نشط">غير نشط</option>
                    </select>
                    <input type="text" id="search-input" onkeyup="filterTable()" placeholder="بحث سريع..." style="padding:10px; border-radius:8px; border:1px solid #e2e8f0; width:250px;">
                </div>
            </div>

            <div style="background:#fff; border-radius:12px; overflow-x:auto; box-shadow:0 2px 10px rgba(0,0,0,0.05);">
                <table style="width:100%; min-width:1800px; text-align:right; border-collapse:collapse; white-space:nowrap;">
                    <thead style="background:#f1f5f9; color:#475569;">
                        <tr>
                            <th style="padding:12px;"><input type="checkbox" onchange="toggleAll(this)"></th>
                            <th>التسلسل</th>
                            <th>الصورة</th>
                            <th>الاسم</th>
                            <th>الجوال</th>
                            <th>المفتاح</th>
                            <th>البريد</th>
                            <th>الدولة</th>
                            <th>المدينة / الحي</th>
                            <th>الشارع / المبنى</th>
                            <th>الإضافي / الرمز / ص.ب</th>
                            <th>تاريخ الإضافة</th>
                            <th>الحالة</th>
                            <th>التصنيف</th>
                            <th style="text-align:center; position:sticky; left:0; background:#f1f5f9; z-index:2;">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody id="customers-tbody"></tbody>
                </table>
            </div>
        </div>
    `;

    initQuill();
    await loadData();
}

function initQuill() {
    if (typeof Quill !== 'undefined' && document.getElementById('notes-editor')) {
        quillEditor = new Quill('#notes-editor', {
            theme: 'snow',
            modules: { toolbar: [['bold', 'italic', 'underline', 'strike'], [{ 'color': [] }], [{ 'list': 'ordered'}, { 'list': 'bullet' }], ['link', 'clean']] }
        });
    }
}

function logAction(actionName, custName) {
    const time = new Date().toLocaleString('ar-SA');
    systemLogs.unshift({ action: actionName, user: 'مدير النظام', time: time, target: custName });
}

window.showLogs = () => {
    const container = document.getElementById('logs-container');
    container.innerHTML = systemLogs.map(log => `
        <div style="border-bottom:1px solid #e2e8f0; padding:10px 0; font-size:0.9rem;">
            <span style="color:var(--primary); font-weight:bold;">${log.action}</span> - 
            عميل: ${log.target || 'عام'} | منفذ: ${log.user} | ${log.time}
        </div>
    `).join('') || 'لا توجد عمليات مسجلة بعد.';
    document.getElementById('logs-modal').style.display = 'flex';
};

async function loadData() {
    const tbody = document.getElementById('customers-tbody');
    if (!tbody) return;

    try {
        const snapshot = await Core.fetchAllCustomers();
        tbody.innerHTML = '';
        let stats = { total: 0, comp: 0, inc: 0, active: 0 };
        let seq = 1;

        snapshot.forEach(doc => {
            const d = doc.data();
            const id = doc.id;
            
            // حساب الإحصائيات
            stats.total++;
            if(d.status === 'نشط') stats.active++;
            if(d.name && d.phone && d.city && d.building) stats.comp++; else stats.inc++;

            tbody.innerHTML += `
                <tr class="c-row" data-status="${d.status || 'نشط'}" style="border-bottom:1px solid #f8fafc;">
                    <td style="padding:12px;"><input type="checkbox" class="row-check" value="${id}"></td>
                    <td>${seq++}</td>
                    <td><img src="${d.photo || 'https://via.placeholder.com/40'}" style="width:35px; height:35px; border-radius:50%; object-fit:cover;"></td>
                    <td style="font-weight:bold;">${d.name || '-'}</td>
                    <td dir="ltr">${d.phone || '-'}</td>
                    <td dir="ltr">${d.countryCode || '+966'}</td>
                    <td>${d.email || '-'}</td>
                    <td>${d.countryName || 'السعودية'}</td>
                    <td>${d.city || '-'}/${d.district || '-'}</td>
                    <td>${d.street || '-'}/${d.building || '-'}</td>
                    <td>${d.additional || '-'}/${d.postal || '-'}/${d.poBox || '-'}</td>
                    <td>${d.date || '-'}</td>
                    <td><span style="background:${d.status==='نشط'?'#dcfce7':'#fee2e2'}; color:${d.status==='نشط'?'#166534':'#991b1b'}; padding:3px 8px; border-radius:5px; font-size:0.8rem;">${d.status || 'نشط'}</span></td>
                    <td>${d.category || '-'}</td>
                    <td style="text-align:center; position:sticky; left:0; background:#fff; box-shadow:-2px 0 5px rgba(0,0,0,0.02);">
                        <button onclick="handleEdit('${id}')" style="color:#2563eb; border:none; background:none; cursor:pointer;" data-title="تعديل"><i class="fas fa-edit"></i></button>
                        <button onclick="window.print()" style="color:#64748b; border:none; background:none; cursor:pointer;" data-title="طباعة"><i class="fas fa-print"></i></button>
                        <button onclick="handleDelete('${id}','${d.name}')" style="color:#ef4444; border:none; background:none; cursor:pointer;" data-title="حذف"><i class="fas fa-trash-alt"></i></button>
                    </td>
                </tr>`;
        });

        // تحديث أرقام الإحصائيات
        document.getElementById('stat-total').innerText = stats.total;
        document.getElementById('stat-comp').innerText = stats.comp;
        document.getElementById('stat-inc').innerText = stats.inc;
        document.getElementById('stat-active').innerText = stats.active;

    } catch (e) { console.error(e); }
}

// ================= 1. و 2. وظائف التعديل والإضافة الشاملة =================
window.showAddCustomerModal = () => {
    editingId = null;
    document.getElementById('customer-form').reset();
    $('#cust-country-select').val('Saudi Arabia').trigger('change'); // إعادة ضبط Select2
    if(quillEditor) quillEditor.root.innerHTML = '';
    document.getElementById('photo-preview').innerHTML = `<i class="fas fa-user-circle fa-3x" style="color:#cbd5e1;"></i>`;
    document.getElementById('modal-title').innerText = "إضافة عميل جديد";
    document.getElementById('customer-modal').style.display = 'flex';
};

window.closeCustomerModal = () => document.getElementById('customer-modal').style.display = 'none';

window.handleEdit = async (id) => {
    editingId = id;
    const d = await Core.fetchCustomerById(id);
    if (!d) return;

    const setVal = (id, val) => { if(document.getElementById(id)) document.getElementById(id).value = val || ''; };
    
    setVal('cust-name', d.name); setVal('cust-phone', d.phone); setVal('cust-email', d.email);
    setVal('cust-city', d.city); setVal('cust-district', d.district); setVal('cust-street', d.street);
    setVal('cust-building', d.building); setVal('cust-additional', d.additional); 
    setVal('cust-postal', d.postal); setVal('cust-pobox', d.poBox);
    setVal('cust-status', d.status); setVal('cust-category', d.category);
    
    // تحديث Select2
    if(d.countryName) $('#cust-country-select').val(d.countryName).trigger('change');

    if (quillEditor) quillEditor.root.innerHTML = d.notes || '';
    if (d.photo) document.getElementById('photo-preview').innerHTML = `<img src="${d.photo}" style="width:100%;height:100%;object-fit:cover;">`;

    document.getElementById('modal-title').innerText = "تعديل بيانات العميل";
    document.getElementById('customer-modal').style.display = 'flex';
};

window.saveCustomerData = async () => {
    const getVal = (id) => document.getElementById(id)?.value || '';
    const cSelect = document.getElementById('cust-country-select');
    const selectedOption = cSelect.options[cSelect.selectedIndex];

    const payload = {
        name: getVal('cust-name'), phone: getVal('cust-phone'), email: getVal('cust-email'),
        countryName: getVal('cust-country-select'), countryCode: selectedOption ? selectedOption.dataset.code : '+966',
        city: getVal('cust-city'), district: getVal('cust-district'), street: getVal('cust-street'),
        building: getVal('cust-building'), additional: getVal('cust-additional'),
        postal: getVal('cust-postal'), poBox: getVal('cust-pobox'),
        status: getVal('cust-status'), category: getVal('cust-category'),
        notes: quillEditor ? quillEditor.root.innerHTML : '',
        photo: document.getElementById('photo-preview')?.dataset.base64 || ''
    };

    if (editingId) {
        await Core.updateCustomer(editingId, payload);
        logAction('تعديل بيانات', payload.name);
    } else {
        payload.date = new Date().toLocaleDateString('en-GB');
        await Core.addCustomer(payload);
        logAction('إضافة عميل جديد', payload.name);
    }
    closeCustomerModal();
    await loadData();
};

window.handleDelete = async (id, name) => {
    if (confirm(`هل أنت متأكد من حذف العميل: ${name}؟`)) {
        await Core.removeCustomer(id);
        logAction('حذف عميل', name);
        await loadData();
    }
};

window.previewCustomerPhoto = (input) => {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById('photo-preview').innerHTML = `<img src="${e.target.result}" style="width:100%;height:100%;object-fit:cover;">`;
            document.getElementById('photo-preview').dataset.base64 = e.target.result;
        };
        reader.readAsDataURL(input.files[0]);
    }
};

// ================= الفلترة والبحث =================
window.filterTable = () => {
    const term = document.getElementById('search-input').value.toLowerCase();
    const status = document.getElementById('filter-status').value;
    document.querySelectorAll('.c-row').forEach(row => {
        const textMatch = row.innerText.toLowerCase().includes(term);
        const statusMatch = status === 'all' || row.dataset.status === status;
        row.style.display = (textMatch && statusMatch) ? '' : 'none';
    });
};

window.toggleAll = (checkbox) => {
    document.querySelectorAll('.row-check').forEach(cb => cb.checked = checkbox.checked);
};

// ================= التصدير والاستيراد =================
window.exportSelected = async () => {
    const selectedIds = Array.from(document.querySelectorAll('.row-check:checked')).map(cb => cb.value);
    if(selectedIds.length === 0) return alert("الرجاء تحديد عميل واحد على الأقل للتصدير");

    const snapshot = await Core.fetchAllCustomers();
    const data = [];
    snapshot.forEach(doc => {
        if(selectedIds.includes(doc.id)) {
            const d = doc.data();
            data.push({ "الاسم": d.name, "الجوال": d.phone, "الدولة": d.countryName, "المدينة": d.city, "الحالة": d.status });
        }
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "العملاء");
    XLSX.writeFile(wb, `Tera_Export_${new Date().getTime()}.xlsx`);
    logAction('تصدير إكسل', `تم تصدير ${data.length} عميل`);
};

window.downloadTemplate = () => {
    const data = [{ "الاسم": "مثال: احمد", "الجوال": "050000000", "البريد": "a@a.com", "الدولة": "Saudi Arabia", "المدينة": "الرياض", "الحي": "العليا" }];
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, `Tera_Import_Template.xlsx`);
};
