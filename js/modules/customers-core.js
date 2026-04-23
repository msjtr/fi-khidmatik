import { db } from '../core/firebase.js';
import { collection, getDocs, query, orderBy, deleteDoc, doc, addDoc, updateDoc, serverTimestamp, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

console.log('✅ تم تحديث موديول العملاء بنجاح - Tera Gateway');

export async function initCustomers(container) {
    if (!container) return;

    // 1. هيكل الواجهة (العنوان، زر الإضافة، شريط البحث)
    container.innerHTML = `
        <div style="padding: 25px; font-family: 'Tajawal', sans-serif; direction: rtl;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 15px;">
                <h2 style="margin:0;"><i class="fas fa-users" style="color: #e67e22;"></i> إدارة العملاء</h2>
                <button id="add-customer-btn" style="background: #e67e22; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: bold; transition: 0.3s;">
                    <i class="fas fa-user-plus"></i> عميل جديد
                </button>
            </div>

            <div style="background: white; padding: 12px; border-radius: 12px; margin-bottom: 15px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); display: flex; gap: 10px;">
                <input type="text" id="table-search" placeholder="ابحث باسم العميل أو رقم الجوال..." 
                       style="flex: 1; padding: 10px; border-radius: 8px; border: 1px solid #ddd; outline: none;">
                <select id="city-filter" style="padding: 10px; border-radius: 8px; border: 1px solid #ddd; background: #f8fafc;">
                    <option value="">كل المناطق</option>
                    <option value="حائل">حائل</option>
                </select>
            </div>

            <div style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                <table style="width: 100%; border-collapse: collapse; text-align: right;">
                    <thead style="background: #f8fafc;">
                        <tr>
                            <th style="padding: 15px; border-bottom: 2px solid #edf2f7;">الاسم</th>
                            <th style="padding: 15px; border-bottom: 2px solid #edf2f7; text-align: center;">الجوال</th>
                            <th style="padding: 15px; border-bottom: 2px solid #edf2f7; text-align: center;">المدينة/الحي</th>
                            <th style="padding: 15px; border-bottom: 2px solid #edf2f7; text-align: center;">تاريخ الإضافة</th>
                            <th style="padding: 15px; border-bottom: 2px solid #edf2f7; text-align: center;">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody id="customers-table-body">
                        <tr><td colspan="5" style="text-align: center; padding: 40px; color: #95a5a6;">
                            <i class="fas fa-spinner fa-spin"></i> جاري تحميل البيانات...
                        </td></tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div id="customer-modal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); z-index:9999; justify-content:center; align-items:center; backdrop-filter: blur(4px);">
            <div style="background:white; padding:25px; border-radius:15px; width:95%; max-width:550px; box-shadow: 0 20px 25px rgba(0,0,0,0.15);">
                <h3 id="modal-title" style="margin-top:0; border-bottom: 1px solid #eee; padding-bottom: 10px;">إضافة عميل جديد</h3>
                <form id="customer-form" style="display:grid; grid-template-columns: 1fr 1fr; gap:12px; margin-top:15px;">
                    <input type="hidden" id="edit-id">
                    <div style="grid-column: span 2;">
                        <label style="font-size: 0.8rem; color: #666;">الاسم الكامل</label>
                        <input type="text" id="c-name" required style="width:100%; padding:10px; border-radius:6px; border:1px solid #ddd;">
                    </div>
                    <div>
                        <label style="font-size: 0.8rem; color: #666;">رقم الجوال</label>
                        <input type="text" id="c-phone" required style="width:100%; padding:10px; border-radius:6px; border:1px solid #ddd; text-align: left;">
                    </div>
                    <div>
                        <label style="font-size: 0.8rem; color: #666;">المدينة</label>
                        <input type="text" id="c-city" value="حائل" style="width:100%; padding:10px; border-radius:6px; border:1px solid #ddd;">
                    </div>
                    <div>
                        <label style="font-size: 0.8rem; color: #666;">الحي</label>
                        <input type="text" id="c-district" style="width:100%; padding:10px; border-radius:6px; border:1px solid #ddd;">
                    </div>
                    <div>
                        <label style="font-size: 0.8rem; color: #666;">رقم المبنى</label>
                        <input type="text" id="c-building" style="width:100%; padding:10px; border-radius:6px; border:1px solid #ddd;">
                    </div>
                    <div>
                        <label style="font-size: 0.8rem; color: #666;">الرمز البريدي</label>
                        <input type="text" id="c-zip" style="width:100%; padding:10px; border-radius:6px; border:1px solid #ddd;">
                    </div>
                    <div>
                        <label style="font-size: 0.8rem; color: #666;">الرقم الإضافي</label>
                        <input type="text" id="c-additional" style="width:100%; padding:10px; border-radius:6px; border:1px solid #ddd;">
                    </div>
                    <div style="grid-column: span 2; display:flex; gap:10px; margin-top:15px;">
                        <button type="submit" style="flex:2; background:#27ae60; color:white; border:none; padding:12px; border-radius:8px; cursor:pointer; font-weight:bold;">حفظ البيانات</button>
                        <button type="button" id="close-modal" style="flex:1; background:#95a5a6; color:white; border:none; padding:12px; border-radius:8px; cursor:pointer;">إلغاء</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    // تسجيل الأحداث
    document.getElementById('add-customer-btn').onclick = () => openModal();
    document.getElementById('close-modal').onclick = () => closeModal();
    document.getElementById('customer-form').onsubmit = handleFormSubmit;
    document.getElementById('table-search').oninput = (e) => filterTable(e.target.value);
    document.getElementById('city-filter').onchange = (e) => filterTable(document.getElementById('table-search').value, e.target.value);

    loadCustomers();
}

// دالة جلب البيانات مع معالجة خطأ التاريخ
async function loadCustomers() {
    const tbody = document.getElementById('customers-table-body');
    try {
        const q = query(collection(db, "customers"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        tbody.innerHTML = "";

        snapshot.forEach(docSnap => {
            const data = docSnap.data();
            
            // الحل الجذري لخطأ التاريخ
            let displayDate = '-';
            if (data.createdAt) {
                try {
                    if (data.createdAt.toDate) displayDate = data.createdAt.toDate().toLocaleDateString('ar-SA');
                    else displayDate = new Date(data.createdAt).toLocaleDateString('ar-SA');
                } catch(e) { displayDate = '-'; }
            }

            const row = document.createElement('tr');
            row.className = "customer-row";
            row.style.borderBottom = "1px solid #edf2f7";
            row.innerHTML = `
                <td style="padding:15px;">
                    <div style="font-weight:bold;">${data.name}</div>
                    <small style="color:#999;">${data.district || ''}</small>
                </td>
                <td style="padding:15px; text-align:center; direction:ltr;">${data.phone}</td>
                <td style="padding:15px; text-align:center;">${data.city}</td>
                <td style="padding:15px; text-align:center; font-size:0.85rem;">${displayDate}</td>
                <td style="padding:15px; text-align:center;">
                    <div style="display:flex; gap:10px; justify-content:center;">
                        <button onclick="editCust('${docSnap.id}')" title="تعديل" style="color:#3498db; border:none; background:none; cursor:pointer; font-size:1.1rem;"><i class="fas fa-edit"></i></button>
                        <button onclick="printCust('${docSnap.id}')" title="طباعة" style="color:#2ecc71; border:none; background:none; cursor:pointer; font-size:1.1rem;"><i class="fas fa-print"></i></button>
                        <button onclick="deleteCust('${docSnap.id}')" title="حذف" style="color:#e74c3c; border:none; background:none; cursor:pointer; font-size:1.1rem;"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (e) {
        console.error(e);
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:red; padding:20px;">خطأ في تحميل البيانات</td></tr>`;
    }
}

// العمليات الأساسية
async function handleFormSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('edit-id').value;
    const customerData = {
        name: document.getElementById('c-name').value,
        phone: document.getElementById('c-phone').value,
        city: document.getElementById('c-city').value,
        district: document.getElementById('c-district').value,
        buildingNo: document.getElementById('c-building').value,
        postalCode: document.getElementById('c-zip').value,
        additionalNo: document.getElementById('c-additional').value,
        updatedAt: serverTimestamp()
    };

    try {
        if (id) {
            await updateDoc(doc(db, "customers", id), customerData);
        } else {
            customerData.createdAt = serverTimestamp();
            await addDoc(collection(db, "customers"), customerData);
        }
        closeModal();
        loadCustomers();
    } catch (e) { alert("فشل الحفظ: تأكد من الصلاحيات"); }
}

