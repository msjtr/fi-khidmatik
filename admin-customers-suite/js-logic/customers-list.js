import { collection, getDocs, doc, updateDoc, deleteDoc, getDoc, query, orderBy } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-storage.js";
import { db, storage } from '../js/firebase.js';

const currentEmployee = "محمد بن صالح الشمري"; // الموظف المسؤول للرقابة الإدارية
let customersDataList = [];
let quill;

/**
 * تهيئة محرر Quill بتنسيقات Word المتقدمة ودعم الاتجاه العربي
 */
function initQuill() {
    if (!quill) { 
        quill = new Quill('#editor', { 
            theme: 'snow',
            modules: {
                toolbar: [
                    [{ 'header': [1, 2, false] }],
                    ['bold', 'italic', 'underline'],
                    [{ 'color': [] }, { 'background': [] }],
                    [{ 'direction': 'rtl' }, { 'align': [] }],
                    ['clean']
                ]
            }
        }); 
        quill.format('direction', 'rtl'); 
    }
}

/**
 * 1. تحميل البيانات وتحديث الملخص الإحصائي المطور (Dashboard)
 */
async function loadCustomers() {
    const tbody = document.getElementById('customers-tbody');
    try {
        const querySnapshot = await getDocs(query(collection(db, "customers"), orderBy("createdAt", "desc")));
        customersDataList = [];
        
        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data(); 
            data.id = docSnap.id;
            customersDataList.push(data);
        });

        updateDashboard(customersDataList);
        renderTable(customersDataList);
        
    } catch (e) { console.error("خطأ في مزامنة بيانات القاعدة:", e); }
}

/**
 * 2. تحديث لوحة الإحصائيات (Dashboard) مقسمة على السطرين
 */
function updateDashboard(data) {
    const now = new Date();
    const stats = {
        total: data.length,
        completeAddress: data.filter(c => c.city && c.district && c.street && c.buildingNo).length,
        thisMonth: data.filter(c => {
            if(!c.createdAt) return false;
            const d = new Date(c.createdAt);
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        }).length,
        new: data.filter(c => c.accountStatus === 'جديد').length,
        active: data.filter(c => c.accountStatus === 'نشط').length,
        suspended: data.filter(c => c.accountStatus === 'موقوف').length,
        blocked: data.filter(c => c.accountStatus === 'محظور').length,
        vip: data.filter(c => c.customerCategory === 'VIP').length,
        premium: data.filter(c => c.customerCategory === 'مميز').length,
        normal: data.filter(c => c.customerCategory === 'عادي').length,
        potential: data.filter(c => c.customerCategory === 'محتمل').length,
        quickResp: data.filter(c => c.quickNote === 'سريع التجاوب').length,
        lateResp: data.filter(c => c.quickNote === 'يتاخر في الرد' || c.quickNote === 'يتأخر في الرد').length,
        highOrders: data.filter(c => c.quickNote === 'كثير الطلبات').length,
        needFollow: data.filter(c => c.quickNote === 'حاجة لمتابعة').length
    };

    document.getElementById('stat-total').innerText = stats.total;
    document.getElementById('stat-complete').innerText = stats.completeAddress;
    document.getElementById('stat-month').innerText = stats.thisMonth;
    document.getElementById('count-new').innerText = stats.new;
    document.getElementById('count-active').innerText = stats.active;
    document.getElementById('count-suspended').innerText = stats.suspended;
    document.getElementById('count-blocked').innerText = stats.blocked;
    document.getElementById('count-vip').innerText = stats.vip;
    document.getElementById('count-premium').innerText = stats.premium;
    document.getElementById('count-normal').innerText = stats.normal;
    document.getElementById('count-potential').innerText = stats.potential;
    document.getElementById('count-quickResp').innerText = stats.quickResp;
    document.getElementById('count-lateResp').innerText = stats.lateResp;
    document.getElementById('count-highOrders').innerText = stats.highOrders;
    document.getElementById('count-needFollow').innerText = stats.needFollow;
}

/**
 * 3. نظام الفلترة المتقدم والبحث الذكي بالمنطقة
 */
window.filterCustomers = () => {
    const statusVal = document.getElementById('filter-status').value;
    const categoryVal = document.getElementById('filter-category').value;
    const noteVal = document.getElementById('filter-note').value;
    const regionVal = document.getElementById('filter-region').value.toLowerCase();

    const filtered = customersDataList.filter(c => {
        return (statusVal === '' || c.accountStatus === statusVal) &&
               (categoryVal === '' || c.customerCategory === categoryVal) &&
               (noteVal === '' || c.quickNote === noteVal) &&
               (regionVal === '' || 
                   (c.city && c.city.toLowerCase().includes(regionVal)) || 
                   (c.district && c.district.toLowerCase().includes(regionVal)));
    });

    renderTable(filtered);
    updateDashboard(filtered); 
};

