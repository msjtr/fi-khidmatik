import { db } from '../core/firebase.js';
import { 
    collection, addDoc, getDocs, doc, updateDoc, deleteDoc, 
    query, orderBy, serverTimestamp, getDoc 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/**
 * موديول إدارة العملاء - تيرا جيتواي
 * يدعم تفاصيل العنوان الوطني والبيانات الشخصية
 */

export async function initCustomers(container) {
    container.innerHTML = `
        <div class="customers-mgmt" dir="rtl" style="font-family: 'Tajawal', sans-serif; padding:20px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:25px;">
                <h2 style="color:#2c3e50; margin:0;"><i class="fas fa-users" style="color:#3498db; margin-left:10px;"></i> إدارة العملاء</h2>
                <button id="btn-add-customer" style="background:#3498db; color:white; border:none; padding:12px 25px; border-radius:10px; cursor:pointer; font-weight:bold;">
                    <i class="fas fa-user-plus"></i> إضافة عميل جديد
                </button>
            </div>

            <div style="background:white; border-radius:15px; box-shadow:0 4px 15px rgba(0,0,0,0.05); overflow:hidden;">
                <table style="width:100%; border-collapse:collapse; text-align:right;">
                    <thead style="background:#f8f9fa;">
                        <tr>
                            <th style="padding:15px; border-bottom:2px solid #eee;">الاسم</th>
                            <th style="padding:15px; border-bottom:2px solid #eee;">الجوال</th>
                            <th style="padding:15px; border-bottom:2px solid #eee;">المدينة / الحي</th>
                            <th style="padding:15px; border-bottom:2px solid #eee;">تاريخ الإضافة</th>
                            <th style="padding:15px; border-bottom:2px solid #eee;">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody id="customers-list">
                        <tr><td colspan="5" style="text-align:center; padding:30px;">جاري جلب بيانات العملاء...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div id="customer-modal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); z-index:9999; overflow-y:auto; padding:20px;">
            <div style="background:white; max-width:800px; margin:20px auto; border-radius:15px; padding:30px;">
                <h3 id="modal-title" style="color:#3498db; margin-top:0; border-bottom:2px solid #f1f2f6; padding-bottom:15px;">بيانات العميل الجديد</h3>
                
                <form id="customer-form">
                    <input type="hidden" id="edit-id">
                    
                    <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:15px; margin-bottom:20px;">
                        <div style="grid-column: span 1;">
                            <label>اسم العميل</label>
                            <input type="text" id="c-name" required style="width:100%; padding:10px; border-radius:8px; border:1px solid #ddd;">
                        </div>
                        <div>
                            <label>رقم الجوال</label>
                            <input type="text" id="c-phone" required style="width:100%; padding:10px; border-radius:8px; border:1px solid #ddd;">
                        </div>
                        <div>
                            <label>البريد الإلكتروني</label>
                            <input type="email" id="c-email" style="width:100%; padding:10px; border-radius:8px; border:1px solid #ddd;">
                        </div>
                    </div>

                    <h4 style="color:#e67e22; border-right:4px solid #e67e22; padding-right:10px; margin:25px 0 15px;">تفاصيل العنوان</h4>
                    <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:15px;">
                        <div>
                            <label>الدولة</label>
                            <input type="text" id="c-country" value="السعودية" style="width:100%; padding:10px; border-radius:8px; border:1px solid #ddd;">
                        </div>
                        <div>
                            <label>المدينة</label>
                            <input type="text" id="c-city" style="width:100%; padding:10px; border-radius:8px; border:1px solid #ddd;">
                        </div>
                        <div>
                            <label>الحي</label>
                            <input type="text" id="c-district" style="width:100%; padding:10px; border-radius:8px; border:1px solid #ddd;">
                        </div>
                        <div style="grid-column: span 2;">
                            <label>الشارع</label>
                            <input type="text" id="c-street" style="width:100%; padding:10px; border-radius:8px; border:1px solid #ddd;">
                        </div>
                        <div>
                            <label>رقم المبنى</label>
                            <input type="text" id="c-building" style="width:100%; padding:10px; border-radius:8px; border:1px solid #ddd;">
                        </div>
                        <div>
                            <label>الرقم الإضافي</label>
                            <input type="text" id="c-additional" style="width:100%; padding:10px; border-radius:8px; border:1px solid #ddd;">
                        </div>
                        <div>
                            <label>الرمز البريدي</label>
                            <input type="text" id="c-pobox" style="width:100%; padding:10px; border-radius:8px; border:1px solid #ddd;">
                        </div>
                    </div>

                    <div style="margin-top:30px; display:flex; gap:15px;">
                        <button type="submit" style="flex:2; background:#2ecc71; color:white; padding:12px; border:none; border-radius:8px; cursor:pointer; font-weight:bold;">حفظ بيانات العميل</button>
                        <button type="button" id="close-modal" style="flex:1; background:#95a5a6; color:white; border:none; border-radius:8px; cursor:pointer;">إلغاء</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    setupLogic();
    await loadCustomers();
}

async function loadCustomers() {
    const list = document.getElementById('customers-list');
    const snap = await getDocs(query(collection(db, "customers"), orderBy("createdAt", "desc")));
    
    if (snap.empty) {
        list.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:20px;">لا يوجد عملاء مسجلين حالياً.</td></tr>`;
        return;
    }

    list.innerHTML = snap.docs.map(doc => {
        const c = doc.data();
        const date = c.createdAt?.toDate ? c.createdAt.toDate().toLocaleDateString('ar-SA') : '---';
        return `
            <tr style="border-bottom: 1px solid #eee;">
                <td style="padding:15px; font-weight:bold;">${c.name}</td>
                <td style="padding:15px;">${c.phone}</td>
                <td style="padding:15px; font-size:0.9rem; color:#7f8c8d;">${c.city || ''} - ${c.district || ''}</td>
                <td style="padding:15px; color:#95a5a6;">${date}</td>
                <td style="padding:15px; text-align:center;">
                    <button onclick="window.editCustomer('${doc.id}')" style="color:#3498db; background:none; border:none; cursor:pointer; margin-left:10px;"><i class="fas fa-edit"></i></button>
                    <button onclick="window.deleteCustomer('${doc.id}')" style="color:#e74c3c; background:none; border:none; cursor:pointer;"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `;
    }).join('');
}

