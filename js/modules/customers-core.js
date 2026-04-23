import { db } from '../core/firebase.js';
import { collection, getDocs, query, orderBy, deleteDoc, doc, addDoc, updateDoc, serverTimestamp, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export async function initCustomers(container) {
    if (!container) return;

    // 1. هيكل الواجهة الرئيسي
    container.innerHTML = `
        <div style="padding: 25px; font-family: 'Tajawal', sans-serif; direction: rtl;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2 style="margin:0;"><i class="fas fa-users" style="color: #e67e22;"></i> إدارة العملاء - Tera Gateway</h2>
                <button id="add-customer-btn" style="background: #e67e22; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: bold;">
                    <i class="fas fa-user-plus"></i> إضافة عميل جديد
                </button>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px; margin-bottom: 20px;">
                <div style="background: white; padding: 15px; border-radius: 12px; border-right: 5px solid #3498db; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                    <div style="color: #7f8c8d; font-size: 0.8rem;">إجمالي العملاء</div>
                    <div id="stat-total" style="font-size: 1.4rem; font-weight: bold;">0</div>
                </div>
                <div style="background: white; padding: 15px; border-radius: 12px; border-right: 5px solid #27ae60; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                    <div style="color: #7f8c8d; font-size: 0.8rem;">بيانات مكتملة</div>
                    <div id="stat-complete" style="font-size: 1.4rem; font-weight: bold; color: #27ae60;">0</div>
                </div>
                <div style="background: white; padding: 15px; border-radius: 12px; border-right: 5px solid #e74c3c; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                    <div style="color: #7f8c8d; font-size: 0.8rem;">بيانات ناقصة</div>
                    <div id="stat-incomplete" style="font-size: 1.4rem; font-weight: bold; color: #e74c3c;">0</div>
                </div>
            </div>

            <div style="background: white; border-radius: 12px; overflow-x: auto; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                <table style="width: 100%; border-collapse: collapse; text-align: right; min-width: 1000px;">
                    <thead style="background: #f8fafc;">
                        <tr>
                            <th style="padding: 15px; border-bottom: 2px solid #edf2f7;">الاسم والبريد</th>
                            <th style="padding: 15px; border-bottom: 2px solid #edf2f7;">الجوال</th>
                            <th style="padding: 15px; border-bottom: 2px solid #edf2f7;">العنوان الوطني</th>
                            <th style="padding: 15px; border-bottom: 2px solid #edf2f7; text-align: center;">الحالة</th>
                            <th style="padding: 15px; border-bottom: 2px solid #edf2f7; text-align: center;">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody id="customers-table-body">
                        <tr><td colspan="5" style="text-align: center; padding: 40px;">جاري المزامنة مع Firestore...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div id="customer-modal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); z-index:9999; justify-content:center; align-items:center; backdrop-filter: blur(3px);">
            <div style="background:white; padding:25px; border-radius:15px; width:95%; max-width:650px; max-height:90vh; overflow-y:auto;">
                <h3 id="modal-title" style="margin-top:0; color:#2c3e50; border-bottom:2px solid #eee; padding-bottom:10px;">إضافة عميل جديد</h3>
                <form id="customer-form" style="display:grid; grid-template-columns: 1fr 1fr; gap:12px; margin-top:15px;">
                    <input type="hidden" id="edit-id">
                    
                    <div style="grid-column: span 2;">
                        <label style="font-size: 0.8rem; color: #666;">الاسم الكامل</label>
                        <input type="text" id="c-name" required style="width:100%; padding:10px; border-radius:6px; border:1px solid #ddd;">
                    </div>

                    <div>
                        <label style="font-size: 0.8rem; color: #666;">رقم الجوال</label>
                        <input type="text" id="c-phone" required style="width:100%; padding:10px; border-radius:6px; border:1px solid #ddd; text-align:left;">
                    </div>

                    <div>
                        <label style="font-size: 0.8rem; color: #666;">البريد الإلكتروني</label>
                        <input type="email" id="c-email" style="width:100%; padding:10px; border-radius:6px; border:1px solid #ddd; text-align:left;">
                    </div>

                    <div>
                        <label style="font-size: 0.8rem; color: #666;">المدينة</label>
                        <input type="text" id="c-city" value="حائل" style="width:100%; padding:10px; border-radius:6px; border:1px solid #ddd;">
                    </div>

                    <div>
                        <label style="font-size: 0.8rem; color: #666;">الحي</label>
                        <input type="text" id="c-district" style="width:100%; padding:10px; border-radius:6px; border:1px solid #ddd;">
                    </div>

                    <div style="grid-column: span 2;">
                        <label style="font-size: 0.8rem; color: #666;">الشارع</label>
                        <input type="text" id="c-street" style="width:100%; padding:10px; border-radius:6px; border:1px solid #ddd;">
                    </div>

                    <div>
                        <label style="font-size: 0.8rem; color: #666;">رقم المبنى</label>
                        <input type="text" id="c-building" style="width:100%; padding:10px; border-radius:6px; border:1px solid #ddd;">
                    </div>

                    <div>
                        <label style="font-size: 0.8rem; color: #666;">الرقم الإضافي</label>
                        <input type="text" id="c-additional" style="width:100%; padding:10px; border-radius:6px; border:1px solid #ddd;">
                    </div>

                    <div>
                        <label style="font-size: 0.8rem; color: #666;">الرمز البريدي</label>
                        <input type="text" id="c-postal" style="width:100%; padding:10px; border-radius:6px; border:1px solid #ddd;">
                    </div>

                    <div>
                        <label style="font-size: 0.8rem; color: #666;">ص.ب (PO Box)</label>
                        <input type="text" id="c-pobox" style="width:100%; padding:10px; border-radius:6px; border:1px solid #ddd;">
                    </div>

                    <div style="grid-column: span 2; display:flex; gap:10px; margin-top:15px;">
                        <button type="submit" style="flex:2; background:#27ae60; color:white; border:none; padding:12px; border-radius:8px; cursor:pointer; font-weight:bold;">حفظ التغييرات</button>
                        <button type="button" id="close-modal-btn" style="flex:1; background:#95a5a6; color:white; border:none; padding:12px; border-radius:8px; cursor:pointer;">إلغاء</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    // ربط الأحداث
    document.getElementById('add-customer-btn').onclick = () => openModal();
    document.getElementById('close-modal-btn').onclick = () => closeModal();
    document.getElementById('customer-form').onsubmit = handleFormSubmit;

    loadCustomers();
}

// دالة جلب البيانات مع الإحصائيات
async function loadCustomers() {
    const tbody = document.getElementById('customers-table-body');
    try {
        const q = query(collection(db, "customers"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        tbody.innerHTML = "";

        let total = 0, complete = 0, incomplete = 0;

        snapshot.forEach(docSnap => {
            const data = docSnap.data();
            total++;

            // معايير اكتمال البيانات
            const isComplete = data.name && data.phone && data.buildingNo && data.postalCode && data.additionalNo;
            if (isComplete) complete++; else incomplete++;

            const row = document.createElement('tr');
            row.style.borderBottom = "1px solid #edf2f7";
            row.innerHTML = `
                <td style="padding:15px;">
                    <div style="font-weight:bold; color:#2c3e50;">${data.name}</div>
                    <div style="font-size:0.75rem; color:#95a5a6;">${data.email || 'لا يوجد بريد'}</div>
                </td>
                <td style="padding:15px; direction:ltr; text-align:right;">${data.phone}</td>
                <td style="padding:15px; font-size:0.85rem;">
                    <div>${data.city} - ${data.district}</div>
                    <small style="color:#e67e22;">مبنى: ${data.buildingNo || '-'} | إضافي: ${data.additionalNo || '-'}</small>
                </td>
                <td style="padding:15px; text-align:center;">
                    <span style="padding:4px 10px; border-radius:20px; font-size:0.75rem; background:${isComplete ? '#eafaf1' : '#fff5f5'}; color:${isComplete ? '#27ae60' : '#e74c3c'}; font-weight:bold;">
                        ${isComplete ? 'مكتمل' : 'ناقص'}
                    </span>
                </td>
                <td style="padding:15px; text-align:center;">
                    <div style="display:flex; gap:10px; justify-content:center;">
                        <button onclick="window.location.hash='#add-order?id=${docSnap.id}'" title="إضافة طلب" style="color:#e67e22; border:none; background:none; cursor:pointer;"><i class="fas fa-cart-plus"></i></button>
                        <button onclick="window.editCust('${docSnap.id}')" title="تعديل" style="color:#3498db; border:none; background:none; cursor:pointer;"><i class="fas fa-edit"></i></button>
                        <button onclick="window.printCust('${docSnap.id}')" title="طباعة بيانات العميل" style="color:#2ecc71; border:none; background:none; cursor:pointer;"><i class="fas fa-print"></i></button>
                        <button onclick="window.deleteCust('${docSnap.id}')" title="حذف" style="color:#e74c3c; border:none; background:none; cursor:pointer;"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });

        document.getElementById('stat-total').innerText = total;
        document.getElementById('stat-complete').innerText = complete;
        document.getElementById('stat-incomplete').innerText = incomplete;

    } catch (e) { console.error(e); }
}

