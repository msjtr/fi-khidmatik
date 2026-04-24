/**
 * js/modules/customers-core.js
 * موديول إدارة العملاء الاحترافي - Tera Gateway
 * التحديث: ربط نظام الطباعة ثنائي اللغة المستقل وتحسين جودة البيانات
 */

import { db } from '../core/config.js';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy, writeBatch } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const LIBS = {
    xlsx: "https://cdn.sheetjs.com/xlsx-0.19.3/package/dist/xlsx.full.min.js"
};

export async function initCustomers(container) {
    await loadExternalLibs();
    injectStyles();

    container.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card"><h3>إجمالي العملاء</h3><p id="stat-total">0</p></div>
            <div class="stat-card success"><h3>بيانات مكتملة</h3><p id="stat-complete">0</p></div>
            <div class="stat-card warning"><h3>بيانات ناقصة</h3><p id="stat-incomplete">0</p></div>
            <div class="stat-card danger"><h3>ملاحظات هامة</h3><p id="stat-flagged">0</p></div>
        </div>

        <div class="toolbar">
            <div class="search-box">
                <i class="fas fa-search"></i>
                <input type="text" id="customer-search" placeholder="بحث بالاسم، الجوال، أو المدينة...">
            </div>
            <div class="action-buttons">
                <button onclick="exportToExcel()" class="btn-alt"><i class="fas fa-file-excel"></i> تصدير Excel</button>
                <button onclick="document.getElementById('import-excel').click()" class="btn-alt"><i class="fas fa-upload"></i> استيراد</button>
                <input type="file" id="import-excel" hidden accept=".xlsx, .xls">
                <button id="add-customer-btn" class="btn-primary-tera"><i class="fas fa-plus"></i> إضافة عميل جديد</button>
            </div>
        </div>
        
        <div class="table-container">
            <table class="tera-table" id="customers-table-main">
                <thead>
                    <tr>
                        <th>العميل</th>
                        <th>الاتصال</th>
                        <th>العنوان والترجمة</th>
                        <th>التصنيف</th>
                        <th>الإجراءات</th>
                    </tr>
                </thead>
                <tbody id="customers-list"></tbody>
            </table>
        </div>
    `;

    document.getElementById('add-customer-btn').onclick = () => window.openCustomerModal(); // يفترض وجود مودال الإضافة في ملف الـ HTML الرئيسي
    document.getElementById('customer-search').oninput = (e) => filterTable(e.target.value);
    document.getElementById('import-excel').onchange = (e) => importFromExcel(e);
    
    loadCustomers();
}

async function loadCustomers() {
    const listBody = document.getElementById('customers-list');
    if (!listBody) return;

    const q = query(collection(db, "customers"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    
    let stats = { total: 0, complete: 0, incomplete: 0, flagged: 0 };
    listBody.innerHTML = '';

    querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const id = docSnap.id;
        stats.total++;
        
        const hasFullAddress = data.city && data.buildingNo && data.postalCode;
        if (hasFullAddress) stats.complete++; else stats.incomplete++;

        listBody.innerHTML += `
            <tr class="customer-row">
                <td>
                    <div class="user-cell">
                        <div class="avatar-text">${(data.name || 'C').charAt(0)}</div>
                        <div class="info">
                            <span class="name">${data.name || 'بدون اسم'}</span>
                            <small>${data.email || 'لا يوجد بريد'}</small>
                        </div>
                    </div>
                </td>
                <td dir="ltr"><b>${data.countryCode || '+966'}</b> ${data.phone}</td>
                <td>
                    <div class="address-details">
                        <b>${data.city || 'غير محدد'}</b> - ${data.district || '-'}<br>
                        <small style="color: #64748b;">Building: ${data.buildingNo || '-'} | Zip: ${data.postalCode || '-'}</small>
                    </div>
                </td>
                <td><span class="status-badge ${data.tag === 'مميز' ? 'vip' : ''}">${data.tag || 'عادي'}</span></td>
                <td>
                    <div class="actions">
                        <button onclick="previewPrint('${id}')" class="act-btn print" title="فتح بطاقة الطباعة والترجمة">
                            <i class="fas fa-print"></i>
                        </button>
                        <button onclick="editCustomer('${id}')" class="act-btn edit" title="تعديل">
                            <i class="fas fa-pen"></i>
                        </button>
                        <button onclick="deleteCustomer('${id}')" class="act-btn del" title="حذف">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });

    document.getElementById('stat-total').innerText = stats.total;
    document.getElementById('stat-complete').innerText = stats.complete;
    document.getElementById('stat-incomplete').innerText = stats.incomplete;
}

