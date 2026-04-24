/**
 * js/modules/customers-core.js
 * موديول إدارة العملاء الاحترافي - Tera Gateway
 * التحديث: ربط نظام الطباعة المنفصل وتحسين استقرار البيانات
 */

import { db } from '../core/config.js';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy, writeBatch } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// المكتبات الخارجية المطلوبة
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
                <input type="text" id="customer-search" placeholder="بحث ذكي (اسم، جوال، حي)...">
            </div>
            <div class="action-buttons">
                <button onclick="exportToExcel()" class="btn-alt"><i class="fas fa-file-excel"></i> تصدير Excel</button>
                <button onclick="document.getElementById('import-excel').click()" class="btn-alt"><i class="fas fa-upload"></i> استيراد</button>
                <input type="file" id="import-excel" hidden accept=".xlsx, .xls">
                <button id="add-customer-btn" class="btn-primary-tera"><i class="fas fa-plus"></i> إضافة عميل</button>
            </div>
        </div>
        
        <div class="table-container">
            <table class="tera-table" id="customers-table-main">
                <thead>
                    <tr>
                        <th>العميل</th>
                        <th>الاتصال</th>
                        <th>العنوان الوطني</th>
                        <th>الحالة</th>
                        <th>الإجراءات</th>
                    </tr>
                </thead>
                <tbody id="customers-list"></tbody>
            </table>
        </div>
    `;

    document.getElementById('add-customer-btn').onclick = () => openCustomerModal();
    document.getElementById('customer-search').oninput = (e) => filterTable(e.target.value);
    document.getElementById('import-excel').onchange = (e) => importFromExcel(e);
    
    loadCustomers();
}

async function loadCustomers() {
    const listBody = document.getElementById('customers-list');
    const q = query(collection(db, "customers"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    
    let stats = { total: 0, complete: 0, incomplete: 0, flagged: 0 };
    listBody.innerHTML = '';

    querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const id = docSnap.id;
        stats.total++;
        
        const cleanData = {
            city: data.city || 'غير محدد',
            district: data.district || 'غير محدد',
            buildingNo: data.buildingNo || '-',
            postalCode: data.postalCode || '-',
            name: data.name || 'عميل بدون اسم'
        };

        if (cleanData.buildingNo === '-' || cleanData.postalCode === '-') stats.incomplete++; else stats.complete++;

        listBody.innerHTML += `
            <tr class="customer-row">
                <td>
                    <div class="user-cell">
                        <div class="avatar-text">${cleanData.name.charAt(0)}</div>
                        <div class="info">
                            <span class="name">${cleanData.name}</span>
                            <small>${data.email || 'لا يوجد بريد'}</small>
                        </div>
                    </div>
                </td>
                <td dir="ltr"><b>${data.countryCode || '+966'}</b> ${data.phone}</td>
                <td>
                    <div class="address-details">
                        <b>${cleanData.city}</b> - ${cleanData.district}<br>
                        <small>مبنى: ${cleanData.buildingNo} | رمز: ${cleanData.postalCode}</small>
                    </div>
                </td>
                <td><span class="status-badge">${data.tag || 'عادي'}</span></td>
                <td>
                    <div class="actions">
                        <button onclick="previewPrint('${id}')" class="act-btn print" title="فتح بطاقة الطباعة"><i class="fas fa-print"></i></button>
                        <button onclick="editCustomer('${id}')" class="act-btn edit"><i class="fas fa-pen"></i></button>
                        <button onclick="deleteCustomer('${id}')" class="act-btn del"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            </tr>
        `;
    });

    document.getElementById('stat-total').innerText = stats.total;
    document.getElementById('stat-complete').innerText = stats.complete;
    document.getElementById('stat-incomplete').innerText = stats.incomplete;
}

// --- تحديث وظيفة الطباعة لفتح الملف المستقل ---
window.previewPrint = (id) => {
    // فتح صفحة الطباعة الاحترافية في نافذة جديدة مع تمرير معرف العميل
    window.open(`print-card.html?id=${id}`, '_blank', 'width=1000,height=800,scrollbars=yes');
};

// --- وظائف Excel (تصدير واستيراد) ---
window.exportToExcel = async () => {
    const querySnapshot = await getDocs(collection(db, "customers"));
    const data = querySnapshot.docs.map(doc => {
        const d = doc.data();
        return {
            "الاسم": d.name,
            "الجوال": d.phone,
            "المدينة": d.city,
            "الحي": d.district,
            "الشارع": d.street,
            "رقم المبنى": d.buildingNo,
            "الرمز البريدي": d.postalCode,
            "ملاحظات": d.notes
        };
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "العملاء");
    XLSX.writeFile(wb, "Tera_Customers_Export.xlsx");
};

async function importFromExcel(e) {
    const file = e.target.files[0];
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
                createdAt: new Date()
            });
        });
        await batch.commit();
        alert("تم استيراد البيانات بنجاح!");
        loadCustomers();
    };
    reader.readAsBinaryString(file);
}

// --- خدمات النظام المساعدة ---
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
    rows.forEach(row => {
        row.style.display = row.innerText.toLowerCase().includes(value.toLowerCase()) ? '' : 'none';
    });
}

function injectStyles() {
    if (document.getElementById('tera-main-styles')) return;
    const s = document.createElement('style');
    s.id = 'tera-main-styles';
    s.innerHTML = `
        .toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; gap: 15px; background: white; padding: 15px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
        .action-buttons { display: flex; gap: 10px; }
        .btn-alt { background: #f8fafc; border: 1px solid #e2e8f0; padding: 10px 18px; border-radius: 8px; cursor: pointer; color: #475569; font-weight: 600; transition: 0.3s; }
        .btn-alt:hover { background: #e2e8f0; }
        
        .avatar-text { width: 40px; height: 40px; background: linear-gradient(135deg, #e67e22, #f39c12); color: white; display: flex; align-items: center; justify-content: center; border-radius: 50%; font-weight: bold; font-size: 1.1rem; }
        .status-badge { padding: 4px 12px; border-radius: 20px; font-size: 0.8rem; background: #f1f5f9; color: #64748b; font-weight: bold; }
        
        .act-btn { width: 35px; height: 35px; border: none; border-radius: 8px; cursor: pointer; margin: 0 2px; transition: 0.2s; }
        .act-btn.print { background: #ecf0f1; color: #2c3e50; }
        .act-btn.print:hover { background: #34495e; color: white; }
    `;
    document.head.appendChild(s);
}
