/**
 * نظام إدارة العملاء المتكامل لـ Tera Gateway
 * الإصدار المستقر: يعالج أخطاء التوقيت، ويوحد مفاتيح الدول، ويفعل الإحصائيات
 */

import { db } from '../core/config.js';
import { collection, query, onSnapshot, doc, setDoc, deleteDoc, updateDoc, getDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const worldCountries = [
    { name: "المملكة العربية السعودية", code: "966", flag: "🇸🇦", pattern: "5" },
    { name: "الإمارات", code: "971", flag: "🇦🇪", pattern: "" },
    { name: "الكويت", code: "965", flag: "🇰🇼", pattern: "" },
    { name: "البحرين", code: "973", flag: "🇧🇭", pattern: "" },
    { name: "عمان", code: "968", flag: "🇴🇲", pattern: "" },
    { name: "قطر", code: "974", flag: "🇶🇦", pattern: "" },
    { name: "مصر", code: "20", flag: "🇪🇬", pattern: "" }
];

export async function initCustomers(container) {
    if (!container) return;

    container.innerHTML = `
        <div class="tera-stats-grid" id="statsGrid"></div>
        <div class="customers-header">
            <div class="search-and-filter">
                <div class="search-bar">
                    <i class="fas fa-search"></i>
                    <input type="text" id="searchCust" placeholder="ابحث بالاسم، الرقم، أو المدينة...">
                </div>
                <select id="classFilter">
                    <option value="">جميع التصنيفات</option>
                    <option value="مميز">عميل مميز</option>
                    <option value="محتال">عميل محتال</option>
                    <option value="غير جدي">غير جدي</option>
                    <option value="غير متعاون">غير متعاون</option>
                </select>
            </div>
            <button class="btn-primary" id="openAddModal">
                <i class="fas fa-user-plus"></i> إضافة عميل جديد
            </button>
        </div>
        <div id="customersTableContainer">
            <div class="tera-loader">جاري جلب البيانات...</div>
        </div>
    `;

    document.getElementById('openAddModal').onclick = () => openCustomerModal();

    const q = query(collection(db, "customers"));
    onSnapshot(q, (snapshot) => {
        const customers = [];
        snapshot.forEach((doc) => customers.push({ id: doc.id, ...doc.data() }));
        renderStats(customers);
        applyFilters(customers);
    });
}

function renderStats(data) {
    const now = new Date();
    const stats = {
        total: data.length,
        new: data.filter(c => {
            let d = c.createdAt?.toDate ? c.createdAt.toDate() : (c.createdAt ? new Date(c.createdAt) : null);
            return d && (now - d) < (7 * 24 * 60 * 60 * 1000);
        }).length,
        complete: data.filter(c => c.name && c.phone && c.city).length,
        incomplete: data.filter(c => !c.name || !c.phone).length,
        withNotes: data.filter(c => c.notes && c.notes.trim() !== "").length
    };

    const grid = document.getElementById('statsGrid');
    if (grid) {
        grid.innerHTML = `
            <div class="stat-card"><span>إجمالي العملاء</span><strong>${stats.total}</strong></div>
            <div class="stat-card"><span>جدد (أسبوع)</span><strong>${stats.new}</strong></div>
            <div class="stat-card success"><span>مكتمل البيانات</span><strong>${stats.complete}</strong></div>
            <div class="stat-card warning"><span>نقص بيانات</span><strong>${stats.incomplete}</strong></div>
            <div class="stat-card info"><span>ملاحظات</span><strong>${stats.withNotes}</strong></div>
        `;
    }
}

function applyFilters(customers) {
    const search = document.getElementById('searchCust');
    const filter = document.getElementById('classFilter');
    
    const exec = () => {
        const term = search.value.toLowerCase();
        const cat = filter.value;
        const result = customers.filter(c => {
            const matchSearch = (c.name||"").toLowerCase().includes(term) || (c.phone||"").includes(term) || (c.city||"").toLowerCase().includes(term);
            const matchCat = cat === "" || c.classification === cat;
            return matchSearch && matchCat;
        });
        renderTable(result);
    };
    search.oninput = exec;
    filter.onchange = exec;
    exec();
}

function renderTable(data) {
    const container = document.getElementById('customersTableContainer');
    container.innerHTML = `
        <table class="tera-list-table">
            <thead>
                <tr>
                    <th>العميل</th>
                    <th>الاتصال</th>
                    <th>العنوان الوطني</th>
                    <th>التصنيف</th>
                    <th>الإجراءات</th>
                </tr>
            </thead>
            <tbody>
                ${data.map(c => `
                    <tr>
                        <td>
                            <div class="user-cell">
                                <div class="user-avatar">${(c.name||"C").charAt(0)}</div>
                                <div><strong>${c.name||'---'}</strong><br><small>ID: ${c.id.slice(0,6)}</small></div>
                            </div>
                        </td>
                        <td dir="ltr">+${c.phone||''}</td>
                        <td>${c.city||'حائل'} - ${c.district||''}</td>
                        <td><span class="badge ${c.classification}">${c.classification||'غير مصنف'}</span></td>
                        <td>
                            <button onclick="openCustomerModal('${c.id}')" class="act-btn"><i class="fas fa-edit"></i></button>
                            <button onclick="deleteCustomer('${c.id}')" class="act-btn del"><i class="fas fa-trash"></i></button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

window.openCustomerModal = async function(id = null) {
    let customer = null;
    if (id) {
        const snap = await getDoc(doc(db, "customers", id));
        customer = { id: snap.id, ...snap.data() };
    }

    const modalHTML = `
        <div class="tera-modal-overlay" id="custModal">
            <div class="tera-modal wide">
                <div class="m-header">
                    <h3>${customer ? 'تعديل بيانات العميل' : 'إضافة عميل جديد'}</h3>
                    <button onclick="document.getElementById('custModal').remove()">&times;</button>
                </div>
                <form id="saveCustForm">
                    <div class="m-body">
                        <div class="form-grid">
                            <div class="field"><label>الاسم الكامل</label><input type="text" id="f_name" value="${customer?.name||''}" required></div>
                            <div class="field"><label>البريد</label><input type="email" id="f_email" value="${customer?.email||''}"></div>
                            <div class="field">
                                <label>الدولة</label>
                                <select id="f_country" onchange="document.getElementById('f_code_display').innerText = '+' + this.selectedOptions[0].dataset.code">
                                    ${worldCountries.map(ct => `<option value="${ct.name}" data-code="${ct.code}" ${customer?.country === ct.name ? 'selected' : ''}>${ct.flag} ${ct.name}</option>`).join('')}
                                </select>
                            </div>
                            <div class="field">
                                <label>الجوال</label>
                                <div class="dual-input">
                                    <span id="f_code_display">+${customer?.phone ? worldCountries.find(x => customer.phone.startsWith(x.code))?.code || '966' : '966'}</span>
                                    <input type="tel" id="f_phone" value="${customer?.phone ? customer.phone.replace(/^(966|971|965|973|968|974|20)/, '') : ''}" placeholder="5xxxxxxxx" required>
                                </div>
                            </div>
                        </div>
                        <div class="form-grid mt-20">
                            <div class="field"><label>المدينة</label><input type="text" id="f_city" value="${customer?.city||'حائل'}"></div>
                            <div class="field"><label>صندوق البريد</label><input type="text" id="f_pobox" value="${customer?.poBox||''}" oninput="document.getElementById('f_zip').value = this.value"></div>
                            <div class="field"><label>الرمز البريدي</label><input type="text" id="f_zip" value="${customer?.postalCode||''}"></div>
                            <div class="field">
                                <label>التصنيف</label>
                                <select id="f_class">
                                    <option value="">اختر..</option>
                                    <option value="مميز" ${customer?.classification==='مميز'?'selected':''}>مميز</option>
                                    <option value="محتال" ${customer?.classification==='محتال'?'selected':''}>محتال</option>
                                </select>
                            </div>
                        </div>
                        <div class="field full mt-20"><label>ملاحظات</label><textarea id="f_notes" rows="3">${customer?.notes||''}</textarea></div>
                    </div>
                    <div class="m-footer"><button type="submit" class="btn-save">حفظ</button></div>
                </form>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    document.getElementById('saveCustForm').onsubmit = async (e) => {
        e.preventDefault();
        const code = document.getElementById('f_country').selectedOptions[0].dataset.code;
        const data = {
            name: document.getElementById('f_name').value,
            country: document.getElementById('f_country').value,
            phone: code + document.getElementById('f_phone').value.replace(/^0/, ''),
            city: document.getElementById('f_city').value,
            poBox: document.getElementById('f_pobox').value,
            postalCode: document.getElementById('f_zip').value,
            classification: document.getElementById('f_class').value,
            notes: document.getElementById('f_notes').value,
            updatedAt: serverTimestamp()
        };
        if (id) await updateDoc(doc(db, "customers", id), data);
        else { data.createdAt = serverTimestamp(); await setDoc(doc(collection(db, "customers")), data); }
        document.getElementById('custModal').remove();
    };
};

window.deleteCustomer = async (id) => {
    if(confirm("حذف العميل؟")) await deleteDoc(doc(db, "customers", id));
};