/**
 * دالة الطباعة: تفتح الملف المستقل الذي أنشأناه سابقاً
 */
window.previewPrint = (id) => {
    // فتح صفحة الطباعة في نافذة جديدة بملف الرابط المخصص
    window.open(`print-card.html?id=${id}`, '_blank', 'width=1100,height=900,scrollbars=yes');
};

// --- وظائف استيراد وتصدير البيانات ---

window.exportToExcel = async () => {
    const querySnapshot = await getDocs(collection(db, "customers"));
    const data = querySnapshot.docs.map(doc => {
        const d = doc.data();
        return {
            "الاسم": d.name,
            "الجوال": d.phone,
            "المدينة": d.city,
            "الحي": d.district,
            "رقم المبنى": d.buildingNo,
            "الرمز البريدي": d.postalCode,
            "التصنيف": d.tag || "عادي"
        };
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "قائمة العملاء");
    XLSX.writeFile(wb, "Tera_System_Customers.xlsx");
};

async function importFromExcel(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(ws);

        const batch = writeBatch(db);
        data.forEach(row => {
            const newDocRef = doc(collection(db, "customers"));
            batch.set(newDocRef, {
                name: row["الاسم"] || "",
                phone: row["الجوال"] || "",
                city: row["المدينة"] || "",
                district: row["الحي"] || "",
                buildingNo: row["رقم المبنى"] || "",
                postalCode: row["الرمز البريدي"] || "",
                tag: row["التصنيف"] || "عادي",
                createdAt: new Date()
            });
        });
        
        await batch.commit();
        alert(`تم استيراد ${data.length} عميل بنجاح!`);
        loadCustomers();
    };
    reader.readAsBinaryString(file);
}

// --- الخدمات المساعدة ---

async function loadExternalLibs() {
    for (let lib in LIBS) {
        if (!document.querySelector(`script[src="${LIBS[lib]}"]`)) {
            const script = document.createElement('script');
            script.src = LIBS[lib];
            document.head.appendChild(script);
        }
    }
}

function filterTable(value) {
    const rows = document.querySelectorAll('.customer-row');
    const searchVal = value.toLowerCase();
    rows.forEach(row => {
        row.style.display = row.innerText.toLowerCase().includes(searchVal) ? '' : 'none';
    });
}

function injectStyles() {
    if (document.getElementById('tera-cust-styles')) return;
    const s = document.createElement('style');
    s.id = 'tera-cust-styles';
    s.innerHTML = `
        .user-cell { display: flex; align-items: center; gap: 12px; }
        .avatar-text { width: 38px; height: 38px; background: #3b82f6; color: white; display: flex; align-items: center; justify-content: center; border-radius: 10px; font-weight: bold; }
        .status-badge { padding: 4px 10px; border-radius: 6px; font-size: 0.75rem; background: #f1f5f9; font-weight: 700; }
        .status-badge.vip { background: #fef3c7; color: #92400e; border: 1px solid #fde68a; }
        .act-btn { border: none; padding: 8px; border-radius: 6px; cursor: pointer; transition: 0.2s; background: #f8fafc; color: #64748b; }
        .act-btn.print:hover { background: #1e293b; color: white; }
        .act-btn.edit:hover { background: #3b82f6; color: white; }
        .act-btn.del:hover { background: #ef4444; color: white; }
    `;
    document.head.appendChild(s);
}
