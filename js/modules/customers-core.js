import { db } from '../core/firebase.js';
import { collection, getDocs, query, orderBy, deleteDoc, doc, addDoc, updateDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export async function initCustomers(container) {
    if (!container) return;

    // 1. رسم الهيكل الرئيسي (التصميم الذي أرسلته)
    container.innerHTML = `
        <div style="padding: 25px; font-family: 'Tajawal', sans-serif; direction: rtl;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2 style="margin:0;"><i class="fas fa-users" style="color: #e67e22;"></i> إدارة العملاء</h2>
                <button id="add-customer-btn" style="background: #e67e22; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: bold;">
                    <i class="fas fa-user-plus"></i> عميل جديد
                </button>
            </div>

            <div style="margin-bottom: 15px;">
                <input type="text" id="table-search" placeholder="بحث سريع عن عميل..." 
                       style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #ddd; outline: none;">
            </div>

            <div style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                <table class="data-table" style="width: 100%; border-collapse: collapse; text-align: right;">
                    <thead style="background: #f8fafc;">
                        <tr>
                            <th style="padding: 15px; border-bottom: 2px solid #edf2f7;">الاسم</th>
                            <th style="padding: 15px; border-bottom: 2px solid #edf2f7;">الجوال</th>
                            <th style="padding: 15px; border-bottom: 2px solid #edf2f7;">المدينة</th>
                            <th style="padding: 15px; border-bottom: 2px solid #edf2f7;">تاريخ الإضافة</th>
                            <th style="padding: 15px; border-bottom: 2px solid #edf2f7;">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody id="customers-table-body">
                        <tr><td colspan="5" style="text-align: center; padding: 30px;">جاري التحميل من Firebase...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div id="customer-modal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); z-index:1000; justify-content:center; align-items:center;">
            <div style="background:white; padding:25px; border-radius:12px; width:90%; max-width:500px; max-height:90vh; overflow-y:auto;">
                <h3 id="modal-title">إضافة عميل جديد</h3>
                <form id="customer-form" style="display:grid; gap:10px;">
                    <input type="hidden" id="edit-id">
                    <input type="text" id="c-name" placeholder="الاسم الكامل" required style="padding:10px; border-radius:6px; border:1px solid #ddd;">
                    <input type="text" id="c-phone" placeholder="رقم الجوال" required style="padding:10px; border-radius:6px; border:1px solid #ddd;">
                    <input type="text" id="c-city" placeholder="المدينة" value="حائل" style="padding:10px; border-radius:6px; border:1px solid #ddd;">
                    <input type="text" id="c-district" placeholder="الحي" style="padding:10px; border-radius:6px; border:1px solid #ddd;">
                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
                        <input type="text" id="c-building" placeholder="رقم المبنى" style="padding:10px; border-radius:6px; border:1px solid #ddd;">
                        <input type="text" id="c-zip" placeholder="الرمز البريدي" style="padding:10px; border-radius:6px; border:1px solid #ddd;">
                    </div>
                    <div style="display:flex; gap:10px; margin-top:10px;">
                        <button type="submit" style="flex:1; background:#27ae60; color:white; border:none; padding:10px; border-radius:6px; cursor:pointer;">حفظ</button>
                        <button type="button" id="close-modal" style="flex:1; background:#95a5a6; color:white; border:none; padding:10px; border-radius:6px; cursor:pointer;">إلغاء</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    // الأحداث
    const modal = document.getElementById('customer-modal');
    document.getElementById('add-customer-btn').onclick = () => {
        document.getElementById('customer-form').reset();
        document.getElementById('modal-title').innerText = "إضافة عميل جديد";
        document.getElementById('edit-id').value = "";
        modal.style.display = 'flex';
    };
    document.getElementById('close-modal').onclick = () => modal.style.display = 'none';
    document.getElementById('customer-form').onsubmit = handleFormSubmit;
    document.getElementById('table-search').oninput = filterTable;

    loadCustomers();
}

async function loadCustomers() {
    const tbody = document.getElementById('customers-table-body');
    try {
        const q = query(collection(db, "customers"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        tbody.innerHTML = "";

        snapshot.forEach(docSnap => {
            const data = docSnap.data();
            const date = data.createdAt?.toDate().toLocaleDateString('ar-SA') || '-';
            const row = document.createElement('tr');
            row.style.borderBottom = "1px solid #edf2f7";
            row.innerHTML = `
                <td style="padding:15px;">${data.name}</td>
                <td style="padding:15px; direction:ltr;">${data.phone}</td>
                <td style="padding:15px;">${data.city}</td>
                <td style="padding:15px;">${date}</td>
                <td style="padding:15px;">
                    <div style="display:flex; gap:5px;">
                        <button onclick="editCust('${docSnap.id}')" style="color:#3498db; border:none; background:none; cursor:pointer;"><i class="fas fa-edit"></i></button>
                        <button onclick="printCust('${docSnap.id}')" style="color:#2ecc71; border:none; background:none; cursor:pointer;"><i class="fas fa-print"></i></button>
                        <button onclick="deleteCust('${docSnap.id}')" style="color:#e74c3c; border:none; background:none; cursor:pointer;"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (e) { console.error(e); }
}

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
        updatedAt: serverTimestamp()
    };

    try {
        if (id) {
            await updateDoc(doc(db, "customers", id), customerData);
        } else {
            customerData.createdAt = serverTimestamp();
            await addDoc(collection(db, "customers"), customerData);
        }
        document.getElementById('customer-modal').style.display = 'none';
        loadCustomers();
    } catch (e) { alert("خطأ في الحفظ"); }
}

// تعريف الدوال في الـ window لتتمكن الأزرار من استدعائها
window.deleteCust = async (id) => {
    if(confirm("حذف العميل؟")) {
        await deleteDoc(doc(db, "customers", id));
        loadCustomers();
    }
};

window.editCust = async (id) => {
    // كود جلب البيانات وفتح الـ Modal للتعديل
    alert("تعديل العميل: " + id);
};

window.printCust = (id) => {
    window.print(); // طباعة الصفحة الحالية كمثال
};

function filterTable(e) {
    const val = e.target.value.toLowerCase();
    const rows = document.querySelectorAll('#customers-table-body tr');
    rows.forEach(row => {
        row.style.display = row.innerText.toLowerCase().includes(val) ? "" : "none";
    });
}