function setupLogic() {
    const modal = document.getElementById('customer-modal');
    
    document.getElementById('btn-add-customer').onclick = () => {
        document.getElementById('customer-form').reset();
        document.getElementById('edit-id').value = '';
        document.getElementById('modal-title').innerText = "إضافة عميل جديد";
        modal.style.display = 'block';
    };

    document.getElementById('close-modal').onclick = () => modal.style.display = 'none';

    document.getElementById('customer-form').onsubmit = async (e) => {
        e.preventDefault();
        const id = document.getElementById('edit-id').value;
        
        const data = {
            name: document.getElementById('c-name').value,
            phone: document.getElementById('c-phone').value,
            email: document.getElementById('c-email').value,
            country: document.getElementById('c-country').value,
            city: document.getElementById('c-city').value,
            district: document.getElementById('c-district').value,
            street: document.getElementById('c-street').value,
            buildingNo: document.getElementById('c-building').value,
            additionalNo: document.getElementById('c-additional').value,
            poBox: document.getElementById('c-pobox').value,
            updatedAt: serverTimestamp()
        };

        try {
            if (id) {
                await updateDoc(doc(db, "customers", id), data);
            } else {
                data.createdAt = serverTimestamp();
                await addDoc(collection(db, "customers"), data);
            }
            modal.style.display = 'none';
            loadCustomers();
        } catch (err) {
            console.error("Error saving customer:", err);
            alert("حدث خطأ أثناء الحفظ");
        }
    };
}

// الوظائف العالمية
window.editCustomer = async (id) => {
    const snap = await getDoc(doc(db, "customers", id));
    if (snap.exists()) {
        const c = snap.data();
        document.getElementById('edit-id').value = id;
        document.getElementById('c-name').value = c.name || '';
        document.getElementById('c-phone').value = c.phone || '';
        document.getElementById('c-email').value = c.email || '';
        document.getElementById('c-country').value = c.country || 'السعودية';
        document.getElementById('c-city').value = c.city || '';
        document.getElementById('c-district').value = c.district || '';
        document.getElementById('c-street').value = c.street || '';
        document.getElementById('c-building').value = c.buildingNo || '';
        document.getElementById('c-additional').value = c.additionalNo || '';
        document.getElementById('c-pobox').value = c.poBox || '';
        
        document.getElementById('modal-title').innerText = "تعديل بيانات العميل";
        document.getElementById('customer-modal').style.display = 'block';
    }
};

window.deleteCustomer = async (id) => {
    if (confirm("هل أنت متأكد من حذف هذا العميل؟")) {
        await deleteDoc(doc(db, "customers", id));
        loadCustomers();
    }
};
