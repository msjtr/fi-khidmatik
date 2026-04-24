import { db } from '../core/config.js';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// بيانات الدول والتصنيفات
const countryData = [
    { name: "السعودية", code: "+966", flag: "🇸🇦" },
    { name: "الإمارات", code: "+971", flag: "🇦🇪" },
    { name: "الكويت", code: "+965", flag: "🇰🇼" },
    { name: "مصر", code: "+20", flag: "🇪🇬" }
];

const customerTags = {
    "normal": { label: "عميل عادي", icon: "fa-user", color: "#64748b" },
    "vip": { label: "عميل مميز", icon: "fa-star", color: "#f1c40f" },
    "scammer": { label: "عميل محتال", icon: "fa-user-secret", color: "#e74c3c" },
    "unserious": { label: "غير جدي", icon: "fa-user-slash", color: "#95a5a6" },
    "uncooperative": { label: "غير متعاون", icon: "fa-handshake-slash", color: "#e67e22" }
};

export async function initCustomers(container) {
    // إضافة التنسيقات برمجياً لضمان ظهور التغييرات فوراً
    injectStyles();

    container.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card"><h3>إجمالي العملاء</h3><p id="stat-total">0</p><i class="fas fa-users icon"></i></div>
            <div class="stat-card success"><h3>مكتملي البيانات</h3><p id="stat-complete">0</p><i class="fas fa-check-circle icon"></i></div>
            <div class="stat-card warning"><h3>بيانات ناقصة</h3><p id="stat-incomplete">0</p><i class="fas fa-exclamation-triangle icon"></i></div>
            <div class="stat-card danger"><h3>ملاحظات سلبية</h3><p id="stat-flagged">0</p><i class="fas fa-user-shield icon"></i></div>
        </div>

        <div class="module-header">
            <div class="search-box">
                <i class="fas fa-search"></i>
                <input type="text" id="customer-search" placeholder="بحث باسم العميل، المدينة، أو رقم الجوال...">
            </div>
            <button id="add-customer-btn" class="btn-primary-tera"><i class="fas fa-plus"></i> إضافة عميل جديد</button>
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
                <tbody id="customers-list">
                    <tr><td colspan="5" style="text-align:center; padding:30px;">جاري تحميل البيانات...</td></tr>
                </tbody>
            </table>
        </div>
    `;

    document.getElementById('add-customer-btn').onclick = () => openCustomerModal();
    document.getElementById('customer-search').oninput = (e) => filterTable(e.target.value);
    
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
        
        // حساب الإحصائيات
        const isIncomplete = !data.buildingNo || !data.postalCode;
        if (isIncomplete) stats.incomplete++; else stats.complete++;
        if (['scammer', 'uncooperative'].includes(data.tag)) stats.flagged++;

        const tagInfo = customerTags[data.tag || 'normal'];
        const avatar = data.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=random&color=fff`;

        listBody.innerHTML += `
            <tr class="customer-row">
                <td>
                    <div class="user-cell">
                        <img src="${avatar}" class="avatar">
                        <div class="info">
                            <span class="name">${data.name}</span>
                            <span class="email">${data.email || 'بدون بريد'}</span>
                        </div>
                    </div>
                </td>
                <td dir="ltr">
                    <span class="code">${data.countryCode || ''}</span> ${data.phone}
                </td>
                <td>
                    <div class="addr">
                        <i class="fas fa-map-pin"></i> ${data.city} - ${data.district || '-'}<br>
                        <small>مبنى: ${data.buildingNo || '؟'} | رمز: ${data.postalCode || '؟'}</small>
                    </div>
                </td>
                <td>
                    <span class="tag-badge" style="background:${tagInfo.color}20; color:${tagInfo.color}; border: 1px solid ${tagInfo.color}40">
                        <i class="fas ${tagInfo.icon}"></i> ${tagInfo.label}
                    </span>
                </td>
                <td>
                    <div class="actions">
                        <button onclick="editCustomer('${id}')" class="act-btn edit"><i class="fas fa-pen"></i></button>
                        <button onclick="printCustomer('${id}')" class="act-btn print"><i class="fas fa-print"></i></button>
                        <button onclick="deleteCustomer('${id}')" class="act-btn del"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            </tr>
        `;
    });

    document.getElementById('stat-total').innerText = stats.total;
    document.getElementById('stat-complete').innerText = stats.complete;
    document.getElementById('stat-incomplete').innerText = stats.incomplete;
    document.getElementById('stat-flagged').innerText = stats.flagged;
}

// دالة التصميم (CSS) المحقونة
function injectStyles() {
    if (document.getElementById('customers-styles')) return;
    const style = document.createElement('style');
    style.id = 'customers-styles';
    style.innerHTML = `
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .stat-card { background: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.02); position: relative; border-bottom: 4px solid #3b82f6; }
        .stat-card h3 { font-size: 0.85rem; color: #64748b; margin-bottom: 10px; }
        .stat-card p { font-size: 1.8rem; font-weight: 800; color: #1e293b; }
        .stat-card .icon { position: absolute; left: 20px; bottom: 20px; font-size: 2rem; opacity: 0.1; }
        .stat-card.success { border-color: #10b981; }
        .stat-card.warning { border-color: #f59e0b; }
        .stat-card.danger { border-color: #ef4444; }

        .module-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; gap: 20px; }
        .search-box { flex: 1; position: relative; }
        .search-box i { position: absolute; right: 15px; top: 12px; color: #94a3b8; }
        .search-box input { width: 100%; padding: 10px 40px 10px 15px; border-radius: 8px; border: 1px solid #e2e8f0; outline: none; }
        
        .btn-primary-tera { background: #e67e22; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px; }

        .user-cell { display: flex; align-items: center; gap: 12px; }
        .user-cell .avatar { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; background: #f1f5f9; }
        .user-cell .name { display: block; font-weight: 700; color: #1e293b; }
        .user-cell .email { font-size: 0.75rem; color: #94a3b8; }

        .tag-badge { padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; display: inline-flex; align-items: center; gap: 5px; }
        
        .actions { display: flex; gap: 8px; }
        .act-btn { width: 32px; height: 32px; border-radius: 6px; border: none; cursor: pointer; transition: 0.2s; }
        .act-btn.edit { background: #eff6ff; color: #3b82f6; }
        .act-btn.print { background: #f0fdf4; color: #22c55e; }
        .act-btn.del { background: #fef2f2; color: #ef4444; }
        .act-btn:hover { transform: translateY(-2px); filter: brightness(0.9); }
    `;
    document.head.appendChild(style);
}

// ... بقية دوال الحفظ والفتح (Modal) كما هي في الكود السابق ...