// الدوال العالمية (Global)
window.deleteCust = async (id) => {
    if(confirm("هل أنت متأكد من حذف هذا العميل؟")) {
        await deleteDoc(doc(db, "customers", id));
        loadCustomers();
    }
};

window.editCust = async (id) => {
    const docRef = doc(db, "customers", id);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
        const data = snap.data();
        document.getElementById('edit-id').value = id;
        document.getElementById('c-name').value = data.name || '';
        document.getElementById('c-phone').value = data.phone || '';
        document.getElementById('c-city').value = data.city || 'حائل';
        document.getElementById('c-district').value = data.district || '';
        document.getElementById('c-building').value = data.buildingNo || '';
        document.getElementById('c-zip').value = data.postalCode || '';
        document.getElementById('c-additional').value = data.additionalNo || '';
        
        document.getElementById('modal-title').innerText = "تعديل بيانات العميل";
        document.getElementById('customer-modal').style.display = 'flex';
    }
};

window.printCust = (id) => {
    window.print();
};

function openModal() {
    document.getElementById('customer-form').reset();
    document.getElementById('edit-id').value = "";
    document.getElementById('modal-title').innerText = "إضافة عميل جديد";
    document.getElementById('customer-modal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('customer-modal').style.display = 'none';
}

function filterTable(search, city = "") {
    const rows = document.querySelectorAll('.customer-row');
    rows.forEach(row => {
        const text = row.innerText.toLowerCase();
        const matchesSearch = text.includes(search.toLowerCase());
        const matchesCity = city === "" || text.includes(city.toLowerCase());
        row.style.display = (matchesSearch && matchesCity) ? "" : "none";
    });
}
