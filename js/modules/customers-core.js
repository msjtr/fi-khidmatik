import { db } from '../core/config.js';
import { collection, getDocs, query, orderBy, doc, deleteDoc, updateDoc, addDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- قائمة الدول ---
const countryData = [
    { name: "المملكة العربية السعودية", code: "+966", flag: "🇸🇦" },
    { name: "الإمارات العربية المتحدة", code: "+971", flag: "🇦🇪" },
    { name: "مصر", code: "+20", flag: "🇪🇬" }
];

export async function initCustomers(container) {
    if (!container) return;

    container.innerHTML = `
        <div class="customers-wrapper" style="direction: rtl; font-family: sans-serif; padding: 20px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 20px; align-items: center;">
                <input type="text" id="custSearch" placeholder="ابحث باسم العميل..." style="flex: 1; padding: 12px; border-radius: 8px; border: 1px solid #ccc; margin-left: 10px;">
                <button id="addBtn" style="background: #e67e22; color: white; border: none; padding: 12px 25px; border-radius: 8px; cursor: pointer; font-weight: bold;">+ إضافة عميل جديد</button>
            </div>
            <div style="background: white; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden;">
                <table style="width: 100%; border-collapse: collapse; text-align: right;">
                    <thead style="background: #f8fafc;">
                        <tr>
                            <th style="padding: 15px; border-bottom: 1px solid #eee;">الاسم</th>
                            <th style="padding: 15px; border-bottom: 1px solid #eee;">الجوال</th>
                            <th style="padding: 15px; border-bottom: 1px solid #eee;">العنوان</th>
                            <th style="padding: 15px; border-bottom: 1px solid #eee;">الرمز البريدي</th>
                            <th style="padding: 15px; border-bottom: 1px solid #eee; text-align: center;">العمليات</th>
                        </tr>
                    </thead>
                    <tbody id="custTableBody">
                        <tr><td colspan="5" style="text-align: center; padding: 20px;">جاري تحميل البيانات...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;

    document.getElementById('addBtn').onclick = () => openCustomerModal();
    loadCustomers();
}

// --- دالة تحميل البيانات ---
async function loadCustomers() {
    const tbody = document.getElementById('custTableBody');
    const q = query(collection(db, "customers"), orderBy("name", "asc"));
    const snapshot = await getDocs(q);
    
    tbody.innerHTML = "";
    snapshot.forEach(docSnap => {
        const c = docSnap.data();
        const id = docSnap.id;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td style="padding: 15px; border-bottom: 1px solid #eee;">${c.name}</td>
            <td style="padding: 15px; border-bottom: 1px solid #eee;" dir="ltr">${c.phone}</td>
            <td style="padding: 15px; border-bottom: 1px solid #eee;">${c.city} - ${c.district || ''}</td>
            <td style="padding: 15px; border-bottom: 1px solid #eee;"><span style="background:#e0f2fe; padding:4px 8px; border-radius:5px;">${c.postalCode || c.poBox || '-'}</span></td>
            <td style="padding: 15px; border-bottom: 1px solid #eee; text-align: center;">
                <button class="edit-action" data-id="${id}" style="color:#3b82f6; border:none; background:none; cursor:pointer; font-size:1.1rem; margin-left:10px;"><i class="fas fa-edit"></i></button>
                <button class="delete-action" data-id="${id}" style="color:#ef4444; border:none; background:none; cursor:pointer; font-size:1.1rem;"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(row);
    });

    // ربط الأزرار بعد رسمها
    document.querySelectorAll('.edit-action').forEach(b => b.onclick = () => editCustomer(b.dataset.id));
    document.querySelectorAll('.delete-action').forEach(b => b.onclick = () => deleteCustomer(b.dataset.id));
}

// --- دالة التعديل ---
async function editCustomer(id) {
    const docRef = doc(db, "customers", id);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
        openCustomerModal(snap.data(), id);
    }
}

// --- دالة الحذف ---
async function deleteCustomer(id) {
    if(confirm("هل تريد حذف هذا العميل نهائياً؟")) {
        await deleteDoc(doc(db, "customers", id));
        loadCustomers();
    }
}

// --- المودال (النافذة المنبثقة) ---
function openCustomerModal(data = null, editId = null) {
    const isEdit = !!data;
    const modal = document.createElement('div');
    modal.id = "modalOverlay";
    modal.style = "position:fixed; inset:0; background:rgba(0,0,0,0.7); display:flex; align-items:center; justify-content:center; z-index:9999;";
    
    modal.innerHTML = `
        <div style="background:white; width:90%; max-width:600px; border-radius:12px; padding:25px; direction:rtl;">
            <h3 style="margin-top:0;">${isEdit ? 'تعديل عميل' : 'إضافة عميل جديد'}</h3>
            <form id="custForm">
                <label style="display:block; margin-bottom:5px; font-weight:bold;">اسم العميل</label>
                <input type="text" id="f_name" value="${data?.name || ''}" required style="width:100%; padding:10px; margin-bottom:15px; border:1px solid #ccc; border-radius:5px;">
                
                <div style="display:flex; gap:10px; margin-bottom:15px;">
                    <div style="flex:1;">
                        <label style="display:block; margin-bottom:5px; font-weight:bold;">الجوال</label>
                        <input type="text" id="f_phone" value="${data?.phone || ''}" placeholder="9665xxxxxxx" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:5px;">
                    </div>
                    <div style="flex:1;">
                        <label style="display:block; margin-bottom:5px; font-weight:bold;">المدينة</label>
                        <input type="text" id="f_city" value="${data?.city || 'حائل'}" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:5px;">
                    </div>
                </div>

                <div style="display:flex; gap:10px; margin-bottom:15px;">
                    <div style="flex:1;">
                        <label style="display:block; margin-bottom:5px; font-weight:bold;">صندوق البريد</label>
                        <input type="text" id="f_pobox" value="${data?.poBox || ''}" oninput="document.getElementById('f_zip').value=this.value" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:5px;">
                    </div>
                    <div style="flex:1;">
                        <label style="display:block; margin-bottom:5px; font-weight:bold;">الرمز البريدي</label>
                        <input type="text" id="f_zip" value="${data?.postalCode || data?.poBox || ''}" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:5px; background:#f9f9f9;">
                    </div>
                </div>

                <div style="display:flex; gap:10px; margin-top:20px;">
                    <button type="submit" style="flex:2; background:#16a34a; color:white; border:none; padding:12px; border-radius:5px; cursor:pointer; font-weight:bold;">حفظ</button>
                    <button type="button" onclick="document.getElementById('modalOverlay').remove()" style="flex:1; background:#ccc; border:none; padding:12px; border-radius:5px; cursor:pointer;">إلغاء</button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('custForm').onsubmit = async (e) => {
        e.preventDefault();
        const finalData = {
            name: document.getElementById('f_name').value,
            phone: document.getElementById('f_phone').value,
            city: document.getElementById('f_city').value,
            poBox: document.getElementById('f_pobox').value,
            postalCode: document.getElementById('f_zip').value,
            updatedAt: new Date().toISOString()
        };

        if(isEdit) {
            await updateDoc(doc(db, "customers", editId), finalData);
        } else {
            finalData.createdAt = new Date().toISOString();
            await addDoc(collection(db, "customers"), finalData);
        }
        modal.remove();
        loadCustomers();
    };
}