// --- العمليات العالمية (تفعيل الأزرار) ---

window.deleteCust = async (id) => {
    if (confirm("هل أنت متأكد من حذف هذا العميل نهائياً من Tera Gateway؟")) {
        await deleteDoc(doc(db, "customers", id));
        loadCustomers();
    }
};

window.editCust = async (id) => {
    const docSnap = await getDoc(doc(db, "customers", id));
    if (docSnap.exists()) {
        const data = docSnap.data();
        document.getElementById('edit-id').value = id;
        document.getElementById('c-name').value = data.name || '';
        document.getElementById('c-phone').value = data.phone || '';
        document.getElementById('c-email').value = data.email || '';
        document.getElementById('c-city').value = data.city || 'حائل';
        document.getElementById('c-district').value = data.district || '';
        document.getElementById('c-street').value = data.street || '';
        document.getElementById('c-building').value = data.buildingNo || '';
        document.getElementById('c-additional').value = data.additionalNo || '';
        document.getElementById('c-postal').value = data.postalCode || '';
        document.getElementById('c-pobox').value = data.poBox || '';

        document.getElementById('modal-title').innerText = "تعديل بيانات العميل الحالي";
        document.getElementById('customer-modal').style.display = 'flex';
    }
};

// دالة الطباعة المتخصصة لبيانات العميل فقط
window.printCust = async (id) => {
    const docSnap = await getDoc(doc(db, "customers", id));
    if (!docSnap.exists()) return;
    const data = docSnap.data();

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html dir="rtl">
        <head>
            <title>طباعة بيانات العميل - ${data.name}</title>
            <style>
                body { font-family: 'Tahoma', sans-serif; padding: 40px; color: #333; }
                .header { border-bottom: 2px solid #e67e22; padding-bottom: 10px; margin-bottom: 30px; display: flex; justify-content: space-between; }
                .section { margin-bottom: 20px; border: 1px solid #eee; padding: 15px; border-radius: 8px; }
                .label { font-weight: bold; color: #e67e22; width: 150px; display: inline-block; }
                .value { color: #2c3e50; }
                .footer { margin-top: 50px; text-align: center; font-size: 0.8rem; color: #95a5a6; }
            </style>
        </head>
        <body>
            <div class="header">
                <h2>Tera Gateway - تفاصيل العميل</h2>
                <p>تاريخ الاستخراج: ${new Date().toLocaleDateString('ar-SA')}</p>
            </div>
            <div class="section">
                <h3>البيانات الأساسية</h3>
                <p><span class="label">الاسم:</span> <span class="value">${data.name}</span></p>
                <p><span class="label">رقم الجوال:</span> <span class="value" dir="ltr">${data.phone}</span></p>
                <p><span class="label">البريد:</span> <span class="value">${data.email || '-'}</span></p>
            </div>
            <div class="section">
                <h3>تفاصيل العنوان الوطني</h3>
                <p><span class="label">المدينة/الحي:</span> <span class="value">${data.city} - ${data.district}</span></p>
                <p><span class="label">الشارع:</span> <span class="value">${data.street || '-'}</span></p>
                <p><span class="label">رقم المبنى:</span> <span class="value">${data.buildingNo || '-'}</span></p>
                <p><span class="label">الرقم الإضافي:</span> <span class="value">${data.additionalNo || '-'}</span></p>
                <p><span class="label">الرمز البريدي:</span> <span class="value">${data.postalCode || '-'}</span></p>
                <p><span class="label">ص.ب:</span> <span class="value">${data.poBox || '-'}</span></p>
            </div>
            <div class="footer">نظام في خدمتكم - جميع الحقوق محفوظة لـ محمد صالح الشمري</div>
            <script>window.onload = function() { window.print(); window.close(); }</script>
        </body>
        </html>
    `);
    printWindow.document.close();
};

async function handleFormSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('edit-id').value;
    const customerData = {
        name: document.getElementById('c-name').value,
        phone: document.getElementById('c-phone').value,
        email: document.getElementById('c-email').value,
        city: document.getElementById('c-city').value,
        district: document.getElementById('c-district').value,
        street: document.getElementById('c-street').value,
        buildingNo: document.getElementById('c-building').value,
        additionalNo: document.getElementById('c-additional').value,
        postalCode: document.getElementById('c-postal').value,
        poBox: document.getElementById('c-pobox').value,
        country: "المملكة العربية السعودية",
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
    } catch (e) { alert("حدث خطأ أثناء حفظ البيانات"); }
}

function openModal() {
    document.getElementById('customer-form').reset();
    document.getElementById('edit-id').value = "";
    document.getElementById('modal-title').innerText = "إضافة عميل جديد لسجل الأقساط";
    document.getElementById('customer-modal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('customer-modal').style.display = 'none';
}
