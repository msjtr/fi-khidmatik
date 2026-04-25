import { db } from '../core/config.js';
import { 
    collection, getDocs, doc, getDoc, query, orderBy 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { UI } from './customers-ui.js';

export async function initCustomers(container) {
    if (!container) return;
    container.innerHTML = UI.renderMainLayout();
    
    // ربط البحث
    const searchInput = document.getElementById('customer-search');
    if (searchInput) searchInput.oninput = (e) => filterTable(e.target.value);

    await loadCustomers();
}

async function loadCustomers() {
    const listBody = document.getElementById('customers-list');
    try {
        const q = query(collection(db, "customers"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        
        let stats = { total: 0, complete: 0, incomplete: 0, flagged: 0 };
        let rowsHtml = '';

        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const id = docSnap.id;
            
            stats.total++;
            // فحص البيانات (الجوال، الهوية، المدينة)
            const isComplete = data.phone && data.idNumber && data.city;
            if (isComplete) stats.complete++; else stats.incomplete++;
            if (data.notes) stats.flagged++;

            rowsHtml += UI.renderCustomerRow(id, data);
        });

        listBody.innerHTML = rowsHtml;
        updateStatsUI(stats);
    } catch (error) {
        console.error("خطأ جلب البيانات:", error);
    }
}

// --- ربط الدوال بالنطاق العام (لتعمل الأزرار داخل الجدول) ---

window.previewPrint = (id) => {
    window.open(`print-card.html?id=${id}`, '_blank', 'width=1100,height=900');
};

window.editCustomer = (id) => {
    if (typeof window.openCustomerModal === 'function') {
        window.openCustomerModal(id);
    } else {
        console.error("دالة openCustomerModal غير موجودة في index.html");
    }
};

window.exportToExcel = () => {
    alert("جاري تجهيز تقرير Excel...");
};

function updateStatsUI(stats) {
    if (document.getElementById('stat-total')) document.getElementById('stat-total').innerText = stats.total;
    if (document.getElementById('stat-complete')) document.getElementById('stat-complete').innerText = stats.complete;
    if (document.getElementById('stat-incomplete')) document.getElementById('stat-incomplete').innerText = stats.incomplete;
    if (document.getElementById('stat-flagged')) document.getElementById('stat-flagged').innerText = stats.flagged;
}

function filterTable(value) {
    const rows = document.querySelectorAll('.customer-row-fade');
    const searchVal = value.toLowerCase().trim();
    rows.forEach(row => {
        row.style.display = row.innerText.toLowerCase().includes(searchVal) ? '' : 'none';
    });
}
