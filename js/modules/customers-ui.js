/**
 * customers-ui.js - Tera Gateway (إصدار الإدارة المتقدمة)
 * تشمل: تعديل شامل، اختيار دول ذكي، محرر نصوص، استيراد وتصدير إكسل، وصور عملاء.
 */

import * as Core from './customers-core.js';

let editingId = null;
let quillEditor = null; // لمحرر النصوص

/**
 * تهيئة الواجهة
 */
export async function initCustomersUI(container) {
    if (!container) return;

    container.innerHTML = `
        <div class="cust-ui-wrapper" style="font-family: 'Tajawal', sans-serif; direction: rtl; padding: 20px;">
            
            <div class="stats-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 25px;">
                <div class="stat-card" style="background:#fff; padding:15px; border-radius:12px; border-right:5px solid #2563eb; box-shadow:0 2px 10px rgba(0,0,0,0.05);">
                    <small>إجمالي العملاء</small>
                    <div id="stat-total" style="font-size:1.6rem; font-weight:800;">0</div>
                </div>
                <div class="stat-card" style="background:#fff; padding:15px; border-radius:12px; border-right:5px solid #10b981; box-shadow:0 2px 10px rgba(0,0,0,0.05);">
                    <small>بيانات مكتملة</small>
                    <div id="stat-complete" style="font-size:1.6rem; font-weight:800; color:#10b981;">0</div>
                </div>
                <div class="stat-card" style="background:#fff; padding:15px; border-radius:12px; border-right:5px solid #f59e0b; box-shadow:0 2px 10px rgba(0,0,0,0.05);">
                    <small>سجل العمليات</small>
                    <div id="stat-logs" style="font-size:0.9rem; margin-top:5px; color:#64748b;">لا توجد عمليات تصدير مؤخراً</div>
                </div>
            </div>

            <div style="background:#fff; padding:20px; border-radius:15px; margin-bottom:20px; display:flex; flex-wrap:wrap; gap:15px; align-items:center; justify-content:space-between;">
                <div style="display:flex; gap:10px;">
                    <button onclick="showAddCustomerModal()" style="background:#2563eb; color:white; border:none; padding:10px 20px; border-radius:8px; cursor:pointer; font-weight:bold;">
                        <i class="fas fa-plus"></i> إضافة عميل
                    </button>
                    <button onclick="exportCustomersToExcel()" style="background:#10b981; color:white; border:none; padding:10px 20px; border-radius:8px; cursor:pointer;">
                        <i class="fas fa-file-export"></i> تصدير إكسل
                    </button>
                    <label style="background:#f1f5f9; color:#475569; padding:10px 20px; border-radius:8px; cursor:pointer; font-weight:bold;">
                        <i class="fas fa-file-import"></i> استرداد إكسل
                        <input type="file" id="import-excel" hidden onchange="importCustomersFromExcel(this)">
                    </label>
                    <button onclick="downloadExcelTemplate()" style="background:none; border:1px solid #cbd5e1; padding:10px; border-radius:8px; cursor:pointer;" title="تحميل النموذج">
                        <i class="fas fa-download"></i>
                    </button>
                </div>
                
                <div style="position:relative; width:350px;">
                    <i class="fas fa-search" style="position:absolute; right:15px; top:12px; color:#94a3b8;"></i>
                    <input type="text" id="cust-filter" placeholder="بحث شامل..." style="width:100%; padding:10px 40px 10px 15px; border-radius:10px; border:1px solid #e2e8f0;">
                </div>
            </div>

            <div style="background:#fff; border-radius:15px; overflow:hidden; box-shadow:0 4px 20px rgba(0,0,0,0.05);">
                <div style="overflow-x:auto;">
                    <table style="width:100%; text-align:right; border-collapse:collapse; min-width:1800px;">
                        <thead style="background:#f8fafc; color:#64748b;">
                            <tr>
                                <th style="padding:15px;">👤</th>
                                <th>اسم العميل</th>
                                <th>الجوال</th>
                                <th>الدولة</th>
                                <th>البريد</th>
                                <th>المدينة/الحي</th>
                                <th>العنوان</th>
                                <th>التاريخ</th>
                                <th>التصنيف</th>
                                <th style="text-align:center;">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody id="customers-list-render"></tbody>
                    </table>
                </div>
            </div>
        </div>

        <div id="customer-modal" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.5); z-index:9999; align-items:center; justify-content:center; padding:20px;">
            <div style="background:white; width:100%; max-width:900px; max-height:90vh; border-radius:20px; overflow-y:auto; padding:30px; position:relative;">
                <h3 id="modal-title" style="margin-top:0;">إضافة عميل جديد</h3>
                <hr style="margin:20px 0; opacity:0.1;">
                
                <form id="customer-form" onsubmit="event.preventDefault(); saveCustomerData();">
                    <div style="display:grid; grid-template-columns: 150px 1fr 1fr; gap:20px; margin-bottom:20px;">
                        <div style="text-align:center;">
                            <div id="photo-preview" style="width:120px; height:120px; border-radius:15px; background:#f1f5f9; display:flex; align-items:center; justify-content:center; overflow:hidden; border:2px dashed #cbd5e1; margin-bottom:10px;">
                                <i class="fas fa-user" style="font-size:3rem; color:#cbd5e1;"></i>
                            </div>
                            <label style="color:#2563eb; cursor:pointer; font-size:0.8rem; font-weight:bold;">
                                تحميل صورة
                                <input type="file" hidden accept="image/*" onchange="previewCustomerPhoto(this)">
                            </label>
                        </div>
                        <div>
                            <label>اسم العميل المطلوب</label>
                            <input type="text" id="cust-name" required style="width:100%; padding:10px; margin-top:5px; border-radius:8px; border:1px solid #e2e8f0;">
                            
                            <label style="display:block; margin-top:15px;">الجوال</label>
                            <input type="text" id="cust-phone" required style="width:100%; padding:10px; margin-top:5px; border-radius:8px; border:1px solid #e2e8f0;">
                        </div>
                        <div>
                            <label>اختيار الدولة (بحث)</label>
                            <select id="cust-country-select" onchange="updateCountryCode(this)" style="width:100%; padding:10px; margin-top:5px; border-radius:8px; border:1px solid #e2e8f0;">
                                <option value="Saudi Arabia" data-code="+966">المملكة العربية السعودية (+966)</option>
                                <option value="Kuwait" data-code="+965">الكويت (+965)</option>
                                <option value="UAE" data-code="+971">الإمارات (+971)</option>
                                <option value="Qatar" data-code="+974">قطر (+974)</option>
                                <option value="Oman" data-code="+968">عمان (+968)</option>
                                <option value="Bahrain" data-code="+973">البحرين (+973)</option>
                                </select>
                            
                            <label style="display:block; margin-top:15px;">البريد الإلكتروني</label>
                            <input type="email" id="cust-email" style="width:100%; padding:10px; margin-top:5px; border-radius:8px; border:1px solid #e2e8f0;">
                        </div>
                    </div>

                    <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:15px; margin-bottom:20px;">
                        <div><label>المدينة</label><input type="text" id="cust-city" placeholder="حائل" style="width:100%; padding:10px; border-radius:8px; border:1px solid #e2e8f0;"></div>
                        <div><label>الحي</label><input type="text" id="cust-district" style="width:100%; padding:10px; border-radius:8px; border:1px solid #e2e8f0;"></div>
                        <div><label>الشارع</label><input type="text" id="cust-street" style="width:100%; padding:10px; border-radius:8px; border:1px solid #e2e8f0;"></div>
                        <div><label>رقم المبنى</label><input type="text" id="cust-building" style="width:100%; padding:10px; border-radius:8px; border:1px solid #e2e8f0;"></div>
                        <div><label>الرقم الإضافي</label><input type="text" id="cust-additional" style="width:100%; padding:10px; border-radius:8px; border:1px solid #e2e8f0;"></div>
                        <div><label>الرمز البريدي</label><input type="text" id="cust-postal" style="width:100%; padding:10px; border-radius:8px; border:1px solid #e2e8f0;"></div>
                    </div>

                    <div style="margin-bottom:20px;">
                        <label style="font-weight:bold; display:block; margin-bottom:10px;">ملاحظات العميل وطلباته (محرر نصوص)</label>
                        <div id="notes-editor" style="height:150px; border-radius:8px;"></div>
                    </div>

                    <div style="display:flex; justify-content:flex-end; gap:10px;">
                        <button type="button" onclick="closeCustomerModal()" style="padding:12px 25px; border-radius:8px; border:1px solid #e2e8f0; background:none; cursor:pointer;">إلغاء</button>
                        <button type="submit" style="padding:12px 35px; border-radius:8px; border:none; background:#2563eb; color:white; font-weight:bold; cursor:pointer;">حفظ البيانات</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    initRichText();
    await loadAndRender();
    setupSearch();
}

/**
 * تهيئة محرر النصوص Quill
 */
function initRichText() {
    if (typeof Quill !== 'undefined') {
        quillEditor = new Quill('#notes-editor', {
            theme: 'snow',
            placeholder: 'اكتب تفاصيل طلبات العميل هنا...',
            modules: { toolbar: [['bold', 'italic', 'underline'], [{ 'list': 'ordered'}, { 'list': 'bullet' }], ['clean']] }
        });
    }
}

/**
 * معالجة عرض الصور
 */
window.previewCustomerPhoto = (input) => {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById('photo-preview').innerHTML = `<img src="${e.target.result}" style="width:100%; height:100%; object-fit:cover;">`;
            document.getElementById('photo-preview').dataset.base64 = e.target.result;
        };
        reader.readAsDataURL(input.files[0]);
    }
};

/**
 * جلب البيانات وعرضها
 */
async function loadAndRender() {
    const list = document.getElementById('customers-list-render');
    if (!list) return;

    try {
        const snapshot = await Core.fetchAllCustomers();
        list.innerHTML = '';
        let stats = { total: 0, complete: 0, vips: 0 };

        snapshot.forEach(docSnap => {
            const d = docSnap.data();
            const id = docSnap.id;
            stats.total++;
            if(d.name && d.phone && d.city && d.buildingNo) stats.complete++;

            list.innerHTML += `
                <tr class="cust-row" style="border-bottom:1px solid #f1f5f9;">
                    <td style="padding:15px;">
                        <div style="width:40px; height:40px; border-radius:8px; background:#f1f5f9; overflow:hidden; border:1px solid #e2e8f0;">
                            ${d.photoUrl ? `<img src="${d.photoUrl}" style="width:100%; height:100%; object-fit:cover;">` : `<i class="fas fa-user" style="margin:10px; color:#cbd5e1;"></i>`}
                        </div>
                    </td>
                    <td style="font-weight:bold;">${d.name || '-'}</td>
                    <td dir="ltr" style="color:#2563eb;">${d.phone || '-'}</td>
                    <td style="font-size:0.8rem;">${d.country || 'السعودية'} (${d.countryCode || '+966'})</td>
                    <td style="color:#64748b;">${d.email || '-'}</td>
                    <td>${d.city || 'حائل'} / ${d.district || '-'}</td>
                    <td style="font-size:0.8rem; color:#94a3b8;">${d.street || '-'} | مبنى: ${d.buildingNo || '-'}</td>
                    <td style="font-size:0.8rem;">${d.createdAt ? d.createdAt.substring(0, 10) : '-'}</td>
                    <td><span style="background:#fefce8; color:#854d0e; padding:4px 8px; border-radius:5px; font-size:0.75rem;">${d.tag || 'عادي'}</span></td>
                    <td>
                        <div style="display:flex; gap:10px; justify-content:center;">
                            <button onclick="handleEdit('${id}')" style="color:#2563eb; background:none; border:none; cursor:pointer;"><i class="fas fa-edit"></i></button>
                            <button onclick="handlePrint('${id}')" style="color:#64748b; background:none; border:none; cursor:pointer;"><i class="fas fa-print"></i></button>
                            <button onclick="handleDelete('${id}')" style="color:#ef4444; background:none; border:none; cursor:pointer;"><i class="fas fa-trash-alt"></i></button>
                        </div>
                    </td>
                </tr>`;
        });

        document.getElementById('stat-total').innerText = stats.total;
        document.getElementById('stat-complete').innerText = stats.complete;

    } catch (e) { console.error(e); }
}

/**
 * تصدير البيانات إلى إكسل
 */
window.exportCustomersToExcel = async () => {
    try {
        const snapshot = await Core.fetchAllCustomers();
        const data = [];
        snapshot.forEach(doc => {
            const d = doc.data();
            data.push({
                "الاسم الكامل": d.name,
                "الجوال": d.phone,
                "مفتاح الدولة": d.countryCode,
                "البريد": d.email,
                "المدينة": d.city,
                "الحي": d.district,
                "الشارع": d.street,
                "رقم المبنى": d.buildingNo,
                "الرقم الإضافي": d.additionalNo,
                "الرمز البريدي": d.postalCode,
                "التصنيف": d.tag,
                "تاريخ الإضافة": d.createdAt
            });
        });

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "العملاء");
        XLSX.writeFile(wb, `Tera_Customers_${new Date().toLocaleDateString()}.xlsx`);
        
        document.getElementById('stat-logs').innerText = `آخر عملية: تصدير ${data.length} عميل`;
    } catch (err) { alert("خطأ في التصدير"); }
};

/**
 * استرداد البيانات من إكسل
 */
window.importCustomersFromExcel = (input) => {
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = async (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, {type: 'array'});
        const sheetName = workbook.SheetNames[0];
        const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

        if (confirm(`هل أنت متأكد من استيراد ${rows.length} عميل؟ (تنبيه: لا تقم بتغيير أسماء الأعمدة في النموذج)`)) {
            for (let row of rows) {
                const payload = {
                    name: row["الاسم الكامل"],
                    phone: row["الجوال"],
                    countryCode: row["مفتاح الدولة"] || "+966",
                    email: row["البريد"],
                    city: row["المدينة"],
                    district: row["الحي"],
                    street: row["الشارع"],
                    buildingNo: row["رقم المبنى"],
                    additionalNo: row["الرقم الإضافي"],
                    postalCode: row["الرمز البريدي"],
                    tag: row["التصنيف"] || "عادي",
                    createdAt: new Date().toISOString()
                };
                await Core.addCustomer(payload);
            }
            alert("تم الاستيراد بنجاح!");
            document.getElementById('stat-logs').innerText = `آخر عملية: استيراد ${rows.length} عميل`;
            await loadAndRender();
        }
    };
    reader.readAsArrayBuffer(file);
};

/**
 * التعديل: إظهار جميع المعلومات
 */
window.handleEdit = async (id) => {
    editingId = id;
    const d = await Core.fetchCustomerById(id);
    if (!d) return;

    const setVal = (id, val) => { if(document.getElementById(id)) document.getElementById(id).value = val || ''; };
    
    setVal('cust-name', d.name);
    setVal('cust-phone', d.phone);
    setVal('cust-email', d.email);
    setVal('cust-city', d.city);
    setVal('cust-district', d.district);
    setVal('cust-street', d.street);
    setVal('cust-building', d.buildingNo);
    setVal('cust-additional', d.additionalNo);
    setVal('cust-postal', d.postalCode);
    setVal('cust-country-select', d.country);

    if (quillEditor) quillEditor.root.innerHTML = d.notes || '';
    if (d.photoUrl) document.getElementById('photo-preview').innerHTML = `<img src="${d.photoUrl}" style="width:100%; height:100%; object-fit:cover;">`;
    else document.getElementById('photo-preview').innerHTML = `<i class="fas fa-user" style="font-size:3rem; color:#cbd5e1;"></i>`;

    document.getElementById('modal-title').innerText = "تعديل بيانات العميل الكاملة";
    document.getElementById('customer-modal').style.display = 'flex';
};

window.saveCustomerData = async () => {
    const getVal = (id) => document.getElementById(id)?.value || '';
    const countrySel = document.getElementById('cust-country-select');
    
    const payload = {
        name: getVal('cust-name'),
        phone: getVal('cust-phone'),
        email: getVal('cust-email'),
        city: getVal('cust-city'),
        district: getVal('cust-district'),
        street: getVal('cust-street'),
        buildingNo: getVal('cust-building'),
        additionalNo: getVal('cust-additional'),
        postalCode: getVal('cust-postal'),
        country: countrySel.value,
        countryCode: countrySel.options[countrySel.selectedIndex].dataset.code,
        notes: quillEditor ? quillEditor.root.innerHTML : '',
        photoUrl: document.getElementById('photo-preview').dataset.base64 || '',
        updatedAt: new Date().toISOString()
    };

    if (editingId) await Core.updateCustomer(editingId, payload);
    else {
        payload.createdAt = new Date().toISOString();
        await Core.addCustomer(payload);
    }

    closeCustomerModal();
    await loadAndRender();
};

window.closeCustomerModal = () => {
    document.getElementById('customer-modal').style.display = 'none';
    if(quillEditor) quillEditor.root.innerHTML = '';
    document.getElementById('photo-preview').innerHTML = `<i class="fas fa-user" style="font-size:3rem; color:#cbd5e1;"></i>`;
    delete document.getElementById('photo-preview').dataset.base64;
};

// ... الدوال الأخرى مثل setupSearch و handleDelete تبقى كما هي مع تغيير المسميات لتطابق payload ...