/**
 * 4. رسم الجدول بالتنسيق الصحيح المستقل للرقم والمفتاح
 */
function renderTable(data) {
    const tbody = document.getElementById('customers-tbody');
    tbody.innerHTML = '';

    data.forEach((c, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="sticky-col">
                <span style="color:#6A7B9C; font-weight:bold; margin-left:8px;">${index + 1} -</span>
                <strong>${c.name || '-'}</strong>
            </td>
            <td>
                <span dir="ltr" style="display:inline-block; font-weight:bold; color:#2D3748;">
                    ${c.phone || '-'}
                </span>
            </td>
            <td>
                <span dir="ltr" style="display:inline-block; font-weight:bold; color:#6A7B9C;">
                    ${c.countryCode || '-'}
                </span>
            </td>
            <td>${c.email || '-'}</td>
            <td>${c.country || '-'}</td>
            <td>${c.city || '-'}</td>
            <td>${c.district || '-'}</td>
            <td>${c.street || '-'}</td>
            <td>${c.buildingNo || '-'}</td>
            <td>${c.additionalNo || '-'}</td>
            <td>${c.postalCode || '-'}</td>
            <td>${c.poBox || '-'}</td>
            <td>${c.createdAt ? new Date(c.createdAt).toLocaleDateString('ar-SA') : '-'}</td>
            <td><span class="status-tag">${c.accountStatus || 'جديد'}</span></td>
            <td>${c.customerCategory || 'عادي'}</td>
            <td>${c.quickNote || '-'}</td>
            <td class="sticky-actions">
                <div class="actions-wrapper">
                    <button class="action-link view" title="عرض التفاصيل" onclick="viewCustomerDetails('${c.id}')">عرض</button>
                    <span class="action-divider"></span>
                    <button class="action-link edit" title="تعديل البيانات" onclick="openEditModal('${c.id}')">تعديل</button>
                    <span class="action-divider"></span>
                    <button class="action-link print" title="طباعة العميل" onclick="printCustomer('${c.id}')">طباعة</button>
                    <span class="action-divider"></span>
                    <button class="action-link delete" title="حذف العميل" onclick="deleteCustomer('${c.id}')">حذف</button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

document.addEventListener('DOMContentLoaded', loadCustomers);

/* ==============================================================
   5. دوال التحكم بالعملاء (تعديل، حفظ، عرض، حذف، طباعة)
============================================================== */

window.closeEditModal = () => document.getElementById('edit-customer-modal').classList.remove('active');

// دالة فتح التعديل وتعبئة كافة الحقول
window.openEditModal = (id) => {
    const c = customersDataList.find(i => i.id === id);
    initQuill();
    
    document.getElementById('edit-doc-id').value = id;
    document.getElementById('edit-name').value = c.name || '';
    document.getElementById('edit-phone').value = c.phone || '';
    document.getElementById('edit-countryCode').value = c.countryCode || '';
    document.getElementById('edit-email').value = c.email || '';
    document.getElementById('edit-country').value = c.country || '';
    document.getElementById('edit-city').value = c.city || '';
    document.getElementById('edit-district').value = c.district || '';
    document.getElementById('edit-street').value = c.street || '';
    document.getElementById('edit-buildingNo').value = c.buildingNo || '';
    document.getElementById('edit-additionalNo').value = c.additionalNo || '';
    document.getElementById('edit-postalCode').value = c.postalCode || '';
    document.getElementById('edit-poBox').value = c.poBox || '';
    document.getElementById('edit-accountStatus').value = c.accountStatus || 'جديد';
    document.getElementById('edit-customerCategory').value = c.customerCategory || 'عادي';
    document.getElementById('edit-quickNote').value = c.quickNote || 'سريع التجاوب';
    
    quill.root.innerHTML = c.detailedNotes || '';
    
    renderFilesLog(c.attachments || [], id);
    document.getElementById('edit-customer-modal').classList.add('active');
};

// دالة حفظ التعديلات
document.getElementById('edit-customer-form').onsubmit = async (e) => {
    e.preventDefault();
    const id = document.getElementById('edit-doc-id').value;
    const btn = e.target.querySelector('.save-btn');
    
    btn.innerText = "جاري الحفظ..."; 
    btn.disabled = true;

    try {
        await updateDoc(doc(db, "customers", id), {
            name: document.getElementById('edit-name').value,
            phone: document.getElementById('edit-phone').value,
            countryCode: document.getElementById('edit-countryCode').value,
            email: document.getElementById('edit-email').value,
            country: document.getElementById('edit-country').value,
            city: document.getElementById('edit-city').value,
            district: document.getElementById('edit-district').value,
            street: document.getElementById('edit-street').value,
            buildingNo: document.getElementById('edit-buildingNo').value,
            additionalNo: document.getElementById('edit-additionalNo').value,
            postalCode: document.getElementById('edit-postalCode').value,
            poBox: document.getElementById('edit-poBox').value,
            accountStatus: document.getElementById('edit-accountStatus').value,
            customerCategory: document.getElementById('edit-customerCategory').value,
            quickNote: document.getElementById('edit-quickNote').value,
            detailedNotes: quill.root.innerHTML,
            updatedAt: new Date().toISOString(),
            updatedBy: currentEmployee
        });
        alert("تم تحديث بيانات العميل بنجاح");
        window.closeEditModal();
        loadCustomers();
    } catch(err) {
        console.error(err);
        alert("حدث خطأ أثناء الحفظ، يرجى المحاولة مرة أخرى.");
    } finally {
        btn.innerText = "حفظ كافة التعديلات"; 
        btn.disabled = false;
    }
};

// دالة العرض الشامل
window.viewCustomerDetails = (id) => {
    const c = customersDataList.find(i => i.id === id);
    const body = document.getElementById('view-details-body');
    body.innerHTML = `
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px; margin-bottom:20px;">
            <p><strong>الاسم:</strong> ${c.name || '-'}</p>
            <p><strong>الجوال:</strong> <span dir="ltr">${c.countryCode || ''} ${c.phone || '-'}</span></p>
            <p><strong>البريد:</strong> ${c.email || '-'}</p>
            <p><strong>العنوان:</strong> ${c.city || '-'} - ${c.district || '-'}</p>
            <p><strong>الحالة:</strong> <span class="status-tag">${c.accountStatus || '-'}</span></p>
            <p><strong>التصنيف:</strong> ${c.customerCategory || '-'}</p>
        </div>
        <hr style="border:0; border-top:1px solid #eee; margin:15px 0;">
        <div style="background:#f8fafc; padding:15px; border-radius:8px; margin-top:10px;">
            <strong>الملاحظات التفصيلية:</strong><br><br>
            ${c.detailedNotes || 'لا توجد ملاحظات مسجلة.'}
        </div>
    `;
    document.getElementById('view-customer-modal').classList.add('active');
};

// الدالة المخصصة للطباعة السريعة
window.printCustomer = (id) => {
    const c = customersDataList.find(i => i.id === id);
    if (!c) return;
    
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    printWindow.document.write(`
        <html dir="rtl" lang="ar">
        <head>
            <title>طباعة بيانات العميل - ${c.name}</title>
            <style>
                body { font-family: 'Segoe UI', Tahoma, sans-serif; padding: 40px; color: #0A192F; }
                .header { border-bottom: 3px solid #D4AF37; padding-bottom: 15px; margin-bottom: 30px; text-align: center; }
                h1 { margin: 0; font-size: 24px; }
                .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
                .info-item { background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; }
                .info-item strong { display: block; margin-bottom: 5px; color: #6A7B9C; font-size: 0.9rem; }
                .notes-section { background: #fff; padding: 20px; border: 1px solid #cbd5e1; border-radius: 8px; }
                .footer { margin-top: 40px; text-align: center; font-size: 0.8rem; color: #94a3b8; border-top: 1px solid #eee; padding-top: 20px; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>بيانات العميل: ${c.name || 'غير محدد'}</h1>
                <p>مستخرج من نظام إدارة الإتقان بلس (Tera V12)</p>
            </div>
            
            <div class="info-grid">
                <div class="info-item"><strong>رقم الجوال:</strong> <span dir="ltr">${c.countryCode || ''} ${c.phone || '-'}</span></div>
                <div class="info-item"><strong>البريد الإلكتروني:</strong> ${c.email || '-'}</div>
                <div class="info-item"><strong>الدولة / المدينة:</strong> ${c.country || '-'} - ${c.city || '-'}</div>
                <div class="info-item"><strong>الحي / الشارع:</strong> ${c.district || '-'} - ${c.street || '-'}</div>
                <div class="info-item"><strong>التصنيف:</strong> ${c.customerCategory || '-'}</div>
                <div class="info-item"><strong>حالة الحساب:</strong> ${c.accountStatus || '-'}</div>
            </div>

            <div class="notes-section">
                <h3 style="margin-top:0; color:#D4AF37;">الملاحظات التفصيلية للموظف:</h3>
                <div>${c.detailedNotes || 'لا توجد ملاحظات مفصلة مسجلة لهذا العميل.'}</div>
            </div>

            <div class="footer">
                تمت الطباعة بواسطة: ${currentEmployee} | تاريخ الطباعة: ${new Date().toLocaleDateString('ar-SA')}
            </div>

            <script>
                window.onload = function() { 
                    setTimeout(() => { window.print(); window.close(); }, 500);
                }
            </script>
        </body>
        </html>
    `);
    printWindow.document.close();
};

// دالة الحذف
window.deleteCustomer = async (id) => {
    if(confirm("هل أنت متأكد من حذف هذا العميل نهائياً؟ هذا الإجراء لا يمكن التراجع عنه.")) {
        try {
            await deleteDoc(doc(db, "customers", id));
            alert("تم حذف العميل بنجاح من النظام");
            loadCustomers();
        } catch (e) { console.error(e); alert("خطأ في عملية الحذف"); }
    }
};

/* ==============================================================
   6. نظام رفع وإدارة المرفقات (سجل رقابي)
============================================================== */

document.getElementById('upload-btn').onclick = async () => {
    const id = document.getElementById('edit-doc-id').value;
    const fileInput = document.getElementById('new-file-input');
    const nameInput = document.getElementById('new-file-name');
    const uploadBtn = document.getElementById('upload-btn');

    if(!fileInput.files[0] || !nameInput.value) return alert("الرجاء إدخال اسم الملف واختياره أولاً.");

    uploadBtn.innerText = "جاري الرفع..."; 
    uploadBtn.disabled = true;
    
    try {
        const fileRef = ref(storage, `customers_docs/${id}/${Date.now()}_${fileInput.files[0].name}`);
        const snap = await uploadBytes(fileRef, fileInput.files[0]);
        const url = await getDownloadURL(snap.ref);

        const cDoc = await getDoc(doc(db, "customers", id));
        const oldAttachments = cDoc.data().attachments || [];
        const newEntry = { 
            fileId: Date.now().toString(), 
            fileName: nameInput.value, 
            fileUrl: url, 
            addedBy: currentEmployee, 
            addedAt: new Date().toISOString(), 
            status: 'active', 
            deletedAt: null 
        };

        const updated = [...oldAttachments, newEntry];
        await updateDoc(doc(db, "customers", id), { attachments: updated });
        renderFilesLog(updated, id);
        alert("تم رفع المرفق وتوثيقه في السجل بنجاح");
        
        nameInput.value = ''; fileInput.value = '';
    } catch(e) { 
        alert("فشل الرفع، تأكد من الاتصال بالإنترنت."); 
        console.error(e); 
    } finally { 
        uploadBtn.innerText = "رفع المرفق"; 
        uploadBtn.disabled = false; 
    }
};

function renderFilesLog(files, id) {
    const list = document.getElementById('files-log-list');
    list.innerHTML = files.map(f => `
        <tr style="${f.status === 'deleted' ? 'background:#fff1f0; color:#e74c3c;' : ''}">
            <td>${f.status === 'active' ? `<a href="${f.fileUrl}" target="_blank" style="color:#3498db;">${f.fileName}</a>` : `<s style="color:#e74c3c;">${f.fileName}</s>`}</td>
            <td>${f.addedBy}</td>
            <td>${new Date(f.addedAt).toLocaleDateString('ar-SA')}</td>
            <td>${f.deletedAt ? new Date(f.deletedAt).toLocaleDateString('ar-SA') : '-'}</td>
            <td>
                ${f.status === 'active' ? `<button type="button" class="action-btn" style="color:#e74c3c; font-size:1.1rem; background:none; border:none; cursor:pointer;" onclick="deleteAttachment('${id}', '${f.fileId}')" title="حذف">🗑️</button>` : 'محذوف'}
            </td>
        </tr>
    `).join('') || '<tr><td colspan="5" style="text-align:center; padding:15px;">لا يوجد مرفقات مسجلة لهذا العميل</td></tr>';
}

window.deleteAttachment = async (customerId, fId) => {
    if(!confirm("هل تريد حذف المرفق من السجل؟ (سيتم تعليمه كمحذوف للرقابة الإدارية ولن يُحذف نهائياً)")) return;
    try {
        const cDoc = await getDoc(doc(db, "customers", customerId));
        const list = cDoc.data().attachments || [];
        const updated = list.map(f => f.fileId === fId ? { ...f, status: 'deleted', deletedAt: new Date().toISOString() } : f);
        await updateDoc(doc(db, "customers", customerId), { attachments: updated });
        renderFilesLog(updated, customerId);
    } catch(e) { console.error(e); }
};
