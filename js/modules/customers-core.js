/**
 * نظام إدارة العملاء المتكامل - منصة تيرا (Tera Gateway)
 * الإصدار المستقر: يعالج أخطاء التوقيت، ويوحد مفاتيح الدول، ويفعل الإحصائيات الشاملة
 */

import { db } from '../core/config.js';
import { 
    collection, query, onSnapshot, doc, setDoc, 
    deleteDoc, updateDoc, getDoc, serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// قائمة الدول المعتمدة في نظام تيرا
const worldCountries = [
    { name: "المملكة العربية السعودية", code: "966", flag: "🇸🇦" },
    { name: "الإمارات", code: "971", flag: "🇦🇪" },
    { name: "الكويت", code: "965", flag: "🇰🇼" },
    { name: "البحرين", code: "973", flag: "🇧🇭" },
    { name: "عمان", code: "968", flag: "🇴🇲" },
    { name: "قطر", code: "974", flag: "🇶🇦" },
    { name: "مصر", code: "20", flag: "🇪🇬" }
];

export async function initCustomers(container) {
    if (!container) return;

    container.innerHTML = `
        <div class="tera-stats-grid" id="statsGrid"></div>
        <div class="customers-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; gap: 15px; flex-wrap: wrap;">
            <div class="search-and-filter" style="display: flex; gap: 10px; flex: 1;">
                <div class="search-bar" style="position: relative; flex: 2;">
                    <i class="fas fa-search" style="position: absolute; right: 10px; top: 12px; color: #94a3b8;"></i>
                    <input type="text" id="searchCust" placeholder="ابحث بالاسم، الرقم، أو المدينة..." 
                           style="width: 100%; padding: 10px 35px 10px 10px; border: 1px solid #e2e8f0; border-radius: 8px;">
                </div>
                <select id="classFilter" style="flex: 1; padding: 10px; border-radius: 8px; border: 1px solid #e2e8f0;">
                    <option value="">جميع التصنيفات</option>
                    <option value="مميز">عميل مميز</option>
                    <option value="محتال">عميل محتال</option>
                    <option value="غير جدي">غير جدي</option>
                    <option value="غير متعاون">غير متعاون</option>
                </select>
            </div>
            <button class="btn-primary" id="openAddModal" style="background: #27ae60; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: bold;">
                <i class="fas fa-user-plus"></i> إضافة عميل جديد
            </button>
        </div>
        <div id="customersTableContainer" style="background: white; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); overflow: hidden;">
            <div class="tera-loader" style="padding: 40px; text-align: center; color: #64748b;">جاري جلب البيانات من تيرا...</div>
        </div>
    `;

    document.getElementById('openAddModal').onclick = () => openCustomerModal();

    // الاستماع المباشر للتغييرات
    const q = query(collection(db, "customers"));
    onSnapshot(q, (snapshot) => {
        const customers = [];
        snapshot.forEach((doc) => {
            const data = doc.data();
            customers.push({ id: doc.id, ...data });
        });
        renderStats(customers);
        setupFilters(customers);
    });
}

// دالة الإحصائيات المتقدمة
function renderStats(data) {
    const now = new Date();
    const stats = {
        total: data.length,
        new: data.filter(c => {
            const d = c.createdAt?.toDate ? c.createdAt.toDate() : (c.createdAt ? new Date(c.createdAt) : null);
            return d && (now - d) < (7 * 24 * 60 * 60 * 1000); // آخر 7 أيام
        }).length,
        complete: data.filter(c => c.name && c.phone && c.buildingNo && c.postalCode).length,
        incomplete: data.filter(c => !c.name || !c.phone || !c.buildingNo).length,
        withNotes: data.filter(c => c.notes && c.notes.trim() !== "").length
    };

    const grid = document.getElementById('statsGrid');
    if (grid) {
        grid.style = "display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-bottom: 25px;";
        grid.innerHTML = `
            <div class="stat-card" style="background:white; padding:15px; border-radius:10px; border-right:4px solid #3498db; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                <span style="color:#64748b; font-size:0.85rem;">إجمالي العملاء</span><br><strong style="font-size:1.4rem;">${stats.total}</strong>
            </div>
            <div class="stat-card" style="background:white; padding:15px; border-radius:10px; border-right:4px solid #9b59b6; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                <span style="color:#64748b; font-size:0.85rem;">جدد (أسبوع)</span><br><strong style="font-size:1.4rem;">${stats.new}</strong>
            </div>
            <div class="stat-card" style="background:white; padding:15px; border-radius:10px; border-right:4px solid #27ae60; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                <span style="color:#64748b; font-size:0.85rem;">مكتمل البيانات</span><br><strong style="font-size:1.4rem; color:#27ae60;">${stats.complete}</strong>
            </div>
            <div class="stat-card" style="background:white; padding:15px; border-radius:10px; border-right:4px solid #e67e22; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                <span style="color:#64748b; font-size:0.85rem;">نقص بيانات</span><br><strong style="font-size:1.4rem; color:#e67e22;">${stats.incomplete}</strong>
            </div>
            <div class="stat-card" style="background:white; padding:15px; border-radius:10px; border-right:4px solid #f1c40f; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                <span style="color:#64748b; font-size:0.85rem;">ملاحظات</span><br><strong style="font-size:1.4rem;">${stats.withNotes}</strong>
            </div>
        `;
    }
}

function setupFilters(customers) {
    const searchInput = document.getElementById('searchCust');
    const classSelect = document.getElementById('classFilter');
    
    const filterData = () => {
        const term = searchInput.value.toLowerCase();
        const cat = classSelect.value;
        const filtered = customers.filter(c => {
            const matchSearch = (c.name||"").toLowerCase().includes(term) || 
                                (c.phone||"").includes(term) || 
                                (c.city||"").toLowerCase().includes(term);
            const matchCat = cat === "" || c.classification === cat;
            return matchSearch && matchCat;
        });
        renderTable(filtered);
    };

    searchInput.oninput = filterData;
    classSelect.onchange = filterData;
    filterData(); // تشغيل أولي
}

function renderTable(data) {
    const container = document.getElementById('customersTableContainer');
    if (data.length === 0) {
        container.innerHTML = `<div style="padding:40px; text-align:center; color:#94a3b8;">لا يوجد عملاء مطابقين للبحث</div>`;
        return;
    }

    container.innerHTML = `
        <table style="width:100%; border-collapse:collapse; font-size:0.9rem;">
            <thead style="background:#f8fafc; color:#64748b; border-bottom:1px solid #e2e8f0;">
                <tr>
                    <th style="padding:15px; text-align:right;">العميل</th>
                    <th style="padding:15px; text-align:center;">الاتصال</th>
                    <th style="padding:15px; text-align:center;">العنوان الوطني</th>
                    <th style="padding:15px; text-align:center;">التصنيف</th>
                    <th style="padding:15px; text-align:center;">الإجراءات</th>
                </tr>
            </thead>
            <tbody>
                ${data.map(c => {
                    const badgeClass = c.classification === 'محتال' ? 'background:#fee2e2; color:#991b1b;' : 
                                      c.classification === 'مميز' ? 'background:#dcfce7; color:#166534;' : 'background:#f1f5f9; color:#475569;';
                    return `
                    <tr style="border-bottom:1px solid #f1f5f9; transition: background 0.2s;" onmouseover="this.style.background='#fcfcfc'" onmouseout="this.style.background='transparent'">
                        <td style="padding:12px 15px;">
                            <div style="display:flex; align-items:center; gap:12px;">
                                <div style="width:35px; height:35px; background:#e67e22; color:white; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:bold;">
                                    ${(c.name||"C").charAt(0)}
                                </div>
                                <div>
                                    <strong style="color:#1e293b;">${c.name||'---'}</strong><br>
                                    <small style="color:#94a3b8;">ID: ${c.id.slice(-6)}</small>
                                </div>
                            </div>
                        </td>
                        <td style="padding:12px; text-align:center; direction:ltr; color:#475569;">+${c.phone||''}</td>
                        <td style="padding:12px; text-align:center; color:#475569;">
                            <div>${c.city||'حائل'} - ${c.district||''}</div>
                            <small style="color:#94a3b8;">مبنى: ${c.buildingNo || '-'} | رمز: ${c.postalCode || '-'}</small>
                        </td>
                        <td style="padding:12px; text-align:center;">
                            <span style="padding:4px 10px; border-radius:20px; font-size:0.75rem; font-weight:bold; ${badgeClass}">
                                ${c.classification||'غير مصنف'}
                            </span>
                        </td>
                        <td style="padding:12px; text-align:center;">
                            <button onclick="openCustomerModal('${c.id}')" style="color:#3498db; border:none; background:none; cursor:pointer; margin:0 5px; font-size:1.1rem;"><i class="fas fa-edit"></i></button>
                            <button onclick="deleteCustomer('${c.id}')" style="color:#e74c3c; border:none; background:none; cursor:pointer; margin:0 5px; font-size:1.1rem;"><i class="fas fa-trash"></i></button>
                        </td>
                    </tr>`;
                }).join('')}
            </tbody>
        </table>
    `;
}

window.openCustomerModal = async function(id = null) {
    let customer = { name: '', email: '', country: 'المملكة العربية السعودية', city: 'حائل', phone: '', district: '', buildingNo: '', poBox: '', postalCode: '', classification: '', notes: '' };
    
    if (id) {
        const snap = await getDoc(doc(db, "customers", id));
        if (snap.exists()) customer = { id: snap.id, ...snap.data() };
    }

    const modalHTML = `
        <div id="custModal" style="position:fixed; inset:0; background:rgba(0,0,0,0.6); display:flex; align-items:center; justify-content:center; z-index:9999; backdrop-filter: blur(4px);">
            <div style="background:white; width:95%; max-width:700px; border-radius:15px; overflow:hidden; font-family:'Tajawal', sans-serif;">
                <div style="background:#2c3e50; color:white; padding:15px 20px; display:flex; justify-content:space-between; align-items:center;">
                    <h3 style="margin:0;">${id ? 'تعديل بيانات العميل' : 'إضافة عميل جديد'}</h3>
                    <button onclick="document.getElementById('custModal').remove()" style="background:none; border:none; color:white; font-size:24px; cursor:pointer;">&times;</button>
                </div>
                <form id="saveCustForm" style="padding:20px;">
                    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:15px;">
                        <div><label style="display:block; margin-bottom:5px; font-size:0.85rem;">الاسم الكامل</label><input type="text" id="f_name" value="${customer.name}" required style="width:100%; padding:8px; border:1px solid #ddd; border-radius:6px;"></div>
                        <div><label style="display:block; margin-bottom:5px; font-size:0.85rem;">البريد الإلكتروني</label><input type="email" id="f_email" value="${customer.email||''}" style="width:100%; padding:8px; border:1px solid #ddd; border-radius:6px;"></div>
                        <div>
                            <label style="display:block; margin-bottom:5px; font-size:0.85rem;">الدولة</label>
                            <select id="f_country" onchange="updatePhoneCode(this)" style="width:100%; padding:8px; border:1px solid #ddd; border-radius:6px;">
                                ${worldCountries.map(ct => `<option value="${ct.name}" data-code="${ct.code}" ${customer.country === ct.name ? 'selected' : ''}>${ct.flag} ${ct.name}</option>`).join('')}
                            </select>
                        </div>
                        <div>
                            <label style="display:block; margin-bottom:5px; font-size:0.85rem;">الجوال</label>
                            <div style="display:flex; direction:ltr;">
                                <span id="f_code_display" style="padding:8px; background:#f1f5f9; border:1px solid #ddd; border-right:none; border-radius:6px 0 0 6px;">+${customer.phone ? (worldCountries.find(x => customer.phone.startsWith(x.code))?.code || '966') : '966'}</span>
                                <input type="tel" id="f_phone" value="${customer.phone ? customer.phone.replace(/^(966|971|965|973|968|974|20)/, '') : ''}" placeholder="5xxxxxxxx" required style="flex:1; padding:8px; border:1px solid #ddd; border-radius:0 6px 6px 0;">
                            </div>
                        </div>
                        <div><label style="display:block; margin-bottom:5px; font-size:0.85rem;">المدينة</label><input type="text" id="f_city" value="${customer.city}" style="width:100%; padding:8px; border:1px solid #ddd; border-radius:6px;"></div>
                        <div><label style="display:block; margin-bottom:5px; font-size:0.85rem;">الحي</label><input type="text" id="f_district" value="${customer.district||''}" style="width:100%; padding:8px; border:1px solid #ddd; border-radius:6px;"></div>
                        <div><label style="display:block; margin-bottom:5px; font-size:0.85rem;">رقم المبنى</label><input type="text" id="f_building" value="${customer.buildingNo||''}" style="width:100%; padding:8px; border:1px solid #ddd; border-radius:6px;"></div>
                        <div><label style="display:block; margin-bottom:5px; font-size:0.85rem;">الرمز البريدي</label><input type="text" id="f_zip" value="${customer.postalCode||''}" style="width:100%; padding:8px; border:1px solid #ddd; border-radius:6px;"></div>
                        <div style="grid-column: span 2;">
                            <label style="display:block; margin-bottom:5px; font-size:0.85rem;">التصنيف</label>
                            <select id="f_class" style="width:100%; padding:8px; border:1px solid #ddd; border-radius:6px;">
                                <option value="">اختر التصنيف..</option>
                                <option value="مميز" ${customer.classification==='مميز'?'selected':''}>عميل مميز</option>
                                <option value="محتال" ${customer.classification==='محتال'?'selected':''}>عميل محتال</option>
                                <option value="غير جدي" ${customer.classification==='غير جدي'?'selected':''}>غير جدي</option>
                                <option value="غير متعاون" ${customer.classification==='غير متعاون'?'selected':''}>غير متعاون</option>
                            </select>
                        </div>
                        <div style="grid-column: span 2;">
                            <label style="display:block; margin-bottom:5px; font-size:0.85rem;">ملاحظات العميل (محرر نصي)</label>
                            <textarea id="f_notes" rows="3" style="width:100%; padding:8px; border:1px solid #ddd; border-radius:6px;">${customer.notes||''}</textarea>
                        </div>
                    </div>
                    <div style="margin-top:20px; text-align:left;">
                        <button type="submit" style="background:#27ae60; color:white; border:none; padding:12px 40px; border-radius:8px; cursor:pointer; font-weight:bold;">حفظ البيانات</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    window.updatePhoneCode = (el) => {
        const code = el.selectedOptions[0].dataset.code;
        document.getElementById('f_code_display').innerText = '+' + code;
    };

    document.getElementById('saveCustForm').onsubmit = async (e) => {
        e.preventDefault();
        const code = document.getElementById('f_country').selectedOptions[0].dataset.code;
        const data = {
            name: document.getElementById('f_name').value,
            email: document.getElementById('f_email').value,
            country: document.getElementById('f_country').value,
            phone: code + document.getElementById('f_phone').value.replace(/^0/, ''), // توحيد الصيغة بدون 0 في البداية
            city: document.getElementById('f_city').value,
            district: document.getElementById('f_district').value,
            buildingNo: document.getElementById('f_building').value,
            postalCode: document.getElementById('f_zip').value,
            classification: document.getElementById('f_class').value,
            notes: document.getElementById('f_notes').value,
            updatedAt: serverTimestamp()
        };

        try {
            if (id) await updateDoc(doc(db, "customers", id), data);
            else { 
                data.createdAt = serverTimestamp(); 
                await setDoc(doc(collection(db, "customers")), data); 
            }
            document.getElementById('custModal').remove();
        } catch (err) {
            console.error("Error saving customer:", err);
            alert("خطأ في الاتصال بقاعدة البيانات");
        }
    };
};

window.deleteCustomer = async (id) => {
    if (confirm("هل أنت متأكد من حذف هذا العميل وكافة سجلاته من تيرا؟")) {
        try {
            await deleteDoc(doc(db, "customers", id));
        } catch (err) {
            alert("خطأ في الحذف");
        }
    }
};
