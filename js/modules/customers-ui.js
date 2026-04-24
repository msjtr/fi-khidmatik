import { db } from '../core/firebase.js';
import { 
    collection, query, onSnapshot, orderBy, 
    doc, addDoc, deleteDoc, updateDoc, getDoc, 
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

console.log('✅ تم تحديث نظام العملاء: معالجة الأخطاء وتفعيل الحقول الجديدة');

export async function initCustomers(container) {
    if (!container) return;
    
    container.innerHTML = `
        <div style="padding: 20px; font-family: 'Tajawal', sans-serif; direction: rtl;">
            <div id="stats-dashboard" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-bottom: 25px;">
                <div style="background:#fff; padding:15px; border-radius:12px; box-shadow:0 2px 8px rgba(0,0,0,0.05); border-top:4px solid #3498db;">
                    <small style="color:#7f8c8d;">إجمالي العملاء</small>
                    <div id="count-total" style="font-size:20px; font-weight:bold;">0</div>
                </div>
                <div style="background:#fff; padding:15px; border-radius:12px; box-shadow:0 2px 8px rgba(0,0,0,0.05); border-top:4px solid #27ae60;">
                    <small style="color:#7f8c8d;">بيانات مكتملة</small>
                    <div id="count-complete" style="font-size:20px; font-weight:bold;">0</div>
                </div>
                <div style="background:#fff; padding:15px; border-radius:12px; box-shadow:0 2px 8px rgba(0,0,0,0.05); border-top:4px solid #f1c40f;">
                    <small style="color:#7f8c8d;">عملاء مميزون</small>
                    <div id="count-vip" style="font-size:20px; font-weight:bold;">0</div>
                </div>
                <div style="background:#fff; padding:15px; border-radius:12px; box-shadow:0 2px 8px rgba(0,0,0,0.05); border-top:4px solid #e74c3c;">
                    <small style="color:#7f8c8d;">محتالون/تنبيه</small>
                    <div id="count-fraud" style="font-size:20px; font-weight:bold;">0</div>
                </div>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2 style="margin:0; color:#2c3e50;"><i class="fas fa-address-book"></i> إدارة سجل العملاء</h2>
                <button id="btn-new-cust" style="background:#27ae60; color:white; border:none; padding:10px 20px; border-radius:8px; cursor:pointer; font-weight:bold;">
                    <i class="fas fa-plus-circle"></i> إضافة عميل جديد
                </button>
            </div>

            <div style="background: white; padding: 15px; border-radius: 12px; margin-bottom: 20px; display: flex; gap: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                <input type="text" id="cust-search" placeholder="بحث بالاسم، الجوال، أو الحي..." style="flex:3; padding:10px; border:1px solid #ddd; border-radius:8px;">
                <select id="filter-class" style="flex:1; padding:10px; border:1px solid #ddd; border-radius:8px;">
                    <option value="">كل التصنيفات</option>
                    <option value="مميز">مميز</option>
                    <option value="محتال">محتال</option>
                    <option value="غير جدي">غير جدي</option>
                </select>
            </div>

            <div id="table-wrapper"></div>
        </div>
    `;

    document.getElementById('btn-new-cust').onclick = () => openCustomerModal();
    document.getElementById('cust-search').oninput = applyFilters;
    document.getElementById('filter-class').onchange = applyFilters;

    startLiveUpdate();
}

function startLiveUpdate() {
    const q = query(collection(db, "customers"), orderBy("createdAt", "desc"));
    onSnapshot(q, (snapshot) => {
        const data = [];
        snapshot.forEach(doc => data.push({ id: doc.id, ...doc.data() }));
        renderCustomerTable(data);
        runAnalytics(data);
    });
}

function runAnalytics(customers) {
    document.getElementById('count-total').innerText = customers.length;
    document.getElementById('count-complete').innerText = customers.filter(c => c.buildingNo && c.postalCode).length;
    document.getElementById('count-vip').innerText = customers.filter(c => c.classification === 'مميز').length;
    document.getElementById('count-fraud').innerText = customers.filter(c => c.classification === 'محتال').length;
}

function renderCustomerTable(customers) {
    const wrapper = document.getElementById('table-wrapper');
    let html = `
        <div style="overflow-x:auto;">
            <table style="width:100%; border-collapse:collapse; background:white; border-radius:12px; overflow:hidden;">
                <thead style="background:#f8fafc; border-bottom:2px solid #edf2f7;">
                    <tr>
                        <th style="padding:15px; text-align:right;">العميل</th>
                        <th style="padding:15px; text-align:center;">الاتصال</th>
                        <th style="padding:15px; text-align:center;">العنوان الوطني</th>
                        <th style="padding:15px; text-align:center;">الحالة</th>
                        <th style="padding:15px; text-align:center;">الإجراءات</th>
                    </tr>
                </thead>
                <tbody>
    `;

    customers.forEach(c => {
        // حل مشكلة undefined عبر وضع قيم افتراضية
        const phoneDisplay = `${c.countryCode || '+966'}${c.phone || ''}`;
        const addressDisplay = `${c.city || 'حائل'} - ${c.district || 'غير محدد'}`;
        const badgeColor = c.classification === 'محتال' ? '#e74c3c' : (c.classification === 'مميز' ? '#27ae60' : '#95a5a6');

        html += `
            <tr class="cust-row" data-search="${c.name} ${c.phone} ${c.city}" data-class="${c.classification}" style="border-bottom:1px solid #eee;">
                <td style="padding:15px;">
                    <div style="display:flex; align-items:center; gap:10px;">
                        <div style="width:35px; height:35px; background:#e67e22; color:white; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:bold;">
                            ${(c.name || 'ع').charAt(0)}
                        </div>
                        <div>
                            <div style="font-weight:bold;">${c.name || 'اسم غير معروف'}</div>
                            <small style="color:#999;">ID: ${c.id.slice(-5)}</small>
                        </div>
                    </div>
                </td>
                <td style="padding:15px; text-align:center; direction:ltr;">${phoneDisplay}</td>
                <td style="padding:15px; text-align:center;">
                    <div>${addressDisplay}</div>
                    <small style="color:#7f8c8d;">مبنى: ${c.buildingNo || '-'} | رمز: ${c.postalCode || '-'}</small>
                </td>
                <td style="padding:15px; text-align:center;">
                    <span style="background:${badgeColor}; color:white; padding:3px 10px; border-radius:15px; font-size:12px;">
                        ${c.classification || 'عميل عادي'}
                    </span>
                </td>
                <td style="padding:15px; text-align:center;">
                    <button onclick="openCustomerModal('${c.id}')" style="color:#3498db; border:none; background:none; cursor:pointer; margin:0 5px;"><i class="fas fa-edit"></i></button>
                    <button onclick="deleteCust('${c.id}')" style="color:#e74c3c; border:none; background:none; cursor:pointer; margin:0 5px;"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `;
    });

    html += `</tbody></table></div>`;
    wrapper.innerHTML = html;
}

function applyFilters() {
    const s = document.getElementById('cust-search').value.toLowerCase();
    const f = document.getElementById('filter-class').value;
    document.querySelectorAll('.cust-row').forEach(row => {
        const matchS = row.dataset.search.toLowerCase().includes(s);
        const matchF = !f || row.dataset.class === f;
        row.style.display = (matchS && matchF) ? "" : "none";
    });
}

// نافذة الإضافة والتعديل التي تدمج حقول مستند Word 
window.openCustomerModal = async (id = null) => {
    let d = { name:'', phone:'', countryCode:'966', city:'حائل', district:'', buildingNo:'', postalCode:'', classification:'', notes:'' };
    if(id) {
        const s = await getDoc(doc(db, "customers", id));
        if(s.exists()) d = s.data();
    }

    const m = document.createElement('div');
    m.style = "position:fixed; inset:0; background:rgba(0,0,0,0.7); display:flex; align-items:center; justify-content:center; z-index:9999; padding:20px;";
    m.innerHTML = `
        <div style="background:white; width:100%; max-width:600px; border-radius:15px; overflow:hidden; font-family:'Tajawal';">
            <div style="background:#2c3e50; color:white; padding:15px; display:flex; justify-content:space-between;">
                <h3 style="margin:0;">${id ? 'تحديث بيانات العميل' : 'إضافة عميل جديد'}</h3>
                <button onclick="this.closest('div').parentElement.parentElement.remove()" style="background:none; border:none; color:white; cursor:pointer; font-size:20px;">&times;</button>
            </div>
            <form id="cust-form" style="padding:20px; display:grid; grid-template-columns:1fr 1fr; gap:15px;">
                <div style="grid-column: span 2;"><label>الاسم الكامل</label><input name="name" value="${d.name}" required style="width:100%; padding:8px; border:1px solid #ddd; border-radius:5px;"></div>
                <div><label>كود الدولة</label><input name="countryCode" value="${d.countryCode}" style="width:100%; padding:8px; border:1px solid #ddd; border-radius:5px; direction:ltr;"></div>
                <div><label>رقم الجوال</label><input name="phone" value="${d.phone}" required style="width:100%; padding:8px; border:1px solid #ddd; border-radius:5px; direction:ltr;"></div>
                <div><label>المدينة</label><input name="city" value="${d.city}" style="width:100%; padding:8px; border:1px solid #ddd; border-radius:5px;"></div>
                <div><label>الحي</label><input name="district" value="${d.district}" style="width:100%; padding:8px; border:1px solid #ddd; border-radius:5px;"></div>
                <div><label>رقم المبنى</label><input name="buildingNo" value="${d.buildingNo}" style="width:100%; padding:8px; border:1px solid #ddd; border-radius:5px;"></div>
                <div><label>الرمز البريدي</label><input name="postalCode" value="${d.postalCode}" style="width:100%; padding:8px; border:1px solid #ddd; border-radius:5px;"></div>
                <div style="grid-column: span 2;"><label>التصنيف</label>
                    <select name="classification" style="width:100%; padding:8px; border:1px solid #ddd; border-radius:5px;">
                        <option value="">عميل عادي</option>
                        <option value="مميز" ${d.classification==='مميز'?'selected':''}>عميل مميز</option>
                        <option value="محتال" ${d.classification==='محتال'?'selected':''}>عميل محتال (تنبيه)</option>
                        <option value="غير جدي" ${d.classification==='غير جدي'?'selected':''}>غير جدي</option>
                    </select>
                </div>
                <div style="grid-column: span 2;"><label>ملاحظات العميل</label><textarea name="notes" style="width:100%; height:60px; padding:8px; border:1px solid #ddd; border-radius:5px;">${d.notes}</textarea></div>
                <button type="submit" style="grid-column: span 2; background:#27ae60; color:white; border:none; padding:12px; border-radius:8px; cursor:pointer; font-weight:bold;">حفظ التغييرات</button>
            </form>
        </div>
    `;
    document.body.appendChild(m);

    document.getElementById('cust-form').onsubmit = async (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        const vals = Object.fromEntries(fd.entries());
        vals.updatedAt = serverTimestamp();

        try {
            if(id) await updateDoc(doc(db, "customers", id), vals);
            else { vals.createdAt = serverTimestamp(); await addDoc(collection(db, "customers"), vals); }
            m.remove();
        } catch(err) { alert("خطأ في الاتصال بقاعدة البيانات"); }
    };
};

window.deleteCust = async (id) => {
    if(confirm('هل أنت متأكد من حذف هذا العميل نهائياً؟')) {
        await deleteDoc(doc(db, "customers", id));
    }
};
