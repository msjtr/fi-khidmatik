/**
 * js/modules/customers-core.js
 * موديول إدارة العملاء - Tera Gateway
 */

import { db } from '../core/config.js';
import { collection, getDocs, doc, getDoc, query, orderBy, writeBatch } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const LIBS = {
    xlsx: "https://cdn.sheetjs.com/xlsx-0.19.3/package/dist/xlsx.full.min.js"
};

// دالة لجلب بيانات عميل واحد (يستخدمها ملف الطباعة)
export async function getCustomerById(id) {
    try {
        const docRef = doc(db, "customers", id);
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? docSnap.data() : null;
    } catch (e) {
        console.error("Error fetching customer:", e);
        return null;
    }
}

export async function initCustomers(container) {
    await loadExternalLibs();
    injectStyles();

    container.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card"><h3>إجمالي العملاء</h3><p id="stat-total">0</p></div>
            <div class="stat-card success"><h3>بيانات مكتملة</h3><p id="stat-complete">0</p></div>
            <div class="stat-card warning"><h3>بيانات ناقصة</h3><p id="stat-incomplete">0</p></div>
            <div class="stat-card danger"><h3>ملاحظات</h3><p id="stat-flagged">0</p></div>
        </div>

        <div class="toolbar">
            <div class="search-box">
                <i class="fas fa-search"></i>
                <input type="text" id="customer-search" placeholder="بحث بالاسم، الجوال...">
            </div>
            <div class="action-buttons">
                <button onclick="exportToExcel()" class="btn-alt"><i class="fas fa-file-excel"></i> تصدير</button>
                <button id="add-customer-btn" class="btn-primary-tera"><i class="fas fa-plus"></i> إضافة عميل</button>
            </div>
        </div>
        
        <div class="table-container">
            <table class="tera-table">
                <thead>
                    <tr>
                        <th>العميل</th>
                        <th>الاتصال</th>
                        <th>العنوان</th>
                        <th>التصنيف</th>
                        <th>الإجراءات</th>
                    </tr>
                </thead>
                <tbody id="customers-list"></tbody>
            </table>
        </div>
    `;

    document.getElementById('customer-search').oninput = (e) => filterTable(e.target.value);
    loadCustomers();
}

async function loadCustomers() {
    const listBody = document.getElementById('customers-list');
    if (!listBody) return;

    const q = query(collection(db, "customers"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    
    let stats = { total: 0, complete: 0, incomplete: 0 };
    listBody.innerHTML = '';

    querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const id = docSnap.id;
        stats.total++;
        
        const isComplete = data.city && data.district && data.phone;
        if (isComplete) stats.complete++; else stats.incomplete++;

        listBody.innerHTML += `
            <tr class="customer-row">
                <td>
                    <div class="user-cell">
                        <div class="avatar-text">${(data.name || 'C').charAt(0)}</div>
                        <div class="info">
                            <span class="name">${data.name || 'بدون اسم'}</span>
                            <small>${data.email || '-'}</small>
                        </div>
                    </div>
                </td>
                <td dir="ltr"><b>${data.countryCode || '+966'}</b> ${data.phone}</td>
                <td>${data.city || '-'} - ${data.district || '-'}</td>
                <td><span class="status-badge ${data.tag === 'مميز' ? 'vip' : ''}">${data.tag || 'عادي'}</span></td>
                <td>
                    <div class="actions">
                        <button onclick="previewPrint('${id}')" class="act-btn print" title="طباعة وترجمة">
                            <i class="fas fa-print"></i>
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

window.previewPrint = (id) => {
    window.open(`print-card.html?id=${id}`, '_blank', 'width=1100,height=900');
};

window.exportToExcel = async () => {
    if (typeof XLSX === 'undefined') return alert("جاري تحميل المكتبة...");
    const querySnapshot = await getDocs(collection(db, "customers"));
    const data = querySnapshot.docs.map(doc => doc.data());
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "العملاء");
    XLSX.writeFile(wb, "Tera_Customers.xlsx");
};

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
    if (document.getElementById('tera-cust-styles')) return;
    const s = document.createElement('style');
    s.id = 'tera-cust-styles';
    s.innerHTML = `
        .user-cell { display: flex; align-items: center; gap: 12px; }
        .avatar-text { width: 35px; height: 35px; background: #1e293b; color: white; display: flex; align-items: center; justify-content: center; border-radius: 8px; font-weight: bold; }
        .status-badge { padding: 4px 8px; border-radius: 4px; font-size: 0.7rem; background: #f1f5f9; font-weight: bold; }
        .status-badge.vip { background: #fef3c7; color: #92400e; }
        .act-btn { border: none; padding: 7px; border-radius: 5px; cursor: pointer; background: #f8fafc; }
        .act-btn.print:hover { background: #1e293b; color: #fff; }
    `;
    document.head.appendChild(s);
}
